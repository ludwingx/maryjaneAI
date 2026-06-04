"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Web Speech API type declarations for TypeScript compatibility
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface Window {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimText: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const { lang = "es-ES", continuous = true, interimResults = true } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldRestartRef = useRef(false);

  // Check browser support
  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setIsSupported(supported);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        shouldRestartRef.current = false;
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Speech recognition is not supported in this browser");
      return;
    }

    setError(null);

    // Create a new recognition instance
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI() as SpeechRecognition;

    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => {
          const separator = prev ? " " : "";
          return prev + separator + finalTranscript.trim();
        });
      }

      setInterimText(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Don't treat "no-speech" as a fatal error — just keep listening
      if (event.error === "no-speech") {
        return;
      }

      // "aborted" happens when we manually stop — not an error
      if (event.error === "aborted") {
        return;
      }

      setError(getErrorMessage(event.error));
      setIsListening(false);
      shouldRestartRef.current = false;
    };

    recognition.onend = () => {
      setInterimText("");

      // Auto-restart if we should keep listening
      if (shouldRestartRef.current) {
        try {
          recognition.start();
        } catch {
          // If start fails, stop gracefully
          setIsListening(false);
          shouldRestartRef.current = false;
        }
        return;
      }

      setIsListening(false);
    };

    recognitionRef.current = recognition;
    shouldRestartRef.current = true;

    try {
      recognition.start();
    } catch {
      setError("Failed to start speech recognition");
      shouldRestartRef.current = false;
    }
  }, [isSupported, lang, continuous, interimResults]);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setIsListening(false);
    setInterimText("");
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimText("");
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimText,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}

function getErrorMessage(error: string): string {
  switch (error) {
    case "not-allowed":
      return "Permiso de micrófono denegado. Habilita el acceso al micrófono en la configuración del navegador.";
    case "audio-capture":
      return "No se detectó un micrófono. Conecta un micrófono e intenta de nuevo.";
    case "network":
      return "Error de red. Verifica tu conexión a internet.";
    case "service-not-allowed":
      return "El servicio de reconocimiento de voz no está disponible.";
    default:
      return `Error de reconocimiento de voz: ${error}`;
  }
}

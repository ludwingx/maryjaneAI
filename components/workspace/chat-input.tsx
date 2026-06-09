"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { useSpeechRecognition } from "@/app/hooks/use-speech-recognition";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mic, MicOff, Send } from "lucide-react";
import type { FeedItem } from "@/lib/types";
import { ChatFeed } from "@/components/workspace/chat-feed";

export function ChatArea() {
  const { activeProject, updateFeed, triggerAnalysis } = useApp();
  const feed = activeProject?.feed || [];

  const lastItem = feed[feed.length - 1];
  const isWaitingForAnswer = lastItem && lastItem.type === "consultor-question";

  const [manualInput, setManualInput] = useState("");

  const {
    isListening,
    isSupported,
    transcript,
    interimText,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: "es-ES",
    continuous: true,
    interimResults: true,
  });

  // Speech error handler
  React.useEffect(() => {
    if (speechError) toast.error(speechError);
  }, [speechError]);

  // Send manual message
  const handleSendManual = () => {
    if (!manualInput.trim()) return;
    const newItem: FeedItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: isWaitingForAnswer ? "cliente-answer" : "manual",
      text: manualInput.trim(),
      timestamp: new Date(),
    };
    const updatedFeed = [...feed, newItem];
    updateFeed(updatedFeed);
    setManualInput("");
    setTimeout(() => triggerAnalysis(updatedFeed).catch((e: Error) => toast.error(e.message)), 100);
  };

  // Commit speech transcript to feed
  const commitSpeechToFeed = () => {
    if (transcript.trim()) {
      const newItem: FeedItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: "audio",
        text: transcript.trim(),
        timestamp: new Date(),
      };
      const updatedFeed = [...feed, newItem];
      updateFeed(updatedFeed);
      resetTranscript();
      setTimeout(() => triggerAnalysis(updatedFeed).catch((e: Error) => toast.error(e.message)), 100);
    }
  };

  // Toggle microphone
  const toggleMic = () => {
    if (isListening) {
      stopListening();
      setTimeout(() => commitSpeechToFeed(), 200);
    } else {
      startListening();
    }
  };

  return (
    <section className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Feed */}
      <ChatFeed
        transcript={transcript}
        interimText={interimText}
        onCommitSpeech={commitSpeechToFeed}
        onResetTranscript={resetTranscript}
      />

      {/* Input Controls */}
      <footer className="p-4 border-t border-border bg-card/30 backdrop-blur-sm flex flex-col gap-3">
        <div className="flex gap-2">
          <Textarea
            id="chat-input"
            placeholder={
              isWaitingForAnswer
                ? "Escribe la respuesta de tu cliente a la pregunta..."
                : "Escribe un requerimiento, regla de negocio o nota aquí..."
            }
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendManual();
              }
            }}
            className="resize-none min-h-[60px] max-h-[120px] bg-background border-border"
          />
          <Button
            id="send-button"
            onClick={handleSendManual}
            disabled={!manualInput.trim()}
            className="h-auto px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              id="mic-button"
              variant={isListening ? "destructive" : "default"}
              onClick={toggleMic}
              disabled={!isSupported}
              className={`gap-2 font-semibold shadow-lg shadow-primary/5 transition-all duration-300 ${
                isListening ? "mic-recording animate-pulse-glow" : ""
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4" />
                  Pausar Micrófono
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Iniciar Micrófono
                </>
              )}
            </Button>
            {!isSupported && (
              <span className="text-xs text-destructive font-medium">
                Web Speech API no soportada. Usa Chrome o Edge.
              </span>
            )}
          </div>

          {feed.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const welcomeOnly = feed.slice(0, 1);
                updateFeed(welcomeOnly);
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Limpiar Feed
            </Button>
          )}
        </div>
      </footer>
    </section>
  );
}

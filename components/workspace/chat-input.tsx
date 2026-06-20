"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/lib/store";
import { useSpeechRecognition } from "@/app/hooks/use-speech-recognition";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mic, MicOff, Send, HelpCircle, X, Brain } from "lucide-react";
import type { FeedItem } from "@/lib/types";
import { ChatFeed } from "@/components/workspace/chat-feed";

const FALLBACK_STARTERS = [
  {
    emoji: "🚀",
    label: "Facturación / Inventario",
    text: "Quiero un sistema para automatizar la facturación y el control de inventario de mis tiendas.",
  },
  {
    emoji: "📅",
    label: "Citas y Notificaciones",
    text: "Necesitamos que los clientes puedan reservar citas en línea y recibir recordatorios por WhatsApp.",
  },
  {
    emoji: "🏪",
    label: "E-commerce",
    text: "Queremos una tienda en línea que se integre con nuestro sistema de inventario actual y permita pagos con tarjeta y transferencia.",
  },
];

export function ChatArea() {
  const { activeProject, updateFeed, triggerAnalysis } = useApp();
  const feed = activeProject?.feed || [];

  const lastItem = feed[feed.length - 1];
  
  const [manualInput, setManualInput] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<{ text: string } | null>(null);
  const [starterQuestions, setStarterQuestions] = useState<{ emoji: string; label: string; text: string }[]>([]);
  const [loadingStarters, setLoadingStarters] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isWaitingForAnswer = !!selectedQuestion || (lastItem && lastItem.type === "consultor-question");

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

  // Fetch starter questions when feed is fresh
  useEffect(() => {
    if (feed.length <= 1 && activeProject?.name) {
      setLoadingStarters(true);
      fetch("/api/ai/starter-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName: activeProject.name }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Error en starter-questions API");
          return res.json();
        })
        .then((data) => {
          if (data.questions && data.questions.length > 0) {
            // Tomamos las primeras 3
            const formatted = data.questions.slice(0, 3).map((q: any) => ({
              emoji: q.emoji || "❓",
              label: q.label || "Inicio",
              text: q.text.replace(/^(Consultor|Cliente):\s*/i, ""),
            }));
            setStarterQuestions(formatted);
          } else {
            setStarterQuestions(FALLBACK_STARTERS);
          }
        })
        .catch((e) => {
          console.error(e);
          setStarterQuestions(FALLBACK_STARTERS);
        })
        .finally(() => {
          setLoadingStarters(false);
        });
    } else {
      setStarterQuestions([]);
    }
  }, [activeProject?.name, feed.length]);

  // Speech error handler
  useEffect(() => {
    if (speechError) toast.error(speechError);
  }, [speechError]);

  // Send manual message
  const handleSendManual = () => {
    if (!manualInput.trim()) return;

    let updatedFeed = [...feed];

    if (selectedQuestion) {
      // 1. Insertamos la pregunta seleccionada
      const questionItem: FeedItem = {
        id: `q-${Math.random().toString(36).substr(2, 9)}`,
        type: "consultor-question",
        text: selectedQuestion.text,
        timestamp: new Date(),
      };
      // 2. Insertamos la respuesta del cliente
      const answerItem: FeedItem = {
        id: `a-${Math.random().toString(36).substr(2, 9)}`,
        type: "cliente-answer",
        text: manualInput.trim(),
        timestamp: new Date(),
      };
      updatedFeed = [...updatedFeed, questionItem, answerItem];
      setSelectedQuestion(null);
    } else {
      const newItem: FeedItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: isWaitingForAnswer ? "cliente-answer" : "manual",
        text: manualInput.trim(),
        timestamp: new Date(),
      };
      updatedFeed = [...updatedFeed, newItem];
    }

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

  // Determinar qué opciones mostrar
  const hasOnlyWelcome = feed.length <= 1;
  const suggestedAI = activeProject?.analysis?.suggested_questions || [];

  const optionsToDisplay = hasOnlyWelcome
    ? starterQuestions
    : suggestedAI.slice(0, 3).map((q) => ({
        emoji: "💡",
        label: q.category,
        text: q.question,
      }));

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
        {/* Preguntas Sugeridas / Selección de Preguntas */}
        <div className="flex flex-col gap-2">
          {selectedQuestion ? (
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-primary/30 bg-primary/5 text-xs animate-fade-in">
              <div className="flex items-center gap-2 truncate">
                <HelpCircle className="h-4 w-4 text-primary shrink-0 animate-pulse" />
                <span className="font-semibold text-primary shrink-0">Pregunta seleccionada:</span>
                <span className="text-muted-foreground truncate italic">"{selectedQuestion.text}"</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedQuestion(null)}
                className="h-6 w-6 rounded-full hover:bg-destructive/15 text-muted-foreground hover:text-destructive shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            !loadingStarters && optionsToDisplay.length > 0 && (
              <div className="flex flex-col gap-1.5 animate-fade-in">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  <Brain className="h-3 w-3 text-primary" />
                  <span>Selecciona una pregunta de relevamiento para responder:</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {optionsToDisplay.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedQuestion({ text: opt.text });
                        setTimeout(() => textareaRef.current?.focus(), 50);
                      }}
                      className="text-left p-2 rounded-lg border border-border bg-background hover:bg-accent/40 hover:border-primary/30 transition-all text-xs flex flex-col gap-1 duration-200 group active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-1 text-[10px] text-primary font-semibold font-mono">
                        <span>{opt.emoji || "❓"}</span>
                        <span className="truncate capitalize">{opt.label || "Inicio"}</span>
                      </div>
                      <p className="text-[11px] leading-snug text-muted-foreground group-hover:text-foreground line-clamp-2 font-medium">
                        {opt.text}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            id="chat-input"
            placeholder={
              selectedQuestion
                ? `Escribe la respuesta del cliente a: "${selectedQuestion.text.substring(0, 40)}..."`
                : isWaitingForAnswer
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
            className="resize-none min-h-[60px] max-h-[120px] bg-background border-border text-sm"
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


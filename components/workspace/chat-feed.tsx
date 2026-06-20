"use client";

import React, { useEffect, useRef } from "react";
import { useApp } from "@/lib/store";

import { Button } from "@/components/ui/button";
import {
  Mic,
  MessageSquare,
  Volume2,
  Brain,
  HelpCircle,
  CheckCircle,
} from "lucide-react";
import type { FeedItem } from "@/lib/types";

interface ChatFeedProps {
  transcript: string;
  interimText: string;
  onCommitSpeech: () => void;
  onResetTranscript: () => void;
}

export function ChatFeed({
  transcript,
  interimText,
  onCommitSpeech,
  onResetTranscript,
}: ChatFeedProps) {
  const { activeProject, state, updateFeed, triggerAnalysis } = useApp();
  const { isAnalyzing } = state;
  const feed = activeProject?.feed || [];
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when feed changes, analyzing starts, or new content arrives
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      requestAnimationFrame(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [feed, feed.length, interimText, transcript, isAnalyzing]);

  return (
    <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 space-y-4 h-full max-h-full">
      <div className="flex flex-col gap-4 pb-8">
        {/* Feed messages */}
        {feed.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col gap-1.5 p-4 rounded-xl max-w-[85%] border transition-all duration-300 animate-slide-up ${
              item.type === "consultor-question"
                ? "bg-primary/10 border-primary/30 ml-auto"
                : item.type === "cliente-answer"
                ? "bg-success-muted/10 border-success/30 mr-auto"
                : item.type === "ai"
                ? "bg-primary/5 border-primary/20 mr-auto"
                : item.type === "audio"
                ? "bg-cyan-muted border-cyan/20 mr-auto"
                : "bg-card border-border ml-auto"
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              {item.type === "consultor-question" ? (
                <>
                  <HelpCircle className="h-3.5 w-3.5 text-primary" />
                  <span className="text-primary font-bold">Pregunta Formulada</span>
                </>
              ) : item.type === "cliente-answer" ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5 text-success" />
                  <span className="text-success font-bold">Respuesta del Cliente</span>
                </>
              ) : item.type === "ai" ? (
                <>
                  <Brain className="h-3 w-3 text-primary" />
                  <span>Mary Jane</span>
                </>
              ) : item.type === "audio" ? (
                <>
                  <Mic className="h-3 w-3 text-cyan" />
                  <span className="text-cyan font-bold">Respuesta del Cliente (Voz)</span>
                </>
              ) : (
                <>
                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
                  <span>Nota del Consultor</span>
                </>
              )}
              <span>•</span>
              <span>
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {item.text}
            </p>
          </div>
        ))}

        {/* Live transcript indicator */}
        {(transcript || interimText) && (
          <div className="flex flex-col gap-1.5 p-4 rounded-xl max-w-[85%] border bg-primary/10 border-primary/30 mr-auto animate-pulse">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Volume2 className="h-3 w-3 animate-bounce" />
              <span>Escuchando en vivo...</span>
            </div>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {transcript}
              <span className="text-muted-foreground italic">
                {" "}
                {interimText}
              </span>
            </p>
            <div className="flex justify-end gap-2 mt-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={onResetTranscript}
                className="text-xs h-7 px-2"
              >
                Descartar
              </Button>
              <Button
                size="sm"
                onClick={onCommitSpeech}
                className="text-xs h-7 px-2 bg-primary text-primary-foreground"
              >
                Confirmar
              </Button>
            </div>
          </div>
        )}

        {/* AI analyzing indicator */}
        {isAnalyzing && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl max-w-[80%] border bg-card border-border/80 mr-auto animate-pulse text-xs text-muted-foreground">
            <Brain className="h-4 w-4 animate-spin text-primary" />
            <span>Mary Jane está analizando el contexto de la reunión...</span>
          </div>
        )}
      </div>
    </div>
  );
}

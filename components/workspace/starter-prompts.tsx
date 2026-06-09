"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from "lucide-react";

interface StarterPromptsProps {
  onSelect: (text: string) => void;
}

interface StarterQuestion {
  emoji: string;
  label: string;
  text: string;
}

const FALLBACK_STARTERS: StarterQuestion[] = [
  {
    emoji: "🚀",
    label: "Facturación / Inventario",
    text: "Cliente: Quiero un sistema para automatizar la facturación y el control de inventario de mis tiendas.",
  },
  {
    emoji: "📅",
    label: "Citas y Notificaciones",
    text: "Cliente: Necesitamos que los clientes puedan reservar citas en línea y recibir recordatorios por WhatsApp.",
  },
  {
    emoji: "🗣️",
    label: "Pregunta de inicio",
    text: "Consultor: Cuéntame un poco cómo manejan el proceso actualmente de forma manual, y quiénes son los encargados de realizar cada paso.",
  },
  {
    emoji: "🏪",
    label: "E-commerce",
    text: "Cliente: Queremos una tienda en línea que se integre con nuestro sistema de inventario actual y permita pagos con tarjeta y transferencia.",
  },
];

export function StarterPrompts({ onSelect }: StarterPromptsProps) {
  const { activeProject } = useApp();
  const [questions, setQuestions] = useState<StarterQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeProject?.name) return;

    setLoading(true);
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
          // Si el texto de la pregunta no viene prefijado con rol, le agregamos "Consultor: " para el formateo
          const formatted = data.questions.map((q: StarterQuestion) => {
            const hasRole = q.text.startsWith("Consultor:") || q.text.startsWith("Cliente:");
            return {
              ...q,
              text: hasRole ? q.text : `Consultor: ${q.text}`
            };
          });
          setQuestions(formatted);
        } else {
          setQuestions(FALLBACK_STARTERS);
        }
      })
      .catch((e) => {
        console.error(e);
        setQuestions(FALLBACK_STARTERS);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeProject?.name]);

  return (
    <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-xl my-4 bg-muted/20 animate-fade-in">
      <Brain className="h-10 w-10 text-muted-foreground/50 mb-2" />
      <h3 className="font-semibold text-sm">
        {loading ? "Mary Jane está analizando tu proyecto..." : "¿Cómo deseas iniciar con el cliente?"}
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4 leading-relaxed">
        {loading
          ? "Generando preguntas iniciales de relevamiento personalizadas basadas en el nombre del proyecto..."
          : "Elige una de las siguientes preguntas sugeridas de inicio para formularla a tu cliente:"}
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-primary font-semibold animate-pulse my-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generando preguntas de inicio...</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 justify-center max-w-lg">
          {questions.map((starter, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="text-xs hover:border-primary/30 transition-all transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => onSelect(starter.text)}
            >
              {starter.emoji} {starter.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

interface StarterPromptsProps {
  onSelect: (text: string) => void;
}

const STARTERS = [
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
    label: "Pregunta de inicio de flujo",
    text: "Consultor: Cuéntame un poco cómo manejan el proceso actualmente de forma manual, y quiénes son los encargados de realizar cada paso.",
  },
  {
    emoji: "🏪",
    label: "E-commerce",
    text: "Cliente: Queremos una tienda en línea que se integre con nuestro sistema de inventario actual y permita pagos con tarjeta y transferencia.",
  },
];

export function StarterPrompts({ onSelect }: StarterPromptsProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-xl my-4 bg-muted/20 animate-fade-in">
      <Brain className="h-10 w-10 text-muted-foreground/50 mb-2" />
      <h3 className="font-semibold text-sm">
        ¿Cómo deseas iniciar con el cliente?
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
        Elige uno de los siguientes disparadores de conversación para cargar en
        el chat:
      </p>
      <div className="flex flex-wrap gap-2 justify-center max-w-lg">
        {STARTERS.map((starter, i) => (
          <Button
            key={i}
            variant="outline"
            size="sm"
            className="text-xs hover:border-primary/30 transition-all"
            onClick={() => onSelect(starter.text)}
          >
            {starter.emoji} {starter.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TipsModal({ isOpen, onClose }: TipsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Brain className="text-primary h-5 w-5" /> Guía Práctica para No Técnicos: ¿Cómo relevar requerimientos?
        </h3>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p className="border-b border-border/40 pb-2">
            💡 <strong>¡No te preocupes por el lenguaje técnico!</strong> Tu misión es entender el negocio del cliente, no programar. Sigue estas pautas sencillas:
          </p>
          <p>
            🎯 <strong>1. El Problema (Negocio):</strong> Pregúntale a tu cliente:{" "}
            <em className="text-foreground block mt-1 pl-2 border-l-2 border-primary/40 bg-muted/20 py-1">
              "¿Qué es lo que hoy te hace perder tiempo o dinero y que este software debería solucionar?"
            </em>
          </p>
          <p>
            👥 <strong>2. Los Usuarios (Actores):</strong> Descubre quiénes usarán el sistema:{" "}
            <em className="text-foreground block mt-1 pl-2 border-l-2 border-primary/40 bg-muted/20 py-1">
              "¿Quiénes van a entrar a la aplicación? ¿Los empleados, los clientes, los administradores?"
            </em>
          </p>
          <p>
            🔄 <strong>3. Paso a Paso (Flujos):</strong> Pídele que te describa el proceso como una historia:{" "}
            <em className="text-foreground block mt-1 pl-2 border-l-2 border-primary/40 bg-muted/20 py-1">
              "Cuéntame el camino desde que entra un pedido hasta que se entrega. ¿Qué pasa si algo sale mal o no hay stock?"
            </em>
          </p>
          <p>
            📋 <strong>4. Reglas y Límites:</strong> Todo negocio tiene normas. Pregunta:{" "}
            <em className="text-foreground block mt-1 pl-2 border-l-2 border-primary/40 bg-muted/20 py-1">
              "¿Hay algún límite? ¿Ejemplo: un cliente puede comprar máximo 3 productos, o requiere aprobación del gerente?"
            </em>
          </p>
          <p>
            📊 <strong>5. Los Reportes:</strong> Al final, ¿qué quiere ver el dueño?:{" "}
            <em className="text-foreground block mt-1 pl-2 border-l-2 border-primary/40 bg-muted/20 py-1">
              "¿Qué datos o reportes necesitas ver en tu pantalla todos los días para saber que tu negocio va bien?"
            </em>
          </p>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} className="font-bold">¡Entendido, a relevar!</Button>
        </div>
      </div>
    </div>
  );
}

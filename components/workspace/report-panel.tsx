"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  FileText,
  DollarSign,
  Calendar,
  Clock,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Send,
  MessageCircle,
} from "lucide-react";

interface DeliverableContent {
  reportMarkdown: string;
  modules: {
    name: string;
    description: string;
    hours: number;
    complexity: "Baja" | "Media" | "Alta";
    cost: number;
  }[];
  totalCost: number;
  durationWeeks: number;
}

export function ReportPanel() {
  const { activeProject } = useApp();
  const [deliverable, setDeliverable] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refineInput, setRefineInput] = useState("");
  const [refineLoading, setRefineLoading] = useState(false);

  // Load deliverable on active project change
  useEffect(() => {
    if (!activeProject?.id) return;
    setDeliverable(null);
    fetch(`/api/projects/${activeProject.id}/deliverables`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Error cargando entregables");
      })
      .then((data) => {
        const found = data.find((d: any) => d.type === "FULL_DOCUMENT");
        if (found) {
          setDeliverable(found);
        }
      })
      .catch((e) => console.error(e));
  }, [activeProject?.id]);

  const handleGenerate = async (refinementText?: string) => {
    if (!activeProject) return;

    if (refinementText) {
      setRefineLoading(true);
    } else {
      setLoading(true);
    }

    try {
      // Consolidate current feed text as context for the AI
      const feedText = activeProject.feed
        .map((item) => `${item.type === "ai" ? "IA" : "Consultor/Cliente"}: ${item.text}`)
        .join("\n");

      let promptContext = feedText;
      if (refinementText) {
        promptContext += `\n\n[INSTRUCCIÓN DE AJUSTE/REFINAMIENTO DEL CONSULTOR]:\n${refinementText}\n\nPor favor ajusta el informe anterior según esta instrucción.`;
      }

      // 1. Generate via AI
      const aiRes = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: promptContext }),
      });

      if (!aiRes.ok) {
        throw new Error("Fallo al generar el reporte con la IA");
      }

      const generatedContent = await aiRes.json();

      // 2. Save in database
      const dbRes = await fetch(`/api/projects/${activeProject.id}/deliverables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "FULL_DOCUMENT",
          title: `Informe Final - ${activeProject.name}`,
          content: generatedContent,
        }),
      });

      if (!dbRes.ok) {
        throw new Error("Fallo al guardar el entregable en la base de datos");
      }

      const savedDeliverable = await dbRes.json();
      setDeliverable(savedDeliverable);
      toast.success(refinementText ? "Informe y cotización refinados" : "¡Informe y cotización generados con éxito!");
      if (refinementText) setRefineInput("");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Error al procesar el reporte");
    } finally {
      setLoading(false);
      setRefineLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!deliverable) return;
    const content = deliverable.content as DeliverableContent;
    navigator.clipboard.writeText(content.reportMarkdown);
    setCopied(true);
    toast.success("Informe copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple Markdown inline parser to display report cleanly
  const renderMarkdown = (md: string) => {
    return md.split("\n").map((line, i) => {
      if (line.startsWith("# ")) {
        return <h1 key={i} className="text-xl font-bold text-gradient mt-4 mb-2">{line.replace("# ", "")}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={i} className="text-lg font-semibold text-primary mt-3 mb-1.5">{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={i} className="text-sm font-semibold text-cyan mt-2 mb-1">{line.replace("### ", "")}</h3>;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return <li key={i} className="text-xs text-muted-foreground ml-4 list-disc leading-relaxed my-0.5">{line.substring(2)}</li>;
      }
      if (line.trim() === "") {
        return <div key={i} className="h-2" />;
      }
      return <p key={i} className="text-xs text-muted-foreground leading-relaxed my-1">{line}</p>;
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-card/10">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-bold text-gradient animate-pulse">Redactando Entregable Final...</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Mary Jane está consolidando todos los requerimientos y estimando las horas de desarrollo según tus notas. Esto puede tardar unos segundos.
        </p>
      </div>
    );
  }

  if (!deliverable) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-card/10 animate-fade-in">
        <div className="p-4 bg-primary/10 rounded-full mb-4">
          <FileText className="h-12 w-12 text-primary animate-pulse" />
        </div>
        <h3 className="text-lg font-bold">Generación de Informe y Cotización</h3>
        <p className="text-xs text-muted-foreground mt-2 max-w-md mb-6 leading-relaxed">
          Una vez termines la sesión de relevamiento con tu cliente, puedes generar automáticamente un informe de requerimientos estructurado y una cotización comercial detallada basada en las notas del chat.
        </p>
        <Button
          onClick={() => handleGenerate()}
          size="lg"
          className="gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          <Sparkles className="h-5 w-5" /> Generar Informe y Cotización
        </Button>
      </div>
    );
  }

  const content = deliverable.content as DeliverableContent;

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden animate-fade-in">
      {/* Main Report Panel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0 border-r border-border bg-card/5">
        <header className="flex justify-between items-center pb-2 border-b border-border">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Informe de Requerimientos</h2>
            <p className="text-[10px] text-muted-foreground">Documento técnico oficial y comercial generado por Mary Jane</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={copyToClipboard}
            className="text-xs gap-1.5"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar Markdown"}
          </Button>
        </header>

        {/* Highlight Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-success-muted/10 border-success/20">
            <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
              <span className="text-[10px] font-semibold text-success uppercase tracking-wider">Costo Estimado</span>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <span className="text-lg font-extrabold text-success font-mono">${content.totalCost.toLocaleString()} USD</span>
            </CardContent>
          </Card>

          <Card className="bg-cyan-muted/10 border-cyan/20">
            <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
              <span className="text-[10px] font-semibold text-cyan uppercase tracking-wider">Duración</span>
              <Calendar className="h-4 w-4 text-cyan" />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <span className="text-lg font-extrabold text-cyan font-mono">{content.durationWeeks} Semanas</span>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Esfuerzo Total</span>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <span className="text-lg font-extrabold font-mono">
                {content.modules.reduce((sum, m) => sum + m.hours, 0)} Horas
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Modules Breakdown */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Desglose de Cotización por Módulos</h3>
          <div className="border border-border rounded-lg overflow-hidden bg-background/40">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 uppercase font-semibold text-[10px] border-b border-border">
                  <tr>
                    <th className="p-3">Módulo</th>
                    <th className="p-3">Descripción</th>
                    <th className="p-3 text-center">Horas</th>
                    <th className="p-3 text-center">Complejidad</th>
                    <th className="p-3 text-right">Costo (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {content.modules.map((m, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-all">
                      <td className="p-3 font-semibold">{m.name}</td>
                      <td className="p-3 text-muted-foreground max-w-[200px] truncate" title={m.description}>{m.description}</td>
                      <td className="p-3 text-center font-mono">{m.hours} hrs</td>
                      <td className="p-3 text-center">
                        <Badge
                          variant={
                            m.complexity === "Alta"
                              ? "destructive"
                              : m.complexity === "Media"
                              ? "default"
                              : "secondary"
                          }
                          className="text-[9px] px-1.5 py-0 font-bold"
                        >
                          {m.complexity}
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-mono font-semibold">${m.cost.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Technical Specification Document */}
        <section className="p-4 bg-background/50 border border-border rounded-lg max-w-full">
          <div className="prose prose-sm prose-invert max-w-none">
            {renderMarkdown(content.reportMarkdown)}
          </div>
        </section>
      </div>

      {/* Refinement Panel / Sidebar Chat */}
      <div className="w-full md:w-[30%] flex flex-col h-full bg-card/20 min-h-0 shrink-0">
        <header className="p-4 border-b border-border flex items-center gap-2 bg-card/60 backdrop-blur-md">
          <MessageCircle className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-bold text-sm">Refinar Requerimientos</h3>
            <p className="text-[10px] text-muted-foreground">Pídele cambios sobre el informe o la cotización</p>
          </div>
        </header>

        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs text-muted-foreground">
          <p className="leading-relaxed">
            ¿Quieres añadir un módulo adicional, ajustar las horas estimadas, cambiar la complejidad de algún desarrollo, o agregar especificaciones técnicas no funcionales?
          </p>
          <div className="p-3 bg-muted/20 border border-border/50 rounded-lg text-[11px] leading-relaxed">
            <strong>Ejemplo de peticiones:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>"Añade un módulo de pasarela de pagos Stripe con 15 horas de desarrollo."</li>
              <li>"Modifica la cotización del inventario a complejidad Alta."</li>
              <li>"Agrega un apartado de requerimientos de seguridad bancaria."</li>
            </ul>
          </div>

          {refineLoading && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg border bg-card border-border/80 animate-pulse text-xs text-muted-foreground mt-4">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Mary Jane está recalculando la cotización y adaptando el documento...</span>
            </div>
          )}
        </div>

        <footer className="p-3 border-t border-border bg-card/30 flex gap-2">
          <Textarea
            placeholder="¿Qué cambios deseas realizar?"
            value={refineInput}
            onChange={(e) => setRefineInput(e.target.value)}
            disabled={refineLoading}
            className="resize-none min-h-[50px] max-h-[100px] text-xs bg-background border-border"
          />
          <Button
            size="sm"
            onClick={() => handleGenerate(refineInput)}
            disabled={!refineInput.trim() || refineLoading}
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </footer>
      </div>
    </div>
  );
}

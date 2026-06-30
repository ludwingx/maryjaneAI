"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  AlertTriangle,
  TrendingUp,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from "lucide-react";

interface ModuleItem {
  name: string;
  description: string;
  workType: string;
  hours: number;
  adjustedHours: number;
  ratePerHour: number;
  complexity: "Baja" | "Media" | "Alta";
  cost: number;
}

interface PricingBreakdown {
  effortSubtotal: number;
  multiplierApplied: number;
  multiplierDetails: { factor: string; value: string; impact: string }[];
  riskFactors: { risk: string; percentage: number }[];
  riskTotal: number;
  extrasTotal: number;
  extrasDetails: { concept: string; amount: number }[];
  profitMargin: number;
  profitAmount: number;
  discountAmount: number;
  taxAmount: number;
  whyThisPrice: string[];
}

interface CommercialTerms {
  paymentMethod: string;
  upfrontPercentage: number;
  includedRevisions: number;
  supportMonths: number;
  warrantyMonths: number;
  trainingHours: number;
  codeOwnership: boolean;
  ndaRequired: boolean;
}

interface DeliverableContent {
  reportMarkdown: string;
  modules: ModuleItem[];
  pricingBreakdown?: PricingBreakdown;
  commercialTerms?: CommercialTerms;
  totalCost: number;
  currency?: string;
  durationWeeks: number;
}

const WORK_TYPE_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  ai: "IA/ML",
  design: "Diseño",
  consulting: "Consultoría",
  devops: "DevOps",
  qa: "QA/Testing",
  general: "General",
};

const WORK_TYPE_COLORS: Record<string, string> = {
  frontend: "text-blue-400",
  backend: "text-emerald-400",
  ai: "text-purple-400",
  design: "text-pink-400",
  consulting: "text-amber-400",
  devops: "text-cyan-400",
  qa: "text-orange-400",
  general: "text-muted-foreground",
};

export function ReportPanel() {
  const { activeProject, state } = useApp();
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

      // 1. Generate via AI — now includes username and projectId for pricing context
      const aiRes = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: promptContext,
          username: state.username,
          projectId: activeProject.id,
        }),
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

  // Simple Markdown inline parser
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
        <h3 className="text-lg font-bold text-gradient animate-pulse">Calculando Cotización Inteligente...</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Mary Jane está analizando 6 factores de pricing: proyecto, cliente, proveedor, mercado, riesgo y condiciones comerciales. Esto puede tardar unos segundos.
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
          Una vez termines la sesión de relevamiento con tu cliente, puedes generar automáticamente un informe de requerimientos estructurado y una cotización comercial detallada basada en las notas del chat y tus parámetros de pricing configurados.
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
  const breakdown = content.pricingBreakdown;
  const terms = content.commercialTerms;
  const currency = content.currency || "USD";
  const totalHours = content.modules.reduce((sum, m) => sum + (m.adjustedHours || m.hours), 0);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden animate-fade-in">
      {/* Main Report Panel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0 border-r border-border bg-card/5">
        <header className="flex justify-between items-center pb-2 border-b border-border">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Informe de Requerimientos</h2>
            <p className="text-[10px] text-muted-foreground">Cotización con Pricing Intelligence Engine</p>
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
              <span className="text-[10px] font-semibold text-success uppercase tracking-wider">Precio Final</span>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <span className="text-lg font-extrabold text-success font-mono">${content.totalCost.toLocaleString()} {currency}</span>
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
              <span className="text-lg font-extrabold font-mono">{Math.round(totalHours)} Horas</span>
            </CardContent>
          </Card>
        </div>

        {/* Modules Breakdown */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Desglose por Módulos</h3>
          <div className="border border-border rounded-lg overflow-hidden bg-background/40">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 uppercase font-semibold text-[10px] border-b border-border">
                  <tr>
                    <th className="p-3">Módulo</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3 text-center">Horas Base</th>
                    <th className="p-3 text-center">Horas Ajust.</th>
                    <th className="p-3 text-center">Tarifa/hr</th>
                    <th className="p-3 text-center">Complejidad</th>
                    <th className="p-3 text-right">Costo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {content.modules.map((m, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-all">
                      <td className="p-3">
                        <div className="font-semibold">{m.name}</div>
                        <div className="text-[10px] text-muted-foreground max-w-[160px] truncate" title={m.description}>{m.description}</div>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold ${WORK_TYPE_COLORS[m.workType] || "text-muted-foreground"}`}>
                          {WORK_TYPE_LABELS[m.workType] || m.workType}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-muted-foreground">{m.hours}h</td>
                      <td className="p-3 text-center font-mono font-semibold">{m.adjustedHours || m.hours}h</td>
                      <td className="p-3 text-center font-mono">${m.ratePerHour || 35}</td>
                      <td className="p-3 text-center">
                        <Badge
                          variant={m.complexity === "Alta" ? "destructive" : m.complexity === "Media" ? "default" : "secondary"}
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

        {/* Pricing Breakdown */}
        {breakdown && (
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Desglose de Pricing
            </h3>
            <div className="border border-border rounded-lg bg-background/40 p-4 space-y-4">
              {/* Effort subtotal */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Subtotal de Esfuerzo</span>
                <span className="font-mono font-semibold">${breakdown.effortSubtotal.toLocaleString()} {currency}</span>
              </div>

              {/* Multipliers */}
              {breakdown.multiplierDetails && breakdown.multiplierDetails.length > 0 && (
                <div className="border-t border-border/50 pt-3 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Multiplicadores Aplicados (×{breakdown.multiplierApplied})</span>
                  {breakdown.multiplierDetails.map((md, i) => (
                    <div key={i} className="flex justify-between items-center text-xs pl-3">
                      <span className="text-muted-foreground">{md.factor}: {md.value}</span>
                      <span className={`font-mono font-semibold ${md.impact.startsWith("+") ? "text-amber-400" : md.impact.startsWith("-") ? "text-emerald-400" : "text-muted-foreground"}`}>
                        {md.impact.startsWith("+") && <ArrowUpRight className="h-3 w-3 inline mr-0.5" />}
                        {md.impact.startsWith("-") && <ArrowDownRight className="h-3 w-3 inline mr-0.5" />}
                        {md.impact}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Risk factors */}
              {breakdown.riskFactors && breakdown.riskFactors.length > 0 && (
                <div className="border-t border-border/50 pt-3 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Factores de Riesgo
                  </span>
                  {breakdown.riskFactors.map((rf, i) => (
                    <div key={i} className="flex justify-between items-center text-xs pl-3">
                      <span className="text-muted-foreground">{rf.risk}</span>
                      <span className="font-mono font-semibold text-amber-400">+{rf.percentage}%</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span>Total Riesgo</span>
                    <span className="font-mono text-amber-400">+${breakdown.riskTotal.toLocaleString()} {currency}</span>
                  </div>
                </div>
              )}

              {/* Extras */}
              {breakdown.extrasDetails && breakdown.extrasDetails.length > 0 && (
                <div className="border-t border-border/50 pt-3 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Costos Adicionales</span>
                  {breakdown.extrasDetails.map((ex, i) => (
                    <div key={i} className="flex justify-between items-center text-xs pl-3">
                      <span className="text-muted-foreground">{ex.concept}</span>
                      <span className="font-mono">${ex.amount.toLocaleString()} {currency}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Margin & Discounts */}
              <div className="border-t border-border/50 pt-3 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Margen de Ganancia ({breakdown.profitMargin}%)</span>
                  <span className="font-mono font-semibold text-emerald-400">+${breakdown.profitAmount.toLocaleString()} {currency}</span>
                </div>
                {breakdown.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Descuento Aplicado</span>
                    <span className="font-mono font-semibold text-blue-400">-${breakdown.discountAmount.toLocaleString()} {currency}</span>
                  </div>
                )}
                {breakdown.taxAmount > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Impuestos</span>
                    <span className="font-mono font-semibold">+${breakdown.taxAmount.toLocaleString()} {currency}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="border-t-2 border-primary/30 pt-3 flex justify-between items-center">
                <span className="text-sm font-bold">PRECIO FINAL</span>
                <span className="text-lg font-extrabold text-success font-mono">${content.totalCost.toLocaleString()} {currency}</span>
              </div>
            </div>
          </section>
        )}

        {/* Why This Price */}
        {breakdown?.whyThisPrice && breakdown.whyThisPrice.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" /> ¿Por Qué Este Precio?
            </h3>
            <div className="border border-border rounded-lg bg-primary/5 p-4 space-y-2">
              {breakdown.whyThisPrice.map((reason, i) => (
                <div key={i} className="flex gap-2 text-xs text-muted-foreground">
                  <span className="text-primary shrink-0">•</span>
                  <span className="leading-relaxed">{reason}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Commercial Terms */}
        {terms && (
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Condiciones Comerciales
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Forma de Pago", value: terms.paymentMethod },
                { label: "Anticipo", value: `${terms.upfrontPercentage}%` },
                { label: "Revisiones", value: `${terms.includedRevisions} incluidas` },
                { label: "Soporte", value: `${terms.supportMonths} mes(es)` },
                { label: "Garantía", value: `${terms.warrantyMonths} mes(es)` },
                { label: "Capacitación", value: `${terms.trainingHours} horas` },
                { label: "Código Fuente", value: terms.codeOwnership ? "Incluido" : "No incluido" },
                { label: "NDA", value: terms.ndaRequired ? "Requerido" : "No requerido" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs p-2 rounded-lg bg-muted/20 border border-border/30">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

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
            ¿Quieres añadir un módulo adicional, ajustar las horas estimadas, cambiar la complejidad de algún desarrollo, o agregar especificaciones técnicas?
          </p>
          <div className="p-3 bg-muted/20 border border-border/50 rounded-lg text-[11px] leading-relaxed">
            <strong>Ejemplo de peticiones:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>&quot;Añade un módulo de pasarela de pagos Stripe con 15 horas de desarrollo.&quot;</li>
              <li>&quot;Modifica la cotización del inventario a complejidad Alta.&quot;</li>
              <li>&quot;Cambia el margen de ganancia a 30%.&quot;</li>
              <li>&quot;Añade un factor de riesgo por integración con SAP.&quot;</li>
            </ul>
          </div>

          {refineLoading && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg border bg-card border-border/80 animate-pulse text-xs text-muted-foreground mt-4">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Mary Jane está recalculando la cotización...</span>
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

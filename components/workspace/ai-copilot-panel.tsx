"use client";

import React from "react";
import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Brain,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  FileText,
  Copy,
  CheckCircle,
  Send,
} from "lucide-react";

const categoryTranslations: Record<string, string> = {
  roles: "Roles / Actores",
  processes: "Procesos / Flujos",
  business_rules: "Reglas de Negocio",
  integrations: "Integraciones / APIs",
  reports: "Reportes / KPIs",
  security: "Seguridad / Roles",
  non_functional: "No Funcionales",
  data_entities: "Entidades de Datos",
};

const priorityTranslations: Record<string, string> = {
  high: "ALTA",
  medium: "MEDIA",
  low: "BAJA",
};

const statusTranslations: Record<string, string> = {
  missing: "Faltante",
  partial: "Parcial",
  complete: "Completo",
};

export function AICopilotPanel() {
  const { activeProject, updateFeed, triggerAnalysis } = useApp();
  const analysisResult = activeProject?.analysis;
  const feed = activeProject?.feed || [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  return (
    <section className="w-full md:w-[35%] flex flex-col h-full bg-card/25 overflow-hidden border-l border-border">
      {/* Panel Header */}
      <header className="p-4 border-b border-border flex items-center gap-2 bg-card/60 backdrop-blur-md">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="font-bold text-base">Copiloto de Requerimientos</h2>
      </header>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <div className="flex flex-col gap-6 pb-6">
          {!analysisResult ? (
            <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground min-h-[300px]">
              <Sparkles className="h-10 w-10 mb-2 opacity-50" />
              <h4 className="font-medium text-sm">
                Esperando Datos para Análisis
              </h4>
              <p className="text-xs max-w-[250px] mt-1">
                Tan pronto como comiences a hablar o escribir notas, la IA
                detectará vacíos y sugerirá preguntas de forma automática.
              </p>
            </div>
          ) : (
            <>
              {/* Coverage */}
              <Card className="bg-card/45 border-border">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span>Cobertura de Descubrimiento</span>
                    <Badge variant="secondary" className="font-mono">
                      {analysisResult.coverage.overall}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden mb-4">
                    <div
                      className={`h-full transition-all duration-500 ease-out coverage-bar ${
                        analysisResult.coverage.overall < 30
                           ? "coverage-low"
                           : analysisResult.coverage.overall < 60
                           ? "coverage-medium"
                           : analysisResult.coverage.overall < 85
                           ? "coverage-high"
                           : "coverage-complete"
                      }`}
                      style={{
                        width: `${analysisResult.coverage.overall}%`,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(
                      analysisResult.coverage.categories
                    ).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center p-1.5 rounded bg-background/50 border border-border/30"
                      >
                        <span className="capitalize text-muted-foreground truncate">
                          {categoryTranslations[key.toLowerCase()] || key.replace(/_/g, " ")}
                        </span>
                        <span className="font-mono font-semibold shrink-0 ml-1">
                          {val}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="questions" className="w-full">
                <TabsList className="grid grid-cols-3 w-full bg-secondary/50">
                  <TabsTrigger value="questions" className="text-xs">
                    Preguntas
                  </TabsTrigger>
                  <TabsTrigger value="gaps" className="text-xs">
                    Vacíos
                  </TabsTrigger>
                  <TabsTrigger value="reqs" className="text-xs">
                    Requerimientos
                  </TabsTrigger>
                </TabsList>

                {/* Suggested Questions */}
                <TabsContent value="questions" className="space-y-3 mt-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <HelpCircle className="h-3.5 w-3.5" /> Preguntas Clave
                    </h3>
                    <Badge variant="outline">
                      {analysisResult.suggested_questions.length}
                    </Badge>
                  </div>

                  {analysisResult.suggested_questions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-all flex flex-col gap-2 group"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <Badge
                          variant={
                            q.priority === "high"
                              ? "destructive"
                              : q.priority === "medium"
                              ? "default"
                              : "secondary"
                          }
                          className="text-[10px] uppercase font-bold py-0 px-1.5 animate-pulse"
                        >
                          {priorityTranslations[q.priority] || q.priority}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground capitalize font-medium">
                          {categoryTranslations[q.category.toLowerCase()] || q.category}
                        </span>
                      </div>
                      <p className="text-sm font-medium leading-normal">
                        {q.question}
                      </p>
                      <div className="flex justify-end gap-1 mt-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newItem = {
                              id: Math.random().toString(36).substr(2, 9),
                              type: "consultor-question" as const,
                              text: q.question,
                              timestamp: new Date(),
                            };
                            const updatedFeed = [...feed, newItem];
                            updateFeed(updatedFeed);
                            
                            // Enfocamos el input del chat para redactar la respuesta del cliente
                            const chatInput = document.getElementById("chat-input") as HTMLTextAreaElement;
                            if (chatInput) {
                              chatInput.focus();
                            }
                            
                            // Gatillar análisis silencioso
                            setTimeout(() => triggerAnalysis(updatedFeed).catch((e: Error) => toast.error(e.message)), 100);
                            toast.success("Pregunta formulada en el chat.");
                          }}
                          className="text-xs text-primary hover:text-primary-foreground hover:bg-primary opacity-0 group-hover:opacity-100 transition-opacity h-6 gap-1 px-2"
                        >
                          <Send className="h-3 w-3" />
                          Preguntar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(q.question)}
                          className="text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity h-6 gap-1 px-1.5"
                        >
                          <Copy className="h-3 w-3" />
                          Copiar
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                {/* Gaps */}
                <TabsContent value="gaps" className="space-y-3 mt-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> Vacíos en
                      Relevamiento
                    </h3>
                  </div>

                  {analysisResult.gaps.map((gap, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-background border border-border flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold capitalize">
                          {categoryTranslations[gap.category.toLowerCase()] || gap.category.replace(/_/g, " ")}
                        </span>
                        <Badge
                          variant={
                            gap.status === "missing"
                              ? "destructive"
                              : gap.status === "partial"
                              ? "outline"
                              : "secondary"
                          }
                          className="text-[10px] uppercase py-0"
                        >
                          {gap.status === "missing" && "❌ "}
                          {gap.status === "partial" && "⚠️ "}
                          {gap.status === "complete" && "✅ "}
                          {statusTranslations[gap.status] || gap.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-normal">
                        {gap.detail}
                      </p>
                    </div>
                  ))}
                </TabsContent>

                {/* Requirements */}
                <TabsContent value="reqs" className="space-y-3 mt-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" /> Requerimientos
                      Hallados
                    </h3>
                    <Badge variant="outline">
                      {analysisResult.requirements.length}
                    </Badge>
                  </div>

                  {analysisResult.requirements.map((req, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-background border border-border flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <Badge className="text-[10px] bg-secondary text-secondary-foreground font-mono">
                          {req.type}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">
                          {req.category}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed">
                        {req.description}
                      </p>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { ChatArea } from "@/components/workspace/chat-input";
import { AICopilotPanel } from "@/components/workspace/ai-copilot-panel";
import { TipsModal } from "@/components/workspace/tips-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Sparkles,
  HelpCircle,
  RotateCw,
  PanelLeft,
  PanelRight,
  Edit2,
  Check,
  X,
} from "lucide-react";

export default function WorkspacePage() {
  const {
    activeProject,
    state,
    triggerAnalysis,
    renameProject,
    toggleSidebar,
    toggleCopilot,
  } = useApp();
  const { isAnalyzing, sidebarOpen, copilotOpen } = state;
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground bg-background">
        <p className="text-sm">Selecciona o crea un proyecto para comenzar.</p>
      </div>
    );
  }

  const handleStartEdit = () => {
    setNewTitle(activeProject.name);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      toast.error("El nombre del proyecto no puede estar vacío.");
      return;
    }
    if (trimmed === activeProject.name) {
      setIsEditingTitle(false);
      return;
    }
    const success = await renameProject(activeProject.id, trimmed);
    if (success) {
      toast.success("Proyecto renombrado con éxito.");
      setIsEditingTitle(false);
    } else {
      toast.error("Error al renombrar el proyecto.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full max-h-full overflow-hidden bg-background">
      {/* Chat Section */}
      <section className="flex-1 flex flex-col border-r border-border h-full overflow-hidden relative">
        {/* Workspace Header */}
        <header className="p-4 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 hover:bg-muted"
              title={sidebarOpen ? "Ocultar menú lateral" : "Mostrar menú lateral"}
            >
              <PanelLeft className={`h-4 w-4 transition-transform duration-300 ${!sidebarOpen ? "text-primary" : "text-muted-foreground"}`} />
            </Button>

            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>

            {isEditingTitle ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-sm font-bold bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary w-48"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") setIsEditingTitle(false);
                  }}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSaveTitle}
                  className="h-7 w-7 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditingTitle(false)}
                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group">
                <div>
                  <h1 className="font-bold text-sm tracking-tight flex items-center gap-2">
                    {activeProject.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleStartEdit}
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                      title="Editar nombre"
                    >
                      <Edit2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Workspace de Relevamiento Inteligente
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs py-1">
              ES-ES
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHelpOpen(true)}
              className="gap-1.5 h-9"
            >
              <HelpCircle className="h-4 w-4" />
              Tips
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                triggerAnalysis()
                  .then(() => toast.success("Análisis actualizado"))
                  .catch((e: Error) => toast.error(e.message))
              }
              disabled={isAnalyzing}
              className="gap-2 h-9"
            >
              <RotateCw
                className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`}
              />
              Analizar
            </Button>

            {/* Copilot panel toggle button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCopilot}
              className="h-9 w-9 hover:bg-muted ml-1"
              title={copilotOpen ? "Ocultar panel de copiloto" : "Mostrar panel de copiloto"}
            >
              <PanelRight className={`h-4 w-4 transition-transform duration-300 ${!copilotOpen ? "text-primary" : "text-muted-foreground"}`} />
            </Button>
          </div>
        </header>

        {/* Chat area with feed + input */}
        <ChatArea />
      </section>

      {/* AI Copilot Panel */}
      {copilotOpen && <AICopilotPanel />}

      {/* Tips Modal */}
      <TipsModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

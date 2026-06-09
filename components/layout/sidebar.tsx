"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Plus,
  FolderOpen,
  MessageSquare,
  Trash2,
  LogOut,
  Sparkles,
} from "lucide-react";

export function Sidebar() {
  const {
    state,
    activeProject,
    createNewProject,
    setActiveProject,
    deleteProject,
    logout,
  } = useApp();
  const { projects, username } = state;
  const [newProjectName, setNewProjectName] = useState("");

  const handleCreateProject = () => {
    const name =
      newProjectName.trim() || `Proyecto ${projects.length + 1}`;
    createNewProject(name);
    setNewProjectName("");
    toast.success(`Creado: ${name}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (projects.length <= 1) {
      toast.error("No puedes eliminar el último proyecto.");
      return;
    }
    deleteProject(id);
    toast.info("Proyecto eliminado");
  };

  return (
    <aside className="hidden md:flex w-64 border-r border-border h-full bg-card/10 flex-col overflow-hidden shrink-0">
      {/* Brand */}
      <div className="p-4 border-b border-border flex items-center gap-2.5">
        <div className="p-1.5 bg-primary/10 rounded-lg">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-sm tracking-tight truncate">
            Mary Jane
          </h2>
          <p className="text-[10px] text-muted-foreground truncate">
            {username || "Workspace"}
          </p>
        </div>
      </div>

      {/* Project header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span className="font-semibold text-[10px] tracking-widest uppercase text-muted-foreground">
          Sesiones / Proyectos
        </span>
        <FolderOpen className="h-3.5 w-3.5 text-primary" />
      </div>

      {/* Add Project */}
      <div className="px-3 pb-3 border-b border-border flex flex-col gap-2">
        <input
          id="new-project-input"
          type="text"
          placeholder="Nuevo proyecto..."
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          className="w-full text-xs bg-background border border-border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreateProject();
          }}
        />
        <Button
          size="sm"
          onClick={handleCreateProject}
          className="w-full gap-1 text-xs justify-center py-1.5 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-primary/20"
        >
          <Plus className="h-3 w-3" /> Crear Proyecto
        </Button>
      </div>

      {/* Project List */}
      <ScrollArea className="flex-1 p-2">
        <div className="flex flex-col gap-1">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => setActiveProject(proj.id)}
              className={`w-full text-left p-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 group cursor-pointer animate-fade-in ${
                proj.id === activeProject?.id
                  ? "bg-primary/10 border border-primary/20 text-primary"
                  : "hover:bg-muted/50 border border-transparent text-muted-foreground"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate flex-1">{proj.name}</span>
              {projects.length > 1 && (
                <button
                  onClick={(e) => handleDelete(e, proj.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-destructive cursor-pointer"
                  title="Eliminar proyecto"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            logout();
            toast.info("Sesión cerrada");
          }}
          className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}

"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Plus,
  FolderOpen,
  MessageSquare,
  Trash2,
  LogOut,
  Sparkles,
  LayoutDashboard,
  Settings,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateProject = () => {
    const name = newProjectName.trim();
    if (!name) {
      toast.error("El nombre del proyecto es obligatorio.");
      return;
    }
    createNewProject(name);
    setNewProjectName("");
    setIsModalOpen(false);
    toast.success(`Creado: ${name}`);
  };

  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteTrigger = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (projects.length <= 1) {
      toast.error("No puedes eliminar el último proyecto.");
      return;
    }
    setProjectToDelete({ id, name });
  };

  const handleConfirmDelete = () => {
    if (!projectToDelete) return;
    deleteProject(projectToDelete.id);
    toast.info(`Proyecto "${projectToDelete.name}" eliminado`);
    setProjectToDelete(null);
  };

  const handleProjectClick = (projId: string) => {
    setActiveProject(projId);
    router.push(`/projects/${projId}`);
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

      {/* Módulos */}
      <div className="px-4 pt-4 pb-2">
        <span className="font-semibold text-[10px] tracking-widest uppercase text-muted-foreground">
          Módulos
        </span>
      </div>
      <div className="px-2 pb-3 border-b border-border flex flex-col gap-1">
        <Link
          href={activeProject ? `/projects/${activeProject.id}` : "/"}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            pathname === "/" || pathname.startsWith("/projects/")
              ? "bg-primary/10 text-primary"
              : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Workspace</span>
        </Link>
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            pathname === "/settings"
              ? "bg-primary/10 text-primary"
              : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Configuración de Tarifas</span>
        </Link>
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
        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="w-full gap-1 text-xs justify-center py-1.5 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-primary/20"
        >
          <Plus className="h-3.5 w-3.5" /> Crear Proyecto
        </Button>
      </div>

      {/* Project List */}
      <ScrollArea className="flex-1 p-2">
        <div className="flex flex-col gap-1">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => handleProjectClick(proj.id)}
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
                  onClick={(e) => handleDeleteTrigger(e, proj.id, proj.name)}
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

      {/* Modal para Crear Proyecto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold mb-2.5 flex items-center gap-2 text-foreground">
              <Plus className="h-4 w-4 text-primary" /> Crear Nuevo Proyecto
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Ingresa el nombre del software o sistema que vas a relevar para iniciar la sesión.
            </p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Nombre del Proyecto</label>
                <input
                  type="text"
                  placeholder="Ej. Portal de E-commerce, App de Delivery..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full text-xs bg-background border border-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground/60"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateProject();
                  }}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewProjectName("");
                  }}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateProject}
                  className="text-xs"
                >
                  Crear Proyecto
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Confirmar Eliminación */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold mb-2.5 flex items-center gap-2 text-destructive">
              <Trash2 className="h-4 w-4" /> ¿Eliminar proyecto?
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              ¿Estás seguro de que deseas eliminar el proyecto <strong>"{projectToDelete.name}"</strong>? Esta acción no se puede deshacer y se borrarán todos los datos e informes asociados.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setProjectToDelete(null)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmDelete}
                className="text-xs font-semibold"
              >
                Eliminar Proyecto
              </Button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

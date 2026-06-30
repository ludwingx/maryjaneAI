"use client";

import React, { useEffect } from "react";
import { useApp } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function RootDashboardPage() {
  const { state } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (state.isHydrated) {
      if (state.projects.length > 0) {
        const targetId = state.activeProjectId || state.projects[0].id;
        router.replace(`/projects/${targetId}`);
      }
    }
  }, [state.isHydrated, state.projects, state.activeProjectId, router]);

  if (!state.isHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-background p-6 text-center">
      <div className="p-3 bg-primary/10 rounded-2xl text-primary mb-4 animate-bounce">
        <Sparkles className="h-10 w-10" />
      </div>
      <h1 className="font-bold text-xl text-foreground tracking-tight mb-2">
        Bienvenido a Mary Jane
      </h1>
      <p className="text-xs max-w-sm leading-relaxed mb-6">
        No tienes ningún proyecto activo. Haz clic en el botón de la barra lateral para crear tu primer proyecto de relevamiento inteligente.
      </p>
    </div>
  );
}

"use client";

import { useApp } from "@/lib/store";
import { Sidebar } from "@/components/layout/sidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state } = useApp();
  const router = useRouter();

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (state.isHydrated && !state.isAuthenticated) {
      router.push("/login");
    }
  }, [state.isHydrated, state.isAuthenticated, router]);

  if (!state.isHydrated || !state.isAuthenticated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Ambient glow */}
      <div className="ambient-glow" />
      <div className="ambient-glow-secondary" />

      {/* Sidebar */}
      {state.sidebarOpen && <Sidebar />}

      {/* Main content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {children}
      </main>
    </div>
  );
}

"use client";

import { useApp } from "@/lib/store";
import { LoginForm } from "@/components/auth/login-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { state } = useApp();
  const router = useRouter();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (state.isAuthenticated) {
      router.push("/");
    }
  }, [state.isAuthenticated, router]);

  if (state.isAuthenticated) return null;

  return <LoginForm />;
}

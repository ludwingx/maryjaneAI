"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, User as UserIcon, Sparkles } from "lucide-react";

export function LoginForm() {
  const { login, register } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (cleanUser.length < 3 || cleanPass.length < 4) {
      toast.error(
        "Por favor, ingresa un usuario (mín. 3 caracteres) y contraseña (mín. 4 caracteres)."
      );
      return;
    }

    if (isRegister) {
      if (cleanPass !== confirmPassword.trim()) {
        toast.error("Las contraseñas no coinciden.");
        return;
      }
      const success = await register(cleanUser, cleanPass);
      if (success) {
        toast.success("¡Registro exitoso! Ya puedes iniciar sesión.");
        setIsRegister(false);
        setConfirmPassword("");
      } else {
        toast.error("El usuario ya existe o hubo un error al registrar.");
      }
    } else {
      const success = await login(cleanUser, cleanPass);
      if (success) {
        toast.success(`Sesión iniciada como: ${cleanUser}`);
      } else {
        toast.error("Credenciales incorrectas o el usuario no existe.");
      }
    }
  };

  return (
    <div className="w-full max-w-sm animate-slide-up">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/10 mb-4">
          <Sparkles className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">
          Mary Jane
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Asistente Inteligente de Requerimientos
        </p>
      </div>

      <Card className="border border-border bg-card shadow-2xl relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-cyan to-primary" />

        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto p-3 bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center text-primary mb-3">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">
            {isRegister ? "Crear una Cuenta" : "Acceso al Workspace"}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            {isRegister
              ? "Regístrate para comenzar a estructurar tus requerimientos."
              : "Ingresa tus credenciales para comenzar a trabajar."}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Usuario
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <UserIcon className="h-4 w-4" />
                </span>
                <input
                  id="login-username"
                  type="text"
                  required
                  placeholder="Tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-sm bg-background border border-border rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm bg-background border border-border rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
            </div>

            {isRegister && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="register-confirm-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-sm bg-background border border-border rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full justify-center gap-2 mt-3 py-5 font-bold tracking-wide shadow-lg shadow-primary/20"
            >
              {isRegister ? "Registrarse" : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isRegister ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}
            </span>{" "}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setUsername("");
                setPassword("");
                setConfirmPassword("");
              }}
              className="text-primary hover:underline font-semibold ml-1 cursor-pointer"
            >
              {isRegister ? "Inicia Sesión" : "Regístrate aquí"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Mary Jane — Asistente Inteligente de Requerimientos",
  description:
    "Asistente IA para descubrimiento de requerimientos de software. Transcripción en tiempo real, detección de vacíos y generación de preguntas inteligentes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={cn("h-full dark", inter.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col antialiased">
        <AppProvider>
          {children}
          <Toaster position="top-right" richColors closeButton visibleToasts={3} />
        </AppProvider>
      </body>
    </html>
  );
}

import { NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const SYSTEM_PROMPT = `Eres MaryJane AI — Senior Product Owner, Business Analyst y Software Architect.
Tu tarea es tomar la bitácora o conversación de relevamiento de requerimientos de software que ha mantenido el consultor con el cliente y producir:
1. Un INFORME TÉCNICO DE REQUERIMIENTOS en formato Markdown bien estructurado, que contenga:
   - Resumen ejecutivo del proyecto.
   - Requerimientos Funcionales principales.
   - Requerimientos No Funcionales.
   - Reglas de Negocio identificadas.
2. Una COTIZACIÓN ESTIMADA DETALLADA del proyecto, que contenga:
   - Una lista de módulos o componentes. Cada módulo debe tener:
     - Nombre del módulo.
     - Descripción.
     - Horas estimadas de desarrollo.
     - Complejidad (Baja, Media, Alta).
     - Costo sugerido (calculado usando una tarifa base de $40 USD por hora).
   - Costo Total del Proyecto en USD.
   - Tiempo de entrega estimado en semanas.

Genera el entregable en español con un tono profesional, claro y de alta calidad técnica.`;

export async function POST(request: NextRequest) {
  try {
    const { context } = await request.json();

    if (!context || context.trim().length === 0) {
      return Response.json(
        { error: "No context provided. Send chat history." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          error: "OPENROUTER_API_KEY not configured",
          message: "Configura la API key en tu archivo .env.",
        },
        { status: 503 }
      );
    }

    const modelName = process.env.DEFAULT_MODEL || "google/gemini-2.5-flash-lite:free";

    const openrouter = createOpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      headers: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "MaryJane AI",
      },
    });

    const { object } = await generateObject({
      model: openrouter(modelName),
      system: SYSTEM_PROMPT,
      prompt: `Genera el informe final de especificación y la cotización para el siguiente historial de relevamiento:
      
---
${context}
---`,
      schema: z.object({
        reportMarkdown: z.string().describe("El informe técnico completo en formato Markdown"),
        modules: z.array(
          z.object({
            name: z.string(),
            description: z.string(),
            hours: z.number(),
            complexity: z.enum(["Baja", "Media", "Alta"]),
            cost: z.number(),
          })
        ),
        totalCost: z.number().describe("Costo total estimado en USD"),
        durationWeeks: z.number().describe("Tiempo estimado en semanas"),
      }),
    });

    return Response.json(object);
  } catch (error: any) {
    console.error("AI Report generation error:", error);
    return Response.json(
      { error: "Error en el servidor al generar el informe" },
      { status: 500 }
    );
  }
}

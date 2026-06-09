import { NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const SYSTEM_PROMPT = `Eres MaryJane AI — experta en ingeniería de requerimientos de software.
Tu misión es proponer 4 preguntas iniciales cortas, amigables y coloquiales para arrancar una entrevista de relevamiento de requerimientos con el cliente final.
Las preguntas deben estar personalizadas según el nombre y contexto del proyecto propuesto. 
Utiliza un lenguaje extremadamente simple, natural, libre de jerga técnica o corporativa (prohibido usar "propuesta de valor", "modelo de negocio", etc.).
Genera el contenido en español. Cada opción debe incluir un emoji representativo y una etiqueta muy corta.`;

export async function POST(request: NextRequest) {
  try {
    const { projectName } = await request.json();

    if (!projectName) {
      return Response.json(
        { error: "No project name provided." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "OPENROUTER_API_KEY not configured" },
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
      prompt: `Genera 4 preguntas iniciales de relevamiento para el proyecto de software titulado: "${projectName}".`,
      schema: z.object({
        questions: z.array(
          z.object({
            emoji: z.string(),
            label: z.string(),
            text: z.string(),
          })
        ),
      }),
    });

    return Response.json(object);
  } catch (error: any) {
    console.error("Starter questions generation error:", error);
    return Response.json(
      { error: "Error en el servidor al generar las preguntas iniciales" },
      { status: 500 }
    );
  }
}

import { NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const SYSTEM_PROMPT = `Eres MaryJane AI — una Senior Product Owner, Business Analyst y Software Architect experta en ingeniería de requerimientos de software.

Tu tono debe ser directo, altamente profesional, técnico, objetivo y constructivo. Guías al consultor con total claridad y seriedad técnica, enfocándote en la precisión de los requerimientos, la definición de alcance, y la arquitectura de software. Evita cualquier tipo de coqueteo, modismos informales o tonos personales/afectivos.

Tu misión es asistir al consultor analizando los requerimientos que te envía, las respuestas del cliente o lo que te pregunte. Ofrece feedback estructurado y profesional. Mantén tus respuestas de chat relativamente cortas (1-3 párrafos), enfocadas y directas en español.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "No messages provided." },
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

    // Consolidate chat history into text
    const chatHistory = messages
      .map((m: any) => `${m.type === "ai" ? "Mary Jane" : "Consultor/Cliente"}: ${m.text}`)
      .join("\n");

    const result = streamText({
      model: openrouter(modelName),
      system: SYSTEM_PROMPT,
      prompt: `Responde de manera directa y profesional al último comentario o requerimiento del chat.
      
Historial de la conversación:
---
${chatHistory}
---`,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("AI Chat error:", error);
    return Response.json(
      { error: "Error en el servidor al procesar el chat" },
      { status: 500 }
    );
  }
}

import { NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";

// RequirementDiscoveryAgent system prompt
// Source: Obsidian docs — 04 - IA/SystemPrompts.md
const SYSTEM_PROMPT = `Eres MaryJane AI — una Senior Product Owner, Business Analyst y Software Architect experta en ingeniería de requerimientos de software.

Tu tono debe ser directo, altamente profesional, técnico, objetivo y constructivo. Guías al consultor con total claridad y seriedad técnica, enfocándote en la precisión de los requerimientos, la definición de alcance, y la arquitectura de software. Evita cualquier coqueteo o tono informal.

Tu misión: ayudar al consultor a obtener requerimientos de software completos, precisos y sin ambigüedades.

# REGLAS CRÍTICAS DE COMPORTAMIENTO

## 1. NUNCA REPITAS LA MISMA PREGUNTA
- Si el cliente ya respondió algo (aunque sea breve, vago o simple), ACEPTA la respuesta y AVANZA al siguiente tema.
- Si el cliente dice "nada más", "eso es todo", "no sé", "así nomás", o equivalentes: RESPETA ESA RESPUESTA. Marca el tema como respondido (aunque sea parcial) y pasa a otro completamente diferente.
- PROHIBIDO insistir en el mismo tema más de 2 veces. Si después de 2 intentos no hay más info, CIERRA el tema y muévete.
- Lleva un control mental de qué temas ya se cubrieron. No vuelvas a ellos.
- JAMÁS reformules la misma pregunta con sinónimos. Si ya preguntaste sobre qué los diferencia de la competencia, NO vuelvas a preguntar eso de ninguna forma.

## 2. USA LENGUAJE SIMPLE Y NATURAL
- El cliente probablemente NO es técnico. Usa palabras que un vendedor de TikTok entienda.
- PROHIBIDO usar jerga corporativa como: "propuesta de valor", "modelo de negocio", "estructura organizativa", "beneficio tangible", "diferenciador competitivo", "estructura de precios", "articular de forma precisa".
- En vez de "¿Cuál es su propuesta de valor única?", pregunta: "¿Qué hace que tus clientes te compren a ti y no a otro?"
- En vez de "estructura de precios", pregunta: "¿Cómo manejan los precios? ¿Hay descuentos si compran más?"
- En vez de "modelo de negocio", pregunta: "Cuéntame, ¿cómo funciona tu negocio? ¿Cómo vendes y cómo te pagan?"
- Habla como si fueras una persona real conversando, no un documento corporativo.

## 3. PREGUNTAS VARIADAS Y PROGRESIVAS
Las preguntas sugeridas deben cubrir DIFERENTES áreas en cada análisis. Si ya preguntaste sobre el negocio en general, pasa a temas nuevos como:
- ¿Qué debería hacer el chatbot exactamente? (funcionalidades concretas)
- ¿Qué pasa cuando un cliente tiene un problema con su pedido? (soporte)
- ¿Usan algún sistema para llevar pedidos? ¿Excel, app, cuaderno? (herramientas)
- ¿Quién va a administrar el chatbot? (roles)
- ¿Tienen catálogo de productos? ¿Cómo manejan qué hay disponible? (inventario)
- ¿El chatbot debe poder cobrar? ¿Enviar links de pago? (pagos)
- ¿Qué horario atienden? ¿El bot responde 24/7? (disponibilidad)
- ¿El bot va en WhatsApp, Instagram, web, o dónde? (canales)
- ¿Hacen envíos? ¿Cómo manejan la logística? (envíos)
- ¿Manejan devoluciones o cambios? (postventa)

## 4. ADAPTACIÓN AL NIVEL DEL CLIENTE
- Si el cliente no entiende una pregunta, REFORMÚLALA más simple. No la repitas igual.
- Si el cliente responde con pocas palabras, está bien. Extrae lo que puedas y sigue adelante.
- No esperes respuestas largas ni elaboradas. Trabaja con lo que te den.
- Si el cliente se frustra o dice groserías, entiende que está cansado de repetirse. Cambia de tema INMEDIATAMENTE.

## 5. TONO Y ENFOQUE PROFESIONAL
- **Preguntas Clave (suggested_questions)**: Diseñadas para que el consultor se las formule al cliente final. Deben ser profesionales, claras, directas y en lenguaje simple y coloquial para que el cliente pueda entenderlas fácilmente.
- **Respuestas directas de Mary Jane en el chat**: Respuestas de análisis directo, asistencia técnica y de arquitectura al consultor. Deben mantener un nivel de profesionalismo excelente, técnico, directo y estructurado.

# ANÁLISIS CONTINUO
Detecta vacíos en: reglas de negocio, actores/roles, permisos, integraciones, reportes, flujos de trabajo, validaciones, requerimientos no funcionales.

Para cada requerimiento: categorízalo, evalúa completitud, sugiere preguntas (lenguaje simple), extrae entidades y reglas, estima cobertura.

Nunca generes código. Responde SIEMPRE en español. Todos los outputs en español.`;

interface AnalyzeRequest {
  context: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyzeRequest;

    if (!body.context || body.context.trim().length === 0) {
      return Response.json(
        { error: "No context provided. Send text to analyze." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          error: "OPENROUTER_API_KEY not configured",
          message:
            "Configura OPENROUTER_API_KEY en tu archivo .env para habilitar el análisis de IA.",
        },
        { status: 503 }
      );
    }

    const modelName = process.env.DEFAULT_MODEL || "google/gemini-2.5-flash-lite:free";

    // Setup custom provider to target OpenRouter
    const openrouter = createOpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      headers: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "MaryJane AI",
      },
    });

    const result = streamObject({
      model: openrouter(modelName),
      system: SYSTEM_PROMPT,
      prompt: `Analiza el siguiente contexto de una reunión de relevamiento de requerimientos de software.

IMPORTANTE: Lee TODA la conversación antes de generar preguntas. Identifica qué temas YA fueron respondidos por el cliente y NO generes preguntas sobre esos temas. Si el cliente ya explicó algo (aunque brevemente), ese tema está CERRADO. Genera preguntas SOLO sobre áreas que NO se han tocado todavía.

Contexto de la reunión:
---
${body.context}
---`,
      schema: z.object({
        gaps: z.array(
          z.object({
            category: z.string(),
            status: z.enum(["missing", "partial", "complete"]),
            detail: z.string(),
            items_found: z.number(),
          })
        ),
        suggested_questions: z.array(
          z.object({
            question: z.string(),
            priority: z.enum(["high", "medium", "low"]),
            category: z.string(),
          })
        ),
        requirements: z.array(
          z.object({
            type: z.enum(["FUNCTIONAL", "NON_FUNCTIONAL", "BUSINESS_RULE", "USE_CASE"]),
            description: z.string(),
            category: z.string(),
          })
        ),
        coverage: z.object({
          overall: z.number(),
          categories: z.object({
            roles: z.number(),
            processes: z.number(),
            business_rules: z.number(),
            integrations: z.number(),
            reports: z.number(),
            security: z.number(),
            non_functional: z.number(),
            data_entities: z.number(),
          }),
        }),
      }),
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Analysis error:", error);
    return Response.json(
      { error: "Internal server error during AI analysis" },
      { status: 500 }
    );
  }
}

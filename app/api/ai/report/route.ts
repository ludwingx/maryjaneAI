import { NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { buildPricingPrompt } from "@/lib/pricing";

const SYSTEM_PROMPT = `Eres MaryJane AI — Senior Product Owner, Business Analyst y Software Architect.
Tu tarea es tomar la bitácora o conversación de relevamiento de requerimientos de software que ha mantenido el consultor con el cliente y producir:
1. Un INFORME TÉCNICO DE REQUERIMIENTOS en formato Markdown bien estructurado, que contenga:
   - Resumen ejecutivo del proyecto.
   - Requerimientos Funcionales principales.
   - Requerimientos No Funcionales.
   - Reglas de Negocio identificadas.
2. Una COTIZACIÓN ESTIMADA DETALLADA del proyecto, usando los parámetros de cotización del consultor provistos abajo.
   - Cada módulo debe usar la tarifa por hora correspondiente al tipo de trabajo (frontend, backend, IA, etc.).
   - Aplica los multiplicadores de esfuerzo indicados (urgencia, claridad, cambios, etc.).
   - Descuenta la productividad por herramientas de IA.
   - Incluye factores de riesgo detectados en la conversación.
   - Aplica el margen de ganancia y descuentos.
   - Genera un desglose transparente y justificable.
   - Incluye una sección que explique en lenguaje simple POR QUÉ cada factor afectó el precio.
3. Las condiciones comerciales del contrato al final.

Genera TODO en español con un tono profesional, claro y de alta calidad técnica.`;

export async function POST(request: NextRequest) {
  try {
    const { context, username, projectId } = await request.json();

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

    // Load pricing data from database
    let providerProfile = null;
    let projectContext = null;

    if (username) {
      const user = await prisma.user.findUnique({ where: { email: username } });
      if (user) {
        providerProfile = await prisma.providerProfile.findUnique({
          where: { userId: user.id },
        });
      }
    }

    if (projectId) {
      projectContext = await prisma.projectContext.findUnique({
        where: { projectId },
      });
    }

    // Build enriched pricing prompt
    const pricingPrompt = buildPricingPrompt(providerProfile, projectContext);

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
      prompt: `${pricingPrompt}

---

Genera el informe final de especificación y la cotización para el siguiente historial de relevamiento:
      
---
${context}
---`,
      schema: z.object({
        reportMarkdown: z.string().describe("El informe técnico completo en formato Markdown"),
        modules: z.array(
          z.object({
            name: z.string(),
            description: z.string(),
            workType: z.enum(["frontend", "backend", "ai", "design", "consulting", "devops", "qa", "general"]).describe("Tipo de trabajo para asignar tarifa"),
            hours: z.number().describe("Horas base estimadas antes de multiplicadores"),
            adjustedHours: z.number().describe("Horas después de aplicar multiplicadores y productividad IA"),
            ratePerHour: z.number().describe("Tarifa por hora aplicada según el tipo de trabajo"),
            complexity: z.enum(["Baja", "Media", "Alta"]),
            cost: z.number().describe("Costo del módulo = adjustedHours × ratePerHour"),
          })
        ),
        pricingBreakdown: z.object({
          effortSubtotal: z.number().describe("Suma de costos de todos los módulos"),
          multiplierApplied: z.number().describe("Multiplicador combinado de esfuerzo aplicado (ej: 1.10)"),
          multiplierDetails: z.array(z.object({
            factor: z.string().describe("Nombre del factor (urgencia, claridad, etc.)"),
            value: z.string().describe("Valor del factor (Normal, Parcial, etc.)"),
            impact: z.string().describe("Impacto en el precio (+10%, -5%, etc.)"),
          })),
          riskFactors: z.array(z.object({
            risk: z.string().describe("Factor de riesgo detectado"),
            percentage: z.number().describe("Porcentaje de contingencia añadido"),
          })),
          riskTotal: z.number().describe("Monto total añadido por riesgos"),
          extrasTotal: z.number().describe("Costos operativos + capacitación"),
          extrasDetails: z.array(z.object({
            concept: z.string(),
            amount: z.number(),
          })),
          profitMargin: z.number().describe("Porcentaje de margen de ganancia aplicado"),
          profitAmount: z.number().describe("Monto del margen de ganancia"),
          discountAmount: z.number().describe("Monto total de descuentos aplicados"),
          taxAmount: z.number().describe("Monto de impuestos si aplica"),
          whyThisPrice: z.array(z.string()).describe("Lista de explicaciones en lenguaje simple de por qué cada factor afectó el precio"),
        }),
        commercialTerms: z.object({
          paymentMethod: z.string().describe("Forma de pago"),
          upfrontPercentage: z.number().describe("Porcentaje de anticipo"),
          includedRevisions: z.number().describe("Revisiones incluidas"),
          supportMonths: z.number().describe("Meses de soporte"),
          warrantyMonths: z.number().describe("Meses de garantía"),
          trainingHours: z.number().describe("Horas de capacitación"),
          codeOwnership: z.boolean().describe("Cesión de código fuente"),
          ndaRequired: z.boolean().describe("NDA requerido"),
        }),
        totalCost: z.number().describe("Precio final total en la moneda del consultor"),
        currency: z.string().describe("Moneda de la cotización"),
        durationWeeks: z.number().describe("Tiempo estimado en semanas"),
      }),
    });

    return Response.json(object);
  } catch (error: unknown) {
    console.error("AI Report generation error:", error);
    return Response.json(
      { error: "Error en el servidor al generar el informe" },
      { status: 500 }
    );
  }
}

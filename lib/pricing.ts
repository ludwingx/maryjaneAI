import type { ProviderProfile, ProjectContext } from "@prisma/client";

// ─── Multiplier Maps ────────────────────────────────────

const URGENCY_MULTIPLIER: Record<string, number> = {
  VERY_URGENT: 0.30,
  URGENT: 0.15,
  NORMAL: 0,
  FLEXIBLE: -0.05,
};

const CLARITY_MULTIPLIER: Record<string, number> = {
  VERY_CLEAR: 0,
  PARTIAL: 0.10,
  VERY_AMBIGUOUS: 0.25,
};

const AVAILABILITY_MULTIPLIER: Record<string, number> = {
  RESPONSIVE: 0,
  SLOW: 0.05,
  HARD_TO_REACH: 0.15,
};

const CHANGE_MULTIPLIER: Record<string, number> = {
  LOW: 0,
  MEDIUM: 0.10,
  HIGH: 0.20,
};

const PAYMENT_MULTIPLIER: Record<string, number> = {
  FULL_UPFRONT: 0,
  MILESTONES: 0,
  MONTHLY: 0,
  ON_DELIVERY: 0.10,
};

const LEVEL_LABELS: Record<string, string> = {
  JUNIOR: "Junior",
  SEMI_SENIOR: "Semi Senior",
  SENIOR: "Senior",
  TECH_LEAD: "Tech Lead",
  ARCHITECT: "Arquitecto",
  SPECIALIST: "Especialista",
};

const EDUCATION_LABELS: Record<string, string> = {
  TECHNICAL: "Técnico",
  BACHELOR: "Licenciatura",
  ENGINEERING: "Ingeniería",
  MASTER: "Maestría",
  DOCTORATE: "Doctorado",
};

const URGENCY_LABELS: Record<string, string> = {
  VERY_URGENT: "Muy urgente (+30%)",
  URGENT: "Urgente (+15%)",
  NORMAL: "Normal",
  FLEXIBLE: "Flexible (-5%)",
};

const CLARITY_LABELS: Record<string, string> = {
  VERY_CLEAR: "Muy claros",
  PARTIAL: "Parciales (+10%)",
  VERY_AMBIGUOUS: "Muy ambiguos (+25%)",
};

const CLIENT_TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL: "Persona",
  STARTUP: "Startup",
  SME: "PyME",
  ENTERPRISE: "Empresa Grande",
  GOVERNMENT: "Gobierno",
  NGO: "ONG",
  UNIVERSITY: "Universidad",
};

const PAYMENT_LABELS: Record<string, string> = {
  FULL_UPFRONT: "100% Anticipo",
  MILESTONES: "Por Hitos",
  MONTHLY: "Mensual",
  ON_DELIVERY: "Contra Entrega (+10%)",
};

const CHANGE_LABELS: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media (+10%)",
  HIGH: "Alta (+20%)",
};

const AVAILABILITY_LABELS: Record<string, string> = {
  RESPONSIVE: "Responde rápido",
  SLOW: "Responde lento (+5%)",
  HARD_TO_REACH: "Difícil de contactar (+15%)",
};

// ─── Build Pricing Prompt ───────────────────────────────

export function buildPricingPrompt(
  profile: ProviderProfile | null,
  context: ProjectContext | null
): string {
  if (!profile && !context) {
    // Fallback: no pricing data configured, use basic defaults
    return `
## PARÁMETROS DE COTIZACIÓN
No se han configurado parámetros de cotización personalizados.
Usa una tarifa base general de $35 USD por hora para todas las estimaciones.
Aplica un margen de ganancia del 25% y un factor de contingencia del 15%.
`;
  }

  const sections: string[] = [];

  // ── Section 1: Provider Rates ──
  if (profile) {
    const monthlyCosts =
      profile.internetCost +
      profile.electricityCost +
      profile.coworkingCost +
      profile.hostingCost +
      profile.licenseCost +
      profile.accountingCost +
      profile.insuranceCost +
      profile.domainCostYearly / 12;

    sections.push(`
### I. TARIFAS DEL PROVEEDOR (por hora)
- General: $${profile.rateGeneral}/hr
- Frontend: $${profile.rateFrontend}/hr
- Backend: $${profile.rateBackend}/hr
- IA/ML: $${profile.rateAI}/hr
- Diseño/UX: $${profile.rateDesign}/hr
- Consultoría/Reuniones: $${profile.rateConsulting}/hr
- DevOps: $${profile.rateDevOps}/hr
- QA/Testing: $${profile.rateQA}/hr

### II. PERFIL PROFESIONAL DEL PROVEEDOR
- Nivel: ${LEVEL_LABELS[profile.professionalLevel] || profile.professionalLevel}
- Años de experiencia: ${profile.yearsExperience}
- Educación: ${EDUCATION_LABELS[profile.educationLevel] || profile.educationLevel}
- Especializaciones: ${profile.specializations.length > 0 ? profile.specializations.join(", ") : "No especificadas"}
- Certificaciones: ${profile.certifications.length > 0 ? profile.certifications.join(", ") : "Ninguna"}
- Proyectos completados: ${profile.completedProjects}
- Herramientas IA: ${profile.aiTools.length > 0 ? profile.aiTools.join(", ") : "Ninguna"}
- Factor de productividad IA: +${profile.aiProductivityBoost}% (reduce horas estimadas)
- Equipo: ${profile.teamMembers.length > 0 ? profile.teamMembers.join(", ") : "Freelancer solo"}

### III. COSTOS OPERATIVOS DEL PROVEEDOR
- Costo operativo mensual total: $${monthlyCosts.toFixed(2)} ${profile.mainCurrency}/mes
- Desglose: Internet($${profile.internetCost}), Electricidad($${profile.electricityCost}), Coworking($${profile.coworkingCost}), Hosting($${profile.hostingCost}), Licencias($${profile.licenseCost}), Contabilidad($${profile.accountingCost}), Seguros($${profile.insuranceCost}), Dominio($${(profile.domainCostYearly / 12).toFixed(2)}/mes)
- Impuesto sobre ingreso: ${profile.incomeTaxRate}%

### IV. CONTEXTO DE MERCADO DEL PROVEEDOR
- País: ${profile.providerCountry}
- Moneda principal: ${profile.mainCurrency}
- Moneda local: ${profile.localCurrency}
- Tipo de cambio: 1 ${profile.mainCurrency} = ${profile.exchangeRate} ${profile.localCurrency}
- Costo de vida: ${profile.costOfLiving}
- Alcance de mercado: ${profile.marketScope}`);
  }

  // ── Section 2: Client & Project Context ──
  if (context) {
    const urgencyMult = URGENCY_MULTIPLIER[context.urgency] ?? 0;
    const clarityMult = CLARITY_MULTIPLIER[context.requirementsClarity] ?? 0;
    const availMult = AVAILABILITY_MULTIPLIER[context.clientAvailability] ?? 0;
    const changeMult = CHANGE_MULTIPLIER[context.changeProbability] ?? 0;
    const paymentMult = PAYMENT_MULTIPLIER[context.paymentMethod] ?? 0;
    const recurringDiscount = context.isRecurringClient ? 0.05 : 0;
    const strategicDiscount = context.isStrategicProject ? 0.10 : 0;

    const combinedMultiplier =
      1 +
      urgencyMult +
      clarityMult +
      availMult +
      changeMult +
      paymentMult -
      recurringDiscount -
      strategicDiscount;

    sections.push(`
### V. PERFIL DEL CLIENTE
- Tipo: ${CLIENT_TYPE_LABELS[context.clientType] || context.clientType}
- Industria: ${context.clientIndustry}
- País: ${context.clientCountry || "No especificado"}
- Idioma: ${context.clientLanguage}
- Zona horaria: ${context.clientTimezone}

### VI. CONTEXTO DEL PROYECTO (Multiplicadores de Esfuerzo)
- Urgencia: ${URGENCY_LABELS[context.urgency] || context.urgency}
- Presupuesto del cliente: ${context.clientBudget}
- Claridad de requerimientos: ${CLARITY_LABELS[context.requirementsClarity] || context.requirementsClarity}
- Disponibilidad del cliente: ${AVAILABILITY_LABELS[context.clientAvailability] || context.clientAvailability}
- Probabilidad de cambios: ${CHANGE_LABELS[context.changeProbability] || context.changeProbability}
- Valor para el negocio: ${context.businessValue}
- Reuniones estimadas: ${context.estimatedMeetings}
- Revisiones estimadas: ${context.estimatedRevisions}
- **Multiplicador combinado de esfuerzo: ×${combinedMultiplier.toFixed(3)}**

### VII. CONDICIONES COMERCIALES
- Margen de ganancia deseado: ${context.profitMargin}%
- Descuento negociado: ${context.negotiatedDiscount}%
- Cliente recurrente: ${context.isRecurringClient ? "Sí (-5%)" : "No"}
- Proyecto estratégico (portafolio): ${context.isStrategicProject ? "Sí (-10%)" : "No"}
- Forma de pago: ${PAYMENT_LABELS[context.paymentMethod] || context.paymentMethod}
- Anticipo requerido: ${context.upfrontPercentage}%
- Revisiones incluidas: ${context.includedRevisions}
- Soporte post-entrega: ${context.supportMonths} mes(es)
- Garantía por bugs: ${context.warrantyMonths} mes(es)
- Horas de capacitación: ${context.trainingHours}
- Cesión de código fuente: ${context.codeOwnership ? "Sí" : "No"}
- NDA requerido: ${context.ndaRequired ? "Sí" : "No"}
- Penalización por retraso: ${context.lateDeliveryPenalty ? "Sí" : "No"}
- Bonus por entrega anticipada: ${context.earlyDeliveryBonus ? "Sí" : "No"}`);
  }

  // ── Section 3: Instructions ──
  const aiBoost = profile ? profile.aiProductivityBoost : 0;
  const supportMonths = context ? context.supportMonths : 1;
  const trainingHours = context ? context.trainingHours : 0;
  const rateConsulting = profile ? profile.rateConsulting : 50;

  sections.push(`
### INSTRUCCIONES PARA LA COTIZACIÓN
1. Estima las horas por módulo/componente detectado en la conversación.
2. Asigna la tarifa correspondiente según el tipo de trabajo (frontend, backend, IA, etc.).
3. Aplica el multiplicador combinado de esfuerzo a las horas base.
4. Descuenta el factor de productividad IA (${aiBoost}%) de las horas totales.
5. Calcula el subtotal de esfuerzo (horas ajustadas × tarifa).
6. Identifica y lista los factores de riesgo detectados en la conversación (APIs externas, tecnologías nuevas, requerimientos ambiguos) y agrega un porcentaje de contingencia por cada uno.
7. Suma costos adicionales: soporte (${supportMonths} meses de hosting/operativos) + capacitación (${trainingHours}h × $${rateConsulting}/hr).
8. Aplica el margen de ganancia al total.
9. Resta cualquier descuento negociado.
10. Genera un desglose COMPLETAMENTE TRANSPARENTE donde cada línea sea justificable.
11. Incluye una sección "¿Por qué este precio?" que explique en lenguaje simple qué factores aumentaron/disminuyeron el costo.
12. Incluye las condiciones comerciales (forma de pago, revisiones, garantía, etc.) al final del documento.`);

  return `
## PARÁMETROS DE COTIZACIÓN DEL CONSULTOR
${sections.join("\n")}
`;
}

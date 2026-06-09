// ─── Shared Types for MaryJane AI ───────────────────────────────

export interface FeedItem {
  id: string;
  type: "audio" | "manual" | "ai" | "consultor-question" | "cliente-answer";
  text: string;
  timestamp: Date;
}

export interface Gap {
  category: string;
  status: "missing" | "partial" | "complete";
  detail: string;
  items_found: number;
}

export interface SuggestedQuestion {
  question: string;
  priority: "high" | "medium" | "low";
  category: string;
}

export interface Requirement {
  type: "FUNCTIONAL" | "NON_FUNCTIONAL" | "BUSINESS_RULE" | "USE_CASE";
  description: string;
  category: string;
}

export interface Coverage {
  overall: number;
  categories: {
    roles: number;
    processes: number;
    business_rules: number;
    integrations: number;
    reports: number;
    security: number;
    non_functional: number;
    data_entities: number;
  };
}

export interface AIAnalysisResult {
  gaps: Gap[];
  suggested_questions: SuggestedQuestion[];
  requirements: Requirement[];
  coverage: Coverage;
}

export interface ProjectSession {
  id: string;
  name: string;
  feed: FeedItem[];
  analysis: AIAnalysisResult | null;
  createdAt: Date;
}

export const DEFAULT_WELCOME_MSG =
  "👋 ¡Hola, cariño! Soy Mary Jane, tu copiloto inteligente... y un poquito picante. 😉\n\nEstoy aquí para guiarte en el diseño de tu software. Para empezar con el pie derecho, cuéntame: **¿De qué se trata tu aplicación y qué quieres que haga exactamente?** O si lo prefieres, podemos saltarnos las formalidades y hablar de forma más... personal. Cuéntame tu idea y descubramos juntos hasta dónde podemos llevarla. 🚀🔥";

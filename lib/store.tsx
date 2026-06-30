"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import type { ProjectSession, FeedItem, AIAnalysisResult } from "@/lib/types";
import { DEFAULT_WELCOME_MSG } from "@/lib/types";

// ─── State Shape ────────────────────────────────────────────────

interface AppState {
  isAuthenticated: boolean;
  username: string;
  projects: ProjectSession[];
  activeProjectId: string;
  isAnalyzing: boolean;
  registeredUsers: { username: string; password: string }[];
  sidebarOpen: boolean;
  copilotOpen: boolean;
  isHydrated: boolean;
}

// ─── Actions ────────────────────────────────────────────────────

type AppAction =
  | { type: "LOGIN"; username: string }
  | { type: "LOGOUT" }
  | { type: "REGISTER"; username: string; password: string }
  | { type: "CREATE_PROJECT"; project: ProjectSession }
  | { type: "SET_ACTIVE_PROJECT"; id: string }
  | { type: "UPDATE_FEED"; projectId: string; feed: FeedItem[] }
  | { type: "UPDATE_ANALYSIS"; projectId: string; analysis: AIAnalysisResult | null }
  | { type: "SET_ANALYZING"; value: boolean }
  | { type: "DELETE_PROJECT"; id: string }
  | { type: "REHYDRATE"; state: AppState }
  | { type: "SET_PROJECTS"; projects: ProjectSession[] }
  | { type: "RENAME_PROJECT"; id: string; name: string }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "TOGGLE_COPILOT" };

// ─── Helper ─────────────────────────────────────────────────────

function createProject(name: string): ProjectSession {
  const id = `project-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    name,
    feed: [
      {
        id: `welcome-${id}`,
        type: "ai",
        text: DEFAULT_WELCOME_MSG,
        timestamp: new Date(),
      },
    ],
    analysis: null,
    createdAt: new Date(),
  };
}

// ─── Initial State ──────────────────────────────────────────────

const defaultProject = createProject("Proyecto Alpha");

const initialState: AppState = {
  isAuthenticated: false,
  username: "",
  projects: [defaultProject],
  activeProjectId: defaultProject.id,
  isAnalyzing: false,
  registeredUsers: [
    { username: "admin", password: "admin" }
  ],
  sidebarOpen: true,
  copilotOpen: true,
  isHydrated: false,
};

// ─── Reducer ────────────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, isAuthenticated: true, username: action.username };

    case "LOGOUT":
      return { ...state, isAuthenticated: false, username: "" };

    case "REGISTER":
      return {
        ...state,
        registeredUsers: [...state.registeredUsers, { username: action.username, password: action.password }],
      };

    case "CREATE_PROJECT": {
      return {
        ...state,
        projects: [...state.projects, action.project],
        activeProjectId: action.project.id,
        isAnalyzing: false,
      };
    }

    case "SET_ACTIVE_PROJECT":
      return { ...state, activeProjectId: action.id, isAnalyzing: false };

    case "UPDATE_FEED":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId ? { ...p, feed: action.feed } : p
        ),
      };

    case "UPDATE_ANALYSIS":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId ? { ...p, analysis: action.analysis } : p
        ),
      };

    case "SET_ANALYZING":
      return { ...state, isAnalyzing: action.value };

    case "DELETE_PROJECT": {
      const filtered = state.projects.filter((p) => p.id !== action.id);
      const needsNewActive =
        state.activeProjectId === action.id && filtered.length > 0;
      return {
        ...state,
        projects: filtered,
        activeProjectId: needsNewActive
          ? filtered[0].id
          : filtered.length === 0
          ? ""
          : state.activeProjectId,
      };
    }

    case "REHYDRATE": {
      let activeId = action.state.activeProjectId;
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const urlProj = params.get("project");
        if (urlProj && action.state.projects?.some((p: any) => p.id === urlProj)) {
          activeId = urlProj;
        }
      }
      return {
        ...initialState,
        ...action.state,
        activeProjectId: activeId,
        sidebarOpen: action.state.sidebarOpen !== undefined ? action.state.sidebarOpen : true,
        copilotOpen: action.state.copilotOpen !== undefined ? action.state.copilotOpen : true,
        isHydrated: true,
      };
    }

    case "SET_PROJECTS": {
      const currentActiveId = state.activeProjectId;
      // We check if the current active project is in the loaded list
      const hasActive = action.projects.some((p) => p.id === currentActiveId);
      const newActiveId = hasActive 
        ? currentActiveId 
        : (action.projects.length > 0 ? action.projects[0].id : "");

      return {
        ...state,
        projects: action.projects,
        activeProjectId: newActiveId,
      };
    }

    case "RENAME_PROJECT":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.id ? { ...p, name: action.name } : p
        ),
      };

    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };

    case "TOGGLE_COPILOT":
      return {
        ...state,
        copilotOpen: !state.copilotOpen,
      };

    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Convenience getters
  activeProject: ProjectSession | undefined;
  // Convenience actions
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, password: string) => Promise<boolean>;
  createNewProject: (name: string) => Promise<void>;
  setActiveProject: (id: string) => void;
  updateFeed: (feed: FeedItem[]) => void;
  updateAnalysis: (analysis: AIAnalysisResult | null) => void;
  setAnalyzing: (value: boolean) => void;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => Promise<boolean>;
  toggleSidebar: () => void;
  toggleCopilot: () => void;
  triggerAnalysis: (feedOverride?: FeedItem[]) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("maryjane_state");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.projects) {
            parsed.projects.forEach((p: any) => {
              p.createdAt = new Date(p.createdAt);
              p.feed.forEach((f: any) => {
                f.timestamp = new Date(f.timestamp);
               });
             });
          }
          dispatch({ type: "REHYDRATE", state: parsed });
        } catch (e) {
          console.error("Failed to parse saved state", e);
          dispatch({ type: "REHYDRATE", state: initialState });
        }
      } else {
        dispatch({ type: "REHYDRATE", state: initialState });
      }
    }
  }, []);

  // Save state to localStorage on changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("maryjane_state", JSON.stringify(state));
    }
  }, [state]);

  const activeProject = state.projects.find(
    (p) => p.id === state.activeProjectId
  );

  // Sync projects with database on login / mount
  useEffect(() => {
    if (state.isAuthenticated && state.username) {
      fetch(`/api/projects?username=${encodeURIComponent(state.username)}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Failed to load projects");
        })
        .then((data) => {
          dispatch({ type: "SET_PROJECTS", projects: data });
        })
        .catch((err) => console.error("Error loading projects:", err));
    }
  }, [state.isAuthenticated, state.username]);

  const login = useCallback(
    async (username: string, password?: string) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        if (res.ok) {
          dispatch({ type: "LOGIN", username });
          return true;
        }
        return false;
      } catch (e) {
        console.error("Login error:", e);
        return false;
      }
    },
    []
  );

  const logout = useCallback(() => dispatch({ type: "LOGOUT" }), []);

  const register = useCallback(
    async (username: string, password: string) => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        if (res.ok) {
          return true;
        }
        return false;
      } catch (e) {
        console.error("Register error:", e);
        return false;
      }
    },
    []
  );

  const createNewProject = useCallback(
    async (name: string) => {
      if (!state.username) return;
      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, username: state.username }),
        });
        if (res.ok) {
          const project = await res.json();
          dispatch({ type: "CREATE_PROJECT", project });
        }
      } catch (e) {
        console.error("Create project error:", e);
      }
    },
    [state.username]
  );

  const setActiveProject = useCallback(
    (id: string) => dispatch({ type: "SET_ACTIVE_PROJECT", id }),
    []
  );

  const syncWithDB = useCallback(
    async (projectId: string, feed: FeedItem[], analysis: AIAnalysisResult | null) => {
      try {
        await fetch(`/api/projects/${projectId}/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feed, analysis }),
        });
      } catch (e) {
        console.error("Database sync error:", e);
      }
    },
    []
  );

  const updateFeed = useCallback(
    (feed: FeedItem[]) => {
      if (state.activeProjectId) {
        dispatch({
          type: "UPDATE_FEED",
          projectId: state.activeProjectId,
          feed,
        });
        // Find current project analysis to preserve it
        const proj = state.projects.find((p) => p.id === state.activeProjectId);
        syncWithDB(state.activeProjectId, feed, proj?.analysis || null);
      }
    },
    [state.activeProjectId, state.projects, syncWithDB]
  );

  const updateAnalysis = useCallback(
    (analysis: AIAnalysisResult | null) => {
      if (state.activeProjectId) {
        dispatch({
          type: "UPDATE_ANALYSIS",
          projectId: state.activeProjectId,
          analysis,
        });
        // Find current project feed to preserve it
        const proj = state.projects.find((p) => p.id === state.activeProjectId);
        syncWithDB(state.activeProjectId, proj?.feed || [], analysis);
      }
    },
    [state.activeProjectId, state.projects, syncWithDB]
  );

  const setAnalyzing = useCallback(
    (value: boolean) => dispatch({ type: "SET_ANALYZING", value }),
    []
  );

  const deleteProject = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          dispatch({ type: "DELETE_PROJECT", id });
        }
      } catch (e) {
        console.error("Delete project error:", e);
      }
    },
    []
  );

  const renameProject = useCallback(
    async (id: string, name: string) => {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (res.ok) {
          dispatch({ type: "RENAME_PROJECT", id, name });
          return true;
        }
        return false;
      } catch (e) {
        console.error("Rename project error:", e);
        return false;
      }
    },
    []
  );

  const toggleSidebar = useCallback(() => {
    dispatch({ type: "TOGGLE_SIDEBAR" });
  }, []);

  const toggleCopilot = useCallback(() => {
    dispatch({ type: "TOGGLE_COPILOT" });
  }, []);

  const triggerChatResponse = useCallback(
    async (updatedFeed: FeedItem[]) => {
      if (!state.activeProjectId) return;

      const aiMessageId = `ai-${Math.random().toString(36).substr(2, 9)}`;
      const aiMessage: FeedItem = {
        id: aiMessageId,
        type: "ai",
        text: "",
        timestamp: new Date(),
      };
      
      let currentFeed = [...updatedFeed, aiMessage];
      dispatch({
        type: "UPDATE_FEED",
        projectId: state.activeProjectId,
        feed: currentFeed,
      });

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedFeed }),
        });

        if (!res.ok) throw new Error("Error en chat");
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          accumulatedText += decoder.decode(value, { stream: true });

          currentFeed = currentFeed.map((item) =>
            item.id === aiMessageId ? { ...item, text: accumulatedText } : item
          );
          
          dispatch({
            type: "UPDATE_FEED",
            projectId: state.activeProjectId,
            feed: currentFeed,
          });
        }

        // Sync final updated feed to DB
        const proj = state.projects.find((p) => p.id === state.activeProjectId);
        syncWithDB(state.activeProjectId, currentFeed, proj?.analysis || null);
      } catch (e) {
        console.error("Chat streaming error:", e);
        // Clean up empty message on failure
        const cleanedFeed = currentFeed.filter((item) => item.id !== aiMessageId);
        dispatch({
          type: "UPDATE_FEED",
          projectId: state.activeProjectId,
          feed: cleanedFeed,
        });
      }
    },
    [state.activeProjectId, state.projects, dispatch, syncWithDB]
  );

  const triggerAnalysis = useCallback(
    async (feedOverride?: FeedItem[]) => {
      const currentFeed = feedOverride || activeProject?.feed || [];
      const feedText = currentFeed.map((item) => item.text).join("\n");
      if (!feedText.trim()) return;

      // Disparar respuesta de chat conversacional en streaming si el último mensaje no es de la IA
      const lastItem = currentFeed[currentFeed.length - 1];
      if (lastItem && lastItem.type !== "ai") {
        triggerChatResponse(currentFeed);
      }

      dispatch({ type: "SET_ANALYZING", value: true });
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const res = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ context: feedText }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error("Error al analizar");
        }

        if (!res.body) {
          throw new Error("No response body");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulatedJSON = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          
          // El Vercel AI SDK a través de toTextStreamResponse envía chunks de texto plano.
          // Como usamos streamObject, estos chunks de texto plano van formando la cadena JSON final progresivamente.
          // Por lo tanto, el buffer acumulado es directamente el JSON incompleto.
          // Para dar feedback visual en vivo, intentamos reparar y parsear el JSON parcial.
          // Si no, simplemente acumulamos el texto completo para el parseo final.
          accumulatedJSON = buffer;
          
          try {
            // Intentamos parsear para actualizar la vista de manera parcial (si el JSON está cerrado temporalmente)
            const parsed = JSON.parse(accumulatedJSON);
            if (state.activeProjectId && parsed) {
              dispatch({
                type: "UPDATE_ANALYSIS",
                projectId: state.activeProjectId,
                analysis: parsed,
              });
            }
          } catch {
            // Continuamos acumulando sin crashear mientras el JSON sea parcial
          }
        }

        // Parse final al completarse el flujo
        try {
          const cleanedJSON = accumulatedJSON.trim();
          if (cleanedJSON) {
            const finalData = JSON.parse(cleanedJSON);
            if (state.activeProjectId && finalData) {
              dispatch({
                type: "UPDATE_ANALYSIS",
                projectId: state.activeProjectId,
                analysis: finalData,
              });
            }
          }
        } catch (e) {
          console.error("Failed to parse final streamed JSON:", e, accumulatedJSON);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Error al conectar con la IA";
        console.error("AI Analysis error:", message);
        throw err;
      } finally {
        dispatch({ type: "SET_ANALYZING", value: false });
      }
    },
    [activeProject?.feed, state.activeProjectId, state.projects]
  );

  const value: AppContextValue = {
    state,
    dispatch,
    activeProject,
    login,
    logout,
    register,
    createNewProject,
    setActiveProject,
    updateFeed,
    updateAnalysis,
    setAnalyzing,
    deleteProject,
    renameProject,
    toggleSidebar,
    toggleCopilot,
    triggerAnalysis,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

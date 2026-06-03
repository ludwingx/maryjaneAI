# MaryJane AI — Core Workspace App

La app principal es un **workspace de reunión** con:
- 🎤 Botón para encender/apagar el micrófono y escuchar al cliente
- 📝 Transcripción en tiempo real de lo que se dice
- 💬 Bandeja de entrada tipo chat para agregar contexto manualmente
- 🧠 Panel de IA que analiza todo y sugiere preguntas dinámicas
- 📊 Indicador visual de cobertura de requerimientos

---

## User Review Required

> [!IMPORTANT]
> **Transcripción**: Usaré **Web Speech API** del navegador (gratis, nativa, cero latencia) para la transcripción en tiempo real. Funciona en **Chrome y Edge**. No requiere API key. El análisis de la IA sí usará **OpenRouter**. Si prefieres usar Deepgram o Whisper en su lugar (con costo por minuto), indícalo.

> [!IMPORTANT]
> **API Key**: Necesitarás configurar `OPENROUTER_API_KEY` en tu `.env` para que el análisis de IA funcione. La transcripción del audio funciona sin API key.

> [!WARNING]
> **Sin Auth por ahora**: Este MVP no incluye autenticación ni base de datos. Es el workspace puro funcionando. Auth y Prisma se agregarán en una fase posterior.

---

## Open Questions

1. **¿Quieres que la IA analice automáticamente cada X segundos, o con un botón "Analizar"?**
   Propongo: automático cada 15 segundos cuando hay contenido nuevo + botón manual.

2. **¿Solo español o también inglés para la transcripción?**
   Propongo: español por defecto, con selector de idioma.

---

## Proposed Changes

### Design System & Layout

La app será un workspace de pantalla completa, tema oscuro premium con glassmorphism.

```
┌─────────────────────────────────────────────────────────────┐
│  🧠 MaryJane AI          [ES ▾]    ⚙️ Config     🌙 Dark   │
├────────────────────────┬────────────────────────────────────┤
│                        │                                    │
│  📋 FEED               │  🧠 AI COPILOT                    │
│  (transcript + chat)   │                                    │
│                        │  ⚠ Vacíos Detectados              │
│  🔵 Audio [14:32]:     │  ─────────────────                 │
│  Necesitamos control   │  ❌ Roles                          │
│  de inventario...      │  ❌ Pagos                          │
│                        │  ✅ Procesos                       │
│  🟢 Tú escribiste:     │                                    │
│  El cliente quiere     │  💡 Preguntas Sugeridas            │
│  multi-sucursal        │  ─────────────────                 │
│                        │  1. ¿Qué roles usarán...?         │
│  🔵 Audio [14:35]:     │  2. ¿Métodos de pago?             │
│  Sí, cada sucursal     │                                    │
│  tiene su propio...    │  📊 Cobertura: 35%                │
│                        │  ████████░░░░░░░░░░░               │
│                        │                                    │
├────────────────────────┤                                    │
│ ┌────────────────────┐ │                                    │
│ │ Escribe contexto...│ │                                    │
│ └────────────────────┘ │                                    │
│  [🎤 Escuchar]  [Send] │                                    │
└────────────────────────┴────────────────────────────────────┘
```

---

### Component 1 — Global Styles

#### [MODIFY] [globals.css](file:///c:/Users/T450/Documents/workspace/mary-jane-ia/app/globals.css)

Reemplazar el CSS por defecto con un design system oscuro premium:
- Paleta de colores HSL: purples, cyans, grays oscuros
- Variables CSS para todo el tema
- Glassmorphism utilities
- Animaciones de pulse, glow, fade-in
- Tipografía con Inter de Google Fonts

---

### Component 2 — Root Layout

#### [MODIFY] [layout.tsx](file:///c:/Users/T450/Documents/workspace/mary-jane-ia/app/layout.tsx)

- Cambiar fuente a Inter
- Actualizar metadata (title, description)
- Fondo oscuro base

---

### Component 3 — Main Workspace Page

#### [MODIFY] [page.tsx](file:///c:/Users/T450/Documents/workspace/mary-jane-ia/app/page.tsx)

Reemplazar el landing por defecto con el workspace completo:
- Client component (`"use client"`) porque maneja audio, state, effects
- Layout de dos columnas: Feed (izquierda 60%) + AI Panel (derecha 40%)
- Componentes hijos inline (por ahora, refactorizaremos después)

---

### Component 4 — Audio Hook

#### [NEW] [use-speech-recognition.ts](file:///c:/Users/T450/Documents/workspace/mary-jane-ia/app/hooks/use-speech-recognition.ts)

Custom hook para la Web Speech API:
- `isListening` state
- `startListening()` / `stopListening()` 
- `transcript` acumulado
- `interimText` (lo que se está diciendo ahora)
- Configurable: `lang`, `continuous`, `interimResults`
- Auto-restart on end (para mantener la escucha continua)

---

### Component 5 — AI Analysis Route

#### [NEW] [route.ts](file:///c:/Users/T450/Documents/workspace/mary-jane-ia/app/api/ai/analyze/route.ts)

Route Handler POST que:
1. Recibe `{ context: string }` (todo el texto acumulado)
2. Llama a OpenRouter con el system prompt de RequirementDiscoveryAgent
3. Retorna JSON con: `gaps`, `suggested_questions`, `requirements`, `coverage`
4. Streaming de la respuesta (para UX rápida)

---

### Component 6 — Feed Component

Parte del `page.tsx`. El feed unificado que muestra:
- Entradas de transcripción (audio) con timestamp e ícono de micrófono
- Entradas manuales (chat) con ícono diferente
- Auto-scroll al último mensaje
- Animación de entrada para cada nuevo item

---

### Component 7 — Chat Input

Input de texto en la parte inferior del feed:
- Textarea expandible
- Enter para enviar, Shift+Enter para nueva línea
- Botón de micrófono con indicador de estado (pulsando = escuchando)

---

### Component 8 — AI Copilot Panel

Panel lateral derecho:
- Sección de Vacíos Detectados (con íconos ❌/✅)
- Sección de Preguntas Sugeridas (con botón "Copiar")
- Barra de Cobertura general
- Estado de la IA (analizando... / listo)
- Botón "Analizar Ahora"

---

### Environment Variables

#### [MODIFY] [.env](file:///c:/Users/T450/Documents/workspace/mary-jane-ia/.env)

Agregar:
```env
OPENROUTER_API_KEY="sk-or-v1-xxxxxxxxxxxxxxxx"
DEFAULT_MODEL="openai/gpt-4.1"
```

---

## Verification Plan

### Automated Tests
1. `npm run dev` — verificar que la app carga sin errores
2. Hacer clic en 🎤 — verificar que el navegador pide permiso de micrófono
3. Hablar — verificar que aparece transcripción en el feed
4. Escribir texto — verificar que aparece como entrada manual
5. Verificar que el panel de IA muestra sugerencias (requiere API key)

### Manual Verification
- Abrir en Chrome (Web Speech API requiere Chrome/Edge)
- Verificar responsive en mobile (el layout colapsa a una columna)
- Verificar tema oscuro

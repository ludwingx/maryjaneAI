const { createOpenAI } = require("@ai-sdk/openai");
const { generateText } = require("ai");
const dotenv = require("dotenv");
const path = require("path");

// Load .env
dotenv.config({ path: path.join(__dirname, "../.env") });

const apiKey = process.env.OPENROUTER_API_KEY;
const modelName = process.env.DEFAULT_MODEL || "google/gemini-2.5-flash";

console.log("Usando API Key:", apiKey ? "Configurada (comienza con " + apiKey.substring(0, 8) + "...)" : "No configurada");
console.log("Modelo:", modelName);

if (!apiKey) {
  console.error("Falta OPENROUTER_API_KEY en .env");
  process.exit(1);
}

const openrouter = createOpenAI({
  apiKey,
  baseURL: "https://openrouter.ai/api/v1",
});

async function main() {
  try {
    console.log("Enviando petición de prueba a OpenRouter...");
    const { text } = await generateText({
      model: openrouter(modelName),
      prompt: "Hola, responde brevemente con la palabra 'Conectado'.",
    });
    console.log("Respuesta recibida:", text);
  } catch (error) {
    console.error("Error al conectar con la IA:", error);
  }
}

main();

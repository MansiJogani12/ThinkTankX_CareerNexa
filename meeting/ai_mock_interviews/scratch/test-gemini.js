const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");

let apiKey = "";
try {
  const envContent = fs.readFileSync(".env.local", "utf-8");
  const match = envContent.match(/GOOGLE_GENERATIVE_AI_API_KEY\s*=\s*(.+)/);
  if (match) {
    apiKey = match[1].trim();
  }
} catch (e) {
  console.log("No .env.local file found or read error:", e.message);
}

console.log("API Key loaded:", apiKey ? "YES (length: " + apiKey.length + ")" : "NO");

const ai = new GoogleGenAI({ apiKey });

async function run() {
  try {
    const contents = "Hello, you are CareerNexa AI. Introduce yourself.";
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });
    console.log("Response text type:", typeof response.text);
    console.log("Response text value:", response.text);
  } catch (error) {
    console.error("Error during generation:", error);
  }
}

run();

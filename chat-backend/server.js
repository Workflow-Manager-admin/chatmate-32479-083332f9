require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import DeepSeek client libraries
const ModelClient = require("@azure-rest/ai-inference").default;
const { AzureKeyCredential } = require("@azure/core-auth");

const app = express();
const PORT = process.env.PORT || 12147;

// For local dev: allow frontends on localhost:3000, 5173, etc.
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
  ],
  credentials: false
}));
app.use(express.json());

// PUBLIC_INTERFACE
/**
 * POST /chat -- Proxies chat messages to DeepSeek API.
 * Body: { message: "user question as text" }
 * Returns: { reply: "AI response" }
 */
app.post("/chat", async (req, res) => {
  const { message } = req.body || {};
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Missing or invalid 'message' field in body." });
  }

  const API_KEY = process.env.DEEPSEEK_API_KEY || process.env["deepseek_api_key"];
  if (!API_KEY) {
    return res.status(500).json({ error: "DeepSeek API key not set in environment (see .env)." });
  }

  // Compose DeepSeek API call via @azure-rest/ai-inference
  const ENDPOINT = "https://models.github.ai/inference";
  const MODEL = "deepseek/DeepSeek-V3-0324";

  // Conversation history (stateless per request: only current user msg and system prompt)
  const messages = [
    { role: "system", content: "You are a helpful AI assistant named TalkBuddy." },
    { role: "user", content: message.trim() }
  ];

  try {
    const client = ModelClient(ENDPOINT, new AzureKeyCredential(API_KEY));
    const body = {
      messages,
      model: MODEL,
      temperature: 0.8,
      top_p: 0.1,
      max_tokens: 2048
    };
    const resp = await client.path("/chat/completions").post({ body });
    // See: isUnexpected helper in @azure-rest/ai-inference for error checking
    if (resp.body?.error || !Array.isArray(resp.body?.choices) || !resp.body.choices[0]?.message?.content) {
      const errMsg = resp.body?.error?.message || resp.body?.error || "Unknown DeepSeek API error.";
      return res.status(502).json({ error: "DeepSeek API error: " + errMsg });
    }

    const text = resp.body.choices[0].message.content.trim();

    return res.json({ reply: text });
  } catch (err) {
    // Provide useful error message
    let detail = err && (err.message || err.toString());
    if (detail && typeof detail !== "string") detail = JSON.stringify(detail);
    return res.status(500).json({ error: "Server or DeepSeek API failure: " + detail });
  }
});

app.get("/", (req, res) => {
  res.send(`<h3>TalkBuddy Chat Backend</h3><div>POST /chat with {message} to proxy to DeepSeek API.</div>`);
});

// PUBLIC_INTERFACE
/** Start the server. Logs listening port. */
app.listen(PORT, () => {
  console.log(
    `TalkBuddy Chat Backend listening at http://localhost:${PORT} (POST /chat)\n` +
    "CORS enabled for local dev. .env file required with DEEPSEEK_API_KEY."
  );
});

/*
  TalkBuddy Chat Backend - Server
  - POST /chat endpoint (JSON body: { message }) proxies to DeepSeek API securely using env key
  - Reads DeepSeek API key from .env via process.env.DEEPSEEK_API_KEY
  - Uses @azure-rest/ai-inference and @azure/core-auth to call DeepSeek
  - CORS support for local dev.
  - Robust error handling and does not expose sensitive info.
*/

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ModelClient = require("@azure-rest/ai-inference").default;
const { AzureKeyCredential } = require("@azure/core-auth");

const app = express();
const PORT = process.env.PORT || 12147;

// Configure CORS for local development (customize as needed)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173"
    ],
    credentials: false
  })
);
app.use(express.json());

// PUBLIC_INTERFACE
/**
 * POST /chat - Proxies chat messages to DeepSeek API.
 * Body: { message: "user text" }
 * Returns: { reply: "AI response" }
 */
app.post("/chat", async (req, res) => {
  try {
    // Validate input JSON structure
    const { message } = req.body || {};
    if (!message || typeof message !== "string" || !message.trim()) {
      return res
        .status(400)
        .json({ error: "Missing or invalid 'message' field in body." });
    }

    // Securely read DeepSeek API Key from env
    const apiKey =
      process.env.DEEPSEEK_API_KEY || process.env["deepseek_api_key"];
    if (!apiKey) {
      // Server misconfiguration - don't expose details to client
      return res
        .status(500)
        .json({ error: "DeepSeek API key not set in environment (see .env)." });
    }

    // Prepare DeepSeek API call
    const ENDPOINT = "https://models.github.ai/inference";
    const MODEL = "deepseek/DeepSeek-V3-0324";
    // Basic conversation: system + user (stateless, no prior)
    const messages = [
      {
        role: "system",
        content: "You are a helpful AI assistant named TalkBuddy."
      },
      { role: "user", content: message.trim() }
    ];

    // Construct DeepSeek API client and request body
    const client = ModelClient(ENDPOINT, new AzureKeyCredential(apiKey));
    const body = {
      messages,
      model: MODEL,
      temperature: 0.8,
      top_p: 0.1,
      max_tokens: 2048
    };

    // Make API call and handle response
    const resp = await client.path("/chat/completions").post({ body });
    // Defensive error detection (DeepSeek/azure-rest may not always throw)
    if (
      resp.body?.error ||
      !Array.isArray(resp.body?.choices) ||
      !resp.body.choices[0]?.message?.content
    ) {
      const errMsg =
        resp.body?.error?.message ||
        resp.body?.error ||
        "Unknown DeepSeek API error.";
      return res
        .status(502)
        .json({ error: "DeepSeek API error: " + errMsg });
    }

    const reply = resp.body.choices[0].message.content.trim();
    return res.json({ reply });
  } catch (err) {
    // Provide robust error, scrub stack traces for security
    let msg =
      (err && (err.message || err.toString())) ||
      "Unexpected error processing request.";
    if (typeof msg !== "string") msg = JSON.stringify(msg);
    return res
      .status(500)
      .json({ error: "Server or DeepSeek API failure: " + msg });
  }
});

// Quick health/info landing
app.get("/", (req, res) => {
  res.send(
    `<h3>TalkBuddy Chat Backend</h3><div>POST /chat with {"message": "..."} to proxy to DeepSeek API.</div>`
  );
});

// PUBLIC_INTERFACE
/** Starts the backend server and logs the startup. */
app.listen(PORT, () => {
  console.log(
    `TalkBuddy Chat Backend listening at http://localhost:${PORT} (POST /chat)\n` +
      "CORS enabled for local dev. .env file required with DEEPSEEK_API_KEY."
  );
});

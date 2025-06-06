import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

/**
 * Helper for DeepSeek AI chat using @azure-rest/ai-inference in a browser environment.
 * Uses REACT_APP_GITHUB_TOKEN from process.env (supplied at build time via .env)
 */

const ENDPOINT = "https://models.github.ai/inference";
const MODEL = "deepseek/DeepSeek-V3-0324";

/**
 * Get the API key securely.
 * In Create React App, env variables prefixed REACT_APP_ are inlined at build time.
 */
function getApiKey() {
  // PUBLIC_INTERFACE
  const token = process.env.REACT_APP_GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "DeepSeek API key missing. Define REACT_APP_GITHUB_TOKEN in your .env file."
    );
  }
  return token;
}

/**
 * Send a chat message to DeepSeek and get a streaming or complete response.
 * Messages must be array of {role, content}
 * Options: {temperature, top_p, max_tokens}
 *
 * Throws error on HTTP error or API error from DeepSeek.
 */
export async function sendDeepSeekChat(messages, options = {}) {
  // PUBLIC_INTERFACE
  // Build client per request to avoid reusing credentials (safest in frontend)
  const key = getApiKey();
  const client = ModelClient(
    ENDPOINT,
    new AzureKeyCredential(key)
  );

  const body = {
    messages, // must include shepherded system/user roles
    model: MODEL,
    temperature: options.temperature ?? 0.8,
    top_p: options.top_p ?? 0.1,
    max_tokens: options.max_tokens ?? 2048
  };

  let response;
  try {
    response = await client.path("/chat/completions").post({ body });
  } catch (err) {
    // Network or code error
    throw new Error("Failed to call DeepSeek API: " + (err?.message || err));
  }

  if (isUnexpected(response)) {
    throw new Error(
      (response.body?.error?.message) ||
      "DeepSeek API error: Unknown API failure."
    );
  }

  if (
    !response.body ||
    !response.body.choices ||
    !Array.isArray(response.body.choices) ||
    !response.body.choices[0]?.message?.content
  ) {
    throw new Error("Invalid DeepSeek response format.");
  }

  return response.body.choices[0].message.content.trim();
}

//
// ModelClient.js - DeepSeek Model API helper for TalkBuddy
//
// Provides sendToDeepSeek(messages) for ChatPage
//
/* eslint-disable no-undef */

// PUBLIC_INTERFACE
/**
 * Sends chat messages to DeepSeek API and returns the response content.
 * Uses @azure-rest/ai-inference, @azure/core-auth.
 */
export async function sendToDeepSeek(allMessages) {
  // Build API params as specified
  const endpoint = "https://models.github.ai/inference";
  const model = "deepseek/DeepSeek-V3-0324";

  // In Create-React-App, the .env key MUST be prefixed as REACT_APP_GITHUB_TOKEN
  // See docs: https://create-react-app.dev/docs/adding-custom-environment-variables/
  // For security, only expose the token via REACT_APP_GITHUB_TOKEN
  const key =
    process.env.REACT_APP_GITHUB_TOKEN ||
    window.REACT_APP_GITHUB_TOKEN;
  if (!key) {
    throw new Error(
      "Missing DeepSeek API key. Define REACT_APP_GITHUB_TOKEN in .env."
    );
  }

  // Dynamically import for lighter bundle (no SSR); fallback error if fails
  let getModelClient, AzureKeyCredential;
  try {
    // These packages must be installed as per requirements!
    getModelClient = (await import("@azure-rest/ai-inference")).getModelClient;
    AzureKeyCredential = (await import("@azure/core-auth")).AzureKeyCredential;
  } catch {
    throw new Error(
      "@azure-rest/ai-inference or @azure/core-auth not found. Please install dependencies."
    );
  }

  const client = getModelClient(endpoint, new AzureKeyCredential(key));

  // Format props for DeepSeek API
  const systemMsg = allMessages.find((m) => m.role === "system") || {
    role: "system",
    content: "",
  };
  const history = allMessages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const params = {
    body: {
      model,
      messages: [systemMsg, ...history.filter((m) => m.role !== "system")],
      temperature: 0.8,
      top_p: 0.1,
      max_tokens: 2048,
    },
  };
  // Note: This endpoint mimics OpenAI's completion API

  // API CALL
  const response = await client.path("/chat/completions").post(params);
  if (!response || !response.body || !response.body.choices) {
    throw new Error("Invalid response from DeepSeek API.");
  }
  const reply =
    response.body.choices[0]?.message?.content ||
    "Sorry, no response received from the AI.";

  return reply.trim();
}

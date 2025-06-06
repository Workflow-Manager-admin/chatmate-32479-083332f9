/**
 * PUBLIC_INTERFACE
 * Standalone TalkBuddy AI Chat: Handles chat UI/UX, AI fetch via Express backend, light/dark mode, animation, errors, avatars.
 * Sends user messages to /chat on local Express backend (not DeepSeek API directly).
 * Displays loading indicator while waiting, handles errors gracefully, and updates chat history.
 */

// ---- Settings ----
const BACKEND_CHAT_ENDPOINT = "http://localhost:12147/chat"; // Update port if backend runs elsewhere

const initialMessages = [
  {
    sender: "ai",
    text: "👋 Hi there! I'm TalkBuddy AI. How can I help you today?",
    isTyping: false,
  }
];

// -------- State (only in memory) -----------
let chatMessages = [...initialMessages];
let submitting = false;
let aiIsTyping = false;
let theme = (window.localStorage.getItem("theme") || (
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark" : "light"
));

// -------- DOM References ----------
const chatBody = document.getElementById("tp-chat-body");
const chatOuter = document.getElementById("tp-chat-outer");
const inputBox = document.getElementById("tp-input");
const sendBtn = document.getElementById("btn-send");
const sendIcon = document.getElementById("send-icon");
const loader = document.getElementById("loader");
const clearBtn = document.getElementById("btn-clear");
const retryBtn = document.getElementById("btn-retry");
const resetBtn = document.getElementById("btn-reset");
const errorBar = document.getElementById("tp-error-bar");
const errorMsg = document.getElementById("tp-error-msg");
const form = document.getElementById("tp-chat-input-bar");
const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

// ----------- UI RENDERING -----------------
function renderMessages() {
  chatBody.innerHTML = "";
  chatMessages.forEach(msg => {
    chatBody.appendChild(renderMessageBubble(msg));
  });
  if (aiIsTyping) chatBody.appendChild(renderTypingBubble());
  // Scroll to bottom
  chatBody.scrollTop = chatBody.scrollHeight;
}
function renderMessageBubble(msg) {
  const div = document.createElement("div");
  div.className = "tp-chat-bubble " +
    (msg.sender === "user" ? "bubble-user" : "bubble-ai") +
    (msg.isTyping ? " bubble-typing" : "");
  // Avatar for AI
  if (msg.sender === "ai") {
    const span = document.createElement("span");
    span.className = "bubble-avatar";
    span.innerHTML = botAvatarSVG();
    div.appendChild(span);
  }
  // Message text itself
  const spanText = document.createElement("span");
  spanText.className = "bubble-text";
  spanText.textContent = msg.text;
  div.appendChild(spanText);
  return div;
}
function renderTypingBubble() {
  const div = document.createElement("div");
  div.className = "tp-chat-bubble bubble-ai bubble-typing";
  const span = document.createElement("span");
  span.className = "bubble-avatar";
  span.innerHTML = botAvatarSVG();
  div.appendChild(span);
  const textBubble = document.createElement("span");
  textBubble.className = "bubble-text";
  const dots = document.createElement("span");
  dots.className = "typing-dots";
  for (let i = 0; i < 3; ++i) {
    const dot = document.createElement("span");
    dot.className = "dot";
    dots.appendChild(dot);
  }
  textBubble.appendChild(dots);
  div.appendChild(textBubble);
  return div;
}
function botAvatarSVG() {
  return `<svg width="32" height="32" viewBox="0 0 40 40" fill="none"
    style="vertical-align: bottom; filter: drop-shadow(0 2.5px 12px #4f8cff32); animation: floatBot 2.0s infinite alternate">
    <circle cx="20" cy="20" r="18" fill="#4f8cff" stroke="#fff" stroke-width="2"/>
    <ellipse cx="20" cy="21.3" rx="11.7" ry="10.2" fill="#dae6fa"/>
    <ellipse cx="20" cy="24.8" rx="6.1" ry="3.1" fill="#bdd1f1" opacity="0.55"/>
    <circle cx="16.8" cy="19.2" r="2.1" fill="#23272f"/>
    <circle cx="23.2" cy="19.2" r="2.1" fill="#23272f"/>
    <rect x="16" y="25.7" width="8" height="2.5" rx="1.1" fill="#b7bfd8"/>
  </svg>`;
}
function updateErrorBar(msg) {
  if (msg) {
    errorMsg.textContent = msg;
    errorBar.style.display = "";
  } else {
    errorBar.style.display = "none";
  }
}
function setUIEnabled(enabled) {
  sendBtn.disabled = !enabled;
  inputBox.disabled = !enabled;
  clearBtn.disabled = !enabled;
  if (enabled) { sendBtn.ariaDisabled = "false"; inputBox.ariaDisabled = "false"; clearBtn.ariaDisabled = "false"; }
  else { sendBtn.ariaDisabled = "true"; inputBox.ariaDisabled = "true"; clearBtn.ariaDisabled = "true"; }
  loader.style.display = enabled ? "none" : "";
  sendIcon.style.display = enabled ? "" : "none";
}
function renderTheme() {
  chatOuter.className = "tp-chat-outer " + theme;
  document.body.classList.toggle("dark-mode", theme === "dark");
  document.body.classList.toggle("light-mode", theme === "light");
  themeIcon.innerHTML = theme === "light"
    ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="#ffd166" stroke="#ffd166">
         <circle cx="12" cy="12" r="5" />
         <g>
           <line x1="12" y1="1.5" x2="12" y2="3.5" />
           <line x1="12" y1="20.5" x2="12" y2="22.5" />
           <line x1="4.22" y1="4.22" x2="5.7" y2="5.7" />
           <line x1="18.3" y1="18.3" x2="19.78" y2="19.78" />
           <line x1="1.5" y1="12" x2="3.5" y2="12" />
           <line x1="20.5" y1="12" x2="22.5" y2="12" />
           <line x1="4.22" y1="19.78" x2="5.7" y2="18.3" />
           <line x1="18.3" y1="5.7" x2="19.78" y2="4.22" />
         </g>
       </svg>`
    : `<svg width="22" height="22" viewBox="0 0 24 24" fill="#23272f" stroke="#ffd166">
         <path d="M21 12.79A9 9 0 0 1 12.79 3a7 7 0 1 0 8.21 9.79z" />
       </svg>`;
  themeToggleBtn.setAttribute(
    "aria-label",
    theme === "light" ? "Switch to dark mode" : "Switch to light mode"
  );
}
// --------- EVENT HANDLING -----------
async function handleSend(e) {
  if (e) e.preventDefault();
  const userMsg = inputBox.value.trim();
  if (!userMsg || submitting) return;

  chatMessages.push({ sender: "user", text: userMsg, isTyping: false });
  inputBox.value = "";
  submitting = true;
  aiIsTyping = true;
  updateErrorBar(null);
  setUIEnabled(false);
  renderMessages();

  try {
    const aiReply = await sendToDeepSeekApi(userMsg);
    await animateTyping(aiReply, (currentlyTyped) => {
      // each tick: update bubble for last AI message
      if (chatMessages.length && chatMessages[chatMessages.length - 1].sender === "ai" && chatMessages[chatMessages.length - 1].isTyping)
        chatMessages.pop();
      chatMessages.push({ sender: "ai", text: currentlyTyped, isTyping: true });
      renderMessages();
    });
    if (chatMessages.length && chatMessages[chatMessages.length - 1].sender === "ai")
      chatMessages[chatMessages.length - 1].isTyping = false;
    aiIsTyping = false;
    setUIEnabled(true);
    renderMessages();
    // Optionally: vibrate or beep
    if (window.navigator.vibrate) window.navigator.vibrate(30);
  } catch (err) {
    updateErrorBar(err.message || "Something went wrong!");
    aiIsTyping = false;
    setUIEnabled(true);
  } finally {
    submitting = false;
  }
}
async function handleRetry() {
  updateErrorBar(null);
  submitting = false;
  setUIEnabled(false);
  // Remove incomplete last AI bubble
  if (chatMessages.length && chatMessages[chatMessages.length-1].sender === "ai")
    chatMessages.pop();
  // try with the last user message
  const lastUserMsg =
    chatMessages.length > 0 && chatMessages[chatMessages.length-1].sender === "user"
      ? chatMessages[chatMessages.length-1].text
      : null;
  if (!lastUserMsg) { setUIEnabled(true); return; }
  aiIsTyping = true;
  renderMessages();
  try {
    const aiReply = await sendToDeepSeekApi(lastUserMsg);
    await animateTyping(aiReply, (currentlyTyped) => {
      if (chatMessages.length && chatMessages[chatMessages.length - 1].sender === "ai" && chatMessages[chatMessages.length - 1].isTyping)
        chatMessages.pop();
      chatMessages.push({ sender: "ai", text: currentlyTyped, isTyping: true });
      renderMessages();
    });
    if (chatMessages.length && chatMessages[chatMessages.length - 1].sender === "ai")
      chatMessages[chatMessages.length - 1].isTyping = false;
    aiIsTyping = false;
    setUIEnabled(true);
    renderMessages();
    if (window.navigator.vibrate) window.navigator.vibrate(28);
  } catch (err) {
    updateErrorBar(err.message || "Something went wrong!");
    aiIsTyping = false;
    setUIEnabled(true);
  } finally {
    submitting = false;
  }
}
function handleClear() {
  chatMessages = [...initialMessages];
  aiIsTyping = false;
  submitting = false;
  updateErrorBar(null);
  setUIEnabled(true);
  renderMessages();
  inputBox.value = "";
}
function handleThemeToggle() {
  theme = theme === "light" ? "dark" : "light";
  window.localStorage.setItem("theme", theme);
  renderTheme();
}
// ---- Keyboard Handling ----
inputBox.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});
// --- Buttons ---
sendBtn.addEventListener("click", handleSend);
form.addEventListener("submit", handleSend);
clearBtn.addEventListener("click", handleClear);
retryBtn.addEventListener("click", handleRetry);
resetBtn.addEventListener("click", handleClear);
themeToggleBtn.addEventListener("click", handleThemeToggle);

// ----------- Chat AI API Integration ----------
async function sendToDeepSeekApi(question) {
  // Compose messages array as expected by DeepSeek
  const messages = [
    { role: "system", content: "You are a helpful AI assistant named TalkBuddy." },
    ...chatMessages
      .filter(m => m.sender === "user" || m.sender === "ai")
      .map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      })),
    { role: "user", content: question }
  ];
  // See: https://models.github.ai/api#operation/ChatCompletions_create
  const resp = await fetch(`${DEEPSEEK_ENDPOINT}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": DEEPSEEK_API_KEY
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      temperature: 0.8,
      top_p: 0.1,
      max_tokens: 2048
    })
  });
  if (!resp.ok) {
    let detail = "";
    try { detail = (await resp.json()).error?.message || ""; } catch { /* ignore */ }
    throw new Error(
      "DeepSeek API error: " + (resp.statusText || "Unknown failure.") + (detail ? ` (${detail})` : "")
    );
  }
  const data = await resp.json();
  if (!data.choices || !data.choices[0]?.message?.content)
    throw new Error("Invalid DeepSeek response format.");
  return data.choices[0].message.content.trim();
}

// ----------- Typing Animation ------------
async function animateTyping(fullText, onUpdate) {
  let displayed = "";
  for (let t = 0; t <= fullText.length; t++) {
    displayed = fullText.slice(0, t);
    onUpdate(displayed);
    // Responsive typing speed
    await new Promise(res => setTimeout(res, 11 + Math.random() * 17));
  }
}

// ----------- Initialization -------------
function init() {
  renderTheme();
  renderMessages();
  setUIEnabled(true);
  updateErrorBar(null);
}
init();

// For demo: Paste on focus will focus textarea
chatBody.addEventListener("click", () => { inputBox.focus(); });

/* --- Accessibility: ARIA roles are used for live region (chatBody, errorBar etc.) --- */

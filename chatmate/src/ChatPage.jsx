import React, { useRef, useState, useEffect } from "react";
import "./ChatPage.css";

// PUBLIC_INTERFACE
/**
 * ChatPage component for AI chatting (TalkBuddy)
 * Features:
 * - Modern, floating chat container with stylish bubbles
 * - Alternating user/AI bubbles w/ avatar for AI
 * - Light/dark mode, animated AI typing, error/retry/reset/clear actions
 * - Input with send button, "Enter" to send, loading state, scroll-to-bottom
 * - Placeholder call for OpenAI integration
 */
function ChatPage() {
  // Message { sender: "ai" | "user", text: string, error?: string }
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "👋 Hi there! I'm TalkBuddy AI. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(() =>
    window.localStorage.getItem("theme") === "dark" ? "dark" : "light"
  );

  const chatBodyRef = useRef(null);

  // PUBLIC_INTERFACE
  /** Fake OpenAI API placeholder (simulate latency/error) */
  async function sendToAiApi(question) {
    // This simulates a streaming/typing effect for AI
    // (Replace with actual OpenAI fetch logic in production)
    await new Promise((res) => setTimeout(res, 450));
    if (question.toLowerCase().includes("fail")) {
      // Force error if user says "fail"
      throw new Error("Network error! Try again?");
    }
    // Simple completion for demo
    return (
      "Echo: " +
      question +
      " " +
      ["🙂", "🤔", "🤖", "💡", "🎉"][Math.floor(Math.random() * 5)]
    );
  }

  // Handles input (send message)
  const handleSend = async () => {
    if (!input.trim() || submitting) return;
    // Optimistically add user message
    setMessages((msgs) => [
      ...msgs,
      { sender: "user", text: input.trim() },
    ]);
    setInput("");
    setSubmitting(true);
    setAiIsTyping(true);
    setError(null);

    try {
      const userMsg = input.trim();
      // Simulate OpenAI logic
      const response = await sendToAiApi(userMsg);

      // Animate "AI is typing", then reveal
      for (let t = 0; t <= response.length; t++) {
        await new Promise((res) => setTimeout(res, 24 + Math.random() * 18));
        if (t === response.length) {
          setMessages((msgs) => [
            ...msgs,
            { sender: "ai", text: response },
          ]);
          setAiIsTyping(false);
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong!");
      setAiIsTyping(false);
      // Remove temp user message if you want, otherwise leave for retry
    } finally {
      setSubmitting(false);
    }
  };

  // Enter key support
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Scroll to bottom when message added or AI is typing
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, aiIsTyping]);

  // Retry AI response after error
  const handleRetry = async () => {
    setError(null);
    if (messages[messages.length - 1]?.sender === "user") {
      // Re-send last user message
      setSubmitting(false);
      setInput(""); // Already there
      await handleSend();
    }
  };

  // Reset/clear
  const handleClear = () => {
    setMessages([
      { sender: "ai", text: "👋 Hi there! I'm TalkBuddy AI. How can I help you today?" }
    ]);
    setInput("");
    setError(null);
    setAiIsTyping(false);
    setSubmitting(false);
    // Optionally add focus logic here
  };

  // Theme (light/dark) support - optional for isolation, handled globally by Navbar etc. too
  useEffect(() => {
    document.body.classList.toggle("dark-mode", theme === "dark");
    document.body.classList.toggle("light-mode", theme === "light");
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === "light" ? "dark" : "light"));

  // Animated floating bot avatar
  function FloatingBotAvatar() {
    return (
      <span className="bot-avatar" role="img" aria-label="Bot">
        <svg
          width="38"
          height="38"
          viewBox="0 0 40 40"
          fill="none"
          style={{
            filter: "drop-shadow(0 2.5px 12px #4f8cff32)",
            animation: "floatBot 2.18s ease-in-out infinite alternate",
            verticalAlign: "bottom"
          }}
        >
          <circle cx="20" cy="20" r="18" fill="#4f8cff" stroke="#fff" strokeWidth="2"/>
          <ellipse cx="20" cy="21.3" rx="11.7" ry="10.2" fill="#dae6fa"/>
          <ellipse cx="20" cy="24.8" rx="6.1" ry="3.1" fill="#bdd1f1" opacity="0.55"/>
          <circle cx="16.8" cy="19.2" r="2.1" fill="#23272f"/>
          <circle cx="23.2" cy="19.2" r="2.1" fill="#23272f"/>
          <rect x="16" y="25.7" width="8" height="2.5" rx="1.1" fill="#b7bfd8"/>
        </svg>
      </span>
    );
  }

  // Message bubble rendering
  const renderMessage = (msg, idx) => (
    <div
      key={idx}
      className={
        "tp-chat-bubble " +
        (msg.sender === "user" ? "bubble-user" : "bubble-ai")
      }
      aria-live="polite"
    >
      {msg.sender === "ai" && (
        <span className="bubble-avatar">
          <FloatingBotAvatar />
        </span>
      )}
      <span className="bubble-text">{msg.text}</span>
    </div>
  );

  // Stylized input button, loading spinner and error
  return (
    <div className={`tp-chat-outer ${theme}`}>
      <div className="tp-chat-wrap">
        {/* Theme toggle - optional here */}
        <div className="tp-header-bar">
          <span className="tp-header-title">
            <FloatingBotAvatar />{" "}
            TalkBuddy <span className="tp-header-ai-sub">AI Chat</span>
          </span>
          <button
            className="tp-theme-toggle"
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
            onClick={toggleTheme}
          >
            {theme === "light" ? (
              // sun
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffd166" stroke="#ffd166"><circle cx="12" cy="12" r="5" /><g><line x1="12" y1="1.5" x2="12" y2="3.5" /><line x1="12" y1="20.5" x2="12" y2="22.5" /><line x1="4.22" y1="4.22" x2="5.7" y2="5.7" /><line x1="18.3" y1="18.3" x2="19.78" y2="19.78" /><line x1="1.5" y1="12" x2="3.5" y2="12" /><line x1="20.5" y1="12" x2="22.5" y2="12" /><line x1="4.22" y1="19.78" x2="5.7" y2="18.3" /><line x1="18.3" y1="5.7" x2="19.78" y2="4.22" /></g></svg>
            ) : (
              // moon
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#23272f" stroke="#ffd166"><path d="M21 12.79A9 9 0 0 1 12.79 3a7 7 0 1 0 8.21 9.79z" /></svg>
            )}
          </button>
        </div>
        <div className="tp-chat-body" ref={chatBodyRef}>
          {messages.map((msg, idx) => renderMessage(msg, idx))}
          {/* AI typing bubble/animation */}
          {aiIsTyping && (
            <div className="tp-chat-bubble bubble-ai bubble-typing">
              <span className="bubble-avatar">
                <FloatingBotAvatar />
              </span>
              <span className="bubble-text">
                <span className="typing-dots">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </span>
              </span>
            </div>
          )}
        </div>
        {/* Error message/retry */}
        {error && (
          <div className="tp-error-bar" role="alert">
            <span className="tp-error-msg">
              {error}
            </span>
            <button className="tp-btn tp-btn-retry" onClick={handleRetry}>
              Retry
            </button>
            <button className="tp-btn tp-btn-clear" onClick={handleClear}>
              Reset
            </button>
          </div>
        )}
        {/* Input area */}
        <form
          className="tp-chat-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          autoComplete="off"
        >
          <textarea
            className="tp-input-box"
            placeholder={submitting ? "Waiting for AI..." : "Type a message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={submitting}
            rows={1}
            maxLength={1200}
            tabIndex={0}
            aria-label="Your message"
          ></textarea>
          <button
            className="tp-btn tp-btn-send"
            type="submit"
            aria-label="Send message"
            disabled={!input.trim() || submitting}
          >
            {submitting ? (
              <span className="tp-loader"></span>
            ) : (
              <span>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </span>
            )}
          </button>
          <button
            className="tp-btn tp-btn-clear-alt"
            type="button"
            onClick={handleClear}
            tabIndex={0}
            aria-label="Clear chat"
            disabled={submitting}
          >
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#E87A41" strokeWidth="1.4"/><path d="M7 7l6 6m0-6l-6 6" stroke="#E87A41" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatPage;

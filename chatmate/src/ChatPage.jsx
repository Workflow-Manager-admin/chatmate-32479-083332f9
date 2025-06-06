import React, { useRef, useState, useEffect } from "react";
import "./ChatPage.css";

// PUBLIC_INTERFACE
/**
 * ChatPage component for AI chatting (TalkBuddy)
 * - Message bubbles (animated, alternating, fully themed)
 * - Input (rounded, styled), send, clear/reset
 * - Loading indicator, error w/ retry/reset
 * - Light/dark support
 * - Animated AI typing, bot avatar, sound effect hooks
 * - Secure OpenAI API integration (API key from environment)
 */
import { sendDeepSeekChat } from "./ModelClient";

function ChatPage() {
  // { sender: "ai" | "user", text: string, error?: string }
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
  const [theme, setTheme] = useState(
    () =>
      window.localStorage.getItem("theme") ||
      (window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
  );

  const chatBodyRef = useRef(null);

  // PUBLIC_INTERFACE
  /**
   * Send user question to DeepSeek API using @azure-rest/ai-inference ModelClient.
   * Uses REACT_APP_GITHUB_TOKEN from environment (never commit your key!)
   * Returns the AI response string or throws error.
   */
  import { sendDeepSeekChat } from "./ModelClient";

  async function sendToDeepSeekApi(question) {
    // Compose DeepSeek "messages" array as expected by the API
    const deepSeekMessages = [
      { role: "system", content: "You are a helpful AI assistant named TalkBuddy." },
      ...messages
        .filter((m) => ["user", "ai"].includes(m.sender))
        .map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        })),
      { role: "user", content: question },
    ];

    // Use typical temperature etc. (keep near OpenAI for feature parity)
    return await sendDeepSeekChat(deepSeekMessages, {
      // DeepSeek model settings (optional): temperature, top_p, max_tokens
      temperature: 0.8,
      top_p: 0.1,
      max_tokens: 2048,
    });
  }

  // Placeholder for playing UI sound
  function playBotReplySound() {
    // PUBLIC_INTERFACE
    // e.g. new Audio("/assets/reply.mp3").play();
    // For placeholder, use webapi beep (does nothing in most browsers by default)
    // window.navigator.vibrate?.(60); // On mobile, can vibrate
    // To add: expose a prop/callback for parent sound control
  }

  // Handles input (send message)
  const handleSend = async () => {
    if (!input.trim() || submitting) return;
    setMessages((msgs) => [
      ...msgs,
      { sender: "user", text: input.trim() },
    ]);
    setInput("");
    setSubmitting(true);
    setAiIsTyping(true);
    setError(null);

    const userMsg = input.trim();

    try {
      // Call DeepSeek API
      const aiReply = await sendToDeepSeekApi(userMsg);

      // Typing animation: reveal gradually, char by char
      await animateTyping(aiReply, (displayed) => {
        setMessages((msgs) => {
          // Remove temp typing if present, then append displayed text
          const existing = [...msgs];
          // Remove last incomplete AI reply bubble (if any)
          if (
            existing.length > 0 &&
            existing[existing.length - 1].sender === "ai" &&
            (existing[existing.length - 1].isTyping || false)
          ) {
            existing.pop();
          }
          return [
            ...existing,
            {
              sender: "ai",
              text: displayed,
              isTyping: true,
            },
          ];
        });
      });
      setMessages((msgs) => {
        // Finalize: set last AI bubble to non-typing
        if (
          msgs.length > 0 &&
          msgs[msgs.length - 1].sender === "ai"
        ) {
          const next = [...msgs];
          next[next.length - 1] = { ...next[next.length - 1], isTyping: false };
          return next;
        }
        return msgs;
      });
      setAiIsTyping(false);
      setError(null);
      playBotReplySound();
    } catch (err) {
      setError(err.message || "Something went wrong!");
      setAiIsTyping(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Animate AI typing (character by character) with optional sound
  // PUBLIC_INTERFACE
  async function animateTyping(fullText, onUpdate) {
    let displayed = "";
    for (let t = 0; t <= fullText.length; t++) {
      displayed = fullText.slice(0, t);
      onUpdate(displayed);
      // Optionally, add tick/beep sound per char
      await new Promise((res) => setTimeout(res, 12 + Math.random() * 18));
    }
  }

  // Enter key support
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Scroll to bottom for new messages or AI typing
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, aiIsTyping]);

  // Retry AI response after error (retries last user message)
  const handleRetry = async () => {
    setError(null);
    setSubmitting(false);
    setInput(""); // Already included
    // Remove last AI error (if any)
    setMessages((msgs) => {
      const temp = [...msgs];
      // Remove the AI error bubble (if present as last)
      if (
        temp.length > 0 &&
        temp[temp.length - 1].sender === "ai" &&
        temp[temp.length - 1].isTyping
      ) {
        temp.pop();
      }
      return temp;
    });
    setAiIsTyping(true);
    // Try last user message again
    const userMsg =
      messages.length > 0 && messages[messages.length - 1].sender === "user"
        ? messages[messages.length - 1].text
        : null;
    if (userMsg) {
      try {
        const aiReply = await sendToDeepSeekApi(userMsg);
        await animateTyping(aiReply, (displayed) => {
          setMessages((msgs) => {
            // Remove incomplete AI bubble, then append displayed text
            const existing = [...msgs];
            if (
              existing.length > 0 &&
              existing[existing.length - 1].sender === "ai" &&
              (existing[existing.length - 1].isTyping || false)
            ) {
              existing.pop();
            }
            return [
              ...existing,
              {
                sender: "ai",
                text: displayed,
                isTyping: true,
              },
            ];
          });
        });
        setMessages((msgs) => {
          // Finalize: set last AI bubble to non-typing
          if (
            msgs.length > 0 &&
            msgs[msgs.length - 1].sender === "ai"
          ) {
            const next = [...msgs];
            next[next.length - 1] = { ...next[next.length - 1], isTyping: false };
            return next;
          }
          return msgs;
        });
        setError(null);
        setAiIsTyping(false);
        playBotReplySound();
      } catch (err) {
        setError(err.message || "Something went wrong!");
        setAiIsTyping(false);
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Clear/reset: back to welcome
  const handleClear = () => {
    setMessages([
      {
        sender: "ai",
        text: "👋 Hi there! I'm TalkBuddy AI. How can I help you today?",
      },
    ]);
    setInput("");
    setError(null);
    setAiIsTyping(false);
    setSubmitting(false);
  };

  // Theme (light/dark) support
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
    }
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === "light" ? "dark" : "light"));

  // PUBLIC_INTERFACE
  // Animated floating bot avatar (SVG)
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

  // Message bubble rendering (with animation for new messages)
  const renderMessage = (msg, idx) => (
    <div
      key={idx}
      className={
        "tp-chat-bubble " +
        (msg.sender === "user" ? "bubble-user" : "bubble-ai") +
        (msg.isTyping ? " bubble-typing" : "")
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

  // AI typing indicator: animated dots
  function TypingAnimationBubble() {
    return (
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
    );
  }

  return (
    <div className={`tp-chat-outer ${theme}`}>
      <div className="tp-chat-wrap">
        {/* Header Bar */}
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffd166" stroke="#ffd166">
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
              </svg>
            ) : (
              // moon
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#23272f" stroke="#ffd166">
                <path d="M21 12.79A9 9 0 0 1 12.79 3a7 7 0 1 0 8.21 9.79z" />
              </svg>
            )}
          </button>
        </div>
        {/* Chat Messages */}
        <div className="tp-chat-body" ref={chatBodyRef}>
          {messages.map((msg, idx) => renderMessage(msg, idx))}
          {aiIsTyping && <TypingAnimationBubble />}
        </div>
        {/* Error message with retry/reset */}
        {error && (
          <div className="tp-error-bar" role="alert">
            <span className="tp-error-msg">{error}</span>
            <button className="tp-btn tp-btn-retry" onClick={handleRetry} disabled={submitting}>
              Retry
            </button>
            <button className="tp-btn tp-btn-clear" onClick={handleClear} disabled={submitting}>
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

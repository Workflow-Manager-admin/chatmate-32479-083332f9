import React, { useState, useRef, useEffect } from "react";
import "./ChatPage.css";
import Navbar from "./Navbar";
import { sendToDeepSeek } from "./ModelClient";

// PUBLIC_INTERFACE
/**
 * TalkBuddy Chat Page - main AI chat experience with DeepSeek API integration.
 */
function ChatPage() {
  // Message structure: { role: "user"|"assistant", content: "..." }
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hello! I'm TalkBuddy AI. Ask me anything, or just chat with me!",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const chatBottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new message or loading
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Focus input when component loads or after sending
  useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, [loading]);

  // PUBLIC_INTERFACE
  /** Handles sending user message and getting DeepSeek reply */
  async function handleSend(e) {
    e && e.preventDefault();
    if (!inputVal.trim() || loading) return;
    setErrorMsg("");
    const userMsg = { role: "user", content: inputVal.trim() };
    const newMsgList = [...messages, userMsg];
    setMessages(newMsgList);
    setLoading(true);
    setInputVal("");
    try {
      const aiReply = await sendToDeepSeek(newMsgList);
      setMessages((prev) => [...prev, { role: "assistant", content: aiReply }]);
    } catch (err) {
      let fallback =
        "Sorry, I couldn't get a response from DeepSeek. Please try again.";
      if (err.message && err.message.includes("401"))
        fallback =
          "Unauthorized: Check API key setup (.env) or contact admin for access.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: fallback },
      ]);
      setErrorMsg(err.message || "Network or API error");
    }
    setLoading(false);
  }

  // PUBLIC_INTERFACE
  /** Handles Enter-to-send and shift+Enter for multiline input */
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Style helpers for bubbles per role...
  function bubbleClass(role) {
    return role === "user" ? "chat-bubble user" : "chat-bubble ai";
  }
  function showAvatar(role) {
    return (
      role === "assistant" && (
        <span className="ai-avatar" title="TalkBuddy AI" aria-label="AI">
          🤖
        </span>
      )
    );
  }

  // Theme ALREADY handled by Navbar; CSS handles bg per body mode

  return (
    <div className="chat-page-root">
      <Navbar />
      <main className="tb-chat-main">
        {/* Chat Area */}
        <section className="tb-chat-message-wrap" aria-live="polite">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={bubbleClass(msg.role)}
              aria-label={msg.role === "user" ? "You" : "AI"}
            >
              {showAvatar(msg.role)}
              <span className="bubble-text">{msg.content}</span>
            </div>
          ))}
          {/* Loading bubble */}
          {loading && (
            <div className="chat-bubble ai">
              <span className="ai-avatar" title="TalkBuddy AI loading">
                🤖
              </span>
              <span className="bubble-text">
                <span className="msg-loader">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </span>
              </span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </section>
        {/* Input Area */}
        <form className="tb-chat-input-wrap" onSubmit={handleSend}>
          <textarea
            ref={inputRef}
            className="tb-chat-input"
            rows={1}
            maxLength={700}
            placeholder={
              loading
                ? "Waiting for AI response..."
                : "Type a message... (Shift+Enter = newline)"
            }
            value={inputVal}
            disabled={loading}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Chat message"
            autoFocus
          />
          <button
            className="tb-send-btn"
            type="submit"
            disabled={!inputVal.trim() || loading}
            aria-label="Send message"
          >
            <svg
              width={24}
              height={24}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="send-icon"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </form>
        {/* Error message (optional) */}
        {errorMsg && <div className="tb-chat-error">{errorMsg}</div>}
      </main>
    </div>
  );
}

export default ChatPage;

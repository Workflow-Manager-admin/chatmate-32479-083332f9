import React, { useRef } from "react";
import "./LandingPage.css";
import Navbar from "./Navbar";

// PUBLIC_INTERFACE
/**
 * TalkBuddy Landing Page - visually engaging, theme-aware landing for TalkBuddy.
 */
function LandingPage() {
  const getStartedRef = useRef();

  // PUBLIC_INTERFACE
  /** Handles CTA/hero "Start Chatting" scroll. */
  const handleStartChatting = (e) => {
    e.preventDefault();
    if (getStartedRef.current) {
      getStartedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Small fake chat preview
  const fakeChat = [
    { sender: "ai", text: "👋 Hi! I'm TalkBuddy. How can I assist you today?" },
    { sender: "user", text: "Can you help me brainstorm a startup idea?" },
    { sender: "ai", text: "Absolutely! Let's get creative. Do you have any interests or industries in mind?" }
  ];

  return (
    <div className="tb-landing-wrap">
      <Navbar />
      {/* --- Hero Section --- */}
      <section className="tb-hero">
        <div className="tb-hero-title-anim">
          <h1 className="tb-hero-title animated-type">
            Meet Your <span className="tb-gradient-text">AI Chat Buddy</span>
          </h1>
        </div>
        <div className="tb-hero-sub">Conversational AI, always ready to talk, brainstorm, or just listen.</div>
        <button
          className="tb-cta-btn pulse-btn"
          onClick={handleStartChatting}
          tabIndex={0}
        >
          <span>Start Chatting</span>
          <span className="tb-btn-arrow">→</span>
        </button>
      </section>
      {/* --- Features Section --- */}
      <section className="tb-features">
        <div className="tb-features-title">Why TalkBuddy?</div>
        <div className="tb-feature-card-wrap">
          <div className="tb-feature-card">
            <span className="tb-feature-emoji" role="img" aria-label="AI">🧠</span>
            <div className="tb-feature-head">Powered by DeepSeek & OpenAI</div>
            <div className="tb-feature-desc">Smart, helpful AI for any topic.</div>
          </div>
          <div className="tb-feature-card">
            <span className="tb-feature-emoji" role="img" aria-label="Light/Dark">🌗</span>
            <div className="tb-feature-head">Light & Dark Mode</div>
            <div className="tb-feature-desc">Matches your mood or system theme, day or night.</div>
          </div>
          <div className="tb-feature-card">
            <span className="tb-feature-emoji" role="img" aria-label="No Login">💬</span>
            <div className="tb-feature-head">No Sign-Up Required</div>
            <div className="tb-feature-desc">Jump into conversation—no hassle, no barrier.</div>
          </div>
          <div className="tb-feature-card">
            <span className="tb-feature-emoji" role="img" aria-label="Fast UI">⚡</span>
            <div className="tb-feature-head">Fast, Friendly Interface</div>
            <div className="tb-feature-desc">Slick, responsive UI built for ease and speed.</div>
          </div>
        </div>
      </section>
      {/* --- Fake Chat Preview Section --- */}
      <section className="tb-preview-section">
        <div className="tb-preview-title">See It in Action</div>
        <div className="tb-preview-chat">
          {fakeChat.map((msg, idx) => (
            <div
              key={idx}
              className={`tb-chatbubble tb-chatbubble-${msg.sender}`}
              aria-live="polite"
            >
              {msg.text}
            </div>
          ))}
        </div>
      </section>
      {/* --- Get Started Section (CTA) --- */}
      <section className="tb-get-started" ref={getStartedRef}>
        <div className="tb-gs-content">
          <div className="tb-gs-title">
            Ready to chat? <span className="tb-gs-gradient">Get started in seconds!</span>
          </div>
          <a
            href="#"
            className="tb-gs-btn"
            aria-label="Start Chatting Now"
            tabIndex={0}
          >
            <span className="tb-gs-btn-text">Chat Now</span>
            <span className="tb-gs-btn-arrow">→</span>
          </a>
        </div>
      </section>
      {/* --- Footer --- */}
      <footer className="tb-footer">
        <nav className="tb-footer-links">
          <a href="#" className="tb-footer-link">About</a>
          <span className="tb-footer-sep">|</span>
          <a href="#" className="tb-footer-link">Help</a>
          <span className="tb-footer-sep">|</span>
          <a href="#" className="tb-footer-link">Contact</a>
        </nav>
        <div className="tb-footer-copy">
          © 2025 TalkBuddy
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

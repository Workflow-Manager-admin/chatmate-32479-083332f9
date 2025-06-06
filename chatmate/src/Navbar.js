import React, { useState, useEffect } from "react";
import "./Navbar.css";
// Import Link from react-router-dom if available
let Link;
try {
  // eslint-disable-next-line
  Link = require("react-router-dom").Link;
} catch (e) {
  Link = null;
}

// PUBLIC_INTERFACE
/**
 * TalkBuddy Navbar component.
 * Responsive, theme-aware bar with logo, links, frosted glass background, and light/dark mode toggle.
 * @returns {JSX.Element}
 */
function Navbar() {
  // Store theme in local state and localStorage for persistence
  const [theme, setTheme] = useState(
    () =>
      window.localStorage.getItem("theme") ||
      (window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
  );

  // Apply theme to <body> for global coloring
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

  // PUBLIC_INTERFACE
  /** Toggle theme handler */
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  // PUBLIC_INTERFACE
  /** Navigation link list */
  const navLinks = [
    { label: "Chat", href: "/chat" },
    { label: "About", href: "/about" },
    { label: "Help", href: "/help" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <nav className={`talkbuddy-navbar${theme === "dark" ? " dark" : " light"}`}>
      <div className="navbar-content">
        {/* Logo + Icon */}
        <div className="navbar-left">
          {
            Link ? (
              <Link
                to="/"
                style={{ textDecoration: "none", display: "flex", alignItems: "center", color: "inherit" }}
                aria-label="Go to home page"
                tabIndex={0}
              >
                <span className="chat-icon" aria-hidden="true">
                  {/* Simple chat bubble SVG icon */}
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--tb-primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginRight: 7, verticalAlign: "middle" }}
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <span className="app-title">TalkBuddy</span>
              </Link>
            ) : (
              <a
                href="/"
                style={{ textDecoration: "none", display: "flex", alignItems: "center", color: "inherit" }}
                aria-label="Go to home page"
                tabIndex={0}
              >
                <span className="chat-icon" aria-hidden="true">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--tb-primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginRight: 7, verticalAlign: "middle" }}
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <span className="app-title">TalkBuddy</span>
              </a>
            )
          }
        </div>
        {/* Navigation links */}
        <div className="navbar-links">
          {navLinks.map((link) =>
            Link ? (
              <Link
                className="navbar-link"
                key={link.label}
                to={link.href}
                tabIndex={0}
                aria-current={window.location.pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ) : (
              <a
                className="navbar-link"
                key={link.label}
                href={link.href}
                tabIndex={0}
              >
                {link.label}
              </a>
            )
          )}
        </div>
        {/* Theme toggle */}
        <div className="navbar-right">
          <button
            className="theme-toggle"
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
            onClick={toggleTheme}
          >
            {/* Toggle knob w/ sun/moon icon */}
            <span
              className={`toggle-track${theme === "dark" ? " toggled" : ""}`}
            >
              <span className="toggle-knob">
                {theme === "light" ? (
                  // Sun icon
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="var(--tb-yellow)"
                    stroke="var(--tb-yellow)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ display: "block" }}
                  >
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
                  // Moon icon
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="var(--tb-accent)"
                    stroke="var(--tb-accent)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12.79A9 9 0 0 1 12.79 3a7 7 0 1 0 8.21 9.79z" />
                  </svg>
                )}
              </span>
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

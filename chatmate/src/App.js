import React from 'react';
import './App.css';
import Navbar from './Navbar';
import LandingPage from './LandingPage';
import ChatPage from './ChatPage.jsx';

// Placeholder stub pages for About, Help, and Contact
function AboutPage() {
  // PUBLIC_INTERFACE
  /** About page - stub */
  return (
    <div style={{padding: "100px 24px 24px 24px", minHeight: "60vh", textAlign: "center"}}>
      <h2>About TalkBuddy</h2>
      <p>TalkBuddy is a modern, AI-powered chat app for everyone. More info coming soon!</p>
    </div>
  );
}

function HelpPage() {
  // PUBLIC_INTERFACE
  /** Help page - stub */
  return (
    <div style={{padding: "100px 24px 24px 24px", minHeight: "60vh", textAlign: "center"}}>
      <h2>Help &amp; Support</h2>
      <p>Need help? This page will offer guidance and FAQs shortly.</p>
    </div>
  );
}

function ContactPage() {
  // PUBLIC_INTERFACE
  /** Contact page - stub */
  return (
    <div style={{padding: "100px 24px 24px 24px", minHeight: "60vh", textAlign: "center"}}>
      <h2>Contact</h2>
      <p>Contact details or form will be added here.</p>
    </div>
  );
}

// Attempt to import react-router-dom if available
let BrowserRouter, Routes, Route, Navigate;
try {
  // Dynamically require for hot reload support
  // (in actual build, will always succeed if installed)
  // eslint-disable-next-line
  const rrd = require('react-router-dom');
  BrowserRouter = rrd.BrowserRouter;
  Routes = rrd.Routes;
  Route = rrd.Route;
  Navigate = rrd.Navigate;
} catch (e) {
  // router not installed - placeholder fallback (should not trigger)
  BrowserRouter = ({children}) => <React.Fragment>{children}</React.Fragment>;
  Routes = ({children}) => <React.Fragment>{children}</React.Fragment>;
  // eslint-disable-next-line
  Route = ({element}) => element;
  Navigate = () => null;
}

// PUBLIC_INTERFACE
/** Main TalkBuddy app with Navbar + page routing (landing, chat, about, help, contact), light/dark mode universal */
function App() {
  // Set up theme re-application so stubs also work with light/dark mode
  // (Theme management is handled in Navbar, and on ChatPage, so nothing new is needed here)
  return (
    <BrowserRouter>
      <div className="app">
        {/* Always show Navbar on every route */}
        <Navbar />
        <div style={{paddingTop: 66, minHeight: '100vh'}}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/contact" element={<ContactPage />} />
            {/* Default: if route not found, redirect home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
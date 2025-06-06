import React from 'react';
import './App.css';

// PUBLIC_INTERFACE
/** Renders the TalkBuddy main app container (no ChatPage integration) */
function App() {
  return (
    <div className="app">
      <div style={{
        textAlign: "center",
        marginTop: "25vh",
        color: "#4F8CFF",
        fontSize: "2rem"
      }}>
        Welcome to TalkBuddy!
      </div>
    </div>
  );
}

export default App;
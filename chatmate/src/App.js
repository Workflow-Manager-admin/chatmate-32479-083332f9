import React from 'react';
import './App.css';

// PUBLIC_INTERFACE
/** Renders the TalkBuddy main app container (ChatPage removed) */
function App() {
  return (
    <div className="app">
      {/* ChatPage has been removed. You can add alternative content here. */}
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
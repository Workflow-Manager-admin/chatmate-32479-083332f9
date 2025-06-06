import React from 'react';
import './App.css';
import Navbar from './Navbar';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <div className="container" style={{ paddingTop: 94 }}>
          <div className="hero">
            <div className="subtitle">AI Workflow Manager Template</div>
            <h1 className="title">chatmate</h1>
            <div className="description">
              Start building your application.
            </div>
            <button className="btn btn-large">Button</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
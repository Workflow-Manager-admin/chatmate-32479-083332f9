import React from 'react';
import './App.css';
import Navbar from './Navbar';
import LandingPage from './LandingPage';
import ChatPage from './ChatPage.jsx';

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
/** Main TalkBuddy app with Navbar + page routing (landing, chat), light/dark mode universal */
function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <div style={{paddingTop: 66, minHeight: '100vh'}}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/chat" element={<ChatPage />} />
            {/* Default: if route not found, redirect home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
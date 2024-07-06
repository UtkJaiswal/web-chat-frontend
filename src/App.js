// src/App.js

import React from 'react';
import './App.css';
import Chat from './components/Chat';
import './components/Chat.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Chat Application</h1>
      </header>
      <Chat />
    </div>
  );
}

export default App;

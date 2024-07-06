import React, { useEffect, useState, useRef } from 'react';

const API_URL = 'http://localhost:1337';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [token, setToken] = useState(localStorage.getItem('jwt') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    if (token) {
      fetchMessages();
      initializeWebSocket();
    }

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, [token]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat-messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setMessages(data.data.map((item) => item.attributes.message));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const initializeWebSocket = () => {
    ws.current = new WebSocket(`ws://localhost:1337/websocket?token=${token}`);

    ws.current.onopen = () => console.log('WebSocket connection established');
    ws.current.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };
    ws.current.onclose = () => console.log('WebSocket connection closed');
    ws.current.onerror = (error) => console.error('WebSocket error:', error);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (ws.current && ws.current.readyState === WebSocket.OPEN && inputValue.trim()) {
      ws.current.send(inputValue);
      setInputValue('');
    }
  };

  const handleAuth = async (isRegister) => {
    const endpoint = isRegister ? 'auth/local/register' : 'auth/local';
    const body = isRegister
      ? { username, email: username, password }
      : { identifier: username, password };

    try {
      const response = await fetch(`${API_URL}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (data.jwt) {
        setToken(data.jwt);
        localStorage.setItem('jwt', data.jwt);
      } else {
        console.error('Authentication failed:', data);
      }
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  };

  if (!token) {
    return (
      <div className="auth-container">
        <h2>Register/Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={() => handleAuth(true)}>Register</button>
        <button onClick={() => handleAuth(false)}>Login</button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="message-list">
        {messages.map((message, index) => (
          <div key={index} className="message">{message}</div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
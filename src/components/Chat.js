import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Chat.css';

const API_URL = 'http://localhost:1337';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [token, setToken] = useState(localStorage.getItem('jwt') || '');
  const [userId, setUserId] = useState(null);
  const ws = useRef(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserId(decodedToken.id);
      fetchMessages();
      initializeWebSocket();
    } else {
      navigate('/login');
    }

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, [token, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat-messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const formattedMessages = data.data.flatMap((item, index) => {
        const messageData = JSON.parse(item.attributes.message);
        return [
          {
            id: `${index}-sent`,
            message: messageData.message,
            createdBy: messageData.user,
            isCurrentUser: true
          },
          {
            id: `${index}-received`,
            message: messageData.message,
            createdBy: messageData.user,
            isCurrentUser: false
          }
        ];
      });
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const initializeWebSocket = () => {
    ws.current = new WebSocket(`ws://localhost:1337/websocket?token=${token}`);

    ws.current.onopen = () => console.log('WebSocket connection established');
    ws.current.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      const messageData = JSON.parse(parsedData.message);
      const newMessages = [
        {
          id: `${Date.now()}-sent`,
          message: messageData.message,
          createdBy: messageData.user,
          isCurrentUser: true
        },
        {
          id: `${Date.now()}-received`,
          message: messageData.message,
          createdBy: messageData.user,
          isCurrentUser: false
        }
      ];
      setMessages((prevMessages) => [...prevMessages, ...newMessages]);
    };
    ws.current.onclose = () => console.log('WebSocket connection closed');
    ws.current.onerror = (error) => console.error('WebSocket error:', error);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (ws.current && ws.current.readyState === WebSocket.OPEN && inputValue.trim()) {
      const messageData = { 
        message: inputValue, 
        user: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      ws.current.send(JSON.stringify({ message: JSON.stringify(messageData) }));
      const newMessages = [
        { id: `${Date.now()}-sent`, message: inputValue, createdBy: userId, isCurrentUser: true },
        { id: `${Date.now()}-received`, message: inputValue, createdBy: userId, isCurrentUser: false }
      ];
      setMessages((prevMessages) => [...prevMessages, ...newMessages]);
      setInputValue('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setToken(null);
    navigate('/login');
  };

  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>WhatsApp Chat</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      <div className="message-list">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.isCurrentUser ? 'sent' : 'received'}`}
          >
            <div className="message-bubble">{message.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
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
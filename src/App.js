import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/chat" 
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

// PrivateRoute component to handle authentication
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('jwt');
  return token ? children : <Navigate to="/login" replace />;
};

export default App;
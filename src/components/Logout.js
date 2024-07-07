// src/components/LogoutButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/login');
  };

  const token = localStorage.getItem('jwt');
  if (!token) return null; // Don't show the button if there's no token

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;

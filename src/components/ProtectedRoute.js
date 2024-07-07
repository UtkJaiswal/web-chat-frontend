// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('jwt');

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    jwtDecode(token); // If token is invalid, jwtDecode will throw an error
  } catch (e) {
    localStorage.removeItem('jwt');
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;

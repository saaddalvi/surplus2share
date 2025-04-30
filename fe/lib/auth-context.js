"use client";

import { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';

// Create the auth context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check for auth on mount
    checkAuth();
    setIsReady(true);
    
    // Listen for storage events (for multiple tabs)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const handleStorageChange = (e) => {
    if (e.key === 'token' || e.key === 'user') {
      checkAuth();
    }
  };

  const checkAuth = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const token = localStorage.getItem('token') || Cookies.get('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    Cookies.set('token', token);
    setUser(userData);
    
    // Dispatch event to notify components
    window.dispatchEvent(new Event('authStateChanged'));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    Cookies.remove('token');
    setUser(null);
    
    // Dispatch event to notify components
    window.dispatchEvent(new Event('authStateChanged'));
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout, isReady }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
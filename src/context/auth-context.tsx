'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  plan?: string;
  planExpiry?: string;
  youtubeChannelId?: string;
  youtubeChannel?: {
    id: string;
    title: string;
    thumbnail: string;
  };
  disconnectApproved?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing JWT token on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('creator_jwt') || localStorage.getItem('admin_jwt');
        
        if (token) {
          // Verify token and get user data
          const response = await fetch('/api/auth/verify', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('creator_jwt');
            localStorage.removeItem('admin_jwt');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = (token: string) => {
    // Store token based on user type (you might need to determine this from the token)
    localStorage.setItem('creator_jwt', token);
    
    // Decode token to get user info (basic implementation)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: payload.id,
        email: payload.email,
        name: payload.name || payload.email,
        role: payload.role,
        plan: payload.plan
      });
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  };

  const signOut = () => {
    localStorage.removeItem('creator_jwt');
    localStorage.removeItem('admin_jwt');
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
import React, { createContext, useState, useEffect } from 'react';
import { User } from '../types/auth';
import { USER_ACCOUNT_PROFILES } from '../data/roleMenuConfig';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUserId = localStorage.getItem('depot_logged_user_id');
    if (savedUserId) {
      const found = USER_ACCOUNT_PROFILES.find((p) => p.id === savedUserId);
      if (found) return found as User;
    }
    return null;
  });

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('depot_logged_user_id', newUser.id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('depot_logged_user_id');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

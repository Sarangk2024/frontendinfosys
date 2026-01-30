import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // In a real app, these functions would interact with a backend service.
  const login = (email, password) => {
    // Mock login: any email/password is accepted
    console.log('Logging in with:', email);
    setUser({ email }); // Set user to a mock user object
  };

  const logout = () => {
    console.log('Logging out');
    setUser(null); // Clear user state
  };

  const register = (name, email, password) => {
    // Mock register
    console.log('Registering:', name, email);
    setUser({ email }); // Automatically log in after registration
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

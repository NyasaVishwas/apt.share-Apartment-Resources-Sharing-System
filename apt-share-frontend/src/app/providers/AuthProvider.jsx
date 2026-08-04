import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient, { setAccessToken } from '../../lib/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await axiosClient.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, accessToken) => {
    setUser(userData);
    setAccessToken(accessToken);
  };

  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (err) {
      // Ignore
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('activeCommunityId');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

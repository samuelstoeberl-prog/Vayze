import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebaseAuthService from '../services/firebaseAuthService';

const AuthContext = createContext();

const AUTH_STORAGE_KEY = 'decisio_auth_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    loadAuthState();

    const unsubscribeFirebase = firebaseAuthService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {

        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          provider: 'firebase',
          emailVerified: firebaseUser.emailVerified
        };
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false); 
        await saveAuthState(userData);
              } else {
        
        setIsLoading(false); 
      }
    });

    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        
        if (isAuthenticated) {
          await loadAuthState();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      unsubscribeFirebase();
      subscription?.remove();
    };
  }, []); 

  const loadAuthState = async () => {
    try {

      let firebaseUser = null;
      try {
        firebaseUser = firebaseAuthService.getCurrentUser();
      } catch (firebaseError) {
        console.error('Firebase auth error:', firebaseError.message);
        firebaseUser = null;
      }

      if (firebaseUser) {
                const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          provider: 'firebase',
          emailVerified: firebaseUser.emailVerified
        };
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false);

        try {
          await saveAuthState(userData);
        } catch (saveError) {
          console.error('Error saving auth state:', saveError);
        }

                return;
      }

      let savedUser = null;
      try {
        savedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      } catch (storageError) {
        console.error('Error reading auth from storage:', storageError);
        savedUser = null;
      }

      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
          setIsLoading(false);
        } catch (parseError) {
          console.error('Error parsing saved user data:', parseError);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuthState = async (userData) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving auth state to storage:', error);
    }
  };

  const signIn = async (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoading(false);
    await saveAuthState(userData);
  };

  const signOut = async () => {
    try {
      await firebaseAuthService.logout();
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

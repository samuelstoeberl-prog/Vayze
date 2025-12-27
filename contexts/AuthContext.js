/**
 * Auth Context - Global Authentication State Management (Enhanced)
 * Handles user authentication, session persistence, and auth state
 *
 * Now integrates with SecureAuthService for:
 * - Session management
 * - Activity tracking
 * - Auto-logout on idle
 * - Account state monitoring
 */

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

  // App state tracking
  const appState = useRef(AppState.currentState);

  // Load persisted auth state on mount
  useEffect(() => {
    loadAuthState();

    // Setup Firebase auth state listener
    const unsubscribeFirebase = firebaseAuthService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        if (__DEV__) {
          console.log('🔥 [AuthContext] Firebase Auth State Change - USER DETECTED:');
          console.log('  Email:', firebaseUser.email);
          console.log('  Setting isLoading to FALSE');
          console.log('  Setting isAuthenticated to TRUE');
        }
        // Sync Firebase user with local state
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          provider: 'firebase',
          emailVerified: firebaseUser.emailVerified
        };
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false); // CRITICAL: Set loading to false
        await saveAuthState(userData);
        if (__DEV__) console.log('✅ [AuthContext] Firebase user synced. isLoading should now be FALSE');
      } else {
        if (__DEV__) {
          console.log('🔥 [AuthContext] Firebase Auth State Change - USER SIGNED OUT');
          console.log('  Setting isLoading to FALSE');
          console.log('  Setting isAuthenticated to FALSE');
        }
        setIsLoading(false); // CRITICAL: Set loading to false even on sign out
      }
    });

    // Setup app state listener
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground - revalidate only if authenticated
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAuthState = async () => {
    try {
      if (__DEV__) {
        console.log('🔐 [AuthContext] ========== loadAuthState CALLED ==========');
        console.log('  Current isLoading:', isLoading);
        console.log('  Current isAuthenticated:', isAuthenticated);
      }

      // Check Firebase auth first
      const firebaseUser = firebaseAuthService.getCurrentUser();
      if (firebaseUser) {
        if (__DEV__) console.log('🔐 [AuthContext] Firebase user found:', firebaseUser.email);
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          provider: 'firebase',
          emailVerified: firebaseUser.emailVerified
        };
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false); // CRITICAL FIX: Must set loading to false here!
        await saveAuthState(userData);
        if (__DEV__) console.log('🔐 [AuthContext] ✅ User authenticated via Firebase, isLoading set to FALSE');
        return;
      }

      // Check AsyncStorage for persisted auth state
      if (__DEV__) console.log('🔐 [AuthContext] Checking AsyncStorage...');
      const savedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (__DEV__) console.log('🔐 [AuthContext] ✅ User found in AsyncStorage:', userData.email);
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false); // CRITICAL FIX: Must set loading to false here too!
      } else {
        if (__DEV__) console.log('🔐 [AuthContext] ❌ No saved auth state - user not authenticated');
        setIsLoading(false); // CRITICAL FIX: Set loading to false even when no user
      }
    } catch (error) {
      if (__DEV__) console.error('🔐 [AuthContext] ❌ Failed to load auth state:', error);
    } finally {
      setIsLoading(false);
      if (__DEV__) console.log('🔐 [AuthContext] Auth state loading complete. isAuthenticated:', isAuthenticated);
    }
  };

  const saveAuthState = async (userData) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  };

  // Activity and session tracking removed - Firebase handles this automatically

  const signIn = async (userData) => {
    if (__DEV__) console.log('🔐 [AuthContext] signIn called with user:', userData.email);
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoading(false); // CRITICAL: Set loading to false after sign in
    await saveAuthState(userData);
    if (__DEV__) console.log('🔐 [AuthContext] ✅ User signed in, loading=false, data saved');
  };

  const signOut = async () => {
    try {
      // Sign out from Firebase
      await firebaseAuthService.logout();

      // Clear storage
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);

      // DO NOT reset onboarding flag - user should only see onboarding once per device

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Failed to sign out:', error);
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

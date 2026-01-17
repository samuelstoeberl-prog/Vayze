import { useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import secureAuthService from '../services/secureAuthService';

export default function useSecureAuth() {
  const [session, setSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accountState, setAccountState] = useState(null);

  const activityTimer = useRef(null);
  const sessionCheckTimer = useRef(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    checkSession();
    startActivityTracking();
    startSessionMonitoring();
    setupAppStateListener();

    return () => {
      stopActivityTracking();
      stopSessionMonitoring();
    };
  }, []);

  const checkSession = async () => {
    try {
      const currentSession = await secureAuthService.getCurrentSession();

      if (currentSession) {
        setSession(currentSession);
        setIsAuthenticated(true);

        const state = await secureAuthService.getAccountState(currentSession.email);
        setAccountState(state);
      } else {
        setSession(null);
        setIsAuthenticated(false);
        setAccountState(null);
      }
    } catch (error) {
      
      setSession(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const startActivityTracking = () => {
    activityTimer.current = setInterval(async () => {
      if (isAuthenticated) {
        await secureAuthService.updateActivity();
      }
    }, 60000); 
  };

  const stopActivityTracking = () => {
    if (activityTimer.current) {
      clearInterval(activityTimer.current);
    }
  };

  const startSessionMonitoring = () => {
    sessionCheckTimer.current = setInterval(async () => {
      const valid = await secureAuthService.isAuthenticated();

      if (!valid && isAuthenticated) {
        
        await handleSessionExpired();
      }
    }, 30000); 
  };

  const stopSessionMonitoring = () => {
    if (sessionCheckTimer.current) {
      clearInterval(sessionCheckTimer.current);
    }
  };

  const handleSessionExpired = async () => {
    setSession(null);
    setIsAuthenticated(false);
    setAccountState(null);

  };

  const setupAppStateListener = () => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        
        await checkSession();
      }

      appState.current = nextAppState;
    });

    return () => subscription?.remove();
  };

  const signIn = async (email, password, options = {}) => {
    const result = await secureAuthService.signIn(email, password, options);
    await checkSession();
    return result;
  };

  const signUp = async (email, password, name, options = {}) => {
    const result = await secureAuthService.signUp(email, password, name, options);
    await checkSession();
    return result;
  };

  const signOut = async () => {
    await secureAuthService.signOut();
    await checkSession();
  };

  const updateActivity = async () => {
    await secureAuthService.updateActivity();
  };

  const requireAuth = () => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    return true;
  };

  const isEmailVerified = () => {
    return accountState?.emailVerified || false;
  };

  const isAccountLocked = () => {
    return accountState?.locked || false;
  };

  return {
    
    session,
    isAuthenticated,
    isLoading,
    accountState,

    signIn,
    signUp,
    signOut,
    updateActivity,
    requireAuth,
    checkSession,

    isEmailVerified,
    isAccountLocked,
    userId: session?.userId,
    userEmail: session?.email,
    userName: session?.name
  };
}

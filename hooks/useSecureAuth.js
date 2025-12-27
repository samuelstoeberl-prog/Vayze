/**
 * Secure Auth Hook - Global Authentication State
 *
 * Features:
 * - Session validation
 * - Idle timeout monitoring
 * - Auto-logout on expiration
 * - Activity tracking
 * - Auth guards for navigation
 *
 * Usage:
 * const { isAuthenticated, session, requireAuth } = useSecureAuth();
 */

import { useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import secureAuthService from '../services/secureAuthService';

export default function useSecureAuth() {
  const [session, setSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accountState, setAccountState] = useState(null);

  // Activity tracking
  const activityTimer = useRef(null);
  const sessionCheckTimer = useRef(null);
  const appState = useRef(AppState.currentState);

  /**
   * Initialize auth state
   */
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

  /**
   * Check current session validity
   */
  const checkSession = async () => {
    try {
      const currentSession = await secureAuthService.getCurrentSession();

      if (currentSession) {
        setSession(currentSession);
        setIsAuthenticated(true);

        // Load account state
        const state = await secureAuthService.getAccountState(currentSession.email);
        setAccountState(state);
      } else {
        setSession(null);
        setIsAuthenticated(false);
        setAccountState(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setSession(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Start tracking user activity
   * Why: Update last activity timestamp to prevent idle timeout
   */
  const startActivityTracking = () => {
    activityTimer.current = setInterval(async () => {
      if (isAuthenticated) {
        await secureAuthService.updateActivity();
      }
    }, 60000); // Update every minute
  };

  const stopActivityTracking = () => {
    if (activityTimer.current) {
      clearInterval(activityTimer.current);
    }
  };

  /**
   * Monitor session validity
   * Why: Auto-logout on expiration or idle timeout
   */
  const startSessionMonitoring = () => {
    sessionCheckTimer.current = setInterval(async () => {
      const valid = await secureAuthService.isAuthenticated();

      if (!valid && isAuthenticated) {
        // Session expired or idle timeout reached
        await handleSessionExpired();
      }
    }, 30000); // Check every 30 seconds
  };

  const stopSessionMonitoring = () => {
    if (sessionCheckTimer.current) {
      clearInterval(sessionCheckTimer.current);
    }
  };

  /**
   * Handle session expiration
   */
  const handleSessionExpired = async () => {
    setSession(null);
    setIsAuthenticated(false);
    setAccountState(null);

    // Could show a notification here
    console.log('Session expired - user logged out');
  };

  /**
   * Listen to app state changes
   * Why: Check session when app comes to foreground
   */
  const setupAppStateListener = () => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground - revalidate session
        await checkSession();
      }

      appState.current = nextAppState;
    });

    return () => subscription?.remove();
  };

  /**
   * Sign in
   */
  const signIn = async (email, password, options = {}) => {
    const result = await secureAuthService.signIn(email, password, options);
    await checkSession();
    return result;
  };

  /**
   * Sign up
   */
  const signUp = async (email, password, name, options = {}) => {
    const result = await secureAuthService.signUp(email, password, name, options);
    await checkSession();
    return result;
  };

  /**
   * Sign out
   */
  const signOut = async () => {
    await secureAuthService.signOut();
    await checkSession();
  };

  /**
   * Update activity manually (for important user actions)
   */
  const updateActivity = async () => {
    await secureAuthService.updateActivity();
  };

  /**
   * Auth guard - returns true if authenticated, throws if not
   * Usage: await requireAuth();
   */
  const requireAuth = () => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    return true;
  };

  /**
   * Check if account is verified
   */
  const isEmailVerified = () => {
    return accountState?.emailVerified || false;
  };

  /**
   * Check if account is locked
   */
  const isAccountLocked = () => {
    return accountState?.locked || false;
  };

  return {
    // State
    session,
    isAuthenticated,
    isLoading,
    accountState,

    // Methods
    signIn,
    signUp,
    signOut,
    updateActivity,
    requireAuth,
    checkSession,

    // Helpers
    isEmailVerified,
    isAccountLocked,
    userId: session?.userId,
    userEmail: session?.email,
    userName: session?.name
  };
}

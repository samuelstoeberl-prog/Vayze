/**
 * App State Machine Hook
 *
 * Manages the entire app flow as an explicit state machine
 * with timeouts, error handling, and guaranteed exit paths.
 *
 * NO INFINITE LOADING POSSIBLE.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// All possible app states
export const APP_STATES = {
  INITIAL: 'INITIAL',
  SPLASH: 'SPLASH',
  ONBOARDING_CHECK: 'ONBOARDING_CHECK',
  ONBOARDING: 'ONBOARDING',
  ONBOARDING_COMPLETE: 'ONBOARDING_COMPLETE',
  AUTH_CHECK: 'AUTH_CHECK',
  AUTH_LOADING: 'AUTH_LOADING',
  AUTHENTICATED: 'AUTHENTICATED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  MAIN_APP: 'MAIN_APP',
  ERROR: 'ERROR',
  TIMEOUT: 'TIMEOUT',
};

// Timeout durations (in milliseconds)
const TIMEOUTS = {
  SPLASH: 3000,
  ONBOARDING_CHECK: 3000,
  ONBOARDING_COMPLETE: 1000,
  AUTH_CHECK: 5000,
  AUTH_LOADING: 10000,
  AUTHENTICATED: 2000,
};

export const useAppStateMachine = () => {
  const [currentState, setCurrentState] = useState(APP_STATES.INITIAL);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const timeoutRef = useRef(null);
  const stateHistoryRef = useRef([APP_STATES.INITIAL]);

  // Clear any existing timeout
  const clearStateTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Set a timeout for current state
  const setStateTimeout = useCallback((duration, fallbackState, reason) => {
    clearStateTimeout();

    if (__DEV__) {
      console.log(`⏱️ [StateMachine] Setting timeout for ${currentState}: ${duration}ms → ${fallbackState}`);
    }

    timeoutRef.current = setTimeout(() => {
      if (__DEV__) {
        console.warn(`⏰ [StateMachine] TIMEOUT! ${currentState} → ${fallbackState} (${reason})`);
      }

      setError({
        type: 'TIMEOUT',
        message: reason || `Operation timed out after ${duration}ms`,
        from: currentState,
      });

      transition(APP_STATES.TIMEOUT, { fallbackState, reason });
    }, duration);
  }, [currentState]);

  // Transition to new state
  const transition = useCallback((newState, data = {}) => {
    clearStateTimeout();

    if (__DEV__) {
      console.log(`🔄 [StateMachine] ${currentState} → ${newState}`, data);
    }

    // Record state history
    stateHistoryRef.current.push(newState);
    if (stateHistoryRef.current.length > 10) {
      stateHistoryRef.current.shift(); // Keep only last 10 states
    }

    // Check for loops (same state 3 times in a row = infinite loop protection)
    const lastThree = stateHistoryRef.current.slice(-3);
    if (lastThree.length === 3 && lastThree.every(s => s === newState)) {
      console.error(`🚨 [StateMachine] INFINITE LOOP DETECTED: ${newState}`);
      setError({
        type: 'INFINITE_LOOP',
        message: `Detected infinite loop in state: ${newState}`,
        from: currentState,
      });
      transition(APP_STATES.ERROR);
      return;
    }

    setCurrentState(newState);

    // Set timeout for states that need them
    switch (newState) {
      case APP_STATES.SPLASH:
        setStateTimeout(TIMEOUTS.SPLASH, APP_STATES.ONBOARDING_CHECK, 'Splash screen timeout');
        break;

      case APP_STATES.ONBOARDING_CHECK:
        setStateTimeout(TIMEOUTS.ONBOARDING_CHECK, APP_STATES.AUTH_CHECK, 'Onboarding check timeout');
        break;

      case APP_STATES.ONBOARDING_COMPLETE:
        setStateTimeout(TIMEOUTS.ONBOARDING_COMPLETE, APP_STATES.UNAUTHENTICATED, 'Onboarding completion timeout');
        break;

      case APP_STATES.AUTH_CHECK:
        setStateTimeout(TIMEOUTS.AUTH_CHECK, APP_STATES.UNAUTHENTICATED, 'Auth check timeout');
        break;

      case APP_STATES.AUTH_LOADING:
        setStateTimeout(TIMEOUTS.AUTH_LOADING, APP_STATES.ERROR, 'Authentication timeout');
        break;

      case APP_STATES.AUTHENTICATED:
        setStateTimeout(TIMEOUTS.AUTHENTICATED, APP_STATES.ERROR, 'App load timeout');
        break;

      case APP_STATES.TIMEOUT:
        // Immediately transition to fallback
        const fallback = data.fallbackState || APP_STATES.UNAUTHENTICATED;
        setTimeout(() => transition(fallback), 500);
        break;

      default:
        // No timeout needed
        break;
    }
  }, [currentState, clearStateTimeout, setStateTimeout]);

  // Check if onboarding is needed
  const checkOnboarding = useCallback(async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');

      if (hasLaunched) {
        if (__DEV__) console.log('✅ [StateMachine] Onboarding already completed');
        transition(APP_STATES.AUTH_CHECK);
      } else {
        if (__DEV__) console.log('🆕 [StateMachine] First launch - show onboarding');
        transition(APP_STATES.ONBOARDING);
      }
    } catch (error) {
      console.error('❌ [StateMachine] Onboarding check failed:', error);
      // On error, safer to show onboarding than to block user
      transition(APP_STATES.ONBOARDING);
    }
  }, [transition]);

  // Complete onboarding
  const completeOnboarding = useCallback(async (data) => {
    try {
      if (__DEV__) console.log('✅ [StateMachine] Completing onboarding');

      await AsyncStorage.setItem('hasLaunched', 'true');
      transition(APP_STATES.ONBOARDING_COMPLETE);

      // Automatically transition to unauthenticated after brief delay
      setTimeout(() => {
        transition(APP_STATES.UNAUTHENTICATED);
      }, 300);
    } catch (error) {
      console.error('❌ [StateMachine] Failed to save onboarding state:', error);
      // Even if save fails, continue to auth
      transition(APP_STATES.UNAUTHENTICATED);
    }
  }, [transition]);

  // Retry current operation
  const retry = useCallback(() => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    setError(null);

    if (__DEV__) console.log(`🔄 [StateMachine] Retry #${newRetryCount}`);

    // Max 3 retries
    if (newRetryCount > 3) {
      setError({
        type: 'MAX_RETRIES',
        message: 'Maximum retry attempts reached',
        from: currentState,
      });
      transition(APP_STATES.ERROR);
      return;
    }

    // Retry based on current state
    switch (currentState) {
      case APP_STATES.ERROR:
      case APP_STATES.TIMEOUT:
        // Go back to auth check
        transition(APP_STATES.AUTH_CHECK);
        break;

      case APP_STATES.ONBOARDING_CHECK:
        checkOnboarding();
        break;

      default:
        transition(APP_STATES.AUTH_CHECK);
        break;
    }
  }, [currentState, retryCount, transition, checkOnboarding]);

  // Hard reset to login
  const hardReset = useCallback(async () => {
    if (__DEV__) console.log('🚨 [StateMachine] HARD RESET');

    clearStateTimeout();
    setError(null);
    setRetryCount(0);
    stateHistoryRef.current = [];

    transition(APP_STATES.UNAUTHENTICATED);
  }, [transition, clearStateTimeout]);

  // Clear all data and restart
  const factoryReset = useCallback(async () => {
    if (__DEV__) console.log('🏭 [StateMachine] FACTORY RESET');

    try {
      await AsyncStorage.clear();
      clearStateTimeout();
      setError(null);
      setRetryCount(0);
      stateHistoryRef.current = [];

      transition(APP_STATES.ONBOARDING_CHECK);
    } catch (error) {
      console.error('Failed to clear storage:', error);
      transition(APP_STATES.ERROR);
    }
  }, [transition, clearStateTimeout]);

  // Initialize state machine
  useEffect(() => {
    if (currentState === APP_STATES.INITIAL) {
      transition(APP_STATES.SPLASH);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearStateTimeout();
    };
  }, [clearStateTimeout]);

  return {
    currentState,
    error,
    retryCount,
    transition,
    checkOnboarding,
    completeOnboarding,
    retry,
    hardReset,
    factoryReset,
    stateHistory: stateHistoryRef.current,
  };
};

export default useAppStateMachine;

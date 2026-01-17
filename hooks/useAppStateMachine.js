import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const clearStateTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const setStateTimeout = useCallback((duration, fallbackState, reason) => {
    clearStateTimeout();

    timeoutRef.current = setTimeout(() => {
      setError({
        type: 'TIMEOUT',
        message: reason || `Operation timed out after ${duration}ms`,
        from: currentState,
      });

      transition(APP_STATES.TIMEOUT, { fallbackState, reason });
    }, duration);
  }, [currentState]);

  const transition = useCallback((newState, data = {}) => {
    clearStateTimeout();

    stateHistoryRef.current.push(newState);
    if (stateHistoryRef.current.length > 10) {
      stateHistoryRef.current.shift(); 
    }

    const lastThree = stateHistoryRef.current.slice(-3);
    if (lastThree.length === 3 && lastThree.every(s => s === newState)) {
      
      setError({
        type: 'INFINITE_LOOP',
        message: `Detected infinite loop in state: ${newState}`,
        from: currentState,
      });
      transition(APP_STATES.ERROR);
      return;
    }

    setCurrentState(newState);

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
        
        const fallback = data.fallbackState || APP_STATES.UNAUTHENTICATED;
        setTimeout(() => transition(fallback), 500);
        break;

      default:
        
        break;
    }
  }, [currentState, clearStateTimeout, setStateTimeout]);

  const checkOnboarding = useCallback(async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');

      if (hasLaunched) {
                transition(APP_STATES.AUTH_CHECK);
      } else {
                transition(APP_STATES.ONBOARDING);
      }
    } catch (error) {

      transition(APP_STATES.ONBOARDING);
    }
  }, [transition]);

  const completeOnboarding = useCallback(async (data) => {
    try {
            await AsyncStorage.setItem('hasLaunched', 'true');
      transition(APP_STATES.ONBOARDING_COMPLETE);

      setTimeout(() => {
        transition(APP_STATES.UNAUTHENTICATED);
      }, 300);
    } catch (error) {

      transition(APP_STATES.UNAUTHENTICATED);
    }
  }, [transition]);

  const retry = useCallback(() => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    setError(null);

        if (newRetryCount > 3) {
      setError({
        type: 'MAX_RETRIES',
        message: 'Maximum retry attempts reached',
        from: currentState,
      });
      transition(APP_STATES.ERROR);
      return;
    }

    switch (currentState) {
      case APP_STATES.ERROR:
      case APP_STATES.TIMEOUT:
        
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

  const hardReset = useCallback(async () => {
        clearStateTimeout();
    setError(null);
    setRetryCount(0);
    stateHistoryRef.current = [];

    transition(APP_STATES.UNAUTHENTICATED);
  }, [transition, clearStateTimeout]);

  const factoryReset = useCallback(async () => {
        try {
      await AsyncStorage.clear();
      clearStateTimeout();
      setError(null);
      setRetryCount(0);
      stateHistoryRef.current = [];

      transition(APP_STATES.ONBOARDING_CHECK);
    } catch (error) {
      
      transition(APP_STATES.ERROR);
    }
  }, [transition, clearStateTimeout]);

  useEffect(() => {
    if (currentState === APP_STATES.INITIAL) {
      transition(APP_STATES.SPLASH);
    }
  }, []);

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

/**
 * App State Machine Wrapper
 *
 * This component manages the entire app flow using an explicit state machine.
 * NO INFINITE LOADING - Every state has a timeout and exit path.
 */

import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppStateMachine, APP_STATES } from '../hooks/useAppStateMachine';
import SafeLoadingScreen from './SafeLoadingScreen';
import ErrorScreen from './ErrorScreen';
import SplashScreen from './SplashScreen';
import OnboardingFlowNew from './OnboardingFlowNew';
import StandaloneAuthScreen from '../screens/StandaloneAuthScreen';

const AppStateMachineWrapper = ({ children, onLoadUserData }) => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const stateMachine = useAppStateMachine();

  // Splash → Onboarding Check
  useEffect(() => {
    if (stateMachine.currentState === APP_STATES.SPLASH) {
      const timer = setTimeout(() => {
        stateMachine.checkOnboarding();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [stateMachine.currentState]);

  // Auth Check → Determine auth status
  useEffect(() => {
    if (stateMachine.currentState === APP_STATES.AUTH_CHECK) {
      if (authLoading) {
        stateMachine.transition(APP_STATES.AUTH_LOADING);
      } else if (isAuthenticated && user) {
        stateMachine.transition(APP_STATES.AUTHENTICATED);
      } else {
        stateMachine.transition(APP_STATES.UNAUTHENTICATED);
      }
    }
  }, [stateMachine.currentState, authLoading, isAuthenticated, user]);

  // Authenticated → Load data → Main App
  useEffect(() => {
    if (stateMachine.currentState === APP_STATES.AUTHENTICATED) {
      const loadData = async () => {
        try {
          if (__DEV__) console.log('📊 [AppWrapper] Loading user data...');

          // Call parent's data loading function
          if (onLoadUserData) {
            await onLoadUserData(user);
          }

          if (__DEV__) console.log('✅ [AppWrapper] Data loaded, transitioning to main app');
          stateMachine.transition(APP_STATES.MAIN_APP);
        } catch (error) {
          console.error('❌ [AppWrapper] Failed to load data:', error);
          stateMachine.setError({
            type: 'DATA_LOAD',
            message: error.message || 'Failed to load user data',
            from: APP_STATES.AUTHENTICATED,
          });
          stateMachine.transition(APP_STATES.ERROR);
        }
      };

      loadData();
    }
  }, [stateMachine.currentState, isAuthenticated, user]);

  // RENDER based on state machine
  switch (stateMachine.currentState) {
    case APP_STATES.INITIAL:
    case APP_STATES.SPLASH:
      return (
        <SplashScreen
          onFinish={() => {
            if (__DEV__) console.log('🎬 [AppWrapper] Splash finished');
            stateMachine.checkOnboarding();
          }}
        />
      );

    case APP_STATES.ONBOARDING_CHECK:
      return (
        <SafeLoadingScreen
          message="Checking if you're new here..."
          timeout={3000}
          showEscapeAfter={2000}
          onTimeout={() => {
            if (__DEV__) console.warn('⏰ [AppWrapper] Onboarding check timeout');
            stateMachine.transition(APP_STATES.AUTH_CHECK);
          }}
          onManualEscape={() => {
            if (__DEV__) console.log('🚪 [AppWrapper] Manual escape from onboarding check');
            stateMachine.transition(APP_STATES.AUTH_CHECK);
          }}
        />
      );

    case APP_STATES.ONBOARDING:
      return (
        <OnboardingFlowNew
          onComplete={(data) => {
            if (__DEV__) console.log('✅ [AppWrapper] Onboarding completed');
            stateMachine.completeOnboarding(data);
          }}
        />
      );

    case APP_STATES.ONBOARDING_COMPLETE:
      return (
        <SafeLoadingScreen
          message="Setting things up..."
          timeout={1000}
          showEscapeAfter={800}
          onTimeout={() => {
            if (__DEV__) console.log('⏰ [AppWrapper] Onboarding complete timeout');
            stateMachine.transition(APP_STATES.UNAUTHENTICATED);
          }}
          onManualEscape={() => {
            if (__DEV__) console.log('🚪 [AppWrapper] Manual escape from onboarding complete');
            stateMachine.transition(APP_STATES.UNAUTHENTICATED);
          }}
        />
      );

    case APP_STATES.AUTH_CHECK:
      return (
        <SafeLoadingScreen
          message="Checking authentication..."
          timeout={5000}
          showEscapeAfter={3000}
          onTimeout={() => {
            if (__DEV__) console.warn('⏰ [AppWrapper] Auth check timeout');
            stateMachine.transition(APP_STATES.UNAUTHENTICATED);
          }}
          onManualEscape={() => {
            if (__DEV__) console.log('🚪 [AppWrapper] Manual escape from auth check');
            stateMachine.hardReset();
          }}
        />
      );

    case APP_STATES.AUTH_LOADING:
      return (
        <SafeLoadingScreen
          message="Authenticating..."
          timeout={10000}
          showEscapeAfter={5000}
          onTimeout={() => {
            if (__DEV__) console.error('⏰ [AppWrapper] Auth loading timeout');
            stateMachine.setError({
              type: 'TIMEOUT',
              message: 'Authentication timed out',
              from: APP_STATES.AUTH_LOADING,
            });
            stateMachine.transition(APP_STATES.ERROR);
          }}
          onManualEscape={() => {
            if (__DEV__) console.log('🚪 [AppWrapper] Manual escape from auth loading');
            stateMachine.hardReset();
          }}
        />
      );

    case APP_STATES.UNAUTHENTICATED:
      return <StandaloneAuthScreen />;

    case APP_STATES.AUTHENTICATED:
      return (
        <SafeLoadingScreen
          message="Loading your data..."
          timeout={5000}
          showEscapeAfter={3000}
          onTimeout={() => {
            if (__DEV__) console.error('⏰ [AppWrapper] Data load timeout');
            // Even if timeout, try to show app anyway
            stateMachine.transition(APP_STATES.MAIN_APP);
          }}
          onManualEscape={() => {
            if (__DEV__) console.log('🚪 [AppWrapper] Manual escape from data load');
            stateMachine.transition(APP_STATES.MAIN_APP);
          }}
        />
      );

    case APP_STATES.ERROR:
    case APP_STATES.TIMEOUT:
      return (
        <ErrorScreen
          error={stateMachine.error}
          onRetry={() => {
            if (__DEV__) console.log('🔄 [AppWrapper] Retrying...');
            stateMachine.retry();
          }}
          onHardReset={() => {
            if (__DEV__) console.log('🏠 [AppWrapper] Hard reset to login');
            stateMachine.hardReset();
          }}
          onFactoryReset={() => {
            if (__DEV__) console.log('🏭 [AppWrapper] Factory reset');
            stateMachine.factoryReset();
          }}
          retryCount={stateMachine.retryCount}
        />
      );

    case APP_STATES.MAIN_APP:
      // Render the main app content
      if (__DEV__) console.log('🟢 [AppWrapper] Rendering main app');
      return children;

    default:
      // Fallback - should NEVER happen
      console.error('🚨 [AppWrapper] INVALID STATE:', stateMachine.currentState);
      return (
        <ErrorScreen
          error={{
            type: 'INVALID_STATE',
            message: `Invalid app state: ${stateMachine.currentState}`,
            from: 'UNKNOWN',
          }}
          onRetry={() => stateMachine.transition(APP_STATES.AUTH_CHECK)}
          onHardReset={() => stateMachine.hardReset()}
          onFactoryReset={() => stateMachine.factoryReset()}
          retryCount={0}
        />
      );
  }
};

export default AppStateMachineWrapper;

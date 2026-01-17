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

  useEffect(() => {
    if (stateMachine.currentState === APP_STATES.SPLASH) {
      const timer = setTimeout(() => {
        stateMachine.checkOnboarding();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [stateMachine.currentState]);

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

  useEffect(() => {
    if (stateMachine.currentState === APP_STATES.AUTHENTICATED) {
      const loadData = async () => {
        try {
                    if (onLoadUserData) {
            await onLoadUserData(user);
          }

                    stateMachine.transition(APP_STATES.MAIN_APP);
        } catch (error) {
          
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

  switch (stateMachine.currentState) {
    case APP_STATES.INITIAL:
    case APP_STATES.SPLASH:
      return (
        <SplashScreen
          onFinish={() => {
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
                        stateMachine.transition(APP_STATES.AUTH_CHECK);
          }}
          onManualEscape={() => {
                        stateMachine.transition(APP_STATES.AUTH_CHECK);
          }}
        />
      );

    case APP_STATES.ONBOARDING:
      return (
        <OnboardingFlowNew
          onComplete={(data) => {
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
                        stateMachine.transition(APP_STATES.UNAUTHENTICATED);
          }}
          onManualEscape={() => {
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
                        stateMachine.transition(APP_STATES.UNAUTHENTICATED);
          }}
          onManualEscape={() => {
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
                        stateMachine.setError({
              type: 'TIMEOUT',
              message: 'Authentication timed out',
              from: APP_STATES.AUTH_LOADING,
            });
            stateMachine.transition(APP_STATES.ERROR);
          }}
          onManualEscape={() => {
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
                        stateMachine.transition(APP_STATES.MAIN_APP);
          }}
          onManualEscape={() => {
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
                        stateMachine.retry();
          }}
          onHardReset={() => {
                        stateMachine.hardReset();
          }}
          onFactoryReset={() => {
                        stateMachine.factoryReset();
          }}
          retryCount={stateMachine.retryCount}
        />
      );

    case APP_STATES.MAIN_APP:
      
            return children;

    default:

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

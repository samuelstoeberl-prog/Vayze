import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SplashScreen from './components/SplashScreen';
import OnboardingFlowNew from './components/OnboardingFlowNew';
import StandaloneAuthScreen from './screens/StandaloneAuthScreen';
import firebaseAuthService from './services/firebaseAuthService';

const APP_STATE = {
  BOOT: 'BOOT',
  ONBOARDING: 'ONBOARDING',
  AUTH: 'AUTH',
  APP: 'APP',
};

function BootLogic({ onBootComplete }) {
  useEffect(() => {
    const boot = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        const firebaseUser = firebaseAuthService.getCurrentUser();

        if (!hasLaunched) {
          onBootComplete(APP_STATE.ONBOARDING);
        } else if (firebaseUser) {
          onBootComplete(APP_STATE.APP);
        } else {
          onBootComplete(APP_STATE.AUTH);
        }
      } catch (error) {
        onBootComplete(APP_STATE.AUTH);
      }
    };

    boot();

    const timeout = setTimeout(() => {
      onBootComplete(APP_STATE.AUTH);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [onBootComplete]);

  return <SplashScreen onFinish={() => {}} />;
}

function AppRootInner({ children }) {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [appState, setAppState] = useState(APP_STATE.BOOT);

  const handleBootComplete = (initialState) => {
    setAppState(initialState);
  };

  const handleOnboardingComplete = async (data) => {
    try {
      await AsyncStorage.setItem('hasLaunched', 'true');
    } catch (error) {
      console.error('Error saving hasLaunched flag:', error);
    }

    setAppState(APP_STATE.AUTH);
  };

  useEffect(() => {
    if (appState === APP_STATE.AUTH) {
      if (isAuthenticated && user) {
        setAppState(APP_STATE.APP);
      }
    }
  }, [appState, isAuthenticated, authLoading, user]);

  switch (appState) {
    case APP_STATE.BOOT:
      return <BootLogic onBootComplete={handleBootComplete} />;

    case APP_STATE.ONBOARDING:
      return <OnboardingFlowNew onComplete={handleOnboardingComplete} />;

    case APP_STATE.AUTH:
      return <StandaloneAuthScreen />;

    case APP_STATE.APP:
      return children;

    default:
      return <StandaloneAuthScreen />;
  }
}

export default function AppRoot({ children }) {
  return (
    <AuthProvider>
      <AppRootInner>{children}</AppRootInner>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

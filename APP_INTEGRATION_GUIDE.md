# App.js Integration Guide - State Machine

## Critical Changes Needed

Replace the boolean-based render logic (lines 623-707) with state machine-based rendering.

### OLD LOGIC (REMOVE):
```javascript
if (showSplash) return <SplashScreen />
if (isFirstLaunch && !authLoading) return <OnboardingFlowNew />
if (authLoading) return <LoadingScreen />
if (!isAuthenticated) return <StandaloneAuthScreen />
return <MainApp />
```

### NEW LOGIC (ADD):
```javascript
// Integrate with auth context
useEffect(() => {
  if (stateMachine.currentState === APP_STATES.SPLASH) {
    // Splash finished, check onboarding
    setTimeout(() => {
      stateMachine.checkOnboarding();
    }, 2000);
  }
}, [stateMachine.currentState]);

useEffect(() => {
  if (stateMachine.currentState === APP_STATES.AUTH_CHECK) {
    // Check authentication
    if (authLoading) {
      stateMachine.transition(APP_STATES.AUTH_LOADING);
    } else if (isAuthenticated) {
      stateMachine.transition(APP_STATES.AUTHENTICATED);
    } else {
      stateMachine.transition(APP_STATES.UNAUTHENTICATED);
    }
  }
}, [stateMachine.currentState, authLoading, isAuthenticated]);

useEffect(() => {
  if (stateMachine.currentState === APP_STATES.AUTHENTICATED) {
    // Load user data, then go to main app
    loadAllData().then(() => {
      stateMachine.transition(APP_STATES.MAIN_APP);
    }).catch((error) => {
      stateMachine.setError({ type: 'DATA_LOAD', message: error.message });
      stateMachine.transition(APP_STATES.ERROR);
    });
  }
}, [stateMachine.currentState, isAuthenticated]);

// RENDER LOGIC - State machine driven
switch (stateMachine.currentState) {
  case APP_STATES.INITIAL:
  case APP_STATES.SPLASH:
    return (
      <SplashScreen
        onFinish={() => stateMachine.checkOnboarding()}
      />
    );

  case APP_STATES.ONBOARDING_CHECK:
    return (
      <SafeLoadingScreen
        message="Checking setup..."
        timeout={3000}
        onTimeout={() => stateMachine.transition(APP_STATES.AUTH_CHECK)}
        onManualEscape={() => stateMachine.transition(APP_STATES.AUTH_CHECK)}
      />
    );

  case APP_STATES.ONBOARDING:
    return (
      <OnboardingFlowNew
        onComplete={stateMachine.completeOnboarding}
      />
    );

  case APP_STATES.ONBOARDING_COMPLETE:
    return (
      <SafeLoadingScreen
        message="Finalizing setup..."
        timeout={1000}
        onTimeout={() => stateMachine.transition(APP_STATES.UNAUTHENTICATED)}
        onManualEscape={() => stateMachine.transition(APP_STATES.UNAUTHENTICATED)}
      />
    );

  case APP_STATES.AUTH_CHECK:
  case APP_STATES.AUTH_LOADING:
    return (
      <SafeLoadingScreen
        message="Authenticating..."
        timeout={5000}
        onTimeout={() => stateMachine.transition(APP_STATES.UNAUTHENTICATED)}
        onManualEscape={() => stateMachine.hardReset()}
      />
    );

  case APP_STATES.UNAUTHENTICATED:
    return <StandaloneAuthScreen />;

  case APP_STATES.AUTHENTICATED:
    return (
      <SafeLoadingScreen
        message="Loading your data..."
        timeout={2000}
        onTimeout={() => stateMachine.transition(APP_STATES.ERROR)}
        onManualEscape={() => stateMachine.hardReset()}
      />
    );

  case APP_STATES.ERROR:
  case APP_STATES.TIMEOUT:
    return (
      <ErrorScreen
        error={stateMachine.error}
        onRetry={stateMachine.retry}
        onHardReset={stateMachine.hardReset}
        onFactoryReset={stateMachine.factoryReset}
        retryCount={stateMachine.retryCount}
      />
    );

  case APP_STATES.MAIN_APP:
    // Existing main app render logic...
    return <MainAppContent />;

  default:
    // Fallback - should never happen
    return (
      <ErrorScreen
        error={{ type: 'UNKNOWN', message: 'Invalid app state' }}
        onRetry={stateMachine.retry}
        onHardReset={stateMachine.hardReset}
        retryCount={0}
      />
    );
}
```

## Benefits:

1. ✅ **No infinite loading** - Every state has timeout
2. ✅ **Always escapable** - Manual escape buttons
3. ✅ **Clear error states** - Explicit error handling
4. ✅ **Retry logic** - Max 3 retries before forcing reset
5. ✅ **Loop detection** - Prevents same state repeating
6. ✅ **Guaranteed fallback** - Always can return to login

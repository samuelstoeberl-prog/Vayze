# App State Machine

## States

```
INITIAL → SPLASH → ONBOARDING_CHECK → [ONBOARDING | AUTH_CHECK] → [LOGIN | MAIN_APP]
```

### All Possible States:

1. **INITIAL** - App starting up
2. **SPLASH** - Splash screen showing
3. **ONBOARDING_CHECK** - Checking if user needs onboarding
4. **ONBOARDING** - User going through onboarding flow
5. **ONBOARDING_COMPLETE** - Onboarding finished, transitioning to auth
6. **AUTH_CHECK** - Checking authentication status
7. **AUTH_LOADING** - Authentication in progress
8. **AUTHENTICATED** - User is authenticated
9. **UNAUTHENTICATED** - User needs to login
10. **MAIN_APP** - User in main app
11. **ERROR** - Something went wrong
12. **TIMEOUT** - Operation timed out

### Transitions:

```
INITIAL
  → SPLASH (immediate)

SPLASH
  → ONBOARDING_CHECK (after 2s or animation complete)
  → ERROR (if splash fails)

ONBOARDING_CHECK
  → ONBOARDING (if first launch)
  → AUTH_CHECK (if not first launch)
  → ERROR (if check fails)
  ⏱️ TIMEOUT: 3s → AUTH_CHECK

ONBOARDING
  → ONBOARDING_COMPLETE (when user completes)
  → ERROR (if onboarding fails)
  ⏱️ NO TIMEOUT (user-driven)

ONBOARDING_COMPLETE
  → UNAUTHENTICATED (immediate, <100ms)
  → ERROR (if transition fails)
  ⏱️ TIMEOUT: 1s → UNAUTHENTICATED

AUTH_CHECK
  → AUTHENTICATED (if valid session)
  → UNAUTHENTICATED (if no session)
  → ERROR (if check fails)
  ⏱️ TIMEOUT: 5s → UNAUTHENTICATED

AUTH_LOADING
  → AUTHENTICATED (if auth succeeds)
  → UNAUTHENTICATED (if auth fails)
  → ERROR (if network error)
  ⏱️ TIMEOUT: 10s → ERROR

AUTHENTICATED
  → MAIN_APP (immediate)
  → ERROR (if load fails)
  ⏱️ TIMEOUT: 2s → ERROR

UNAUTHENTICATED
  → AUTH_LOADING (when user attempts login)
  ⏱️ NO TIMEOUT (user-driven)

ERROR
  → UNAUTHENTICATED (retry)
  → ONBOARDING_CHECK (hard reset)
  ⏱️ NO TIMEOUT (user must choose)

TIMEOUT
  → UNAUTHENTICATED (safe fallback)
  → ERROR (if critical)
  ⏱️ NO TIMEOUT (immediate transition)
```

## Critical Rules:

1. **Every async operation has a timeout**
2. **Every error has a visible UI and action button**
3. **No state can loop infinitely**
4. **Maximum 3 automatic retries before showing error**
5. **User can always force-reset to UNAUTHENTICATED**

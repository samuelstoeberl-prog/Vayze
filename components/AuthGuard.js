/**
 * Auth Guard Components
 *
 * Protect screens/routes behind authentication
 *
 * Usage:
 * <AuthGuard>
 *   <ProtectedScreen />
 * </AuthGuard>
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import useSecureAuth from '../hooks/useSecureAuth';

/**
 * Auth Guard - Renders children only if authenticated
 * Why: Prevent unauthorized access to protected screens
 */
export function AuthGuard({ children, fallback = null }) {
  const { isAuthenticated, isLoading } = useSecureAuth();

  if (isLoading) {
    return fallback || <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return fallback || <UnauthorizedScreen />;
  }

  return <>{children}</>;
}

/**
 * Email Verification Guard
 * Why: Enforce email verification before accessing certain features
 */
export function EmailVerificationGuard({ children, fallback = null }) {
  const { isEmailVerified, isLoading } = useSecureAuth();

  if (isLoading) {
    return fallback || <AuthLoadingScreen />;
  }

  if (!isEmailVerified()) {
    return fallback || <EmailNotVerifiedScreen />;
  }

  return <>{children}</>;
}

/**
 * Account Status Guard
 * Why: Block access if account is locked or suspended
 */
export function AccountStatusGuard({ children, fallback = null }) {
  const { isAccountLocked, accountState, isLoading } = useSecureAuth();

  if (isLoading) {
    return fallback || <AuthLoadingScreen />;
  }

  if (isAccountLocked()) {
    return fallback || <AccountLockedScreen accountState={accountState} />;
  }

  if (accountState?.suspended) {
    return fallback || <AccountSuspendedScreen />;
  }

  return <>{children}</>;
}

/**
 * Combined Auth + Verification Guard
 * Why: Most common use case - require auth AND verified email
 */
export function ProtectedRoute({ children, requireVerification = false, fallback = null }) {
  return (
    <AuthGuard fallback={fallback}>
      <AccountStatusGuard fallback={fallback}>
        {requireVerification ? (
          <EmailVerificationGuard fallback={fallback}>
            {children}
          </EmailVerificationGuard>
        ) : (
          children
        )}
      </AccountStatusGuard>
    </AuthGuard>
  );
}

/**
 * Default Screens
 */
function AuthLoadingScreen() {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={styles.text}>Authentifizierung überprüfen...</Text>
    </View>
  );
}

function UnauthorizedScreen() {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.emoji}>🔒</Text>
      <Text style={styles.title}>Nicht angemeldet</Text>
      <Text style={styles.subtitle}>
        Bitte melde dich an um fortzufahren
      </Text>
    </View>
  );
}

function EmailNotVerifiedScreen() {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.emoji}>✉️</Text>
      <Text style={styles.title}>E-Mail nicht verifiziert</Text>
      <Text style={styles.subtitle}>
        Bitte bestätige deine E-Mail-Adresse um fortzufahren
      </Text>
    </View>
  );
}

function AccountLockedScreen({ accountState }) {
  const minutesLeft = accountState?.lockedUntil
    ? Math.ceil((accountState.lockedUntil - Date.now()) / 60000)
    : 0;

  return (
    <View style={styles.centerContainer}>
      <Text style={styles.emoji}>🔐</Text>
      <Text style={styles.title}>Konto gesperrt</Text>
      <Text style={styles.subtitle}>
        Dein Konto wurde vorübergehend gesperrt.
      </Text>
      {minutesLeft > 0 && (
        <Text style={styles.detail}>
          Entsperrung in {minutesLeft} Minute{minutesLeft > 1 ? 'n' : ''}
        </Text>
      )}
    </View>
  );
}

function AccountSuspendedScreen() {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.emoji}>⛔</Text>
      <Text style={styles.title}>Konto deaktiviert</Text>
      <Text style={styles.subtitle}>
        Dein Konto wurde deaktiviert. Bitte kontaktiere den Support.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  detail: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 12,
  },
  text: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
});

export default AuthGuard;

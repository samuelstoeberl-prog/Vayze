import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const ErrorScreen = ({ error, onRetry, onHardReset, onFactoryReset, retryCount = 0 }) => {
  const getErrorDetails = () => {
    if (!error) {
      return {
        title: 'Something went wrong',
        message: 'An unknown error occurred',
        icon: '⚠️',
      };
    }

    switch (error.type) {
      case 'TIMEOUT':
        return {
          title: 'Operation Timed Out',
          message: error.message || 'The operation took too long to complete',
          icon: '⏰',
          suggestion: 'Check your internet connection and try again',
        };

      case 'NETWORK':
        return {
          title: 'Network Error',
          message: error.message || 'Unable to connect to the server',
          icon: '🌐',
          suggestion: 'Check your internet connection',
        };

      case 'INFINITE_LOOP':
        return {
          title: 'App Error Detected',
          message: error.message || 'The app entered an invalid state',
          icon: '🔄',
          suggestion: 'Please restart the app',
        };

      case 'MAX_RETRIES':
        return {
          title: 'Too Many Attempts',
          message: error.message || 'Maximum retry attempts reached',
          icon: '🚫',
          suggestion: 'Try resetting the app',
        };

      case 'AUTH':
        return {
          title: 'Authentication Failed',
          message: error.message || 'Unable to authenticate',
          icon: '🔐',
          suggestion: 'Check your credentials and try again',
        };

      default:
        return {
          title: 'Error',
          message: error.message || 'Something went wrong',
          icon: '⚠️',
          suggestion: 'Try again or restart the app',
        };
    }
  };

  const details = getErrorDetails();
  const canRetry = retryCount < 3;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {}
        <Text style={styles.icon}>{details.icon}</Text>

        {}
        <Text style={styles.title}>{details.title}</Text>

        {}
        <Text style={styles.message}>{details.message}</Text>

        {}
        {details.suggestion && (
          <View style={styles.suggestionBox}>
            <Text style={styles.suggestionText}>{details.suggestion}</Text>
          </View>
        )}

        {}
        {retryCount > 0 && (
          <Text style={styles.retryCount}>
            Retry attempts: {retryCount} / 3
          </Text>
        )}

        {}
        <View style={styles.actions}>
          {}
          {canRetry && onRetry && (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onRetry}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>🔄 Try Again</Text>
            </TouchableOpacity>
          )}

          {}
          {onHardReset && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onHardReset}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>🏠 Go to Login</Text>
            </TouchableOpacity>
          )}

          {}
          {onFactoryReset && (
            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={onFactoryReset}
              activeOpacity={0.8}
            >
              <Text style={styles.dangerButtonText}>🏭 Factory Reset (Dev)</Text>
            </TouchableOpacity>
          )}
        </View>

        {}
        {error && (
          <View style={styles.debugBox}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugText}>Type: {error.type || 'unknown'}</Text>
            <Text style={styles.debugText}>From: {error.from || 'unknown'}</Text>
            {error.stack && (
              <Text style={styles.debugText} numberOfLines={5}>
                Stack: {error.stack}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  suggestionBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: '100%',
  },
  suggestionText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
  },
  retryCount: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 20,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  secondaryButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    marginTop: 20,
  },
  dangerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  debugBox: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    width: '100%',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 10,
    color: '#6b7280',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});

export default ErrorScreen;

/**
 * Password Reset Screen
 * Simple, clean UI for password reset via email
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import firebaseAuthService from '../services/firebaseAuthService';

export default function PasswordResetScreen({ onBack }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Fehler', 'Bitte gib deine E-Mail-Adresse ein.');
      return;
    }

    // Validate email format
    if (!firebaseAuthService.validateEmail(email)) {
      Alert.alert('Fehler', 'Ungültige E-Mail-Adresse.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await firebaseAuthService.resetPassword(email.trim().toLowerCase());

      if (result.success) {
        setEmailSent(true);
        // Auto-close after 5 seconds
        setTimeout(() => {
          if (onBack) onBack();
        }, 5000);
      } else {
        Alert.alert('Fehler', result.message);
      }
    } catch (error) {
      Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>✉️</Text>
          <Text style={styles.successTitle}>E-Mail versendet</Text>
          <Text style={styles.successMessage}>
            Wir haben dir eine E-Mail mit Anweisungen zum Zurücksetzen deines Passworts gesendet.
          </Text>
          <Text style={styles.successHint}>
            Bitte überprüfe dein Postfach (und deinen Spam-Ordner).
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Zurück zur Anmeldung</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onBack}
          accessibilityLabel="Zurück"
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🔐</Text>
          <Text style={styles.title}>Passwort zurücksetzen</Text>
          <Text style={styles.subtitle}>
            Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen deines Passworts.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-Mail-Adresse</Text>
            <TextInput
              style={styles.input}
              placeholder="deine@email.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              autoComplete="email"
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Reset-Link senden</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            💡 Der Link ist 1 Stunde gültig
          </Text>
          <Text style={styles.infoText}>
            📧 Überprüfe auch deinen Spam-Ordner
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 40,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  form: {
    gap: 20,
    marginBottom: 32,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  infoContainer: {
    gap: 8,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#0369a1',
    lineHeight: 20,
  },
  // Success state
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  successEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  successHint: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

/**
 * Standalone Auth Screen
 * Uses the beautiful Screen5Gateway design for standalone authentication
 * (after onboarding is completed)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../contexts/AuthContext';
import firebaseAuthService from '../services/firebaseAuthService';
import PasswordResetScreen from './PasswordResetScreen';

export default function StandaloneAuthScreen() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState('signup'); // 'signup' | 'login' | 'reset'
  const [accountData, setAccountData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleMode = () => {
    setMode(mode === 'signup' ? 'login' : 'signup');
    setAccountData({ name: '', email: '', password: '' });
  };

  // Show password reset screen
  if (mode === 'reset') {
    return <PasswordResetScreen onBack={() => setMode('login')} />;
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (mode === 'signup') {
        if (!accountData.name.trim()) {
          Alert.alert('Fehler', 'Bitte gib deinen Namen ein');
          return;
        }
        if (!accountData.email.trim()) {
          Alert.alert('Fehler', 'Bitte gib deine E-Mail-Adresse ein');
          return;
        }
        if (!accountData.password.trim()) {
          Alert.alert('Fehler', 'Bitte gib ein Passwort ein');
          return;
        }

        // Validate email format
        if (!firebaseAuthService.validateEmail(accountData.email)) {
          Alert.alert('Fehler', 'Ungültige E-Mail-Adresse');
          return;
        }

        // Validate password strength
        const passwordValidation = firebaseAuthService.validatePassword(accountData.password);
        if (!passwordValidation.valid) {
          Alert.alert('Fehler', passwordValidation.message);
          return;
        }

        // Register with Firebase
        const result = await firebaseAuthService.register(
          accountData.email.trim().toLowerCase(),
          accountData.password,
          accountData.name.trim()
        );

        if (result.success) {
          // Sign in to context
          await signIn({
            id: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
            provider: 'firebase',
            emailVerified: result.user.emailVerified
          });

          Alert.alert(
            'Registrierung erfolgreich',
            result.message,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Registrierung fehlgeschlagen', result.message);
        }
      } else {
        if (!accountData.email.trim()) {
          Alert.alert('Fehler', 'Bitte gib deine E-Mail-Adresse ein');
          return;
        }
        if (!accountData.password.trim()) {
          Alert.alert('Fehler', 'Bitte gib ein Passwort ein');
          return;
        }

        // Login with Firebase
        const result = await firebaseAuthService.login(
          accountData.email.trim().toLowerCase(),
          accountData.password
        );

        if (result.success) {
          // Sign in to context
          await signIn({
            id: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
            provider: 'firebase',
            emailVerified: result.user.emailVerified
          });

          // Show email verification reminder if not verified
          if (!result.user.emailVerified) {
            Alert.alert(
              'Anmeldung erfolgreich',
              'Bitte verifiziere deine E-Mail-Adresse. Wir haben dir einen Bestätigungslink gesendet.',
              [{ text: 'OK' }]
            );
          }
        } else {
          Alert.alert('Anmeldung fehlgeschlagen', result.message);
        }
      }
    } catch (error) {
      Alert.alert('Fehler', error.message || 'Authentifizierung fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
    >
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>V</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>
            {mode === 'signup' ? 'Lass es uns persönlich machen.' : 'Willkommen zurück!'}
          </Text>

          <Text style={styles.subtitle}>
            {mode === 'signup'
              ? 'Um dir Klarheit zu geben, die wirklich zu deinem Leben passt, müssen wir verstehen, was dir am wichtigsten ist.'
              : 'Melde dich an, um fortzufahren.'}
          </Text>

          {mode === 'signup' && (
            <>
              {/* Value Props */}
              <View style={styles.valueProps}>
                <View style={styles.valueProp}>
                  <Text style={styles.valuePropDot}>•</Text>
                  <Text style={styles.valuePropText}>Deine Werte merken</Text>
                </View>
                <View style={styles.valueProp}>
                  <Text style={styles.valuePropDot}>•</Text>
                  <Text style={styles.valuePropText}>Muster erkennen</Text>
                </View>
                <View style={styles.valueProp}>
                  <Text style={styles.valuePropDot}>•</Text>
                  <Text style={styles.valuePropText}>Privat & sicher</Text>
                </View>
              </View>

              {/* Trust Signals */}
              <View style={styles.trustSignals}>
                <View style={styles.trustSignal}>
                  <Text style={styles.trustSignalEmoji}>🔒</Text>
                  <Text style={styles.trustSignalText}>Verschlüsselt</Text>
                </View>
                <View style={styles.trustSignal}>
                  <Text style={styles.trustSignalEmoji}>✓</Text>
                  <Text style={styles.trustSignalText}>Keine Werbung</Text>
                </View>
                <View style={styles.trustSignal}>
                  <Text style={styles.trustSignalEmoji}>⚡</Text>
                  <Text style={styles.trustSignalText}>20 Sekunden</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'signup' && styles.modeButtonActive]}
            onPress={() => mode !== 'signup' && toggleMode()}
          >
            <Text style={[styles.modeButtonText, mode === 'signup' && styles.modeButtonTextActive]}>
              Registrieren
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'login' && styles.modeButtonActive]}
            onPress={() => mode !== 'login' && toggleMode()}
          >
            <Text style={[styles.modeButtonText, mode === 'login' && styles.modeButtonTextActive]}>
              Anmelden
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {mode === 'signup' && (
            <TextInput
              style={styles.input}
              placeholder="Dein Name"
              placeholderTextColor="#9ca3af"
              value={accountData.name}
              onChangeText={(text) => setAccountData({ ...accountData, name: text })}
              autoCapitalize="words"
              textContentType="name"
              autoComplete="name"
              returnKeyType="next"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Deine E-Mail"
            placeholderTextColor="#9ca3af"
            value={accountData.email}
            onChangeText={(text) => setAccountData({ ...accountData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType={mode === 'signup' ? 'emailAddress' : 'username'}
            autoComplete={mode === 'signup' ? 'email' : 'username'}
            importantForAutofill="yes"
            returnKeyType="next"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={mode === 'signup' ? 'Passwort erstellen' : 'Dein Passwort'}
              placeholderTextColor="#9ca3af"
              value={accountData.password}
              onChangeText={(text) => setAccountData({ ...accountData, password: text })}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              textContentType={mode === 'signup' ? 'newPassword' : 'password'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              importantForAutofill="yes"
              passwordRules={mode === 'signup' ? 'minlength: 8;' : undefined}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity
              style={styles.showPasswordButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showPasswordText}>
                {showPassword ? 'Verbergen' : 'Zeigen'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Forgot Password Link (Login Mode only) */}
          {mode === 'login' && (
            <TouchableOpacity
              onPress={() => setMode('reset')}
              style={styles.forgotPasswordContainer}
              accessibilityLabel="Passwort vergessen"
            >
              <Text style={styles.forgotPasswordText}>Passwort vergessen?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            activeOpacity={0.9}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Lädt...' : mode === 'signup' ? 'Meine Reise starten' : 'Anmelden'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View style={styles.legalContainer}>
          <Text style={styles.legalText}>
            Mit dem Fortfahren stimmst du unseren{' '}
            <Text
              style={styles.legalLink}
              onPress={() => WebBrowser.openBrowserAsync('https://samuelstoeberl-prog.github.io/Vayze-Legal/index.html#terms')}
              accessibilityRole="link"
              accessibilityLabel="Nutzungsbedingungen"
            >
              Nutzungsbedingungen
            </Text>
            {' '}und{' '}
            <Text
              style={styles.legalLink}
              onPress={() => WebBrowser.openBrowserAsync('https://samuelstoeberl-prog.github.io/Vayze-Legal/index.html#privacy')}
              accessibilityRole="link"
              accessibilityLabel="Datenschutzerklärung"
            >
              Datenschutzerklärung
            </Text>
            {' '}zu.
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
    paddingTop: 60,
    paddingBottom: 400, // Extra Platz damit Tastatur nicht verdeckt
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 64,
    height: 64,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
  },
  content: {
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 24,
  },
  valueProps: {
    gap: 12,
    marginBottom: 24,
  },
  valueProp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  valuePropDot: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: '700',
  },
  valuePropText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  trustSignals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  trustSignal: {
    alignItems: 'center',
    gap: 6,
  },
  trustSignalEmoji: {
    fontSize: 20,
  },
  trustSignalText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  modeToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  modeButtonTextActive: {
    color: '#3b82f6',
  },
  form: {
    gap: 14,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0f172a',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 16,
  },
  showPasswordText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3b82f6',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  legalContainer: {
    marginTop: 24,
    paddingHorizontal: 8,
  },
  legalText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
  },
  legalLink: {
    color: '#3b82f6',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -8,
    marginBottom: 8,
  },
  forgotPasswordText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
});

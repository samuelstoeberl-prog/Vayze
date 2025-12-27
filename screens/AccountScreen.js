/**
 * Account Settings Screen
 *
 * Features:
 * - Account Information Display
 * - Change Password (email provider only)
 * - Logout with confirmation
 * - Delete Account with double confirmation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import firebaseAuthService from '../services/firebaseAuthService';
import { sendPasswordReset } from '../services/passwordResetService';

const AccountScreen = ({ navigation }) => {
  const { user, signOut, isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [accountState, setAccountState] = useState(null);

  useEffect(() => {
    loadAccountInfo();
  }, []);

  /**
   * Load account state information
   */
  const loadAccountInfo = async () => {
    if (!user?.email) return;

    try {
      // Get account state from Firebase
      const currentUser = firebaseAuthService.getCurrentUser();
      if (currentUser) {
        setAccountState({
          email: currentUser.email,
          emailVerified: currentUser.emailVerified,
          createdAt: currentUser.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).getTime() : null,
          lastLogin: currentUser.metadata?.lastSignInTime ? new Date(currentUser.metadata.lastSignInTime).getTime() : null,
        });
      }
    } catch (error) {
      console.error('Failed to load account info:', error);
    }
  };

  /**
   * Handle logout with confirmation
   */
  const handleLogout = async () => {
    setShowLogoutModal(false);
    setIsLoading(true);

    try {
      await signOut();

      // Navigation handled by AuthContext/App.js
      // User will automatically see login screen when isAuthenticated = false
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Fehler', 'Abmeldung fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle email verification
   */
  const handleSendVerificationEmail = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    try {
      const { sendEmailVerification } = await import('firebase/auth');
      const { auth } = await import('../services/firebaseConfig');

      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        Alert.alert(
          'E-Mail versendet',
          'Wir haben dir eine Verifizierungs-E-Mail gesendet. Bitte überprüfe dein Postfach und klicke auf den Link.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Send verification error:', error);
      Alert.alert('Fehler', 'E-Mail konnte nicht gesendet werden. Bitte versuche es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle password change request via Firebase
   */
  const handleChangePassword = async () => {
    if (!user?.email) return;

    Alert.alert(
      'Passwort zurücksetzen',
      'Wir senden dir eine E-Mail mit einem Link zum Zurücksetzen deines Passworts.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'E-Mail senden',
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await sendPasswordReset(user.email);

              if (result.success) {
                Alert.alert(
                  'E-Mail gesendet',
                  result.message,
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert('Fehler', result.message);
              }
            } catch (error) {
              Alert.alert('Fehler', 'Passwort-Reset fehlgeschlagen. Bitte versuche es später erneut.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  /**
   * Handle account deletion - first confirmation
   */
  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  /**
   * Handle account deletion - second confirmation
   */
  const confirmDeleteAccount = () => {
    setShowDeleteModal(false);
    setShowDeleteConfirmModal(true);
    setDeleteConfirmText('');
  };

  /**
   * Final account deletion
   */
  const finalDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'LÖSCHEN') {
      Alert.alert('Fehler', 'Bitte gib "LÖSCHEN" ein, um fortzufahren.');
      return;
    }

    setShowDeleteConfirmModal(false);
    setIsLoading(true);

    try {
      // Delete Firebase account
      await firebaseAuthService.deleteAccount();

      // Sign out (will also clear all local data)
      await signOut();

      Alert.alert(
        'Konto gelöscht',
        'Dein Konto wurde erfolgreich gelöscht.',
        [{ text: 'OK' }]
      );

      // Navigation handled automatically by AuthContext
    } catch (error) {
      console.error('Account deletion error:', error);
      Alert.alert(
        'Fehler',
        'Konto konnte nicht gelöscht werden. Bitte versuche es später erneut.'
      );
    } finally {
      setIsLoading(false);
      setDeleteConfirmText('');
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unbekannt';
    return new Date(timestamp).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Konto-Einstellungen</Text>
          <Text style={styles.headerSubtitle}>Verwalte dein Vayze-Konto</Text>
        </View>

        {/* SECTION 1: Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KONTO-INFORMATIONEN</Text>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{user?.name || 'Nicht angegeben'}</Text>
            </View>

            <View style={[styles.infoRow, styles.borderTop]}>
              <Text style={styles.infoLabel}>E-Mail</Text>
              <Text style={styles.infoValue}>{user?.email || 'Nicht verfügbar'}</Text>
            </View>

            <View style={[styles.infoRow, styles.borderTop]}>
              <Text style={styles.infoLabel}>Anmeldeart</Text>
              <Text style={styles.infoValue}>
                {user?.provider === 'email' ? 'E-Mail & Passwort' : user?.provider || 'Unbekannt'}
              </Text>
            </View>

            {accountState && (
              <>
                <View style={[styles.infoRow, styles.borderTop]}>
                  <Text style={styles.infoLabel}>E-Mail verifiziert</Text>
                  <Text style={[
                    styles.infoValue,
                    accountState.emailVerified ? styles.verifiedText : styles.unverifiedText
                  ]}>
                    {accountState.emailVerified ? '✓ Verifiziert' : '○ Nicht verifiziert'}
                  </Text>
                </View>

                <View style={[styles.infoRow, styles.borderTop]}>
                  <Text style={styles.infoLabel}>Konto erstellt</Text>
                  <Text style={styles.infoValue}>{formatDate(accountState.createdAt)}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* SECTION 2: Security (only for email provider) */}
        {user?.provider === 'email' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SICHERHEIT</Text>

            {/* Email Verification - only show if not verified */}
            {accountState && !accountState.emailVerified && (
              <TouchableOpacity
                style={[styles.actionButton, styles.verificationButton]}
                onPress={handleSendVerificationEmail}
                disabled={isLoading}
                accessibilityLabel="E-Mail verifizieren"
                accessibilityRole="button"
              >
                <View style={styles.actionButtonContent}>
                  <View>
                    <Text style={styles.actionButtonTitle}>E-Mail verifizieren</Text>
                    <Text style={styles.actionButtonSubtitle}>
                      Verifizierungs-Link an deine E-Mail senden
                    </Text>
                  </View>
                  <Text style={styles.actionButtonIcon}>✉️</Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleChangePassword}
              disabled={isLoading}
              accessibilityLabel="Passwort ändern"
              accessibilityRole="button"
            >
              <View style={styles.actionButtonContent}>
                <View>
                  <Text style={styles.actionButtonTitle}>Passwort ändern</Text>
                  <Text style={styles.actionButtonSubtitle}>
                    Einen Reset-Link an deine E-Mail senden
                  </Text>
                </View>
                <Text style={styles.actionButtonIcon}>→</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* SECTION 3: Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>ACHTUNG</Text>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleDeleteAccount}
            disabled={isLoading}
          >
            <View style={styles.actionButtonContent}>
              <View>
                <Text style={[styles.actionButtonTitle, styles.dangerText]}>
                  Konto löschen
                </Text>
                <Text style={styles.actionButtonSubtitle}>
                  Alle Daten werden unwiderruflich gelöscht
                </Text>
              </View>
              <Text style={[styles.actionButtonIcon, styles.dangerText]}>⚠</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* SECTION 4: Logout */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setShowLogoutModal(true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.logoutButtonText}>Abmelden</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Abmelden?</Text>
            <Text style={styles.modalMessage}>
              Möchtest du dich wirklich abmelden? Du kannst dich jederzeit wieder anmelden.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Abbrechen</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleLogout}
              >
                <Text style={styles.modalButtonTextConfirm}>Abmelden</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account - First Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, styles.dangerText]}>⚠ Konto löschen?</Text>
            <Text style={styles.modalMessage}>
              Bist du sicher? Diese Aktion kann nicht rückgängig gemacht werden.
              {'\n\n'}
              Alle deine Entscheidungen, Einstellungen und Kontodaten werden permanent gelöscht.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Abbrechen</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDanger]}
                onPress={confirmDeleteAccount}
              >
                <Text style={styles.modalButtonTextDanger}>Fortfahren</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account - Second Confirmation Modal */}
      <Modal
        visible={showDeleteConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, styles.dangerText]}>Letzte Warnung</Text>
            <Text style={styles.modalMessage}>
              Bitte gib das Wort{' '}
              <Text style={styles.deleteKeyword}>LÖSCHEN</Text>
              {' '}ein, um dein Konto endgültig zu löschen.
            </Text>

            <TextInput
              style={styles.confirmInput}
              placeholder="LÖSCHEN"
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowDeleteConfirmModal(false);
                  setDeleteConfirmText('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Abbrechen</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDanger]}
                onPress={finalDeleteAccount}
                disabled={deleteConfirmText.trim().toUpperCase() !== 'LÖSCHEN'}
              >
                <Text style={[
                  styles.modalButtonTextDanger,
                  deleteConfirmText.trim().toUpperCase() !== 'LÖSCHEN' && styles.disabledText
                ]}>
                  Konto löschen
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A2332',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7A90',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7A90',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  dangerTitle: {
    color: '#E74C3C',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#F0F3F7',
  },
  infoLabel: {
    fontSize: 15,
    color: '#6B7A90',
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    color: '#1A2332',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  verifiedText: {
    color: '#27AE60',
  },
  unverifiedText: {
    color: '#95A5A6',
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  verificationButton: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#3b82f620',
  },
  actionButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2332',
    marginBottom: 4,
  },
  actionButtonSubtitle: {
    fontSize: 13,
    color: '#6B7A90',
  },
  actionButtonIcon: {
    fontSize: 20,
    color: '#4A90E2',
    marginLeft: 12,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: '#E74C3C20',
  },
  dangerText: {
    color: '#E74C3C',
  },
  logoutButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A2332',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#6B7A90',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteKeyword: {
    fontWeight: '700',
    color: '#E74C3C',
  },
  confirmInput: {
    borderWidth: 1,
    borderColor: '#E5E9F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F0F3F7',
  },
  modalButtonConfirm: {
    backgroundColor: '#4A90E2',
  },
  modalButtonDanger: {
    backgroundColor: '#E74C3C',
  },
  modalButtonTextCancel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7A90',
  },
  modalButtonTextConfirm: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  modalButtonTextDanger: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  disabledText: {
    opacity: 0.5,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AccountScreen;

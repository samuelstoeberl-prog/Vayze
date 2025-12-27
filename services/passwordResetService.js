/**
 * Password Reset Service
 * Firebase-based email password reset
 */

import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebaseConfig';

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const sendPasswordReset = async (email) => {
  try {
    // Validate email
    if (!email || !email.trim()) {
      return {
        success: false,
        message: 'Bitte gib eine E-Mail-Adresse ein.'
      };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: 'Bitte gib eine gültige E-Mail-Adresse ein.'
      };
    }

    if (__DEV__) {
      console.log('🔐 [passwordReset] Sending reset email to:', email);
    }

    // Send password reset email via Firebase
    await sendPasswordResetEmail(auth, email, {
      // Custom email action handler (optional)
      // url: 'https://vayze.app/reset-complete',
      handleCodeInApp: false,
    });

    if (__DEV__) {
      console.log('✅ [passwordReset] Reset email sent successfully');
    }

    return {
      success: true,
      message: 'Wir haben dir eine E-Mail mit Anweisungen zum Zurücksetzen deines Passworts gesendet. Bitte überprüfe dein Postfach.'
    };

  } catch (error) {
    console.error('❌ [passwordReset] Error:', error);

    // Handle Firebase Auth errors
    switch (error.code) {
      case 'auth/user-not-found':
        // Don't reveal if user exists (security)
        return {
          success: true,
          message: 'Falls ein Account mit dieser E-Mail existiert, haben wir dir Anweisungen zum Zurücksetzen des Passworts gesendet.'
        };

      case 'auth/invalid-email':
        return {
          success: false,
          message: 'Ungültige E-Mail-Adresse.'
        };

      case 'auth/too-many-requests':
        return {
          success: false,
          message: 'Zu viele Anfragen. Bitte versuche es später erneut.'
        };

      case 'auth/network-request-failed':
        return {
          success: false,
          message: 'Netzwerkfehler. Bitte überprüfe deine Internetverbindung.'
        };

      default:
        return {
          success: false,
          message: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.'
        };
    }
  }
};

/**
 * Verify password reset code (optional - for custom UI)
 * @param {string} code - Reset code from email
 * @returns {Promise<string>} Email address associated with code
 */
export const verifyPasswordResetCode = async (code) => {
  try {
    const { verifyPasswordResetCode } = await import('firebase/auth');
    const email = await verifyPasswordResetCode(auth, code);
    return { success: true, email };
  } catch (error) {
    console.error('❌ [passwordReset] Verify code error:', error);
    return {
      success: false,
      message: 'Ungültiger oder abgelaufener Reset-Code.'
    };
  }
};

/**
 * Confirm password reset with new password (optional - for custom UI)
 * @param {string} code - Reset code from email
 * @param {string} newPassword - New password
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const confirmPasswordReset = async (code, newPassword) => {
  try {
    const { confirmPasswordReset } = await import('firebase/auth');
    await confirmPasswordReset(auth, code, newPassword);

    return {
      success: true,
      message: 'Passwort erfolgreich zurückgesetzt.'
    };
  } catch (error) {
    console.error('❌ [passwordReset] Confirm reset error:', error);

    switch (error.code) {
      case 'auth/expired-action-code':
        return {
          success: false,
          message: 'Reset-Code ist abgelaufen. Bitte fordere einen neuen an.'
        };

      case 'auth/invalid-action-code':
        return {
          success: false,
          message: 'Ungültiger Reset-Code.'
        };

      case 'auth/weak-password':
        return {
          success: false,
          message: 'Passwort ist zu schwach. Mindestens 8 Zeichen erforderlich.'
        };

      default:
        return {
          success: false,
          message: 'Fehler beim Zurücksetzen des Passworts.'
        };
    }
  }
};

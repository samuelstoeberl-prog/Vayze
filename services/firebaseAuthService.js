/**
 * Firebase Auth Service
 * Complete Email/Password Authentication with Firebase
 * - Registration with email verification
 * - Login
 * - Password reset via email
 * - Email verification
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebaseConfig';

class FirebaseAuthService {
  /**
   * Register new user with email & password
   * Automatically sends verification email
   */
  async register(email, password, displayName = null) {
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Set display name if provided
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Send email verification
      await this.sendVerificationEmail(user);

      console.log('✅ User registered:', user.email);
      console.log('📧 Verification email sent to:', user.email);

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        },
        message: 'Account created! Please check your email to verify your account.'
      };
    } catch (error) {
      console.error('❌ Registration error:', error);
      return this._handleAuthError(error);
    }
  }

  /**
   * Login with email & password
   */
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('✅ User logged in:', user.email);
      console.log('📧 Email verified:', user.emailVerified);

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        },
        message: user.emailVerified
          ? 'Login successful!'
          : 'Login successful! Please verify your email.'
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      return this._handleAuthError(error);
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);

      console.log('📧 Password reset email sent to:', email);

      return {
        success: true,
        message: 'Password reset email sent! Check your inbox.'
      };
    } catch (error) {
      console.error('❌ Password reset error:', error);
      return this._handleAuthError(error);
    }
  }

  /**
   * Send email verification to current user
   */
  async sendVerificationEmail(user = null) {
    try {
      const currentUser = user || auth.currentUser;

      if (!currentUser) {
        throw new Error('No user logged in');
      }

      if (currentUser.emailVerified) {
        return {
          success: true,
          message: 'Email already verified!'
        };
      }

      await sendEmailVerification(currentUser);

      console.log('📧 Verification email sent to:', currentUser.email);

      return {
        success: true,
        message: 'Verification email sent! Check your inbox.'
      };
    } catch (error) {
      console.error('❌ Email verification error:', error);
      return this._handleAuthError(error);
    }
  }

  /**
   * Check if current user's email is verified
   */
  async checkEmailVerified() {
    try {
      const user = auth.currentUser;

      if (!user) {
        return { success: false, verified: false };
      }

      // Reload user to get latest verification status
      await user.reload();

      return {
        success: true,
        verified: user.emailVerified
      };
    } catch (error) {
      console.error('❌ Check verification error:', error);
      return { success: false, verified: false };
    }
  }

  /**
   * Logout current user
   */
  async logout() {
    try {
      await firebaseSignOut(auth);
      console.log('✅ User logged out');

      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return this._handleAuthError(error);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Handle Firebase Auth errors with user-friendly messages
   */
  _handleAuthError(error) {
    const errorMessages = {
      'auth/configuration-not-found': 'Firebase ist noch nicht konfiguriert. Bitte Email/Password Authentication in der Firebase Console aktivieren.',
      'auth/email-already-in-use': 'Diese E-Mail-Adresse wird bereits verwendet.',
      'auth/invalid-email': 'Ungültige E-Mail-Adresse.',
      'auth/operation-not-allowed': 'Email/Passwort Login ist nicht aktiviert.',
      'auth/weak-password': 'Passwort ist zu schwach. Mindestens 6 Zeichen erforderlich.',
      'auth/user-disabled': 'Dieser Account wurde deaktiviert.',
      'auth/user-not-found': 'Kein Account mit dieser E-Mail gefunden.',
      'auth/wrong-password': 'Falsches Passwort.',
      'auth/too-many-requests': 'Zu viele Versuche. Bitte später erneut versuchen.',
      'auth/network-request-failed': 'Netzwerkfehler. Bitte Internetverbindung prüfen.',
      'auth/invalid-credential': 'Ungültige Anmeldedaten.',
      'auth/requires-recent-login': 'Bitte melde dich erneut an, um fortzufahren.'
    };

    const message = errorMessages[error.code] || `Fehler: ${error.message}`;

    return {
      success: false,
      error: error.code,
      message
    };
  }

  /**
   * Validate email format
   */
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Validate password strength
   */
  validatePassword(password) {
    if (password.length < 6) {
      return { valid: false, message: 'Passwort muss mindestens 6 Zeichen lang sein.' };
    }
    return { valid: true, message: 'Passwort ist gültig.' };
  }
}

// Export singleton instance
const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;

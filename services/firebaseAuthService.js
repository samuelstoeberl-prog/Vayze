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
  
  async register(email, password, displayName = null) {
    try {
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (displayName) {
        await updateProfile(user, { displayName });
      }

      await this.sendVerificationEmail(user);

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
      
      return this._handleAuthError(error);
    }
  }

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

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
      
      return this._handleAuthError(error);
    }
  }

  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);

      return {
        success: true,
        message: 'Password reset email sent! Check your inbox.'
      };
    } catch (error) {
      
      return this._handleAuthError(error);
    }
  }

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

      return {
        success: true,
        message: 'Verification email sent! Check your inbox.'
      };
    } catch (error) {
      
      return this._handleAuthError(error);
    }
  }

  async checkEmailVerified() {
    try {
      const user = auth.currentUser;

      if (!user) {
        return { success: false, verified: false };
      }

      await user.reload();

      return {
        success: true,
        verified: user.emailVerified
      };
    } catch (error) {
      
      return { success: false, verified: false };
    }
  }

  async logout() {
    try {
      await firebaseSignOut(auth);

      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      
      return this._handleAuthError(error);
    }
  }

  getCurrentUser() {
    return auth.currentUser;
  }

  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

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

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validatePassword(password) {
    if (password.length < 6) {
      return { valid: false, message: 'Passwort muss mindestens 6 Zeichen lang sein.' };
    }
    return { valid: true, message: 'Passwort ist gültig.' };
  }
}

const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;

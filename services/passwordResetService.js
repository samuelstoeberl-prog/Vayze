import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebaseConfig';

export const sendPasswordReset = async (email) => {
  try {
    
    if (!email || !email.trim()) {
      return {
        success: false,
        message: 'Bitte gib eine E-Mail-Adresse ein.'
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: 'Bitte gib eine gültige E-Mail-Adresse ein.'
      };
    }

    await sendPasswordResetEmail(auth, email, {

      handleCodeInApp: false,
    });

    return {
      success: true,
      message: 'Wir haben dir eine E-Mail mit Anweisungen zum Zurücksetzen deines Passworts gesendet. Bitte überprüfe dein Postfach.'
    };

  } catch (error) {

    switch (error.code) {
      case 'auth/user-not-found':
        
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

export const verifyPasswordResetCode = async (code) => {
  try {
    const { verifyPasswordResetCode } = await import('firebase/auth');
    const email = await verifyPasswordResetCode(auth, code);
    return { success: true, email };
  } catch (error) {
        return {
      success: false,
      message: 'Ungültiger oder abgelaufener Reset-Code.'
    };
  }
};

export const confirmPasswordReset = async (code, newPassword) => {
  try {
    const { confirmPasswordReset } = await import('firebase/auth');
    await confirmPasswordReset(auth, code, newPassword);

    return {
      success: true,
      message: 'Passwort erfolgreich zurückgesetzt.'
    };
  } catch (error) {
    
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

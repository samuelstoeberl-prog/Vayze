import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import enhancedAuthService from './enhancedAuthService';

const SESSION_KEY = 'decisio_session';
const ENCRYPTED_SESSION_KEY = 'decisio_encrypted_session';
const ACCOUNT_STATES_KEY = 'decisio_account_states';
const SECURITY_EVENTS_KEY = 'decisio_security_events';
const LAST_ACTIVITY_KEY = 'decisio_last_activity';
const DEVICE_ID_KEY = 'decisio_device_id';

const SESSION_DURATION = 365 * 24 * 60 * 60 * 1000; 
const IDLE_TIMEOUT = 999 * 24 * 60 * 60 * 1000; 
const MAX_LOGIN_ATTEMPTS_PER_HOUR = 10;
const SUSPICIOUS_ACTIVITY_THRESHOLD = 3; 
const PBKDF2_ITERATIONS = 10000;

class CryptoUtils {
  
  static async randomBytes(length = 32) {
    return await Crypto.getRandomBytesAsync(length);
  }

  static async generateSecureToken() {
    const bytes = await this.randomBytes(32);
    return this.bytesToHex(bytes);
  }

  static async generateSalt() {
    const bytes = await this.randomBytes(16);
    return this.bytesToHex(bytes);
  }

  static bytesToHex(bytes) {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  static hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  static base64Encode(str) {
    
    if (typeof btoa !== 'undefined') {
      return btoa(str);
    }
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    while (i < str.length) {
      const a = str.charCodeAt(i++);
      const b = i < str.length ? str.charCodeAt(i++) : 0;
      const c = i < str.length ? str.charCodeAt(i++) : 0;

      const bitmap = (a << 16) | (b << 8) | c;
      result += chars[(bitmap >> 18) & 63];
      result += chars[(bitmap >> 12) & 63];
      result += i - 2 < str.length ? chars[(bitmap >> 6) & 63] : '=';
      result += i - 1 < str.length ? chars[bitmap & 63] : '=';
    }
    return result;
  }

  static base64Decode(str) {
    if (typeof atob !== 'undefined') {
      return atob(str);
    }
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    str = str.replace(/=+$/, '');
    let result = '';
    let bitmap = 0;
    let buffer = 0;

    for (let i = 0; i < str.length; i++) {
      buffer = (buffer << 6) | chars.indexOf(str[i]);
      bitmap += 6;
      if (bitmap >= 8) {
        bitmap -= 8;
        result += String.fromCharCode((buffer >> bitmap) & 255);
      }
    }
    return result;
  }
}

class PBKDF2 {
  static async hash(password, salt = null) {
    try {
      if (!salt) {
        salt = await CryptoUtils.generateSalt();
      }

      const combined = password + salt;

      let hash = combined;
      for (let i = 0; i < PBKDF2_ITERATIONS; i++) {
        hash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          hash
        );
      }

      return {
        hash: hash,
        salt: salt
      };
    } catch (error) {
      
      throw new Error('Fehler beim Verschlüsseln des Passworts');
    }
  }

  static async verify(password, hash, salt) {
    try {
      const result = await this.hash(password, salt);
      return result.hash === hash;
    } catch (error) {
      
      return false;
    }
  }
}

class SecureStorage {
  
  static async getEncryptionKey() {
    try {
      
      let key = await SecureStore.getItemAsync('decisio_encryption_key');

      if (!key) {
        
        const deviceFingerprint = await DeviceFingerprint.getFingerprint();
        const timestamp = Date.now().toString();
        const random = await CryptoUtils.generateSecureToken();

        key = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `${deviceFingerprint}${timestamp}${random}`
        );

        await SecureStore.setItemAsync('decisio_encryption_key', key);
      }

      return key;
    } catch (error) {

      return 'decisio_fallback_encryption_key_v2';
    }
  }

  static async encrypt(data) {
    try {
      const text = JSON.stringify(data);
      const key = await this.getEncryptionKey();
      let encrypted = '';

      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        encrypted += String.fromCharCode(charCode);
      }

      return CryptoUtils.base64Encode(encrypted);
    } catch (error) {
      
      throw new Error('Fehler beim Verschlüsseln der Daten');
    }
  }

  static async decrypt(encryptedData) {
    try {
      if (!encryptedData) return null;

      const encrypted = CryptoUtils.base64Decode(encryptedData);
      const key = await this.getEncryptionKey();
      let decrypted = '';

      for (let i = 0; i < encrypted.length; i++) {
        const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        decrypted += String.fromCharCode(charCode);
      }

      return JSON.parse(decrypted);
    } catch (error) {
      
      return null;
    }
  }

  static async setSecure(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
      return true;
    } catch (error) {

      const encrypted = await this.encrypt({ value });
      await AsyncStorage.setItem(key, encrypted);
      return true;
    }
  }

  static async getSecure(key) {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (value) return value;

      const encrypted = await AsyncStorage.getItem(key);
      if (encrypted) {
        const decrypted = await this.decrypt(encrypted);
        return decrypted?.value || null;
      }

      return null;
    } catch (error) {
      
      return null;
    }
  }

  static async deleteSecure(key) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      
      await AsyncStorage.removeItem(key);
    }
  }
}

class DeviceFingerprint {
  static _cachedFingerprint = null;

  static async getFingerprint() {
    if (this._cachedFingerprint) {
      return this._cachedFingerprint;
    }

    try {
      
      const deviceName = Device.deviceName || 'unknown';
      const brand = Device.brand || 'unknown';
      const manufacturer = Device.manufacturer || 'unknown';
      const modelName = Device.modelName || 'unknown';
      const osName = Device.osName || 'unknown';
      const osVersion = Device.osVersion || 'unknown';
      const osBuildId = Device.osBuildId || 'unknown';

      const composite = `${deviceName}_${brand}_${manufacturer}_${modelName}_${osName}_${osVersion}_${osBuildId}`;

      const fingerprint = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        composite
      );

      this._cachedFingerprint = fingerprint;

      await AsyncStorage.setItem(DEVICE_ID_KEY, fingerprint);

      return fingerprint;
    } catch (error) {

      let storedFingerprint = await AsyncStorage.getItem(DEVICE_ID_KEY);

      if (!storedFingerprint) {
        
        storedFingerprint = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem(DEVICE_ID_KEY, storedFingerprint);
      }

      this._cachedFingerprint = storedFingerprint;
      return storedFingerprint;
    }
  }

  static async getDeviceInfo() {
    try {
      return {
        fingerprint: await this.getFingerprint(),
        brand: Device.brand || 'unknown',
        manufacturer: Device.manufacturer || 'unknown',
        modelName: Device.modelName || 'unknown',
        deviceName: Device.deviceName || 'unknown',
        osName: Device.osName || 'unknown',
        osVersion: Device.osVersion || 'unknown',
        platformApiLevel: Device.platformApiLevel || 'unknown',
        deviceYearClass: Device.deviceYearClass || 'unknown'
      };
    } catch (error) {
      return {
        fingerprint: await this.getFingerprint(),
        error: 'Failed to get detailed device info'
      };
    }
  }
}

class SessionManager {
  static async createSession(user) {
    const deviceFingerprint = await DeviceFingerprint.getFingerprint();

    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      provider: user.provider,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION,
      token: await CryptoUtils.generateSecureToken(),
      deviceId: deviceFingerprint
    };

    return session;
  }

  static async saveSession(session) {
    try {
      
      const encrypted = await SecureStorage.encrypt(session);
      
      const now = Date.now().toString();

      await AsyncStorage.multiSet([
        [ENCRYPTED_SESSION_KEY, encrypted],
        [LAST_ACTIVITY_KEY, now]
      ]);
      
    } catch (error) {
      
      throw new Error('Fehler beim Speichern der Sitzung');
    }
  }

  static async getSession() {
    try {
      
      const encrypted = await AsyncStorage.getItem(ENCRYPTED_SESSION_KEY);

      if (!encrypted) {
        
        return null;
      }

      const session = await SecureStorage.decrypt(encrypted);

      if (!session) {
        
        return null;
      }

      const now = Date.now();
      const expiresIn = session.expiresAt - now;
      const daysUntilExpiry = Math.floor(expiresIn / (1000 * 60 * 60 * 24));

      if (now > session.expiresAt) {
        
        await this.clearSession();
        return null;
      }

      const lastActivity = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
      if (!lastActivity) {
        
        await AsyncStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
      }

      return session;
    } catch (error) {
      
      return null;
    }
  }

  static async updateActivity() {
    try {
      await AsyncStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    } catch (error) {
      
    }
  }

  static async clearSession() {
    try {
      await AsyncStorage.multiRemove([
        ENCRYPTED_SESSION_KEY,
        LAST_ACTIVITY_KEY,
        SESSION_KEY
      ]);
      await SecureStorage.deleteSecure('decisio_session_secure');
    } catch (error) {
      
    }
  }

  static async isSessionValid() {
    const session = await this.getSession();
    return session !== null;
  }
}

class AccountStateManager {
  static async getAccountState(email) {
    try {
      const data = await AsyncStorage.getItem(ACCOUNT_STATES_KEY);
      const states = data ? JSON.parse(data) : {};
      return states[email.toLowerCase()] || {
        emailVerified: false,
        locked: false,
        suspended: false,
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        lockedUntil: null,
        createdAt: Date.now()
      };
    } catch (error) {

      return {
        emailVerified: false,
        locked: false,
        suspended: false,
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        lockedUntil: null,
        createdAt: Date.now()
      };
    }
  }

  static async updateAccountState(email, updates) {
    try {
      const data = await AsyncStorage.getItem(ACCOUNT_STATES_KEY);
      const states = data ? JSON.parse(data) : {};

      states[email.toLowerCase()] = {
        ...states[email.toLowerCase()],
        ...updates,
        updatedAt: Date.now()
      };

      await AsyncStorage.setItem(ACCOUNT_STATES_KEY, JSON.stringify(states));
    } catch (error) {

    }
  }

  static async recordFailedLogin(email) {
    const state = await this.getAccountState(email);
    const now = Date.now();

    const updates = {
      failedLoginAttempts: state.failedLoginAttempts + 1,
      lastFailedLogin: now
    };

    if (updates.failedLoginAttempts >= 5) {
      updates.locked = true;
      updates.lockedUntil = now + (60 * 60 * 1000); 
    }

    await this.updateAccountState(email, updates);
  }

  static async recordSuccessfulLogin(email) {
    await this.updateAccountState(email, {
      failedLoginAttempts: 0,
      lastFailedLogin: null,
      lastSuccessfulLogin: Date.now()
    });
  }

  static async isAccountLocked(email) {
    const state = await this.getAccountState(email);

    if (state.locked && state.lockedUntil) {
      if (Date.now() > state.lockedUntil) {
        
        await this.updateAccountState(email, {
          locked: false,
          lockedUntil: null,
          failedLoginAttempts: 0
        });
        return false;
      }
      return true;
    }

    return state.locked || state.suspended;
  }

  static async verifyEmail(email) {
    await this.updateAccountState(email, {
      emailVerified: true,
      verifiedAt: Date.now()
    });
  }

  static async unlockAccount(email) {
    await this.updateAccountState(email, {
      locked: false,
      lockedUntil: null,
      failedLoginAttempts: 0
    });
  }
}

class SecurityLogger {
  static async logEvent(type, details) {
    try {
      const data = await AsyncStorage.getItem(SECURITY_EVENTS_KEY);
      const events = data ? JSON.parse(data) : [];

      const deviceInfo = await DeviceFingerprint.getDeviceInfo();

      events.push({
        type,
        details,
        timestamp: Date.now(),
        device: deviceInfo
      });

      const recentEvents = events.slice(-100);
      await AsyncStorage.setItem(SECURITY_EVENTS_KEY, JSON.stringify(recentEvents));

      await this.detectSuspiciousActivity(recentEvents);
    } catch (error) {

    }
  }

  static async detectSuspiciousActivity(events) {
    try {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      const oneHourAgo = now - 3600000;

      const recentFailures = events.filter(e =>
        e.type === 'login_failed' &&
        e.timestamp > oneMinuteAgo
      );

      if (recentFailures.length >= SUSPICIOUS_ACTIVITY_THRESHOLD) {
        await this.logEvent('suspicious_activity_detected', {
          reason: 'rapid_failed_logins',
          count: recentFailures.length,
          timeWindow: '1_minute'
        });

        return {
          suspicious: true,
          reason: 'Zu viele fehlgeschlagene Anmeldeversuche in kurzer Zeit',
          cooldown: 5 * 60 * 1000 
        };
      }

      const hourlyAttempts = events.filter(e =>
        (e.type === 'login_attempt' || e.type === 'login_failed') &&
        e.timestamp > oneHourAgo
      );

      if (hourlyAttempts.length >= MAX_LOGIN_ATTEMPTS_PER_HOUR) {
        return {
          suspicious: true,
          reason: 'Maximale Anzahl an Anmeldeversuchen pro Stunde erreicht',
          cooldown: 60 * 60 * 1000 
        };
      }

      return { suspicious: false };
    } catch (error) {
      
      return { suspicious: false };
    }
  }

  static async getRecentEvents(limit = 20) {
    try {
      const data = await AsyncStorage.getItem(SECURITY_EVENTS_KEY);
      const events = data ? JSON.parse(data) : [];
      return events.slice(-limit);
    } catch (error) {
      
      return [];
    }
  }
}

class SecureAuthService {
  
  async signUp(email, password, name, options = {}) {
    
    await SecurityLogger.logEvent('signup_attempt', { email });

    try {
      
      const isLocked = await AccountStateManager.isAccountLocked(email);
      if (isLocked) {
        const error = new Error('Dieses Konto ist vorübergehend gesperrt. Bitte versuche es später erneut.');
        error.title = 'Konto gesperrt';
        error.action = 'OK';
        throw error;
      }

      const user = await enhancedAuthService.signUpWithEmail(email, password, name, options);

      await AccountStateManager.updateAccountState(email, {
        emailVerified: false,
        createdAt: Date.now()
      });

      const session = await SessionManager.createSession(user);
      
      await SessionManager.saveSession(session);

      await SecurityLogger.logEvent('signup_success', { email });

      return {
        user,
        session,
        requiresEmailVerification: true
      };
    } catch (error) {
      
      await SecurityLogger.logEvent('signup_failed', { email, error: error.message });
      throw error;
    }
  }

  async signIn(email, password, options = {}) {
    
    await SecurityLogger.logEvent('login_attempt', { email });

    try {
      
      const recentEvents = await SecurityLogger.getRecentEvents(100);
      const suspiciousCheck = await SecurityLogger.detectSuspiciousActivity(recentEvents);

      if (suspiciousCheck.suspicious) {
        const error = new Error(suspiciousCheck.reason);
        error.title = 'Zu viele Versuche';
        error.action = 'OK';
        throw error;
      }

      const isLocked = await AccountStateManager.isAccountLocked(email);
      if (isLocked) {
        const error = new Error('Dein Konto ist vorübergehend gesperrt. Bitte warte eine Stunde und versuche es erneut.');
        error.title = 'Konto gesperrt';
        error.action = 'OK';
        throw error;
      }

      const user = await enhancedAuthService.signInWithEmail(email, password, options);

      await AccountStateManager.recordSuccessfulLogin(email);

      const session = await SessionManager.createSession(user);
      
      await SessionManager.saveSession(session);

      await SecurityLogger.logEvent('login_success', { email });

      return {
        user,
        session
      };
    } catch (error) {
      
      await SecurityLogger.logEvent('login_failed', { email, error: error.message });
      await AccountStateManager.recordFailedLogin(email);
      throw error;
    }
  }

  async getCurrentSession() {
    return await SessionManager.getSession();
  }

  async isAuthenticated() {
    const session = await SessionManager.getSession();
    return session !== null;
  }

  async signOut() {
    const session = await SessionManager.getSession();
    if (session) {
      await SecurityLogger.logEvent('logout', { email: session.email });
    }

    await SessionManager.clearSession();
  }

  async updateActivity() {
    await SessionManager.updateActivity();
  }

  async verifyEmail(email) {
    await AccountStateManager.verifyEmail(email);
    await SecurityLogger.logEvent('email_verified', { email });
  }

  async isEmailVerified() {
    const session = await this.getCurrentSession();
    if (!session) return false;

    const state = await AccountStateManager.getAccountState(session.email);
    return state.emailVerified;
  }

  async isAccountLocked(email) {
    return await AccountStateManager.isAccountLocked(email);
  }

  async unlockAccount(email) {
    await AccountStateManager.unlockAccount(email);
    await SecurityLogger.logEvent('account_unlocked', { email });
  }

  async requestPasswordReset(email) {
    await SecurityLogger.logEvent('password_reset_requested', { email });

    const resetToken = await CryptoUtils.generateSecureToken();

    return {
      success: true,
      message: 'Passwort-Reset-Link wurde an deine E-Mail gesendet (Simulation)',
      resetToken 
    };
  }

  async getAccountState(email) {
    return await AccountStateManager.getAccountState(email);
  }

  async getSecurityEvents(limit = 20) {
    return await SecurityLogger.getRecentEvents(limit);
  }

  async hashPassword(password, salt = null) {
    return await PBKDF2.hash(password, salt);
  }

  async verifyPassword(password, hash, salt) {
    return await PBKDF2.verify(password, hash, salt);
  }

  async deleteAccount(email) {
    await SecurityLogger.logEvent('account_deletion_requested', { email });

    try {
      
      await SessionManager.clearSession();

      const data = await AsyncStorage.getItem(ACCOUNT_STATES_KEY);
      if (data) {
        const states = JSON.parse(data);
        delete states[email.toLowerCase()];
        await AsyncStorage.setItem(ACCOUNT_STATES_KEY, JSON.stringify(states));
      }

      try {
        const usersData = await AsyncStorage.getItem('decisio_users');
        if (usersData) {
          const users = JSON.parse(usersData);
          delete users[email.toLowerCase()];
          await AsyncStorage.setItem('decisio_users', JSON.stringify(users));
        }
      } catch (error) {
        
      }

      try {
        const eventsData = await AsyncStorage.getItem(SECURITY_EVENTS_KEY);
        if (eventsData) {
          const events = JSON.parse(eventsData);
          
          const anonymizedEvents = events.map(event => ({
            ...event,
            details: {
              ...event.details,
              email: event.details?.email === email ? '[deleted]' : event.details?.email
            }
          }));
          await AsyncStorage.setItem(SECURITY_EVENTS_KEY, JSON.stringify(anonymizedEvents));
        }
      } catch (error) {
        
      }

      await AsyncStorage.removeItem('decisio_auth_user');

      try {
        await SecureStorage.deleteSecure('decisio_encryption_key');
      } catch (error) {
        
      }

      await SecurityLogger.logEvent('account_deleted', {
        email: '[deleted]',
        timestamp: Date.now()
      });

      return {
        success: true,
        message: 'Konto wurde erfolgreich gelöscht'
      };
    } catch (error) {
      
      await SecurityLogger.logEvent('account_deletion_failed', {
        email,
        error: error.message
      });

      return {
        success: false,
        message: 'Fehler beim Löschen des Kontos'
      };
    }
  }
}

export default new SecureAuthService();
export {
  SessionManager,
  AccountStateManager,
  SecurityLogger,
  PBKDF2,
  SecureStorage,
  DeviceFingerprint,
  CryptoUtils,
  SESSION_DURATION,
  IDLE_TIMEOUT
};

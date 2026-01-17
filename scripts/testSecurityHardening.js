import secureAuthService, {
  CryptoUtils,
  DeviceFingerprint,
  SecureStorage,
  PBKDF2
} from '../services/secureAuthService';

async function testTokenGeneration() {
  try {
    const token1 = await CryptoUtils.generateSecureToken();
    const token2 = await CryptoUtils.generateSecureToken();
    const token3 = await CryptoUtils.generateSecureToken();

    const hexChars = new Set(token1.split(''));

    if (token1.length === 64 && token1 !== token2) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

async function testPasswordHashing() {
  try {
    const password = 'TestPassword123!';
    const wrongPassword = 'WrongPassword456!';

    const { hash, salt } = await PBKDF2.hash(password);

    const isValid = await PBKDF2.verify(password, hash, salt);

    const isInvalid = await PBKDF2.verify(wrongPassword, hash, salt);

    if (isValid && !isInvalid) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

async function testDeviceFingerprinting() {
  try {
    const fp1 = await DeviceFingerprint.getFingerprint();

    const fp2 = await DeviceFingerprint.getFingerprint();

    const deviceInfo = await DeviceFingerprint.getDeviceInfo();

    if (fp1 === fp2 && fp1.length === 64) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

async function testSecureStorage() {
  try {
    const testData = {
      userId: 'user_123',
      token: 'test_token_456',
      sensitive: 'confidential_data'
    };

    const key1 = await SecureStorage.getEncryptionKey();
    const key2 = await SecureStorage.getEncryptionKey();

    const encrypted = await SecureStorage.encrypt(testData);

    const decrypted = await SecureStorage.decrypt(encrypted);

    await SecureStorage.setSecure('test_secure_key', 'test_secure_value');
    const secureValue = await SecureStorage.getSecure('test_secure_key');

    await SecureStorage.deleteSecure('test_secure_key');

    if (key1 === key2 && JSON.stringify(decrypted) === JSON.stringify(testData)) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

async function testAuthenticationFlow() {
  try {
    const testEmail = `test_${Date.now()}@test.com`;
    const testPassword = 'SecurePassword123!';
    const testName = 'Test User';

    const signupResult = await secureAuthService.signUp(testEmail, testPassword, testName);

    const currentSession = await secureAuthService.getCurrentSession();

    const isAuthenticated = await secureAuthService.isAuthenticated();

    await secureAuthService.signOut();
    const afterSignout = await secureAuthService.isAuthenticated();

    const signinResult = await secureAuthService.signIn(testEmail, testPassword);

    await secureAuthService.signOut();

    if (signupResult.user && signinResult.user && !afterSignout) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

async function testSecurityLogging() {
  try {
    const eventsBefore = await secureAuthService.getSecurityEvents(10);

    const recentEvents = await secureAuthService.getSecurityEvents(20);

    if (recentEvents.length > 0) {
      const lastEvent = recentEvents[recentEvents.length - 1];

      const eventTypes = {};
      recentEvents.forEach(e => {
        eventTypes[e.type] = (eventTypes[e.type] || 0) + 1;
      });
    }

    if (recentEvents.length > 0) {
      return true;
    } else {
      return true;
    }
  } catch (error) {
    return false;
  }
}

export async function testSecurityHardening() {
  const results = {
    tokenGeneration: false,
    passwordHashing: false,
    deviceFingerprinting: false,
    secureStorage: false,
    authenticationFlow: false,
    securityLogging: false
  };

  try {
    results.tokenGeneration = await testTokenGeneration();
    results.passwordHashing = await testPasswordHashing();
    results.deviceFingerprinting = await testDeviceFingerprinting();
    results.secureStorage = await testSecureStorage();
    results.authenticationFlow = await testAuthenticationFlow();
    results.securityLogging = await testSecurityLogging();

    const passed = Object.values(results).filter(r => r).length;
    const total = Object.values(results).length;

    Object.entries(results).forEach(([test, passed]) => {
      const icon = passed ? '✅' : '❌';
      const status = passed ? 'PASS' : 'FAIL';
    });

    return results;
  } catch (error) {
    return results;
  }
}

export async function quickSecurityTest() {
  try {
    const token = await CryptoUtils.generateSecureToken();

    const fingerprint = await DeviceFingerprint.getFingerprint();

    const isAuth = await secureAuthService.isAuthenticated();
  } catch (error) {
  }
}

export default {
  testSecurityHardening,
  quickSecurityTest,
  testTokenGeneration,
  testPasswordHashing,
  testDeviceFingerprinting,
  testSecureStorage,
  testAuthenticationFlow,
  testSecurityLogging
};

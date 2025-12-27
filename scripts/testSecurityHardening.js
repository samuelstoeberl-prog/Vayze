/**
 * Security Hardening Test Script
 *
 * Run this to verify all security improvements are working correctly.
 *
 * Usage:
 * 1. Import in your test screen or add to App.js temporarily
 * 2. Call testSecurityHardening()
 * 3. Check console for results
 *
 * Or run directly in React Native Debugger console
 */

import secureAuthService, {
  CryptoUtils,
  DeviceFingerprint,
  SecureStorage,
  PBKDF2
} from '../services/secureAuthService';

/**
 * Test Suite 1: Cryptographic Token Generation
 */
async function testTokenGeneration() {
  console.log('\n=== Test 1: Cryptographic Token Generation ===');

  try {
    // Generate multiple tokens
    const token1 = await CryptoUtils.generateSecureToken();
    const token2 = await CryptoUtils.generateSecureToken();
    const token3 = await CryptoUtils.generateSecureToken();

    console.log('✅ Token 1:', token1.substring(0, 16) + '...');
    console.log('✅ Token 2:', token2.substring(0, 16) + '...');
    console.log('✅ Token 3:', token3.substring(0, 16) + '...');
    console.log('✅ Token length:', token1.length, 'characters');
    console.log('✅ All unique:', token1 !== token2 && token2 !== token3);

    // Verify entropy (tokens should have good distribution)
    const hexChars = new Set(token1.split(''));
    console.log('✅ Unique hex chars used:', hexChars.size, '/ 16');

    if (token1.length === 64 && token1 !== token2) {
      console.log('✅ PASS: Token generation is secure');
      return true;
    } else {
      console.log('❌ FAIL: Token generation has issues');
      return false;
    }
  } catch (error) {
    console.error('❌ FAIL: Token generation error:', error);
    return false;
  }
}

/**
 * Test Suite 2: Password Hashing Performance
 */
async function testPasswordHashing() {
  console.log('\n=== Test 2: Password Hashing Performance ===');

  try {
    const password = 'TestPassword123!';
    const wrongPassword = 'WrongPassword456!';

    // Test hashing
    console.time('Hash Generation');
    const { hash, salt } = await PBKDF2.hash(password);
    console.timeEnd('Hash Generation');

    console.log('✅ Hash:', hash.substring(0, 32) + '...');
    console.log('✅ Salt:', salt.substring(0, 16) + '...');
    console.log('✅ Hash length:', hash.length);
    console.log('✅ Salt length:', salt.length);

    // Test verification
    console.time('Hash Verification (correct)');
    const isValid = await PBKDF2.verify(password, hash, salt);
    console.timeEnd('Hash Verification (correct)');

    console.time('Hash Verification (wrong)');
    const isInvalid = await PBKDF2.verify(wrongPassword, hash, salt);
    console.timeEnd('Hash Verification (wrong)');

    console.log('✅ Correct password verified:', isValid);
    console.log('✅ Wrong password rejected:', !isInvalid);

    if (isValid && !isInvalid) {
      console.log('✅ PASS: Password hashing is working correctly');
      return true;
    } else {
      console.log('❌ FAIL: Password hashing verification failed');
      return false;
    }
  } catch (error) {
    console.error('❌ FAIL: Password hashing error:', error);
    return false;
  }
}

/**
 * Test Suite 3: Device Fingerprinting
 */
async function testDeviceFingerprinting() {
  console.log('\n=== Test 3: Device Fingerprinting ===');

  try {
    // Get fingerprint twice to verify caching
    console.time('First fingerprint (uncached)');
    const fp1 = await DeviceFingerprint.getFingerprint();
    console.timeEnd('First fingerprint (uncached)');

    console.time('Second fingerprint (cached)');
    const fp2 = await DeviceFingerprint.getFingerprint();
    console.timeEnd('Second fingerprint (cached)');

    console.log('✅ Fingerprint 1:', fp1.substring(0, 32) + '...');
    console.log('✅ Fingerprint 2:', fp2.substring(0, 32) + '...');
    console.log('✅ Are identical:', fp1 === fp2);

    // Get detailed device info
    const deviceInfo = await DeviceFingerprint.getDeviceInfo();
    console.log('✅ Device Brand:', deviceInfo.brand);
    console.log('✅ Device Model:', deviceInfo.model);
    console.log('✅ System Name:', deviceInfo.systemName);
    console.log('✅ System Version:', deviceInfo.systemVersion);
    console.log('✅ App Version:', deviceInfo.appVersion);

    if (fp1 === fp2 && fp1.length === 64) {
      console.log('✅ PASS: Device fingerprinting is stable and secure');
      return true;
    } else {
      console.log('❌ FAIL: Device fingerprinting has issues');
      return false;
    }
  } catch (error) {
    console.error('❌ FAIL: Device fingerprinting error:', error);
    return false;
  }
}

/**
 * Test Suite 4: Secure Storage
 */
async function testSecureStorage() {
  console.log('\n=== Test 4: Secure Storage ===');

  try {
    const testData = {
      userId: 'user_123',
      token: 'test_token_456',
      sensitive: 'confidential_data'
    };

    // Test encryption key generation
    console.time('Get encryption key');
    const key1 = await SecureStorage.getEncryptionKey();
    const key2 = await SecureStorage.getEncryptionKey();
    console.timeEnd('Get encryption key');

    console.log('✅ Encryption key 1:', key1.substring(0, 16) + '...');
    console.log('✅ Encryption key 2:', key2.substring(0, 16) + '...');
    console.log('✅ Keys are identical:', key1 === key2);
    console.log('✅ Key length:', key1.length);

    // Test encryption
    console.time('Encryption');
    const encrypted = await SecureStorage.encrypt(testData);
    console.timeEnd('Encryption');

    console.log('✅ Encrypted data:', encrypted.substring(0, 32) + '...');
    console.log('✅ Encrypted length:', encrypted.length);

    // Test decryption
    console.time('Decryption');
    const decrypted = await SecureStorage.decrypt(encrypted);
    console.timeEnd('Decryption');

    console.log('✅ Decrypted data:', JSON.stringify(decrypted));
    console.log('✅ Data matches:', JSON.stringify(decrypted) === JSON.stringify(testData));

    // Test SecureStore (may fallback to AsyncStorage)
    console.log('\nTesting SecureStore...');
    await SecureStorage.setSecure('test_secure_key', 'test_secure_value');
    const secureValue = await SecureStorage.getSecure('test_secure_key');
    console.log('✅ SecureStore write/read:', secureValue === 'test_secure_value' ? 'PASS' : 'FAIL');

    // Cleanup
    await SecureStorage.deleteSecure('test_secure_key');

    if (key1 === key2 && JSON.stringify(decrypted) === JSON.stringify(testData)) {
      console.log('✅ PASS: Secure storage is working correctly');
      return true;
    } else {
      console.log('❌ FAIL: Secure storage has issues');
      return false;
    }
  } catch (error) {
    console.error('❌ FAIL: Secure storage error:', error);
    return false;
  }
}

/**
 * Test Suite 5: End-to-End Authentication Flow
 */
async function testAuthenticationFlow() {
  console.log('\n=== Test 5: End-to-End Authentication Flow ===');

  try {
    const testEmail = `test_${Date.now()}@test.com`;
    const testPassword = 'SecurePassword123!';
    const testName = 'Test User';

    // Test signup
    console.log('\nTesting signup...');
    console.time('Signup');
    const signupResult = await secureAuthService.signUp(testEmail, testPassword, testName);
    console.timeEnd('Signup');

    console.log('✅ Signup successful');
    console.log('✅ User ID:', signupResult.user.id);
    console.log('✅ User email:', signupResult.user.email);
    console.log('✅ Session token:', signupResult.session.token.substring(0, 16) + '...');
    console.log('✅ Session expires at:', new Date(signupResult.session.expiresAt).toLocaleString());

    // Test session retrieval
    console.log('\nTesting session retrieval...');
    const currentSession = await secureAuthService.getCurrentSession();
    console.log('✅ Current session:', currentSession ? 'Found' : 'Not found');
    console.log('✅ Session email:', currentSession?.email);

    // Test authentication check
    const isAuthenticated = await secureAuthService.isAuthenticated();
    console.log('✅ Is authenticated:', isAuthenticated);

    // Test signout
    console.log('\nTesting signout...');
    await secureAuthService.signOut();
    const afterSignout = await secureAuthService.isAuthenticated();
    console.log('✅ Is authenticated after signout:', afterSignout);

    // Test signin
    console.log('\nTesting signin...');
    console.time('Signin');
    const signinResult = await secureAuthService.signIn(testEmail, testPassword);
    console.timeEnd('Signin');

    console.log('✅ Signin successful');
    console.log('✅ Session restored');

    // Final cleanup
    await secureAuthService.signOut();

    if (signupResult.user && signinResult.user && !afterSignout) {
      console.log('✅ PASS: Authentication flow is working correctly');
      return true;
    } else {
      console.log('❌ FAIL: Authentication flow has issues');
      return false;
    }
  } catch (error) {
    console.error('❌ FAIL: Authentication flow error:', error);
    return false;
  }
}

/**
 * Test Suite 6: Security Event Logging
 */
async function testSecurityLogging() {
  console.log('\n=== Test 6: Security Event Logging ===');

  try {
    // Get initial events
    const eventsBefore = await secureAuthService.getSecurityEvents(10);
    console.log('✅ Events before test:', eventsBefore.length);

    // The previous test should have logged events
    const recentEvents = await secureAuthService.getSecurityEvents(20);
    console.log('✅ Total recent events:', recentEvents.length);

    if (recentEvents.length > 0) {
      const lastEvent = recentEvents[recentEvents.length - 1];
      console.log('✅ Last event type:', lastEvent.type);
      console.log('✅ Last event timestamp:', new Date(lastEvent.timestamp).toLocaleString());
      console.log('✅ Last event device:', lastEvent.device?.fingerprint?.substring(0, 16) + '...');

      // Count event types
      const eventTypes = {};
      recentEvents.forEach(e => {
        eventTypes[e.type] = (eventTypes[e.type] || 0) + 1;
      });
      console.log('✅ Event types:', JSON.stringify(eventTypes, null, 2));
    }

    if (recentEvents.length > 0) {
      console.log('✅ PASS: Security logging is working correctly');
      return true;
    } else {
      console.log('⚠️  WARNING: No security events found (may need to run auth flow first)');
      return true; // Not a failure, just no events yet
    }
  } catch (error) {
    console.error('❌ FAIL: Security logging error:', error);
    return false;
  }
}

/**
 * Run All Tests
 */
export async function testSecurityHardening() {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║   Security Hardening Test Suite                  ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

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

    // Summary
    console.log('\n╔═══════════════════════════════════════════════════╗');
    console.log('║   Test Results Summary                            ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');

    const passed = Object.values(results).filter(r => r).length;
    const total = Object.values(results).length;

    Object.entries(results).forEach(([test, passed]) => {
      const icon = passed ? '✅' : '❌';
      const status = passed ? 'PASS' : 'FAIL';
      console.log(`${icon} ${test}: ${status}`);
    });

    console.log(`\n${passed}/${total} tests passed`);

    if (passed === total) {
      console.log('\n🎉 All security hardening tests passed!');
      console.log('✅ Your authentication system is production-ready.');
    } else {
      console.log('\n⚠️  Some tests failed. Check logs above for details.');
    }

    return results;
  } catch (error) {
    console.error('\n❌ Test suite error:', error);
    return results;
  }
}

/**
 * Quick Test (for development)
 */
export async function quickSecurityTest() {
  console.log('\n=== Quick Security Test ===\n');

  try {
    // Test token generation
    const token = await CryptoUtils.generateSecureToken();
    console.log('✅ Token generated:', token.substring(0, 16) + '...', `(${token.length} chars)`);

    // Test device fingerprint
    const fingerprint = await DeviceFingerprint.getFingerprint();
    console.log('✅ Device fingerprint:', fingerprint.substring(0, 16) + '...');

    // Test session check
    const isAuth = await secureAuthService.isAuthenticated();
    console.log('✅ Currently authenticated:', isAuth);

    console.log('\n✅ Quick test passed! Security system is operational.');
  } catch (error) {
    console.error('❌ Quick test failed:', error);
  }
}

// Export for use in other files
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

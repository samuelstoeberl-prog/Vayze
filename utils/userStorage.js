/**
 * User-Scoped Storage Utilities
 * Ensures data isolation between different user accounts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Get user-scoped storage key
 * @param {string} userId - User email or ID
 * @param {string} key - Storage key (e.g., 'decisions', 'settings', 'cards')
 * @returns {string} Scoped key like 'user_test@example.com_decisions'
 */
export const getUserKey = (userId, key) => {
  if (!userId) {
    console.warn('⚠️ [userStorage] No userId provided for key:', key);
    return key; // Fallback to global key (backwards compatibility)
  }
  return `user_${userId}_${key}`;
};

/**
 * Save data for specific user
 * @param {string} userId - User email or ID
 * @param {string} key - Storage key
 * @param {any} data - Data to save (will be JSON stringified)
 */
export const saveUserData = async (userId, key, data) => {
  try {
    const scopedKey = getUserKey(userId, key);
    if (__DEV__) console.log(`💾 [userStorage] Saving ${key} for user:`, userId);
    await AsyncStorage.setItem(scopedKey, JSON.stringify(data));
    if (__DEV__) console.log(`✅ [userStorage] Saved ${key} successfully`);
  } catch (error) {
    console.error(`❌ [userStorage] Failed to save ${key}:`, error);
    throw error;
  }
};

/**
 * Load data for specific user
 * @param {string} userId - User email or ID
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if no data found
 * @returns {Promise<any>} Parsed data or defaultValue
 */
export const loadUserData = async (userId, key, defaultValue = null) => {
  try {
    const scopedKey = getUserKey(userId, key);
    if (__DEV__) console.log(`📂 [userStorage] Loading ${key} for user:`, userId);
    const data = await AsyncStorage.getItem(scopedKey);

    if (data) {
      if (__DEV__) console.log(`✅ [userStorage] Loaded ${key} successfully`);
      return JSON.parse(data);
    } else {
      if (__DEV__) console.log(`⚠️ [userStorage] No ${key} found, using default`);
      return defaultValue;
    }
  } catch (error) {
    console.error(`❌ [userStorage] Failed to load ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Remove data for specific user
 * @param {string} userId - User email or ID
 * @param {string} key - Storage key
 */
export const removeUserData = async (userId, key) => {
  try {
    const scopedKey = getUserKey(userId, key);
    if (__DEV__) console.log(`🗑️ [userStorage] Removing ${key} for user:`, userId);
    await AsyncStorage.removeItem(scopedKey);
    if (__DEV__) console.log(`✅ [userStorage] Removed ${key} successfully`);
  } catch (error) {
    console.error(`❌ [userStorage] Failed to remove ${key}:`, error);
    throw error;
  }
};

/**
 * Clear ALL data for a specific user (on logout or account deletion)
 * @param {string} userId - User email or ID
 */
export const clearUserData = async (userId) => {
  try {
    if (__DEV__) console.log(`🗑️ [userStorage] Clearing ALL data for user:`, userId);

    // List of all user-specific keys
    const userKeys = [
      'decisions',
      'settings',
      'cards',
      'history',
      'decisionData',
      'onboardingData',
    ];

    // Remove all user-scoped data
    await Promise.all(
      userKeys.map(key => removeUserData(userId, key))
    );

    if (__DEV__) console.log(`✅ [userStorage] Cleared all data for user:`, userId);
  } catch (error) {
    console.error(`❌ [userStorage] Failed to clear user data:`, error);
    throw error;
  }
};

/**
 * Migrate old global data to user-scoped storage
 * @param {string} userId - User email or ID
 * @param {string} key - Storage key
 * @param {string} oldKey - Old global key (optional, defaults to key)
 */
export const migrateToUserScope = async (userId, key, oldKey = null) => {
  try {
    const globalKey = oldKey || key;
    if (__DEV__) console.log(`🔄 [userStorage] Migrating ${globalKey} → user-scoped for:`, userId);

    // Check if user-scoped data already exists
    const scopedKey = getUserKey(userId, key);
    const existingData = await AsyncStorage.getItem(scopedKey);

    if (existingData) {
      if (__DEV__) console.log(`⚠️ [userStorage] User-scoped ${key} already exists, skipping migration`);

      // CRITICAL FIX: Still delete the global key to prevent contamination of other users
      const globalData = await AsyncStorage.getItem(globalKey);
      if (globalData) {
        await AsyncStorage.removeItem(globalKey);
        if (__DEV__) console.log(`🗑️ [userStorage] Deleted global ${globalKey} to prevent cross-user contamination`);
      }

      return;
    }

    // Load old global data
    const globalData = await AsyncStorage.getItem(globalKey);

    if (globalData) {
      // Save to user-scoped key
      await AsyncStorage.setItem(scopedKey, globalData);
      if (__DEV__) console.log(`✅ [userStorage] Migrated ${globalKey} to user-scoped successfully`);

      // CRITICAL: Remove old global data after migration to prevent sharing with other users
      await AsyncStorage.removeItem(globalKey);
      if (__DEV__) console.log(`🗑️ [userStorage] Deleted global ${globalKey} to prevent cross-user contamination`);
    } else {
      if (__DEV__) console.log(`⚠️ [userStorage] No global ${globalKey} found to migrate`);
    }
  } catch (error) {
    console.error(`❌ [userStorage] Failed to migrate ${key}:`, error);
    throw error;
  }
};

/**
 * Get all keys for a specific user (for debugging)
 * @param {string} userId - User email or ID
 * @returns {Promise<string[]>} Array of all user-scoped keys
 */
export const getUserKeys = async (userId) => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const userPrefix = `user_${userId}_`;
    return allKeys.filter(key => key.startsWith(userPrefix));
  } catch (error) {
    console.error('❌ [userStorage] Failed to get user keys:', error);
    return [];
  }
};

/**
 * Clear all legacy global data (for cleanup after migration bugs)
 * Use this to remove contaminated global data
 */
export const clearLegacyGlobalData = async () => {
  try {
    if (__DEV__) console.log('🧹 [userStorage] Clearing all legacy global data...');

    const legacyKeys = [
      'completedDecisions',
      'appSettings',
      'decisionData',
      'decisio_cards_v2',
      'decisio_history',
      'onboardingData'
      // NOTE: 'hasLaunched' is now a device-level flag (not user-scoped), so we keep it
    ];

    await Promise.all(
      legacyKeys.map(async (key) => {
        const exists = await AsyncStorage.getItem(key);
        if (exists) {
          await AsyncStorage.removeItem(key);
          if (__DEV__) console.log(`🗑️ [userStorage] Deleted legacy key: ${key}`);
        }
      })
    );

    if (__DEV__) console.log('✅ [userStorage] Legacy global data cleared');
    return { success: true };
  } catch (error) {
    console.error('❌ [userStorage] Failed to clear legacy data:', error);
    return { success: false, error };
  }
};

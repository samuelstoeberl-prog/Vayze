/**
 * Emergency Script: Clear ALL AsyncStorage
 * Use this to completely reset the app state
 *
 * Usage: In the app, press "Clear All Storage" button (dev mode only)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearAllStorage = async () => {
  try {
    console.log('🧹 [clearAllStorage] Starting complete storage wipe...');

    // Get all keys
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('📦 [clearAllStorage] Found keys:', allKeys);

    // Clear everything
    await AsyncStorage.multiRemove(allKeys);

    console.log('✅ [clearAllStorage] All storage cleared!');
    console.log('🔄 [clearAllStorage] Please reload the app');

    return { success: true, keysCleared: allKeys.length };
  } catch (error) {
    console.error('❌ [clearAllStorage] Failed:', error);
    return { success: false, error: error.message };
  }
};

// Quick function to see what's stored
export const debugStorage = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('📦 [debugStorage] All AsyncStorage Keys:');

    for (const key of allKeys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`  ${key}:`, value?.substring(0, 100) + (value?.length > 100 ? '...' : ''));
    }

    return allKeys;
  } catch (error) {
    console.error('❌ [debugStorage] Failed:', error);
    return [];
  }
};

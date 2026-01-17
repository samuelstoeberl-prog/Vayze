import AsyncStorage from '@react-native-async-storage/async-storage';

export const getUserKey = (userId, key) => {
  if (!userId) {
    
    return key; 
  }
  return `user_${userId}_${key}`;
};

export const saveUserData = async (userId, key, data) => {
  try {
    const scopedKey = getUserKey(userId, key);
    await AsyncStorage.setItem(scopedKey, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

export const loadUserData = async (userId, key, defaultValue = null) => {
  try {
    const scopedKey = getUserKey(userId, key);
    const data = await AsyncStorage.getItem(scopedKey);

    if (data) {
      return JSON.parse(data);
    } else {
      return defaultValue;
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    return defaultValue;
  }
};

export const removeUserData = async (userId, key) => {
  try {
    const scopedKey = getUserKey(userId, key);
    await AsyncStorage.removeItem(scopedKey);
  } catch (error) {
    console.error('Error removing user data:', error);
    throw error;
  }
};

export const clearUserData = async (userId) => {
  try {
    const userKeys = [
      'decisions',
      'settings',
      'cards',
      'history',
      'decisionData',
      'onboardingData',
    ];

    await Promise.all(
      userKeys.map(key => removeUserData(userId, key))
    );
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw error;
  }
};

export const migrateToUserScope = async (userId, key, oldKey = null) => {
  try {
    const globalKey = oldKey || key;
    const scopedKey = getUserKey(userId, key);
    const existingData = await AsyncStorage.getItem(scopedKey);

    if (existingData) {
      const globalData = await AsyncStorage.getItem(globalKey);
      if (globalData) {
        await AsyncStorage.removeItem(globalKey);
      }
      return;
    }

    const globalData = await AsyncStorage.getItem(globalKey);

    if (globalData) {
      await AsyncStorage.setItem(scopedKey, globalData);
      await AsyncStorage.removeItem(globalKey);
    }
  } catch (error) {
    console.error('Error migrating to user scope:', error);
    throw error;
  }
};

export const getUserKeys = async (userId) => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const userPrefix = `user_${userId}_`;
    return allKeys.filter(key => key.startsWith(userPrefix));
  } catch (error) {
    console.error('Error getting user keys:', error);
    return [];
  }
};

export const clearLegacyGlobalData = async () => {
  try {
    const legacyKeys = [
      'completedDecisions',
      'appSettings',
      'decisionData',
      'decisio_cards_v2',
      'decisio_history',
      'onboardingData'
    ];

    await Promise.all(
      legacyKeys.map(async (key) => {
        const exists = await AsyncStorage.getItem(key);
        if (exists) {
          await AsyncStorage.removeItem(key);
        }
      })
    );

    return { success: true };
  } catch (error) {
    console.error('Error clearing legacy global data:', error);
    return { success: false, error };
  }
};

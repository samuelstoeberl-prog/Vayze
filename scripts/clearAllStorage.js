import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearAllStorage = async () => {
  try {

    const allKeys = await AsyncStorage.getAllKeys();

    await AsyncStorage.multiRemove(allKeys);

    return { success: true, keysCleared: allKeys.length };
  } catch (error) {
    
    return { success: false, error: error.message };
  }
};

export const debugStorage = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();

    for (const key of allKeys) {
      const value = await AsyncStorage.getItem(key);
       + (value?.length > 100 ? '...' : ''));
    }

    return allKeys;
  } catch (error) {
    
    return [];
  }
};

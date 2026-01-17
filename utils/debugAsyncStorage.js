import AsyncStorage from '@react-native-async-storage/async-storage';

export async function debugShowAllUsers() {
  try {

    const usersData = await AsyncStorage.getItem('decisio_users_db');

    if (!usersData) {
      ');
      return;
    }

    const usersArray = JSON.parse(usersData);
    const usersMap = new Map(usersArray);

    for (const [email, user] of usersMap.entries()) {

      .toLocaleString()}`);
      }...`);
      
    }

  } catch (error) {
    
  }
}

export async function debugShowAllKeys() {
  try {
    
    const keys = await AsyncStorage.getAllKeys();

    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      const valuePreview = value ? value.substring(0, 100) : 'null';

    }

  } catch (error) {
    
  }
}

export async function debugClearAllUsers() {
  try {
    
    await AsyncStorage.removeItem('decisio_users_db');
    
  } catch (error) {
    
  }
}

export async function debugCheckUserExists(email) {
  try {

    const usersData = await AsyncStorage.getItem('decisio_users_db');

    if (!usersData) {
      
      return false;
    }

    const usersArray = JSON.parse(usersData);
    const usersMap = new Map(usersArray);

    const user = usersMap.get(email.toLowerCase());

    if (user) {

      .toLocaleString()}`);
      return true;
    } else {
      
      ).join(', ')}`);
      return false;
    }
  } catch (error) {
    
    return false;
  }
}

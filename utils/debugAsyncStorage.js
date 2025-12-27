/**
 * Debug Utilities for AsyncStorage
 * Hilft bei der Diagnose von Authentication-Problemen
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Zeigt alle gespeicherten User in der Konsole
 */
export async function debugShowAllUsers() {
  try {
    console.log('\n🔍 [DEBUG] === AsyncStorage User Database ===');

    const usersData = await AsyncStorage.getItem('decisio_users_db');

    if (!usersData) {
      console.log('❌ Keine User-Datenbank gefunden (decisio_users_db ist leer)');
      return;
    }

    const usersArray = JSON.parse(usersData);
    const usersMap = new Map(usersArray);

    console.log(`✅ Gefunden: ${usersMap.size} Benutzer\n`);

    for (const [email, user] of usersMap.entries()) {
      console.log(`📧 Email: ${email}`);
      console.log(`   👤 Name: ${user.name}`);
      console.log(`   🆔 ID: ${user.id}`);
      console.log(`   📅 Erstellt: ${new Date(user.createdAt).toLocaleString()}`);
      console.log(`   🔐 Passwort Hash: ${user.password.substring(0, 10)}...`);
      console.log('');
    }

    console.log('=== Ende ===\n');
  } catch (error) {
    console.error('❌ Fehler beim Lesen der User-Datenbank:', error);
  }
}

/**
 * Zeigt alle AsyncStorage Keys
 */
export async function debugShowAllKeys() {
  try {
    console.log('\n🔍 [DEBUG] === Alle AsyncStorage Keys ===');
    const keys = await AsyncStorage.getAllKeys();

    console.log(`Gefunden: ${keys.length} Keys\n`);

    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      const valuePreview = value ? value.substring(0, 100) : 'null';
      console.log(`📌 ${key}`);
      console.log(`   Länge: ${value ? value.length : 0} Zeichen`);
      console.log(`   Preview: ${valuePreview}...`);
      console.log('');
    }

    console.log('=== Ende ===\n');
  } catch (error) {
    console.error('❌ Fehler beim Lesen der Keys:', error);
  }
}

/**
 * Löscht alle User-Daten (VORSICHT!)
 */
export async function debugClearAllUsers() {
  try {
    console.log('⚠️ [DEBUG] Lösche alle User-Daten...');
    await AsyncStorage.removeItem('decisio_users_db');
    console.log('✅ User-Datenbank gelöscht');
  } catch (error) {
    console.error('❌ Fehler beim Löschen:', error);
  }
}

/**
 * Testet ob ein spezifischer User existiert
 */
export async function debugCheckUserExists(email) {
  try {
    console.log(`\n🔍 [DEBUG] Prüfe User: ${email}`);

    const usersData = await AsyncStorage.getItem('decisio_users_db');

    if (!usersData) {
      console.log('❌ Keine User-Datenbank gefunden');
      return false;
    }

    const usersArray = JSON.parse(usersData);
    const usersMap = new Map(usersArray);

    const user = usersMap.get(email.toLowerCase());

    if (user) {
      console.log('✅ User gefunden:');
      console.log(`   Name: ${user.name}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Erstellt: ${new Date(user.createdAt).toLocaleString()}`);
      return true;
    } else {
      console.log('❌ User nicht gefunden');
      console.log(`   Verfügbare Emails: ${Array.from(usersMap.keys()).join(', ')}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Fehler:', error);
    return false;
  }
}

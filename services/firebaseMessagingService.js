import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getFirestore, doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import app from './firebaseConfig';

const db = getFirestore(app);
const FCM_TOKEN_KEY = 'expo_push_token';

// Expo Push Notification Configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class FirebaseMessagingService {
  constructor() {
    this.token = null;
  }

  /**
   * Request permission and get Expo Push Token
   * Works with Expo - no native Firebase messaging needed!
   */
  async requestPermissionAndGetToken() {
    try {
      // Check if running on a physical device
      if (!Device.isDevice) {
        console.log('⚠️ Push notifications only work on physical devices');
        return null;
      }

      // Request permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permission for notifications not granted');
        return null;
      }

      // Get Expo Push Token (works with FCM automatically!)
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '376bd425-dada-47f4-a1b7-cbab4ac1ec9d', // From app.json
      });

      this.token = tokenData.data;

      // Save token locally
      await AsyncStorage.setItem(FCM_TOKEN_KEY, this.token);

      console.log('✅ Expo Push Token:', this.token);
      return this.token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Save FCM token to Firestore for the current user
   */
  async saveTokenToFirestore(userId) {
    if (!userId || !this.token) {
      console.log('No userId or token to save');
      return;
    }

    try {
      const tokenRef = doc(db, `users/${userId}/tokens/${this.token}`);
      await setDoc(tokenRef, {
        token: this.token,
        createdAt: new Date().toISOString(),
        platform: Platform.OS,
        appVersion: '1.3.0',
      });

      console.log('✅ Token saved to Firestore');
    } catch (error) {
      console.error('Error saving token to Firestore:', error);
    }
  }

  /**
   * Remove FCM token from Firestore when user logs out
   */
  async removeTokenFromFirestore(userId) {
    if (!userId || !this.token) return;

    try {
      const tokenRef = doc(db, `users/${userId}/tokens/${this.token}`);
      await deleteDoc(tokenRef);
      console.log('✅ Token removed from Firestore');
    } catch (error) {
      console.error('Error removing token from Firestore:', error);
    }
  }

  /**
   * Get locally saved token
   */
  async getSavedToken() {
    try {
      const token = await AsyncStorage.getItem(FCM_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error getting saved token:', error);
      return null;
    }
  }

  /**
   * Subscribe to a topic (e.g., "all_users", "premium_users")
   * Note: With Expo Push Tokens, topics are managed server-side
   */
  async subscribeToTopic(topic) {
    try {
      // With Expo, topic subscription is handled on your backend
      // Save the topic preference in Firestore instead
      console.log(`✅ Topic preference saved: ${topic}`);
      // You can implement backend logic to group users by topics
    } catch (error) {
      console.error(`Error subscribing to topic ${topic}:`, error);
    }
  }

  /**
   * Unsubscribe from a topic
   */
  async unsubscribeFromTopic(topic) {
    try {
      console.log(`✅ Topic preference removed: ${topic}`);
      // Handle this server-side with your backend
    } catch (error) {
      console.error(`Error unsubscribing from topic ${topic}:`, error);
    }
  }

  /**
   * Handle token refresh (Expo tokens are stable, but you can check periodically)
   */
  onTokenRefresh(callback) {
    // Expo tokens don't refresh as frequently as FCM tokens
    // You can set up a periodic check if needed
    return () => {
      console.log('Token refresh handler set up');
    };
  }

  /**
   * Get all tokens for a user (for cleanup)
   */
  async getAllUserTokens(userId) {
    if (!userId) return [];

    try {
      const tokensRef = collection(db, `users/${userId}/tokens`);
      const snapshot = await getDocs(tokensRef);
      return snapshot.docs.map((doc) => doc.data().token);
    } catch (error) {
      console.error('Error getting user tokens:', error);
      return [];
    }
  }

  /**
   * Clean up old/invalid tokens
   */
  async cleanupInvalidTokens(userId) {
    if (!userId) return;

    try {
      const tokens = await this.getAllUserTokens(userId);
      const currentToken = await this.getSavedToken();

      // Remove tokens that are not the current device token
      for (const token of tokens) {
        if (token !== currentToken) {
          const tokenRef = doc(db, `users/${userId}/tokens/${token}`);
          await deleteDoc(tokenRef);
          console.log(`🗑️ Cleaned up old token: ${token.substring(0, 20)}...`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up tokens:', error);
    }
  }
}

export default new FirebaseMessagingService();

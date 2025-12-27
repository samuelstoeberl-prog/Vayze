/**
 * Notification Service
 * Handles daily motivational notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PERMISSION_KEY = 'notification_permission_asked';
const NOTIFICATION_ENABLED_KEY = 'notifications_enabled';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Motivational messages (10 variations)
const MOTIVATIONAL_MESSAGES = [
  {
    title: '🧠 Zeit für eine kluge Entscheidung',
    body: 'Treffe heute eine durchdachte Wahl mit Vayze',
  },
  {
    title: '✨ Deine beste Entscheidung wartet',
    body: 'Klarheit beginnt mit dem ersten Schritt',
  },
  {
    title: '🎯 Bereit für Klarheit?',
    body: 'Nutze Vayze für deine nächste wichtige Entscheidung',
  },
  {
    title: '💡 Entscheidungen mit Zuversicht',
    body: 'Analysiere deine Optionen und triff die richtige Wahl',
  },
  {
    title: '🌟 Dein Entscheidungs-Moment',
    body: 'Finde heraus, was wirklich zählt',
  },
  {
    title: '🚀 Fortschritt beginnt jetzt',
    body: 'Eine gute Entscheidung kann alles verändern',
  },
  {
    title: '🎨 Gestalte dein Leben',
    body: 'Jede Entscheidung ist ein Schritt in die richtige Richtung',
  },
  {
    title: '🔮 Klarheit finden',
    body: 'Vayze hilft dir, die richtige Wahl zu treffen',
  },
  {
    title: '💪 Selbstbewusst entscheiden',
    body: 'Du hast die Kontrolle über deine Entscheidungen',
  },
  {
    title: '🌈 Mach es möglich',
    body: 'Zeit, eine Entscheidung zu treffen, auf die du stolz bist',
  },
];

class NotificationService {
  /**
   * Request notification permissions
   */
  async requestPermissions() {
    try {
      if (!Device.isDevice) {
        if (__DEV__) console.log('📱 [Notifications] Must use physical device for push notifications');
        return { granted: false, reason: 'emulator' };
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        if (__DEV__) console.log('❌ [Notifications] Permission denied');
        return { granted: false, reason: 'denied' };
      }

      if (__DEV__) console.log('✅ [Notifications] Permission granted');

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('daily-reminder', {
          name: 'Tägliche Erinnerungen',
          description: 'Motivierende tägliche Benachrichtigungen',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3B82F6',
          sound: 'default',
        });
      }

      return { granted: true };
    } catch (error) {
      console.error('❌ [Notifications] Permission error:', error);
      return { granted: false, reason: 'error', error };
    }
  }

  /**
   * Check if permission has been asked before
   */
  async hasAskedPermission() {
    try {
      const asked = await AsyncStorage.getItem(NOTIFICATION_PERMISSION_KEY);
      return asked === 'true';
    } catch (error) {
      console.error('Failed to check permission status:', error);
      return false;
    }
  }

  /**
   * Mark permission as asked
   */
  async markPermissionAsked() {
    try {
      await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');
    } catch (error) {
      console.error('Failed to mark permission asked:', error);
    }
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled() {
    try {
      const enabled = await AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Failed to check notifications enabled:', error);
      return false;
    }
  }

  /**
   * Enable notifications
   */
  async enableNotifications() {
    try {
      await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, 'true');
      await this.scheduleDailyNotification();
      if (__DEV__) console.log('✅ [Notifications] Enabled and scheduled');
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      throw error;
    }
  }

  /**
   * Disable notifications
   */
  async disableNotifications() {
    try {
      await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, 'false');
      await this.cancelAllNotifications();
      if (__DEV__) console.log('🔕 [Notifications] Disabled and cancelled');
    } catch (error) {
      console.error('Failed to disable notifications:', error);
      throw error;
    }
  }

  /**
   * Schedule daily notification at optimal time (19:00 / 7 PM)
   */
  async scheduleDailyNotification() {
    try {
      // Cancel existing notifications first
      await this.cancelAllNotifications();

      // Pick a random motivational message
      const randomMessage = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];

      // Schedule for 19:00 (7 PM) daily
      const trigger = {
        hour: 19,
        minute: 0,
        repeats: true,
      };

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: randomMessage.title,
          body: randomMessage.body,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          ...(Platform.OS === 'android' && {
            channelId: 'daily-reminder',
          }),
        },
        trigger,
      });

      if (__DEV__) console.log('📅 [Notifications] Scheduled daily notification at 19:00. ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ [Notifications] Failed to schedule:', error);
      throw error;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (__DEV__) console.log('🔕 [Notifications] Cancelled all notifications');
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  /**
   * Send immediate test notification (for testing)
   */
  async sendTestNotification() {
    try {
      const randomMessage = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: randomMessage.title,
          body: randomMessage.body,
          sound: 'default',
          ...(Platform.OS === 'android' && {
            channelId: 'daily-reminder',
          }),
        },
        trigger: { seconds: 2 }, // Send in 2 seconds
      });

      if (__DEV__) console.log('🧪 [Notifications] Test notification sent');
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  }

  /**
   * Get all scheduled notifications (for debugging)
   */
  async getScheduledNotifications() {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      if (__DEV__) console.log('📋 [Notifications] Scheduled:', scheduled);
      return scheduled;
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }
}

export default new NotificationService();

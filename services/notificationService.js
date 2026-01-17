import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PERMISSION_KEY = 'notification_permission_asked';
const NOTIFICATION_ENABLED_KEY = 'notifications_enabled';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
  
  async requestPermissions() {
    try {
      if (!Device.isDevice) {
        return { granted: false, reason: 'emulator' };
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return { granted: false, reason: 'denied' };
      }

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
            return { granted: false, reason: 'error', error };
    }
  }

  async hasAskedPermission() {
    try {
      const asked = await AsyncStorage.getItem(NOTIFICATION_PERMISSION_KEY);
      return asked === 'true';
    } catch (error) {
            return false;
    }
  }

  async markPermissionAsked() {
    try {
      await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');
    } catch (error) {
          }
  }

  async areNotificationsEnabled() {
    try {
      const enabled = await AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
            return false;
    }
  }

  async enableNotifications() {
    try {
      await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, 'true');
      await this.scheduleDailyNotification();
      } catch (error) {
            throw error;
    }
  }

  async disableNotifications() {
    try {
      await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, 'false');
      await this.cancelAllNotifications();
      } catch (error) {
            throw error;
    }
  }

  async scheduleDailyNotification() {
    try {
      
      await this.cancelAllNotifications();

      const randomMessage = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];

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

      return notificationId;
    } catch (error) {
            throw error;
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      } catch (error) {
          }
  }

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
        trigger: { seconds: 2 }, 
      });

      } catch (error) {
            throw error;
    }
  }

  async getScheduledNotifications() {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      return scheduled;
    } catch (error) {
            return [];
    }
  }
}

export default new NotificationService();

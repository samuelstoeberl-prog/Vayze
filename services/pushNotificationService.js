import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are displayed
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class PushNotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
  }

  /**
   * Initialize push notification handlers (Expo version)
   */
  async initialize() {
    try {
      // Create notification channels for Android
      await this.createNotificationChannel();

      // Listen for notification taps
      this.setupNotificationListeners();

      console.log('✅ Push notification service initialized');
      return () => {
        this.cleanup();
      };
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  /**
   * Display notification using Expo Notifications
   */
  async displayNotification(remoteMessage) {
    try {
      const { notification, data } = remoteMessage;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification?.title || 'Vayze',
          body: notification?.body || '',
          data: data || {},
          sound: 'default',
          ...(Platform.OS === 'android' && {
            channelId: 'default',
          }),
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error displaying notification:', error);
    }
  }

  /**
   * Setup notification listeners for user interactions
   */
  setupNotificationListeners() {
    // Notification received while app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📨 Notification received:', notification);
        // You can update UI, show badge, etc.
      }
    );

    // Notification tapped by user
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Notification tapped:', response);
        const data = response.notification.request.content.data;

        // Handle navigation based on notification data
        this.handleNotificationPress(data);
      }
    );
  }

  /**
   * Handle notification press and navigate to appropriate screen
   */
  handleNotificationPress(data) {
    console.log('Handling notification press:', data);

    // Example: Navigate to different screens based on data
    const { type, screen, decisionId } = data;

    if (type === 'decision_reminder') {
      // Navigate to decision screen
      console.log('Navigate to decision:', decisionId);
    } else if (screen === 'board') {
      // Navigate to board
      console.log('Navigate to board');
    } else if (screen === 'tracker') {
      // Navigate to tracker
      console.log('Navigate to tracker');
    }

    // You'll need to integrate with your navigation system
    // Example: navigationRef.current?.navigate(screen);
  }

  /**
   * Send a local test notification
   */
  async sendTestNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 Test Notification',
          body: 'Push notifications are working!',
          data: { type: 'test', screen: 'board' },
          sound: 'default',
          ...(Platform.OS === 'android' && {
            channelId: 'default',
          }),
        },
        trigger: { seconds: 2 },
      });

      console.log('✅ Test notification scheduled');
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }

  /**
   * Get notification permissions status
   */
  async getPermissionsStatus() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error getting permissions status:', error);
      return false;
    }
  }

  /**
   * Create notification channel for Android
   */
  async createNotificationChannel() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        description: 'Default notification channel',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
        sound: 'default',
      });

      // Additional channels for different notification types
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Erinnerungen',
        description: 'Tägliche Erinnerungen und Motivationen',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('updates', {
        name: 'Updates',
        description: 'App-Updates und neue Features',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 200],
        lightColor: '#10b981',
        sound: 'default',
      });

      console.log('✅ Notification channels created');
    }
  }

  /**
   * Check if notification was opened from quit state (Expo version)
   */
  async getInitialNotification() {
    try {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response) {
        console.log('📩 App opened from notification:', response);
        this.handleNotificationPress(response.notification.request.content.data);
      }
      return response;
    } catch (error) {
      console.error('Error getting initial notification:', error);
      return null;
    }
  }

  /**
   * Cleanup listeners
   */
  cleanup() {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }
}

export default new PushNotificationService();

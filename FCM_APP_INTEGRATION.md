# FCM Integration in App.js

## Füge diese Imports hinzu:

```javascript
import firebaseMessagingService from './services/firebaseMessagingService';
import pushNotificationService from './services/pushNotificationService';
```

## In der MainApp-Komponente:

```javascript
function MainApp() {
  const { isAuthenticated, user } = useAuth();

  // ... existing state ...

  // FCM Setup
  useEffect(() => {
    let unsubscribe;

    const setupFCM = async () => {
      try {
        // Initialize push notification handlers
        await pushNotificationService.initialize();
        await pushNotificationService.createNotificationChannel();

        // Request FCM permission and get token
        const token = await firebaseMessagingService.requestPermissionAndGetToken();

        if (token && user?.email) {
          // Save token to Firestore
          await firebaseMessagingService.saveTokenToFirestore(user.email);

          // Subscribe to topics
          await firebaseMessagingService.subscribeToTopic('all_users');

          // Cleanup old tokens
          await firebaseMessagingService.cleanupInvalidTokens(user.email);
        }

        // Handle token refresh
        unsubscribe = firebaseMessagingService.onTokenRefresh(async (newToken) => {
          if (user?.email) {
            await firebaseMessagingService.saveTokenToFirestore(user.email);
          }
        });

        // Check if app was opened from notification
        await pushNotificationService.getInitialNotification();
      } catch (error) {
        console.error('FCM Setup Error:', error);
      }
    };

    if (isAuthenticated && user) {
      setupFCM();
    }

    return () => {
      if (unsubscribe) unsubscribe();
      pushNotificationService.cleanup();
    };
  }, [isAuthenticated, user]);

  // Cleanup on logout
  const handleSignOut = async () => {
    try {
      if (user?.email) {
        // Remove FCM token before logout
        await firebaseMessagingService.removeTokenFromFirestore(user.email);
        await firebaseMessagingService.unsubscribeFromTopic('all_users');
      }
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ... rest of your component
}
```

## Optional: Test-Button in AccountScreen

Füge einen Test-Button in deinen AccountScreen ein:

```javascript
import pushNotificationService from '../services/pushNotificationService';

// In AccountScreen:
<TouchableOpacity
  style={styles.testButton}
  onPress={() => pushNotificationService.sendTestNotification()}
>
  <Text style={styles.testButtonText}>🔔 Test Push Notification</Text>
</TouchableOpacity>
```

---

## Alternative: Separate FCM-Komponente erstellen

Erstelle eine neue Datei `components/FCMHandler.js`:

```javascript
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import firebaseMessagingService from '../services/firebaseMessagingService';
import pushNotificationService from '../services/pushNotificationService';

export default function FCMHandler() {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    let unsubscribe;

    const setupFCM = async () => {
      try {
        await pushNotificationService.initialize();
        await pushNotificationService.createNotificationChannel();

        const token = await firebaseMessagingService.requestPermissionAndGetToken();

        if (token && user?.email) {
          await firebaseMessagingService.saveTokenToFirestore(user.email);
          await firebaseMessagingService.subscribeToTopic('all_users');
          await firebaseMessagingService.cleanupInvalidTokens(user.email);
        }

        unsubscribe = firebaseMessagingService.onTokenRefresh(async (newToken) => {
          if (user?.email) {
            await firebaseMessagingService.saveTokenToFirestore(user.email);
          }
        });

        await pushNotificationService.getInitialNotification();
      } catch (error) {
        console.error('FCM Setup Error:', error);
      }
    };

    if (isAuthenticated && user) {
      setupFCM();
    }

    return () => {
      if (unsubscribe) unsubscribe();
      pushNotificationService.cleanup();
    };
  }, [isAuthenticated, user]);

  return null;
}
```

Dann füge in App.js ein:

```javascript
import FCMHandler from './components/FCMHandler';

// In der Return-Funktion:
return (
  <AuthProvider>
    <FCMHandler />
    {/* Rest of your app */}
  </AuthProvider>
);
```

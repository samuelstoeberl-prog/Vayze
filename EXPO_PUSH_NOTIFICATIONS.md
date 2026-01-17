# 📱 Expo Push Notifications - Setup Guide

## ✅ Was du bereits hast:

- ✅ `@react-native-firebase/messaging` installiert (wird nicht benötigt für Expo!)
- ✅ `expo-notifications` bereits konfiguriert
- ✅ Services wurden auf Expo umgeschrieben

---

## 🎯 Wie Expo Push Notifications funktionieren:

**Expo macht Push Notifications viel einfacher!**

1. Du brauchst **KEIN** `google-services.json`
2. Du brauchst **KEIN** `@react-native-firebase/messaging`
3. Expo kümmert sich automatisch um FCM/APNs

**Expo Push Tokens** funktionieren mit FCM und APNs automatisch!

---

## 🚀 Setup (nur 3 Schritte!)

### 1️⃣ Services sind bereits fertig! ✅

- `services/firebaseMessagingService.js` - Nutzt Expo Notifications
- `services/pushNotificationService.js` - Nutzt Expo Notifications

### 2️⃣ In App.js integrieren (5 Min)

Füge diese Imports hinzu:

```javascript
import firebaseMessagingService from './services/firebaseMessagingService';
import pushNotificationService from './services/pushNotificationService';
```

Füge in der `MainApp` Komponente ein:

```javascript
function MainApp() {
  const { isAuthenticated, user } = useAuth();

  // Push Notifications Setup
  useEffect(() => {
    let cleanup;

    const setupPushNotifications = async () => {
      try {
        // Initialize push notification handlers
        cleanup = await pushNotificationService.initialize();

        // Request permission and get token
        const token = await firebaseMessagingService.requestPermissionAndGetToken();

        if (token && user?.email) {
          // Save token to Firestore
          await firebaseMessagingService.saveTokenToFirestore(user.email);
          console.log('✅ Token saved for user:', user.email);

          // Subscribe to topics (optional)
          await firebaseMessagingService.subscribeToTopic('all_users');

          // Clean up old tokens
          await firebaseMessagingService.cleanupInvalidTokens(user.email);
        }

        // Check if app was opened from notification
        await pushNotificationService.getInitialNotification();
      } catch (error) {
        console.error('Push notification setup error:', error);
      }
    };

    if (isAuthenticated && user) {
      setupPushNotifications();
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, [isAuthenticated, user]);

  // ... rest of your code
}
```

### 3️⃣ Test auf echtem Gerät (10 Min)

```bash
# Starte Expo
npm start

# Scanne QR Code mit Expo Go App auf deinem Handy
# ODER baue die App:
npx expo run:android
```

**Check Console für:**
```
✅ Expo Push Token: ExponentPushToken[...]
✅ Token saved for user: user@example.com
```

---

## 📤 Notifications senden

### Option 1: Expo Push Tool (Schnelltest)

Gehe zu: https://expo.dev/notifications

1. Füge dein **Expo Push Token** ein (aus Console)
2. Titel & Text eingeben
3. **Send Notification** klicken

✅ Du solltest die Notification auf deinem Handy erhalten!

### Option 2: Von deinem Backend (Node.js)

```javascript
const axios = require('axios');

async function sendPushNotification(expoPushToken, title, body, data = {}) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  };

  await axios.post('https://exp.host/--/api/v2/push/send', message, {
    headers: {
      'Accept': 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
  });
}

// Beispiel:
sendPushNotification(
  'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  '🎯 Hallo von Vayze!',
  'Deine erste Push Notification',
  { screen: 'board' }
);
```

### Option 3: Mit Firestore & Cloud Functions

**Firestore Trigger (wenn Token gespeichert wird):**

```javascript
// Firebase Cloud Function
exports.sendWelcomeNotification = functions.firestore
  .document('users/{userId}/tokens/{tokenId}')
  .onCreate(async (snap, context) => {
    const token = snap.data().token;

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        title: '🎉 Willkommen bei Vayze!',
        body: 'Treffe deine erste Entscheidung',
        data: { screen: 'assistant' },
      }),
    });
  });
```

---

## 🔔 Notification-Features

### 1. Test-Notification in der App

Füge einen Test-Button in deine Settings ein:

```javascript
<TouchableOpacity
  style={styles.testButton}
  onPress={async () => {
    await pushNotificationService.sendTestNotification();
  }}
>
  <Text>🔔 Test Notification</Text>
</TouchableOpacity>
```

### 2. Scheduled Notifications

```javascript
// Tägliche Erinnerung um 19:00
await Notifications.scheduleNotificationAsync({
  content: {
    title: '🧠 Zeit für eine kluge Entscheidung',
    body: 'Treffe heute eine durchdachte Wahl',
  },
  trigger: {
    hour: 19,
    minute: 0,
    repeats: true,
  },
});
```

### 3. Navigation bei Tap

Die Services handlen bereits Navigation:

```javascript
// In pushNotificationService.js
handleNotificationPress(data) {
  if (data.screen === 'board') {
    // Navigate to board
  } else if (data.screen === 'tracker') {
    // Navigate to tracker
  }
}
```

---

## 🎨 Notification-Typen

### Daily Reminder
```javascript
{
  title: '🧠 Zeit für eine kluge Entscheidung',
  body: 'Treffe heute eine durchdachte Wahl',
  data: { type: 'daily_reminder', screen: 'assistant' }
}
```

### Streak Motivation
```javascript
{
  title: '🔥 5-Tage Streak!',
  body: 'Weiter so! Du bist auf Erfolgskurs',
  data: { type: 'streak', screen: 'tracker' }
}
```

### Feature Announcement
```javascript
{
  title: '✨ Neues Feature!',
  body: 'Entdecke die neue Board-Funktion',
  data: { type: 'feature', screen: 'board' }
}
```

---

## 📊 Backend-Integration

### Alle User-Tokens aus Firestore holen:

```javascript
const admin = require('firebase-admin');
const axios = require('axios');

async function sendToAllUsers(title, body, data = {}) {
  const db = admin.firestore();
  const usersSnapshot = await db.collection('users').get();

  const tokens = [];
  for (const userDoc of usersSnapshot.docs) {
    const tokensSnapshot = await userDoc.ref.collection('tokens').get();
    tokensSnapshot.forEach((tokenDoc) => {
      tokens.push(tokenDoc.data().token);
    });
  }

  // Send to all tokens
  const messages = tokens.map((token) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
  }));

  // Expo accepts max 100 notifications per request
  const chunks = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    await axios.post('https://exp.host/--/api/v2/push/send', chunk, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  console.log(`✅ Sent to ${tokens.length} devices`);
}
```

---

## 🐛 Troubleshooting

### "Keine Notifications erhalten"
- ✅ Check: Läuft auf **echtem Gerät** (nicht Emulator)?
- ✅ Check: Permission wurde granted?
- ✅ Check: Token wurde in Console ausgegeben?
- ✅ Check: Expo Go App installiert (für Development)?

### "Token ist undefined"
- ✅ Check: `Device.isDevice` gibt `true` zurück
- ✅ Check: User ist eingeloggt
- ✅ Check: Permissions wurden requested

### "Notifications nur bei offener App"
- ✅ Das ist normal in Development mit Expo Go
- ✅ Im Production Build (EAS Build) funktionieren Background-Notifications

---

## 🚀 Production Build mit EAS

Für vollständige Push-Notification-Funktionalität (Background, Badge, etc.):

```bash
# EAS CLI installieren
npm install -g eas-cli

# EAS Account erstellen
eas login

# Build konfigurieren
eas build:configure

# Android APK bauen
eas build --platform android --profile preview

# Nach Build: APK herunterladen und installieren
```

---

## 📚 Vorteile von Expo Push Notifications

✅ **Einfacher** - Keine native Konfiguration nötig
✅ **Cross-Platform** - Funktioniert auf iOS & Android automatisch
✅ **Kein google-services.json** nötig
✅ **Kein APNs Setup** für iOS nötig
✅ **Expo Dashboard** - Statistiken & Monitoring
✅ **Free** - Unbegrenzte Notifications

---

## 🎯 Nächste Schritte

1. ✅ Test-Notification auf deinem Handy empfangen
2. ✅ Backend erstellen für automatische Notifications
3. ✅ Tägliche Erinnerungen schedulen
4. ✅ User Preferences für Notification-Typen
5. ✅ Analytics für Notification-Performance

---

## 📖 Nützliche Links

- [Expo Push Notifications Docs](https://docs.expo.dev/push-notifications/overview/)
- [Expo Notification Tool](https://expo.dev/notifications)
- [Expo Push API](https://docs.expo.dev/push-notifications/sending-notifications/)

---

🎉 **Fertig! Deine App hat jetzt Push-Notifications mit Expo!**

**Kein `google-services.json` nötig!**
**Kein `@react-native-firebase/messaging` nötig!**
**Einfach Expo Notifications! 🚀**

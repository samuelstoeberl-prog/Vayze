# Firebase Cloud Messaging (FCM) Setup Guide

## 🎯 Was du erreichen willst
Mit FCM kannst du Push-Notifications an alle Nutzer senden, auch wenn die App geschlossen ist.

---

## 📦 Schritt 1: Packages installieren

```bash
npm install @react-native-firebase/messaging
npx expo install expo-notifications
```

---

## 🔧 Schritt 2: Firebase Console Setup

### Android Setup:
1. Gehe zu [Firebase Console](https://console.firebase.google.com)
2. Wähle dein Projekt: **vayze-918fc**
3. Gehe zu **Project Settings** (Zahnrad-Icon)
4. Unter **Cloud Messaging** Tab:
   - Aktiviere **Cloud Messaging API** (falls noch nicht aktiviert)
   - Notiere dir den **Server Key** (für Backend)

### iOS Setup (wenn du iOS unterstützen willst):
1. In Firebase Console: Lade deine iOS App hinzu
2. Lade die `GoogleService-Info.plist` herunter
3. Lege sie in den Root-Ordner deines Projekts
4. Generiere ein APNs-Zertifikat in Apple Developer Account
5. Lade das APNs-Zertifikat in Firebase Console hoch

---

## 📝 Schritt 3: app.json anpassen

Füge diese Konfiguration hinzu:

```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      [
        "@react-native-firebase/messaging",
        {
          "ios": {
            "enableBackgroundRefresh": true
          }
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/icon-96.png",
          "color": "#3B82F6",
          "sounds": []
        }
      ]
    ],
    "android": {
      "googleServicesFile": "./google-services.json",
      "permissions": [
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "SCHEDULE_EXACT_ALARM",
        "POST_NOTIFICATIONS"
      ]
    }
  }
}
```

---

## 📄 Schritt 4: google-services.json herunterladen

1. Firebase Console → Project Settings → Your apps
2. Klicke auf deine Android-App
3. Scrolle runter und klicke auf **"google-services.json" herunterladen**
4. Lege die Datei in den **Root-Ordner** deines Projekts

---

## 🔐 Schritt 5: Firestore Rules (für Token-Speicherung)

Gehe in Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own FCM tokens
    match /users/{userId}/tokens/{token} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Allow admins to read all tokens (für Notifications)
    match /users/{userId}/tokens/{token} {
      allow read: if request.auth != null &&
                     get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

---

## 🚀 Schritt 6: Code implementieren (siehe Services)

Die Services wurden bereits erstellt:
- `services/firebaseMessagingService.js` - FCM Token Management
- `services/pushNotificationService.js` - Notification Handler
- Integration in App.js

---

## 📡 Schritt 7: Notifications vom Backend senden

### Option A: Firebase Console (Manuell)
1. Firebase Console → Messaging
2. Klicke auf "New notification"
3. Fülle Titel, Text ein
4. Wähle Zielgruppe (alle Nutzer oder spezifische Tokens)
5. Sende

### Option B: Firebase Admin SDK (Automatisiert)

**Backend Code (Node.js Beispiel):**

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// An alle Nutzer senden
async function sendToAllUsers() {
  const tokens = await getAllUserTokens(); // Aus Firestore holen

  const message = {
    notification: {
      title: '🎯 Neue Feature verfügbar!',
      body: 'Entdecke die neue Board-Funktion in Vayze'
    },
    data: {
      type: 'feature_announcement',
      screen: 'board'
    },
    tokens: tokens
  };

  const response = await admin.messaging().sendMulticast(message);
  console.log(`Sent to ${response.successCount} devices`);
}

// An einzelnen User senden
async function sendToUser(userId, title, body, data = {}) {
  const userTokens = await getUserTokens(userId);

  const message = {
    notification: { title, body },
    data: data,
    tokens: userTokens
  };

  await admin.messaging().sendMulticast(message);
}
```

### Option C: HTTP API (curl Beispiel)

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "DEVICE_FCM_TOKEN",
    "notification": {
      "title": "Hallo von Vayze!",
      "body": "Du hast eine neue Benachrichtigung"
    },
    "data": {
      "type": "custom",
      "screen": "board"
    }
  }'
```

---

## 🎨 Schritt 8: Custom Notification Actions

Füge in `pushNotificationService.js` hinzu:

```javascript
// Nutzer zu bestimmtem Screen navigieren
const handleNotificationPress = (notification) => {
  const screen = notification.request.content.data?.screen;

  if (screen === 'board') {
    navigation.navigate('Board');
  } else if (screen === 'tracker') {
    navigation.navigate('Tracker');
  }
};
```

---

## 🧪 Schritt 9: Testen

### Test 1: Token-Generierung
```bash
# Starte die App
npm start

# Check Console Log für:
# ✅ "FCM Token: ExponentPushToken[...]"
# ✅ "Token saved to Firestore"
```

### Test 2: Test-Notification senden
```javascript
// In der App irgendwo einen Button erstellen:
<Button
  title="Test Notification"
  onPress={() => pushNotificationService.sendTestNotification()}
/>
```

### Test 3: Von Firebase Console senden
1. Firebase Console → Cloud Messaging → Send your first message
2. Wähle deine App
3. Sende Test-Notification

---

## 📊 Schritt 10: Monitoring

### In Firebase Console:
- **Messaging** → Siehe Statistiken (Zustellrate, Öffnungen, etc.)
- **Analytics** → Notification-Events

### In deiner App:
```javascript
// Track notification opens
Analytics.logEvent('notification_opened', {
  notification_type: 'daily_reminder'
});
```

---

## 🔒 Sicherheit & Best Practices

1. **Server Key geheim halten** - Nie im Frontend-Code!
2. **Token Cleanup** - Alte/ungültige Tokens aus Firestore löschen
3. **Rate Limiting** - Nicht zu viele Notifications pro Tag
4. **User Preferences** - Lass Nutzer Notification-Arten auswählen
5. **Testing** - Teste auf echten Geräten, nicht nur Emulator

---

## 🐛 Häufige Probleme

### Problem: "Keine Notifications erhalten"
- ✅ Check: google-services.json im Root-Ordner
- ✅ Check: Permissions in app.json
- ✅ Check: FCM Token wurde generiert
- ✅ Rebuild: `expo prebuild --clean && expo run:android`

### Problem: "Token nicht gespeichert"
- ✅ Check: Firestore Rules erlauben Write
- ✅ Check: User ist authentifiziert
- ✅ Check: Internet-Verbindung

### Problem: "Notifications nur wenn App offen"
- ✅ Check: Background Handler implementiert
- ✅ Check: @react-native-firebase/messaging installiert
- ✅ Rebuild erforderlich nach Firebase-Plugin-Installation

---

## 📚 Nützliche Links

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Native Firebase Docs](https://rnfirebase.io/messaging/usage)

---

## ✅ Checkliste

- [ ] @react-native-firebase/messaging installiert
- [ ] google-services.json heruntergeladen und im Root-Ordner
- [ ] app.json aktualisiert mit Firebase-Plugins
- [ ] firebaseMessagingService.js erstellt
- [ ] pushNotificationService.js erstellt
- [ ] App.js integriert FCM
- [ ] Firestore Rules konfiguriert
- [ ] Test-Notification gesendet
- [ ] Backend/Admin-Panel für Notifications erstellt (optional)

---

🎉 **Fertig!** Du kannst jetzt Push-Notifications an alle deine Nutzer senden!

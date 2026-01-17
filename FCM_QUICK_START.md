# 🚀 Firebase Cloud Messaging - Quick Start

## Was du jetzt hast:

✅ Firebase Auth bereits integriert
✅ Expo Notifications bereits konfiguriert
✅ notificationService.js für lokale Notifications

---

## Was du noch brauchst:

### 1️⃣ Package installieren (5 Min)

```bash
npm install @react-native-firebase/messaging
```

### 2️⃣ google-services.json herunterladen (2 Min)

1. Gehe zu: https://console.firebase.google.com
2. Projekt: **vayze-918fc** öffnen
3. **Projekt-Einstellungen** → **Deine Apps**
4. Klicke auf deine Android-App
5. Scrolle zu **"google-services.json"** → Download
6. Lege die Datei in den **Root-Ordner** deines Projekts (neben package.json)

### 3️⃣ app.json erweitern (2 Min)

Füge diese Zeile zu `plugins` hinzu:

```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/messaging",
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

### 4️⃣ Services sind bereits erstellt ✅

- `services/firebaseMessagingService.js` ✅
- `services/pushNotificationService.js` ✅

### 5️⃣ App.js integrieren (5 Min)

Siehe: `FCM_APP_INTEGRATION.md` für Details

**Kurz:**
```javascript
import firebaseMessagingService from './services/firebaseMessagingService';
import pushNotificationService from './services/pushNotificationService';

// In useEffect:
const token = await firebaseMessagingService.requestPermissionAndGetToken();
await firebaseMessagingService.saveTokenToFirestore(user.email);
await pushNotificationService.initialize();
```

### 6️⃣ Rebuild & Test (10 Min)

```bash
# Android
expo prebuild --clean
expo run:android

# iOS
expo prebuild --clean
expo run:ios
```

**Check Console für:**
```
✅ FCM Token: ExponentPushToken[...]
✅ Token saved to Firestore
```

### 7️⃣ Test-Notification senden (2 Min)

**Option A: In der App**
```javascript
// Füge einen Button hinzu
pushNotificationService.sendTestNotification();
```

**Option B: Firebase Console**
1. Firebase Console → **Cloud Messaging**
2. **"Send your first message"**
3. Titel & Text eingeben → **Send test message**
4. Füge dein FCM Token ein → Test

---

## 📱 Notifications von Backend senden

### Setup Backend (Node.js):

```bash
mkdir backend
cd backend
npm init -y
npm install firebase-admin
```

**Siehe:** `backend-example/sendNotification.js` für komplettes Beispiel

### Service Account Key herunterladen:

1. Firebase Console → **Projekt-Einstellungen**
2. **Service Accounts** Tab
3. **"Generate new private key"** → Download `serviceAccountKey.json`
4. Lege sie in `backend/` Ordner

### Notification senden:

```javascript
// backend/sendNotification.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// An alle User senden
async function sendToAll() {
  const message = {
    notification: {
      title: '🎯 Hallo von Vayze!',
      body: 'Deine erste Push Notification'
    },
    topic: 'all_users'
  };

  await admin.messaging().send(message);
  console.log('✅ Sent!');
}

sendToAll();
```

**Run:**
```bash
node backend/sendNotification.js
```

---

## 🎯 Use Cases für deine App

### 1. Tägliche Motivation (7:00 PM)
```javascript
{
  title: '🧠 Zeit für eine kluge Entscheidung',
  body: 'Treffe heute eine durchdachte Wahl mit Vayze',
  data: { type: 'daily_reminder', screen: 'assistant' }
}
```

### 2. Decision Review Reminder
```javascript
{
  title: '🔄 Zeit für ein Review',
  body: 'Wie lief deine Entscheidung von letzter Woche?',
  data: { type: 'review_reminder', decisionId: '123' }
}
```

### 3. Feature Announcements
```javascript
{
  title: '✨ Neues Feature!',
  body: 'Entdecke die neue Board-Funktion',
  data: { type: 'feature', screen: 'board' }
}
```

### 4. Streak Reminder
```javascript
{
  title: '🔥 Dein Streak!',
  body: '5 Tage in Folge - Weiter so!',
  data: { type: 'streak', screen: 'tracker' }
}
```

---

## 📊 Monitoring

**Firebase Console → Cloud Messaging:**
- Impressions (Zustellungen)
- Opens (Öffnungen)
- Conversion Rate

---

## 🐛 Troubleshooting

### "Keine Notifications erhalten"
```bash
# 1. Check google-services.json vorhanden
ls google-services.json

# 2. Rebuild
expo prebuild --clean
expo run:android

# 3. Check FCM Token in Console
# Sollte sehen: "✅ FCM Token: ..."
```

### "Token nicht in Firestore"
- Check Firestore Rules erlauben Write
- Check User ist eingeloggt
- Check Internet-Verbindung

### "Nur bei offener App"
- Background Handler muss implementiert sein
- @react-native-firebase/messaging muss installiert sein
- Rebuild erforderlich

---

## ✅ Fertig?

- [ ] @react-native-firebase/messaging installiert
- [ ] google-services.json heruntergeladen
- [ ] app.json mit Plugins aktualisiert
- [ ] App.js mit FCM integriert
- [ ] Rebuild ausgeführt
- [ ] Test-Notification erfolgreich empfangen
- [ ] Backend vorbereitet (optional)

**🎉 Glückwunsch! Du kannst jetzt Push-Notifications senden!**

---

## 📚 Nächste Schritte

1. **Notification-Settings** in AccountScreen hinzufügen
2. **Topic-Subscriptions** für verschiedene Notification-Arten
3. **Notification History** in der App anzeigen
4. **A/B Testing** mit verschiedenen Notification-Texten
5. **Analytics** für Notification-Performance

---

**Fragen? Siehe:**
- `FCM_SETUP_GUIDE.md` - Ausführliche Anleitung
- `FCM_APP_INTEGRATION.md` - Code-Integration
- `backend-example/sendNotification.js` - Backend-Beispiele

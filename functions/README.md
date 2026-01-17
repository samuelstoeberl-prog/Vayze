# 🔔 Decisio Cloud Functions - Setup Guide

## ✅ Was ist bereits implementiert

Diese Cloud Functions sind **produktionsreif** und enthalten:

### 📤 **4 Essentielle Notification Functions:**

1. **`streakWarningDaily`** - Täglich 20:00 Uhr UTC
   - Warnt User deren Streak heute endet
   - Nur wenn User heute noch keine Decision gemacht hat

2. **`onStreakMilestone`** - Firestore Trigger
   - Feuert automatisch bei jedem 7-Tage-Milestone (7, 14, 21, 30...)
   - Sendet Glückwunsch-Notification

3. **`reEngagementDaily`** - Täglich 10:00 Uhr UTC
   - Sendet "Wir vermissen dich" nach 7 Tagen Inaktivität
   - Nur 1x alle 14 Tage pro User

4. **`sendBroadcast`** - HTTPS Callable (manuell)
   - Admin Tool zum manuellen Senden von Notifications
   - An alle User oder spezifische User-IDs

5. **`syncStreak`** - HTTPS Callable
   - Synchronisiert Streak von App zu Firestore
   - Kann von App aufgerufen werden

### 🛡️ **Built-in Features:**

- ✅ **Rate Limiting** (max 2/Tag, min 4h zwischen Notifications)
- ✅ **Analytics Logging** (alle Notifications werden geloggt)
- ✅ **Token Validation** (nur gültige Expo Push Tokens)
- ✅ **Error Handling** (keine Crashes bei ungültigen Tokens)
- ✅ **Streak Calculation** (automatisch aus Firestore)

---

## 🚀 Installation & Deployment

### **1. Firebase CLI installieren**

```bash
npm install -g firebase-tools
```

### **2. Firebase Login**

```bash
firebase login
```

### **3. Firebase Projekt initialisieren**

Im Root-Verzeichnis deines Projekts:

```bash
firebase init functions
```

**Wähle:**
- ✅ Use existing project: `vayze-918fc`
- ✅ Language: JavaScript
- ✅ ESLint: No (optional)
- ✅ Install dependencies: Yes

**WICHTIG:** Firebase wird einen `functions/` Ordner erstellen. Die Dateien die ich bereits erstellt habe, sollten schon dort sein.

### **4. Dependencies installieren**

```bash
cd functions
npm install
```

### **5. Deploy to Firebase**

```bash
firebase deploy --only functions
```

**Das war's! 🎉**

---

## 💰 Kosten (100% KOSTENLOS für dich)

**Firebase Free Tier:**
- 2 Millionen Function Aufrufe/Monat
- 400,000 GB-Sekunden/Monat
- 200,000 CPU-Sekunden/Monat

**Bei 100 aktiven Usern:**
- `streakWarningDaily`: ~100 Aufrufe/Tag = 3,000/Monat
- `onStreakMilestone`: ~300/Monat
- `reEngagementDaily`: ~30/Tag = 900/Monat
- **Gesamt: ~5,000 Aufrufe/Monat → 100% KOSTENLOS**

Erst ab **1,000+ aktiven Usern** wirst du etwas zahlen (~$5-10/Monat).

---

## 🧪 Testen der Functions

### **Lokales Testen (Emulator)**

```bash
cd functions
npm run serve
```

Dies startet den Firebase Emulator. Du kannst Functions lokal testen ohne zu deployen.

### **Manual Broadcast testen**

Erstelle eine Datei `functions/test-broadcast.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../google-services.json'); // Falls du einen Service Account Key hast

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function testBroadcast() {
  const callable = admin.functions().httpsCallable('sendBroadcast');

  const result = await callable({
    title: '🎯 Test Notification',
    body: 'Dies ist ein Test!',
    screen: 'home',
  });

  console.log('Result:', result);
}

testBroadcast();
```

Dann ausführen:

```bash
node test-broadcast.js
```

---

## 📊 Firestore Datenstruktur

Die Functions erwarten folgende Firestore-Struktur:

```
users/
  {userId}/
    email: "user@example.com"

    activity: {
      currentStreak: 5
      longestStreak: 12
      lastDecisionAt: "2025-01-11T10:00:00Z"
      lastReEngagementAt: "2025-01-05T10:00:00Z"
    }

    notificationSettings: {
      rateLimits: {
        lastSentAt: "2025-01-11T09:00:00Z"
        sentToday: 1
      }
    }

    tokens/
      {tokenId}/
        token: "ExponentPushToken[...]"
        platform: "ios"
        createdAt: "..."

    decisions/
      {decisionId}/
        decision: "..."
        completedAt: "2025-01-11T08:00:00Z"
        createdAt: "2025-01-10T08:00:00Z"
        ...

    notificationLog/
      {logId}/
        title: "🔥 Streak Warning"
        body: "..."
        sentAt: "..."
        opened: false
```

**WICHTIG:** Du musst noch die `activity` und `notificationSettings` Felder in der App synchronisieren (siehe unten).

---

## 🔧 Änderungen in der App (minimal)

### **1. Streak zu Firestore synchronisieren**

Füge diese Funktion zu `App.js` oder `decisionStore.js` hinzu:

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const syncStreakToFirestore = async () => {
  try {
    const functions = getFunctions();
    const syncStreak = httpsCallable(functions, 'syncStreak');
    const result = await syncStreak();
    console.log('✅ Streak synced:', result.data);
  } catch (error) {
    console.error('Error syncing streak:', error);
  }
};

// Rufe dies auf:
// - Nach jeder abgeschlossenen Decision
// - Beim App-Start (einmal)
```

### **2. Timezone automatisch erkennen**

In `services/firebaseAuthService.js` oder beim Login:

```javascript
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as Localization from 'expo-localization';

const saveUserTimezone = async (userId) => {
  const db = getFirestore();
  const timezone = Localization.timezone; // z.B. "Europe/Berlin"

  await setDoc(
    doc(db, 'users', userId),
    {
      notificationSettings: {
        timezone: timezone,
        preferences: {
          daily_reminders: { enabled: true, time: '09:00' },
          streak_notifications: { enabled: true },
          insights: { enabled: true },
          review_prompts: { enabled: true },
          achievements: { enabled: true },
        },
      },
    },
    { merge: true }
  );
};

// Rufe beim ersten Login/Signup auf
```

---

## 🎯 Broadcast von deinem Computer senden

Erstelle `functions/admin-broadcast.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../google-services.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const functions = admin.functions();

async function sendBroadcast(title, body, screen = 'home') {
  try {
    const sendBroadcastFn = functions.httpsCallable('sendBroadcast');
    const result = await sendBroadcastFn({
      title,
      body,
      screen,
    });

    console.log('✅ Broadcast sent:', result.data);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Beispiel-Nutzung:
sendBroadcast(
  '🎯 Neue Features!',
  'Check out the new Insights tab!',
  'insights'
);
```

Dann:

```bash
node admin-broadcast.js
```

---

## 📈 Monitoring & Logs

### **Logs anschauen:**

```bash
firebase functions:log
```

### **In Firebase Console:**

1. Gehe zu [Firebase Console](https://console.firebase.google.com)
2. Wähle dein Projekt: `vayze-918fc`
3. Functions → Logs
4. Dort siehst du alle Function-Aufrufe

---

## ❓ FAQ

### **Wie oft laufen die scheduled Functions?**

- `streakWarningDaily`: Jeden Tag um 20:00 UTC (= 21:00 Berlin Winter, 22:00 Sommer)
- `reEngagementDaily`: Jeden Tag um 10:00 UTC (= 11:00 Berlin Winter, 12:00 Sommer)

### **Kann ich die Zeiten ändern?**

Ja! In `functions/index.js`:

```javascript
// Ändere z.B. zu 18:00 UTC:
.schedule('0 18 * * *')
```

### **Wie kann ich Functions deaktivieren?**

Kommentiere die Function aus oder:

```bash
firebase functions:delete streakWarningDaily
```

### **Kann ich sehen, wer Notifications bekommen hat?**

Ja! In Firestore unter `users/{userId}/notificationLog`.

---

## 🚨 Troubleshooting

### **Problem: "Permission denied" beim Deployen**

```bash
firebase login --reauth
```

### **Problem: Functions werden nicht getriggert**

1. Check ob deployed: `firebase functions:list`
2. Check Logs: `firebase functions:log`
3. Check Firestore Rules (müssen Functions erlauben zu schreiben)

### **Problem: Notifications kommen nicht an**

1. Check ob Token in Firestore gespeichert ist
2. Check ob Rate Limits überschritten wurden
3. Check Logs: `firebase functions:log --only sendPushNotification`

---

## ✅ Next Steps

1. **Deploy Functions:**
   ```bash
   firebase deploy --only functions
   ```

2. **App-Änderungen:**
   - Streak Sync implementieren (siehe oben)
   - Timezone beim Login speichern

3. **Testen:**
   - Manuellen Broadcast senden
   - Warten bis 20:00 UTC für Streak Warning

4. **Später hinzufügen:**
   - Tägliche Reminders (9:00 Uhr)
   - Weekly Insights (Sonntag)
   - Review Prompts (7 Tage nach Decision)

---

**Viel Erfolg! 🚀**

Bei Fragen: Check die Logs oder frag mich!

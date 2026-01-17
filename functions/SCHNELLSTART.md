# ⚡ SCHNELLSTART - Push Notifications in 5 Minuten

## 🎯 Ziel

Push Notifications für Decisio komplett einrichten - **in 5 Minuten**.

---

## 📋 Voraussetzungen

- ✅ Node.js installiert
- ✅ Firebase Projekt existiert (`vayze-918fc`)
- ✅ Du hast Zugriff auf Firebase Console

---

## 🚀 Installation (Windows)

### **Schritt 1: Firebase CLI installieren**

Öffne PowerShell (als Administrator) und führe aus:

```powershell
npm install -g firebase-tools
```

Warte bis fertig (~2 Minuten).

### **Schritt 2: Firebase Login**

```powershell
firebase login
```

Browser öffnet sich → Mit Google Account anmelden → Erlauben

### **Schritt 3: Zum functions-Ordner navigieren**

```powershell
cd "C:\Users\samue\OneDrive\Dokumente\projekte\Decision-asisstent\functions"
```

### **Schritt 4: Dependencies installieren**

```powershell
npm install
```

Warte (~1 Minute).

### **Schritt 5: Deployment**

#### **Option A: Automatisch (empfohlen)**

Doppelklick auf `deploy.bat` in diesem Ordner.

#### **Option B: Manuell**

```powershell
firebase deploy --only functions
```

Warte (~2-3 Minuten). Du solltest sehen:

```
✔  functions[streakWarningDaily]: Successful create operation.
✔  functions[onStreakMilestone]: Successful create operation.
✔  functions[reEngagementDaily]: Successful create operation.
✔  functions[sendBroadcast]: Successful create operation.
✔  functions[syncStreak]: Successful create operation.
```

---

## ✅ Check ob es funktioniert

### **1. Functions deployed?**

```powershell
firebase functions:list
```

Du solltest sehen:

```
streakWarningDaily
onStreakMilestone
reEngagementDaily
sendBroadcast
syncStreak
```

### **2. Test Notification senden**

```powershell
node admin-broadcast.js "🎯 Test!" "Es funktioniert!" "home"
```

**Check dein Handy** - Notification sollte ankommen! 📱

### **3. Firebase Console checken**

Gehe zu: [Firebase Console](https://console.firebase.google.com/project/vayze-918fc/functions)

Du solltest 5 Functions sehen.

---

## 📱 App-Änderungen (minimal)

Jetzt musst du noch **2 Zeilen Code** in der App ändern:

### **Änderung 1: Streak Sync**

Öffne `store/decisionStore.js` und füge hinzu:

```javascript
// Am Anfang (nach imports):
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../services/firebaseConfig';

const functions = getFunctions(app);

// Im Store (im create() Block):
syncStreakToFirestore: async () => {
  try {
    const syncStreak = httpsCallable(functions, 'syncStreak');
    const result = await syncStreak();
    console.log('✅ Streak synced:', result.data);
    return result.data;
  } catch (error) {
    console.error('❌ Streak sync error:', error);
    return null;
  }
},
```

**Aufruf:** In `completeDecision` oder beim App-Start:

```javascript
await get().syncStreakToFirestore();
```

### **Änderung 2: Timezone speichern**

**Installiere Package:**

```bash
npm install expo-localization
```

**In `services/firebaseAuthService.js`:**

```javascript
import * as Localization from 'expo-localization';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import app from './firebaseConfig';

const db = getFirestore(app);

// Neue Funktion:
const saveUserTimezone = async (userId) => {
  await setDoc(
    doc(db, 'users', userId),
    {
      notificationSettings: {
        timezone: Localization.timezone,
        preferences: {
          streak_notifications: { enabled: true },
          insights: { enabled: true },
          review_prompts: { enabled: true },
        },
      },
    },
    { merge: true }
  );
};

// In login() und signup() aufrufen:
await saveUserTimezone(userCredential.user.uid);
```

---

## 🎉 FERTIG!

Du hast jetzt:

- ✅ Backend deployed
- ✅ Notifications laufen automatisch
- ✅ Streak Sync funktioniert
- ✅ Timezone gespeichert

**Notifications werden automatisch gesendet:**

- 🔥 **20:00 Uhr:** Streak Warnungen
- 🎉 **Automatisch:** Milestones bei 7, 14, 21 Tagen
- 👋 **10:00 Uhr:** Re-Engagement nach 7 Tagen Pause

---

## 📊 Monitoring

### **Logs anschauen:**

```powershell
firebase functions:log
```

### **Live-Logs (Streaming):**

```powershell
firebase functions:log --only streakWarningDaily
```

---

## 🆘 Probleme?

### **"Command not found: firebase"**

Firebase CLI nicht installiert:

```powershell
npm install -g firebase-tools
```

### **"Permission denied"**

Neu anmelden:

```powershell
firebase login --reauth
```

### **"Module not found"**

Dependencies installieren:

```powershell
cd functions
npm install
```

### **Notifications kommen nicht an**

1. Check Token in Firestore: Firebase Console → Firestore → users → {userId} → tokens
2. Check Logs: `firebase functions:log`
3. Teste mit: `node admin-broadcast.js "Test" "Hallo"`

---

## 📖 Weitere Dokumentation

- **Komplette Übersicht:** `NOTIFICATIONS_FINAL_SUMMARY.md`
- **Technische Details:** `functions/README.md`
- **App-Änderungen:** `APP_CHANGES_NEEDED.md`

---

**Das war's! 🚀**

Deine Push Notifications laufen jetzt automatisch und kostenlos!

# 📱 App-Änderungen für Push Notifications

## ✅ Was du JETZT ändern musst

Um das Backend nutzen zu können, musst du **2 kleine Änderungen** in der App machen:

---

## 1️⃣ Streak zu Firestore synchronisieren

### **Warum?**
Das Backend muss wissen, welchen Streak der User hat, um Warnings und Milestones zu senden.

### **Wo?**
`store/decisionStore.js`

### **Was hinzufügen:**

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../services/firebaseConfig'; // Dein Firebase App

// Füge am Anfang der Datei hinzu (nach imports):
const functions = getFunctions(app);

// Füge diese Funktion zum Store hinzu (im create() Block):
export const useDecisionStore = create((set, get) => ({
  // ... existing code ...

  // NEU: Streak zu Firestore synchronisieren
  syncStreakToFirestore: async () => {
    try {
      const syncStreak = httpsCallable(functions, 'syncStreak');
      const result = await syncStreak();

      if (result.data.success) {
        console.log('✅ Streak synced:', result.data);
        return result.data;
      }
    } catch (error) {
      console.error('Error syncing streak:', error);
      return null;
    }
  },

  // ... rest of existing code ...
}));
```

### **Wann aufrufen:**

**Option A: Nach jeder abgeschlossenen Decision**

In der `completeDecision` Funktion (oder wo du Decisions abschließt):

```javascript
completeDecision: async (result) => {
  // ... existing code to complete decision ...

  // NEU: Sync streak nach Completion
  await get().syncStreakToFirestore();
},
```

**Option B: Beim App-Start (1x)**

In `App.js` im useEffect beim Login:

```javascript
useEffect(() => {
  if (isAuthenticated && user) {
    // ... existing code ...

    // NEU: Sync streak beim Start
    useDecisionStore.getState().syncStreakToFirestore();
  }
}, [isAuthenticated, user]);
```

---

## 2️⃣ Timezone beim Login speichern

### **Warum?**
Damit Notifications zur richtigen Zeit gesendet werden (z.B. 9:00 Uhr User-Zeit, nicht UTC).

### **Wo?**
`services/firebaseAuthService.js` oder `contexts/AuthContext.js`

### **Dependencies installieren:**

```bash
npm install expo-localization
```

### **Was hinzufügen:**

In `services/firebaseAuthService.js`:

```javascript
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as Localization from 'expo-localization';
import app from './firebaseConfig';

const db = getFirestore(app);

// NEU: Funktion zum Speichern der Timezone
const saveUserTimezone = async (userId) => {
  try {
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

    console.log('✅ Timezone saved:', timezone);
  } catch (error) {
    console.error('Error saving timezone:', error);
  }
};

// Rufe in login() und signup() auf:
async login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // NEU: Save timezone
    await saveUserTimezone(userCredential.user.uid);

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    // ... error handling ...
  }
}

async signup(email, password, displayName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // ... existing code to update profile ...

    // NEU: Save timezone
    await saveUserTimezone(userCredential.user.uid);

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    // ... error handling ...
  }
}
```

---

## 🧪 Testen ob es funktioniert

### **1. Check ob Streak synced wird:**

Nach dem Abschließen einer Decision:

```javascript
// In der Console sollte stehen:
✅ Streak synced: { currentStreak: 5, longestStreak: 12 }
```

### **2. Check in Firestore:**

Firebase Console → Firestore → users → {dein userId}

Sollte sehen:

```json
{
  "email": "test@vayze.app",
  "activity": {
    "currentStreak": 5,
    "longestStreak": 12,
    "lastSyncedAt": "2025-01-11T..."
  },
  "notificationSettings": {
    "timezone": "Europe/Berlin",
    "preferences": {
      "daily_reminders": { "enabled": true, "time": "09:00" },
      "streak_notifications": { "enabled": true },
      ...
    }
  }
}
```

---

## ⚡ Optional: Deep Link Handling

Damit Notifications zu den richtigen Screens navigieren:

In `App.js` oder wo du Deep Links handlest:

```javascript
// Wenn Notification geöffnet wird:
const handleNotificationPress = (notification) => {
  const { screen } = notification.data;

  switch (screen) {
    case 'assistant':
      // Navigate to Assistant/Decision-Start
      navigation.navigate('Assistant');
      break;
    case 'tracker':
      // Navigate to Tracker
      navigation.navigate('Tracker');
      break;
    case 'insights':
      // Navigate to Insights
      navigation.navigate('Insights');
      break;
    default:
      // Home
      navigation.navigate('Home');
  }
};
```

Dies ist bereits teilweise in `services/pushNotificationService.js` implementiert.

---

## ✅ Checklist

- [ ] `expo-localization` installiert
- [ ] `syncStreakToFirestore()` zu `decisionStore.js` hinzugefügt
- [ ] Sync wird nach jeder Decision oder beim App-Start aufgerufen
- [ ] `saveUserTimezone()` zu `firebaseAuthService.js` hinzugefügt
- [ ] Timezone wird beim Login/Signup gespeichert
- [ ] Getestet: Streak wird in Firestore gespeichert
- [ ] Getestet: Timezone wird in Firestore gespeichert
- [ ] Backend deployed (`firebase deploy --only functions`)

---

## 🎉 Fertig!

Nach diesen Änderungen:

1. **Backend weiß den Streak** → Kann Warnings und Milestones senden
2. **Backend weiß die Timezone** → Notifications zur richtigen Zeit
3. **Notifications funktionieren vollständig** 🔔

---

**Bei Problemen:** Check `functions/README.md` oder Firebase Logs!

# Multi-User Data Isolation - Implementation Guide

## 🎯 Übersicht

Alle Daten in der Vayze-App werden jetzt **benutzerspezifisch** gespeichert. Jeder Account hat seine eigenen isolierten Daten - Entscheidungen, Board-Karten, Einstellungen, etc.

---

## ✅ Was wurde implementiert

### 1. **User Storage Utilities** (`utils/userStorage.js`)

Zentrale Helper-Funktionen für benutzerspezifische Datenspeicherung:

```javascript
import { loadUserData, saveUserData, removeUserData, clearUserData } from './utils/userStorage';

// Daten laden
const decisions = await loadUserData(user.email, 'decisions', []);

// Daten speichern
await saveUserData(user.email, 'decisions', decisionsArray);

// Einzelne Daten löschen
await removeUserData(user.email, 'decisions');

// ALLE Daten eines Users löschen (bei Logout/Account-Deletion)
await clearUserData(user.email);
```

#### **Verfügbare Funktionen:**

| Funktion | Beschreibung |
|----------|-------------|
| `getUserKey(userId, key)` | Generiert User-Scope Key: `user_test@example.com_decisions` |
| `saveUserData(userId, key, data)` | Speichert Daten für einen User |
| `loadUserData(userId, key, defaultValue)` | Lädt Daten für einen User |
| `removeUserData(userId, key)` | Löscht spezifische Daten eines Users |
| `clearUserData(userId)` | Löscht ALLE Daten eines Users |
| `migrateToUserScope(userId, key, oldKey)` | Migriert alte globale Daten zu User-Scope |
| `getUserKeys(userId)` | Debug: Zeigt alle Keys eines Users |

---

### 2. **Automatische Migration von alten Daten**

Beim ersten Login nach dem Update werden alte globale Daten **automatisch** migriert:

```javascript
// In loadAllData() (App.js)
await migrateToUserScope(user.email, 'decisions', 'completedDecisions');
await migrateToUserScope(user.email, 'settings', 'appSettings');
await migrateToUserScope(user.email, 'decisionData');
```

**Was wird migriert:**
- `completedDecisions` → `user_[EMAIL]_decisions`
- `appSettings` → `user_[EMAIL]_settings`
- `decisionData` → `user_[EMAIL]_decisionData`
- `decisio_cards_v2` → `user_[EMAIL]_cards`

**Migration ist safe:**
- Läuft nur wenn noch KEINE User-Daten existieren
- Alte Daten bleiben erhalten (werden nicht gelöscht)
- Passiert transparent im Hintergrund

---

### 3. **Benutzerspezifische Datenspeicherung**

#### **A) Entscheidungen (Decisions)**

**Vorher (global):**
```javascript
await AsyncStorage.setItem('completedDecisions', JSON.stringify(decisions));
```

**Jetzt (user-scoped):**
```javascript
await saveUserData(user.email, 'decisions', decisions);
```

**Storage Keys:**
- User 1: `user_max@test.com_decisions`
- User 2: `user_anna@test.com_decisions`

#### **B) Einstellungen (Settings)**

**Vorher (global):**
```javascript
await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
```

**Jetzt (user-scoped):**
```javascript
await saveUserData(user.email, 'settings', settings);
```

#### **C) Board-Karten (Cards) - Zustand Store**

Der `cardStore` wurde komplett umgebaut für Multi-User Support:

**Neue Features:**
```javascript
const { setCurrentUser, loadFromStorage, clearCards } = useCardStore();

// Bei Login:
setCurrentUser(user.email);
await loadFromStorage(user.email);

// Bei Logout:
clearCards();
```

**Storage Keys:**
- User 1: `user_max@test.com_cards`
- User 2: `user_anna@test.com_cards`

---

## 🔄 Lifecycle: Daten laden & speichern

### **Bei App-Start:**

```
1. AuthContext lädt Session
2. Wenn Session gültig:
   → useEffect in App.js wird getriggert
   → setCurrentUser(user.email) für cardStore
   → loadAllData() lädt Decisions & Settings
   → loadCardsFromStorage(user.email) lädt Karten
3. User sieht SEINE Daten
```

### **Bei Login (nach Onboarding oder StandaloneAuth):**

```
1. AuthContext.signIn(user) wird aufgerufen
2. user.email wird gesetzt
3. useEffect in App.js reagiert auf user?.email Änderung
4. Alle Daten werden für DIESEN User geladen
```

### **Bei Logout:**

```
1. signOut() wird aufgerufen
2. useEffect reagiert: isAuthenticated = false
3. State wird gecleart:
   → setCompletedDecisions([])
   → setSettings(defaults)
   → clearCards() (cardStore)
4. User sieht leere App / Login-Screen
```

### **Bei Speichern einer Entscheidung:**

```javascript
const reset = async () => {
  const newDecision = { /* ... */ };
  const updated = [...completedDecisions, newDecision];

  // Speichert unter: user_[EMAIL]_decisions
  await saveUserData(user.email, 'decisions', updated);

  setCompletedDecisions(updated);
};
```

---

## 📊 AsyncStorage Keys Übersicht

### **Global (user-unabhängig):**
| Key | Was wird gespeichert |
|-----|---------------------|
| `hasLaunched` | Flag ob Onboarding abgeschlossen |
| `decisio_encrypted_session` | Verschlüsselte Session |
| `decisio_last_activity` | Letzter Activity-Timestamp |
| `decisio_users_db` | User-Credentials Datenbank |
| `decisio_account_states` | Account States (locked, verified, etc.) |
| `decisio_security_events` | Security Event Log |

### **User-Scoped (pro Account):**
| Key Pattern | Was wird gespeichert |
|------------|---------------------|
| `user_[EMAIL]_decisions` | Alle abgeschlossenen Entscheidungen |
| `user_[EMAIL]_settings` | App-Einstellungen (Notifications, etc.) |
| `user_[EMAIL]_decisionData` | Aktuelle Entscheidung (für Resume) |
| `user_[EMAIL]_cards` | Alle Board-Karten |
| `user_[EMAIL]_onboardingData` | Onboarding-Daten |

**Beispiel für User `max@test.com`:**
```
user_max@test.com_decisions
user_max@test.com_settings
user_max@test.com_cards
```

---

## 🧪 Testing: Multi-User Data Separation

### **Test 1: Zwei Accounts erstellen**

1. **Account 1 erstellen:**
   - Registrieren als `user1@test.com`
   - 3 Entscheidungen treffen
   - 2 Board-Karten erstellen
   - Einstellung: Notifications = ON

2. **Logout & Account 2 erstellen:**
   - Abmelden
   - Registrieren als `user2@test.com`
   - 2 Entscheidungen treffen
   - 1 Board-Karte erstellen
   - Einstellung: Notifications = OFF

3. **Zwischen Accounts wechseln:**
   - Logout → Login als `user1@test.com`
   - ✅ **Erwartet:** 3 Entscheidungen, 2 Karten, Notifications ON

   - Logout → Login als `user2@test.com`
   - ✅ **Erwartet:** 2 Entscheidungen, 1 Karte, Notifications OFF

### **Test 2: Data Isolation**

**Debug in React Native Debugger Console:**

```javascript
// Zeige alle Keys für User 1
import { getUserKeys } from './utils/userStorage';
const keys1 = await getUserKeys('user1@test.com');
console.log('User 1 Keys:', keys1);

// Zeige alle Keys für User 2
const keys2 = await getUserKeys('user2@test.com');
console.log('User 2 Keys:', keys2);

// Sollten komplett unterschiedlich sein!
```

### **Test 3: Migration von alten Daten**

1. App mit alten Daten starten (vor Update)
2. Login durchführen
3. ✅ **Erwartet:**
   - Alte Decisions werden unter `user_[EMAIL]_decisions` gespeichert
   - Alte Settings werden migriert
   - Alte Cards werden migriert
   - Keine Datenverlust

### **Test 4: Account Deletion**

1. Eingeloggt als `user1@test.com`
2. Zu Account Settings → Konto löschen
3. "LÖSCHEN" eingeben und bestätigen
4. ✅ **Erwartet:**
   - ALLE Keys `user_user1@test.com_*` werden gelöscht
   - User kann sich nicht mehr einloggen
   - Andere Accounts NICHT betroffen

---

## 🔧 Code-Beispiele

### **In einer React Component:**

```javascript
import { useAuth } from './contexts/AuthContext';
import { saveUserData, loadUserData } from './utils/userStorage';

function MyComponent() {
  const { user } = useAuth();
  const [myData, setMyData] = useState([]);

  // Load on mount
  useEffect(() => {
    const loadData = async () => {
      if (user?.email) {
        const data = await loadUserData(user.email, 'myFeature', []);
        setMyData(data);
      }
    };
    loadData();
  }, [user?.email]);

  // Save on change
  const handleSave = async () => {
    if (user?.email) {
      await saveUserData(user.email, 'myFeature', myData);
    }
  };

  return <View>{/* ... */}</View>;
}
```

### **Im cardStore (Zustand):**

```javascript
const { setCurrentUser, loadFromStorage } = useCardStore();

// Bei Login:
useEffect(() => {
  if (user?.email) {
    setCurrentUser(user.email);
    loadFromStorage(user.email);
  }
}, [user?.email]);
```

---

## 🚨 Wichtige Hinweise

### **1. IMMER User-Check durchführen**

```javascript
// ❌ FALSCH:
await saveUserData(user.email, 'key', data); // Wenn user undefined → Crash!

// ✅ RICHTIG:
if (user && user.email) {
  await saveUserData(user.email, 'key', data);
}
```

### **2. Dependencies in useEffect**

```javascript
// ✅ RICHTIG: Lädt Daten NEU bei User-Wechsel
useEffect(() => {
  loadAllData();
}, [user?.email, isAuthenticated]);

// ❌ FALSCH: Lädt Daten nur 1x beim Mount
useEffect(() => {
  loadAllData();
}, []);
```

### **3. State Cleanup bei Logout**

```javascript
useEffect(() => {
  if (isAuthenticated && user) {
    loadAllData();
  } else {
    // ✅ WICHTIG: State clearen!
    setCompletedDecisions([]);
    setSettings(defaults);
    clearCards();
  }
}, [user?.email, isAuthenticated]);
```

---

## 🐛 Debugging

### **Debug Helper:**

```javascript
import { debugShowAllUsers, debugShowAllKeys } from './utils/debugAsyncStorage';
import { getUserKeys } from './utils/userStorage';

// Zeige alle registrierten User
await debugShowAllUsers();

// Zeige ALLE AsyncStorage Keys
await debugShowAllKeys();

// Zeige Keys für spezifischen User
const userKeys = await getUserKeys('max@test.com');
console.log('Keys für max@test.com:', userKeys);
```

### **Logs aktivieren:**

Die Implementation hat bereits Debug-Logging:

```
🔐 [authService] Login successful
💾 [userStorage] Saving decisions for user: max@test.com
✅ [userStorage] Saved decisions successfully
📂 [cardStore] Loading cards for user: max@test.com
✅ [cardStore] Loaded 5 cards for user: max@test.com
```

Im Production-Build (`__DEV__ = false`) werden die Logs automatisch deaktiviert.

---

## 📝 Zusammenfassung

### **Was jetzt funktioniert:**

✅ **Jeder User hat eigene Daten** - Keine Data Leaks zwischen Accounts
✅ **Automatische Migration** - Alte Daten werden beim ersten Login migriert
✅ **Board-Karten user-scoped** - Zustand Store mit Multi-User Support
✅ **Clean Logout** - State wird komplett gecleart
✅ **Account Deletion** - Alle User-Daten werden gelöscht
✅ **Debug-Utilities** - Tools zum Debugging verfügbar

### **Storage-Struktur:**

```
AsyncStorage
├── hasLaunched (global)
├── decisio_users_db (global)
├── decisio_encrypted_session (global)
│
├── user_max@test.com_decisions
├── user_max@test.com_settings
├── user_max@test.com_cards
│
├── user_anna@test.com_decisions
├── user_anna@test.com_settings
└── user_anna@test.com_cards
```

### **Was du beachten musst:**

1. ✅ Immer `user.email` checken bevor du speicherst
2. ✅ useEffect mit `[user?.email, isAuthenticated]` dependencies
3. ✅ State cleanup bei Logout
4. ✅ cardStore: `setCurrentUser()` & `loadFromStorage()` bei Login

---

**Du bist ready für Multi-User! 🚀**

Bei Fragen siehe:
- `utils/userStorage.js` - Helper Functions
- `App.js` (Zeile 47-86) - loadAllData Implementation
- `store/cardStore.js` (Zeile 399-485) - User-scoped Persistence


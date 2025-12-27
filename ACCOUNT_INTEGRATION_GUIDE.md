# Account Management & Session-Persistenz - Integration Guide

## 🎯 Übersicht

Dieses Dokument erklärt, wie die Account-Management-Features und die Session-Persistenz in deiner Decisio-App funktionieren.

---

## ✅ Was wurde implementiert

### 1. **Account Settings Screen** (`screens/AccountScreen.js`)

Kompletter Settings-Screen mit:
- ✅ Account-Informationen anzeigen (Name, E-Mail, Provider, Verifizierungsstatus)
- ✅ Passwort ändern (nur für E-Mail-Provider)
- ✅ Abmelden mit Bestätigung
- ✅ Konto löschen mit doppelter Bestätigung
- ✅ Moderne, saubere UI mit Sektionen

### 2. **Delete Account Funktion** (`services/secureAuthService.js`)

Neue Methode: `deleteAccount(email)`

**Was sie macht:**
```javascript
await secureAuthService.deleteAccount(user.email);
```

**Löscht:**
1. ✅ Aktuelle Session
2. ✅ Account State (locked, verified, etc.)
3. ✅ User Credentials (aus lokalem User-Store)
4. ✅ Security Events (anonymisiert, nicht gelöscht)
5. ✅ Alte Auth-Daten
6. ✅ Device Encryption Key

**Loggt:**
- `account_deletion_requested` Event
- `account_deleted` Event (oder `account_deletion_failed`)

---

## 🚀 Integration in deine App

### **Option A: Als Tab im Hauptmenü**

Wenn du bereits eine Tab-Navigation hast (z.B. mit `activeTab`):

```javascript
// In App.js
import AccountScreen from './screens/AccountScreen';

// Im render():
{activeTab === 3 && <AccountScreen />}
```

### **Option B: Als Settings-Button**

Falls du einen Settings-Button in deiner bestehenden UI hast:

```javascript
// In deiner aktuellen Settings-View
import AccountScreen from './screens/AccountScreen';

const [showAccountScreen, setShowAccountScreen] = useState(false);

// Button zum Öffnen:
<TouchableOpacity onPress={() => setShowAccountScreen(true)}>
  <Text>Konto-Einstellungen</Text>
</TouchableOpacity>

// Conditional Render:
{showAccountScreen ? (
  <AccountScreen onBack={() => setShowAccountScreen(false)} />
) : (
  <YourCurrentSettingsView />
)}
```

### **Option C: Mit React Navigation (empfohlen für größere Apps)**

```javascript
// Install:
npm install @react-navigation/native @react-navigation/stack

// In App.js:
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AccountScreen from './screens/AccountScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Account"
          component={AccountScreen}
          options={{ title: 'Konto-Einstellungen' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## 🔐 Session-Persistenz (bereits implementiert!)

### **Wie es funktioniert:**

1. **Beim ersten App-Start:**
   ```
   App startet → Onboarding → AuthGateway → Login → App
   ```

2. **Bei jedem weiteren App-Start:**
   ```
   App startet → AuthContext prüft Session → Session gültig? → Direkt zur App
   ```

**Du musst NICHTS ändern** - das funktioniert bereits! 🎉

### **Warum?**

In `contexts/AuthContext.js`:

```javascript
useEffect(() => {
  loadAuthState();  // Lädt bei jedem App-Start
}, []);

const loadAuthState = async () => {
  // Check for secure session first
  const currentSession = await secureAuthService.getCurrentSession();

  if (currentSession) {
    // Session noch gültig
    setSession(currentSession);
    setUser({ ... });
    setIsAuthenticated(true);  // ✅ User ist eingeloggt
  } else {
    // Session abgelaufen oder nicht vorhanden
    // Fallback zu altem Storage (backwards compatibility)
  }
};
```

**Session-Dauer:** 7 Tage (konfigurierbar in `secureAuthService.js`)

**Idle Timeout:** 30 Minuten (nach 30 Min. Inaktivität = Auto-Logout)

---

## 🔄 Logout & Account Deletion Flow

### **Logout:**

```
User klickt "Abmelden"
  → Modal: "Möchtest du dich wirklich abmelden?"
  → Bestätigung
  → signOut() aufgerufen
  → Session gelöscht
  → isAuthenticated = false
  → App.js zeigt AuthGateway
```

### **Account Deletion:**

```
User klickt "Konto löschen"
  → Modal 1: "Bist du sicher?"
  → Bestätigung
  → Modal 2: "Gib 'LÖSCHEN' ein"
  → User tippt "LÖSCHEN"
  → deleteAccount() aufgerufen
  → Alle Daten gelöscht
  → signOut() aufgerufen
  → isAuthenticated = false
  → App.js zeigt AuthGateway (oder Onboarding)
```

---

## 📱 UI-Sektionen im AccountScreen

### **Sektion 1: Konto-Informationen**
```
┌─────────────────────────────────┐
│ KONTO-INFORMATIONEN            │
├─────────────────────────────────┤
│ Name          Max Mustermann   │
│ E-Mail        max@test.com     │
│ Anmeldeart    E-Mail & Passwort│
│ E-Mail verifiziert  ○ Nicht    │
│ Konto erstellt      10.12.2025 │
└─────────────────────────────────┘
```

### **Sektion 2: Sicherheit** (nur bei E-Mail-Provider)
```
┌─────────────────────────────────┐
│ SICHERHEIT                     │
├─────────────────────────────────┤
│ Passwort ändern           →    │
│ Einen Reset-Link senden        │
└─────────────────────────────────┘
```

### **Sektion 3: Achtung (Danger Zone)**
```
┌─────────────────────────────────┐
│ ⚠ ACHTUNG                      │
├─────────────────────────────────┤
│ Konto löschen            ⚠     │
│ Alle Daten werden gelöscht     │
└─────────────────────────────────┘
```

### **Sektion 4: Logout-Button**
```
┌─────────────────────────────────┐
│        [Abmelden]              │
└─────────────────────────────────┘
```

---

## 🎨 Anpassung des Designs

Alle Styles sind in `styles` object am Ende von `AccountScreen.js`:

```javascript
const styles = StyleSheet.create({
  // Farben anpassen:
  header: {
    backgroundColor: '#fff',  // ← Deine Farbe
  },
  logoutButton: {
    backgroundColor: '#4A90E2',  // ← Deine Primärfarbe
  },
  dangerButton: {
    borderColor: '#E74C3C20',  // ← Deine Danger-Farbe
  },
  // ... etc
});
```

**Design-System:**
- **Primärfarbe:** `#4A90E2` (Blau)
- **Danger:** `#E74C3C` (Rot)
- **Hintergrund:** `#F5F7FA` (Hellgrau)
- **Text:** `#1A2332` (Dunkelgrau)
- **Secondary Text:** `#6B7A90` (Grau)

---

## 🧪 Testing

### **Test 1: Session-Persistenz**
1. App starten
2. Registrieren/Einloggen
3. App schließen (komplett beenden)
4. App neu starten
5. ✅ **Erwartet:** Direkt eingeloggt, kein Login-Screen

### **Test 2: Logout**
1. Eingeloggt sein
2. Zu AccountScreen navigieren
3. "Abmelden" klicken
4. Modal bestätigen
5. ✅ **Erwartet:** Zurück zu AuthGateway

### **Test 3: Passwort ändern**
1. Mit E-Mail-Provider eingeloggt sein
2. Zu AccountScreen navigieren
3. "Passwort ändern" klicken
4. Bestätigen
5. ✅ **Erwartet:** Alert mit "E-Mail gesendet"

### **Test 4: Konto löschen**
1. Eingeloggt sein
2. Zu AccountScreen navigieren
3. "Konto löschen" klicken
4. Erste Bestätigung
5. "LÖSCHEN" eingeben
6. Finale Bestätigung
7. ✅ **Erwartet:**
   - Konto gelöscht
   - Alle Daten weg
   - Zurück zu AuthGateway
   - Kann sich NICHT mehr mit den gleichen Credentials einloggen

---

## 🔧 Fehlerbehebung

### **Problem: Session bleibt nicht persistent**

**Lösung:**
```javascript
// In AuthContext.js, überprüfe ob loadAuthState() aufgerufen wird:
useEffect(() => {
  loadAuthState();  // ← Muss hier sein
}, []);
```

### **Problem: Nach Logout kommt User nicht zu Login-Screen**

**Lösung:**
```javascript
// In App.js, stelle sicher dass AuthGateway gerendert wird:
if (!isAuthenticated && !isFirstLaunch) {
  return <AuthGateway />;
}
```

### **Problem: Delete Account funktioniert nicht**

**Lösung:**
```javascript
// Überprüfe Console Logs:
console.log('Delete result:', result);

// Stelle sicher dass secureAuthService importiert ist:
import secureAuthService from '../services/secureAuthService';
```

---

## 📊 AsyncStorage Keys (für Debugging)

Diese Keys werden verwendet:

| Key | Was wird gespeichert |
|-----|---------------------|
| `decisio_encrypted_session` | Verschlüsselte Session |
| `decisio_last_activity` | Letzter Activity-Timestamp |
| `decisio_account_states` | Account States (locked, verified, etc.) |
| `decisio_users` | User-Datenbank (Credentials) |
| `decisio_security_events` | Security Event Log |
| `decisio_auth_user` | Alte Auth-Daten (Fallback) |
| `decisio_encryption_key` | Device-spezifischer Schlüssel (SecureStore) |

**Clear All Data (für Testing):**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// In React Native Debugger Console:
await AsyncStorage.clear();
```

---

## 🎯 Zusammenfassung

### **Was du jetzt hast:**

✅ **Session-Persistenz** - User muss sich nur 1x anmelden
✅ **Account Settings Screen** - Professionelle UI für Konto-Verwaltung
✅ **Logout mit Bestätigung** - Sichere Abmeldung
✅ **Delete Account** - DSGVO-konform mit doppelter Bestätigung
✅ **Passwort ändern** - Reset-Link-Funktion
✅ **Security Logging** - Alle Account-Aktionen werden geloggt

### **Was du tun musst:**

1. ✅ AccountScreen in deine Navigation integrieren (siehe Optionen A/B/C oben)
2. ✅ Design anpassen (optional, aber empfohlen)
3. ✅ Testen auf echtem Gerät

### **Was automatisch funktioniert:**

- ✅ Session-Persistenz (7 Tage)
- ✅ Auto-Logout bei Inaktivität (30 Min)
- ✅ Session-Revalidierung beim App-Foreground
- ✅ Sichere Datenlöschung bei Account-Deletion

---

**Du bist ready für Production! 🚀**

Bei Fragen siehe:
- `SECURITY_IMPLEMENTATION_GUIDE.md` - Für Security-Details
- `BUGFIX_AND_OPTIMIZATION_REPORT.md` - Für Performance-Infos
- `SECURITY_HARDENING_REPORT.md` - Für Crypto-Implementierung

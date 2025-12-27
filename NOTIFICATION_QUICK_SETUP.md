# 🔔 Push Notifications - Schnellanleitung

## ✅ Was wurde implementiert:

### 1. Notification Service (`services/notificationService.js`)
- ✅ Tägliche Benachrichtigungen um 19:00 Uhr
- ✅ 10 verschiedene motivierende Nachrichten
- ✅ Permission Management
- ✅ Enable/Disable Funktionen
- ✅ Test-Benachrichtigung

### 2. Was noch zu tun ist:

#### A. Permission Dialog Component erstellen
Erstelle `components/NotificationPermissionDialog.js` mit diesem Code:

```javascript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

export default function NotificationPermissionDialog({ visible, onAccept, onDecline }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.icon}>🔔</Text>
          <Text style={styles.title}>Bleib motiviert</Text>
          <Text style={styles.message}>
            Erhalte täglich um 19:00 Uhr eine inspirierende Erinnerung,{'\n'}
            um bessere Entscheidungen zu treffen.
          </Text>

          <TouchableOpacity style={styles.primaryButton} onPress={onAccept}>
            <Text style={styles.primaryButtonText}>Benachrichtigungen aktivieren</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onDecline}>
            <Text style={styles.secondaryButtonText}>Später</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#6b7280',
    fontSize: 16,
    textAlign: 'center',
  },
});
```

#### B. In App.js integrieren

Füge nach den Imports hinzu:
```javascript
import notificationService from './services/notificationService';
import NotificationPermissionDialog from './components/NotificationPermissionDialog';
```

Füge State hinzu (nach den anderen useState):
```javascript
const [showNotificationDialog, setShowNotificationDialog] = useState(false);
```

Füge useEffect hinzu (nach dem loadUserData):
```javascript
// Check if we should show notification permission dialog
useEffect(() => {
  const checkNotificationPermission = async () => {
    if (isAuthenticated && user) {
      const hasAsked = await notificationService.hasAskedPermission();
      if (!hasAsked) {
        // Wait 2 seconds after login, then show dialog
        setTimeout(() => {
          setShowNotificationDialog(true);
        }, 2000);
      }
    }
  };

  checkNotificationPermission();
}, [isAuthenticated, user]);
```

Füge Handler-Funktionen hinzu:
```javascript
const handleAcceptNotifications = async () => {
  setShowNotificationDialog(false);
  await notificationService.markPermissionAsked();

  const result = await notificationService.requestPermissions();
  if (result.granted) {
    await notificationService.enableNotifications();
    Alert.alert(
      'Benachrichtigungen aktiviert! 🎉',
      'Du erhältst täglich um 19:00 Uhr eine motivierende Nachricht.'
    );
  }
};

const handleDeclineNotifications = async () => {
  setShowNotificationDialog(false);
  await notificationService.markPermissionAsked();
};
```

Füge den Dialog vor dem letzten closing tag hinzu:
```javascript
<NotificationPermissionDialog
  visible={showNotificationDialog}
  onAccept={handleAcceptNotifications}
  onDecline={handleDeclineNotifications}
/>
```

#### C. Settings Integration (Optional aber empfohlen)

In `screens/AccountScreen.js`, füge nach den anderen Einstellungen hinzu:

```javascript
import notificationService from '../services/notificationService';

// In der State Section:
const [notificationsEnabled, setNotificationsEnabled] = useState(false);

// In useEffect (Daten laden):
const enabled = await notificationService.areNotificationsEnabled();
setNotificationsEnabled(enabled);

// Handler:
const toggleNotifications = async () => {
  try {
    if (notificationsEnabled) {
      await notificationService.disableNotifications();
      setNotificationsEnabled(false);
      Alert.alert('Deaktiviert', 'Benachrichtigungen wurden deaktiviert');
    } else {
      const result = await notificationService.requestPermissions();
      if (result.granted) {
        await notificationService.enableNotifications();
        setNotificationsEnabled(true);
        Alert.alert('Aktiviert! 🎉', 'Du erhältst täglich um 19:00 Uhr eine motivierende Nachricht');
      } else {
        Alert.alert('Berechtigung verweigert', 'Bitte aktiviere Benachrichtigungen in den Geräteeinstellungen');
      }
    }
  } catch (error) {
    Alert.alert('Fehler', 'Benachrichtigungen konnten nicht aktiviert werden');
  }
};

// Test-Button (nur im Dev-Mode):
const sendTestNotification = async () => {
  try {
    await notificationService.sendTestNotification();
    Alert.alert('Test gesendet', 'Benachrichtigung erscheint in 2 Sekunden');
  } catch (error) {
    Alert.alert('Fehler', 'Test-Benachrichtigung konnte nicht gesendet werden');
  }
};

// Im JSX (bei den anderen Einstellungen):
<TouchableOpacity
  style={styles.settingItem}
  onPress={toggleNotifications}
>
  <View style={styles.settingLeft}>
    <Text style={styles.settingIcon}>🔔</Text>
    <Text style={styles.settingText}>Tägliche Erinnerungen</Text>
  </View>
  <Text style={styles.settingValue}>
    {notificationsEnabled ? '✅ An' : '🔕 Aus'}
  </Text>
</TouchableOpacity>

{__DEV__ && (
  <TouchableOpacity
    style={[styles.settingItem, { backgroundColor: '#fef3c7' }]}
    onPress={sendTestNotification}
  >
    <View style={styles.settingLeft}>
      <Text style={styles.settingIcon}>🧪</Text>
      <Text style={styles.settingText}>Test-Benachrichtigung senden</Text>
    </View>
    <Text style={styles.settingArrow}>→</Text>
  </TouchableOpacity>
)}
```

## 🧪 Testing:

1. **App neu starten**
2. **Anmelden**
3. **Nach 2 Sekunden** erscheint Permission Dialog
4. **"Benachrichtigungen aktivieren"** klicken
5. **Gehe zu Settings** → Finde "Tägliche Erinnerungen"
6. **Klicke "Test-Benachrichtigung"** (nur Dev-Mode)
7. **Notification erscheint nach 2 Sekunden**

## 📱 Production Testing:

- **Wichtig:** Funktioniert nur auf echtem Gerät!
- Emulator zeigt keine Notifications
- iOS: App muss im Hintergrund/geschlossen sein
- Android: Funktioniert auch im Vordergrund

## ⏰ Zeitplan:

- Benachrichtigungen werden **täglich um 19:00 Uhr** (Geräte-Zeitzone) gesendet
- Jedes Mal eine **zufällige motivierende Nachricht** aus 10 Variationen

## ✅ Fertig!

Alle Teile sind implementiert. Folge einfach den Schritten oben für die Integration!

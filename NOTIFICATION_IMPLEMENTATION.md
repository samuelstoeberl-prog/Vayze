# 🔔 Push Notifications Implementation Guide

## Übersicht

Dieses Feature implementiert tägliche motivierende Benachrichtigungen für Vayze-Nutzer.

### Features:
- ✅ Permission Dialog beim ersten App-Start nach Anmeldung
- ✅ Täglich um 19:00 Uhr (beste Smartphone-Nutzungszeit)
- ✅ 10 verschiedene motivierende Nachrichten
- ✅ Einstellungen zum An/Ausschalten
- ✅ Test-Benachrichtigung für Entwicklung

### Technologie:
- **expo-notifications** (bereits installiert)
- **Lokale Notifications** (keine Firebase Cloud Messaging nötig für diesen Use Case)
- **AsyncStorage** für Permission-Status

## Implementierte Dateien:

### 1. `services/notificationService.js`
Haupt-Service für Notification-Management:
- Permission Request
- Daily Notification Scheduling
- Enable/Disable Funktionen
- Test Notifications

### 2. `components/NotificationPermissionDialog.js`
Schöner Dialog der beim ersten Login erscheint:
- Erklärt den Nutzen von Notifications
- "Aktivieren" / "Später" Buttons
- Wird nur einmal angezeigt

### 3. Integration in `App.js`
- Zeigt Permission Dialog nach Onboarding/Login
- Initialisiert Notifications

### 4. Integration in Settings (AccountScreen)
- Toggle für Notifications An/Aus
- Test-Button (nur im Dev-Mode)

## Nutzung:

### Für Entwickler:
```javascript
import notificationService from './services/notificationService';

// Permission anfordern
const result = await notificationService.requestPermissions();

// Tägliche Notification aktivieren
await notificationService.enableNotifications();

// Test-Benachrichtigung senden (2 Sekunden Verzögerung)
await notificationService.sendTestNotification();
```

### Für Nutzer:
1. App öffnen und anmelden
2. Permission Dialog erscheint
3. "Benachrichtigungen aktivieren" klicken
4. Täglich um 19:00 Uhr motivierende Nachricht erhalten

## Motivation Messages (10 Variationen):

1. "🧠 Zeit für eine kluge Entscheidung - Treffe heute eine durchdachte Wahl mit Vayze"
2. "✨ Deine beste Entscheidung wartet - Klarheit beginnt mit dem ersten Schritt"
3. "🎯 Bereit für Klarheit? - Nutze Vayze für deine nächste wichtige Entscheidung"
4. "💡 Entscheidungen mit Zuversicht - Analysiere deine Optionen"
5. "🌟 Dein Entscheidungs-Moment - Finde heraus, was wirklich zählt"
6. "🚀 Fortschritt beginnt jetzt - Eine gute Entscheidung kann alles verändern"
7. "🎨 Gestalte dein Leben - Jede Entscheidung ist ein Schritt"
8. "🔮 Klarheit finden - Vayze hilft dir"
9. "💪 Selbstbewusst entscheiden - Du hast die Kontrolle"
10. "🌈 Mach es möglich - Zeit für eine Entscheidung"

## Google Play Compliance:

✅ **Transparent:** User wird klar gefragt
✅ **Optional:** Kann abgelehnt werden
✅ **Kontrolle:** Kann jederzeit deaktiviert werden
✅ **Kein Spam:** Nur 1x täglich
✅ **Wertvoll:** Motivierend und relevant

## Testing:

### Test-Notification senden:
1. Gehe zu Settings (⚙ Tab)
2. Scrolle nach unten
3. Klicke "Test-Benachrichtigung senden"
4. Notification erscheint nach 2 Sekunden

### Scheduled Notifications prüfen:
```javascript
const scheduled = await notificationService.getScheduledNotifications();
console.log(scheduled); // Zeigt alle geplanten Notifications
```

## Troubleshooting:

**Problem:** Notifications erscheinen nicht
- ✅ Physisches Gerät verwenden (Emulator unterstützt keine Notifications)
- ✅ Permissions prüfen in Geräte-Einstellungen
- ✅ App im Hintergrund/geschlossen testen

**Problem:** Permission Dialog erscheint nicht
- ✅ AsyncStorage Key löschen: `notification_permission_asked`
- ✅ App-Daten löschen und neu installieren

**Problem:** Zeit stimmt nicht
- ✅ Zeitzone des Geräts prüfen
- ✅ Notification ist auf 19:00 Uhr Geräte-Zeit eingestellt

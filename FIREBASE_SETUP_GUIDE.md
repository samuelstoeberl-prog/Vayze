# Firebase Password Reset - Setup Guide

**Version**: 1.3.0
**Erstellt**: 14. Dezember 2025
**Status**: ✅ Implementiert (Config erforderlich)

---

## 📋 Übersicht

Firebase Authentication wurde für **Email-basierte Password Reset Funktionalität** implementiert. Kein Custom Backend erforderlich!

### ✅ Was wurde implementiert:

1. **PasswordResetScreen** - Standalone UI für Password Reset
2. **passwordResetService** - Firebase Integration
3. **StandaloneAuthScreen Integration** - "Passwort vergessen?" Link
4. **AccountScreen Integration** - Password Reset aus Settings
5. **Firebase Config** - firebaseConfig.js (muss konfiguriert werden)

---

## 🔥 Firebase Setup (Schritt-für-Schritt)

### Schritt 1: Firebase Projekt erstellen

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Klicke auf **"Add project"** / **"Projekt hinzufügen"**
3. Projekt-Name: **"Vayze"** (oder beliebig)
4. Google Analytics: **Optional** (nicht erforderlich)
5. Klicke auf **"Create project"**

### Schritt 2: Web App registrieren

1. In Firebase Console → **Project Overview**
2. Klicke auf **Web Icon** (</>) → **"Add app"**
3. App Nickname: **"Vayze App"**
4. **Firebase Hosting**: NICHT aktivieren (nicht erforderlich)
5. Klicke auf **"Register app"**

### Schritt 3: Firebase Config kopieren

Nach Registrierung siehst du deinen **Firebase Config**:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "vayze-app.firebaseapp.com",
  projectId: "vayze-app",
  storageBucket: "vayze-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

**📋 DIESE WERTE KOPIEREN!**

### Schritt 4: Config in App einfügen

**Datei**: `services/firebaseConfig.js`

**Ersetze**:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // ← Ersetzen
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // ← Ersetzen
  projectId: "YOUR_PROJECT_ID", // ← Ersetzen
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // ← Ersetzen
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // ← Ersetzen
  appId: "YOUR_APP_ID" // ← Ersetzen
};
```

**Mit deinen echten Werten!**

### Schritt 5: Authentication aktivieren

1. Firebase Console → **Authentication** (linkes Menü)
2. Klicke auf **"Get started"**
3. Tab **"Sign-in method"**
4. Klicke auf **"Email/Password"**
5. **Enable** den Toggle für "Email/Password"
6. **NICHT** "Email link (passwordless sign-in)" aktivieren
7. Klicke auf **"Save"**

### Schritt 6: Email Template anpassen (Optional)

1. Firebase Console → **Authentication** → **Templates**
2. Wähle **"Password reset"**
3. **Sender Name**: "Vayze"
4. **Subject**: "Setze dein Vayze-Passwort zurück"
5. **Template** anpassen:

```html
<p>Hallo,</p>
<p>Wir haben eine Anfrage zum Zurücksetzen deines Vayze-Passworts erhalten.</p>
<p>Klicke auf den folgenden Link, um dein Passwort zurückzusetzen:</p>
<p><a href="%LINK%">Passwort zurücksetzen</a></p>
<p>Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.</p>
<p>Der Link ist 1 Stunde gültig.</p>
<p>Viele Grüße,<br>Dein Vayze Team</p>
```

6. Klicke auf **"Save"**

### Schritt 7: Custom Domain (Optional, für Production)

**Standard**: `vayze-app.firebaseapp.com`

**Custom Domain** (z.B. `vayze.app`):
1. Firebase Console → **Authentication** → **Settings**
2. Tab **"Authorized domains"**
3. Klicke auf **"Add domain"**
4. Gib deine Domain ein: `vayze.app`
5. Klicke auf **"Add"**

---

## 🧪 Testing

### Test 1: Password Reset Flow

1. **Öffne App** → Gehe zu Login Screen
2. Klicke auf **"Passwort vergessen?"**
3. Gib eine **registrierte E-Mail** ein
4. Klicke auf **"Reset-Link senden"**
5. ✅ **Erwartung**: "E-Mail versendet" Bestätigung
6. **Überprüfe E-Mail** (auch Spam-Ordner!)
7. Klicke auf **Reset-Link** in Email
8. **Gib neues Passwort ein** (Firebase-Hosted Page)
9. ✅ **Erwartung**: "Passwort erfolgreich zurückgesetzt"
10. **Login mit neuem Passwort**

### Test 2: AccountScreen Integration

1. **Einloggen** in App
2. Gehe zu **Einstellungen** → **Konto-Einstellungen**
3. Klicke auf **"Passwort ändern"**
4. Bestätige **"E-Mail senden"**
5. ✅ **Erwartung**: "E-Mail gesendet" Alert
6. **Überprüfe E-Mail**

### Test 3: Error Handling

**Test 3.1: Ungültige Email**
- Input: `nicht-email`
- ✅ Erwartung: "Bitte gib eine gültige E-Mail-Adresse ein."

**Test 3.2: Leeres Feld**
- Input: (leer)
- ✅ Erwartung: "Bitte gib eine E-Mail-Adresse ein."

**Test 3.3: Nicht-existierende Email**
- Input: `nichtexistent@example.com`
- ✅ Erwartung: "Falls ein Account mit dieser E-Mail existiert..." (Security: Kein User Enumeration)

**Test 3.4: Rate Limiting**
- 5+ Anfragen in kurzer Zeit
- ✅ Erwartung: "Zu viele Anfragen. Bitte versuche es später erneut."

### Test 4: Offline Handling

1. **Deaktiviere Internet**
2. Versuche Password Reset
3. ✅ Erwartung: "Netzwerkfehler. Bitte überprüfe deine Internetverbindung."

---

## 📱 User Flow

### Flow 1: Von Login Screen

```
Login Screen
    │
    ├─→ Klick "Passwort vergessen?"
    │
    ▼
Password Reset Screen
    │
    ├─→ Email eingeben
    │
    ├─→ Klick "Reset-Link senden"
    │
    ▼
Success Screen
    │
    └─→ Auto-Close (5s) → Zurück zu Login
```

### Flow 2: Von Account Settings

```
Settings
    │
    └─→ Konto-Einstellungen
        │
        └─→ Passwort ändern
            │
            ├─→ Bestätigungs-Alert
            │
            ├─→ E-Mail wird gesendet
            │
            └─→ "E-Mail gesendet" Alert
```

### Flow 3: Email → Password Reset

```
E-Mail erhalten
    │
    └─→ Klick auf Reset-Link
        │
        ▼
Firebase-Hosted Page
(automatisch)
        │
        ├─→ Neues Passwort eingeben
        │
        ├─→ Passwort bestätigen
        │
        └─→ "Passwort erfolgreich zurückgesetzt"
            │
            └─→ Zurück zur App
                │
                └─→ Login mit neuem Passwort
```

---

## 🔧 Technische Details

### Dependencies

**Neue Dependencies** (bereits installiert):
```json
{
  "firebase": "^12.6.0",
  "@react-native-firebase/app": "^23.7.0",
  "@react-native-firebase/auth": "^23.7.0"
}
```

### Dateien

| Datei | Beschreibung |
|-------|-------------|
| `services/firebaseConfig.js` | Firebase Initialisierung |
| `services/passwordResetService.js` | Password Reset Logic |
| `screens/PasswordResetScreen.js` | UI für Password Reset |
| `screens/StandaloneAuthScreen.js` | Integration (Zeile 23, 38-40, 223-231) |
| `screens/AccountScreen.js` | Integration (Zeile 26, 79-108) |

### API Calls

**sendPasswordReset(email)**:
```javascript
const result = await sendPasswordReset('user@example.com');

// Success:
{
  success: true,
  message: "Wir haben dir eine E-Mail gesendet..."
}

// Error:
{
  success: false,
  message: "Ungültige E-Mail-Adresse."
}
```

### Firebase Auth Errors

| Error Code | Beschreibung | User Message |
|-----------|-------------|-------------|
| `auth/user-not-found` | User existiert nicht | "Falls ein Account existiert..." (Security) |
| `auth/invalid-email` | Ungültige Email | "Ungültige E-Mail-Adresse." |
| `auth/too-many-requests` | Rate Limit | "Zu viele Anfragen..." |
| `auth/network-request-failed` | Offline | "Netzwerkfehler..." |

---

## 🔒 Security Best Practices

### ✅ Implementiert:

1. **No User Enumeration**: Bei `user-not-found` wird NICHT verraten, dass User nicht existiert
2. **Rate Limiting**: Firebase Rate Limiting aktiv
3. **Link Expiration**: Reset-Links sind 1 Stunde gültig
4. **Email Validation**: Client-seitige Validierung
5. **HTTPS Only**: Firebase erzwingt HTTPS

### ⚠️ Zusätzliche Empfehlungen:

1. **reCAPTCHA** (optional): Schutz vor Bots
   - Firebase Console → Authentication → Settings → Enable reCAPTCHA

2. **Email Allowlist** (optional): Nur bestimmte Domains erlauben
   - Nicht empfohlen für Production

3. **Custom Email Action Handler** (optional): Eigene Reset-Page statt Firebase-Hosted
   - Komplexer, aber mehr Kontrolle

---

## 🚀 Production Checklist

### Vor Release:

- [x] Firebase Projekt erstellt
- [ ] Firebase Config in `firebaseConfig.js` eingefügt ⚠️
- [ ] Authentication aktiviert (Email/Password)
- [ ] Email Template angepasst
- [ ] Authorized Domains hinzugefügt (vayze.app)
- [ ] Password Reset getestet (alle Flows)
- [ ] Error Handling getestet
- [ ] reCAPTCHA aktiviert (optional, empfohlen)

### App Store Requirements:

**Apple App Store**:
- ✅ Firebase Auth ist erlaubt
- ✅ Kein Hinweis auf "externe Login-Provider" erforderlich (ist Firebase)

**Google Play Store**:
- ✅ Firebase Auth ist erlaubt
- ✅ Privacy Policy muss Firebase erwähnen (siehe unten)

---

## 📄 Privacy Policy Update

**WICHTIG**: Privacy Policy muss aktualisiert werden!

**Zu ergänzen in PRIVACY_POLICY.md**:

```markdown
## 8. Drittanbieter-Dienste

Wir verwenden Firebase Authentication (Google LLC) für:
- Password Reset via E-Mail
- Sichere Authentifizierung

**Daten an Firebase**:
- E-Mail-Adresse (nur bei Password Reset)
- IP-Adresse (automatisch)

**Firebase Privacy Policy**: https://firebase.google.com/support/privacy

Firebase ist DSGVO-konform und hat einen Data Processing Agreement (DPA).
```

---

## 🐛 Troubleshooting

### Problem 1: "Firebase initialization error"

**Ursache**: Config nicht ausgefüllt oder falsch

**Lösung**:
1. Überprüfe `services/firebaseConfig.js`
2. Stelle sicher, dass ALLE Felder ausgefüllt sind
3. Keine Anführungszeichen vergessen!

### Problem 2: "Email not sent"

**Ursache**: Authentication nicht aktiviert

**Lösung**:
1. Firebase Console → Authentication
2. Sign-in method → Email/Password
3. Enable aktivieren

### Problem 3: "Invalid email domain"

**Ursache**: Domain nicht in Authorized Domains

**Lösung**:
1. Firebase Console → Authentication → Settings
2. Authorized domains → Add domain

### Problem 4: "Too many requests" bei jedem Versuch

**Ursache**: IP geblockt (zu viele fehlerhafte Versuche)

**Lösung**:
1. Warte 1 Stunde
2. Oder: Firebase Console → Authentication → Settings → Reset rate limiting

---

## 💡 FAQ

**Q: Muss ich ein Firebase Backend bauen?**
A: NEIN! Firebase Auth funktioniert clientseitig. Kein Server erforderlich.

**Q: Kostet Firebase Auth etwas?**
A: Firebase Auth ist **kostenlos** bis 10.000 Verifications/Monat. Für Vayze mehr als ausreichend!

**Q: Funktioniert das offline?**
A: NEIN. Password Reset benötigt Internetverbindung (Email-Versand).

**Q: Kann ich das Design der Reset-Email anpassen?**
A: JA! Firebase Console → Authentication → Templates.

**Q: Kann ich die Firebase-Hosted Reset-Page anpassen?**
A: Nur begrenzt. Für vollständige Kontrolle: Custom Action Handler (komplexer).

**Q: Funktioniert das mit meinem lokalen Auth-System?**
A: Firebase Auth ist **zusätzlich** zum lokalen System. Beide können parallel existieren.

**Q: Muss ich meine Passwörter zu Firebase migrieren?**
A: NEIN! Firebase Auth wird NUR für Password Reset verwendet. Dein lokales System bleibt bestehen.

---

## 📚 Weitere Ressourcen

**Firebase Docs**:
- [Firebase Auth Email Password](https://firebase.google.com/docs/auth/web/password-auth)
- [Password Reset](https://firebase.google.com/docs/auth/web/manage-users#send_a_password_reset_email)
- [Customize Email Templates](https://firebase.google.com/docs/auth/custom-email-handler)

**React Native Firebase**:
- [Docs](https://rnfirebase.io/)
- [Authentication Module](https://rnfirebase.io/auth/usage)

---

**Setup abgeschlossen? Teste alle Flows!** ✅

Bei Fragen: Siehe Troubleshooting oder Firebase Docs.

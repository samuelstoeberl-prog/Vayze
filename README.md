# Vayze - Smarter Entscheidungen treffen

**Version 1.3.0**

Vayze ist eine React Native App, die dir hilft, bessere Entscheidungen zu treffen. Mit wissenschaftlich fundierten Methoden und einem intuitiven Design analysiert Vayze deine Optionen und hilft dir, klarer zu denken.

## 📱 Features

### ✅ Kernfunktionen
- **Entscheidungs-Assistent** - Strukturierte Analyse mit 6-Schritte-Framework
- **Quick Mode** - Schnelle Entscheidungen mit 3-Fragen-Flow
- **Tracker & Kalender** - Verfolge deine Entscheidungshistorie
- **Board-System** - Kanban-Board für Aufgaben und Entscheidungen
- **Multi-User Support** - Jeder Account hat seine eigenen Daten

### 🔐 Sicherheit & Authentifizierung
- Verschlüsselte Session-Speicherung (expo-secure-store)
- Password Hashing mit Crypto
- 365-Tage Sessions
- Account-Verwaltung (Passwort ändern, Account löschen)
- Password Reset via Email

### 🎨 Design & UX
- Premium 6-Screen Onboarding
- Moderne UI mit Linear Gradients
- Responsive Design (iOS & Android)
- Dark Mode Support (in Einstellungen)
- Intuitive Gesten & Animationen

### 📊 Daten & Speicherung
- Benutzerspezifische Datenisolation
- AsyncStorage für Persistenz
- Zustand State Management für Board-Karten
- Automatische Migration von Legacy-Daten
- Undo/Redo Support im Board

## 🚀 Installation

```bash
# Dependencies installieren
npm install

# App starten
npm start

# iOS
npm run ios

# Android
npm run android

# Icons & Splash generieren
npm run generate:assets
```

## 📦 Dependencies

- **React Native** (0.81.5) - Mobile Framework
- **Expo** (~54.0.29) - Development Platform
- **AsyncStorage** (2.2.0) - Datenspeicherung
- **Zustand** (5.0.9) - State Management
- **expo-linear-gradient** - UI Gradients
- **expo-secure-store** - Verschlüsselte Speicherung
- **expo-crypto** - Cryptographic Functions
- **react-native-svg** - SVG Support

## 📱 App-Struktur

```
├── App.js                    # Hauptkomponente
├── components/
│   ├── Board/               # Board & Kanban System
│   ├── Card/                # Card Management
│   ├── Filters/             # Filter & Search
│   ├── OnboardingFlowNew.js # Premium Onboarding
│   ├── SplashScreen.js      # Splash Screen
│   └── ...
├── contexts/
│   └── AuthContext.js       # Auth State Management
├── screens/
│   ├── AccountScreen.js     # Account Settings
│   ├── StandaloneAuthScreen.js # Login/Signup
│   └── ...
├── services/
│   ├── authService.js       # Basic Auth
│   └── secureAuthService.js # Secure Auth
├── store/
│   └── cardStore.js         # Zustand Card Store
├── utils/
│   ├── userStorage.js       # User-Scoped Storage
│   └── debugAsyncStorage.js # Debug Utilities
└── hooks/
    └── useSecureAuth.js     # Auth Hook
```

## 🔧 Konfiguration

### app.json
- **Name**: Vayze
- **Slug**: vayze-app
- **Version**: 1.3.0
- **Bundle ID** (iOS): com.vayze.app
- **Package** (Android): com.vayze.app

### Icons & Splash Screen
Alle Icons und der Splash Screen sind bereits generiert und in `/assets` vorhanden.

## 🧪 Testing

```bash
# Debug AsyncStorage
# In React Native Debugger Console:
import { debugShowAllUsers, debugShowAllKeys } from './utils/debugAsyncStorage';
await debugShowAllUsers();
await debugShowAllKeys();

# Multi-User Testing
# 1. Account 1 erstellen → Daten anlegen
# 2. Logout → Account 2 erstellen → Andere Daten
# 3. Zwischen Accounts wechseln → Daten isoliert
```

## 📖 Dokumentation

Detaillierte Dokumentation zu spezifischen Features:

- `CHANGELOG.md` - Alle Versionen & Änderungen
- `USER_SCOPED_STORAGE_GUIDE.md` - Multi-User Implementation
- `ACCOUNT_INTEGRATION_GUIDE.md` - Account Management
- `SECURITY_IMPLEMENTATION_GUIDE.md` - Security Features
- `FUNKTIONSUEBERSICHT.md` - Feature-Übersicht

## 🐛 Bug Reports & Feature Requests

Bitte erstelle ein Issue auf GitHub oder kontaktiere den Support.

## 📄 Lizenz

Proprietär - Alle Rechte vorbehalten.

## 👨‍💻 Entwicklung

**Aktueller Status**: Version 1.3.0 - Production Ready

**Nächste Schritte**:
- App Store Submission vorbereiten
- Privacy Policy & Terms of Service finalisieren
- Backend-Integration (optional)
- Analytics Integration

---

**Erstellt mit ❤️ von Vayze Team**

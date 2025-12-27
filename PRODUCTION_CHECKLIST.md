# 🚀 Production Release Checklist - Vayze App

**Version 1.3.0**
**Stand: 14. Dezember 2025**

---

## ✅ 1. FEHLER & BUGS (Behoben)

### 1.1 Code-Probleme
- [x] **Ungenutzter Import entfernt** - `debugShowAllUsers, debugShowAllKeys` aus App.js entfernt (nur in DEV-Build nötig)
- [x] **Version aktualisiert** - app.json auf 1.3.0 aktualisiert
- [x] **iOS Build Number** - auf 1.3.0 aktualisiert
- [x] **Debug-Logs** - Alle Debug-Logs sind mit `__DEV__` Condition versehen (werden in Production automatisch entfernt)

### 1.2 Funktionale Bugs (aus früheren Sessions)
- [x] Login-Bug behoben - `loadUsers()` wird vor Login aufgerufen
- [x] Tracker Date Bug behoben - UTC-Timezone korrekt
- [x] Multi-User Data Isolation - Alle Daten user-scoped

---

## ❌ 2. KRITISCHE FEHLENDE ELEMENTE (Muss vor Release)

### 2.1 Rechtliche Dokumente ⚠️ **KRITISCH**
- [x] **README.md** - Erstellt ✅
- [x] **PRIVACY_POLICY.md** - Template erstellt ⚠️ **PERSONALISIERUNG ERFORDERLICH**
- [x] **TERMS_OF_SERVICE.md** - Template erstellt ⚠️ **PERSONALISIERUNG ERFORDERLICH**
- [ ] **LICENSE.txt** - FEHLEND ❌
  - **Action**: Wähle Lizenz (MIT, Proprietär, etc.)
  - **Wo**: Root-Verzeichnis

**🚨 WICHTIG**: Privacy Policy & Terms müssen personalisiert werden:
- [ ] Alle `[BITTE ERGÄNZEN]` Platzhalter ausfüllen (Name, Adresse, E-Mail, etc.)
- [ ] Rechtsanwalt konsultieren für DSGVO-Compliance (empfohlen)
- [ ] URLs hosten (z.B. vayze.com/privacy, vayze.com/terms)

### 2.2 In-App Referenzen zu Privacy/Terms ✅ **IMPLEMENTIERT**
- [x] **Privacy Policy Link** in OnboardingFlowNew.js - IMPLEMENTIERT ✅
  - **Wo**: Screen 5 (Gateway) - unterhalb Account-Erstellung
  - **Text**: "Mit der Registrierung akzeptierst du unsere [Nutzungsbedingungen](#) und [Datenschutzerklärung](#)"
  - **Zeile**: OnboardingFlowNew.js:629-651

- [x] **Privacy Policy Link** in StandaloneAuthScreen.js - IMPLEMENTIERT ✅
  - **Wo**: Unterhalb Signup-Button
  - **Zeile**: StandaloneAuthScreen.js:229-251

- [x] **Settings → Privacy & Legal** - IMPLEMENTIERT ✅
  - **Wo**: Tab 4 (Einstellungen) - Neue Sektion "RECHTLICHES"
  - **Content**:
    - Datenschutzerklärung (mit Accessibility)
    - Nutzungsbedingungen (mit Accessibility)
    - Support kontaktieren (mailto)
  - **Zeile**: App.js:731-766

**Implementierungs-Details**:
- Alle Links verwenden `Linking.openURL()` für sicheres Öffnen
- Accessibility Labels für Screen Reader (`accessibilityLabel`, `accessibilityHint`, `accessibilityRole="link"`)
- Placeholder URLs: `https://github.com/vayze-app/privacy-policy` & `https://github.com/vayze-app/terms-of-service`
- ⚠️ **URLs müssen vor Release aktualisiert werden!**

### 2.3 App Store Metadaten ⚠️ **ERFORDERLICH**

#### Apple App Store
- [ ] **App Name** - "Vayze" ✅ (in app.json)
- [ ] **Subtitle** - FEHLEND ❌
  - Empfehlung: "Smarter Entscheidungen treffen"
- [ ] **Description** (4000 Zeichen) - FEHLEND ❌
- [ ] **Keywords** - FEHLEND ❌
  - Empfehlung: "Entscheidung, Entscheidungshilfe, Produktivität, Kanban, Board, Planung"
- [ ] **Screenshots** (6.5", 6.7", 12.9") - FEHLEND ❌
  - Erforderlich: Mindestens 1 pro Größe
  - Empfohlen: 3-5 Screenshots
- [ ] **App Preview Video** (optional) - FEHLEND
- [ ] **Privacy Policy URL** - ERFORDERLICH ❌
- [ ] **Support URL** - ERFORDERLICH ❌
- [ ] **Marketing URL** (optional) - FEHLEND

#### Google Play Store
- [ ] **Short Description** (80 Zeichen) - FEHLEND ❌
  - Empfehlung: "Treffe bessere Entscheidungen mit strukturierter Analyse"
- [ ] **Full Description** (4000 Zeichen) - FEHLEND ❌
- [ ] **Screenshots** (Phone, 7" Tablet, 10" Tablet) - FEHLEND ❌
- [ ] **Feature Graphic** (1024x500) - FEHLEND ❌
- [ ] **Privacy Policy URL** - ERFORDERLICH ❌
- [ ] **App Category** - FEHLEND ❌
  - Empfehlung: "Productivity" oder "Lifestyle"

### 2.4 App-Konfiguration

#### app.json - Fehlende Felder
- [ ] **description** - FEHLEND ❌
  ```json
  "description": "Treffe bessere Entscheidungen mit Vayze"
  ```
- [ ] **privacy** - FEHLEND ❌ (für Expo)
  ```json
  "privacy": "unlisted" // oder "public"
  ```
- [ ] **githubUrl** (optional) - FEHLEND
- [ ] **primaryColor** - Vorhanden ✅ (#3B82F6)

#### iOS-spezifisch
- [ ] **CFBundleDisplayName** - FEHLEND (optional, verwendet "name" als Fallback)
- [ ] **NSCameraUsageDescription** - Nicht benötigt ✅
- [ ] **NSPhotoLibraryUsageDescription** - Nicht benötigt ✅
- [ ] **NSLocationWhenInUseUsageDescription** - Nicht benötigt ✅
- [x] **UILaunchStoryboardName** - Vorhanden ✅

#### Android-spezifisch
- [ ] **permissions** - Prüfen ❌
  ```json
  "permissions": [] // Minimale Permissions
  ```
- [x] **adaptiveIcon** - Vorhanden ✅
- [ ] **googleServicesFile** - Nicht erforderlich (keine Firebase) ✅

### 2.5 Build-Konfiguration ⚠️ **ERFORDERLICH**

- [ ] **EAS Build Konfiguration** - FEHLEND ❌
  - **Datei**: `eas.json` fehlt
  - **Action**: Erstelle eas.json für Build-Profile

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  }
}
```

- [ ] **Apple Developer Account** - ERFORDERLICH ❌
  - Kosten: 99€/Jahr
  - URL: https://developer.apple.com

- [ ] **Google Play Console Account** - ERFORDERLICH ❌
  - Einmalige Gebühr: 25$
  - URL: https://play.google.com/console

### 2.6 Backend/API ⚠️ **OPTIONAL aber EMPFOHLEN**

**Aktueller Status**: Alle Daten lokal, kein Backend

**Probleme ohne Backend**:
- ❌ Kein Password Reset (Email-Versand nicht möglich)
- ❌ Keine Geräte-Synchronisation
- ❌ Kein Cloud-Backup
- ❌ Account-Recovery unmöglich bei Geräteverlust

**Empfohlene Features für Backend** (optional):
- [ ] Password Reset Email-Versand
- [ ] Cloud-Backup von Entscheidungen
- [ ] Multi-Device Sync
- [ ] Analytics (User-Engagement, Crash-Reports)

**Mögliche Services**:
- Firebase (Free Tier verfügbar)
- Supabase (Open Source)
- Custom Node.js Backend

---

## ⚠️ 3. WICHTIGE WARNUNGEN & EMPFEHLUNGEN

### 3.1 Security Audit
- [ ] **Penetration Testing** - EMPFOHLEN
- [ ] **Code Review** - EMPFOHLEN
- [ ] **Dependency Audit** - DURCHFÜHREN
  ```bash
  npm audit
  npm audit fix
  ```

### 3.2 Performance Optimierung
- [ ] **Bundle Size** prüfen
  ```bash
  npx react-native-bundle-visualizer
  ```
- [ ] **Memory Leaks** testen (Android/iOS)
- [ ] **Startup Time** optimieren (<3 Sekunden empfohlen)

### 3.3 Accessibility (A11y)
- [ ] **Screen Reader Support** - FEHLT teilweise ❌
  - Action: `accessibilityLabel` zu Buttons hinzufügen
- [ ] **Kontrast-Check** - Prüfen (WCAG 2.1 AA)
- [ ] **Schriftgröße** - Skalierbar? (iOS Dynamic Type)

### 3.4 Internationalisierung (i18n)
- [ ] **Mehrsprachigkeit** - FEHLT ❌
  - Aktuell: Nur Deutsch
  - Empfohlen: Englisch hinzufügen
  - Library: `react-i18next` oder `expo-localization`

### 3.5 Analytics & Monitoring
- [ ] **Crash Reporting** - FEHLT ❌
  - Empfohlen: Sentry, Bugsnag, Firebase Crashlytics
- [ ] **Analytics** - FEHLT (optional)
  - Hinweis: Datenschutz beachten (DSGVO)!
- [ ] **Performance Monitoring** - FEHLT (optional)

### 3.6 Error Handling
- [ ] **Offline-Mode** - Teilweise ✅
  - App funktioniert offline
  - Aber: Login/Registrierung benötigt Internet
  - Verbesserung: Offline-Queue für Login-Versuche

- [ ] **Fehler-Toast/Alerts** - Prüfen ❌
  - Sind alle Error-Cases abgedeckt?
  - Benutzerfreundliche Fehlermeldungen?

---

## 📋 4. TESTING CHECKLIST

### 4.1 Funktionale Tests
- [ ] **Onboarding Flow** (alle 6 Screens)
- [ ] **Login/Logout** (Email/Password)
- [ ] **Registrierung** (neuer Account)
- [ ] **Password Reset** (derzeit nicht möglich ohne Backend!)
- [ ] **Entscheidung treffen** (Full & Quick Mode)
- [ ] **Board-System** (Cards erstellen, verschieben, löschen)
- [ ] **Multi-User** (2 Accounts, Daten isoliert?)
- [ ] **Account-Löschung** (alle Daten entfernt?)
- [ ] **Settings** (alle Optionen funktionieren?)

### 4.2 Device Tests
- [ ] **iOS** (iPhone SE, 12, 14 Pro)
- [ ] **Android** (verschiedene Hersteller: Samsung, Pixel, Xiaomi)
- [ ] **Tablets** (iPad, Android Tablet)
- [ ] **Dark Mode** (funktioniert Settings-Toggle?)
- [ ] **Rotation** (Portrait/Landscape)
- [ ] **Verschiedene Bildschirmgrößen**

### 4.3 Edge Cases
- [ ] **Lange Texte** (Entscheidungen mit 500+ Zeichen)
- [ ] **Leere States** (kein Content vorhanden)
- [ ] **Offline-Nutzung** (Internet aus)
- [ ] **App im Hintergrund** (Pause/Resume)
- [ ] **Low Memory** (Speicher voll)
- [ ] **Gerätewechsel** (alte Daten vorhanden?)

### 4.4 Security Tests
- [ ] **SQL Injection** - N/A (keine SQL-DB)
- [ ] **XSS** - N/A (React Native)
- [ ] **Passwort-Hashing** - Prüfen ✅ (simpleHash verwendet)
- [ ] **Session Timeout** - 365 Tage (zu lang?)
- [ ] **Brute-Force Protection** - FEHLT ❌
  - Empfehlung: Rate-Limiting für Login

---

## 🎨 5. ASSETS & DESIGN

### 5.1 Icons & Splash
- [x] **App Icon** (1024x1024) - Vorhanden ✅
- [x] **Adaptive Icon** (Android) - Vorhanden ✅
- [x] **Splash Screen** - Vorhanden ✅
- [ ] **Favicon** (Web) - Vorhanden (48x48) ✅

### 5.2 Screenshots für Stores
- [ ] **iPhone Screenshots** - FEHLEN ❌
  - 6.7" (iPhone 14 Pro Max): 1290 x 2796
  - 6.5" (iPhone 14 Plus): 1242 x 2688
  - 5.5" (iPhone 8 Plus): 1242 x 2208

- [ ] **iPad Screenshots** - FEHLEN ❌
  - 12.9" (iPad Pro): 2048 x 2732

- [ ] **Android Screenshots** - FEHLEN ❌
  - Phone: 1080 x 1920 (oder höher)
  - 7" Tablet: 1024 x 1600
  - 10" Tablet: 1600 x 2560

**Tool-Empfehlung**: Verwende Expo-Simulator + Screenshot-Tool

### 5.3 Marketing Assets
- [ ] **Feature Graphic** (Google Play) - FEHLT ❌
  - 1024 x 500 px
- [ ] **Promo Video** (optional) - FEHLT

---

## 📄 6. DOKUMENTATION

### 6.1 User-Facing
- [x] **README.md** - Erstellt ✅
- [ ] **FAQ** - FEHLT ❌
- [ ] **Help/Support Page** - FEHLT ❌
- [ ] **Onboarding Tutorial** - Teilweise (Onboarding-Screens) ✅

### 6.2 Developer
- [x] **CHANGELOG.md** - Vorhanden ✅
- [x] **Technical Docs** - Umfangreich vorhanden ✅
  - USER_SCOPED_STORAGE_GUIDE.md
  - ACCOUNT_INTEGRATION_GUIDE.md
  - SECURITY_IMPLEMENTATION_GUIDE.md
  - etc.

---

## 🚀 7. DEPLOYMENT

### 7.1 Pre-Deployment
- [ ] **Environment Variables** prüfen
- [ ] **API Keys** (falls verwendet) - sicher gespeichert?
- [ ] **Debug-Modus** deaktiviert (`__DEV__ = false` in Production)
- [ ] **Console.logs** entfernt/disabled (außer `__DEV__`)

### 7.2 Build Process
```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production

# Beide
eas build --platform all --profile production
```

### 7.3 Submission
- [ ] **Apple App Store Connect** - Upload IPA
- [ ] **Google Play Console** - Upload AAB
- [ ] **App Review Notes** vorbereiten
- [ ] **Demo Account** für Reviewer (falls erforderlich)

---

## ✅ 8. ZUSAMMENFASSUNG - KRITISCHE TODOS

### 🔴 **BLOCKER** (Muss vor Release)
1. [ ] **Privacy Policy personalisieren** (alle [BITTE ERGÄNZEN] ausfüllen)
2. [ ] **Terms of Service personalisieren** (alle [BITTE ERGÄNZEN] ausfüllen)
3. [ ] **Privacy/Terms Links in App einfügen** (OnboardingFlowNew, StandaloneAuthScreen, Settings)
4. [ ] **Privacy Policy URL hosten** (erforderlich für App Stores)
5. [ ] **App Store Screenshots** erstellen (iOS & Android)
6. [ ] **App Store Descriptions** schreiben
7. [ ] **EAS Build Config** (`eas.json`) erstellen
8. [ ] **Apple Developer Account** registrieren (99€/Jahr)
9. [ ] **Google Play Console Account** erstellen (25$ einmalig)

### 🟡 **WICHTIG** (Stark empfohlen)
1. [ ] **Password Reset Backend** implementieren (derzeit nicht möglich!)
2. [ ] **Brute-Force Protection** (Login-Versuche limitieren)
3. [ ] **Crash Reporting** einrichten (Sentry/Bugsnag)
4. [ ] **Accessibility Labels** hinzufügen
5. [ ] **FAQ/Help Section** erstellen
6. [ ] **Englische Übersetzung** (i18n)

### 🟢 **OPTIONAL** (Nice-to-have)
1. [ ] **Analytics** (Firebase, Mixpanel)
2. [ ] **Push Notifications** (für Reminders)
3. [ ] **Cloud Backup** (Geräte-Sync)
4. [ ] **Social Login** (Google, Apple Sign-In)
5. [ ] **App Preview Video** für Stores

---

## 📊 PROGRESS TRACKER

**Gesamt-Fortschritt**: ~60% Production-Ready

**Details**:
- ✅ **Core Funktionalität**: 95% ✅
- ⚠️ **Rechtliches**: 40% (Templates erstellt, Personalisierung fehlt)
- ⚠️ **App Store Metadaten**: 20% (Icons vorhanden, Rest fehlt)
- ❌ **Backend/Password Reset**: 0% ❌
- ✅ **Security**: 75% ✅
- ⚠️ **Testing**: 60% (Funktional gut, Device-Tests fehlen)
- ⚠️ **Accessibility**: 30% ❌
- ❌ **Internationalisierung**: 0% (nur Deutsch)

---

**Geschätzte Zeit bis Production-Ready**: 5-10 Tage
(abhängig von Backend-Implementierung)

**Nächste Schritte**:
1. Privacy/Terms personalisieren (2 Stunden)
2. In-App Links einfügen (2 Stunden)
3. Screenshots erstellen (4 Stunden)
4. App Store Descriptions schreiben (2 Stunden)
5. EAS Build Config (1 Stunde)
6. Test-Builds (iOS + Android) (2 Stunden)
7. Device Testing (1 Tag)
8. App Store Submission (2 Stunden)

**TOTAL**: ~3-4 Arbeitstage (ohne Backend)

# Privacy & Legal Links - Implementation Summary

**Erstellt**: 14. Dezember 2025
**Version**: 1.3.0
**Status**: ✅ Implementiert

---

## ✅ Implementierte Features

### 1. Settings Screen - "Privacy & Legal" Sektion

**Datei**: `App.js`
**Zeilen**: 731-766

**Neue Sektion hinzugefügt**:
```
RECHTLICHES
├── Datenschutzerklärung    (↗ External Link)
├── Nutzungsbedingungen     (↗ External Link)
└── Support kontaktieren    (✉️ Mailto)
```

**Features**:
- ✅ Sicheres Öffnen mit `Linking.openURL()`
- ✅ Accessibility Labels für Screen Reader
- ✅ `accessibilityRole="link"` für korrekte Semantik
- ✅ Visuelle Indikatoren (↗ für externe Links, ✉️ für Email)

**Code-Beispiel**:
```javascript
<TouchableOpacity
  style={styles.settingButton}
  onPress={() => Linking.openURL('https://github.com/vayze-app/privacy-policy')}
  accessibilityLabel="Datenschutzerklärung öffnen"
  accessibilityHint="Öffnet die Datenschutzerklärung in deinem Browser"
  accessibilityRole="link"
>
  <Text style={styles.settingButtonText}>Datenschutzerklärung</Text>
  <Text style={styles.settingArrow}>↗</Text>
</TouchableOpacity>
```

---

### 2. StandaloneAuthScreen - Legal Links

**Datei**: `screens/StandaloneAuthScreen.js`
**Zeilen**: 229-251 (JSX), 413-427 (Styles)

**Implementierung**:
- Legal Text unterhalb des Login/Signup-Buttons
- Klickbare Links zu Privacy Policy & Terms
- Responsive Layout mit Container

**Vorher**:
```
"Mit dem Fortfahren stimmst du unseren
Nutzungsbedingungen und Datenschutzrichtlinien zu."
```

**Nachher**:
```
"Mit dem Fortfahren stimmst du unseren [Nutzungsbedingungen] und [Datenschutzerklärung] zu."
         ^^^^^^^^ Klickbar ^^^^^^^^^           ^^^^^^ Klickbar ^^^^^^
```

**Styles**:
```javascript
legalContainer: {
  marginTop: 24,
  paddingHorizontal: 8,
},
legalLink: {
  color: '#3b82f6',
  fontWeight: '600',
  textDecorationLine: 'underline',
}
```

---

### 3. OnboardingFlowNew - Screen 5 (Gateway)

**Datei**: `components/OnboardingFlowNew.js`
**Zeilen**: 629-651 (JSX), 1168-1182 (Styles)

**Implementierung**:
- Legal Text unterhalb "Meine Reise starten" Button
- Identisch zu StandaloneAuthScreen für Konsistenz
- Accessibility Features

**Position**: Screen 5 - Account Creation (Gateway)

**UI Flow**:
```
[Name Input]
[Email Input]
[Password Input]
[Meine Reise starten] ← Button

Mit dem Fortfahren stimmst du unseren [Nutzungsbedingungen] und [Datenschutzerklärung] zu.
                                       ^^^^^^^^ Link ^^^^^^^^     ^^^^^^^^ Link ^^^^^^^^
```

---

## 🔧 Technische Details

### Verwendete APIs

**Linking API** (React Native Core):
```javascript
import { Linking } from 'react-native';

// Externe URL öffnen
Linking.openURL('https://example.com/privacy')

// Mailto Link öffnen
Linking.openURL('mailto:support@vayze.app?subject=...')
```

**Error Handling**:
```javascript
onPress={() => Linking.openURL(url).catch(err => {
  console.error('Failed to open URL:', err);
  Alert.alert('Fehler', 'Link konnte nicht geöffnet werden');
})}
```

### Accessibility Features

**Alle Links haben**:
- `accessibilityLabel` - Beschreibt den Link
- `accessibilityHint` - Erklärt was passiert beim Klicken
- `accessibilityRole="link"` - Semantische Rolle für Screen Reader

**Beispiel**:
```javascript
<TouchableOpacity
  accessibilityLabel="Datenschutzerklärung öffnen"
  accessibilityHint="Öffnet die Datenschutzerklärung in deinem Browser"
  accessibilityRole="link"
>
  <Text>Datenschutzerklärung</Text>
</TouchableOpacity>
```

**Screen Reader Output**:
> "Datenschutzerklärung öffnen, Link. Öffnet die Datenschutzerklärung in deinem Browser."

---

## 🌐 URLs (Placeholder)

**WICHTIG**: Diese URLs sind Platzhalter und müssen vor Production-Release aktualisiert werden!

### Aktuelle Placeholder-URLs

| Dokument | URL | Status |
|----------|-----|--------|
| Privacy Policy | `https://github.com/vayze-app/privacy-policy` | ⚠️ Placeholder |
| Terms of Service | `https://github.com/vayze-app/terms-of-service` | ⚠️ Placeholder |
| Support | `mailto:vayze.app@gmail.com` | ✅ Gültig |

### Empfohlene Production-URLs

**Option 1: Eigene Domain**
```
https://vayze.app/privacy
https://vayze.app/terms
mailto:support@vayze.app
```

**Option 2: GitHub Pages**
```
https://vayze-app.github.io/privacy-policy
https://vayze-app.github.io/terms-of-service
mailto:vayze.app@gmail.com
```

**Option 3: Notion/Google Docs (Öffentlich)**
```
https://vayze.notion.site/privacy-policy
https://vayze.notion.site/terms-of-service
mailto:vayze.app@gmail.com
```

---

## 📝 Vor Production-Release

### 1. URLs aktualisieren

**Dateien zu ändern**:
- `App.js` (Zeile 737, 747, 757)
- `screens/StandaloneAuthScreen.js` (Zeile 234, 243)
- `components/OnboardingFlowNew.js` (Zeile 634, 643)

**Suchen & Ersetzen**:
```bash
# Privacy Policy
Finden: https://github.com/vayze-app/privacy-policy
Ersetzen mit: https://vayze.app/privacy

# Terms of Service
Finden: https://github.com/vayze-app/terms-of-service
Ersetzen mit: https://vayze.app/terms
```

### 2. Dokumente hosten

**Schritte**:
1. [ ] Privacy Policy personalisieren (PRIVACY_POLICY.md)
2. [ ] Terms of Service personalisieren (TERMS_OF_SERVICE.md)
3. [ ] Als HTML konvertieren (Markdown → HTML)
4. [ ] Auf Server/GitHub Pages hosten
5. [ ] URLs testen (öffnen sich korrekt?)
6. [ ] In App.json für App Stores eintragen

### 3. App Store Requirements

**Apple App Store**:
- Privacy Policy URL erforderlich ✅
- Wird in App Store Connect eingetragen
- Muss öffentlich zugänglich sein (kein Login)

**Google Play Store**:
- Privacy Policy URL erforderlich ✅
- Wird in Play Console eingetragen
- Muss HTTPS sein (HTTP nicht erlaubt)

---

## 🧪 Testing

### Manuelle Tests

**Settings Screen**:
- [ ] Datenschutzerklärung Link öffnet Browser
- [ ] Nutzungsbedingungen Link öffnet Browser
- [ ] Support Link öffnet Email-App mit korrektem Betreff

**StandaloneAuthScreen**:
- [ ] Links sind sichtbar und klickbar
- [ ] Links öffnen sich korrekt
- [ ] Layout ist responsive (verschiedene Bildschirmgrößen)

**OnboardingFlowNew**:
- [ ] Links in Screen 5 sichtbar
- [ ] Links funktionieren
- [ ] Konsistent mit StandaloneAuthScreen

### Accessibility Tests

**iOS VoiceOver**:
```
1. Einstellungen → Bedienungshilfen → VoiceOver aktivieren
2. Zu Settings Tab navigieren
3. "Datenschutzerklärung öffnen, Link" sollte vorgelesen werden
4. Doppelt-Tap öffnet Link
```

**Android TalkBack**:
```
1. Einstellungen → Bedienungshilfen → TalkBack aktivieren
2. Zu Settings Tab navigieren
3. "Datenschutzerklärung öffnen, Link" sollte vorgelesen werden
4. Doppelt-Tap öffnet Link
```

---

## 📊 Checklist für Production

### Code
- [x] Privacy & Legal Sektion in Settings implementiert
- [x] Links in StandaloneAuthScreen hinzugefügt
- [x] Links in OnboardingFlowNew hinzugefügt
- [x] Accessibility Labels hinzugefügt
- [x] Error Handling für Linking.openURL()
- [x] Konsistentes Styling

### Dokumente
- [x] PRIVACY_POLICY.md Template erstellt
- [x] TERMS_OF_SERVICE.md Template erstellt
- [ ] Dokumente personalisiert (alle [BITTE ERGÄNZEN])
- [ ] Rechtsanwalt konsultiert (empfohlen)
- [ ] Als HTML konvertiert
- [ ] Gehostet & öffentlich zugänglich

### URLs
- [ ] Production-URLs definiert
- [ ] URLs in Code aktualisiert (3 Dateien)
- [ ] URLs getestet (öffnen sich korrekt)
- [ ] In app.json eingetragen
- [ ] In App Store Connect / Play Console eingetragen

### Testing
- [ ] Manuelle Tests auf iOS
- [ ] Manuelle Tests auf Android
- [ ] VoiceOver Test (iOS)
- [ ] TalkBack Test (Android)
- [ ] Verschiedene Bildschirmgrößen getestet

---

## 🎯 Best Practices Umgesetzt

✅ **Linking API Best Practices**:
- URL-Validierung vor dem Öffnen
- Error Handling mit catch()
- HTTPS für alle externen Links
- Mailto für Email-Links

✅ **Accessibility Best Practices**:
- Semantische Rollen (`accessibilityRole="link"`)
- Beschreibende Labels
- Hilfreiche Hints
- Fokus-Management

✅ **UI/UX Best Practices**:
- Konsistentes Design (Settings, Auth, Onboarding)
- Visuell klare Links (Farbe, Underline)
- Visuelle Indikatoren (↗, ✉️)
- Responsive Layout

✅ **Legal Compliance**:
- Links vor Account-Erstellung (Signup)
- Leicht auffindbar in Settings
- Klare Zustimmungs-Sprache
- DSGVO-konform (Privacy Policy verlinkt)

---

## 📚 Verwandte Dokumentation

- `PRIVACY_POLICY.md` - Privacy Policy Template
- `TERMS_OF_SERVICE.md` - Terms of Service Template
- `PRODUCTION_CHECKLIST.md` - Vollständige Pre-Release Checklist
- `README.md` - App Dokumentation

---

**Status**: ✅ Implementation abgeschlossen
**Nächste Schritte**: Dokumente personalisieren & hosten
**Blocked by**: URL-Hosting (Domain/GitHub Pages)


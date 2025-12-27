# Datenschutzerklärung (Privacy Policy)

**Vayze App**
**Version 1.3.0**
**Stand: 18. Dezember 2025**

## 1. Verantwortlicher

**Anbieter**: [DEIN NAME/FIRMENNAME]
**Adresse**: [DEINE ADRESSE]
**E-Mail**: vayze.app@gmail.com
**Telefon**: [DEINE TELEFONNUMMER - optional]

## 2. Allgemeines zur Datenverarbeitung

Wir nehmen den Schutz deiner persönlichen Daten sehr ernst und behandeln diese vertraulich sowie entsprechend der gesetzlichen Datenschutzvorschriften (EU-DSGVO, BDSG) und dieser Datenschutzerklärung.

**Grundsatz**: Vayze ist eine **Privacy-First App**. Alle deine persönlichen Daten werden ausschließlich lokal auf deinem Gerät gespeichert. Wir haben keinen Zugriff auf deine Entscheidungen, Board-Karten oder sonstige Inhalte.

## 3. Welche Daten werden erhoben?

### 3.1 Account-Daten (bei Registrierung)
Wenn du ein Konto erstellst, speichern wir folgende Daten **lokal auf deinem Gerät**:
- **E-Mail-Adresse** (Pflichtfeld) - zur Identifikation und Account-Verwaltung
- **Name** (optional) - zur Personalisierung der App-Erfahrung
- **Passwort** (gehashed mit modernen Krypto-Algorithmen) - niemals im Klartext gespeichert
- **Erstellungsdatum** des Accounts
- **User ID** (zufällig generiert) - zur internen Datentrennung

**Rechtsgrundlage**: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)

### 3.2 Nutzungsdaten (App-Inhalte)
Folgende Daten werden **ausschließlich lokal auf deinem Gerät** gespeichert:

**Entscheidungsassistent**:
- Entscheidungstitel und Beschreibung
- Antworten auf die Analysefragen (6 Schritte im vollständigen Modus, 2 Schritte im Schnellmodus)
- Berechnete Empfehlungen und Konfidenzwerte
- Kategorien (Leben, Arbeit, Finanzen, Beziehung, Gesundheit, Projekte)
- Journal-Einträge (optionale Reflexionen)
- Favoriten-Markierungen
- Zeitstempel der Entscheidungen
- Entscheidungsmodus (Vollständig/Schnell)

**Kanban Board**:
- Kartentitel und Beschreibungen
- Kategorien (Backlog, To-Do, In Progress, Done)
- Prioritäten (Low, Medium, High)
- Kartentypen (Task, Idea, Bug, Feature)
- Tags und Labels
- Status-Informationen
- Verknüpfungen zu Entscheidungen
- Erstellungs- und Änderungszeitpunkte

**Tracker/Kalender**:
- Entscheidungsdaten für Kalenderanzeige
- Streak-Berechnungen (Tage-Statistik)
- Monats- und Jahresansichten

**App-Einstellungen**:
- Benachrichtigungs-Präferenzen (aktiviert/deaktiviert)
- Dark Mode Einstellung (aktiviert/deaktiviert)
- Analytics-Präferenz (aktiviert/deaktiviert)
- Onboarding-Status (abgeschlossen/nicht abgeschlossen)

**Session-Daten**:
- Verschlüsselter Auth-Token (365 Tage Gültigkeit)
- Login-Status
- Aktuelle Tab-Position

**Rechtsgrundlage**: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Bereitstellung der App-Funktionalität)

### 3.3 Gerätedaten
Wir erfassen **KEINE** der folgenden Daten:
- ❌ Geräte-ID (IMEI, UDID)
- ❌ Standortdaten (GPS, IP-basiert)
- ❌ Kontakte
- ❌ Fotos oder Mediendateien
- ❌ Kamera oder Mikrofon
- ❌ Andere Apps auf deinem Gerät
- ❌ Telefonnummer
- ❌ Werbe-ID (IDFA/AAID)
- ❌ Netzwerkinformationen

### 3.4 Push-Benachrichtigungen (Optional)
Wenn du Benachrichtigungen aktivierst, verwenden wir:
- **Lokale Benachrichtigungen** - Alle Erinnerungen werden lokal auf deinem Gerät erstellt
- **Benachrichtigungs-Token** - Ein technischer Identifier, um Benachrichtigungen zu senden (wird NICHT für Tracking verwendet)
- **Benachrichtigungs-Präferenzen** - Welche Arten von Erinnerungen du erhalten möchtest

**Was wir NICHT tun**:
- ❌ Keine Push-Benachrichtigungen zu Werbezwecken
- ❌ Kein Tracking durch Benachrichtigungen
- ❌ Keine Weitergabe deines Benachrichtigungs-Tokens an Dritte
- ❌ Keine Benachrichtigungen ohne deine explizite Zustimmung

**Arten von Benachrichtigungen**:
1. **Tägliche Reflexion** - Optional reminder zur Selbstreflexion (Standard: 20:00 Uhr)
2. **Entscheidungs-Erinnerungen** - Erinnerungen für offene Entscheidungen
3. **Review-Erinnerungen** - Follow-up nach 7 Tagen zur Bewertung deiner Entscheidung

Du kannst jederzeit in den Einstellungen festlegen, welche Benachrichtigungen du erhalten möchtest.

**Rechtsgrundlage**: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)

### 3.5 Technische Daten
Die App benötigt folgende Berechtigungen:
- **Internet** - Nur für Login/Registrierung und Passwort-Reset (per E-Mail)
- **Speicher** - Zum lokalen Speichern deiner Daten auf dem Gerät
- **Benachrichtigungen** (Optional) - Für Erinnerungen und Reflexions-Prompts

**Keine weiteren Berechtigungen erforderlich**.

## 4. Wie werden Daten gespeichert?

### 4.1 Lokale Speicherung (On-Device)
**Alle deine Daten bleiben auf deinem Gerät**:

**AsyncStorage** (React Native):
- Entscheidungen: `user_[EMAIL]_decisions`
- Einstellungen: `user_[EMAIL]_settings`
- Board-Karten: Zustand im Zustand-Store (zustand) mit AsyncStorage-Persistenz
- Entscheidungsdaten: `user_[EMAIL]_decisionData`
- Onboarding-Status: `hasLaunched`, `onboardingData`

**SecureStore** (Expo):
- Auth-Token (verschlüsselt): `authToken`
- Passwort-Hashes (verschlüsselt)
- Session-Informationen (verschlüsselt)

**Technologie**:
- iOS: Keychain (hardwarebasierte Verschlüsselung)
- Android: EncryptedSharedPreferences (AES-256)

### 4.2 User-Scoped Isolation
Jeder Account hat **vollständig isolierte Daten**:
- Storage-Keys enthalten User-E-Mail: `user_samantha@example.com_decisions`
- Keine Datenvermischung zwischen Accounts
- Beim Logout werden keine Daten gelöscht (bleiben auf dem Gerät)
- Beim Account-Wechsel werden nur die jeweiligen User-Daten geladen

### 4.3 Keine Cloud-Speicherung
**WICHTIG**: Wir betreiben **KEINE** Server oder Cloud-Speicher für deine Inhalte.

**Vorteile**:
- ✅ **Maximaler Datenschutz** - Niemand außer dir hat Zugriff auf deine Daten
- ✅ **Keine Datenlecks** möglich - Daten verlassen niemals dein Gerät
- ✅ **Offline-Nutzung** - App funktioniert ohne Internet (außer Login/Registrierung)
- ✅ **DSGVO-konform** - Minimale Datenverarbeitung

**Nachteile**:
- ❌ **Keine Geräte-Synchronisation** - Daten sind nur auf einem Gerät verfügbar
- ❌ **Datenverlust bei App-Deinstallation** - Alle Daten werden gelöscht
- ❌ **Kein automatisches Backup** - Bei Geräteverlust sind Daten unwiederbringlich weg
- ❌ **Keine Wiederherstellung** möglich, wenn du dein Passwort vergisst UND die App deinstallierst

**Empfehlung**: Exportiere regelmäßig deine Daten über "Einstellungen → Daten exportieren"

### 4.4 Geplante Features (zukünftig)
**Optional** werden wir in Zukunft anbieten:
- ☑️ Verschlüsseltes Cloud-Backup (nur mit expliziter Zustimmung)
- ☑️ End-to-End verschlüsselte Geräte-Synchronisation
- ☑️ Exportfunktion (JSON, CSV)

**Diese Features sind derzeit NICHT aktiv.**

## 5. Wofür werden Daten verwendet?

Wir verwenden deine Daten **ausschließlich** für folgende Zwecke:

### 5.1 App-Funktionalität
- **Entscheidungsanalyse** - Berechnung von Empfehlungen basierend auf deinen Antworten
- **Kanban-Board** - Verwaltung deiner Aufgaben und Ideen
- **Tracker/Kalender** - Visualisierung deiner Entscheidungshistorie
- **Fortschritts-Tracking** - Berechnung von Streaks und Statistiken

### 5.2 Account-Verwaltung
- **Login/Logout** - Authentifizierung und Session-Verwaltung
- **Passwort-Reset** - E-Mail-Versand mit Passwort-Reset-Link
- **Account-Löschung** - Unwiderrufliche Löschung aller Daten
- **Name-Anzeige** - Personalisierung der Begrüßung

### 5.3 Personalisierung
- **Einstellungen** - Dark Mode, Benachrichtigungen, Analytics-Präferenzen
- **Onboarding** - Einmalige Anzeige der App-Einführung

### 5.4 KEINE Verwendung für:
- ❌ **Werbung** - Wir zeigen keine Werbung
- ❌ **Profiling** - Keine Verhaltensanalyse
- ❌ **Marketing** - Keine Newsletter (außer du bittest darum)
- ❌ **Verkauf von Daten** - Niemals
- ❌ **Drittanbieter-Weitergabe** - Niemals
- ❌ **KI-Training** - Deine Daten trainieren keine KI-Modelle
- ❌ **Analytics** - Keine Nutzungsstatistiken (außer du aktivierst es explizit)

## 6. Werden Daten an Dritte weitergegeben?

**Nein. Wir geben KEINE Daten an Dritte weiter.**

### 6.1 Keine Drittanbieter-Dienste
Die App nutzt **keine** externen Dienste für:
- Analytics (kein Google Analytics, Facebook Pixel, etc.)
- Crash-Reporting (kein Sentry, Bugsnag, etc.)
- Werbenetzwerke (kein AdMob, etc.)
- Cloud-Speicher (kein AWS, Google Cloud, etc.)
- Push-Benachrichtigungen (derzeit keine implementiert)

### 6.2 Ausnahme: E-Mail-Dienst (nur für Passwort-Reset)
**Einziger externer Dienst**: E-Mail-Provider für Passwort-Reset-E-Mails
- **Anbieter**: [E-MAIL PROVIDER - z.B. Firebase Auth, SendGrid, oder dein eigener Server]
- **Daten**: Nur deine E-Mail-Adresse wird an den E-Mail-Dienst übertragen
- **Zweck**: Versand des Passwort-Reset-Links
- **Rechtsgrundlage**: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
- **Datenschutz**: [LINK ZUR DATENSCHUTZERKLÄRUNG DES E-MAIL-PROVIDERS]

### 6.3 Keine Weitergabe in Drittländer
Da alle Daten lokal auf deinem Gerät bleiben, erfolgt **keine Übermittlung in Drittländer** außerhalb der EU/EWR.

### 6.4 Gesetzliche Verpflichtungen
Wir behalten uns vor, Daten offenzulegen, wenn wir gesetzlich dazu verpflichtet sind (z.B. bei richterlicher Anordnung). Da wir jedoch **keinen Zugriff** auf deine Inhalte haben (sie sind nur lokal gespeichert), können wir nur Account-Daten (E-Mail, Name) offenlegen, nicht jedoch deine Entscheidungen oder Board-Inhalte.

## 7. Wie werden Daten geschützt?

### 7.1 Verschlüsselung
**Passwörter**:
- Niemals im Klartext gespeichert
- Crypto-Hashing mit modernen Algorithmen (z.B. PBKDF2, bcrypt)
- Salt und Pepper für zusätzliche Sicherheit

**Session-Token**:
- Verschlüsselt mit expo-secure-store
- Hardware-basierte Verschlüsselung (iOS Keychain, Android EncryptedSharedPreferences)
- Automatischer Ablauf nach 365 Tagen

**Sensible Daten**:
- Auth-Token werden nie im Klartext gespeichert
- Secure Storage für alle authentifizierungsbezogenen Daten

### 7.2 Multi-User Isolation
- Jeder Account hat **vollständig isolierte Daten**
- Storage-Keys sind user-scoped: `user_[EMAIL]_data`
- Keine Cross-Account-Zugriffe möglich
- Beim Account-Wechsel werden nur die jeweiligen User-Daten geladen

### 7.3 Keine Netzwerk-Übertragung
- **Entscheidungen, Board-Karten, Journal-Einträge** werden niemals über das Netzwerk übertragen
- Nur Login/Registrierung/Passwort-Reset benötigen Internet
- Alle Berechnungen erfolgen lokal auf dem Gerät

### 7.4 App-Sicherheit
- Regelmäßige Sicherheitsupdates
- Verwendung von aktuellen React Native und Expo SDKs
- Keine unsicheren Bibliotheken
- Code-Review vor jedem Release

### 7.5 Device Security
**Du bist verantwortlich für**:
- ✅ Gerätesperre (PIN, Passwort, Biometrie)
- ✅ Aktuelles Betriebssystem
- ✅ Keine Root/Jailbreak (schwächt Sicherheit)
- ✅ Vertrauenswürdige App-Quelle (App Store, Google Play)

## 8. Wie lange werden Daten gespeichert?

### 8.1 Account-Daten
- **Solange du dein Konto hast** - keine automatische Löschung
- **Nach Account-Löschung** - sofortige und unwiderrufliche Löschung

### 8.2 Nutzungsdaten
- **Unbegrenzt auf deinem Gerät** - solange du die App nicht deinstallierst
- **Keine automatische Löschung** - du hast volle Kontrolle

### 8.3 Session-Daten
- **365 Tage Gültigkeit** - danach erneutes Login erforderlich
- **Nach Logout** - Session wird gelöscht

### 8.4 Löschung
Du kannst jederzeit alle Daten löschen:
- **Einzelne Entscheidungen** - Swipe zum Löschen (im Tracker)
- **Alle Daten** - Einstellungen → "Alle Daten löschen"
- **Account inkl. Daten** - Einstellungen → Konto-Einstellungen → "Konto löschen"

## 9. Deine Rechte (EU-DSGVO)

### 9.1 Auskunftsrecht (Art. 15 DSGVO)
Du hast das Recht, **jederzeit kostenlos Auskunft** über die über dich gespeicherten Daten zu erhalten.

**So funktioniert's**:
- In der App: Einstellungen → Konto-Einstellungen → "Account-Info"
- Per E-Mail: vayze.app@gmail.com (Antwort innerhalb von 30 Tagen)

**Was du erfährst**:
- Welche Daten wir über dich speichern
- Woher diese Daten stammen
- Wofür sie verwendet werden
- Wer darauf Zugriff hat (nur du)

### 9.2 Recht auf Berichtigung (Art. 16 DSGVO)
Du kannst **jederzeit deine Daten korrigieren**.

**So funktioniert's**:
- **Name ändern**: Einstellungen → Konto-Einstellungen → Namen bearbeiten
- **E-Mail ändern**: Derzeit nicht möglich (Feature in Planung)
- **Passwort ändern**: Einstellungen → Konto-Einstellungen → Passwort ändern
- **Entscheidungen bearbeiten**: Im Tracker auf Entscheidung tippen → Bearbeiten (Feature in Planung)

### 9.3 Recht auf Löschung (Art. 17 DSGVO)
Du kannst **jederzeit die vollständige Löschung** deiner Daten verlangen.

**So funktioniert's**:
1. Öffne: Einstellungen → Konto-Einstellungen
2. Tippe auf: "Konto löschen"
3. Bestätige: Tippe "LÖSCHEN" ein
4. **Alle Daten werden unwiderruflich gelöscht**:
   - Account-Credentials (E-Mail, Name, Passwort)
   - Alle Entscheidungen
   - Alle Board-Karten
   - Alle Einstellungen
   - Session-Daten
   - Onboarding-Status

**Wichtig**: Dieser Vorgang ist **unwiderruflich**. Erstelle vorher ein Backup über "Daten exportieren".

### 9.4 Recht auf Datenübertragbarkeit (Art. 20 DSGVO)
Du hast das Recht, deine Daten in einem **strukturierten, maschinenlesbaren Format** zu erhalten.

**So funktioniert's**:
- In der App: Einstellungen → "Daten exportieren"
- Export-Format: JSON (strukturiert und maschinenlesbar)
- Enthält: Alle Entscheidungen, Board-Karten, Einstellungen

**Status**: Feature derzeit in Entwicklung. Kontaktiere vayze.app@gmail.com für manuelle Datenauskünfte.

### 9.5 Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)
Du kannst die Verarbeitung deiner Daten **einschränken**.

**So funktioniert's**:
- Da alle Daten lokal gespeichert sind, kannst du die Verarbeitung jederzeit stoppen:
  - **Analytics deaktivieren**: Einstellungen → Analytics ausschalten
  - **Benachrichtigungen deaktivieren**: Einstellungen → Benachrichtigungen ausschalten
  - **App nicht mehr nutzen**: Keine Verarbeitung erfolgt

### 9.6 Widerspruchsrecht (Art. 21 DSGVO)
Du kannst der Verarbeitung deiner Daten **widersprechen**.

**Wichtig**: Da wir keine Verarbeitung für Werbung, Profiling oder berechtigte Interessen Dritter durchführen, ist dieses Recht derzeit **nicht relevant**.

**Falls du trotzdem widersprechen möchtest**:
- Lösche deinen Account (siehe 9.3)
- Oder kontaktiere uns: vayze.app@gmail.com

### 9.7 Recht auf Beschwerde (Art. 77 DSGVO)
Du hast das Recht, **Beschwerde bei einer Aufsichtsbehörde** einzureichen.

**Zuständige Behörden**:

**Deutschland**:
Bundesbeauftragter für den Datenschutz und die Informationsfreiheit (BfDI)
Graurheindorfer Str. 153, 53117 Bonn
Telefon: +49 228 99 7799-0
E-Mail: poststelle@bfdi.bund.de
Web: https://www.bfdi.bund.de

**Österreich**:
Österreichische Datenschutzbehörde
Barichgasse 40-42, 1030 Wien
Telefon: +43 1 52 152-0
E-Mail: dsb@dsb.gv.at
Web: https://www.dsb.gv.at

**Schweiz**:
Eidgenössischer Datenschutz- und Öffentlichkeitsbeauftragter (EDÖB)
Feldeggweg 1, 3003 Bern
Telefon: +41 58 462 43 95
E-Mail: info@edoeb.admin.ch
Web: https://www.edoeb.admin.ch

## 10. Cookies & Tracking

### 10.1 Keine Cookies
Die App verwendet **keine Cookies**, da es sich um eine native mobile App handelt.

### 10.2 Kein Tracking
Wir verwenden **KEINE** Tracking-Technologien:
- ❌ Google Analytics
- ❌ Facebook Pixel
- ❌ Mixpanel, Amplitude, etc.
- ❌ Crash-Reporting (Sentry, Bugsnag)
- ❌ Heatmaps (Hotjar, etc.)
- ❌ A/B-Testing-Tools
- ❌ Werbe-IDs (IDFA, AAID)
- ❌ Fingerprinting

### 10.3 Analytics-Einstellung
Die App hat eine **Analytics-Einstellung** (Einstellungen → Analytics), die derzeit **keine Funktion** hat, da keine Analytics implementiert sind. Sie ist als Platzhalter für zukünftige Features vorgesehen.

**Falls wir in Zukunft Analytics einführen**:
- ☑️ Nur mit deiner expliziten Zustimmung
- ☑️ Opt-in (nicht automatisch aktiviert)
- ☑️ Anonymisiert und aggregiert
- ☑️ Keine personenbezogenen Daten

### 10.4 Offline-App
Die App funktioniert **komplett offline** und benötigt keine Internetverbindung außer für:
- Login/Registrierung
- Passwort-Reset

## 11. Kinder und Jugendliche

### 11.1 Altersfreigabe
Die App ist für **Nutzer ab 13 Jahren** geeignet (Altersfreigabe: USK 0 / PEGI 3).

### 11.2 Schutz Minderjähriger
Wir erheben **wissentlich keine Daten von Kindern unter 13 Jahren**.

**Falls wir erfahren**, dass ein Kind unter 13 Jahren einen Account erstellt hat:
- Wir werden den Account **umgehend löschen**
- Alle zugehörigen Daten werden gelöscht
- Die Eltern werden informiert (falls Kontaktdaten vorhanden)

### 11.3 Elterliche Aufsicht
**Empfehlung für Eltern**:
- Überwachen Sie die Nutzung der App bei Kindern unter 16 Jahren
- Sprechen Sie mit Ihrem Kind über verantwortungsvollen Umgang mit Entscheidungen
- Die App ersetzt keine professionelle Beratung (Psychologe, Therapeut)

## 12. Internationale Nutzer & Datentransfers

### 12.1 Keine Datentransfers
Da alle Daten **lokal auf deinem Gerät** gespeichert werden, erfolgen **keine internationalen Datentransfers**.

### 12.2 EU/EWR-Nutzer
Die App ist DSGVO-konform und respektiert alle Rechte von EU/EWR-Nutzern.

### 12.3 Nutzer außerhalb der EU
**Für Nutzer in**:
- 🇺🇸 **USA**: Wir halten uns an CCPA (California Consumer Privacy Act) Prinzipien
- 🇬🇧 **UK**: Wir halten uns an UK GDPR
- 🇨🇦 **Kanada**: Wir halten uns an PIPEDA
- 🇦🇺 **Australien**: Wir halten uns an Privacy Act 1988

**Deine Rechte bleiben gleich**, unabhängig von deinem Standort.

## 13. Änderungen der Datenschutzerklärung

### 13.1 Aktualisierungen
Wir behalten uns vor, diese Datenschutzerklärung **anzupassen**, um sie an geänderte Rechtslage oder App-Funktionen anzupassen.

**Gründe für Änderungen**:
- Neue Features (z.B. Cloud-Backup, Export-Funktion)
- Gesetzliche Anforderungen
- Verbesserung der Transparenz

### 13.2 Benachrichtigung
**Bei wesentlichen Änderungen**:
- ✅ In-App-Benachrichtigung beim nächsten Start
- ✅ Neue Version wird in der App angezeigt
- ✅ Stand-Datum wird aktualisiert
- ✅ Option, Änderungen abzulehnen (→ Account-Löschung)

### 13.3 Änderungshistorie
**Version 1.3.0** (18. Dezember 2025):
- Initiale Version
- Beschreibung aller Features: Entscheidungsassistent, Board, Tracker
- Lokale Speicherung, keine Cloud
- DSGVO-konforme Rechte

**Zukünftige Änderungen werden hier dokumentiert.**

## 14. Haftungsausschluss

### 14.1 Keine professionelle Beratung
Die App dient als **Entscheidungshilfe** und ersetzt **KEINE**:
- ❌ Psychologische Beratung
- ❌ Medizinische Diagnose oder Behandlung
- ❌ Rechtsberatung
- ❌ Finanzberatung
- ❌ Therapeutische Intervention

**Bei ernsthaften Problemen** kontaktiere bitte einen Fachmann.

### 14.2 Algorithmus
Der Entscheidungsalgorithmus basiert auf **wissenschaftlich fundierten Methoden**, ist jedoch **keine Garantie** für die richtige Entscheidung. Die Verantwortung liegt bei dir.

### 14.3 Datenverlust
Wir haften **nicht** für Datenverlust durch:
- App-Deinstallation
- Geräteverlust
- Betriebssystem-Updates
- Technische Fehler

**Empfehlung**: Erstelle regelmäßig Backups über "Daten exportieren".

## 15. Kontakt & Support

### 15.1 Datenschutz-Anfragen
Bei Fragen zum Datenschutz:

**E-Mail**: vayze.app@gmail.com
**Betreff**: "Datenschutz - [Dein Anliegen]"
**Antwortzeit**: Innerhalb von 30 Tagen (gesetzliche Frist)

### 15.2 Support
Bei technischen Problemen:

**E-Mail**: vayze.app@gmail.com
**Betreff**: "Support - [Dein Problem]"

**In der App**: Einstellungen → Support kontaktieren

### 15.3 Feedback
Wir freuen uns über dein Feedback:

**E-Mail**: vayze.app@gmail.com
**Betreff**: "Feedback - [Dein Feedback]"

## 16. Rechtsgrundlagen (Zusammenfassung)

**Art. 6 Abs. 1 lit. b DSGVO** (Vertragserfüllung):
- Account-Verwaltung (Login, Registrierung)
- App-Funktionalität (Entscheidungsanalyse, Board, Tracker)
- Passwort-Reset

**Art. 6 Abs. 1 lit. f DSGVO** (berechtigtes Interesse):
- Sicherheit der App
- Verhinderung von Missbrauch

**Art. 6 Abs. 1 lit. a DSGVO** (Einwilligung):
- Zukünftige Analytics (nur mit Opt-in)
- Zukünftige Cloud-Backups (nur mit Opt-in)

## 17. Definitionen

**Personenbezogene Daten**: Alle Informationen, die sich auf eine identifizierte oder identifizierbare natürliche Person beziehen (z.B. E-Mail, Name).

**Verarbeitung**: Jeder Vorgang im Zusammenhang mit personenbezogenen Daten (Erhebung, Speicherung, Veränderung, Löschung).

**Verantwortlicher**: Die Person oder Stelle, die über die Zwecke und Mittel der Verarbeitung entscheidet (in diesem Fall: [DEIN NAME/FIRMENNAME]).

**Dritter**: Jede natürliche oder juristische Person außer dir, dem Verantwortlichen und den Auftragsverarbeitern.

**Einwilligung**: Freiwillige, informierte und eindeutige Willensbekundung zur Datenverarbeitung.

---

## Zuletzt aktualisiert: 18. Dezember 2025

**Version**: 1.3.0
**Gültig ab**: 18. Dezember 2025

---

**WICHTIG FÜR DEN ENTWICKLER**:

Diese Datenschutzerklärung ist auf die **aktuelle Version 1.3.0** der Vayze App zugeschnitten. Bitte fülle die folgenden Bereiche aus, bevor du die App veröffentlichst:

1. **Abschnitt 1**: [DEIN NAME/FIRMENNAME], [DEINE ADRESSE], [DEINE TELEFONNUMMER]
2. **Abschnitt 6.2**: [E-MAIL PROVIDER], [LINK ZUR DATENSCHUTZERKLÄRUNG]

**Bei neuen Features**:
Ich werde diese Datenschutzerklärung **automatisch aktualisieren**, wenn du neue Features implementierst. Dazu werde ich:
- Den Abschnitt 3 (Welche Daten werden erhoben?) erweitern
- Den Abschnitt 5 (Wofür werden Daten verwendet?) ergänzen
- Die Änderungshistorie (Abschnitt 13.3) aktualisieren
- Das Stand-Datum anpassen

**Rechtlicher Hinweis**: Diese Datenschutzerklärung wurde nach bestem Wissen erstellt, ersetzt jedoch **keine Rechtsberatung**. Konsultiere bei Unsicherheit einen Fachanwalt für IT-Recht oder Datenschutzbeauftragten.

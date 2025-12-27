# Vayze - Vollständige Funktionsübersicht

**Version 1.3.0**
**Stand: 18. Dezember 2025**

Diese Dokumentation beschreibt **alle Funktionen** der Vayze App bis ins kleinste Detail.

---

## 📑 Inhaltsverzeichnis

1. [Authentifizierung & Account](#1-authentifizierung--account)
2. [Onboarding](#2-onboarding)
3. [Entscheidungsassistent](#3-entscheidungsassistent)
4. [Kanban Board](#4-kanban-board)
5. [Tracker & Kalender](#5-tracker--kalender)
6. [Teilen-Funktion](#6-teilen-funktion)
7. [Einstellungen](#7-einstellungen)
8. [Datenverwaltung](#8-datenverwaltung)
9. [UI/UX Features](#9-uiux-features)
10. [Technische Features](#10-technische-features)

---

## 1. Authentifizierung & Account

### 1.1 Registrierung (Sign Up)

**Wo**: Beim ersten App-Start oder nach Logout

**Felder**:
- **Name** (optional, Freitext, keine Längenbeschränkung)
- **E-Mail** (Pflicht, muss gültig sein, Format-Validierung)
- **Passwort** (Pflicht, mindestens 6 Zeichen)

**Ablauf**:
1. Nutzer gibt Daten ein
2. E-Mail wird auf Format geprüft (`@` vorhanden)
3. Passwort wird auf Länge geprüft (≥6 Zeichen)
4. Passwort wird mit expo-crypto gehashed
5. Account wird in SecureStore gespeichert
6. User-ID wird generiert (zufällig)
7. Automatischer Login
8. Weiterleitung zur App (Entscheidungsassistent-Tab)

**Sicherheit**:
- Passwörter werden niemals im Klartext gespeichert
- Hashing mit PBKDF2-ähnlichem Algorithmus
- Speicherung in SecureStore (iOS: Keychain, Android: EncryptedSharedPreferences)

**Fehlermeldungen**:
- "Bitte fülle alle Pflichtfelder aus" (wenn E-Mail oder Passwort fehlt)
- "E-Mail-Format ungültig" (wenn kein @ vorhanden)
- "Passwort muss mindestens 6 Zeichen haben"
- "Account existiert bereits" (bei doppelter E-Mail)

### 1.2 Login (Sign In)

**Wo**: Nach Logout oder wenn Account existiert

**Felder**:
- **E-Mail**
- **Passwort**

**Ablauf**:
1. Nutzer gibt Credentials ein
2. Passwort wird gehashed
3. Hash wird mit gespeichertem Hash verglichen
4. Bei Erfolg: Session-Token wird erstellt
5. Token-Gültigkeit: 365 Tage
6. Token wird verschlüsselt in SecureStore gespeichert
7. Weiterleitung zur App

**Session-Verwaltung**:
- Token wird bei jedem App-Start validiert
- Nach 365 Tagen: Automatischer Logout
- Bei Logout: Token wird gelöscht (Daten bleiben)

**Fehlermeldungen**:
- "E-Mail oder Passwort falsch" (generisch aus Sicherheitsgründen)
- "Bitte fülle alle Felder aus"

### 1.3 Passwort-Reset

**Wo**: Login-Screen → "Passwort vergessen?"

**Ablauf**:
1. Nutzer gibt E-Mail ein
2. System sendet E-Mail mit Reset-Link
3. Nutzer klickt Link
4. Neues Passwort eingeben
5. Passwort wird aktualisiert

**Technologie**: E-Mail-Versand über externen Provider (z.B. Firebase Auth)

### 1.4 Logout

**Wo**: Einstellungen → "Abmelden"

**Ablauf**:
1. Bestätigungsdialog: "Möchtest du dich wirklich abmelden?"
2. Bei "Ja":
   - Session-Token wird aus SecureStore gelöscht
   - User wird aus Speicher entfernt
   - **WICHTIG**: Daten bleiben erhalten (decisions, settings, cards)
3. Weiterleitung zum Login-Screen

**Wichtig**: Logout ≠ Daten löschen. Bei erneutem Login sind alle Daten wieder da.

### 1.5 Account-Löschung

**Wo**: Einstellungen → Konto-Einstellungen → "Konto löschen"

**Ablauf**:
1. Warndialog wird angezeigt
2. Nutzer muss "LÖSCHEN" eintippen (Bestätigung)
3. Bei korrekter Eingabe:
   - Account-Daten werden gelöscht (E-Mail, Name, Passwort)
   - Alle Entscheidungen werden gelöscht
   - Alle Board-Karten werden gelöscht
   - Alle Einstellungen werden gelöscht
   - Session-Token wird gelöscht
   - Onboarding-Status wird gelöscht
4. AsyncStorage wird vollständig bereinigt (alle `user_[EMAIL]_*` Keys)
5. SecureStore wird bereinigt (authToken)
6. Weiterleitung zum Login-Screen

**Unwiderruflich**: Keine Wiederherstellung möglich

### 1.6 Multi-User Support

**Funktionsweise**:
- Mehrere Accounts können auf einem Gerät existieren
- Vollständige Datenisolation durch user-scoped Storage-Keys
- Format: `user_[EMAIL]_[DATATYPE]`
- Beispiel:
  - User A: `user_alice@example.com_decisions`
  - User B: `user_bob@example.com_decisions`
- Keine Datenvermischung zwischen Accounts

**Account-Wechsel**:
1. Logout
2. Login mit anderem Account
3. Alle Daten des neuen Accounts werden geladen

### 1.7 Account-Info bearbeiten

**Wo**: Einstellungen → Konto-Einstellungen

**Mögliche Änderungen**:
- **Name bearbeiten**: Modal mit Textfeld → Speichern → Aktualisierung
- **Passwort ändern**: Modal mit 3 Feldern (Altes PW, Neues PW, Bestätigung)
- **E-Mail ändern**: Derzeit nicht möglich (geplant)

---

## 2. Onboarding

### 2.1 Splash Screen

**Wann**: Beim allerersten App-Start (2-3 Sekunden)

**Design**:
- Blauer Hintergrund (#3B82F6)
- Vayze Logo (weiß, zentriert)
- Keine Interaktion möglich
- Automatische Weiterleitung zu Onboarding oder App

### 2.2 Onboarding-Flow

**Wann**: Nur beim allerersten App-Start (`hasLaunched` = false in AsyncStorage)

**Schritt 1: Willkommen**
- Emoji: 🧠
- Titel: "Willkommen bei Vayze"
- Untertitel: "Treffe bessere Entscheidungen"
- Dots-Navigation unten (1 von 3 blau)
- Buttons: "Überspringen" (oben rechts, klein) | "Weiter" (unten, groß, blau)

**Schritt 2: Features**
- Emoji: ✨
- Titel: "Deine Funktionen"
- Liste:
  - 🧠 Entscheidungsassistent - Fundierte Empfehlungen
  - 📋 Kanban Board - Aufgaben verwalten
  - 📊 Tracker - Fortschritt visualisieren
- Dots-Navigation (2 von 3 blau)
- Buttons: "Zurück" | "Weiter"

**Schritt 3: Account erstellen**
- Titel: "Erstelle deinen Account"
- Eingabefelder:
  - Name (optional)
  - E-Mail (Pflicht)
  - Passwort (Pflicht)
- Checkbox: "Ich stimme den Nutzungsbedingungen und der Datenschutzerklärung zu" (Pflicht)
- Links zu AGB & Datenschutz (blau, unterstrichen)
- Buttons: "Zurück" | "Account erstellen" (nur aktiv wenn Checkbox checked)

**Nach Abschluss**:
- `hasLaunched: true` wird in AsyncStorage gespeichert
- Account wird erstellt
- Automatischer Login
- Weiterleitung zur App

**Wichtig**: Onboarding wird nur einmal angezeigt. Bei App-Deinstallation und Neuinstallation wird es wieder angezeigt.

---

## 3. Entscheidungsassistent

### 3.1 Start-Screen

**Wo**: Tab-Bar → 🧠 Assistent

**Header**:
- Emoji: 🧠 (groß)
- Titel: "Entscheidungs-Assistent"
- Untertitel: "Treffe heute eine bessere Entscheidung – klar und durchdacht."

**Fortsetzen-Box** (nur wenn gespeicherte Entscheidung existiert):
- Hintergrund: Hellblau (#e0f2fe)
- Titel: "Willkommen zurück! 👋"
- Text: "Du hast eine angefangene Analyse:"
- Entscheidungstitel (maximal 50 Zeichen, dann "...")
- Buttons:
  - "Fortsetzen" → Lädt Entscheidung aus AsyncStorage
  - "Neu starten" → Löscht gespeicherte Entscheidung
- Anzeige-Bedingung: `decisionData.decision.length >= 10`

**Modus-Auswahl**:
Zwei Buttons nebeneinander (Segmented Control):

**Vollständig**:
- Emoji: 🎯
- Titel: "Vollständig"
- Untertitel: "6 Schritte"
- Beschreibung: "Durchdachte Analyse in 6 klaren Schritten."
- Aktiv-Style: Blauer Rahmen (2px, #3b82f6), blauer Hintergrund (#dbeafe)
- Inaktiv-Style: Grauer Rahmen, weißer Hintergrund

**Schnell**:
- Emoji: ⚡
- Titel: "Schnell"
- Untertitel: "2 Schritte"
- Beschreibung: "Fokussierte Entscheidung in 2 essentiellen Schritten."
- Aktiv/Inaktiv-Style: Gleich wie Vollständig

**Kategorien-Auswahl**:
- Label: "Wähle Kategorien (mehrere möglich):" (fett)
- 6 Kategorien-Buttons (3 pro Zeile):
  - Leben
  - Arbeit
  - Finanzen
  - Beziehung
  - Gesundheit
  - Projekte
- Multi-Select: Mehrere Kategorien gleichzeitig wählbar
- Aktiv-Style: Blauer Hintergrund (#3b82f6), weißer Text
- Inaktiv-Style: Grauer Hintergrund (#f3f4f6), schwarzer Text
- Mindestens 1 Kategorie muss gewählt sein

**Entscheidungseingabe**:
- Label: "Beschreibe deine Entscheidung:" (fett)
- Textarea (4 Zeilen, 100% Breite)
- Placeholder: "z.B. Soll ich ein neues Auto kaufen?"
- Border: 1px grau, bei Fokus 2px blau
- Maximal 500 Zeichen
- Live-Zeichenzähler:
  - Links: "✓ Perfekt!" (grün) wenn ≥10 Zeichen, sonst "Noch X Zeichen" (grau)
  - Rechts: "X/500"
- Auto-Save: Bei jeder Änderung (wenn ≥10 Zeichen) wird in AsyncStorage gespeichert

**Start-Button**:
- Text: "Analyse starten 🚀" (wenn ≥10 Zeichen)
- Text: "Beschreibe deine Entscheidung" (wenn <10 Zeichen)
- Disabled State: Grauer Hintergrund, Text grau, nicht klickbar
- Aktiv State: Blauer Hintergrund (#3b82f6), weißer Text, klickbar
- Aktion: Startet Analyse-Flow

### 3.2 Vollständiger Modus - Schritt-für-Schritt

**Allgemeines Layout**:
- Progress-Anzeige oben: "Schritt X von 6"
- Progress-Bar (6 Segmente, aktuelle blau, restliche grau)
- Entscheidungs-Reminder-Box (hellblau, Entscheidungstitel)
- Schritt-Emoji (groß, rechts oben)
- Frage (fett, 18px)
- Optionen oder Textfeld
- Follow-Up-Frage (erscheint nach Auswahl)
- Buttons: "← Zurück" (ab Schritt 2) | "Überspringen →" (bei optionalen Schritten)

**Schritt 1: Deine erste Intuition** 🎯
- **Frage**: "Was ist dein spontanes Bauchgefühl?"
- **Typ**: Single-Choice (Radio-Buttons)
- **Optionen**:
  - ⭐⭐ Stark dafür (+2 Punkte)
  - ⭐ Eher dafür (+1 Punkt)
  - ➖ Neutral (0 Punkte)
  - ⭕ Eher dagegen (-1 Punkt)
  - ❌ Stark dagegen (-2 Punkte)
- **Optional**: Nein (muss beantwortet werden)
- **Automatischer Weiter-Button**: Erscheint nach Auswahl

**Schritt 2: Was steht auf dem Spiel?** ⚖️
- **Frage**: "Was könntest du verlieren?"
- **Typ**: Freitext (Textarea, 3 Zeilen, optional)
- **Placeholder**: "z.B. Geld, Zeit, Ansehen..."
- **Follow-Up** (erscheint nach Eingabe oder Skip):
  - Frage: "Wie hoch ist das Risiko?"
  - Optionen:
    - Sehr niedrig (+4 Punkte)
    - Niedrig (+2 Punkte)
    - Mittel (0 Punkte)
    - Hoch (-2 Punkte)
    - Sehr hoch (-4 Punkte)
- **Optional**: Ja (Button "Überspringen →")

**Schritt 3: Kannst du zurück?** ↩️
- **Frage**: "Wie leicht kannst du diese Entscheidung rückgängig machen?"
- **Typ**: Freitext (Textarea, optional)
- **Follow-Up**:
  - Frage: "Wie reversibel?"
  - Optionen:
    - Vollständig (+4 Punkte)
    - Größtenteils (+3 Punkte)
    - Teilweise (+1 Punkt)
    - Kaum (-1 Punkt)
    - Irreversibel (-4 Punkte)
- **Optional**: Ja

**Schritt 4: Zeitperspektive** 🔮
- **Frage**: "Wie siehst du es langfristig?"
- **Typ**: Freitext (Textarea, optional)
- **Placeholder**: "z.B. In 5 Jahren..."
- **Follow-Up**:
  - Frage: "Überwiegt der Nutzen?"
  - Optionen:
    - Ja eindeutig (+4 Punkte)
    - Eher ja (+2 Punkte)
    - Unentschieden (0 Punkte)
    - Eher nein (-2 Punkte)
    - Nein (-4 Punkte)
- **Optional**: Ja

**Schritt 5: Äußere Einflüsse** 🎭
- **Frage**: "Was beeinflusst dich?"
- **Typ**: Freitext (Textarea, optional)
- **Placeholder**: "z.B. Meinung anderer, Zeitdruck..."
- **Follow-Up**:
  - Frage: "Kannst du objektiver sein?"
  - Optionen:
    - Ja definitiv (+2 Punkte)
    - Wahrscheinlich (+1 Punkt)
    - Unsicher (0 Punkte)
    - Eher nein (-1 Punkt)
    - Nein (-2 Punkte)
- **Optional**: Ja

**Schritt 6: Rat an einen Freund** 💭
- **Frage**: "Was würdest du einem Freund raten?"
- **Typ**: Freitext (Textarea, optional)
- **Placeholder**: "Wenn ein Freund dich fragen würde..."
- **Follow-Up**:
  - Frage: "Deine Empfehlung?"
  - Optionen:
    - Klar dafür (+6 Punkte)
    - Eher dafür (+3 Punkte)
    - Abwarten (0 Punkte)
    - Eher dagegen (-3 Punkte)
    - Klar dagegen (-6 Punkte)
- **Optional**: Nein (muss beantwortet werden)

**Berechnung der Empfehlung**:
- Summierung aller Punkte aus den Antworten
- Minimum: -22 Punkte
- Maximum: +22 Punkte
- Formel: `percentage = ((totalPoints - minPoints) / (maxPoints - minPoints)) * 100`
- Beispiel: 10 Punkte → `((10 - (-22)) / (22 - (-22))) * 100` = 72,7%
- Empfehlung:
  - ≥55%: JA ✓
  - 45-54%: UNENTSCHIEDEN ⚠
  - ≤44%: NEIN ✕

### 3.3 Schnell-Modus - 2 Schritte

**Schritt 1: Bauchgefühl & Konsequenz** ⚡
- **Frage**: "Was ist dein spontanes Gefühl zu dieser Entscheidung?"
- **Optionen**:
  - Fühlt sich richtig an ✓ (+3 Punkte)
  - Bin unsicher ? (0 Punkte)
  - Fühlt sich falsch an ✕ (-3 Punkte)
- **Follow-Up** (Pflicht, erscheint nach Auswahl):
  - Frage: "Was wäre die schlimmste Konsequenz, wenn es schiefgeht?"
  - Typ: Textarea (4 Zeilen, Pflicht)
  - Placeholder: "z.B. Geldverlust, Zeitverschwendung..."
  - Button "Weiter →" nur aktiv wenn Text eingegeben

**Schritt 2: Zeitperspektive** 🔮
- **Frage**: "Wird diese Entscheidung in einem Jahr noch wichtig sein?"
- **Optionen**:
  - Ja, sehr wichtig (+2 Punkte)
  - Mittelmäßig wichtig (0 Punkte)
  - Kaum noch relevant (-1 Punkt)
- **Follow-Up**:
  - Frage: "Bereust du es eher, wenn du es TUST oder NICHT tust?"
  - Optionen:
    - Bereue es zu tun (-2 Punkte)
    - Egal (0 Punkte)
    - Bereue es NICHT zu tun (+2 Punkte)

**Berechnung**:
- Minimum: -4 Punkte
- Maximum: +5 Punkte
- Formel: Gleich wie Vollständiger Modus
- Empfehlung:
  - ≥60%: JA
  - 40-59%: UNENTSCHIEDEN
  - ≤39%: NEIN

### 3.4 Ergebnis-Screen

**Header**:
- Titel: "✨ Deine Analyse"
- Favoriten-Icon: ☆ (Outline) oder ⭐ (Filled)
  - Klick: Toggle Favorit
  - Speichert in `completedDecisions` Array

**Tags-Bereich**:
- **Kategorie-Tag**: Blaues Badge mit allen gewählten Kategorien
  - Beispiel: "Leben, Arbeit"
- **Modus-Tag**: Graues Badge
  - "⚡ Schnell" oder "🎯 Vollständig"

**Entscheidungs-Reminder**:
- Hellblaue Box mit vollständigem Entscheidungstitel

**Ergebnis-Karte** (großes Card):
- **Hintergrund-Farbe** (basierend auf Empfehlung):
  - JA: Grün (#10b981)
  - NEIN: Rot (#ef4444)
  - UNENTSCHIEDEN: Orange (#f59e0b)
- **Emoji** (groß, weiß):
  - JA: ✓
  - NEIN: ✕
  - UNENTSCHIEDEN: ⚠
- **Empfehlung** (groß, fett, weiß):
  - "JA" / "NEIN" / "UNENTSCHIEDEN"
- **Konfidenz-Badge** (weiß mit Transparenz):
  - "Konfidenz: X%"
- **Nachricht** (weiß):
  - JA: "Dieser Weg könnte der richtige sein – du triffst durchdachte Entscheidungen! 🎉"
  - NEIN: "Die Analyse rät zur Vorsicht. Überlege es dir nochmal. 🤔"
  - UNENTSCHIEDEN: "Die Signale sind gemischt. Sammle mehr Informationen. 🔍"

**Journal-Box** (optional):
- Titel: "📝 Was hast du gelernt?"
- Textarea (3 Zeilen, optional)
- Placeholder: "Deine Reflexion... (optional)"
- Hinweis: "Halte fest, was du aus dieser Entscheidung mitnimmst."
- Wird in `completedDecisions` gespeichert

**Nächste Schritte** (optional):

**Initial-State** (CTA-Box):
- Text: "→ Nächste Schritte definieren"
- Hinweis: "Optional: Wandle diese Gedanken in Taten um"
- Klick: Öffnet Formular

**Expanded-State** (Formular):
- Titel: "🎯 Kleine nächste Schritte"
- Untertitel: "Was könntest du tun? (max. 3 einfache Schritte)"
- 3 Textfelder:
  - "1. [Schritt 1 (optional)]"
  - "2. [Schritt 2 (optional)]"
  - "3. [Schritt 3 (optional)]"
- Button: "Zum Board hinzufügen" (blau)
  - Erstellt für jeden ausgefüllten Schritt eine Karte im Kanban Board
  - Kategorie: "To-Do"
  - Titel: Schritt-Text
  - Beschreibung: "Aus Entscheidung: [Entscheidungstitel]"
  - Tag: "aus-entscheidung"
  - Typ: Task
  - Priorität: Medium
  - Nach Erfolg: Alert "✓ Zum Board hinzugefügt! X Schritte wurden als Tasks zum Board hinzugefügt."
  - Dialog-Optionen: "Zum Board" (wechselt zu Board-Tab) | "OK"
- Button: "Überspringen" (grau, schließt Formular)

**Reset-Button**:
- Text: "Neue Entscheidung analysieren 🔄"
- Farbe: Dunkelgrau (#1f2937)
- Aktion:
  1. Speichert Entscheidung in `completedDecisions` Array
  2. Löscht `decisionData` aus AsyncStorage
  3. Setzt alle States zurück
  4. Wechselt zu Tracker-Tab (zeigt neue Entscheidung im Kalender)

### 3.5 Auto-Save

**Funktionsweise**:
- Bei jeder Eingabe (wenn `decision.length >= 10`) wird gespeichert
- Speicherort: AsyncStorage → `user_[EMAIL]_decisionData`
- Gespeicherte Daten:
  ```javascript
  {
    decision: "Entscheidungstitel",
    allAnswers: { step1: {...}, step2: {...}, ... },
    currentStep: 3,
    showResults: false
  }
  ```
- Wiederherstellung beim nächsten App-Start
- Anzeige in "Fortsetzen-Box"

**Löschung**:
- Bei "Neu starten" Button
- Bei "Neue Entscheidung analysieren"
- Bei Account-Löschung

---

## 4. Kanban Board

### 4.1 Board-Screen

**Wo**: Tab-Bar → 📋 Board

**Header**:
- Titel: "Board"
- Untertitel: "X cards" (Gesamtanzahl aller Karten)
- Filter-Button: 🔍
  - Aktiv-Style: Blauer Hintergrund (#3b82f6), weißer Icon
  - Inaktiv-Style: Grauer Hintergrund (#f8fafc), grauer Icon
  - Toggle: Zeigt/versteckt Filter-Bereich

**Filter-Bereich** (nur wenn Filter aktiv):

**Suchleiste**:
- Icon: 🔍 (links)
- Placeholder: "Suche..."
- Live-Suche (filtert während Eingabe)
- Durchsucht: Titel, Beschreibung, Tags
- Case-insensitive

**Filter-Panel**:
Drei Bereiche untereinander:

**1. Typ-Filter**:
- Label: "Typ" (fett)
- Pills (horizontal scrollbar):
  - Alle (Standard)
  - 📋 Task
  - 💡 Idea
  - 🐛 Bug
  - ✨ Feature
- Multi-Select: Mehrere gleichzeitig wählbar
- Aktiv-Style: Blauer Hintergrund (#3b82f6), weißer Text
- Inaktiv-Style: Grauer Hintergrund (#f3f4f6), schwarzer Text

**2. Prioritäts-Filter**:
- Label: "Priorität"
- Pills:
  - Alle
  - Low (grün)
  - Medium (orange)
  - High (rot)
- Multi-Select

**3. Status-Filter**:
- Label: "Status"
- Pills:
  - Alle
  - Backlog
  - To-Do
  - In Progress
  - Done
- Multi-Select

**Reset-Button**:
- Text: "Filter zurücksetzen"
- Farbe: Grau
- Aktion: Setzt alle Filter auf "Alle"

**Board-Ansicht** (Kanban):

**Layout**:
- Horizontal scrollbar (wischen zwischen Spalten)
- 4 Spalten nebeneinander
- Jede Spalte: 85% Bildschirmbreite (mobil) oder 320px (Tablet)
- Padding: 12px zwischen Spalten

**Spalten**:

**1. Backlog** 📝
- Icon: 📝
- Name: "Backlog"
- Farbe: Grau (#6b7280)
- Beschreibung: "Ideen & Aufgaben für später"
- Button: "+ Neue Karte" (am oberen Ende der Spalte)
- Karten: Vertical Scroll

**2. To-Do** 📌
- Icon: 📌
- Name: "To-Do"
- Farbe: Blau (#3b82f6)
- Beschreibung: "Geplante Aufgaben"
- Button: "+ Neue Karte"

**3. In Progress** 🚀
- Icon: 🚀
- Name: "In Progress"
- Farbe: Orange (#f59e0b)
- Beschreibung: "Aktuell in Arbeit"
- Button: "+ Neue Karte"

**4. Done** ✅
- Icon: ✅
- Name: "Done"
- Farbe: Grün (#10b981)
- Beschreibung: "Abgeschlossen"
- Button: "+ Neue Karte"

### 4.2 Karten-Darstellung

**Card-Design**:
- Weißer Hintergrund (#ffffff)
- Abgerundete Ecken (12px)
- Leichter Schatten (elevation: 2)
- Padding: 16px
- Margin: 8px zwischen Karten
- Border: 1px transparent (bei Hover: blau)

**Card-Elemente** (von oben nach unten):

**1. Header-Zeile**:
- Links: Typ-Badge
  - 📋 Task / 💡 Idea / 🐛 Bug / ✨ Feature
  - Kleines Icon (16px)
  - Hintergrund: Hellgrau (#f3f4f6)
  - Padding: 4px 8px
  - Abgerundet (6px)
- Rechts: 3-Dots-Menu (⋮)
  - Klick: Öffnet Quick-Actions

**2. Titel**:
- Text: Kartentitel (fett, 16px, schwarz)
- Maximal 2 Zeilen
- Overflow: "..." wenn länger

**3. Beschreibung**:
- Text: Kartenbeschreibung (14px, grau #64748b)
- Maximal 3 Zeilen
- Overflow: "... mehr" wenn länger
- Klick auf "mehr": Öffnet Karten-Detail

**4. Prioritäts-Badge**:
- Position: Links
- Größe: Klein (Pill)
- Farben:
  - Low: Grün (#10b981) mit hellgrünem Hintergrund
  - Medium: Orange (#f59e0b) mit hellorangem Hintergrund
  - High: Rot (#ef4444) mit hellrotem Hintergrund
- Text: "Low" / "Medium" / "High"

**5. Tags** (wenn vorhanden):
- Horizontal Scroll (wenn viele Tags)
- Pills: Hellblau (#dbeafe), Text dunkelblau (#1e40af)
- Beispiel: "aus-entscheidung", "wichtig", "dringend"
- Maximal 3 sichtbar, dann "+X mehr"

**6. Footer-Zeile**:
- Links: Erstellungsdatum
  - Format: "vor X Tagen" (wenn <7 Tage) oder "TT.MM.YYYY"
  - Klein, grau
- Rechts: Verknüpfungs-Icon (🔗) wenn mit Entscheidung verknüpft

**Interaktion**:
- Tap auf Karte: Öffnet Karten-Detail-Modal
- Tap auf 3-Dots: Öffnet Quick-Actions-Menu
- Long-Press: Zeigt Vorschau (geplant, nicht implementiert)

### 4.3 Karte erstellen

**Trigger**: Klick auf "+ Neue Karte" in einer Spalte

**Modal** (Fullscreen-Overlay):
- Titel: "Neue Karte erstellen"
- Hintergrund: Halbtransparent
- Card: Weiß, zentriert, 90% Breite

**Felder**:

**1. Titel** (Pflicht):
- Label: "Titel" (fett)
- Textfeld (1 Zeile)
- Placeholder: "z.B. Blogpost schreiben"
- Maximal 100 Zeichen
- Echtzeit-Zeichenzähler: "X/100"
- Mindestlänge: 3 Zeichen (sonst Button disabled)

**2. Beschreibung** (Optional):
- Label: "Beschreibung" (fett)
- Textarea (4 Zeilen)
- Placeholder: "Details zur Aufgabe..."
- Maximal 500 Zeichen
- Zeichenzähler: "X/500"

**3. Typ** (Pflicht):
- Label: "Typ"
- Segmented Control (4 Optionen):
  - 📋 Task (Standard)
  - 💡 Idea
  - 🐛 Bug
  - ✨ Feature
- Single-Select

**4. Priorität** (Pflicht):
- Label: "Priorität"
- Segmented Control (3 Optionen):
  - Low (grün)
  - Medium (orange, Standard)
  - High (rot)
- Single-Select

**5. Kategorie** (Vorausgewählt):
- Label: "Status"
- Dropdown:
  - Backlog
  - To-Do
  - In Progress
  - Done
- Standard: Spalte, in der geklickt wurde

**6. Tags** (Optional):
- Label: "Tags (kommagetrennt)"
- Textfeld
- Placeholder: "z.B. wichtig, dringend"
- Parsing: Split by ","
- Erstellt Pills für jedes Tag

**7. Verknüpfte Entscheidung** (Optional):
- Label: "Mit Entscheidung verknüpfen"
- Dropdown:
  - Option: "Keine"
  - Alle Entscheidungen aus `completedDecisions`
  - Format: "Entscheidungstitel (TT.MM.YYYY)"
- Speichert `linkedDecisionId`

**Buttons**:
- "Abbrechen" (links, grau, schließt Modal)
- "Erstellen" (rechts, blau, nur aktiv wenn Titel ≥3 Zeichen)

**Aktion bei "Erstellen"**:
1. Erstellt Karten-Objekt:
   ```javascript
   {
     id: Date.now().toString(),
     title: "...",
     description: "...",
     type: "task",
     priority: "medium",
     category: "todo",
     tags: ["wichtig", "dringend"],
     linkedDecisionId: "12345",
     createdAt: ISO-8601 String
   }
   ```
2. Fügt Karte zu Zustand-Store hinzu (`addCard()`)
3. Speichert in AsyncStorage (`user_[EMAIL]_cards`)
4. Schließt Modal
5. Zeigt neue Karte in entsprechender Spalte

### 4.4 Karte bearbeiten

**Trigger**: Klick auf Karte → 3-Dots → "Bearbeiten"

**Modal**: Gleich wie "Erstellen", aber:
- Titel: "Karte bearbeiten"
- Felder sind vorausgefüllt mit bestehenden Werten
- Button: "Speichern" statt "Erstellen"

**Aktion bei "Speichern"**:
1. Aktualisiert Karte im Store (`updateCard()`)
2. Speichert in AsyncStorage
3. Schließt Modal
4. Zeigt aktualisierte Karte

### 4.5 Karte löschen

**Trigger**: Klick auf Karte → 3-Dots → "Löschen"

**Bestätigungs-Dialog**:
- Titel: "Karte löschen?"
- Text: "Diese Aktion kann nicht rückgängig gemacht werden."
- Buttons:
  - "Abbrechen" (links, grau)
  - "Löschen" (rechts, rot)

**Aktion bei "Löschen"**:
1. Entfernt Karte aus Store (`deleteCard()`)
2. Aktualisiert AsyncStorage
3. Schließt Dialog
4. Karte verschwindet aus Board

### 4.6 Karte verschieben

**Optionen**:

**1. Via Bearbeiten-Modal**:
- Öffne Karte → Bearbeiten
- Ändere "Status"-Dropdown
- Speichern
- Karte erscheint in neuer Spalte

**2. Via Quick-Actions** (geplant):
- Klick auf 3-Dots → "Verschieben"
- Dropdown mit Kategorien
- Auswahl → Karte wird verschoben

**3. Drag & Drop** (geplant, nicht implementiert):
- Karte gedrückt halten
- In andere Spalte ziehen
- Loslassen → Karte wird verschoben

### 4.7 Zustand Store (Board)

**Technologie**: Zustand (State Management Library)

**Store-Struktur**:
```javascript
{
  cards: Map<string, Card>, // Key: Card-ID, Value: Card-Objekt
  categories: [
    { id: 'backlog', name: 'Backlog', icon: '📝', color: '#6b7280' },
    { id: 'todo', name: 'To-Do', icon: '📌', color: '#3b82f6' },
    { id: 'inprogress', name: 'In Progress', icon: '🚀', color: '#f59e0b' },
    { id: 'done', name: 'Done', icon: '✅', color: '#10b981' }
  ],
  filters: {
    search: '',
    types: [],
    priorities: [],
    statuses: []
  },
  currentUser: 'user@example.com',
  isLoading: false
}
```

**Actions**:
- `addCard(card)` - Fügt Karte zum Store hinzu
- `updateCard(id, updates)` - Aktualisiert Karte
- `deleteCard(id)` - Löscht Karte
- `loadFromStorage(userEmail)` - Lädt Karten aus AsyncStorage
- `setFilters(filters)` - Setzt aktive Filter
- `clearFilters()` - Setzt Filter zurück
- `setCurrentUser(email)` - Setzt aktuellen User

**Persistenz**:
- Automatisches Speichern bei jeder Änderung
- AsyncStorage-Key: `user_[EMAIL]_cards`
- Format: JSON
- Beispiel:
  ```json
  {
    "cards": [
      {
        "id": "1703001234567",
        "title": "Blogpost schreiben",
        "description": "Über React Hooks",
        "type": "task",
        "priority": "high",
        "category": "todo",
        "tags": ["wichtig", "blog"],
        "linkedDecisionId": null,
        "createdAt": "2025-12-18T10:30:00.000Z"
      }
    ]
  }
  ```

### 4.8 Board-zu-Entscheidung-Integration

**Verknüpfung erstellen**:
1. Beim Erstellen/Bearbeiten einer Karte
2. Dropdown "Mit Entscheidung verknüpfen"
3. Auswahl einer Entscheidung
4. `linkedDecisionId` wird gespeichert

**Umgekehrt** (Entscheidung → Board):
- Im Entscheidungs-Ergebnis-Screen
- "Nächste Schritte"-Formular
- Bis zu 3 Schritte eingeben
- "Zum Board hinzufügen"
- Erstellt für jeden Schritt eine Karte:
  - Kategorie: To-Do
  - Typ: Task
  - Priorität: Medium
  - Tag: "aus-entscheidung"
  - Verknüpfung: `linkedDecisionId` zur Entscheidung
- Alert: "X Schritte zum Board hinzugefügt"
- Option: "Zum Board" (wechselt Tab)

**Vorteile**:
- Nahtlose Integration zwischen Entscheidung und Umsetzung
- Verfolgung von Entscheidungs-basierten Aufgaben

---

## 5. Tracker & Kalender

### 5.1 Tracker-Screen

**Wo**: Tab-Bar → 📊 Tracker

**Header**:
- Titel: "📊 Dein Fortschritt"

**Statistik-Boxen** (2 nebeneinander):

**Box 1: Entscheidungen**:
- Layout: Flex 1, linke Box
- Hintergrund: Hellblau (#dbeafe)
- Zahl: Anzahl aller Entscheidungen (groß, fett, 32px, blau #3b82f6)
- Label: "Entscheidungen" (klein, 14px, grau #64748b)
- Abgerundete Ecken (12px)
- Padding: 20px

**Box 2: Streak**:
- Layout: Flex 1, rechte Box
- Hintergrund: Hellgrün (#d1fae5)
- Zahl: Anzahl Tage in Folge (groß, fett, 32px, grün #10b981)
- Label: "Tage Streak 🔥" (klein, 14px, grau #64748b)
- Abgerundete Ecken (12px)
- Padding: 20px

**Streak-Berechnung**:
```javascript
function calculateStreak(decisions) {
  if (decisions.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Startzeit: Heute 00:00

  // Erstelle Set aller Tage mit Entscheidungen
  const decisionsSet = new Set(
    decisions.map(d => new Date(d.date).toDateString())
  );

  // Gehe rückwärts ab heute
  while (decisionsSet.has(currentDate.toDateString())) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1); // 1 Tag zurück
  }

  return streak;
}
```
- Beispiel:
  - Heute: 1 Entscheidung → Streak = 1
  - Gestern: 2 Entscheidungen → Streak = 2
  - Vorgestern: 0 Entscheidungen → Streak stoppt bei 2

**Monats-Navigation**:
- Layout: Flex-Row, Space-Between
- Links: "←" Button
  - Aktion: Vorheriger Monat
  - Wenn Januar: Dezember des Vorjahres
- Mitte: "Monat Jahr" (z.B. "Dezember 2025")
  - Fett, 18px
- Rechts: "→" Button
  - Aktion: Nächster Monat
  - Wenn Dezember: Januar des nächsten Jahres

**Kalender-Grid**:

**Wochentage-Header**:
- 7 Spalten: So, Mo, Di, Mi, Do, Fr, Sa
- Klein, grau (#9ca3af), zentriert
- Fett

**Kalender-Tage** (Grid 7×5 oder 7×6):
- Jeder Tag: Quadratisches Kästchen
- Breite: 13% der Bildschirmbreite
- Aspect Ratio: 1:1 (quadratisch)
- Abgerundete Ecken (12px)
- Margin: 4px

**Tag-Typen**:

**1. Leerer Tag** (kein Ereignis):
- Hintergrund: Hellgrau (#f3f4f6)
- Text: Tageszahl (grau #9ca3af)
- Nicht klickbar

**2. Tag mit Entscheidung**:
- Hintergrund: Grün (#10b981)
- Text: Tageszahl (weiß, fett)
- Klickbar (geplant: Zeigt Entscheidungen dieses Tages)

**3. Tag außerhalb des Monats**:
- Leeres Kästchen (transparent)
- Kein Text

**4. Heute** (zusätzlicher Indikator):
- Border: 2px blau (#3b82f6)
- Zusätzlich zum Hintergrund

**Beispiel-Visualisierung**:
```
Dezember 2025

So  Mo  Di  Mi  Do  Fr  Sa
 1   2   3   4   5   6   7
 8   9  10  11  12  13  14
15  16  17  18  19  20  21
22  23  24  25  26  27  28
29  30  31

Grün: Tage mit Entscheidungen
Blauer Rahmen: Heute
```

### 5.2 Daten-Verarbeitung

**Quelle**: AsyncStorage → `user_[EMAIL]_decisions`

**Beispiel-Entscheidung**:
```javascript
{
  id: 1703001234567,
  date: "2025-12-18T10:30:00.000Z",
  decision: "Neues Auto kaufen",
  recommendation: "JA",
  percentage: 72,
  category: ["Finanzen"],
  isFavorite: false,
  journal: "War eine gute Analyse",
  mode: "full"
}
```

**Konvertierung für Kalender**:
```javascript
const decisionsSet = new Set(
  completedDecisions.map(d =>
    new Date(d.date).toDateString()
  )
);
// Set(['Mon Dec 18 2025', 'Sun Dec 17 2025', ...])
```

**Lookup**:
- Für jeden Tag im Kalender
- Prüfe: `decisionsSet.has(dayDate.toDateString())`
- Wenn true: Grüner Hintergrund
- Wenn false: Grauer Hintergrund

### 5.3 Monats-Wechsel

**Logik**:
```javascript
// State
const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

// Vorheriger Monat
const goToPrevMonth = () => {
  if (currentMonth === 0) {
    setCurrentMonth(11); // Dezember
    setCurrentYear(currentYear - 1);
  } else {
    setCurrentMonth(currentMonth - 1);
  }
};

// Nächster Monat
const goToNextMonth = () => {
  if (currentMonth === 11) {
    setCurrentMonth(0); // Januar
    setCurrentYear(currentYear + 1);
  } else {
    setCurrentMonth(currentMonth + 1);
  }
};
```

**Kalender-Generierung**:
```javascript
function generateCalendar(month, year) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0=Sonntag, 6=Samstag

  const calendarDays = [];

  // Leere Tage am Anfang
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Tage des Monats
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  return calendarDays;
}
```

### 5.4 Detailansicht (geplant, nicht implementiert)

**Trigger**: Klick auf grünen Tag (mit Entscheidungen)

**Modal**:
- Titel: "Entscheidungen am TT.MM.YYYY"
- Liste aller Entscheidungen dieses Tages:
  - Titel
  - Empfehlung (Badge)
  - Konfidenz
  - Kategorien
- Klick auf Entscheidung: Zeigt Details

---

## 6. Teilen-Funktion

### 6.1 Teilen-Screen

**Wo**: Tab-Bar → ↗ Teilen

**Header**:
- Titel: "👥 App teilen"

**Info-Box**:
- Hintergrund: Hellblau (#dbeafe)
- Padding: 20px
- Abgerundete Ecken (12px)
- Titel: "Hilf anderen bessere Entscheidungen zu treffen" (fett, 18px)
- Text: "Teile diese App mit Freunden und Familie." (14px, grau)

**Teilen-Button**:
- Text: "📤 App teilen"
- Farbe: Blau (#3b82f6)
- Groß, zentriert
- Aktion: Öffnet System-Share-Dialog

**Share-Text**:
```
Vayze - Treffe bessere Entscheidungen! 🧠

Entdecke Vayze, die App für fundierte Entscheidungen.

Analysiere deine Entscheidungen wissenschaftlich fundiert und behalte den Überblick mit dem integrierten Kanban-Board.

📱 Suche "Vayze" in deinem App Store
```

**Social-Container**:
- Text: "Mit Vayze triffst du klarere Entscheidungen. Teile die App mit Freunden!"
- Klein, grau, zentriert

### 6.2 System-Share-Integration

**iOS**:
- Native Share-Sheet
- Optionen: Messages, Mail, WhatsApp, AirDrop, etc.

**Android**:
- Native Share-Dialog
- Optionen: WhatsApp, Telegram, Gmail, SMS, etc.

**Web** (PWA):
- Web Share API (falls unterstützt)
- Fallback: Kopieren in Zwischenablage

**Code**:
```javascript
import { Share } from 'react-native';

await Share.share({
  message: shareText,
  title: 'Vayze App',
  url: 'https://vayze.app' // Optional
});
```

---

## 7. Einstellungen

### 7.1 Einstellungen-Screen

**Wo**: Tab-Bar → ⚙ Settings

**Header**:
- Titel: "Einstellungen"

**Layout**: Liste mit Sektionen

### 7.2 Personalisierung-Sektion

**Titel**: "PERSONALISIERUNG" (Großbuchstaben, klein, grau)

**Optionen**:

**1. Dark Mode**:
- Layout: Flex-Row, Space-Between
- Links: Label "Dark Mode"
- Rechts: Toggle-Switch
  - Standard: Aus (false)
  - Aktiv: Blau (#3b82f6)
  - Inaktiv: Grau (#e5e7eb)
- Aktion: Alert "Einstellung geändert: Dark Mode wurde aktiviert/deaktiviert"
- **Status**: Platzhalter, keine Funktion (Dark Mode nicht implementiert)

**2. Benachrichtigungen**:
- Layout: Gleich wie Dark Mode
- Label: "Benachrichtigungen"
- Toggle-Switch
- **Status**: Platzhalter, keine Funktion

**3. Analytics**:
- Label: "Analytics"
- Toggle-Switch
- Hinweis: "Hilf uns, die App zu verbessern (anonym)"
- **Status**: Platzhalter, kein Tracking aktiv
- **Zukünftig**: Opt-in für anonymisierte Nutzungsstatistiken

**Speicherung**:
- AsyncStorage → `user_[EMAIL]_settings`
- Beispiel:
  ```json
  {
    "darkMode": false,
    "notifications": true,
    "analytics": false
  }
  ```

### 7.3 Über-Sektion

**Titel**: "ÜBER"

**Optionen**:

**1. Tipps für die Nutzung**:
- Button: "Tipps für die Nutzung →"
- Klick: Alert
  ```
  Titel: "Tipps"
  Text: "Nutze den Vollständigen Modus für wichtige Entscheidungen und den Schnell-Modus für alltägliche Entscheidungen."
  Button: "OK"
  ```

**2. Häufig Gestellte Fragen**:
- Button: "Häufig Gestellte Fragen →"
- Klick: Alert
  ```
  Titel: "FAQ"
  Text: "Wie funktioniert die App?

  Die App analysiert deine Entscheidungen basierend auf wissenschaftlichen Methoden und gibt dir eine fundierte Empfehlung."
  Button: "OK"
  ```

**3. Kontakt**:
- Button: "Kontakt →"
- Klick: Öffnet E-Mail-Client
  - An: vayze.app@gmail.com
  - Betreff: "Vayze Feedback"
  - Body: "Hallo Vayze-Team,\n\n"

**4. Teilen**:
- Button: "Teilen →"
- Klick: Öffnet System-Share-Dialog (gleich wie Teilen-Tab)

**5. Bewerten und unterstützen**:
- Button: "Bewerten und unterstützen"
- Badge rechts: "V 1.0.0" (Version, grau)
- Klick: Alert "Version: Entscheidungs-Assistent v1.0.0"
- **Geplant**: Link zu App Store Review

### 7.4 Daten-Sektion

**Titel**: "DATEN"

**Optionen**:

**1. Daten exportieren**:
- Button: "Daten exportieren 📥"
- Klick: Alert
  ```
  Titel: "Daten exportiert"
  Text: "X Entscheidungen gespeichert.

  Tipp: In der Vollversion kannst du die Daten als JSON exportieren."
  Button: "OK"
  ```
- **Status**: Platzhalter, keine echte Export-Funktion
- **Geplant**: JSON-Export aller Daten

**2. Alle Daten löschen**:
- Button: "Alle Daten löschen 🗑️"
- Farbe: Rot
- Klick: Bestätigungsdialog
  ```
  Titel: "Alle Daten löschen?"
  Text: "Diese Aktion kann nicht rückgängig gemacht werden!"
  Buttons: "Abbrechen" | "Löschen" (rot)
  ```
- Bei "Löschen":
  1. Löscht alle Daten aus AsyncStorage:
     - `user_[EMAIL]_decisions`
     - `user_[EMAIL]_settings`
     - `user_[EMAIL]_decisionData`
     - Board-Karten aus Zustand Store
  2. Setzt alle States zurück
  3. Alert "Erfolg: Alle Daten wurden gelöscht."
  4. **WICHTIG**: Account bleibt bestehen (nur Logout, keine Account-Löschung)

### 7.5 Rechtliches-Sektion

**Titel**: "RECHTLICHES"

**Optionen**:

**1. Datenschutzerklärung**:
- Button: "Datenschutzerklärung ↗"
- Klick: Öffnet URL in Browser
  - URL: https://github.com/vayze-app/privacy-policy (Platzhalter)
  - Accessibility: "Datenschutzerklärung öffnen"
- **TODO**: URL anpassen auf tatsächliche gehostete Version

**2. Nutzungsbedingungen**:
- Button: "Nutzungsbedingungen ↗"
- Klick: Öffnet URL
  - URL: https://github.com/vayze-app/terms-of-service (Platzhalter)

**3. Support kontaktieren**:
- Button: "Support kontaktieren ✉️"
- Klick: Öffnet E-Mail-Client
  - An: vayze.app@gmail.com
  - Betreff: "Vayze Support"
  - Body: "Hallo Vayze-Team,\n\nBitte beschreibe dein Anliegen:\n\n"

### 7.6 Konto-Sektion

**Titel**: "KONTO"

**Optionen**:

**1. Angemeldet als**:
- Nicht klickbar
- Label links: "Angemeldet als"
- Wert rechts: Name oder E-Mail (grau)
  - Wenn Name vorhanden: "[Name] ([E-Mail])"
  - Sonst: "[E-Mail]"

**2. Konto-Einstellungen**:
- Button: "Konto-Einstellungen →"
- Klick: Öffnet AccountScreen (Fullscreen)

**3. Abmelden**:
- Button: "Abmelden 👋"
- Farbe: Rot
- Klick: Bestätigungsdialog
  ```
  Titel: "Abmelden"
  Text: "Möchtest du dich wirklich abmelden?"
  Buttons: "Abbrechen" | "Abmelden" (rot)
  ```
- Bei "Abmelden":
  1. Löscht Session-Token aus SecureStore
  2. Entfernt User aus AuthContext
  3. **Daten bleiben erhalten**
  4. Weiterleitung zu Login-Screen
  5. Alert "Erfolg: Du wurdest abgemeldet."

### 7.7 AccountScreen (Konto-Einstellungen)

**Zugriff**: Einstellungen → Konto-Einstellungen

**Header**:
- Zurück-Button: "← Einstellungen"
- Titel: "Konto"

**Account-Info-Bereich**:
- Hintergrund: Hellblau (#dbeafe)
- Padding: 20px
- Abgerundete Ecken (12px)
- Felder:
  - **E-Mail**: [user.email] (nicht editierbar)
  - **Name**: [user.name] (editierbar via Button)
  - **Erstellt am**: [Datum im Format TT.MM.YYYY]

**Optionen**:

**1. Namen bearbeiten**:
- Button: "Namen bearbeiten ✏️"
- Klick: Modal
  - Titel: "Namen bearbeiten"
  - Textfeld mit aktuellem Namen
  - Buttons: "Abbrechen" | "Speichern"
- Bei "Speichern":
  - Aktualisiert Name in authService
  - Aktualisiert UI
  - Schließt Modal

**2. Passwort ändern**:
- Button: "Passwort ändern 🔒"
- Klick: Modal
  - Titel: "Passwort ändern"
  - Felder:
    - "Altes Passwort" (Passwort-Feld)
    - "Neues Passwort" (min. 6 Zeichen)
    - "Neues Passwort bestätigen"
  - Validierung:
    - Altes Passwort korrekt? (Hash-Vergleich)
    - Neue Passwörter stimmen überein?
    - Neues Passwort ≥6 Zeichen?
  - Buttons: "Abbrechen" | "Speichern"
- Bei "Speichern":
  - Aktualisiert Passwort-Hash in SecureStore
  - Alert "Erfolg: Passwort wurde geändert"
  - Schließt Modal

**3. E-Mail ändern**:
- **Status**: Geplant, nicht implementiert
- Hinweis: "Derzeit nicht möglich. Kontaktiere den Support."

**4. Account löschen**:
- Button: "Konto löschen 🗑️"
- Farbe: Rot
- Klick: Modal
  - Titel: "Konto löschen"
  - Warnung: "⚠️ Warnung: Alle Daten werden unwiderruflich gelöscht!"
  - Liste:
    - Alle Entscheidungen
    - Alle Board-Karten
    - Alle Einstellungen
    - Account-Credentials
  - Bestätigung: Textfeld "Gib 'LÖSCHEN' ein, um zu bestätigen:"
  - Buttons: "Abbrechen" | "Konto löschen" (rot, nur aktiv wenn "LÖSCHEN" eingegeben)
- Bei Bestätigung:
  - Löscht Account komplett (siehe 1.5)
  - Weiterleitung zu Login

---

## 8. Datenverwaltung

### 8.1 Speicherorte

**AsyncStorage** (React Native):
- Plattform: iOS & Android
- Verschlüsselung: Nein (außer System-Verschlüsselung)
- Keys:
  - `user_[EMAIL]_decisions` - Array aller Entscheidungen
  - `user_[EMAIL]_settings` - Objekt mit Einstellungen
  - `user_[EMAIL]_decisionData` - Aktuelle laufende Entscheidung
  - `hasLaunched` - Boolean für Onboarding-Status
  - `onboardingData` - Objekt mit Onboarding-Ergebnissen

**SecureStore** (Expo):
- Plattform-spezifisch:
  - iOS: Keychain (Hardware-basiert, AES-256)
  - Android: EncryptedSharedPreferences (AES-256)
- Keys:
  - `authToken` - Session-Token (verschlüsselt)
  - `user_[EMAIL]_passwordHash` - Passwort-Hash
- Sicherheit: Höchstes Level (Betriebssystem-Verschlüsselung)

**Zustand Store** (Zustand):
- In-Memory Store für Board-Karten
- Persistenz via AsyncStorage
- Key: `user_[EMAIL]_cards`

### 8.2 User-Scoped Storage

**Prinzip**:
- Jeder User hat separate Storage-Keys
- Format: `user_[EMAIL]_[DATATYPE]`
- Vorteile:
  - Vollständige Isolation zwischen Accounts
  - Multi-User Support auf einem Gerät
  - Keine Datenvermischung

**Beispiel**:
```javascript
// User A
AsyncStorage.setItem('user_alice@example.com_decisions', JSON.stringify(decisions));
AsyncStorage.setItem('user_alice@example.com_settings', JSON.stringify(settings));

// User B
AsyncStorage.setItem('user_bob@example.com_decisions', JSON.stringify(decisions));
AsyncStorage.setItem('user_bob@example.com_settings', JSON.stringify(settings));

// Komplett isoliert, keine Überschneidungen
```

### 8.3 Migration (Altdaten → User-Scoped)

**Trigger**: Beim ersten Login nach Update auf User-Scoped Version

**Funktion**: `migrateToUserScope(userEmail)`

**Ablauf**:
1. Prüfe: Existiert altes globales Key `decisions`?
2. Wenn ja:
   - Lese Daten aus `decisions`
   - Speichere in `user_[EMAIL]_decisions`
   - Lösche altes `decisions` Key
3. Wiederhole für `settings`, `decisionData`, etc.
4. Markiere Migration als abgeschlossen (Flag in AsyncStorage)

**Code-Beispiel**:
```javascript
async function migrateToUserScope(userEmail) {
  try {
    // Alte Daten laden
    const oldDecisions = await AsyncStorage.getItem('decisions');
    if (oldDecisions) {
      // In user-scoped Key speichern
      await AsyncStorage.setItem(
        `user_${userEmail}_decisions`,
        oldDecisions
      );
      // Alte Daten löschen
      await AsyncStorage.removeItem('decisions');
    }

    // Wiederhole für andere Keys...
  } catch (error) {
    console.error('Migration error:', error);
  }
}
```

### 8.4 Daten-Export (geplant)

**Feature**: "Daten exportieren" in Einstellungen

**Geplante Funktionalität**:
1. Sammelt alle Daten des Users:
   - Entscheidungen
   - Board-Karten
   - Einstellungen
   - Account-Info (ohne Passwort)
2. Konvertiert zu JSON
3. Erstellt Datei: `vayze_export_[DATUM].json`
4. Optionen:
   - Speichern in Downloads-Ordner
   - Teilen via Share-Sheet (E-Mail, Cloud, etc.)

**Format**:
```json
{
  "exportDate": "2025-12-18T10:30:00.000Z",
  "appVersion": "1.3.0",
  "user": {
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-12-01T08:00:00.000Z"
  },
  "decisions": [
    { ... },
    { ... }
  ],
  "cards": [
    { ... },
    { ... }
  ],
  "settings": {
    "darkMode": false,
    "notifications": true,
    "analytics": false
  }
}
```

### 8.5 Daten-Import (geplant)

**Feature**: "Daten importieren" in Einstellungen

**Funktionalität**:
1. Auswahl einer Export-Datei (JSON)
2. Validierung des Formats
3. Optionen:
   - "Zusammenführen" (fügt neue Daten hinzu)
   - "Überschreiben" (ersetzt alle Daten)
4. Import durchführen
5. Alert "Erfolg: X Entscheidungen, Y Karten importiert"

### 8.6 Automatisches Speichern

**Wann wird gespeichert?**:

**Entscheidungsassistent**:
- Bei jeder Eingabe (wenn ≥10 Zeichen)
- Bei jeder Antwort-Auswahl
- Bei Schritt-Wechsel

**Kanban Board**:
- Bei Karten-Erstellung
- Bei Karten-Bearbeitung
- Bei Karten-Löschung
- Bei Karten-Verschiebung

**Einstellungen**:
- Bei Toggle-Änderung
- Bei Name-Änderung
- Bei Passwort-Änderung

**Mechanismus**:
```javascript
// Debounced Auto-Save (verhindert zu viele Schreibvorgänge)
const debouncedSave = debounce(async (data) => {
  try {
    await AsyncStorage.setItem('key', JSON.stringify(data));
  } catch (error) {
    console.error('Auto-save error:', error);
  }
}, 500); // 500ms Verzögerung

// Bei jeder Änderung aufrufen
debouncedSave(decisionData);
```

---

## 9. UI/UX Features

### 9.1 Tab-Bar Navigation

**Position**: Unten, fixiert (80px Höhe)

**Tabs** (5):
1. 🧠 Assistent
2. 📋 Board
3. 📊 Tracker
4. ↗ Teilen
5. ⚙ Settings

**Design**:
- Hintergrund: Weiß (#ffffff)
- Border-Top: 1px grau (#e5e7eb)
- Aktiver Tab:
  - Icon: 26px, blau (#3b82f6)
  - Label: Blau, fett
- Inaktiver Tab:
  - Icon: 24px, grau (#9ca3af)
  - Label: Grau

**Interaktion**:
- Tap → Wechselt Screen
- Smooth Transition (Animation)

### 9.2 Modals

**Verwendung**:
- Karte erstellen/bearbeiten
- Account-Löschung
- Passwort ändern
- Alle Daten löschen

**Design**:
- Fullscreen-Overlay (halbtransparent schwarz, Opacity 0.5)
- Weiße Card (zentriert, 90% Breite, max. 500px)
- Abgerundete Ecken (16px)
- Schatten (stark)
- Padding: 24px

**Struktur**:
- Titel oben (fett, 20px)
- Content-Bereich (scrollbar bei viel Inhalt)
- Buttons unten (Abbrechen links grau, Aktion rechts blau/rot)

**Animationen**:
- Einblenden: Fade-in + Scale-up
- Ausblenden: Fade-out + Scale-down
- Dauer: 200ms

### 9.3 Alerts

**System**: React Native Alert API

**Typen**:

**1. Info-Alert**:
- Titel: "Information"
- Button: "OK"
- Beispiel: "Version v1.0.0"

**2. Erfolgs-Alert**:
- Titel: "Erfolg"
- Text: "Aktion erfolgreich"
- Button: "OK"

**3. Fehler-Alert**:
- Titel: "Fehler"
- Text: "Beschreibung des Fehlers"
- Button: "OK"

**4. Bestätigungs-Alert**:
- Titel: "Bist du sicher?"
- Text: "Diese Aktion kann nicht rückgängig gemacht werden"
- Buttons: "Abbrechen" (cancel style) | "Bestätigen" (destructive style)

**Plattform-spezifisch**:
- iOS: Native iOS Alert-Dialog
- Android: Native Android Alert-Dialog

### 9.4 Buttons

**Typen**:

**1. Primary Button** (Haupt-Aktion):
- Hintergrund: Blau (#3b82f6)
- Text: Weiß, fett
- Padding: 16px vertikal, 24px horizontal
- Abgerundet: 12px
- Schatten: Leicht
- Hover/Press: Dunkler blau (#2563eb)

**2. Secondary Button**:
- Hintergrund: Grau (#f3f4f6)
- Text: Schwarz, fett
- Rest gleich wie Primary

**3. Danger Button** (Löschen, Abmelden):
- Hintergrund: Rot (#ef4444)
- Text: Weiß, fett
- Hover/Press: Dunkler rot (#dc2626)

**4. Text Button** (Links):
- Kein Hintergrund
- Text: Blau, unterstrichen
- Hover/Press: Dunkler blau

**5. Icon Button**:
- Nur Icon, kein Text
- Rund oder quadratisch
- Beispiel: 3-Dots-Menu, Filter-Button

**States**:
- **Normal**: Standard-Style
- **Hover** (Web): Leicht dunkler
- **Pressed**: Scale-down 0.95 (Animation)
- **Disabled**: Grauer Hintergrund, grauer Text, nicht klickbar

### 9.5 Inputs

**Text-Input**:
- Border: 1px grau (#e5e7eb)
- Fokus-Border: 2px blau (#3b82f6)
- Padding: 12px
- Abgerundet: 8px
- Placeholder: Grau (#9ca3af)

**Textarea**:
- Gleich wie Text-Input
- Höhe: 4-8 Zeilen (variabel)
- Scrollbar: Wenn Inhalt länger

**Toggle-Switch**:
- Aktiv: Blau (#3b82f6)
- Inaktiv: Grau (#e5e7eb)
- Animation: Smooth Slide

**Dropdown/Select**:
- Border: 1px grau
- Pfeil-Icon rechts
- Klick: Öffnet native Picker

**Radio-Buttons**:
- Kreis mit innerer Füllung
- Aktiv: Blauer Kreis
- Inaktiv: Grauer Kreis

**Checkboxes**:
- Quadrat mit Häkchen
- Aktiv: Blau mit weißem Häkchen
- Inaktiv: Grau leer

### 9.6 Typography

**Schriftart**: System-Standard (San Francisco auf iOS, Roboto auf Android)

**Größen**:
- **Titel**: 24px, fett
- **Untertitel**: 18px, fett
- **Überschrift**: 16px, fett
- **Body**: 14px, normal
- **Caption**: 12px, normal
- **Label**: 12px, fett, Großbuchstaben

**Farben**:
- **Primär**: Schwarz (#000000)
- **Sekundär**: Grau (#64748b)
- **Akzent**: Blau (#3b82f6)
- **Fehler**: Rot (#ef4444)
- **Erfolg**: Grün (#10b981)

### 9.7 Colors

**Primär-Palette**:
- Blau: #3b82f6 (Buttons, Links, Akzente)
- Hellblau: #dbeafe (Hintergründe, Boxen)
- Dunkelblau: #1e40af (Hover-States)

**Grau-Palette**:
- Hellgrau: #f3f4f6 (Hintergründe)
- Grau: #9ca3af (Text sekundär, Borders)
- Dunkelgrau: #1f2937 (Text primär, Buttons)

**Semantische Farben**:
- Erfolg: #10b981 (Grün)
- Warnung: #f59e0b (Orange)
- Fehler: #ef4444 (Rot)
- Info: #3b82f6 (Blau)

**Hintergründe**:
- Screen: #ffffff (Weiß)
- Card: #ffffff (Weiß)
- Overlay: rgba(0, 0, 0, 0.5) (Halbtransparent schwarz)

### 9.8 Spacing

**Padding/Margin**:
- XS: 4px
- S: 8px
- M: 12px
- L: 16px
- XL: 20px
- XXL: 24px

**Grid**:
- 4px-Basis-Einheit
- Alle Abstände sind Vielfache von 4px

### 9.9 Animationen

**Übergänge**:
- Tab-Wechsel: Fade 200ms
- Modal-Öffnen: Fade + Scale 200ms
- Button-Press: Scale 100ms
- Toggle-Switch: Slide 200ms

**Easing**:
- Ease-in-out für alle Animationen

**Performance**:
- Hardware-Beschleunigung aktiviert
- 60fps angestrebt

---

## 10. Technische Features

### 10.1 Offline-Funktionalität

**Vollständig offline**:
- Entscheidungsassistent
- Kanban Board
- Tracker & Kalender
- Einstellungen
- Alle Berechnungen

**Internet erforderlich**:
- Login (erstmaliger Zugriff)
- Registrierung
- Passwort-Reset (E-Mail-Versand)

**Synchronisation**:
- Derzeit: Keine (alles lokal)
- Geplant: Optional verschlüsseltes Cloud-Backup

### 10.2 Plattformen

**Unterstützt**:
- iOS: ab iOS 13.0
- Android: ab Android 6.0 (API Level 23)

**Build**:
- Expo EAS Build
- App-IDs:
  - iOS: com.vayze.app
  - Android: com.vayze.app

**Stores**:
- Apple App Store
- Google Play Store

### 10.3 Performance

**Optimierungen**:

**React-Memoization**:
```javascript
const MemoizedComponent = React.memo(Component);
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => { doSomething(a, b); }, [a, b]);
```

**Lazy Loading**:
- Modals werden nur bei Bedarf gerendert
- Tab-Content wird lazy geladen

**Debouncing**:
- Auto-Save (500ms)
- Suche (300ms)

**Image Optimization**:
- SVG für Icons
- PNG für App-Icons (verschiedene Größen)
- Lazy Loading für Bilder

### 10.4 Sicherheit

**Passwort-Sicherheit**:
- Hashing mit expo-crypto
- Niemals Klartext-Speicherung
- Secure Comparison (Timing-Attack-Schutz)

**Session-Sicherheit**:
- Verschlüsselte Tokens
- 365 Tage Ablauf
- Automatisches Logout

**Data Isolation**:
- User-scoped Storage
- Keine Cross-Account-Zugriffe

**Keine externen Dienste**:
- Kein Tracking
- Keine Analytics (außer Opt-in)
- Keine Drittanbieter

### 10.5 Error Handling

**Try-Catch**:
```javascript
try {
  await AsyncStorage.setItem('key', value);
} catch (error) {
  if (__DEV__) console.error('Error:', error);
  Alert.alert('Fehler', 'Speichern fehlgeschlagen');
}
```

**User-Feedback**:
- Fehler werden als Alerts angezeigt
- Freundliche Fehlermeldungen

**Logging**:
- Nur in Development Mode (__DEV__)
- Keine Logs in Production

### 10.6 App-Konfiguration

**app.json**:
- App-Name: "Vayze"
- Version: "1.3.0"
- Orientation: Portrait
- Bundle-IDs: com.vayze.app
- Icons, Splash-Screen

**package.json**:
- React Native: 0.81.5
- Expo: ~54.0
- Dependencies: siehe Liste oben

---

**Dokumentation Ende**

**Version**: 1.3.0
**Stand**: 18. Dezember 2025
**Umfang**: 100+ Seiten, 13.000+ Wörter
**Erstellt für**: Vayze Entscheidungs-Assistent

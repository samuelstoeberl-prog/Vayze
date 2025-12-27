# Vayze - Funktionsübersicht

## 🧠 Decision Assistant (Hauptfunktion)

### Vollständiger Modus (6 Schritte)
1. **Deine erste Intuition** 🎯
   - Spontanes Bauchgefühl erfassen
   - 5-Stufen-Skala (Stark dafür bis Stark dagegen)

2. **Was steht auf dem Spiel?** ⚖️
   - Freitext: Was könnte verloren gehen?
   - Follow-up: Risikobewertung (Sehr niedrig bis Sehr hoch)

3. **Kannst du zurück?** ↩️
   - Freitext: Reversibilität analysieren
   - Follow-up: Rückgängig-Machbarkeit (Vollständig bis Irreversibel)

4. **Zeitperspektive** 🔮
   - Freitext: Langfristige Sicht
   - Follow-up: Nutzen-Bewertung (Ja eindeutig bis Nein)

5. **Äußere Einflüsse** 🎭
   - Freitext: Externe Faktoren identifizieren
   - Follow-up: Objektivität einschätzen (Ja definitiv bis Nein)

6. **Rat an einen Freund** 💭
   - Freitext: Perspektivwechsel
   - Follow-up: Empfehlung (Klar dafür bis Klar dagegen)

### Quick Mode (2 Schritte)
1. **Bauchgefühl & Konsequenz** ⚡
   - 3 Optionen: Fühlt sich richtig/unsicher/falsch an
   - Follow-up: Schlimmste Konsequenz beschreiben

2. **Zeitperspektive** 🔮
   - Wichtigkeit in einem Jahr
   - Follow-up: Reue-Analyse (TUST vs. NICHT TUST)

### Ergebnis-Features
- **Konfidenz-Score**: Prozentuale Empfehlung (0-100%)
- **Empfehlung**: JA / NEIN / UNENTSCHIEDEN
- **Kategorisierung**: Leben, Arbeit, Finanzen, Beziehung, Gesundheit, Projekte
- **Journal**: Persönliche Reflexion speichern
- **Favoriten**: Wichtige Entscheidungen markieren
- **Speichern**: Automatisch im Tracker gespeichert

### Zusatzfunktionen
- **Fortsetzen**: Angefangene Analysen wiederherstellen
- **Modus-Wahl**: Zwischen Vollständig und Quick wechseln
- **Multi-Kategorien**: Mehrere Kategorien gleichzeitig wählbar

---

## 📋 Kanban Board

### Board-Struktur
**3 Spalten**:
1. **To Do** (todo) - Geplante Entscheidungen/Aufgaben
2. **In Progress** (in_progress) - Aktiv bearbeitete Items
3. **Done** (done) - Abgeschlossene Items

### Card-Typen
- **Task** ✓ - Einfache Aufgabe
- **Decision** 🎯 - Entscheidungs-Card (mit Assistenten-Integration)
- **Idea** 💡 - Idee oder Konzept
- **Note** 📝 - Notiz oder Merkzettel

### Prioritäten
- **Low** (Grün) - Niedrige Priorität
- **Medium** (Orange) - Mittlere Priorität
- **High** (Orange-Rot) - Hohe Priorität
- **Urgent** (Rot) - Dringend

### Drag & Drop Funktion
- **Long Press (500ms)**: Aktiviert Drag-Modus
- **Drag Left/Right**: Card in benachbarte Spalte ziehen
- **Visual Feedback**:
  - Schatten und Skalierung während Drag
  - Richtungs-Indikatoren (← To Do / In Progress →)
  - "Ziehen" Badge oben rechts
- **Auto-Reset**: Springt zurück wenn nicht weit genug gezogen
- **Threshold**: 60px Mindest-Swipe-Distanz

### Card-Details
**Kompakt-Ansicht zeigt**:
- Type Icon & Priorität
- Titel (max. 2 Zeilen)
- Due Date (nur wenn ≤3 Tage oder überfällig)
- Extras-Indikator (•••) wenn Checklist/Comments/Attachments vorhanden
- Quick Actions (Move-Buttons)
- **Decision Button**: "🎯 Entscheidung treffen" (nur bei Decision-Cards)

**Detail-Modal zeigt**:
- Vollständige Beschreibung
- Checklist mit Fortschrittsbalken
- Kommentare mit Timestamps
- Attachments
- Edit-Funktionen
- Status-Änderung
- Priorität-Änderung
- Löschen-Funktion

### Quick Actions
- **From To Do**:
  - ⚡ → In Progress
  - ✓ → Done
- **From In Progress**:
  - ✓ → Done
- **From Done**: Keine Actions

### Card-Styling
**Type-basierte Visualisierung**:
- **Decision**: Blauer linker Border (3px solid)
- **Task**: Neutraler grauer Border
- **Idea**: Lila gestrichelter Border
- **Note**: Gelber Hintergrund + gelber Border

### Filter & Ansicht
- **Total Cards**: Gesamtanzahl aller Cards
- **Spalten-basierte Organisation**: Automatische Gruppierung
- **Scroll-Support**: Vertikales Scrollen in jeder Spalte

### Board ↔ Assistant Integration
**Decision-Cards**:
- Button "🎯 Entscheidung treffen" → öffnet Decision Assistant
- Card-Titel wird als Entscheidung übernommen
- Nach Analyse wird Ergebnis zur Card hinzugefügt

---

## 📊 Tracker Tab

### Statistiken
- **Entscheidungen Total**: Anzahl aller getroffenen Entscheidungen
- **Streak 🔥**: Anzahl aufeinanderfolgender Tage mit Entscheidungen

### Kalender-Ansicht
- **Monatsansicht**: Aktueller Monat mit allen Tagen
- **Monats-Navigation**: ← / → Buttons zum Wechseln
- **Aktive Tage**: Grün markiert wenn Entscheidung getroffen
- **Leere Tage**: Grau/neutral

---

## 👥 Teilen Tab
- **App teilen**: Share-Funktion für Social Media
- **Info-Box**: Motivationstext über Vayze

---

## ⚙ Settings Tab

### Personalisierung
- **Dark Mode** (Toggle)
- **Notifications** (Toggle)
- **Analytics** (Toggle)

### Über
- **Tipps für die Nutzung**
- **FAQ**
- **Kontakt**: Email-Client öffnen für Feedback
- **Teilen-Funktion**
- **Version**: v1.0.0

### Daten
- **Daten exportieren**: JSON-Export (Hinweis)
- **Alle Daten löschen**: Unwiderruflich löschen

### Konto
- **Angemeldet als**: Zeigt Benutzer-Name/Email
- **Abmelden**: Mit Bestätigungs-Dialog

---

## 🎨 Onboarding Flow (6 Screens)

1. **Mirror** - "Du bist nicht schlecht in Entscheidungen"
2. **Transformation** - "Stell dir vor, mit Sicherheit zu entscheiden"
3. **Proof** - "Sieh es in Aktion" (Animierte Demo)
4. **Identity** - "Du, aber sicherer"
5. **Gateway** - Account-Erstellung (Name, Email, Passwort)
6. **Personalization** - 3-Fragen-Survey:
   - Welche Art von Entscheidungen?
   - Wie gehst du damit um?
   - Was zählt am meisten?

---

## 🔐 Authentifizierung
- **Email/Password Sign-Up**
- **Email/Password Sign-In**
- **Sichere Speicherung** (expo-secure-store)
- **Session Management**
- **Passwort anzeigen/verbergen**

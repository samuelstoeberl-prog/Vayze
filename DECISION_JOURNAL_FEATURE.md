# Decision Journal Feature - Dokumentation

## 🎯 Übersicht

Das **Decision Journal** ist ein Bindungs-Feature, das nach jeder Entscheidung einen optionalen Tagebuch-Eintrag ermöglicht. Es nutzt geführte Reflection-Fragen, Medien-Anhänge und Gamification (Streaks), um emotionale Bindung zu schaffen.

---

## 📦 Feature-Komponenten

### 1. **Model: DecisionJournal**
**Datei:** `models/DecisionJournal.js`

**Kern-Funktionen:**
- Journal-Einträge mit 3 Reflection-Prompts
- Medien-Attachments (Fotos & Voice Memos)
- Free Tier Limits (3 Einträge/Monat)
- Streak-Berechnung
- Statistiken und Achievements

**Reflection Prompts:**
```javascript
{
  decisiveFactor: "Was war der entscheidende Faktor?",
  emotionalState: "Welches Gefühl überwiegt jetzt?",
  messageToFuture: "Was würdest du deinem zukünftigen Ich sagen?"
}
```

---

### 2. **Store: journalStore**
**Datei:** `store/journalStore.js`

**State Management:**
- CRUD Operations für Journal-Einträge
- Streak-Tracking (current, longest)
- Free Tier Limits enforcement
- Analytics Integration
- Export/Import Funktionen

**Wichtige Methoden:**
```javascript
addJournal(journalData, isPremium)  // Erstellt neuen Eintrag
canCreateEntry(isPremium)            // Prüft Free Tier Limits
getStats()                           // Liefert Statistiken
getStreakStatus()                    // Status der aktuellen Streak
checkAchievements()                  // Prüft erreichte Milestones
```

---

### 3. **Components**

#### **JournalEntry**
**Datei:** `components/Journal/JournalEntry.js`

Geführter Eintrag mit 3 Steps:
- Step 1: Entscheidender Faktor 🎯
- Step 2: Emotionaler Zustand 💭
- Step 3: Nachricht an zukünftiges Ich 💌

**Features:**
- Fade-in Animationen bei Step-Wechsel
- Beispiele zum Inspirieren
- Optionale zusätzliche Notizen
- Character Counter
- Progress Bar

#### **MediaAttachments**
**Datei:** `components/Journal/MediaAttachments.js`

**Unterstützt:**
- Bis zu 5 Fotos (aus Galerie oder Kamera)
- Voice Memo Recording mit Duration Counter
- Photo Preview & Deletion
- Permission Handling

#### **JournalHistory**
**Datei:** `components/Journal/JournalHistory.js`

**Features:**
- Timeline-View gruppiert nach Datum
- Filter: Alle / Woche / Monat
- Stats-Cards (Einträge, Current Streak, Longest Streak, Wörter)
- Detail-Modal für volle Ansicht
- Media-Anzeige (Fotos & Voice Memos)

#### **JournalPrompt**
**Datei:** `components/Journal/JournalPrompt.js`

Post-Decision Prompt, der nach Abschluss einer Entscheidung erscheint:
- Zeigt Benefits des Journals
- Free Tier Limit Warnung
- "Jetzt nicht"-Option
- Direkter Übergang zu JournalEntry

#### **StreakWidget**
**Datei:** `components/Journal/StreakWidget.js`

**Gamification:**
- Aktuelle Streak mit Puls-Animation
- Progress Bar zu 30-Tage-Ziel
- Status Messages (active, at_risk, broken)
- Motivational Messages
- Milestone Celebrations (3, 7, 14, 21, 30, 60, 90, 100 Tage)

**StreakCelebration Component:**
Automatische Pop-up bei Milestone-Erreichen mit Animation

---

## 🚀 Integration Guide

### 1. **Nach einer Entscheidung:**

```javascript
import { JournalPrompt } from './components/Journal/JournalPrompt';
import { useJournalStore } from './store/journalStore';

function DecisionResultScreen() {
  const [showJournalPrompt, setShowJournalPrompt] = useState(true);
  const { addJournal } = useJournalStore();

  const handleJournalComplete = (journalData) => {
    console.log('Journal saved:', journalData);
    setShowJournalPrompt(false);
    // Optional: Show streak celebration
  };

  return (
    <View>
      {/* Decision Result UI */}

      <JournalPrompt
        decision={completedDecision}
        visible={showJournalPrompt}
        onClose={() => setShowJournalPrompt(false)}
        onComplete={handleJournalComplete}
      />
    </View>
  );
}
```

---

### 2. **Dashboard Integration:**

```javascript
import StreakWidget from './components/Journal/StreakWidget';
import JournalHistory from './components/Journal/JournalHistory';

function DashboardScreen() {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <ScrollView>
      <StreakWidget onPress={() => setShowHistory(true)} />

      {/* Other Dashboard Content */}

      {showHistory && (
        <JournalHistory onClose={() => setShowHistory(false)} />
      )}
    </ScrollView>
  );
}
```

---

### 3. **Store Initialization:**

```javascript
import { useJournalStore } from './store/journalStore';
import { useAuthContext } from './contexts/AuthContext';

function App() {
  const { user } = useAuthContext();
  const { setCurrentUser, loadJournals } = useJournalStore();

  useEffect(() => {
    if (user) {
      setCurrentUser(user.uid);
    }
  }, [user]);

  return <NavigationContainer>{/* ... */}</NavigationContainer>;
}
```

---

## 💎 Free vs Premium

### FREE Tier:
- **3 Journal-Einträge pro Monat**
- Alle Reflection-Prompts
- Foto-Anhänge (max 5 pro Eintrag)
- Voice Memos
- Streak-Tracking
- Journal History

### PREMIUM Tier:
- **Unbegrenzte Journal-Einträge**
- Alle FREE Features
- Erweiterte Statistiken
- Export-Funktionen
- Priority Support

**Upgrade-Trigger:**
- Bei Erreichen des Monthly Limits
- In JournalPrompt Komponente
- Im Dashboard (Streak Widget)

---

## 🎮 Gamification Elemente

### Streaks:
- **Current Streak**: Anzahl aufeinanderfolgender Tage mit Einträgen
- **Longest Streak**: Persönlicher Rekord
- **Status**: active, at_risk, broken

### Milestones:
| Streak | Icon | Title | Belohnung |
|--------|------|-------|-----------|
| 3 Tage | 🎯 | 3-Tage-Streak | Motivational Message |
| 7 Tage | 🔥 | 7-Tage-Streak | Celebration Pop-up |
| 14 Tage | ⭐ | 14-Tage-Streak | Achievement Badge |
| 21 Tage | 💎 | 21-Tage-Streak | Gewohnheits-Nachricht |
| 30 Tage | 🏆 | 30-TAGE-STREAK | Großes Celebration |
| 60 Tage | 👑 | 60-Tage-Streak | Premium Status |
| 90 Tage | 🌟 | 90-Tage-Streak | Champion Badge |
| 100 Tage | 💯 | 100-TAGE-STREAK | Legende Status |

### Achievements:
```javascript
const achievements = [
  { id: 'streak_7', title: '7-Tage Streak 🔥' },
  { id: 'streak_30', title: '30-Tage Streak 🔥🔥' },
  { id: 'entries_10', title: '10 Einträge ✍️' },
  { id: 'entries_50', title: '50 Einträge ✍️✍️' },
  { id: 'words_1000', title: '1000 Wörter 📝' }
];
```

---

## 📊 Analytics Events

```javascript
// Journal erstellt
logEvent('journal_entry_created', {
  decisionId,
  wordCount,
  hasPhotos,
  hasVoiceMemo,
  completionPercentage
});

// Journal gelöscht
logEvent('journal_entry_deleted', { journalId });

// Streak Milestone
logEvent('streak_milestone', { days: 30 });

// Free Limit erreicht
logEvent('free_tier_limit_reached', { month, year });
```

---

## 🔧 Dependencies

Stelle sicher, dass folgende Packages installiert sind:

```bash
npm install expo-image-picker
npm install expo-av
npm install zustand
npm install @react-native-async-storage/async-storage
```

---

## 💡 UX Best Practices

### Wann Journal-Prompt zeigen?
✅ **Zeige den Prompt:**
- Nach jeder abgeschlossenen Entscheidung
- Bei wichtigen Decisions (high confidence score)
- Wenn User bisher gut engaged ist

❌ **Zeige NICHT:**
- Bei "Quick Mode" Decisions
- Wenn User bereits 3x hintereinander "Jetzt nicht" geklickt hat
- Bei sehr niedrigen Entscheidungen (trivial)

### Retention Tipps:
1. **Daily Reminder**: Push Notification wenn Streak at risk
2. **Weekly Summary**: Email mit Journal-Highlights
3. **Month Recap**: Review der besten Einträge
4. **Anniversary**: "Vor 1 Jahr hast du entschieden..."

---

## 🎨 Customization

### Farben anpassen:
```javascript
// In styles
const THEME_COLORS = {
  primary: '#3b82f6',      // Blau
  success: '#10b981',      // Grün
  warning: '#f59e0b',      // Orange
  danger: '#ef4444',       // Rot
  neutral: '#6b7280'       // Grau
};
```

### Eigene Reflection Prompts:
```javascript
export const CUSTOM_PROMPTS = {
  businessDecision: {
    question: 'Welche Business-Metrik war entscheidend?',
    icon: '💼'
  },
  personalGrowth: {
    question: 'Was hast du über dich gelernt?',
    icon: '🌱'
  }
};
```

---

## 🐛 Troubleshooting

### Problem: Streaks werden nicht richtig gezählt
**Lösung:** Prüfe Timezone-Handling in `calculateJournalStreak()`

### Problem: Media Permissions fehlen
**Lösung:** Füge zu `app.json` hinzu:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "Die App benötigt Zugriff auf deine Fotos"
        }
      ],
      [
        "expo-av",
        {
          "microphonePermission": "Die App benötigt Zugriff auf dein Mikrofon"
        }
      ]
    ]
  }
}
```

### Problem: Free Tier Limits greifen nicht
**Lösung:** Prüfe `canCreateJournalEntry()` in `journalStore.js`

---

## 🚀 Next Steps

### Mögliche Erweiterungen:
1. **AI-gestützte Insights**: "Du entscheidest oft emotional bei Career-Decisions"
2. **Sharing**: "Teile deinen Journal-Eintrag anonym mit der Community"
3. **Templates**: Vordefinierte Prompt-Sets für verschiedene Decision-Types
4. **Voice-to-Text**: Automatische Transkription von Voice Memos
5. **Calendar Integration**: "Vor 3 Monaten hast du entschieden..."
6. **Mood Tracking**: Grafische Darstellung emotionaler Zustände über Zeit

---

## 📝 Checkliste für Launch

- [ ] Alle Components erstellt
- [ ] Store integriert und getestet
- [ ] Analytics Events hinzugefügt
- [ ] Free Tier Limits funktionieren
- [ ] Media Permissions konfiguriert
- [ ] Streak-Berechnung getestet
- [ ] UI/UX Review durchgeführt
- [ ] Performance-Test (>100 Journals)
- [ ] Offline-Support implementiert
- [ ] Export-Funktion getestet
- [ ] Premium-Upgrade Flow integriert
- [ ] Push Notifications für Streak-Reminders

---

## 📞 Support

Bei Fragen oder Problemen:
- GitHub Issues: [Link]
- Discord: [Link]
- Email: support@yourapp.com

**Happy Journaling! 📓✨**

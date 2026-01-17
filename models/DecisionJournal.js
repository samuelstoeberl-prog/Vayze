export class DecisionJournal {
  constructor(data = {}) {
    this.id = data.id || this._generateId();
    this.decisionId = data.decisionId;
    this.userId = data.userId;
    this.entryDate = data.entryDate || new Date().toISOString();

    // Reflection Prompts Antworten
    this.decisiveFactor = data.decisiveFactor || ''; // "Was war der entscheidende Faktor?"
    this.emotionalState = data.emotionalState || ''; // "Welches Gefühl überwiegt jetzt?"
    this.messageToFuture = data.messageToFuture || ''; // "Was würdest du deinem zukünftigen Ich sagen?"

    // Optionale zusätzliche Notizen
    this.additionalNotes = data.additionalNotes || '';

    // Media Attachments
    this.photoUris = data.photoUris || []; // Array von Foto-URIs
    this.voiceMemoUri = data.voiceMemoUri || null; // Voice Memo URI
    this.voiceMemoDuration = data.voiceMemoDuration || null; // Dauer in Sekunden

    // Metadata
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.wordCount = data.wordCount || this._calculateWordCount();
  }

  isValid() {
    return (
      this.decisionId &&
      this.userId &&
      (this.decisiveFactor.trim().length > 0 ||
       this.emotionalState.trim().length > 0 ||
       this.messageToFuture.trim().length > 0)
    );
  }

  toJSON() {
    return {
      id: this.id,
      decisionId: this.decisionId,
      userId: this.userId,
      entryDate: this.entryDate,
      decisiveFactor: this.decisiveFactor,
      emotionalState: this.emotionalState,
      messageToFuture: this.messageToFuture,
      additionalNotes: this.additionalNotes,
      photoUris: this.photoUris,
      voiceMemoUri: this.voiceMemoUri,
      voiceMemoDuration: this.voiceMemoDuration,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      wordCount: this.wordCount
    };
  }

  static fromJSON(data) {
    return new DecisionJournal(data);
  }

  hasMediaAttachments() {
    return this.photoUris.length > 0 || this.voiceMemoUri !== null;
  }

  getCompletionPercentage() {
    let completed = 0;
    let total = 3;

    if (this.decisiveFactor.trim().length > 0) completed++;
    if (this.emotionalState.trim().length > 0) completed++;
    if (this.messageToFuture.trim().length > 0) completed++;

    return Math.round((completed / total) * 100);
  }

  getSummary() {
    const parts = [];

    if (this.decisiveFactor) {
      parts.push(`Faktor: ${this.decisiveFactor.substring(0, 50)}${this.decisiveFactor.length > 50 ? '...' : ''}`);
    }

    if (this.emotionalState) {
      parts.push(`Gefühl: ${this.emotionalState.substring(0, 50)}${this.emotionalState.length > 50 ? '...' : ''}`);
    }

    return parts.join(' | ') || 'Keine Einträge';
  }

  _calculateWordCount() {
    const allText = [
      this.decisiveFactor,
      this.emotionalState,
      this.messageToFuture,
      this.additionalNotes
    ].join(' ');

    return allText.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  _generateId() {
    return `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Reflection Prompt Templates
export const REFLECTION_PROMPTS = {
  decisiveFactor: {
    question: 'Was war der entscheidende Faktor?',
    placeholder: 'z.B. "Das Bauchgefühl hat den Ausschlag gegeben" oder "Die Pro/Contra-Liste war eindeutig"',
    icon: '🎯',
    examples: [
      'Mein Bauchgefühl',
      'Rationale Abwägung',
      'Zeitdruck',
      'Empfehlung von anderen',
      'Finanzielle Überlegungen'
    ]
  },
  emotionalState: {
    question: 'Welches Gefühl überwiegt jetzt?',
    placeholder: 'z.B. "Erleichtert", "Unsicher", "Aufgeregt"',
    icon: '💭',
    examples: [
      'Erleichtert',
      'Unsicher',
      'Aufgeregt',
      'Zuversichtlich',
      'Nervös',
      'Friedlich'
    ]
  },
  messageToFuture: {
    question: 'Was würdest du deinem zukünftigen Ich sagen?',
    placeholder: 'z.B. "Vertraue auf diese Entscheidung, du hast gut überlegt"',
    icon: '💌',
    examples: [
      'Vertraue auf diese Entscheidung',
      'Es war der richtige Zeitpunkt',
      'Sei stolz auf deinen Mut',
      'Du hast alle Faktoren bedacht'
    ]
  }
};

// Helper Functions
export function calculateJournalStreak(journals) {
  if (!journals || journals.length === 0) return 0;

  // Sortiere nach Datum absteigend
  const sortedJournals = [...journals].sort((a, b) =>
    new Date(b.entryDate) - new Date(a.entryDate)
  );

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const journal of sortedJournals) {
    const journalDate = new Date(journal.entryDate);
    journalDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((currentDate - journalDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (daysDiff > streak) {
      break;
    }
  }

  return streak;
}

export function getJournalStats(journals) {
  if (!journals || journals.length === 0) {
    return {
      totalEntries: 0,
      totalWords: 0,
      averageWords: 0,
      entriesWithMedia: 0,
      currentStreak: 0,
      longestStreak: 0
    };
  }

  const totalWords = journals.reduce((sum, j) => sum + (j.wordCount || 0), 0);
  const entriesWithMedia = journals.filter(j =>
    j.photoUris?.length > 0 || j.voiceMemoUri
  ).length;

  return {
    totalEntries: journals.length,
    totalWords,
    averageWords: Math.round(totalWords / journals.length),
    entriesWithMedia,
    currentStreak: calculateJournalStreak(journals),
    longestStreak: calculateLongestStreak(journals)
  };
}

function calculateLongestStreak(journals) {
  if (!journals || journals.length === 0) return 0;

  const sortedJournals = [...journals].sort((a, b) =>
    new Date(a.entryDate) - new Date(b.entryDate)
  );

  let longestStreak = 0;
  let currentStreak = 1;

  for (let i = 1; i < sortedJournals.length; i++) {
    const prevDate = new Date(sortedJournals[i - 1].entryDate);
    const currentDate = new Date(sortedJournals[i].entryDate);

    prevDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (daysDiff > 1) {
      currentStreak = 1;
    }
  }

  return Math.max(longestStreak, 1);
}

// Free Tier Limits
export function canCreateJournalEntry(journals, isPremium) {
  if (isPremium) return { allowed: true };

  // Prüfe Einträge im aktuellen Monat
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const entriesThisMonth = journals.filter(j => {
    const entryDate = new Date(j.entryDate);
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
  });

  const FREE_TIER_LIMIT = 3;
  const remaining = FREE_TIER_LIMIT - entriesThisMonth.length;

  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    limit: FREE_TIER_LIMIT,
    entriesThisMonth: entriesThisMonth.length
  };
}

export function getMonthlyJournalCount(journals, month = new Date().getMonth(), year = new Date().getFullYear()) {
  if (!journals || journals.length === 0) return 0;

  return journals.filter(j => {
    const entryDate = new Date(j.entryDate);
    return entryDate.getMonth() === month && entryDate.getFullYear() === year;
  }).length;
}

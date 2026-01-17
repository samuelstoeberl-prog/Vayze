import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DecisionJournal, canCreateJournalEntry, getJournalStats, calculateJournalStreak } from '../models/DecisionJournal';
import { logEvent as logAnalyticsEvent } from '../utils/analytics';

const JOURNALS_KEY = 'decision_journals';
const STREAKS_KEY = 'journal_streaks';

const getUserKey = (userId, key) => {
  if (!userId) return key;
  return `user_${userId}_${key}`;
};

export const useJournalStore = create((set, get) => ({
  currentUserId: null,
  journals: [],
  streaks: {
    current: 0,
    longest: 0,
    lastEntryDate: null
  },
  isLoading: false,
  error: null,

  // User Management
  setCurrentUser: async (userId) => {
    set({ currentUserId: userId, isLoading: true });
    await get().loadJournals(userId);
    get().updateStreaks();
    set({ isLoading: false });
  },

  clearCurrentUser: () => {
    set({
      currentUserId: null,
      journals: [],
      streaks: {
        current: 0,
        longest: 0,
        lastEntryDate: null
      }
    });
  },

  // Journal CRUD Operations
  addJournal: async (journalData, isPremium = false) => {
    const { journals, currentUserId } = get();

    // Check Free Tier Limits
    const tierCheck = canCreateJournalEntry(journals, isPremium);
    if (!tierCheck.allowed) {
      set({
        error: `FREE Limit erreicht: ${tierCheck.entriesThisMonth}/${tierCheck.limit} Einträge diesen Monat. Upgrade für unbegrenzte Einträge!`
      });
      return null;
    }

    const journal = new DecisionJournal({
      ...journalData,
      userId: currentUserId
    });

    if (!journal.isValid()) {
      set({ error: 'Ungültige Journal-Daten' });
      return null;
    }

    const updatedJournals = [...journals, journal.toJSON()];
    set({ journals: updatedJournals, error: null });

    await get()._saveJournals(updatedJournals);
    get().updateStreaks();

    // Analytics
    await logAnalyticsEvent('journal_entry_created', {
      decisionId: journal.decisionId,
      wordCount: journal.wordCount,
      hasPhotos: journal.photoUris.length > 0,
      hasVoiceMemo: journal.voiceMemoUri !== null,
      completionPercentage: journal.getCompletionPercentage()
    });

    return journal.toJSON();
  },

  updateJournal: async (journalId, updates) => {
    const { journals } = get();

    const updatedJournals = journals.map(j => {
      if (j.id === journalId) {
        const updated = {
          ...j,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        // Recalculate word count
        const journal = new DecisionJournal(updated);
        updated.wordCount = journal._calculateWordCount();
        return updated;
      }
      return j;
    });

    set({ journals: updatedJournals });
    await get()._saveJournals(updatedJournals);

    return updatedJournals.find(j => j.id === journalId);
  },

  deleteJournal: async (journalId) => {
    const { journals } = get();

    const updatedJournals = journals.filter(j => j.id !== journalId);
    set({ journals: updatedJournals });

    await get()._saveJournals(updatedJournals);
    get().updateStreaks();

    await logAnalyticsEvent('journal_entry_deleted', { journalId });
  },

  // Getters
  getJournalById: (id) => {
    const { journals } = get();
    return journals.find(j => j.id === id);
  },

  getJournalsByDecision: (decisionId) => {
    const { journals } = get();
    return journals.filter(j => j.decisionId === decisionId);
  },

  getJournalsByDateRange: (startDate, endDate) => {
    const { journals } = get();
    return journals.filter(j => {
      const entryDate = new Date(j.entryDate);
      return entryDate >= startDate && entryDate <= endDate;
    });
  },

  getRecentJournals: (limit = 10) => {
    const { journals } = get();
    return [...journals]
      .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate))
      .slice(0, limit);
  },

  // Stats & Streaks
  getStats: () => {
    const { journals } = get();
    return getJournalStats(journals);
  },

  updateStreaks: () => {
    const { journals } = get();
    const stats = getJournalStats(journals);

    const lastJournal = journals.length > 0
      ? [...journals].sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate))[0]
      : null;

    set({
      streaks: {
        current: stats.currentStreak,
        longest: stats.longestStreak,
        lastEntryDate: lastJournal?.entryDate || null
      }
    });
  },

  getStreakStatus: () => {
    const { streaks } = get();
    const lastEntryDate = streaks.lastEntryDate
      ? new Date(streaks.lastEntryDate)
      : null;

    if (!lastEntryDate) {
      return {
        status: 'inactive',
        message: 'Noch kein Eintrag',
        daysUntilBreak: 0
      };
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    lastEntryDate.setHours(0, 0, 0, 0);

    const daysSinceLastEntry = Math.floor((now - lastEntryDate) / (1000 * 60 * 60 * 24));

    if (daysSinceLastEntry === 0) {
      return {
        status: 'active',
        message: 'Heute bereits eingetragen! 🔥',
        daysUntilBreak: 1
      };
    } else if (daysSinceLastEntry === 1) {
      return {
        status: 'at_risk',
        message: 'Heute eintragen um Streak zu halten!',
        daysUntilBreak: 0
      };
    } else {
      return {
        status: 'broken',
        message: 'Streak unterbrochen',
        daysUntilBreak: 0
      };
    }
  },

  // Free Tier Check
  canCreateEntry: (isPremium = false) => {
    const { journals } = get();
    return canCreateJournalEntry(journals, isPremium);
  },

  getMonthlyUsage: () => {
    const { journals } = get();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const entriesThisMonth = journals.filter(j => {
      const entryDate = new Date(j.entryDate);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });

    return {
      count: entriesThisMonth.length,
      limit: 3, // FREE tier limit
      percentage: (entriesThisMonth.length / 3) * 100
    };
  },

  // Search & Filter
  searchJournals: (query) => {
    const { journals } = get();
    const lowerQuery = query.toLowerCase();

    return journals.filter(j =>
      j.decisiveFactor.toLowerCase().includes(lowerQuery) ||
      j.emotionalState.toLowerCase().includes(lowerQuery) ||
      j.messageToFuture.toLowerCase().includes(lowerQuery) ||
      j.additionalNotes.toLowerCase().includes(lowerQuery)
    );
  },

  // Storage
  loadJournals: async (userId) => {
    try {
      set({ isLoading: true, error: null });

      const userIdToLoad = userId || get().currentUserId;
      if (!userIdToLoad) {
        set({ isLoading: false });
        return;
      }

      if (userId) {
        set({ currentUserId: userId });
      }

      const journalsKey = getUserKey(userIdToLoad, JOURNALS_KEY);
      const journalsJson = await AsyncStorage.getItem(journalsKey);

      const journals = journalsJson ? JSON.parse(journalsJson) : [];
      set({ journals });

      get().updateStreaks();

    } catch (error) {
      console.error('Failed to load journals:', error);
      set({ error: 'Fehler beim Laden der Journals' });
    } finally {
      set({ isLoading: false });
    }
  },

  _saveJournals: async (journals) => {
    const { currentUserId } = get();
    const key = getUserKey(currentUserId, JOURNALS_KEY);
    await AsyncStorage.setItem(key, JSON.stringify(journals));
  },

  // Export & Import
  exportJournals: () => {
    const { journals, streaks } = get();
    return {
      journals,
      streaks,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  },

  importJournals: async (data) => {
    const { currentUserId } = get();

    if (!data.journals) {
      set({ error: 'Ungültige Import-Daten' });
      return false;
    }

    const userJournals = data.journals.filter(j => j.userId === currentUserId);

    set({ journals: userJournals });
    await get()._saveJournals(userJournals);
    get().updateStreaks();

    return true;
  },

  clearAllJournals: async () => {
    const { currentUserId } = get();

    set({
      journals: [],
      streaks: {
        current: 0,
        longest: 0,
        lastEntryDate: null
      }
    });

    const journalsKey = getUserKey(currentUserId, JOURNALS_KEY);
    await AsyncStorage.removeItem(journalsKey);
  },

  // Gamification: Achievement Check
  checkAchievements: () => {
    const { streaks, journals } = get();
    const stats = get().getStats();

    const achievements = [];

    // Streak Achievements
    if (streaks.current >= 7) {
      achievements.push({
        id: 'streak_7',
        title: '7-Tage Streak 🔥',
        description: '7 Tage in Folge eingetragen!'
      });
    }

    if (streaks.current >= 30) {
      achievements.push({
        id: 'streak_30',
        title: '30-Tage Streak 🔥🔥',
        description: '30 Tage in Folge eingetragen!'
      });
    }

    // Entry Count Achievements
    if (journals.length >= 10) {
      achievements.push({
        id: 'entries_10',
        title: '10 Einträge ✍️',
        description: '10 Journal-Einträge erstellt!'
      });
    }

    if (journals.length >= 50) {
      achievements.push({
        id: 'entries_50',
        title: '50 Einträge ✍️✍️',
        description: '50 Journal-Einträge erstellt!'
      });
    }

    // Word Count Achievements
    if (stats.totalWords >= 1000) {
      achievements.push({
        id: 'words_1000',
        title: '1000 Wörter 📝',
        description: '1000 Wörter geschrieben!'
      });
    }

    return achievements;
  }
}));

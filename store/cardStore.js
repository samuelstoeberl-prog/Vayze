/**
 * Zustand Store für Card Management
 * Zentrale State-Verwaltung mit Undo/Redo Support
 * NOW WITH USER-SCOPED STORAGE
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'decisio_cards_v2'; // Legacy global key (for migration)
const HISTORY_KEY = 'decisio_history'; // Legacy global key (for migration)
const MAX_HISTORY = 50;

// Helper to get user-scoped key
const getUserKey = (userId, key) => {
  if (!userId) return key; // Fallback to global
  return `user_${userId}_${key}`;
};

export const useCardStore = create((set, get) => ({
  // State
  cards: new Map(),
  currentUserId: null, // NEW: Track current user for scoped storage
  categories: [
    { id: 'todo', name: 'To Do', color: '#3b82f6', icon: '📋', order: 0 },
    { id: 'in_progress', name: 'In Progress', color: '#f59e0b', icon: '⚡', order: 1 },
    { id: 'done', name: 'Done', color: '#10b981', icon: '✅', order: 2 },
  ],
  filters: {
    searchQuery: '',
    categories: [],
    statuses: [],
    priorities: [],
    types: [],
    tags: [],
    showArchived: false,
    showFavorites: false,
  },
  sortBy: { field: 'updatedAt', direction: 'desc' },

  // History for Undo/Redo
  history: [],
  historyIndex: -1,

  // Loading states
  isLoading: false,
  isSyncing: false,

  // NEW: Set current user (must be called after login)
  setCurrentUser: (userId) => {
    if (__DEV__) console.log('🗂️ [cardStore] Setting current user:', userId);
    set({ currentUserId: userId });
  },

  // Actions - CRUD
  addCard: (card) => {
    const state = get();
    const newCard = {
      ...card,
      id: card.id || `card_${Date.now()}_${Math.random()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      checklist: card.checklist || [],
      comments: card.comments || [],
      attachments: card.attachments || [],
      links: card.links || [],
      tags: card.tags || [],
      isFavorite: card.isFavorite || false,
      isArchived: card.isArchived || false,
    };

    const newCards = new Map(state.cards);
    newCards.set(newCard.id, newCard);

    set({ cards: newCards });
    get().addToHistory('create', newCard.id, null, newCard);
    get().persistToStorage();
  },

  updateCard: (id, updates) => {
    const state = get();
    const card = state.cards.get(id);
    if (!card) return;

    const updatedCard = {
      ...card,
      ...updates,
      updatedAt: new Date(),
    };

    const newCards = new Map(state.cards);
    newCards.set(id, updatedCard);

    set({ cards: newCards });
    get().addToHistory('update', id, card, updatedCard);
    get().persistToStorage();
  },

  deleteCard: (id) => {
    const state = get();
    const card = state.cards.get(id);
    if (!card) return;

    const newCards = new Map(state.cards);
    newCards.delete(id);

    set({ cards: newCards });
    get().addToHistory('delete', id, card, null);
    get().persistToStorage();
  },

  moveCard: (cardId, targetCategory, newIndex) => {
    const state = get();
    const card = state.cards.get(cardId);
    if (!card) return;

    get().updateCard(cardId, { category: targetCategory });
    get().addToHistory('move', cardId, card, { ...card, category: targetCategory });
  },

  duplicateCard: (id) => {
    const state = get();
    const card = state.cards.get(id);
    if (!card) return;

    const duplicatedCard = {
      ...card,
      id: `card_${Date.now()}_${Math.random()}`,
      title: `${card.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    get().addCard(duplicatedCard);
  },

  // Bulk operations
  bulkUpdate: (ids, updates) => {
    ids.forEach(id => get().updateCard(id, updates));
  },

  bulkDelete: (ids) => {
    ids.forEach(id => get().deleteCard(id));
  },

  // Checklist operations
  addChecklistItem: (cardId, text) => {
    const state = get();
    const card = state.cards.get(cardId);
    if (!card) return;

    const newItem = {
      id: `checklist_${Date.now()}`,
      text,
      completed: false,
      createdAt: new Date(),
    };

    get().updateCard(cardId, {
      checklist: [...card.checklist, newItem],
    });
  },

  toggleChecklistItem: (cardId, itemId) => {
    const state = get();
    const card = state.cards.get(cardId);
    if (!card) return;

    const updatedChecklist = card.checklist.map(item =>
      item.id === itemId
        ? {
            ...item,
            completed: !item.completed,
            completedAt: !item.completed ? new Date() : undefined,
          }
        : item
    );

    get().updateCard(cardId, { checklist: updatedChecklist });
  },

  deleteChecklistItem: (cardId, itemId) => {
    const state = get();
    const card = state.cards.get(cardId);
    if (!card) return;

    get().updateCard(cardId, {
      checklist: card.checklist.filter(item => item.id !== itemId),
    });
  },

  // Comment operations
  addComment: (cardId, text, author = 'User') => {
    const state = get();
    const card = state.cards.get(cardId);
    if (!card) return;

    const newComment = {
      id: `comment_${Date.now()}`,
      text,
      author,
      createdAt: new Date(),
      edited: false,
    };

    get().updateCard(cardId, {
      comments: [...card.comments, newComment],
    });
  },

  // Filter & Sort
  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearFilters: () => {
    set({
      filters: {
        searchQuery: '',
        categories: [],
        statuses: [],
        priorities: [],
        types: [],
        tags: [],
        showArchived: false,
        showFavorites: false,
      },
    });
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
  },

  // Computed - Filtered & Sorted Cards
  getFilteredCards: () => {
    const { cards, filters, sortBy } = get();
    let filtered = Array.from(cards.values());

    // Apply filters
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        card =>
          card.title.toLowerCase().includes(query) ||
          card.description.toLowerCase().includes(query) ||
          card.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(card => filters.categories.includes(card.category));
    }

    if (filters.statuses.length > 0) {
      filtered = filtered.filter(card => filters.statuses.includes(card.status));
    }

    if (filters.priorities.length > 0) {
      filtered = filtered.filter(card => filters.priorities.includes(card.priority));
    }

    if (filters.types.length > 0) {
      filtered = filtered.filter(card => filters.types.includes(card.type));
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter(card =>
        filters.tags.some(tag => card.tags.includes(tag))
      );
    }

    if (!filters.showArchived) {
      filtered = filtered.filter(card => !card.isArchived);
    }

    if (filters.showFavorites) {
      filtered = filtered.filter(card => card.isFavorite);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aVal = a[sortBy.field];
      const bVal = b[sortBy.field];

      if (aVal instanceof Date && bVal instanceof Date) {
        return sortBy.direction === 'asc'
          ? aVal - bVal
          : bVal - aVal;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortBy.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });

    return filtered;
  },

  getCardsByCategory: (categoryId) => {
    return get().getFilteredCards().filter(card => card.category === categoryId);
  },

  // History Management (Undo/Redo)
  addToHistory: (action, cardId, previousState, newState) => {
    const state = get();
    const entry = {
      timestamp: new Date(),
      action,
      cardId,
      previousState,
      newState,
    };

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(entry);

    // Limit history size
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex, cards } = get();
    if (historyIndex < 0) return;

    const entry = history[historyIndex];
    const newCards = new Map(cards);

    switch (entry.action) {
      case 'create':
        newCards.delete(entry.cardId);
        break;
      case 'update':
      case 'move':
        if (entry.previousState) {
          newCards.set(entry.cardId, entry.previousState);
        }
        break;
      case 'delete':
        if (entry.previousState) {
          newCards.set(entry.cardId, entry.previousState);
        }
        break;
    }

    set({
      cards: newCards,
      historyIndex: historyIndex - 1,
    });
    get().persistToStorage();
  },

  redo: () => {
    const { history, historyIndex, cards } = get();
    if (historyIndex >= history.length - 1) return;

    const entry = history[historyIndex + 1];
    const newCards = new Map(cards);

    switch (entry.action) {
      case 'create':
        if (entry.newState) {
          newCards.set(entry.cardId, entry.newState);
        }
        break;
      case 'update':
      case 'move':
        if (entry.newState) {
          newCards.set(entry.cardId, entry.newState);
        }
        break;
      case 'delete':
        newCards.delete(entry.cardId);
        break;
    }

    set({
      cards: newCards,
      historyIndex: historyIndex + 1,
    });
    get().persistToStorage();
  },

  canUndo: () => get().historyIndex >= 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // Persistence - NOW USER-SCOPED
  persistToStorage: async () => {
    try {
      const { cards, currentUserId } = get();
      if (!currentUserId) {
        if (__DEV__) console.warn('⚠️ [cardStore] Cannot persist: No user set');
        return;
      }

      const cardsArray = Array.from(cards.values());
      const userKey = getUserKey(currentUserId, 'cards');
      await AsyncStorage.setItem(userKey, JSON.stringify(cardsArray));

      if (__DEV__) console.log(`💾 [cardStore] Persisted ${cardsArray.length} cards for user:`, currentUserId);
    } catch (error) {
      console.error('Failed to persist cards:', error);
    }
  },

  loadFromStorage: async (userId) => {
    try {
      set({ isLoading: true });

      const userIdToLoad = userId || get().currentUserId;
      if (!userIdToLoad) {
        if (__DEV__) console.warn('⚠️ [cardStore] Cannot load: No user specified');
        set({ isLoading: false });
        return;
      }

      if (__DEV__) console.log('📂 [cardStore] Loading cards for user:', userIdToLoad);

      // Set current user if provided
      if (userId) {
        set({ currentUserId: userId });
      }

      const userKey = getUserKey(userIdToLoad, 'cards');
      let data = await AsyncStorage.getItem(userKey);

      // CRITICAL FIX: Always check and delete global legacy data to prevent cross-user contamination
      const legacyData = await AsyncStorage.getItem(STORAGE_KEY);
      if (legacyData) {
        if (!data) {
          // User doesn't have scoped data - migrate from global
          if (__DEV__) console.log('🔄 [cardStore] Migrating legacy cards to user scope');
          await AsyncStorage.setItem(userKey, legacyData);
          data = legacyData;
        }

        // ALWAYS delete global data, even if user already has scoped data
        await AsyncStorage.removeItem(STORAGE_KEY);
        if (__DEV__) console.log('🗑️ [cardStore] Deleted global legacy data to prevent cross-user contamination');
      }

      if (data) {
        const cardsArray = JSON.parse(data);
        const cardsMap = new Map(
          cardsArray.map(card => [
            card.id,
            {
              ...card,
              createdAt: new Date(card.createdAt),
              updatedAt: new Date(card.updatedAt),
              dueDate: card.dueDate ? new Date(card.dueDate) : undefined,
            },
          ])
        );
        set({ cards: cardsMap });
        if (__DEV__) console.log(`✅ [cardStore] Loaded ${cardsArray.length} cards for user:`, userIdToLoad);
      } else {
        if (__DEV__) console.log('⚠️ [cardStore] No cards found for user:', userIdToLoad);
        set({ cards: new Map() });
      }
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // NEW: Clear all cards (on logout)
  clearCards: () => {
    if (__DEV__) console.log('🗑️ [cardStore] Clearing all cards');
    set({
      cards: new Map(),
      currentUserId: null,
      history: [],
      historyIndex: -1,
    });
  },

  // Import/Export
  exportToJSON: () => {
    const { cards } = get();
    return JSON.stringify(Array.from(cards.values()), null, 2);
  },

  importFromJSON: (jsonString) => {
    try {
      const cardsArray = JSON.parse(jsonString);
      const newCards = new Map(get().cards);

      cardsArray.forEach(card => {
        newCards.set(card.id, {
          ...card,
          createdAt: new Date(card.createdAt),
          updatedAt: new Date(card.updatedAt),
          dueDate: card.dueDate ? new Date(card.dueDate) : undefined,
        });
      });

      set({ cards: newCards });
      get().persistToStorage();
      return { success: true, count: cardsArray.length };
    } catch (error) {
      console.error('Import failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Migration from old decisions
  migrateOldDecisions: async () => {
    try {
      const oldData = await AsyncStorage.getItem('completedDecisions');
      if (!oldData) return { success: false, count: 0 };

      const oldDecisions = JSON.parse(oldData);
      const newCards = new Map(get().cards);

      oldDecisions.forEach(decision => {
        const card = {
          id: `migrated_${decision.id}`,
          title: decision.decision,
          description: decision.journal || '',
          category: 'backlog',
          status: 'done',
          priority: 'medium',
          type: 'decision',
          tags: [decision.category || 'Leben'],
          createdAt: new Date(decision.date),
          updatedAt: new Date(decision.date),
          checklist: [],
          comments: [],
          attachments: [],
          links: [],
          isFavorite: decision.isFavorite || false,
          isArchived: false,
          recommendation: decision.recommendation,
          percentage: decision.percentage,
          journal: decision.journal,
        };

        newCards.set(card.id, card);
      });

      set({ cards: newCards });
      await get().persistToStorage();

      return { success: true, count: oldDecisions.length };
    } catch (error) {
      console.error('Migration failed:', error);
      return { success: false, error: error.message, count: 0 };
    }
  },
}));

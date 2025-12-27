/**
 * Zustand Store für Decision Management
 * Zentrale State-Verwaltung für das neue Decision Learning System
 * Mit User-Scoped Storage Pattern
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DecisionExplainer } from '../utils/decisionExplainer';
import { applyWeights, recommendPreset } from '../utils/decisionWeights';
import { InsightEngine } from '../utils/insightEngine';
import { DecisionReview, calculateReviewDueDate, findDueReviews } from '../models/DecisionReview';
import { DecisionProfile } from '../models/DecisionProfile';
import { ConfidenceScoreCalculator } from '../utils/confidenceScoreCalculator';

// Storage Keys
const DECISIONS_KEY = 'decisions_v2';
const REVIEWS_KEY = 'decision_reviews';
const PROFILE_KEY = 'decision_profile';

// Helper to get user-scoped key
const getUserKey = (userId, key) => {
  if (!userId) return key; // Fallback to global
  return `user_${userId}_${key}`;
};

export const useDecisionStore = create((set, get) => ({
  // ========== STATE ==========
  currentUserId: null,
  decisions: [],
  reviews: [],
  profile: null,
  confidenceScore: null,

  // Current Decision (in progress)
  currentDecision: null,
  weightPreset: 'balanced',

  // UI State
  isLoading: false,
  error: null,

  // ========== USER MANAGEMENT ==========

  /**
   * Set current user (must be called after login)
   */
  setCurrentUser: async (userId) => {
    set({ currentUserId: userId, isLoading: true });
    await get().loadData(userId);
    set({ isLoading: false });
  },

  /**
   * Clear current user (on logout)
   */
  clearCurrentUser: () => {
    set({
      currentUserId: null,
      decisions: [],
      reviews: [],
      profile: null,
      confidenceScore: null,
      currentDecision: null
    });
  },

  // ========== DECISION CREATION ==========

  /**
   * Start a new decision
   */
  startDecision: (data) => {
    const { currentUserId } = get();

    // Empfehle Preset basierend auf Entscheidungstext
    const recommendedPreset = recommendPreset(data.decision);

    const newDecision = {
      id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUserId,
      decision: data.decision,
      category: data.category || 'other',
      mode: data.mode || 'full',
      weightPreset: data.weightPreset || recommendedPreset,
      answers: {},
      finalScore: null,
      recommendation: null,
      explanation: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
      reviewScheduledFor: null,
      review: null,
      reviewReminded: false
    };

    set({ currentDecision: newDecision, weightPreset: newDecision.weightPreset });
  },

  /**
   * Update answers (auto-save)
   */
  updateAnswers: (stepKey, answer) => {
    const { currentDecision } = get();
    if (!currentDecision) return;

    const updatedDecision = {
      ...currentDecision,
      answers: {
        ...currentDecision.answers,
        [stepKey]: answer
      }
    };

    set({ currentDecision: updatedDecision });
  },

  /**
   * Change weight preset
   */
  setWeightPreset: (preset) => {
    const { currentDecision } = get();
    if (!currentDecision) return;

    set({
      weightPreset: preset,
      currentDecision: {
        ...currentDecision,
        weightPreset: preset
      }
    });
  },

  /**
   * Calculate recommendation with explainability
   */
  calculateRecommendation: () => {
    const { currentDecision, weightPreset } = get();
    if (!currentDecision) return null;

    const { answers, mode } = currentDecision;

    // Berechne gewichteten Score
    const finalScore = applyWeights(answers, mode, weightPreset);

    // Bestimme Empfehlung
    let recommendation = 'unclear';
    if (finalScore >= 60) recommendation = 'yes';
    else if (finalScore <= 40) recommendation = 'no';

    // Generiere Erklärung
    const explanation = DecisionExplainer.explainDecision(
      answers,
      mode,
      finalScore,
      recommendation
    );

    // Update current decision
    const updatedDecision = {
      ...currentDecision,
      finalScore,
      recommendation,
      explanation
    };

    set({ currentDecision: updatedDecision });

    return { finalScore, recommendation, explanation };
  },

  /**
   * Save completed decision
   */
  saveCompletedDecision: async (additionalData = {}) => {
    const { currentDecision, currentUserId, decisions } = get();
    if (!currentDecision) return;

    const completedDecision = {
      ...currentDecision,
      ...additionalData,
      completedAt: new Date().toISOString(),
      reviewScheduledFor: calculateReviewDueDate(new Date())
    };

    const updatedDecisions = [...decisions, completedDecision];

    set({
      decisions: updatedDecisions,
      currentDecision: null,
      weightPreset: 'balanced'
    });

    // Save to storage
    await get()._saveDecisions(updatedDecisions);

    // Update profile and confidence score
    get().updateProfile();
    get().updateConfidenceScore();

    return completedDecision;
  },

  /**
   * Cancel current decision
   */
  cancelDecision: () => {
    set({ currentDecision: null, weightPreset: 'balanced' });
  },

  // ========== REVIEWS ==========

  /**
   * Add a review for a decision
   */
  addReview: async (decisionId, reviewData) => {
    const { reviews, decisions, currentUserId } = get();

    const review = new DecisionReview({
      ...reviewData,
      decisionId
    });

    if (!review.isValid()) {
      set({ error: 'Invalid review data' });
      return null;
    }

    const updatedReviews = [...reviews, review.toJSON()];

    // Update decision with review
    const updatedDecisions = decisions.map(d =>
      d.id === decisionId
        ? { ...d, review: review.toJSON(), reviewReminded: true }
        : d
    );

    set({
      reviews: updatedReviews,
      decisions: updatedDecisions
    });

    // Save to storage
    await get()._saveReviews(updatedReviews);
    await get()._saveDecisions(updatedDecisions);

    // Update profile and confidence score
    get().updateProfile();
    get().updateConfidenceScore();

    return review;
  },

  /**
   * Get due reviews
   */
  getDueReviews: () => {
    const { decisions } = get();
    return findDueReviews(decisions);
  },

  /**
   * Mark decision as reminded
   */
  markAsReminded: async (decisionId) => {
    const { decisions } = get();
    const updatedDecisions = decisions.map(d =>
      d.id === decisionId ? { ...d, reviewReminded: true } : d
    );

    set({ decisions: updatedDecisions });
    await get()._saveDecisions(updatedDecisions);
  },

  // ========== PROFILE & INSIGHTS ==========

  /**
   * Update user profile
   */
  updateProfile: () => {
    const { decisions, reviews } = get();

    if (decisions.length === 0) {
      set({ profile: null });
      return;
    }

    const profile = new DecisionProfile(decisions, reviews);
    set({ profile: profile.toJSON() });
  },

  /**
   * Update confidence score
   */
  updateConfidenceScore: () => {
    const { decisions, reviews } = get();

    const confidenceScore = ConfidenceScoreCalculator.calculateScore(decisions, reviews);
    set({ confidenceScore });
  },

  /**
   * Generate user insights
   */
  getUserInsights: () => {
    const { decisions } = get();
    return InsightEngine.generateUserInsights(decisions);
  },

  /**
   * Generate insights for a specific decision
   */
  getDecisionInsights: (decisionId) => {
    const { decisions } = get();
    const decision = decisions.find(d => d.id === decisionId);
    if (!decision) return [];

    return InsightEngine.generateDecisionInsights(decision, decisions);
  },

  // ========== DATA MANAGEMENT ==========

  /**
   * Load all data for current user
   */
  loadData: async (userId) => {
    try {
      set({ isLoading: true, error: null });

      const decisionsKey = getUserKey(userId, DECISIONS_KEY);
      const reviewsKey = getUserKey(userId, REVIEWS_KEY);

      const [decisionsJson, reviewsJson] = await Promise.all([
        AsyncStorage.getItem(decisionsKey),
        AsyncStorage.getItem(reviewsKey)
      ]);

      const decisions = decisionsJson ? JSON.parse(decisionsJson) : [];
      const reviews = reviewsJson ? JSON.parse(reviewsJson) : [];

      set({ decisions, reviews });

      // Update profile and confidence score
      get().updateProfile();
      get().updateConfidenceScore();

    } catch (error) {
      console.error('Error loading decision data:', error);
      set({ error: 'Failed to load data' });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Save decisions to storage (internal)
   */
  _saveDecisions: async (decisions) => {
    const { currentUserId } = get();
    const key = getUserKey(currentUserId, DECISIONS_KEY);
    await AsyncStorage.setItem(key, JSON.stringify(decisions));
  },

  /**
   * Save reviews to storage (internal)
   */
  _saveReviews: async (reviews) => {
    const { currentUserId } = get();
    const key = getUserKey(currentUserId, REVIEWS_KEY);
    await AsyncStorage.setItem(key, JSON.stringify(reviews));
  },

  /**
   * Delete a decision
   */
  deleteDecision: async (decisionId) => {
    const { decisions, reviews } = get();

    const updatedDecisions = decisions.filter(d => d.id !== decisionId);
    const updatedReviews = reviews.filter(r => r.decisionId !== decisionId);

    set({ decisions: updatedDecisions, reviews: updatedReviews });

    await get()._saveDecisions(updatedDecisions);
    await get()._saveReviews(updatedReviews);

    get().updateProfile();
    get().updateConfidenceScore();
  },

  /**
   * Export all data
   */
  exportData: () => {
    const { decisions, reviews, profile, confidenceScore } = get();

    return {
      decisions,
      reviews,
      profile,
      confidenceScore,
      exportedAt: new Date().toISOString(),
      version: '2.0'
    };
  },

  /**
   * Import data
   */
  importData: async (data) => {
    const { currentUserId } = get();

    if (!data.decisions) {
      set({ error: 'Invalid import data' });
      return false;
    }

    // Filter decisions for current user
    const userDecisions = data.decisions.filter(d => d.userId === currentUserId);
    const userReviews = data.reviews?.filter(r =>
      userDecisions.some(d => d.id === r.decisionId)
    ) || [];

    set({
      decisions: userDecisions,
      reviews: userReviews
    });

    await get()._saveDecisions(userDecisions);
    await get()._saveReviews(userReviews);

    get().updateProfile();
    get().updateConfidenceScore();

    return true;
  },

  /**
   * Clear all data for current user
   */
  clearAllData: async () => {
    const { currentUserId } = get();

    set({
      decisions: [],
      reviews: [],
      profile: null,
      confidenceScore: null,
      currentDecision: null
    });

    const decisionsKey = getUserKey(currentUserId, DECISIONS_KEY);
    const reviewsKey = getUserKey(currentUserId, REVIEWS_KEY);
    const profileKey = getUserKey(currentUserId, PROFILE_KEY);

    await Promise.all([
      AsyncStorage.removeItem(decisionsKey),
      AsyncStorage.removeItem(reviewsKey),
      AsyncStorage.removeItem(profileKey)
    ]);
  },

  // ========== STATISTICS & QUERIES ==========

  /**
   * Get decisions by category
   */
  getDecisionsByCategory: (category) => {
    const { decisions } = get();
    return decisions.filter(d => d.category === category);
  },

  /**
   * Get decisions by date range
   */
  getDecisionsByDateRange: (startDate, endDate) => {
    const { decisions } = get();
    return decisions.filter(d => {
      const date = new Date(d.createdAt);
      return date >= startDate && date <= endDate;
    });
  },

  /**
   * Get decision by ID
   */
  getDecisionById: (id) => {
    const { decisions } = get();
    return decisions.find(d => d.id === id);
  },

  /**
   * Get statistics
   */
  getStatistics: () => {
    const { decisions, reviews } = get();

    const totalDecisions = decisions.length;
    const totalReviews = reviews.length;

    const yesCount = decisions.filter(d => d.recommendation === 'yes').length;
    const noCount = decisions.filter(d => d.recommendation === 'no').length;
    const unclearCount = decisions.filter(d => d.recommendation === 'unclear').length;

    const quickCount = decisions.filter(d => d.mode === 'quick').length;
    const fullCount = decisions.filter(d => d.mode === 'full').length;

    const avgConfidence = decisions.length > 0
      ? decisions.reduce((sum, d) => sum + (d.finalScore || 50), 0) / decisions.length
      : 0;

    return {
      totalDecisions,
      totalReviews,
      yesCount,
      noCount,
      unclearCount,
      quickCount,
      fullCount,
      avgConfidence: Math.round(avgConfidence),
      reviewRate: totalDecisions > 0 ? (totalReviews / totalDecisions) * 100 : 0
    };
  }
}));

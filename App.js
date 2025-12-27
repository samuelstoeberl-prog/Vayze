import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Share, Linking, Switch, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import BoardView from './components/Board/BoardView';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import StandaloneAuthScreen from './screens/StandaloneAuthScreen';
import SplashScreen from './components/SplashScreen';
import OnboardingFlowNew from './components/OnboardingFlowNew';
import AccountScreen from './screens/AccountScreen';
import { useCardStore } from './store/cardStore';
import { useDecisionStore } from './store/decisionStore';
import { loadUserData, saveUserData, removeUserData, migrateToUserScope, clearUserData } from './utils/userStorage';
import { recommendPreset } from './utils/decisionWeights';
import ReviewPromptModal from './components/ReviewPromptModal';
import firebaseAuthService from './services/firebaseAuthService';
import { useAppStateMachine, APP_STATES } from './hooks/useAppStateMachine';
import SafeLoadingScreen from './components/SafeLoadingScreen';
import ErrorScreen from './components/ErrorScreen';

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : 0;

function MainApp() {
  const { isAuthenticated, isLoading: authLoading, signOut, signIn, user } = useAuth();

  // STATE MACHINE - Replaces all boolean-based flow control
  const stateMachine = useAppStateMachine();

  const addCard = useCardStore((state) => state.addCard);
  const setCurrentUser = useCardStore((state) => state.setCurrentUser);
  const loadCardsFromStorage = useCardStore((state) => state.loadFromStorage);
  const clearCards = useCardStore((state) => state.clearCards);

  // Decision Store
  const setCurrentDecisionUser = useDecisionStore((state) => state.setCurrentUser);
  const clearCurrentDecisionUser = useDecisionStore((state) => state.clearCurrentUser);
  const startDecision = useDecisionStore((state) => state.startDecision);
  const getDueReviews = useDecisionStore((state) => state.getDueReviews);
  const currentDecisionInProgress = useDecisionStore((state) => state.currentDecision);
  const weightPreset = useDecisionStore((state) => state.weightPreset);
  const setWeightPreset = useDecisionStore((state) => state.setWeightPreset);

  const [activeTab, setActiveTab] = useState(0);
  const [decision, setDecision] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [allAnswers, setAllAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [completedDecisions, setCompletedDecisions] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [decisionMode, setDecisionMode] = useState('full');
  const [category, setCategory] = useState(['Leben']); // Array für Multi-Select
  const [isFavorite, setIsFavorite] = useState(false);
  const [journal, setJournal] = useState('');
  const [showNextSteps, setShowNextSteps] = useState(false);
  const [nextSteps, setNextSteps] = useState(['', '', '']);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    analytics: true,
  });
  const [pendingResume, setPendingResume] = useState(null);

  // Review Modal State
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [currentReviewDecision, setCurrentReviewDecision] = useState(null);
  const [hasAutoSaved, setHasAutoSaved] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(0);
  const [showAccountScreen, setShowAccountScreen] = useState(false);

  // Define all functions before hooks
  const loadAllData = async () => {
    try {
      // Only load user data if authenticated
      if (!user || !user.email) {
        if (__DEV__) console.log('⚠️ [App] No user, skipping data load');
        return;
      }

      if (__DEV__) console.log('✅ [App] Loading data for user:', user.email);

      // Migrate old global data to user-scoped (one-time migration)
      await migrateToUserScope(user.email, 'decisions', 'completedDecisions');
      await migrateToUserScope(user.email, 'settings', 'appSettings');
      await migrateToUserScope(user.email, 'decisionData');

      // Load user-scoped data
      const savedDecisions = await loadUserData(user.email, 'decisions', []);
      if (__DEV__) console.log(`📊 [App] Loaded ${savedDecisions.length} decisions for user: ${user.email}`);
      setCompletedDecisions(savedDecisions);

      // Initialize Decision Store
      setCurrentDecisionUser(user.email);

      const savedSettings = await loadUserData(user.email, 'settings', {
        notifications: true,
        darkMode: false,
        analytics: true,
      });
      setSettings(savedSettings);

      const saved = await loadUserData(user.email, 'decisionData', null);
      if (saved && saved.decision && saved.decision.trim().length >= 10) {
        setPendingResume(saved);
      }
    } catch (error) {
      if (__DEV__) console.error('Load error:', error);
    }
  };

  const saveData = async () => {
    try {
      if (!user || !user.email) {
        if (__DEV__) console.warn('⚠️ [App] Cannot save data: No user');
        return;
      }
      await saveUserData(user.email, 'decisionData', {
        decision, answers: allAnswers, step: currentStep, showResults,
      });
    } catch (error) {
      if (__DEV__) console.error('Save error:', error);
    }
  };

  const steps = [
    { title: 'Deine erste Intuition', question: 'Was ist dein spontanes Bauchgefühl?', options: ['Stark dafür', 'Eher dafür', 'Neutral', 'Eher dagegen', 'Stark dagegen'], emoji: '🎯', optional: false },
    { title: 'Was steht auf dem Spiel?', question: 'Was könntest du verlieren?', type: 'text', followUp: 'Wie hoch ist das Risiko?', followUpOptions: ['Sehr niedrig', 'Niedrig', 'Mittel', 'Hoch', 'Sehr hoch'], emoji: '⚖️', optional: true },
    { title: 'Kannst du zurück?', question: 'Wie leicht kannst du diese Entscheidung rückgängig machen?', type: 'text', followUp: 'Wie reversibel?', followUpOptions: ['Vollständig', 'Größtenteils', 'Teilweise', 'Kaum', 'Irreversibel'], emoji: '↩️', optional: true },
    { title: 'Zeitperspektive', question: 'Wie siehst du es langfristig?', type: 'text', followUp: 'Überwiegt der Nutzen?', followUpOptions: ['Ja eindeutig', 'Eher ja', 'Unentschieden', 'Eher nein', 'Nein'], emoji: '🔮', optional: true },
    { title: 'Äußere Einflüsse', question: 'Was beeinflusst dich?', type: 'text', followUp: 'Kannst du objektiver sein?', followUpOptions: ['Ja definitiv', 'Wahrscheinlich', 'Unsicher', 'Eher nein', 'Nein'], emoji: '🎭', optional: true },
    { title: 'Rat an einen Freund', question: 'Was würdest du einem Freund raten?', type: 'text', followUp: 'Deine Empfehlung?', followUpOptions: ['Klar dafür', 'Eher dafür', 'Abwarten', 'Eher dagegen', 'Klar dagegen'], emoji: '💭', optional: false },
  ];

  const quickSteps = [
    {
      title: 'Bauchgefühl & Konsequenz',
      question: 'Was ist dein spontanes Gefühl zu dieser Entscheidung?',
      options: ['Fühlt sich richtig an 👍', 'Bin unsicher 🤷', 'Fühlt sich falsch an 👎'],
      emoji: '⚡',
      followUp: 'Was wäre die schlimmste Konsequenz, wenn es schiefgeht?',
      type: 'combo'
    },
    {
      title: 'Zeitperspektive',
      question: 'Wird diese Entscheidung in einem Jahr noch wichtig sein?',
      options: ['Ja, sehr wichtig', 'Mittelmäßig wichtig', 'Kaum noch relevant'],
      emoji: '🔮',
      followUp: null,
      followUpOptions: null
    },
  ];

  const categories = ['Leben', 'Arbeit', 'Finanzen', 'Beziehung', 'Gesundheit', 'Projekte'];
  const currentSteps = decisionMode === 'quick' ? quickSteps : steps;

  const completeOnboarding = async (onboardingData) => {
    try {
      if (__DEV__) console.log('🎯 [completeOnboarding] Onboarding completed, redirecting to login');
      if (__DEV__) console.log('📊 [completeOnboarding] Survey data:', onboardingData?.survey);

      // Simply mark onboarding as complete and redirect to login
      // Don't create account here - let user do it on the login screen
      await AsyncStorage.setItem('hasLaunched', 'true');
      if (__DEV__) console.log('✅ [completeOnboarding] Marked device as launched');

      // CRITICAL: Use setTimeout to ensure state update happens in next tick
      // This forces React to re-render with the new state
      setTimeout(() => {
        setIsFirstLaunch(false);
        if (__DEV__) console.log('✅ [completeOnboarding] Redirecting to login screen NOW');
      }, 100);
    } catch (error) {
      if (__DEV__) console.error('💥 [completeOnboarding] Error:', error);
    }
  };

  const updateAnswer = (key, value) => {
    setAllAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleOptionClick = (option) => {
    updateAnswer(`step${currentStep}_rating`, option);
    if (decisionMode === 'quick' && currentSteps[currentStep].type === 'combo' && !allAnswers[`step${currentStep}_consequence`]) {
      return;
    }
    if (currentStep < currentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateDecision = () => {
    if (decisionMode === 'quick') {
      const firstChoice = allAnswers.step0_rating;
      const importance = allAnswers.step1_rating;
      const consequence = allAnswers.step0_consequence || '';

      let score = 0;
      const factors = [];

      if (firstChoice === 'Fühlt sich richtig an 👍') {
        score += 3;
        factors.push({ type: 'positive', icon: '💚', text: 'Dein Bauchgefühl war positiv' });
      } else if (firstChoice === 'Bin unsicher 🤷') {
        score += 0;
        factors.push({ type: 'neutral', icon: '🤷', text: 'Dein Bauchgefühl war neutral' });
      } else if (firstChoice === 'Fühlt sich falsch an 👎') {
        score -= 3;
        factors.push({ type: 'negative', icon: '💔', text: 'Dein Bauchgefühl war negativ' });
      }

      if (importance === 'Ja, sehr wichtig') {
        score += 2;
        factors.push({ type: 'positive', icon: '⭐', text: 'Die Entscheidung ist sehr wichtig' });
      } else if (importance === 'Mittelmäßig wichtig') {
        score += 0;
      } else if (importance === 'Kaum noch relevant') {
        score -= 1;
        factors.push({ type: 'negative', icon: '📉', text: 'Die Entscheidung ist kaum noch relevant' });
      }

      if (consequence) {
        factors.push({ type: 'info', icon: '⚠️', text: `Worst Case: ${consequence}` });
      }

      const maxScore = 5;
      const minScore = -4;
      const percentage = Math.round(((score - minScore) / (maxScore - minScore)) * 100);
      const recommendation = percentage >= 60 ? 'JA' : percentage <= 40 ? 'NEIN' : 'UNENTSCHIEDEN';

      return { percentage, recommendation, mode: 'quick', factors };
    }
    const ratings = {
      step0_rating: { 'Stark dafür': 2, 'Eher dafür': 1, 'Neutral': 0, 'Eher dagegen': -1, 'Stark dagegen': -2 },
      step1_rating: { 'Sehr niedrig': 4, 'Niedrig': 2, 'Mittel': 0, 'Hoch': -2, 'Sehr hoch': -4 },
      step2_rating: { 'Vollständig': 4, 'Größtenteils': 3, 'Teilweise': 1, 'Kaum': -1, 'Irreversibel': -4 },
      step3_rating: { 'Ja eindeutig': 4, 'Eher ja': 2, 'Unentschieden': 0, 'Eher nein': -2, 'Nein': -4 },
      step4_rating: { 'Ja definitiv': 2, 'Wahrscheinlich': 1, 'Unsicher': 0, 'Eher nein': -1, 'Nein': -2 },
      step5_rating: { 'Klar dafür': 6, 'Eher dafür': 3, 'Abwarten': 0, 'Eher dagegen': -3, 'Klar dagegen': -6 },
    };

    const stepLabels = {
      step0_rating: { icon: '🎯', label: 'Bauchgefühl' },
      step1_rating: { icon: '⚖️', label: 'Risiko' },
      step2_rating: { icon: '↩️', label: 'Reversibilität' },
      step3_rating: { icon: '🔮', label: 'Langfristig' },
      step4_rating: { icon: '🎭', label: 'Objektivität' },
      step5_rating: { icon: '💭', label: 'Freundesrat' },
    };

    let score = 0;
    const factors = [];

    Object.keys(ratings).forEach(key => {
      const rating = allAnswers[key];
      if (rating && ratings[key][rating] !== undefined) {
        const points = ratings[key][rating];
        score += points;

        const stepInfo = stepLabels[key];
        if (points > 2) {
          factors.push({ type: 'positive', icon: stepInfo.icon, text: `${stepInfo.label}: ${rating}` });
        } else if (points < -2) {
          factors.push({ type: 'negative', icon: stepInfo.icon, text: `${stepInfo.label}: ${rating}` });
        }
      }
    });

    const maxScore = 22;
    const minScore = -22;
    const percentage = Math.round(((score - minScore) / (maxScore - minScore)) * 100);
    const recommendation = percentage >= 55 ? 'JA' : percentage <= 45 ? 'NEIN' : 'UNENTSCHIEDEN';
    return { percentage, recommendation, mode: 'full', factors };
  };

  const resetDecisionState = async (removeData = true) => {
    setDecision('');
    setCurrentStep(0);
    setAllAnswers({});
    setShowResults(false);
    setHasStarted(false);
    setCategory(['Leben']);
    setIsFavorite(false);
    setJournal('');
    setShowNextSteps(false);
    setNextSteps(['', '', '']);
    setDecisionMode('full');
    setHasAutoSaved(false); // Reset auto-save flag for next decision
    if (removeData && user && user.email) {
      await removeUserData(user.email, 'decisionData');
    }
  };

  const reset = async () => {
    const result = calculateDecision();
    // Use local date/time instead of UTC to avoid timezone issues
    const now = new Date();
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();

    const newDecision = {
      id: Date.now(),
      date: localDate,
      decision,
      recommendation: result.recommendation,
      percentage: result.percentage,
      factors: result.factors || [], // Save explainability factors
      category,
      isFavorite,
      journal,
      mode: decisionMode
    };

    // Debug logging
    if (__DEV__) {
      console.log('=== SAVING DECISION ===');
      console.log('Current date:', now);
      console.log('Local adjusted:', localDate);
      console.log('Date ISO:', localDate);
      console.log('Date parsed back:', new Date(localDate).toLocaleString('de-DE'));
      console.log('Month:', new Date(localDate).getMonth(), 'Year:', new Date(localDate).getFullYear());
      console.log('Day:', new Date(localDate).getDate());
      console.log('New decision:', newDecision);
      console.log('Factors:', result.factors);
    }

    const updated = [...completedDecisions, newDecision];

    if (__DEV__) {
      console.log('=== BEFORE SAVE ===');
      console.log('User object:', user);
      console.log('User email:', user?.email);
      console.log('Is authenticated:', isAuthenticated);
      console.log('Updated array length:', updated.length);
    }

    if (!user || !user.email) {
      if (__DEV__) console.error('⚠️ [App] CRITICAL: Cannot save decision - No user or email!');
      if (__DEV__) console.error('User:', user);
      if (__DEV__) console.error('isAuthenticated:', isAuthenticated);
      Alert.alert('Fehler', 'Benutzer nicht gefunden. Bitte melde dich erneut an.');
      return;
    }

    // Update state BEFORE saving to storage
    setCompletedDecisions(updated);

    // Save to storage
    await saveUserData(user.email, 'decisions', updated);

    // Verify save
    if (__DEV__) {
      const saved = await loadUserData(user.email, 'decisions', []);
      console.log('✅ Verified saved data:', saved.length, 'decisions for user:', user.email);
      console.log('Last decision:', saved[saved.length - 1]);
    }

    await resetDecisionState();

    if (__DEV__) console.log('Switching to Tracker tab...');
    setActiveTab(2);
  };

  const getCurrentStreak = () => {
    if (completedDecisions.length === 0) return 0;
    const dates = [...new Set(completedDecisions.map(d => new Date(d.date).toDateString()))].sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      if (dates.includes(checkDate.toDateString())) streak++;
      else break;
    }
    return streak;
  };

  const changeMonth = (dir) => {
    if (dir === 'next') {
      if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
      else setCurrentMonth(currentMonth + 1);
    } else {
      if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
      else setCurrentMonth(currentMonth - 1);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Vayze - Treffe bessere Entscheidungen! 🧠\n\nEntdecke Vayze, die App für fundierte Entscheidungen.\n\nAnalysiere deine Entscheidungen wissenschaftlich fundiert und behalte den Überblick mit dem integrierten Kanban-Board.\n\n📱 Suche "Vayze" in deinem App Store',
        title: 'Vayze - Entscheidungs-Assistent'
      });
    } catch (error) {
      Alert.alert('Fehler', 'Teilen fehlgeschlagen');
    }
  };

  const toggleSetting = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    if (user && user.email) {
      await saveUserData(user.email, 'settings', newSettings);
    }

    Alert.alert('Einstellung geändert', `${key} wurde ${newSettings[key] ? 'aktiviert' : 'deaktiviert'}`);
  };

  const handleExportData = async () => {
    try {
      const data = { completedDecisions, settings, date: new Date().toISOString() };
      Alert.alert(
        'Daten exportiert',
        `${completedDecisions.length} Entscheidungen gespeichert.\n\nTipp: In der Vollversion kannst du die Daten als JSON exportieren.`
      );
    } catch (error) {
      Alert.alert('Fehler', 'Export fehlgeschlagen');
    }
  };

  const handleDeleteAllData = async () => {
    Alert.alert(
      'Alle Daten löschen?',
      'Diese Aktion kann nicht rückgängig gemacht werden!',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            if (user && user.email) {
              await clearUserData(user.email);
            }
            setCompletedDecisions([]);
            setDecision('');
            setAllAnswers({});
            setCurrentStep(0);
            setShowResults(false);
            setHasStarted(false);
            Alert.alert('Erfolg', 'Deine Daten wurden gelöscht.');
          }
        }
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Abmelden',
      'Möchtest du dich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Abmelden',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            Alert.alert('Erfolg', 'Du wurdest abgemeldet.');
          }
        }
      ]
    );
  };

  const openURL = (url) => {
    Linking.openURL(url).catch(() => Alert.alert('Fehler', 'Link konnte nicht geöffnet werden'));
  };

  // All useEffect hooks must be before any conditional returns
  // Load data when user changes (login/logout)
  useEffect(() => {
    if (isAuthenticated && user && user.email) {
      // Set user in cardStore
      setCurrentUser(user.email);

      // Load all user data
      loadAllData();
      loadCardsFromStorage(user.email);

      // Check for due reviews after data loads
      setTimeout(() => {
        const dueReviews = getDueReviews();
        if (dueReviews.length > 0 && !currentReviewDecision) {
          setCurrentReviewDecision(dueReviews[0]);
          setReviewModalVisible(true);
        }
      }, 2000); // Wait 2 seconds after login
    } else {
      // Clear state when logged out
      setCompletedDecisions([]);
      setSettings({ notifications: true, darkMode: false, analytics: true });
      clearCards();
      clearCurrentDecisionUser();
    }
  }, [user?.email, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save decision when results are shown
  useEffect(() => {
    const autoSaveDecision = async () => {
      if (__DEV__) {
        console.log('=== AUTO-SAVE CHECK ===');
        console.log('showResults:', showResults);
        console.log('hasAutoSaved:', hasAutoSaved);
        console.log('user:', user);
        console.log('user.email:', user?.email);
        console.log('decision length:', decision.trim().length);
        console.log('All conditions met?', showResults && !hasAutoSaved && user && user.email && decision.trim().length >= 10);
      }

      // Only save if we're showing results, haven't saved yet, and have a valid user
      if (showResults && !hasAutoSaved && user && user.email && decision.trim().length >= 10) {
        if (__DEV__) console.log('🔄 Auto-saving decision...');

        try {
          const result = calculateDecision();
          const now = new Date();
          const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();

          const newDecision = {
            id: Date.now(),
            date: localDate,
            decision,
            recommendation: result.recommendation,
            percentage: result.percentage,
            factors: result.factors || [],
            category,
            isFavorite,
            journal,
            mode: decisionMode
          };

          if (__DEV__) {
            console.log('New decision object:', newDecision);
            console.log('Current completedDecisions count:', completedDecisions.length);
          }

          const updated = [...completedDecisions, newDecision];
          setCompletedDecisions(updated);

          if (__DEV__) console.log('Saving to storage for user:', user.email);
          await saveUserData(user.email, 'decisions', updated);
          setHasAutoSaved(true);

          if (__DEV__) {
            const saved = await loadUserData(user.email, 'decisions', []);
            console.log('✅ Auto-saved! Total decisions:', saved.length);
            console.log('Saved decisions:', saved);
          }
        } catch (error) {
          if (__DEV__) console.error('❌ Auto-save failed:', error);
        }
      } else {
        if (__DEV__ && showResults) {
          console.log('⚠️ Auto-save skipped - conditions not met');
          if (hasAutoSaved) console.log('  → Already saved');
          if (!user) console.log('  → No user');
          if (!user?.email) console.log('  → No user email');
          if (decision.trim().length < 10) console.log('  → Decision too short');
        }
      }
    };

    autoSaveDecision();
  }, [showResults, hasAutoSaved, user?.email, completedDecisions, decision, category, isFavorite, journal, decisionMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // CRITICAL FIX: Check onboarding based on Firebase auth state + user-specific key
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // First check if there's a Firebase user logged in
        const firebaseUser = firebaseAuthService.getCurrentUser();

        if (firebaseUser) {
          // User is logged in via Firebase - check if THEY completed onboarding
          const userHasLaunchedKey = `hasLaunched_${firebaseUser.email}`;
          const userHasLaunched = await AsyncStorage.getItem(userHasLaunchedKey);

          if (userHasLaunched) {
            // This user has completed onboarding before
            setIsFirstLaunch(false);
            if (__DEV__) console.log('✅ [App] User has completed onboarding:', firebaseUser.email);
          } else {
            // This Firebase user exists but never completed onboarding (edge case)
            setIsFirstLaunch(false); // Skip onboarding if already authenticated
            if (__DEV__) console.log('⚠️ [App] Authenticated user without onboarding flag, skipping onboarding');
          }
        } else {
          // No Firebase user - check if ANY user has completed onboarding on this device
          // (we still want first-time users to see onboarding)
          const legacyHasLaunched = await AsyncStorage.getItem('hasLaunched');

          if (legacyHasLaunched) {
            // Device has been used before, but no user is logged in
            setIsFirstLaunch(false);
            if (__DEV__) console.log('✅ [App] Device has been used before, skipping onboarding');
          } else {
            // Brand new device - show onboarding
            setIsFirstLaunch(true);
            if (__DEV__) console.log('🆕 [App] First launch detected, showing onboarding');
          }
        }
      } catch (error) {
        console.error('❌ [App] Error checking onboarding status:', error);
        setIsFirstLaunch(false); // Default to not showing onboarding on error
      }
    };

    checkOnboardingStatus();
  }, []); // Only run once on mount

  // Reset calendar to current month when switching to tracker tab
  useEffect(() => {
    if (activeTab === 2) {
      const now = new Date();
      setCurrentMonth(now.getMonth());
      setCurrentYear(now.getFullYear());
    }
  }, [activeTab]);

  // COMPREHENSIVE DEBUG LOGGING
  if (__DEV__) {
    console.log('🔍 [App] RENDER DEBUG:');
    console.log('  showSplash:', showSplash);
    console.log('  isFirstLaunch:', isFirstLaunch);
    console.log('  authLoading:', authLoading);
    console.log('  isAuthenticated:', isAuthenticated);
    console.log('  user:', user?.email || 'null');
  }

  // Show splash screen
  if (showSplash) {
    if (__DEV__) console.log('🎬 [App] Showing SPLASH screen');
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Premium Onboarding Flow - ONLY on first launch, never after logout
  if (isFirstLaunch && !authLoading) {
    if (__DEV__) console.log('📋 [App] Showing ONBOARDING screen');
    return <OnboardingFlowNew onComplete={completeOnboarding} />;
  }

  // Auth loading state
  if (authLoading) {
    if (__DEV__) console.log('🔵 [App] Showing AUTH LOADING screen');
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading...</Text>

        {/* EMERGENCY RESET BUTTON - DEV MODE ONLY */}
        {__DEV__ && (
          <TouchableOpacity
            style={{
              marginTop: 40,
              padding: 16,
              backgroundColor: '#ef4444',
              borderRadius: 12,
              marginHorizontal: 40,
            }}
            onPress={async () => {
              Alert.alert(
                '🚨 Emergency Reset',
                'This will clear ALL app data and restart. Continue?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'RESET ALL',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        const allKeys = await AsyncStorage.getAllKeys();
                        await AsyncStorage.multiRemove(allKeys);
                        Alert.alert('✅ Reset Complete', 'App will reload now. Reload manually if needed.');
                        setIsFirstLaunch(true);
                        setShowSplash(false);
                      } catch (error) {
                        Alert.alert('Error', error.message);
                      }
                    },
                  },
                ]
              );
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 16 }}>
              🚨 EMERGENCY RESET
            </Text>
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 12, marginTop: 4 }}>
              Clear all data and restart
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Show auth gateway if not authenticated (after onboarding)
  if (!isAuthenticated) {
    if (__DEV__) console.log('🔐 [App] Showing LOGIN screen (not authenticated)');
    return <StandaloneAuthScreen />;
  }

  if (__DEV__) console.log('🟢 [App] Showing MAIN APP. activeTab:', activeTab, 'hasStarted:', hasStarted);

  const TabBar = () => (
    <View style={styles.tabBar}>
      {[
        { icon: '🧠', label: 'Assistent', index: 0 },
        { icon: '📋', label: 'Board', index: 1 },
        { icon: '📊', label: 'Tracker', index: 2 },
        { icon: '✨', label: 'Insights', index: 3 },
        { icon: '⚙', label: 'Settings', index: 4 },
      ].map(tab => (
        <TouchableOpacity
          key={tab.index}
          style={styles.tabItem}
          onPress={() => setActiveTab(tab.index)}
        >
          <Text style={[styles.tabIcon, activeTab === tab.index && styles.tabIconActive]}>
            {tab.icon}
          </Text>
          <Text style={[styles.tabLabel, activeTab === tab.index && styles.tabLabelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Board Tab
  if (activeTab === 1) {
    return (
      <View style={styles.container}>
        <BoardView
          onNavigateToDecision={(card) => {
            // Navigate to decision assistant with card context
            setActiveTab(0);
            setDecision(card.title);
            setHasStarted(true);
            setCurrentStep(0);
            setAllAnswers({});
            setShowResults(false);
          }}
        />
        <TabBar />
      </View>
    );
  }

  // Tracker/Calendar Tab
  if (activeTab === 2) {
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    // Convert Sunday=0 to Monday=0 (shift: Sunday becomes 6, Monday becomes 0)
    const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // Debug: Log decision dates
    const decisionDates = new Set(
      completedDecisions
        .filter(d => {
          const decisionDate = new Date(d.date);
          return decisionDate.getMonth() === currentMonth && decisionDate.getFullYear() === currentYear;
        })
        .map(d => {
          const decisionDate = new Date(d.date);
          return decisionDate.getDate(); // Just the day number (1-31)
        })
    );

    if (__DEV__) {
      console.log('=== TRACKER DEBUG ===');
      console.log('Current Month/Year:', currentMonth, '(' + monthNames[currentMonth] + ')', currentYear);
      console.log('Total decisions:', completedDecisions.length);
      console.log('User:', user?.email);
      console.log('Decisions this month (day numbers):', Array.from(decisionDates));
      console.log('\nALL DECISIONS:');
      completedDecisions.forEach((d, i) => {
        const parsedDate = new Date(d.date);
        console.log(`  ${i + 1}. "${d.decision.substring(0, 30)}" | Date: ${parsedDate.toLocaleDateString('de-DE')} | Month: ${parsedDate.getMonth()} | Day: ${parsedDate.getDate()}`);
      });
      console.log('\nFiltered for this month:', completedDecisions.filter(d => {
        const decisionDate = new Date(d.date);
        return decisionDate.getMonth() === currentMonth && decisionDate.getFullYear() === currentYear;
      }).length, 'decisions');
    }

    const emptyDays = Array.from({ length: firstDayIndex }, (_, i) => ({ isEmpty: true, key: `empty-${i}` }));
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNumber = i + 1;
      const hasDecision = decisionDates.has(dayNumber);
      return { day: dayNumber, hasDecision, isEmpty: false };
    });
    const allDays = [...emptyDays, ...days];

    return (
      <View style={styles.container}>
        <StatusBar style={settings.darkMode ? "light" : "dark"} />
        <View style={{ height: STATUS_BAR_HEIGHT, backgroundColor: '#f8fafc' }} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.trackerContainer}>
            <Text style={styles.trackerTitle}>📊 Dein Fortschritt</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{completedDecisions.length}</Text>
                <Text style={styles.statLabel}>Entscheidungen</Text>
              </View>
              <View style={[styles.statBox, styles.statBoxGreen]}>
                <Text style={[styles.statNumber, styles.statNumberGreen]}>{getCurrentStreak()}</Text>
                <Text style={styles.statLabel}>Tage Streak 🔥</Text>
              </View>
            </View>

            <View style={styles.monthNavigation}>
              <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.monthButton}>
                <Text style={styles.monthButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.monthTitle}>{monthNames[currentMonth]} {currentYear}</Text>
              <TouchableOpacity onPress={() => changeMonth('next')} style={styles.monthButton}>
                <Text style={styles.monthButtonText}>→</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysContainer}>
              {weekDays.map(day => (
                <Text key={day} style={styles.weekDay}>{day}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {allDays.map((d, idx) => (
                d.isEmpty ? (
                  <View key={d.key} style={styles.emptyDay} />
                ) : (
                  <View
                    key={d.day}
                    style={[styles.calendarDay, d.hasDecision && styles.calendarDayActive]}
                  >
                    <Text style={[styles.calendarDayText, d.hasDecision && styles.calendarDayTextActive]}>
                      {d.day}
                    </Text>
                  </View>
                )
              ))}
            </View>

            {/* Debug Info */}
            {__DEV__ && (
              <View style={{ marginTop: 20, padding: 15, backgroundColor: '#fff3cd', borderRadius: 8 }}>
                <Text style={{ fontSize: 12, color: '#856404', marginBottom: 5 }}>
                  🔍 DEBUG INFO:
                </Text>
                <Text style={{ fontSize: 11, color: '#856404' }}>
                  Gesamt: {completedDecisions.length} Entscheidungen
                </Text>
                <Text style={{ fontSize: 11, color: '#856404' }}>
                  Dieser Monat: {decisionDates.size} Entscheidungen
                </Text>
                <Text style={{ fontSize: 11, color: '#856404' }}>
                  Tage mit Entscheidungen: {Array.from(decisionDates).join(', ') || 'keine'}
                </Text>
                <Text style={{ fontSize: 11, color: '#856404' }}>
                  User: {user?.email || 'nicht eingeloggt'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
        <TabBar />
      </View>
    );
  }

  // Insights Tab
  if (activeTab === 3) {
    const totalDecisions = completedDecisions.length;
    const yesCount = completedDecisions.filter(d => d.recommendation === 'JA').length;
    const noCount = completedDecisions.filter(d => d.recommendation === 'NEIN').length;
    const avgConfidence = totalDecisions > 0
      ? Math.round(completedDecisions.reduce((sum, d) => sum + d.percentage, 0) / totalDecisions)
      : 0;

    return (
      <View style={styles.container}>
        <StatusBar style={settings.darkMode ? "light" : "dark"} />
        <View style={{ height: STATUS_BAR_HEIGHT, backgroundColor: '#f8fafc' }} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.trackerContainer}>
            <Text style={styles.trackerTitle}>✨ Deine Insights</Text>

            {totalDecisions === 0 ? (
              <View style={styles.emptyInsights}>
                <Text style={styles.emptyInsightsIcon}>🎯</Text>
                <Text style={styles.emptyInsightsTitle}>Noch keine Daten</Text>
                <Text style={styles.emptyInsightsText}>
                  Treffe deine erste Entscheidung, um Insights zu sehen!
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.statsContainer}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{totalDecisions}</Text>
                    <Text style={styles.statLabel}>Entscheidungen</Text>
                  </View>
                  <View style={[styles.statBox, styles.statBoxGreen]}>
                    <Text style={[styles.statNumber, styles.statNumberGreen]}>{avgConfidence}%</Text>
                    <Text style={styles.statLabel}>Ø Klarheit</Text>
                  </View>
                </View>

                <View style={styles.insightSection}>
                  <Text style={styles.insightSectionTitle}>📊 Deine Balance</Text>
                  <View style={styles.balanceContainer}>
                    <View style={styles.balanceItem}>
                      <Text style={styles.balanceLabel}>✅ JA</Text>
                      <Text style={styles.balanceValue}>{yesCount}</Text>
                      <View style={styles.balanceBar}>
                        <View style={[styles.balanceBarFill, styles.balanceBarGreen, {
                          width: `${totalDecisions > 0 ? (yesCount / totalDecisions) * 100 : 0}%`
                        }]} />
                      </View>
                    </View>
                    <View style={styles.balanceItem}>
                      <Text style={styles.balanceLabel}>❌ NEIN</Text>
                      <Text style={styles.balanceValue}>{noCount}</Text>
                      <View style={styles.balanceBar}>
                        <View style={[styles.balanceBarFill, styles.balanceBarRed, {
                          width: `${totalDecisions > 0 ? (noCount / totalDecisions) * 100 : 0}%`
                        }]} />
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.insightSection}>
                  <Text style={styles.insightSectionTitle}>🎯 Erkenntnisse</Text>
                  {yesCount > noCount * 2 && (
                    <View style={styles.insightCard}>
                      <Text style={styles.insightCardIcon}>🚀</Text>
                      <Text style={styles.insightCardText}>
                        Du bist risikofreudig! {Math.round((yesCount / totalDecisions) * 100)}% deiner Entscheidungen waren positiv.
                      </Text>
                    </View>
                  )}
                  {noCount > yesCount * 2 && (
                    <View style={styles.insightCard}>
                      <Text style={styles.insightCardIcon}>🛡️</Text>
                      <Text style={styles.insightCardText}>
                        Du bist vorsichtig! {Math.round((noCount / totalDecisions) * 100)}% deiner Entscheidungen waren negativ.
                      </Text>
                    </View>
                  )}
                  {avgConfidence >= 70 && (
                    <View style={styles.insightCard}>
                      <Text style={styles.insightCardIcon}>💪</Text>
                      <Text style={styles.insightCardText}>
                        Starke Klarheit! Deine durchschnittliche Konfidenz liegt bei {avgConfidence}%.
                      </Text>
                    </View>
                  )}
                  {avgConfidence < 50 && (
                    <View style={styles.insightCard}>
                      <Text style={styles.insightCardIcon}>🤔</Text>
                      <Text style={styles.insightCardText}>
                        Unsicherheit ist normal. Nimm dir mehr Zeit für wichtige Entscheidungen.
                      </Text>
                    </View>
                  )}
                  {Math.abs(yesCount - noCount) <= 2 && totalDecisions >= 5 && (
                    <View style={styles.insightCard}>
                      <Text style={styles.insightCardIcon}>⚖️</Text>
                      <Text style={styles.insightCardText}>
                        Perfekte Balance! Du wägst Chancen und Risiken fair ab.
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        </ScrollView>
        <TabBar />
      </View>
    );
  }

  // Settings Tab (Tab 4 - Share functionality now integrated here)
  if (activeTab === 4) {
    // Show AccountScreen if requested
    if (showAccountScreen) {
      return (
        <View style={styles.container}>
          <AccountScreen onBack={() => setShowAccountScreen(false)} />
          <TabBar />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <StatusBar style={settings.darkMode ? "light" : "dark"} />
        <View style={{ height: STATUS_BAR_HEIGHT, backgroundColor: '#f8fafc' }} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.settingsContainer}>
            <Text style={styles.settingsTitle}>Einstellungen</Text>

            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>PERSONALISIERUNG</Text>
              <View style={styles.settingsGroup}>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Benachrichtigungen</Text>
                  <Switch
                    value={settings.notifications}
                    onValueChange={() => toggleSetting('notifications')}
                  />
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Analytics</Text>
                  <Switch
                    value={settings.analytics}
                    onValueChange={() => toggleSetting('analytics')}
                  />
                </View>
              </View>

              <Text style={styles.settingInfo}>
                💡 Dark Mode kommt in einem zukünftigen Update
              </Text>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>ÜBER</Text>
              <View style={styles.settingsGroup}>
                <TouchableOpacity
                  style={styles.settingButton}
                  onPress={() => Alert.alert('Tipps', 'Nutze den Vollständigen Modus für wichtige Entscheidungen und den Schnell-Modus für alltägliche Entscheidungen.')}
                >
                  <Text style={styles.settingButtonText}>Tipps für die Nutzung</Text>
                  <Text style={styles.settingArrow}>→</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.settingButton}
                  onPress={() => Alert.alert('FAQ', 'Wie funktioniert die App?\n\nDie App analysiert deine Entscheidungen basierend auf wissenschaftlichen Methoden und gibt dir eine fundierte Empfehlung.')}
                >
                  <Text style={styles.settingButtonText}>Häufig Gestellte Fragen</Text>
                  <Text style={styles.settingArrow}>→</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.settingButton}
                  onPress={() => Linking.openURL('mailto:vayze.app@gmail.com?subject=Vayze%20Feedback&body=Hallo%20Vayze-Team,%0A%0A')}
                >
                  <Text style={styles.settingButtonText}>Kontakt</Text>
                  <Text style={styles.settingArrow}>→</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.settingButton}
                  onPress={handleShare}
                >
                  <Text style={styles.settingButtonText}>📤 App teilen</Text>
                  <Text style={styles.settingArrow}>→</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.settingButton}
                  onPress={() => Alert.alert('Version', 'Entscheidungs-Assistent v1.0.0')}
                >
                  <Text style={styles.settingButtonText}>Bewerten und unterstützen</Text>
                  <Text style={styles.settingBadge}>V 1.0.0</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>DATEN</Text>
              <View style={styles.settingsGroup}>
                <TouchableOpacity
                  style={styles.settingButton}
                  onPress={handleExportData}
                >
                  <Text style={styles.settingButtonText}>Daten exportieren</Text>
                  <Text style={styles.settingArrow}>📥</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.settingButton, styles.dangerButton]}
                  onPress={handleDeleteAllData}
                >
                  <Text style={styles.dangerButtonText}>Alle Daten löschen</Text>
                  <Text style={styles.settingArrow}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Privacy & Legal Section */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>RECHTLICHES</Text>
              <View style={styles.settingsGroup}>
                <TouchableOpacity
                  style={styles.settingButton}
                  onPress={() => Linking.openURL('https://samuelstoeberl-prog.github.io/Vayze-Legal/index.html#privacy')}
                  accessibilityLabel="Datenschutzerklärung öffnen"
                  accessibilityHint="Öffnet die Datenschutzerklärung in deinem Browser"
                  accessibilityRole="link"
                >
                  <Text style={styles.settingButtonText}>Datenschutzerklärung</Text>
                  <Text style={styles.settingArrow}>↗</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.settingButton}
                  onPress={() => Linking.openURL('https://samuelstoeberl-prog.github.io/Vayze-Legal/index.html#terms')}
                  accessibilityLabel="Nutzungsbedingungen öffnen"
                  accessibilityHint="Öffnet die Nutzungsbedingungen in deinem Browser"
                  accessibilityRole="link"
                >
                  <Text style={styles.settingButtonText}>Nutzungsbedingungen</Text>
                  <Text style={styles.settingArrow}>↗</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.settingButton}
                  onPress={() => Linking.openURL('mailto:vayze.app@gmail.com?subject=Vayze%20Support&body=Hallo%20Vayze-Team,%0A%0ABitte%20beschreibe%20dein%20Anliegen:%0A%0A')}
                  accessibilityLabel="Support kontaktieren"
                  accessibilityHint="Öffnet dein E-Mail-Programm zum Kontaktieren des Supports"
                  accessibilityRole="link"
                >
                  <Text style={styles.settingButtonText}>Support kontaktieren</Text>
                  <Text style={styles.settingArrow}>✉️</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Account Section */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>KONTO</Text>
              <View style={styles.settingsGroup}>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Angemeldet als</Text>
                  <Text style={styles.settingValue}>{user?.name || user?.email || 'Benutzer'}</Text>
                </View>
                <TouchableOpacity
                  style={styles.settingButton}
                  onPress={() => setShowAccountScreen(true)}
                  accessibilityLabel="Konto-Einstellungen öffnen"
                  accessibilityRole="button"
                >
                  <Text style={styles.settingButtonText}>Konto-Einstellungen</Text>
                  <Text style={styles.settingArrow}>→</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.settingButton, styles.dangerButton]}
                  onPress={handleSignOut}
                  accessibilityLabel="Abmelden"
                  accessibilityRole="button"
                >
                  <Text style={styles.dangerButtonText}>Abmelden</Text>
                  <Text style={styles.settingArrow}>👋</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
        <TabBar />
      </View>
    );
  }

  // Main Assistant Tab (Tab 0 - default)
  if (activeTab === 0) {
    if (!hasStarted) {
      return (
      <View style={styles.container}>
        <StatusBar style={settings.darkMode ? "light" : "dark"} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.startContainer}>
            <Text style={styles.startEmoji}>🧠</Text>
            <Text style={styles.startTitle}>Entscheidungs-Assistent</Text>
            <Text style={styles.startSubtitle}>Treffe heute eine bessere Entscheidung – klar und durchdacht.</Text>

            {pendingResume && (
              <View style={styles.resumeBox}>
                <Text style={styles.resumeTitle}>Willkommen zurück! 👋</Text>
                <Text style={styles.resumeText}>Du hast eine angefangene Analyse:</Text>
                <Text style={styles.resumeDecision}>"{pendingResume.decision}"</Text>
                <View style={styles.resumeButtons}>
                  <TouchableOpacity
                    style={styles.resumeButton}
                    onPress={() => {
                      setDecision(pendingResume.decision || '');
                      setAllAnswers(pendingResume.answers || {});
                      setCurrentStep(pendingResume.step || 0);
                      setShowResults(pendingResume.showResults || false);
                      setHasStarted(true);
                      setPendingResume(null);
                    }}
                    accessibilityLabel="Angefangene Analyse fortsetzen"
                    accessibilityRole="button"
                  >
                    <Text style={styles.resumeButtonText}>Fortsetzen</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.resumeButtonSecondary}
                    onPress={async () => {
                      setPendingResume(null);
                      if (user && user.email) {
                        await removeUserData(user.email, 'decisionData');
                      }
                    }}
                    accessibilityLabel="Neue Analyse starten"
                    accessibilityRole="button"
                  >
                    <Text style={styles.resumeButtonSecondaryText}>Neu starten</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.modeSelector}>
              <TouchableOpacity
                style={[styles.modeButton, decisionMode === 'full' && styles.modeButtonActive]}
                onPress={() => setDecisionMode('full')}
                accessibilityLabel="Vollständiger Modus: 6 Schritte"
                accessibilityRole="button"
                accessibilityState={{ selected: decisionMode === 'full' }}
              >
                <Text style={styles.modeEmoji}>🎯</Text>
                <Text style={styles.modeTitle}>Vollständig</Text>
                <Text style={styles.modeSubtitle}>6 Schritte</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, decisionMode === 'quick' && styles.modeButtonActive]}
                onPress={() => setDecisionMode('quick')}
                accessibilityLabel="Schneller Modus: 2 Schritte"
                accessibilityRole="button"
                accessibilityState={{ selected: decisionMode === 'quick' }}
              >
                <Text style={styles.modeEmoji}>⚡</Text>
                <Text style={styles.modeTitle}>Schnell</Text>
                <Text style={styles.modeSubtitle}>2 Schritte</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  {decisionMode === 'full'
                    ? 'Durchdachte Analyse in 6 klaren Schritten.'
                    : 'Fokussierte Entscheidung in 2 essentiellen Schritten.'}
                </Text>
              </View>

              <Text style={styles.label}>Wähle Kategorien (mehrere möglich):</Text>
              <View style={styles.categoryGrid}>
                {categories.map(cat => {
                  const isSelected = category.includes(cat);
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryButton, isSelected && styles.categoryButtonActive]}
                      onPress={() => {
                        if (isSelected) {
                          // Kategorie entfernen, aber mindestens eine muss ausgewählt bleiben
                          if (category.length > 1) {
                            setCategory(category.filter(c => c !== cat));
                          }
                        } else {
                          // Kategorie hinzufügen
                          setCategory([...category, cat]);
                        }
                      }}
                      accessibilityLabel={`Kategorie ${cat}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.label}>Beschreibe deine Entscheidung:</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                value={decision}
                onChangeText={(text) => text.length <= 500 && setDecision(text)}
                placeholder="z.B. Soll ich ein neues Auto kaufen?"
              />
              <View style={styles.charCount}>
                <Text style={decision.trim().length >= 10 ? styles.charCountValid : styles.charCountInvalid}>
                  {decision.trim().length >= 10 ? '✓ Perfekt!' : `Noch ${10 - decision.trim().length} Zeichen`}
                </Text>
                <Text style={styles.charCountTotal}>{decision.length}/500</Text>
              </View>

              <TouchableOpacity
                style={[styles.startAnalysisButton, decision.trim().length < 10 && styles.startAnalysisButtonDisabled]}
                onPress={() => decision.trim().length >= 10 && setHasStarted(true)}
                disabled={decision.trim().length < 10}
                accessibilityLabel={decision.trim().length >= 10 ? 'Analyse starten' : 'Beschreibe zuerst deine Entscheidung'}
                accessibilityRole="button"
                accessibilityState={{ disabled: decision.trim().length < 10 }}
              >
                <Text style={styles.startAnalysisButtonText}>
                  {decision.trim().length >= 10 ? 'Analyse starten 🚀' : 'Beschreibe deine Entscheidung'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        <TabBar />
      </View>
    );
  }

  if (showResults) {
    const result = calculateDecision();
    const isPositive = result.recommendation === 'JA';
    const isNegative = result.recommendation === 'NEIN';
    const message = isPositive
      ? 'Dieser Weg könnte der richtige sein – du triffst durchdachte Entscheidungen! 🎉'
      : isNegative
      ? 'Die Analyse rät zur Vorsicht. Überlege es dir nochmal. 🤔'
      : 'Die Signale sind gemischt. Sammle mehr Informationen. 🔍';

    return (
      <View style={styles.container}>
        <StatusBar style={settings.darkMode ? "light" : "dark"} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>✨ Deine Analyse</Text>
              <TouchableOpacity
                onPress={() => setIsFavorite(!isFavorite)}
                accessibilityLabel={isFavorite ? 'Als Favorit entfernen' : 'Als Favorit markieren'}
                accessibilityRole="button"
              >
                <Text style={styles.favoriteIcon}>{isFavorite ? '⭐' : '☆'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.resultsTags}>
              <View style={styles.resultTag}>
                <Text style={styles.resultTagText}>{category}</Text>
              </View>
              <View style={styles.resultTagSecondary}>
                <Text style={styles.resultTagSecondaryText}>
                  {decisionMode === 'quick' ? '⚡ Schnell' : '🎯 Vollständig'}
                </Text>
              </View>
            </View>

            <View style={styles.decisionBox}>
              <Text style={styles.decisionBoxText}>{decision}</Text>
            </View>

            <View style={[
              styles.resultCard,
              isPositive && styles.resultCardGreen,
              isNegative && styles.resultCardRed,
              !isPositive && !isNegative && styles.resultCardYellow
            ]}>
              <Text style={styles.resultEmoji}>
                {isPositive ? '✓' : isNegative ? '✕' : '⚠'}
              </Text>
              <Text style={styles.resultRecommendation}>{result.recommendation}</Text>
              <View style={styles.resultBadge}>
                <Text style={styles.resultBadgeText}>Konfidenz: {result.percentage}%</Text>
              </View>
              <Text style={styles.resultMessage}>{message}</Text>
            </View>

            {/* Explainability - Warum diese Empfehlung? */}
            {result.factors && result.factors.length > 0 && (
              <View style={styles.explainabilityBox}>
                <Text style={styles.explainabilityTitle}>💡 Warum {result.recommendation}?</Text>
                {result.factors.map((factor, idx) => (
                  <View key={idx} style={[
                    styles.factorItem,
                    factor.type === 'positive' && styles.factorPositive,
                    factor.type === 'negative' && styles.factorNegative,
                    factor.type === 'neutral' && styles.factorNeutral,
                    factor.type === 'info' && styles.factorInfo
                  ]}>
                    <Text style={styles.factorIcon}>{factor.icon}</Text>
                    <Text style={styles.factorText}>{factor.text}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.journalBox}>
              <Text style={styles.journalTitle}>📝 Was hast du gelernt?</Text>
              <TextInput
                style={styles.journalInput}
                multiline
                numberOfLines={3}
                value={journal}
                onChangeText={setJournal}
                placeholder="Deine Reflexion... (optional)"
              />
              <Text style={styles.journalHint}>Halte fest, was du aus dieser Entscheidung mitnimmst.</Text>
            </View>

            {/* Next Steps CTA */}
            {!showNextSteps && (
              <TouchableOpacity
                style={styles.nextStepsCTA}
                onPress={() => setShowNextSteps(true)}
              >
                <Text style={styles.nextStepsCTAText}>→ Nächste Schritte definieren</Text>
                <Text style={styles.nextStepsCTAHint}>Optional: Wandle diese Gedanken in Taten um</Text>
              </TouchableOpacity>
            )}

            {/* Next Steps Form */}
            {showNextSteps && (
              <View style={styles.nextStepsBox}>
                <Text style={styles.nextStepsTitle}>🎯 Kleine nächste Schritte</Text>
                <Text style={styles.nextStepsSubtitle}>
                  Was könntest du tun? (max. 3 einfache Schritte)
                </Text>

                {nextSteps.map((step, index) => (
                  <View key={index} style={styles.nextStepRow}>
                    <Text style={styles.nextStepNumber}>{index + 1}.</Text>
                    <TextInput
                      style={styles.nextStepInput}
                      value={step}
                      onChangeText={(text) => {
                        const updated = [...nextSteps];
                        updated[index] = text;
                        setNextSteps(updated);
                      }}
                      placeholder={`Schritt ${index + 1} (optional)`}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.addToBoardButton}
                  onPress={() => {
                    // Filter non-empty steps
                    const validSteps = nextSteps.filter(s => s.trim().length > 0);
                    if (validSteps.length > 0) {
                      // Add each step as a task card to the board
                      validSteps.forEach((step, index) => {
                        addCard({
                          title: step,
                          description: `Aus Entscheidung: "${decision.substring(0, 50)}${decision.length > 50 ? '...' : ''}"`,
                          type: 'task',
                          priority: 'medium',
                          category: 'todo',
                          status: 'todo',
                          tags: ['aus-entscheidung'],
                          linkedDecisionId: Date.now(), // Link to decision
                        });
                      });

                      Alert.alert(
                        '✓ Zum Board hinzugefügt!',
                        `${validSteps.length} ${validSteps.length === 1 ? 'Schritt wurde' : 'Schritte wurden'} als Tasks zum Board hinzugefügt.`,
                        [
                          {
                            text: 'Zum Board',
                            onPress: () => {
                              setShowNextSteps(false);
                              setActiveTab(1);
                            },
                          },
                          { text: 'OK' },
                        ]
                      );
                      setNextSteps(['', '', '']); // Reset form
                    } else {
                      Alert.alert('Keine Schritte', 'Bitte gib mindestens einen Schritt ein.');
                    }
                  }}
                >
                  <Text style={styles.addToBoardButtonText}>
                    Zum Board hinzufügen
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => setShowNextSteps(false)}
                >
                  <Text style={styles.skipButtonText}>Überspringen</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.resetButton} onPress={resetDecisionState}>
              <Text style={styles.resetButtonText}>Neue Entscheidung analysieren 🔄</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <TabBar />
      </View>
    );
  }

  const step = currentSteps[currentStep];
  const textValue = allAnswers[`step${currentStep}_text`] || '';
  const consequenceValue = allAnswers[`step${currentStep}_consequence`] || '';
  const hasRating = allAnswers[`step${currentStep}_rating`];

  const skipStep = () => {
    if (currentStep < currentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleConsequenceNext = () => {
    if (currentStep < currentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style={settings.darkMode ? "light" : "dark"} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepProgress}>Schritt {currentStep + 1} von {currentSteps.length}</Text>
            <Text style={styles.stepEmoji}>{step.emoji}</Text>
          </View>

          <View style={styles.progressBar}>
            {currentSteps.map((_, i) => (
              <View
                key={i}
                style={[styles.progressSegment, i <= currentStep && styles.progressSegmentActive]}
              />
            ))}
          </View>

          <View style={styles.stepDecisionBox}>
            <Text style={styles.stepDecisionText}>{decision}</Text>
          </View>

          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepQuestion}>{step.question}</Text>

          {step.type === 'combo' ? (
            <View>
              <View style={styles.optionsContainer}>
                {step.options.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.optionButton, hasRating === opt && styles.optionButtonActive]}
                    onPress={() => handleOptionClick(opt)}
                  >
                    <Text style={[styles.optionText, hasRating === opt && styles.optionTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {hasRating && (
                <View style={styles.followUpBox}>
                  <Text style={styles.followUpTitle}>{step.followUp}</Text>
                  <TextInput
                    style={styles.followUpInput}
                    multiline
                    numberOfLines={3}
                    value={consequenceValue}
                    onChangeText={(text) => updateAnswer(`step${currentStep}_consequence`, text)}
                    placeholder="Die schlimmste Konsequenz wäre..."
                  />
                  <TouchableOpacity
                    style={[styles.nextButton, consequenceValue.trim().length === 0 && styles.nextButtonDisabled]}
                    onPress={handleConsequenceNext}
                    disabled={consequenceValue.trim().length === 0}
                  >
                    <Text style={styles.nextButtonText}>Weiter →</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : step.type === 'text' ? (
            <View>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={4}
                value={textValue}
                onChangeText={(text) => updateAnswer(`step${currentStep}_text`, text)}
                placeholder="Deine Gedanken..."
              />
              {step.followUp && (
                <View style={styles.followUpBox}>
                  <Text style={styles.followUpTitle}>{step.followUp}</Text>
                  <View style={styles.optionsContainer}>
                    {step.followUpOptions.map(opt => (
                      <TouchableOpacity
                        key={opt}
                        style={styles.optionButton}
                        onPress={() => handleOptionClick(opt)}
                      >
                        <Text style={styles.optionText}>{opt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              {step.options.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={styles.optionButton}
                  onPress={() => handleOptionClick(opt)}
                >
                  <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.stepNavigation}>
            {currentStep > 0 && (
              <TouchableOpacity onPress={() => setCurrentStep(currentStep - 1)}>
                <Text style={styles.backButton}>← Zurück</Text>
              </TouchableOpacity>
            )}
            {step.optional && (
              <TouchableOpacity onPress={skipStep} style={styles.skipButtonContainer}>
                <Text style={styles.skipButtonText}>Überspringen →</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
      <TabBar />
    </View>
  );
  }

  // If no tab matches, return null (should never happen)
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollView: {
    flex: 1,
  },
  // Onboarding Styles
  onboardingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    paddingTop: 100,
  },
  onboardingEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  onboardingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  onboardingDescription: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 28,
  },
  onboardingDots: {
    flexDirection: 'row',
    marginBottom: 48,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#3b82f6',
    width: 24,
  },
  onboardingButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  skipButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 16,
  },
  nextButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  startButton: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabIconActive: {
    fontSize: 26,
  },
  tabLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  // Tracker
  trackerContainer: {
    padding: 24,
  },
  trackerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#dbeafe',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  statBoxGreen: {
    backgroundColor: '#d1fae5',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  statNumberGreen: {
    color: '#10b981',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  monthButton: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  monthButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  emptyDay: {
    width: '13.28%',
    aspectRatio: 1,
  },
  calendarDay: {
    width: '13.28%',
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayActive: {
    backgroundColor: '#10b981',
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  calendarDayTextActive: {
    color: 'white',
  },
  // Share
  shareContainer: {
    padding: 24,
  },
  shareTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
  },
  shareInfoBox: {
    backgroundColor: '#dbeafe',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  shareInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  shareInfoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  shareButton: {
    backgroundColor: '#3b82f6',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  socialContainer: {
    marginTop: 24,
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  socialButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  socialButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  // Settings
  settingsContainer: {
    padding: 24,
  },
  settingsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 32,
  },
  settingsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9ca3af',
    marginBottom: 12,
    letterSpacing: 1,
  },
  settingsGroup: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingButtonText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  settingArrow: {
    fontSize: 16,
    color: '#d1d5db',
  },
  settingBadge: {
    fontSize: 14,
    color: '#6b7280',
  },
  dangerButton: {
    borderBottomWidth: 0,
  },
  dangerButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
  },
  // Start Screen
  startContainer: {
    padding: 24,
    paddingTop: 48,
  },
  startEmoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  startTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  startSubtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  resumeBox: {
    backgroundColor: '#3b82f6',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  resumeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  resumeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  resumeDecision: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  resumeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  resumeButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  resumeButtonText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  resumeButtonSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  resumeButtonSecondaryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  modeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modeSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  inputContainer: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 24,
  },
  infoBox: {
    backgroundColor: '#dbeafe',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#1f2937',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    minWidth: '30%',
    maxWidth: '32%',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
    numberOfLines: 1,
  },
  categoryTextActive: {
    color: 'white',
  },
  textArea: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 24,
  },
  charCountValid: {
    color: '#10b981',
    fontWeight: '600',
  },
  charCountInvalid: {
    color: '#9ca3af',
  },
  charCountTotal: {
    color: '#9ca3af',
  },
  startAnalysisButton: {
    backgroundColor: '#3b82f6',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  startAnalysisButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  startAnalysisButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Results
  resultsContainer: {
    padding: 24,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  favoriteIcon: {
    fontSize: 32,
  },
  resultsTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  resultTag: {
    backgroundColor: '#dbeafe',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  resultTagText: {
    color: '#1e40af',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultTagSecondary: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  resultTagSecondaryText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
  decisionBox: {
    backgroundColor: '#dbeafe',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  decisionBoxText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  resultCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  resultCardGreen: {
    backgroundColor: '#10b981',
  },
  resultCardRed: {
    backgroundColor: '#ef4444',
  },
  resultCardYellow: {
    backgroundColor: '#f59e0b',
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultRecommendation: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  resultBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 16,
  },
  resultBadgeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  resultMessage: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  journalBox: {
    backgroundColor: '#f3f4f6',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  journalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  journalInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: 'white',
  },
  journalHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  nextStepsCTA: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1.5,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  nextStepsCTAText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 4,
  },
  nextStepsCTAHint: {
    fontSize: 12,
    color: '#64748b',
  },
  nextStepsBox: {
    backgroundColor: '#fafafa',
    padding: 20,
    borderRadius: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  nextStepsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  nextStepsSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  nextStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  nextStepNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
    width: 20,
  },
  nextStepInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  addToBoardButton: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  addToBoardButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  skipButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  resetButton: {
    backgroundColor: '#1f2937',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Steps
  stepContainer: {
    padding: 24,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepProgress: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  stepEmoji: {
    fontSize: 32,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  progressSegment: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  progressSegmentActive: {
    backgroundColor: '#3b82f6',
  },
  stepDecisionBox: {
    backgroundColor: '#dbeafe',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  stepDecisionText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  // Explainability Styles
  explainabilityBox: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  explainabilityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  factorPositive: {
    backgroundColor: '#d1fae5',
  },
  factorNegative: {
    backgroundColor: '#fee2e2',
  },
  factorNeutral: {
    backgroundColor: '#e5e7eb',
  },
  factorInfo: {
    backgroundColor: '#fef3c7',
  },
  factorIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  factorText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  // Insights Tab Styles
  emptyInsights: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyInsightsIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyInsightsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyInsightsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  insightSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  insightSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  balanceContainer: {
    gap: 16,
  },
  balanceItem: {
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  balanceBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  balanceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  balanceBarGreen: {
    backgroundColor: '#10b981',
  },
  balanceBarRed: {
    backgroundColor: '#ef4444',
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  insightCardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  insightCardText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  stepQuestion: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 16,
    borderRadius: 12,
  },
  optionButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  optionTextActive: {
    color: '#1e40af',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  followUpBox: {
    backgroundColor: '#f9fafb',
    padding: 24,
    borderRadius: 16,
    marginTop: 16,
  },
  followUpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  followUpInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: 'white',
    marginBottom: 12,
  },
  nextButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  stepNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  backButton: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  skipButtonContainer: {
    marginLeft: 'auto',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
});

// Root component with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

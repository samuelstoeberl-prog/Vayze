import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Share, Linking, Switch, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import BoardView from './components/Board/BoardView';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import StandaloneAuthScreen from './screens/StandaloneAuthScreen';
import SplashScreen from './components/SplashScreen';
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
import { logEvent as logAnalyticsEvent } from './utils/analytics';
import {
  VollstaendigIcon, SchnellIcon, BrainIcon, BoardIcon, TrackerIcon, InsightsIcon, SettingsIcon,
  CircleIcon, CheckCircleIcon, ZapIcon, PlusIcon, SearchIcon, TrendingUpIcon, LightbulbIcon, TargetIcon, CalendarIcon
} from './components/Icons';
import { LinearGradient } from 'expo-linear-gradient';
import firebaseMessagingService from './services/firebaseMessagingService';
import pushNotificationService from './services/pushNotificationService';
import JournalDashboardScreen from './screens/JournalDashboardScreen';

function MainApp() {
  const { isAuthenticated, isLoading: authLoading, signOut, signIn, user } = useAuth();
  const insets = useSafeAreaInsets();

  const stateMachine = useAppStateMachine();

  const addCard = useCardStore((state) => state.addCard);
  const setCurrentUser = useCardStore((state) => state.setCurrentUser);
  const loadCardsFromStorage = useCardStore((state) => state.loadFromStorage);
  const clearCards = useCardStore((state) => state.clearCards);

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
  const [category, setCategory] = useState(['Leben']); 
  const [isFavorite, setIsFavorite] = useState(false);
  const [journal, setJournal] = useState('');
  const [showNextSteps, setShowNextSteps] = useState(false);
  const [nextSteps, setNextSteps] = useState(['', '', '']);
  const [currentDecisionId, setCurrentDecisionId] = useState(null);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    analytics: true,
  });
  const [pendingResume, setPendingResume] = useState(null);

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [currentReviewDecision, setCurrentReviewDecision] = useState(null);
  const [hasAutoSaved, setHasAutoSaved] = useState(false);
  const [showAccountScreen, setShowAccountScreen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showJournalScreen, setShowJournalScreen] = useState(false);

  // Firbase Massaging

  // Push Notifications Setup with Expo
  useEffect(() => {
    let cleanup;

    async function setupPushNotifications() {
      try {
        // Initialize push notification handlers
        cleanup = await pushNotificationService.initialize();

        // Only setup if user is authenticated
        if (isAuthenticated && user?.email) {
          // Request permission and get token
          const token = await firebaseMessagingService.requestPermissionAndGetToken();

          if (token) {
            // Save token to Firestore
            await firebaseMessagingService.saveTokenToFirestore(user.email);
            console.log('✅ Push notifications enabled for:', user.email);

            // Subscribe to topics (optional)
            await firebaseMessagingService.subscribeToTopic('all_users');

            // Clean up old tokens
            await firebaseMessagingService.cleanupInvalidTokens(user.email);
          }

          // Check if app was opened from notification
          await pushNotificationService.getInitialNotification();
        }
      } catch (error) {
        console.error('Push notification setup error:', error);
      }
    }

    setupPushNotifications();

    return () => {
      if (cleanup) cleanup();
    };
  }, [isAuthenticated, user]);


  const loadAllData = async () => {
    try {
      
      if (!user || !user.email) {
                return;
      }

            await migrateToUserScope(user.email, 'decisions', 'completedDecisions');
      await migrateToUserScope(user.email, 'settings', 'appSettings');
      await migrateToUserScope(user.email, 'decisionData');

      const savedDecisions = await loadUserData(user.email, 'decisions', []);
      console.log('Loaded decisions:', savedDecisions.length, 'decisions');
            setCompletedDecisions(savedDecisions);

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
      console.error('Error loading user data:', error);
    }
  };

  const saveData = async () => {
    try {
      if (!user || !user.email) {
                return;
      }
      await saveUserData(user.email, 'decisionData', {
        decision, answers: allAnswers, step: currentStep, showResults,
      });
    } catch (error) {
      console.error('Error saving decision data:', error);
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
    setCurrentDecisionId(null);
    setDecisionMode('full');
    setHasAutoSaved(false);
    if (removeData && user && user.email) {
      await removeUserData(user.email, 'decisionData');
    }
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

  useEffect(() => {
    if (isAuthenticated && user && user.email) {
      
      setCurrentUser(user.email);

      loadAllData();
      loadCardsFromStorage(user.email);

      setTimeout(() => {
        const dueReviews = getDueReviews();
        if (dueReviews.length > 0 && !currentReviewDecision) {
          setCurrentReviewDecision(dueReviews[0]);
          setReviewModalVisible(true);
        }
      }, 2000); 
    } else {
      
      setCompletedDecisions([]);
      setSettings({ notifications: true, darkMode: false, analytics: true });
      clearCards();
      clearCurrentDecisionUser();
    }
  }, [user?.email, isAuthenticated]); 

  // Auto-save decision when results are shown
  useEffect(() => {
    const autoSaveDecision = async () => {
      if (showResults && !hasAutoSaved && user && user.email && decision.trim().length >= 10) {
        try {
          const result = calculateDecision();
          const now = new Date();
          const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();

          const decisionId = Date.now();
          const newDecision = {
            id: decisionId,
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

          const updated = [...completedDecisions, newDecision];
          setCompletedDecisions(updated);
          setCurrentDecisionId(decisionId);
          console.log('Auto-saved decision with ID:', decisionId);

          await saveUserData(user.email, 'decisions', updated);
          setHasAutoSaved(true);
        } catch (error) {
          console.error('Error auto-saving decision:', error);
        }
      }
    };

    autoSaveDecision();
  }, [showResults, hasAutoSaved, user?.email, decision, category, isFavorite, journal, decisionMode]); 

  useEffect(() => {
    if (activeTab === 2) {
      const now = new Date();
      setCurrentMonth(now.getMonth());
      setCurrentYear(now.getFullYear());
    }
  }, [activeTab]);

  if (showSplash) {
        return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!isAuthenticated) {
    return <StandaloneAuthScreen />;
  }

  const handleTabPress = async (tabIndex, tabName) => {
    setActiveTab(tabIndex);

    if (settings.analytics) {
      await logAnalyticsEvent('tab_changed', {
        tab_name: tabName,
        tab_index: tabIndex
      });
    }
  };

  const TabBar = () => {
    const tabs = [
      { IconComponent: BrainIcon, label: 'Assistent', index: 0, activeColor: '#3B82F6' },
      { IconComponent: BoardIcon, label: 'Board', index: 1, activeColor: '#3B82F6' },
      { IconComponent: TrackerIcon, label: 'Tracker', index: 2, activeColor: '#10B981' },
      { IconComponent: InsightsIcon, label: 'Insights', index: 3, activeColor: '#A855F7' },
      { IconComponent: SettingsIcon, label: 'Settings', index: 4, activeColor: '#64748B' },
    ];

    return (
      <View style={styles.tabBar}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.index;
          return (
            <TouchableOpacity
              key={tab.index}
              style={styles.tabItem}
              onPress={() => handleTabPress(tab.index, tab.label)}
            >
              <tab.IconComponent size={24} isActive={isActive} />
              <Text style={[
                styles.tabLabel,
                isActive && { color: tab.activeColor, fontWeight: '600' }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  if (activeTab === 1) {
    return (
      <View style={styles.container}>
        <BoardView
          onNavigateToDecision={(card) => {
            
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

  if (activeTab === 2) {
    // Show Journal Dashboard if state is active
    if (showJournalScreen) {
      return (
        <JournalDashboardScreen
          navigation={{
            goBack: () => setShowJournalScreen(false)
          }}
          completedDecisions={completedDecisions}
        />
      );
    }

    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const decisionDates = new Set(
      completedDecisions
        .filter(d => {
          const decisionDate = new Date(d.date);
          return decisionDate.getMonth() === currentMonth && decisionDate.getFullYear() === currentYear;
        })
        .map(d => {
          const decisionDate = new Date(d.date);
          return decisionDate.getDate();
        })
    );

    const emptyDays = Array.from({ length: firstDayIndex }, (_, i) => ({ isEmpty: true, key: `empty-${i}` }));
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNumber = i + 1;
      const hasDecision = decisionDates.has(dayNumber);
      return { day: dayNumber, hasDecision, isEmpty: false };
    });
    const allDays = [...emptyDays, ...days];

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {}
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.trackerHeader, { paddingTop: insets.top + 56 }]}
        >
          <View style={styles.trackerHeaderContent}>
            <View style={styles.trackerTitleRow}>
              <TrendingUpIcon size={32} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.insightsTitle}>Dein Fortschritt</Text>
            </View>

            {}
            <View style={styles.trackerStatsGrid}>
              <View style={styles.trackerStatCard}>
                <Text style={styles.trackerStatLabel}>Entscheidungen</Text>
                <Text style={styles.trackerStatNumber}>{completedDecisions?.length || 0}</Text>
              </View>
              <View style={styles.trackerStatCard}>
                <Text style={styles.trackerStatLabel}>Tage Streak</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <Text style={styles.trackerStatNumber}>{getCurrentStreak()}</Text>
                  <View style={styles.trackerFireBadge}>
                    <Text style={styles.trackerFireEmoji}>🔥</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {}
          <View style={styles.trackerCalendarCard}>
            {}
            <View style={styles.trackerMonthNav}>
              <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.trackerMonthButton}>
                <Text style={styles.trackerMonthArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.trackerMonthText}>{monthNames[currentMonth]} {currentYear}</Text>
              <TouchableOpacity onPress={() => changeMonth('next')} style={styles.trackerMonthButton}>
                <Text style={styles.trackerMonthArrow}>→</Text>
              </TouchableOpacity>
            </View>

            {}
            <View style={styles.trackerWeekDays}>
              {weekDays.map(day => (
                <Text key={day} style={styles.trackerWeekDay}>{day}</Text>
              ))}
            </View>

            {}
            <View style={styles.trackerCalendarGrid}>
              {allDays.map((d, idx) => (
                d.isEmpty ? (
                  <View key={d.key} style={styles.trackerCalendarDay} />
                ) : (
                  <TouchableOpacity
                    key={d.day}
                    style={[styles.trackerCalendarDay, d.hasDecision && styles.trackerCalendarDayActive]}
                  >
                    <Text style={[styles.trackerCalendarDayText, d.hasDecision && styles.trackerCalendarDayActiveText]}>
                      {d.day}
                    </Text>
                  </TouchableOpacity>
                )
              ))}
            </View>
          </View>

          {}
          <View style={styles.trackerSummaryCard}>
            <Text style={styles.trackerSummaryTitle}>Gesamt: {completedDecisions?.length || 0} Entscheidungen</Text>
            <Text style={styles.trackerSummarySubtitle}>Dieser Monat: {decisionDates?.size || 0} Entscheidungen</Text>
          </View>
        </ScrollView>

        {/* Floating Journal Button */}
        <TouchableOpacity
          style={styles.floatingJournalButton}
          onPress={() => setShowJournalScreen(true)}
        >
          <Text style={styles.floatingJournalIcon}>📓</Text>
          <Text style={styles.floatingJournalText}>Journal</Text>
        </TouchableOpacity>

        <TabBar />
      </View>
    );
  }

  if (activeTab === 3) {
    
    const totalDecisions = completedDecisions.length;
    const yesCount = completedDecisions.filter(d => d.recommendation === 'JA').length;
    const noCount = completedDecisions.filter(d => d.recommendation === 'NEIN').length;
    const avgConfidence = totalDecisions > 0
      ? Math.round(completedDecisions.reduce((sum, d) => sum + d.percentage, 0) / totalDecisions)
      : 0;

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {}
        <LinearGradient
          colors={['#a855f7', '#9333ea']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.insightsHeader, { paddingTop: insets.top + 56 }]}
        >
          <View style={styles.insightsHeaderContent}>
            <View style={styles.insightsTitleRow}>
              <LightbulbIcon size={32} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.insightsTitle}>Deine Insights</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {totalDecisions === 0 ? (
            
            <View style={styles.insightsEmpty}>
              {}
              <View style={styles.lightbulbContainer}>
                <View style={[styles.lightbulbPulse, styles.lightbulbPulse1]} />
                <View style={[styles.lightbulbPulse, styles.lightbulbPulse2]} />
                <View style={[styles.lightbulbPulse, styles.lightbulbPulse3]} />
                <LightbulbIcon size={64} color="#A855F7" strokeWidth={1.5} />
              </View>

              <Text style={styles.insightsEmptyTitle}>Noch keine Daten</Text>
              <Text style={styles.insightsEmptyText}>
                Treffe deine erste Entscheidung, um personalisierte Insights zu erhalten
              </Text>

              {}
              <View style={styles.insightsPreviewGrid}>
                <View style={styles.insightsPreviewCard}>
                  <View style={styles.insightsPreviewIconBox}>
                    <TrendingUpIcon size={20} color="#9333EA" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.insightsPreviewTitle}>Entscheidungsmuster</Text>
                  <Text style={styles.insightsPreviewText}>
                    Erkenne deine Trends und Präferenzen
                  </Text>
                </View>

                <View style={styles.insightsPreviewCard}>
                  <View style={styles.insightsPreviewIconBox}>
                    <TargetIcon size={20} color="#9333EA" />
                  </View>
                  <Text style={styles.insightsPreviewTitle}>Erfolgsquote</Text>
                  <Text style={styles.insightsPreviewText}>
                    Wie oft entscheidest du dich für "Ja"?
                  </Text>
                </View>

                <View style={styles.insightsPreviewCard}>
                  <View style={styles.insightsPreviewIconBox}>
                    <CalendarIcon size={20} color="#9333EA" />
                  </View>
                  <Text style={styles.insightsPreviewTitle}>Zeitanalyse</Text>
                  <Text style={styles.insightsPreviewText}>
                    Wann triffst du die besten Entscheidungen?
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            
            <>
              {}
              <View style={styles.insightsStatsGrid}>
                <View style={styles.insightsStatCard}>
                  <Text style={styles.insightsStatNumber}>{totalDecisions}</Text>
                  <Text style={styles.insightsStatLabel}>Entscheidungen</Text>
                </View>
                <View style={styles.insightsStatCard}>
                  <Text style={[styles.insightsStatNumber, { color: '#9333EA' }]}>{avgConfidence}%</Text>
                  <Text style={styles.insightsStatLabel}>Ø Klarheit</Text>
                </View>
              </View>

              {}
              <View style={styles.insightsSection}>
                <Text style={styles.insightsSectionTitle}>Deine Balance</Text>
                <View style={styles.insightsBalanceContainer}>
                  <View style={styles.insightsBalanceItem}>
                    <View style={styles.insightsBalanceHeader}>
                      <Text style={styles.insightsBalanceLabel}>JA</Text>
                      <Text style={styles.insightsBalanceValue}>{yesCount}</Text>
                    </View>
                    <View style={styles.insightsBalanceBar}>
                      <View style={[styles.insightsBalanceBarFill, styles.insightsBalanceBarGreen, {
                        width: `${totalDecisions > 0 ? (yesCount / totalDecisions) * 100 : 0}%`
                      }]} />
                    </View>
                  </View>
                  <View style={styles.insightsBalanceItem}>
                    <View style={styles.insightsBalanceHeader}>
                      <Text style={styles.insightsBalanceLabel}>NEIN</Text>
                      <Text style={styles.insightsBalanceValue}>{noCount}</Text>
                    </View>
                    <View style={styles.insightsBalanceBar}>
                      <View style={[styles.insightsBalanceBarFill, styles.insightsBalanceBarPurple, {
                        width: `${totalDecisions > 0 ? (noCount / totalDecisions) * 100 : 0}%`
                      }]} />
                    </View>
                  </View>
                </View>
              </View>

              {}
              <View style={styles.insightsSection}>
                <Text style={styles.insightsSectionTitle}>Erkenntnisse</Text>
                {yesCount > noCount * 2 && (
                  <View style={styles.insightsInsightCard}>
                    <View style={styles.insightsInsightIconBox}>
                      <Text style={styles.insightsInsightIcon}>🚀</Text>
                    </View>
                    <Text style={styles.insightsInsightText}>
                      Du bist risikofreudig! {Math.round((yesCount / totalDecisions) * 100)}% deiner Entscheidungen waren positiv.
                    </Text>
                  </View>
                )}
                {noCount > yesCount * 2 && (
                  <View style={styles.insightsInsightCard}>
                    <View style={styles.insightsInsightIconBox}>
                      <Text style={styles.insightsInsightIcon}>🛡️</Text>
                    </View>
                    <Text style={styles.insightsInsightText}>
                      Du bist vorsichtig! {Math.round((noCount / totalDecisions) * 100)}% deiner Entscheidungen waren negativ.
                    </Text>
                  </View>
                )}
                {avgConfidence >= 70 && (
                  <View style={styles.insightsInsightCard}>
                    <View style={styles.insightsInsightIconBox}>
                      <Text style={styles.insightsInsightIcon}>💪</Text>
                    </View>
                    <Text style={styles.insightsInsightText}>
                      Starke Klarheit! Deine durchschnittliche Konfidenz liegt bei {avgConfidence}%.
                    </Text>
                  </View>
                )}
                {avgConfidence < 50 && (
                  <View style={styles.insightsInsightCard}>
                    <View style={styles.insightsInsightIconBox}>
                      <Text style={styles.insightsInsightIcon}>🤔</Text>
                    </View>
                    <Text style={styles.insightsInsightText}>
                      Unsicherheit ist normal. Nimm dir mehr Zeit für wichtige Entscheidungen.
                    </Text>
                  </View>
                )}
                {Math.abs(yesCount - noCount) <= 2 && totalDecisions >= 5 && (
                  <View style={styles.insightsInsightCard}>
                    <View style={styles.insightsInsightIconBox}>
                      <Text style={styles.insightsInsightIcon}>⚖️</Text>
                    </View>
                    <Text style={styles.insightsInsightText}>
                      Perfekte Balance! Du wägst Chancen und Risiken fair ab.
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>

        <TabBar />
      </View>
    );
  }

  if (activeTab === 4) {
    
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
        <View style={{ height: insets.top, backgroundColor: '#f8fafc' }} />
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
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>DATEN</Text>
              <View style={styles.settingsGroup}>
                <TouchableOpacity
                  style={styles.settingButton}
                  onPress={handleExportData}
                >
                  <Text style={styles.settingButtonText}>Daten exportieren</Text>
                  <Text style={styles.settingArrow}>→</Text>
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

            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>RECHTLICHES</Text>
              <View style={styles.settingsGroup}>
                <TouchableOpacity
                  style={styles.settingButton}
                  onPress={() => Linking.openURL('https://vayze.app/privacy')}
                  accessibilityLabel="Datenschutzerklärung öffnen"
                  accessibilityHint="Öffnet die Datenschutzerklärung in deinem Browser"
                  accessibilityRole="link"
                >
                  <Text style={styles.settingButtonText}>Datenschutzerklärung</Text>
                  <Text style={styles.settingArrow}>↗</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.settingButton}
                  onPress={() => Linking.openURL('https://vayze.app/terms')}
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
                  <Text style={styles.settingArrow}>→</Text>
                </TouchableOpacity>
              </View>
            </View>

            {}
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
                  <Text style={styles.settingArrow}>→</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
        <TabBar />
      </View>
    );
  }

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
          <View style={[styles.startContainer, { paddingTop: insets.top + 24 }]}>
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
                <View style={styles.modeIconContainer}>
                  <VollstaendigIcon size={60} active={decisionMode === 'full'} />
                </View>
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
                <View style={styles.modeIconContainer}>
                  <SchnellIcon size={60} active={decisionMode === 'quick'} />
                </View>
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
                          
                          if (category.length > 1) {
                            setCategory(category.filter(c => c !== cat));
                          }
                        } else {
                          
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

            {}
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

            {}
            {!showNextSteps && (
              <TouchableOpacity
                style={styles.nextStepsCTA}
                onPress={() => setShowNextSteps(true)}
              >
                <Text style={styles.nextStepsCTAText}>→ Nächste Schritte definieren</Text>
                <Text style={styles.nextStepsCTAHint}>Optional: Wandle diese Gedanken in Taten um</Text>
              </TouchableOpacity>
            )}

            {}
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

                    const validSteps = nextSteps.filter(s => s.trim().length > 0);
                    if (validSteps.length > 0) {

                      console.log('=== Next Steps Debug ===');
                      console.log('Current Decision ID:', currentDecisionId);
                      console.log('Valid steps:', validSteps.length);
                      console.log('Decision text:', decision.substring(0, 30));

                      if (!currentDecisionId) {
                        Alert.alert(
                          'Fehler',
                          `Entscheidungs-ID nicht gefunden.\nBitte speichere die Entscheidung zuerst mit dem "Entscheidung speichern ✓" Button.\n\nDebug: ID=${currentDecisionId}`
                        );
                        return;
                      }

                      validSteps.forEach((step, index) => {
                        console.log('Adding card to board:', {
                          title: step,
                          linkedDecisionId: currentDecisionId,
                          decisionTitle: decision.substring(0, 30)
                        });
                        addCard({
                          title: step,
                          description: `Aus Entscheidung: "${decision.substring(0, 50)}${decision.length > 50 ? '...' : ''}"`,
                          type: 'task',
                          priority: 'medium',
                          category: 'todo',
                          status: 'todo',
                          tags: ['aus-entscheidung'],
                          linkedDecisionId: currentDecisionId,
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
                      setNextSteps(['', '', '']);
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

            <TouchableOpacity
              style={styles.resetButton}
              onPress={async () => {
                await resetDecisionState();
                setActiveTab(0);
              }}
            >
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
  
  startContainer: {
    padding: 24,
    // paddingTop wird dynamisch gesetzt
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
  modeIconContainer: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  
  resultsContainer: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  favoriteIcon: {
    fontSize: 28,
  },
  resultsTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  resultTag: {
    backgroundColor: '#dbeafe',
    paddingVertical: 6,
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
    paddingVertical: 6,
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  decisionBoxText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
    lineHeight: 20,
  },
  resultCard: {
    padding: 24,
    paddingVertical: 32,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
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
    fontSize: 56,
    marginBottom: 12,
  },
  resultRecommendation: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  resultBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 12,
  },
  resultBadgeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultMessage: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  journalBox: {
    backgroundColor: '#f3f4f6',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
  },
  journalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  journalInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: 'white',
  },
  journalHint: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 6,
  },
  nextStepsCTA: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1.5,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
    padding: 14,
    borderRadius: 12,
    marginVertical: 12,
  },
  nextStepsCTAText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 4,
  },
  nextStepsCTAHint: {
    fontSize: 11,
    color: '#64748b',
  },
  nextStepsBox: {
    backgroundColor: '#fafafa',
    padding: 16,
    borderRadius: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  nextStepsSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 14,
  },
  nextStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  nextStepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    width: 18,
  },
  nextStepInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1f2937',
  },
  addToBoardButton: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  addToBoardButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  skipButton: {
    padding: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  skipButtonText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  resetButton: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  
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
  
  explainabilityBox: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  explainabilityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 10,
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
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },
  factorText: {
    flex: 1,
    fontSize: 13,
    color: '#1f2937',
    lineHeight: 19,
    fontWeight: '500',
  },
  
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

  trackerHeader: {
    // paddingTop wird dynamisch gesetzt
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  trackerHeaderContent: {
    gap: 24,
  },
  trackerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trackerStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  trackerStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  trackerStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  trackerStatNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  trackerFireBadge: {
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trackerFireEmoji: {
    fontSize: 16,
  },
  trackerCalendarCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: -20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  trackerMonthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  trackerMonthButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackerMonthArrow: {
    fontSize: 18,
    color: '#64748b',
  },
  trackerMonthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  trackerWeekDays: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 4,
  },
  trackerWeekDay: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textAlign: 'center',
  },
  trackerCalendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  trackerCalendarDay: {
    width: '13.5%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  trackerCalendarDayText: {
    fontSize: 14,
    color: '#1e293b',
  },
  trackerCalendarDayActive: {
    backgroundColor: '#3b82f6',
  },
  trackerCalendarDayActiveText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  trackerSummaryCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  trackerSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  trackerSummarySubtitle: {
    fontSize: 14,
    color: '#3b82f6',
  },
  floatingJournalButton: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingJournalIcon: {
    fontSize: 20,
  },
  floatingJournalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  insightsHeader: {
    // paddingTop wird dynamisch gesetzt
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  insightsHeaderContent: {
    gap: 24,
  },
  insightsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightsTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  insightsEmpty: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  lightbulbContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  lightbulbPulse: {
    position: 'absolute',
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#A855F7',
  },
  lightbulbPulse1: {
    width: 80,
    height: 80,
    opacity: 0.3,
  },
  lightbulbPulse2: {
    width: 100,
    height: 100,
    opacity: 0.2,
  },
  lightbulbPulse3: {
    width: 120,
    height: 120,
    opacity: 0.1,
  },
  insightsEmptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  insightsEmptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 24,
    lineHeight: 24,
  },

  insightsPreviewGrid: {
    width: '100%',
    gap: 16,
  },
  insightsPreviewCard: {
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 16,
    padding: 20,
  },
  insightsPreviewIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3e8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightsPreviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b21a8',
    marginBottom: 6,
  },
  insightsPreviewText: {
    fontSize: 14,
    color: '#9333ea',
    lineHeight: 20,
  },

  insightsStatsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  insightsStatCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  insightsStatNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  insightsStatLabel: {
    fontSize: 14,
    color: '#64748b',
  },

  insightsSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  insightsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },

  insightsBalanceContainer: {
    gap: 16,
  },
  insightsBalanceItem: {
    gap: 8,
  },
  insightsBalanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightsBalanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  insightsBalanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  insightsBalanceBar: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  insightsBalanceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  insightsBalanceBarGreen: {
    backgroundColor: '#10b981',
  },
  insightsBalanceBarPurple: {
    backgroundColor: '#9333ea',
  },

  insightsInsightCard: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    backgroundColor: '#faf5ff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  insightsInsightIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3e8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightsInsightIcon: {
    fontSize: 24,
  },
  insightsInsightText: {
    flex: 1,
    fontSize: 14,
    color: '#6b21a8',
    lineHeight: 20,
    alignSelf: 'center',
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

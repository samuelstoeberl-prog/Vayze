import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDecisionStore } from '../store/decisionStore';
import { ConfidenceScoreCalculator } from '../utils/confidenceScoreCalculator';
import { TrendingUpIcon, CalendarIcon } from '../components/Icons';

const { width } = Dimensions.get('window');

export default function EnhancedTrackerScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    decisions,
    reviews,
    confidenceScore,
    updateConfidenceScore,
    getUserInsights,
    getStatistics
  } = useDecisionStore();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.toLocaleString('de-DE', { month: 'long' })} ${now.getFullYear()}`;
  });

  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    updateConfidenceScore();
  }, [decisions, reviews]);

  const stats = getStatistics();
  const insights = getUserInsights();
  const factorExplanations = ConfidenceScoreCalculator.getFactorExplanations();

  // Calendar helper functions
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Convert Sunday=0 to Monday=0
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    const newDate = new Date(currentYear, currentMonth - 1);
    setSelectedMonth(`${newDate.toLocaleString('de-DE', { month: 'long' })} ${newDate.getFullYear()}`);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    const newDate = new Date(currentYear, currentMonth + 1);
    setSelectedMonth(`${newDate.toLocaleString('de-DE', { month: 'long' })} ${newDate.getFullYear()}`);
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  // Calculate streak (placeholder - you can implement actual streak logic)
  const currentStreak = 0;

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />

      {/* Header with Gradient */}
      <LinearGradient
        colors={['#3b82f6', '#2563eb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 56 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TrendingUpIcon size={32} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.headerTitle}>Dein Fortschritt</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statCardGradient}>
              <Text style={styles.statLabel}>Entscheidungen</Text>
              <Text style={styles.statValue}>{stats.totalDecisions}</Text>
            </View>
            <View style={styles.statCardGradient}>
              <View style={styles.streakRow}>
                <Text style={styles.statLabel}>Tage Streak</Text>
                <Text style={styles.fireEmoji}>🔥</Text>
              </View>
              <Text style={styles.statValue}>{currentStreak}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar */}
        <View style={styles.calendarCard}>
          {/* Month Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              style={styles.monthButton}
              onPress={handlePreviousMonth}
            >
              <Text style={styles.monthButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{selectedMonth}</Text>
            <TouchableOpacity
              style={styles.monthButton}
              onPress={handleNextMonth}
            >
              <Text style={styles.monthButtonText}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Week Day Headers */}
          <View style={styles.weekDayRow}>
            {weekDays.map((day) => (
              <Text key={day} style={styles.weekDayText}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDay }).map((_, index) => (
              <View key={`empty-${index}`} style={styles.dayCell} />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const isToday =
                day === new Date().getDate() &&
                currentMonth === new Date().getMonth() &&
                currentYear === new Date().getFullYear();

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCell,
                    isToday && styles.todayCell
                  ]}
                >
                  <Text style={[
                    styles.dayText,
                    isToday && styles.todayText
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Summary Card */}
        <LinearGradient
          colors={['#dbeafe', '#bfdbfe']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCard}
        >
          <Text style={styles.summaryTitle}>
            Gesamt: {stats.totalDecisions} Entscheidungen
          </Text>
          <Text style={styles.summarySubtitle}>
            Dieser Monat: 0 Entscheidungen
          </Text>
        </LinearGradient>

        {/* Confidence Score Section (if available) */}
        {confidenceScore && (
          <View style={styles.confidenceCard}>
            <Text style={styles.cardTitle}>📊 Dein Score</Text>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{confidenceScore.score}</Text>
              <Text style={styles.scoreLabel}>{confidenceScore.message}</Text>
            </View>

            {confidenceScore.trend !== 'neutral' && (
              <View style={styles.trendBadge}>
                <Text style={styles.trendText}>
                  {confidenceScore.trend === 'improving' ? '📈 Steigend' : '📉 Sinkend'}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    // paddingTop wird dynamisch gesetzt
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerContent: {
    gap: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCardGradient: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statLabel: {
    fontSize: 14,
    color: '#bfdbfe',
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  fireEmoji: {
    fontSize: 20,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 24,
    paddingTop: 24,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  monthButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthButtonText: {
    fontSize: 20,
    color: '#475569',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  weekDayRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  todayCell: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
  todayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  summaryCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  summarySubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e40af',
  },
  confidenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 20,
  },
  scoreCircle: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
  trendBadge: {
    alignSelf: 'center',
    backgroundColor: '#dbeafe',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  trendText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
  },
});

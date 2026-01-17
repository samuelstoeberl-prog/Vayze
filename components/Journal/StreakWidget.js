import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { useJournalStore } from '../../store/journalStore';

const { width } = Dimensions.get('window');

export default function StreakWidget({ onPress }) {
  const { streaks, getStreakStatus } = useJournalStore();
  const streakStatus = getStreakStatus();

  const [pulseAnim] = React.useState(new Animated.Value(1));

  useEffect(() => {
    if (streaks.current > 0 && streakStatus.status === 'active') {
      // Pulse animation for active streak
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
          })
        ])
      ).start();
    }
  }, [streaks.current, streakStatus.status]);

  const getStatusColor = () => {
    switch (streakStatus.status) {
      case 'active':
        return '#10b981';
      case 'at_risk':
        return '#f59e0b';
      case 'broken':
        return '#ef4444';
      default:
        return '#9ca3af';
    }
  };

  const getStatusIcon = () => {
    switch (streakStatus.status) {
      case 'active':
        return '🔥';
      case 'at_risk':
        return '⚠️';
      case 'broken':
        return '💔';
      default:
        return '📓';
    }
  };

  const getMotivationalMessage = () => {
    const current = streaks.current;

    if (current === 0) {
      return 'Starte deine Streak!';
    } else if (current < 3) {
      return 'Mach weiter so!';
    } else if (current < 7) {
      return 'Toller Start!';
    } else if (current < 14) {
      return 'Du bist on fire! 🔥';
    } else if (current < 30) {
      return 'Unglaublich! Weiter so!';
    } else {
      return 'Du bist eine Legende! 🏆';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderColor: getStatusColor() }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Streak Display */}
      <View style={styles.streakSection}>
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <Text style={styles.icon}>{getStatusIcon()}</Text>
        </Animated.View>

        <View style={styles.textContainer}>
          <View style={styles.streakRow}>
            <Text style={styles.streakNumber}>{streaks.current}</Text>
            <Text style={styles.streakLabel}>Tage Streak</Text>
          </View>

          <Text style={[styles.statusMessage, { color: getStatusColor() }]}>
            {streakStatus.message}
          </Text>

          <Text style={styles.motivationalText}>
            {getMotivationalMessage()}
          </Text>
        </View>
      </View>

      {/* Progress Bar to 30 days */}
      {streaks.current > 0 && streaks.current < 30 && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(streaks.current / 30) * 100}%`,
                  backgroundColor: getStatusColor()
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {30 - streaks.current} Tage bis zum 30-Tage-Ziel
          </Text>
        </View>
      )}

      {/* Milestone Achievement */}
      {streaks.current >= 30 && (
        <View style={styles.achievementBadge}>
          <Text style={styles.achievementText}>
            🏆 30-Tage-Milestone erreicht!
          </Text>
        </View>
      )}

      {/* Longest Streak */}
      {streaks.longest > 0 && (
        <View style={styles.longestStreak}>
          <Text style={styles.longestStreakLabel}>Längste Streak:</Text>
          <Text style={styles.longestStreakValue}>
            {streaks.longest} Tage {streaks.longest === streaks.current ? '(Aktuell!)' : ''}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function StreakCelebration({ streak, onClose }) {
  const [scaleAnim] = React.useState(new Animated.Value(0));
  const [rotateAnim] = React.useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const milestones = {
    3: { icon: '🎯', title: '3-Tage-Streak!', message: 'Du bist auf dem richtigen Weg!' },
    7: { icon: '🔥', title: '7-Tage-Streak!', message: 'Eine Woche durchgehalten!' },
    14: { icon: '⭐', title: '14-Tage-Streak!', message: 'Zwei Wochen! Unglaublich!' },
    21: { icon: '💎', title: '21-Tage-Streak!', message: 'Drei Wochen! Du bist dabei, eine Gewohnheit zu bilden!' },
    30: { icon: '🏆', title: '30-TAGE-STREAK!', message: 'Du hast das 30-Tage-Ziel erreicht! LEGENDE!' },
    60: { icon: '👑', title: '60-Tage-Streak!', message: 'Zwei Monate! Du bist unstoppbar!' },
    90: { icon: '🌟', title: '90-Tage-Streak!', message: 'Drei Monate! Absoluter Champion!' },
    100: { icon: '💯', title: '100-TAGE-STREAK!', message: 'HUNDERT TAGE! Du bist eine absolute Inspiration!' }
  };

  const milestone = milestones[streak];

  if (!milestone) return null;

  return (
    <View style={styles.celebrationOverlay}>
      <Animated.View
        style={[
          styles.celebrationCard,
          {
            transform: [
              { scale: scaleAnim },
              { rotate }
            ]
          }
        ]}
      >
        <Text style={styles.celebrationIcon}>{milestone.icon}</Text>
        <Text style={styles.celebrationTitle}>{milestone.title}</Text>
        <Text style={styles.celebrationMessage}>{milestone.message}</Text>

        <TouchableOpacity
          style={styles.celebrationButton}
          onPress={onClose}
        >
          <Text style={styles.celebrationButtonText}>Weiter so! 💪</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  streakSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#f3f4f6',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  icon: {
    fontSize: 32
  },
  textContainer: {
    flex: 1
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 8
  },
  streakLabel: {
    fontSize: 16,
    color: '#6b7280'
  },
  statusMessage: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2
  },
  motivationalText: {
    fontSize: 12,
    color: '#9ca3af'
  },
  progressSection: {
    marginTop: 12
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center'
  },
  achievementBadge: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#fbbf24'
  },
  achievementText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    textAlign: 'center'
  },
  longestStreak: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  longestStreakLabel: {
    fontSize: 13,
    color: '#6b7280'
  },
  longestStreakValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151'
  },
  // Celebration Styles
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  celebrationCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: width * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  },
  celebrationIcon: {
    fontSize: 80,
    marginBottom: 16
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center'
  },
  celebrationMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22
  },
  celebrationButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12
  },
  celebrationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

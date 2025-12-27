/**
 * SwipeableCard - Professional swipe-to-action card using React Native Animated API
 *
 * Features:
 * - Smooth native gestures with PanResponder
 * - Animated API for smooth animations
 * - Swipe left/right to move between columns
 * - Visual feedback with background colors and progress
 * - Haptic feedback on action
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration, Animated, PanResponder } from 'react-native';

const SWIPE_THRESHOLD = 80; // Threshold for triggering action
const PRIORITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  urgent: '#ef4444',
};

const TYPE_ICONS = {
  task: '✓',
  decision: '🎯',
  idea: '💡',
  note: '📝',
};

const TYPE_STYLES = {
  decision: { borderLeftWidth: 3, borderLeftColor: '#3b82f6' },
  task: { borderLeftWidth: 3, borderLeftColor: '#e2e8f0' },
  idea: { borderLeftWidth: 3, borderLeftColor: '#8b5cf6', borderStyle: 'dashed' },
  note: { backgroundColor: '#fefce8', borderLeftWidth: 3, borderLeftColor: '#fbbf24' },
};

export default function SwipeableCard({ card, onPress, onQuickAction, onMakeDecision }) {
  const priorityColor = PRIORITY_COLORS[card.priority] || '#64748b';
  const translateX = useRef(new Animated.Value(0)).current;
  const actionTriggered = useRef(false);

  // Get adjacent categories
  const getAdjacentCategories = () => {
    const categories = ['todo', 'in_progress', 'done'];
    const currentIndex = categories.indexOf(card.category);
    return {
      previous: currentIndex > 0 ? categories[currentIndex - 1] : null,
      next: currentIndex < categories.length - 1 ? categories[currentIndex + 1] : null,
    };
  };

  const adjacentCategories = getAdjacentCategories();

  // Trigger haptic feedback
  const triggerHaptic = () => {
    try {
      Vibration.vibrate(10);
    } catch (error) {
      // Silent fail
    }
  };

  // Handle action when threshold is reached
  const handleAction = (targetCategory) => {
    if (!actionTriggered.current && onQuickAction) {
      actionTriggered.current = true;
      triggerHaptic();
      onQuickAction(card.id, targetCategory);
    }
  };

  // Pan responder for gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        actionTriggered.current = false;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow swipe if adjacent category exists
        if (gestureState.dx < 0 && !adjacentCategories.previous) {
          return;
        }
        if (gestureState.dx > 0 && !adjacentCategories.next) {
          return;
        }
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const translation = gestureState.dx;

        // Check if threshold reached
        // Swipe left (to previous category)
        if (translation < -SWIPE_THRESHOLD && adjacentCategories.previous) {
          // Animate further left and trigger action
          Animated.timing(translateX, {
            toValue: -300,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            handleAction(adjacentCategories.previous);
            translateX.setValue(0);
          });
        }
        // Swipe right (to next category)
        else if (translation > SWIPE_THRESHOLD && adjacentCategories.next) {
          // Animate further right and trigger action
          Animated.timing(translateX, {
            toValue: 300,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            handleAction(adjacentCategories.next);
            translateX.setValue(0);
          });
        }
        // Not enough distance - spring back
        else {
          Animated.spring(translateX, {
            toValue: 0,
            friction: 8,
            tension: 50,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Animated styles using Animated API
  const leftOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD * 2, -SWIPE_THRESHOLD, 0],
    outputRange: [1, 0.7, 0],
    extrapolate: 'clamp',
  });

  const rightOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD, SWIPE_THRESHOLD * 2],
    outputRange: [0, 0.7, 1],
    extrapolate: 'clamp',
  });

  // Due date logic
  const dueDate = card.dueDate ? new Date(card.dueDate) : null;
  const now = new Date();
  const daysUntilDue = dueDate ? Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)) : null;
  const showDueDate = dueDate && daysUntilDue !== null && daysUntilDue <= 3;
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && card.status !== 'done';

  const hasExtras = card.checklist.length > 0 || card.comments.length > 0 || card.attachments.length > 0;

  const formatDueDate = (date) => {
    const dueDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dueDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (dueDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return dueDate.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
    }
  };

  // Quick actions
  const getQuickActions = () => {
    if (card.category === 'done') return [];
    if (card.category === 'todo') return ['in_progress', 'done'];
    if (card.category === 'in_progress') return ['done'];
    return [];
  };

  const quickActions = getQuickActions();

  const handleQuickAction = (e, targetCategory) => {
    e.stopPropagation();
    if (onQuickAction) {
      onQuickAction(card.id, targetCategory);
    }
  };

  const handleMakeDecision = (e) => {
    e.stopPropagation();
    if (onMakeDecision) {
      onMakeDecision(card);
    }
  };

  return (
    <View style={styles.container}>
      {/* Left Background (Previous Category) */}
      {adjacentCategories.previous && (
        <Animated.View style={[styles.background, styles.backgroundLeft, { opacity: leftOpacity }]}>
          <Text style={styles.backgroundText}>
            ← {adjacentCategories.previous === 'todo' ? 'To Do' : 'In Progress'}
          </Text>
        </Animated.View>
      )}

      {/* Right Background (Next Category) */}
      {adjacentCategories.next && (
        <Animated.View style={[styles.background, styles.backgroundRight, { opacity: rightOpacity }]}>
          <Text style={styles.backgroundText}>
            {adjacentCategories.next === 'in_progress' ? 'In Progress' : 'Done'} →
          </Text>
        </Animated.View>
      )}

      {/* Swipeable Card */}
      <Animated.View
        style={[{ transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
            style={[
              styles.card,
              TYPE_STYLES[card.type] || {},
              isOverdue && styles.cardOverdue,
            ]}
            onPress={onPress}
            activeOpacity={0.75}
            accessible={true}
            accessibilityLabel={`${TYPE_ICONS[card.type]} ${card.title}. Priority: ${card.priority}. Swipe to move.`}
            accessibilityRole="button"
          >
            {/* Top Row: Type Icon + Priority Badge */}
            <View style={styles.cardHeader}>
              <Text style={styles.typeIcon}>{TYPE_ICONS[card.type]}</Text>
              <View style={styles.badges}>
                <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]} />
                {card.isFavorite && <Text style={styles.favoriteStar}>⭐</Text>}
              </View>
            </View>

            {/* Title */}
            <Text style={styles.cardTitle} numberOfLines={2}>
              {card.title}
            </Text>

            {/* Bottom Row: Due Date + Extras */}
            {(showDueDate || hasExtras) && (
              <View style={styles.cardFooter}>
                {showDueDate && (
                  <View style={[styles.dueDateBadge, isOverdue && styles.dueDateOverdue]}>
                    <Text style={[styles.dueDateText, isOverdue && styles.dueDateOverdueText]}>
                      {isOverdue ? '⚠️' : '📅'} {formatDueDate(dueDate)}
                    </Text>
                  </View>
                )}
                {hasExtras && <Text style={styles.extrasIndicator}>•••</Text>}
              </View>
            )}

            {/* Quick Actions */}
            {(quickActions.length > 0 || card.type === 'decision') && (
              <View style={styles.quickActions}>
                {card.type === 'decision' && (
                  <TouchableOpacity style={styles.decisionButton} onPress={handleMakeDecision}>
                    <Text style={styles.decisionButtonText}>🎯 Entscheidung treffen</Text>
                  </TouchableOpacity>
                )}
                {quickActions.map((action) => (
                  <TouchableOpacity
                    key={action}
                    style={styles.quickActionButton}
                    onPress={(e) => handleQuickAction(e, action)}
                  >
                    <Text style={styles.quickActionText}>
                      {action === 'in_progress' && '⚡'}
                      {action === 'done' && '✓'}
                      {action === 'todo' && '📋'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  backgroundLeft: {
    left: 0,
    backgroundColor: '#3b82f6',
    alignItems: 'flex-start',
  },
  backgroundRight: {
    right: 0,
    backgroundColor: '#10b981',
    alignItems: 'flex-end',
  },
  backgroundText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 70,
  },
  cardOverdue: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIcon: {
    fontSize: 18,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  favoriteStar: {
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 19,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  dueDateBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  dueDateText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  dueDateOverdue: {
    backgroundColor: '#fee2e2',
  },
  dueDateOverdueText: {
    color: '#dc2626',
  },
  extrasIndicator: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  decisionButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  decisionButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
  quickActionButton: {
    width: 32,
    height: 32,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickActionText: {
    fontSize: 14,
  },
});

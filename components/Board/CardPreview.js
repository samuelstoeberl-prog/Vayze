/**
 * Card Preview - Minimale Kartenansicht im Kanban Board (iOS-optimiert)
 * Progressive Disclosure: Details nur im Modal
 *
 * Features:
 * - Long Press (400ms): iOS-optimierte Aktivierung des Drag-Modus
 * - Haptic Feedback: Subtile Vibration beim Start des Dragging
 * - Drag & Drop: Ziehe die Card nach links/rechts in eine andere Spalte
 * - Visual Feedback:
 *   - Schatten und erhöhte Elevation während Drag
 *   - Skalierung (1.08x beim Drag, 0.98x beim Press)
 *   - Leichte Transparenz (95%) für bessere Sichtbarkeit
 *   - Richtungs-Indikatoren zeigen verfügbare Spalten
 * - iOS-like Spring Physics: Natürliche Zurückspring-Animation
 * - Intelligente Gesten-Erkennung: Unterscheidet zwischen Tap, Long-Press und Drag
 * - Performance-optimiert: Native driver wo möglich
 * - Auto-Reset: Springt zurück wenn nicht weit genug gezogen
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Vibration,
} from 'react-native';

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

// Card Type Styling - Visual Differentiation
const TYPE_STYLES = {
  decision: {
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6', // Soft blue
  },
  task: {
    borderLeftWidth: 3,
    borderLeftColor: '#e2e8f0', // Neutral
  },
  idea: {
    borderLeftWidth: 3,
    borderLeftColor: '#8b5cf6', // Purple
    borderStyle: 'dashed',
  },
  note: {
    backgroundColor: '#fefce8', // Slight yellow tint
    borderLeftWidth: 3,
    borderLeftColor: '#fbbf24',
  },
};

const SWIPE_THRESHOLD = 60; // Minimum swipe distance to trigger action
const LONG_PRESS_DURATION = 300; // Reduced for faster activation (was 400ms)
const DRAG_SCALE = 1.08; // Scale factor when dragging
const DRAG_OPACITY = 0.95; // Slight transparency when dragging
const PRESS_SCALE = 0.98; // Scale down on press to show feedback

function CardPreview({ card, onPress, categoryColor, onQuickAction, onMakeDecision }) {
  const priorityColor = PRIORITY_COLORS[card.priority] || '#64748b';

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragState, setDragState] = useState('idle'); // idle, pressing, dragging
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current; // Scale animation for press feedback
  const longPressTimer = useRef(null);
  const isDraggingRef = useRef(false);
  const pressStartTime = useRef(null);
  const hasMovedRef = useRef(false);

  // Only show due date if within 3 days or overdue
  const dueDate = card.dueDate ? new Date(card.dueDate) : null;
  const now = new Date();
  const daysUntilDue = dueDate ? Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)) : null;
  const showDueDate = dueDate && daysUntilDue !== null && daysUntilDue <= 3;
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && card.status !== 'done';

  // Show badge if has checklist, comments, or attachments
  const hasExtras = card.checklist.length > 0 || card.comments.length > 0 || card.attachments.length > 0;

  // Determine available quick actions based on category
  const getQuickActions = () => {
    if (card.category === 'done') return [];
    if (card.category === 'todo') return ['in_progress', 'done'];
    if (card.category === 'in_progress') return ['done'];
    return [];
  };

  const quickActions = getQuickActions();

  // Get previous/next category for swipe
  const getAdjacentCategories = () => {
    const categories = ['todo', 'in_progress', 'done'];
    const currentIndex = categories.indexOf(card.category);

    return {
      previous: currentIndex > 0 ? categories[currentIndex - 1] : null,
      next: currentIndex < categories.length - 1 ? categories[currentIndex + 1] : null,
    };
  };

  const adjacentCategories = getAdjacentCategories();
  const adjacentCategoriesRef = useRef(adjacentCategories);

  // Keep ref in sync
  React.useEffect(() => {
    adjacentCategoriesRef.current = adjacentCategories;
  }, [card.category]);

  // PanResponder for drag gestures - iOS-optimized
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // More sensitive movement detection for better responsiveness
        const hasSignificantMovement = Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;

        if (hasSignificantMovement) {
          hasMovedRef.current = true;
        }

        // Only activate pan responder if we're in drag mode
        return isDraggingRef.current && hasSignificantMovement;
      },

      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
      },

      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y }
        ],
        { useNativeDriver: false }
      ),

      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();

        if (!isDraggingRef.current) {
          resetPosition();
          return;
        }

        const adjacent = adjacentCategoriesRef.current;

        // Determine if dragged far enough to change category
        // Left swipe (previous category)
        if (gestureState.dx < -SWIPE_THRESHOLD && adjacent.previous) {
          handleDrop(adjacent.previous);
        }
        // Right swipe (next category)
        else if (gestureState.dx > SWIPE_THRESHOLD && adjacent.next) {
          handleDrop(adjacent.next);
        }
        // Not enough distance - reset with spring animation
        else {
          setIsDragging(false);
          isDraggingRef.current = false;
          setDragState('idle');
          resetPosition();
        }
      },

      onPanResponderTerminate: () => {
        setIsDragging(false);
        isDraggingRef.current = false;
        setDragState('idle');
        resetPosition();
      },
    })
  ).current;

  const resetPosition = () => {
    // iOS-like spring animation with natural physics
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      friction: 8, // Lower = more bouncy (default: 7)
      tension: 50, // Higher = faster animation (default: 40)
    }).start();
  };

  const handleDrop = (targetCategory) => {
    // Move card
    if (onQuickAction) {
      onQuickAction(card.id, targetCategory);
    }

    // Reset drag state and scale
    setIsDragging(false);
    isDraggingRef.current = false;
    setDragState('idle');

    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 150,
    }).start();

    resetPosition();
  };

  // Long press to enable drag - iOS-optimized with haptic feedback
  const handlePressIn = () => {
    pressStartTime.current = Date.now();
    hasMovedRef.current = false;
    setDragState('pressing');

    // Animate scale down to show press feedback
    Animated.spring(scale, {
      toValue: PRESS_SCALE,
      useNativeDriver: true,
      friction: 8,
      tension: 150,
    }).start();

    // Optimized long-press duration for iOS feel
    longPressTimer.current = setTimeout(() => {
      setIsDragging(true);
      isDraggingRef.current = true;
      setDragState('dragging');

      // Animate scale up to drag scale
      Animated.spring(scale, {
        toValue: DRAG_SCALE,
        useNativeDriver: true,
        friction: 6,
        tension: 100,
      }).start();

      // Haptic feedback when drag mode activates
      try {
        Vibration.vibrate(10); // Short, subtle vibration
      } catch (error) {
        // Silently fail if vibration not supported
      }
    }, LONG_PRESS_DURATION);
  };

  const handlePressOut = () => {
    const pressDuration = Date.now() - (pressStartTime.current || 0);

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    // Reset scale animation when press ends (if not dragging)
    if (!isDraggingRef.current) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 150,
      }).start();
    }

    // If we started dragging but didn't move, treat as normal press
    if (!hasMovedRef.current && !isDraggingRef.current && pressDuration < LONG_PRESS_DURATION) {
      setDragState('idle');
      // Allow normal press to work
    } else if (isDraggingRef.current && !hasMovedRef.current) {
      // Long press activated but no movement - cancel drag
      setIsDragging(false);
      isDraggingRef.current = false;
      setDragState('idle');
    }

    pressStartTime.current = null;
  };

  const handlePress = () => {
    // Only trigger press if not dragging and didn't move
    if (!isDragging && !hasMovedRef.current && onPress) {
      onPress();
    }
  };

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

  // Card transform style with elevation while dragging - iOS-optimized
  const cardStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { scale: scale }, // Use animated scale value
    ],
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? DRAG_OPACITY : 1,
  };

  // Background indicator opacity based on drag distance
  const leftOpacity = pan.x.interpolate({
    inputRange: [-200, -SWIPE_THRESHOLD, 0],
    outputRange: [1, 0.7, 0],
    extrapolate: 'clamp',
  });

  const rightOpacity = pan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD, 200],
    outputRange: [0, 0.7, 1],
    extrapolate: 'clamp',
  });

  // Progress bar scale based on drag distance (using scaleX instead of width)
  const leftProgress = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD * 2, -SWIPE_THRESHOLD, 0],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  const rightProgress = pan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD, SWIPE_THRESHOLD * 2],
    outputRange: [0, 1, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.cardContainer}>
      {/* Drag Background Indicators - only show while dragging */}
      {isDragging && (
        <>
          {/* Left indicator (previous category) */}
          {adjacentCategories.previous && (
            <Animated.View
              style={[
                styles.swipeIndicator,
                styles.swipeIndicatorLeft,
                { opacity: leftOpacity }
              ]}
            >
              <View style={styles.swipeIndicatorContent}>
                <Text style={styles.swipeIndicatorText}>← {
                  adjacentCategories.previous === 'todo' ? 'To Do' : 'In Progress'
                }</Text>
                <View style={styles.swipeProgressBarContainer}>
                  <Animated.View style={[styles.swipeProgressBar, {
                    transform: [{ scaleX: leftProgress }]
                  }]} />
                </View>
              </View>
            </Animated.View>
          )}

          {/* Right indicator (next category) */}
          {adjacentCategories.next && (
            <Animated.View
              style={[
                styles.swipeIndicator,
                styles.swipeIndicatorRight,
                { opacity: rightOpacity }
              ]}
            >
              <View style={styles.swipeIndicatorContent}>
                <Text style={styles.swipeIndicatorText}>{
                  adjacentCategories.next === 'in_progress' ? 'In Progress' : 'Done'
                } →</Text>
                <View style={styles.swipeProgressBarContainer}>
                  <Animated.View style={[styles.swipeProgressBar, {
                    transform: [{ scaleX: rightProgress }]
                  }]} />
                </View>
              </View>
            </Animated.View>
          )}
        </>
      )}

      {/* Animated Card */}
      <Animated.View
        style={[cardStyle]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[
            styles.card,
            TYPE_STYLES[card.type] || {},
            isOverdue && styles.cardOverdue,
            isDragging && styles.cardDragging,
          ]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={isDragging ? 1 : 0.75}
          disabled={isDragging}
          accessible={true}
          accessibilityLabel={`${TYPE_ICONS[card.type]} ${card.title}. Priority: ${card.priority}. ${isOverdue ? 'Overdue.' : showDueDate ? `Due ${formatDueDate(dueDate)}.` : ''} Long press to drag.`}
          accessibilityRole="button"
          accessibilityHint="Tap to view details, long press to drag to another column"
          accessibilityState={{ disabled: isDragging, selected: card.isFavorite }}
        >
          {/* Dragging Badge */}
          {isDragging && (
            <View style={styles.dragBadge}>
              <Text style={styles.dragBadgeText}>⬅ Ziehen ➡</Text>
            </View>
          )}

          {/* Top Row: Type Icon + Priority Badge */}
          <View style={styles.cardHeader}>
            <Text style={styles.typeIcon}>{TYPE_ICONS[card.type]}</Text>

            <View style={styles.badges}>
              {/* Priority Badge */}
              <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]} />

              {/* Favorite Star */}
              {card.isFavorite && <Text style={styles.favoriteStar}>⭐</Text>}
            </View>
          </View>

          {/* Title - Main focus */}
          <Text style={styles.cardTitle} numberOfLines={2}>
            {card.title}
          </Text>

          {/* Bottom Row: Due Date (only if urgent) + Extras Indicator */}
          {(showDueDate || hasExtras) && (
            <View style={styles.cardFooter}>
              {showDueDate && (
                <View style={[styles.dueDateBadge, isOverdue && styles.dueDateOverdue]}>
                  <Text style={[styles.dueDateText, isOverdue && styles.dueDateOverdueText]}>
                    {isOverdue ? '⚠️' : '📅'} {formatDueDate(dueDate)}
                  </Text>
                </View>
              )}

              {hasExtras && (
                <Text style={styles.extrasIndicator}>•••</Text>
              )}
            </View>
          )}

          {/* Quick Actions Row - Hidden while dragging */}
          {!isDragging && (quickActions.length > 0 || card.type === 'decision') && (
            <View style={styles.quickActions}>
              {/* Decision Button for Decision Cards */}
              {card.type === 'decision' && (
                <TouchableOpacity
                  style={styles.decisionButton}
                  onPress={handleMakeDecision}
                >
                  <Text style={styles.decisionButtonText}>🎯 Entscheidung treffen</Text>
                </TouchableOpacity>
              )}

              {/* Move Actions */}
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

function formatDueDate(date) {
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
}

const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  swipeIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    zIndex: 0,
    width: '100%',
  },
  swipeIndicatorLeft: {
    left: 0,
    backgroundColor: '#3b82f6',
    alignItems: 'flex-start',
  },
  swipeIndicatorRight: {
    right: 0,
    backgroundColor: '#10b981',
    alignItems: 'flex-end',
  },
  swipeIndicatorContent: {
    alignItems: 'center',
  },
  swipeIndicatorText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 4,
  },
  swipeProgressBarContainer: {
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop: 2,
    overflow: 'hidden',
  },
  swipeProgressBar: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 2,
    transformOrigin: 'left',
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
    position: 'relative',
    zIndex: 1,
  },
  cardDragging: {
    borderColor: '#3b82f6',
    borderWidth: 2,
    backgroundColor: '#f0f9ff',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardOverdue: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  dragBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 10,
  },
  dragBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
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

// Export with React.memo for performance optimization
// Prevents unnecessary re-renders when props haven't changed
export default React.memo(CardPreview, (prevProps, nextProps) => {
  return (
    prevProps.card.id === nextProps.card.id &&
    prevProps.card.title === nextProps.card.title &&
    prevProps.card.priority === nextProps.card.priority &&
    prevProps.card.type === nextProps.card.type &&
    prevProps.card.category === nextProps.card.category &&
    prevProps.card.isFavorite === nextProps.card.isFavorite &&
    prevProps.card.dueDate === nextProps.card.dueDate
  );
});

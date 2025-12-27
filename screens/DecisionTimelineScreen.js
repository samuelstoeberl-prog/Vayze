/**
 * DecisionTimelineScreen
 *
 * Chronologische Ansicht aller Entscheidungen mit Filtern
 * Zeigt Review-Status, Score, und Kategorie
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { useDecisionStore } from '../store/decisionStore';
import { DecisionExplainer } from '../utils/decisionExplainer';

export default function DecisionTimelineScreen({ navigation }) {
  const { decisions, getDecisionsByDateRange } = useDecisionStore();

  const [filter, setFilter] = useState('all'); // 'all', 'week', 'month', 'year'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'score', 'reviewed'

  // Sortiere und filtere Entscheidungen
  const getFilteredDecisions = () => {
    let filtered = [...decisions];

    // Zeit-Filter
    const now = new Date();
    if (filter === 'week') {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      filtered = getDecisionsByDateRange(weekAgo, now);
    } else if (filter === 'month') {
      const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      filtered = getDecisionsByDateRange(monthAgo, now);
    } else if (filter === 'year') {
      const yearAgo = new Date(now - 365 * 24 * 60 * 60 * 1000);
      filtered = getDecisionsByDateRange(yearAgo, now);
    }

    // Sortierung
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'score') {
      filtered.sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
    } else if (sortBy === 'reviewed') {
      filtered.sort((a, b) => (b.review ? 1 : 0) - (a.review ? 1 : 0));
    }

    return filtered;
  };

  const filteredDecisions = getFilteredDecisions();

  return (
    <View style={styles.container}>
      {/* Filter Header */}
      <View style={styles.filterHeader}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {/* Zeit-Filter */}
            <FilterButton
              label="Alle"
              active={filter === 'all'}
              onPress={() => setFilter('all')}
            />
            <FilterButton
              label="7 Tage"
              active={filter === 'week'}
              onPress={() => setFilter('week')}
            />
            <FilterButton
              label="30 Tage"
              active={filter === 'month'}
              onPress={() => setFilter('month')}
            />
            <FilterButton
              label="Jahr"
              active={filter === 'year'}
              onPress={() => setFilter('year')}
            />

            <View style={styles.filterDivider} />

            {/* Sortierung */}
            <FilterButton
              label="📅 Datum"
              active={sortBy === 'date'}
              onPress={() => setSortBy('date')}
            />
            <FilterButton
              label="⭐ Score"
              active={sortBy === 'score'}
              onPress={() => setSortBy('score')}
            />
            <FilterButton
              label="✓ Reviewed"
              active={sortBy === 'reviewed'}
              onPress={() => setSortBy('reviewed')}
            />
          </View>
        </ScrollView>
      </View>

      {/* Timeline */}
      <FlatList
        data={filteredDecisions}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <DecisionTimelineItem
            decision={item}
            isFirst={index === 0}
            navigation={navigation}
          />
        )}
        contentContainerStyle={styles.timeline}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>Keine Entscheidungen</Text>
            <Text style={styles.emptyText}>
              {filter !== 'all'
                ? 'Keine Entscheidungen in diesem Zeitraum'
                : 'Treffe deine erste Entscheidung!'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

/**
 * Timeline Item Component
 */
function DecisionTimelineItem({ decision, isFirst, navigation }) {
  const date = new Date(decision.createdAt);
  const formattedDate = date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const recommendationColor =
    decision.recommendation === 'yes'
      ? '#10b981'
      : decision.recommendation === 'no'
      ? '#ef4444'
      : '#f59e0b';

  const recommendationIcon =
    decision.recommendation === 'yes'
      ? '✅'
      : decision.recommendation === 'no'
      ? '❌'
      : '🤔';

  const shortSummary = decision.explanation
    ? DecisionExplainer.getShortSummary(decision.explanation)
    : '';

  return (
    <TouchableOpacity
      style={styles.timelineItem}
      onPress={() =>
        navigation.navigate('DecisionDetail', { decisionId: decision.id })
      }
    >
      {/* Timeline Connector */}
      <View style={styles.timelineConnector}>
        {!isFirst && <View style={styles.timelineLine} />}
        <View style={[styles.timelineDot, { backgroundColor: recommendationColor }]} />
        <View style={styles.timelineLine} />
      </View>

      {/* Content */}
      <View style={styles.timelineContent}>
        {/* Date */}
        <Text style={styles.timelineDate}>
          {formattedDate} • {formattedTime}
        </Text>

        {/* Decision */}
        <Text style={styles.timelineDecision}>{decision.decision}</Text>

        {/* Recommendation */}
        <View style={styles.recommendationBadge}>
          <Text style={styles.recommendationIcon}>{recommendationIcon}</Text>
          <Text style={styles.recommendationText}>
            {decision.recommendation === 'yes'
              ? 'JA'
              : decision.recommendation === 'no'
              ? 'NEIN'
              : 'UNKLAR'}
          </Text>
          <Text style={styles.scoreText}>{decision.finalScore}%</Text>
        </View>

        {/* Short Summary */}
        {shortSummary && (
          <Text style={styles.shortSummary} numberOfLines={2}>
            {shortSummary}
          </Text>
        )}

        {/* Metadata */}
        <View style={styles.metadata}>
          {/* Mode */}
          <View style={styles.metadataItem}>
            <Text style={styles.metadataIcon}>
              {decision.mode === 'quick' ? '⚡' : '🔍'}
            </Text>
            <Text style={styles.metadataText}>
              {decision.mode === 'quick' ? 'Quick' : 'Full'}
            </Text>
          </View>

          {/* Preset */}
          {decision.weightPreset && decision.weightPreset !== 'balanced' && (
            <View style={styles.metadataItem}>
              <Text style={styles.metadataIcon}>⚖️</Text>
              <Text style={styles.metadataText}>{decision.weightPreset}</Text>
            </View>
          )}

          {/* Review Status */}
          {decision.review && (
            <View style={styles.metadataItem}>
              <Text style={styles.metadataIcon}>✓</Text>
              <Text style={styles.metadataText}>Reviewed</Text>
            </View>
          )}

          {/* Category */}
          {decision.category && decision.category !== 'other' && (
            <View style={styles.metadataItem}>
              <Text style={styles.metadataIcon}>🏷️</Text>
              <Text style={styles.metadataText}>{decision.category}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

/**
 * Filter Button Component
 */
function FilterButton({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, active && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  filterHeader: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0f172a'
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6'
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8'
  },
  filterButtonTextActive: {
    color: '#ffffff'
  },
  filterDivider: {
    width: 1,
    backgroundColor: '#334155',
    marginHorizontal: 8
  },
  timeline: {
    padding: 16
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24
  },
  timelineConnector: {
    width: 40,
    alignItems: 'center'
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#334155'
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginVertical: 4
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16
  },
  timelineDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8
  },
  timelineDecision: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  recommendationIcon: {
    fontSize: 16,
    marginRight: 6
  },
  recommendationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8
  },
  scoreText: {
    fontSize: 14,
    color: '#94a3b8'
  },
  shortSummary: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 12
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  metadataIcon: {
    fontSize: 12,
    marginRight: 4
  },
  metadataText: {
    fontSize: 12,
    color: '#94a3b8'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center'
  }
});

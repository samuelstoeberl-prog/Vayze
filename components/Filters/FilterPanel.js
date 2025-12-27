/**
 * Filter Panel - Erweiterte Filter-Optionen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useCardStore } from '../../store/cardStore';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: '#10b981', icon: '🟢' },
  { value: 'medium', label: 'Medium', color: '#f59e0b', icon: '🟡' },
  { value: 'high', label: 'High', color: '#f97316', icon: '🟠' },
  { value: 'urgent', label: 'Urgent', color: '#ef4444', icon: '🔴' },
];

const TYPE_OPTIONS = [
  { value: 'task', label: 'Task', icon: '✓' },
  { value: 'decision', label: 'Decision', icon: '🎯' },
  { value: 'idea', label: 'Idea', icon: '💡' },
  { value: 'note', label: 'Note', icon: '📝' },
];

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do', icon: '📋' },
  { value: 'in_progress', label: 'In Progress', icon: '⚡' },
  { value: 'review', label: 'Review', icon: '👀' },
  { value: 'done', label: 'Done', icon: '✅' },
];

export default function FilterPanel() {
  const { filters, setFilters, clearFilters, categories } = useCardStore();

  const toggleFilter = (filterType, value) => {
    const currentValues = filters[filterType] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    setFilters({ [filterType]: newValues });
  };

  const hasActiveFilters =
    filters.priorities.length > 0 ||
    filters.types.length > 0 ||
    filters.statuses.length > 0 ||
    filters.categories.length > 0 ||
    filters.showFavorites ||
    filters.showArchived;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Clear Filters */}
      {hasActiveFilters && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearFilters}
        >
          <Text style={styles.clearButtonText}>✕ Clear All</Text>
        </TouchableOpacity>
      )}

      {/* Categories */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Categories</Text>
        <View style={styles.filterRow}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterChip,
                filters.categories.includes(category.id) && styles.filterChipActive,
                filters.categories.includes(category.id) && {
                  backgroundColor: category.color + '20',
                  borderColor: category.color,
                },
              ]}
              onPress={() => toggleFilter('categories', category.id)}
            >
              <Text style={styles.filterChipIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.filterChipText,
                  filters.categories.includes(category.id) && styles.filterChipTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Priority */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Priority</Text>
        <View style={styles.filterRow}>
          {PRIORITY_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterChip,
                filters.priorities.includes(option.value) && styles.filterChipActive,
                filters.priorities.includes(option.value) && {
                  backgroundColor: option.color + '20',
                  borderColor: option.color,
                },
              ]}
              onPress={() => toggleFilter('priorities', option.value)}
            >
              <Text style={styles.filterChipIcon}>{option.icon}</Text>
              <Text
                style={[
                  styles.filterChipText,
                  filters.priorities.includes(option.value) && styles.filterChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Type */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Type</Text>
        <View style={styles.filterRow}>
          {TYPE_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterChip,
                filters.types.includes(option.value) && styles.filterChipActive,
              ]}
              onPress={() => toggleFilter('types', option.value)}
            >
              <Text style={styles.filterChipIcon}>{option.icon}</Text>
              <Text
                style={[
                  styles.filterChipText,
                  filters.types.includes(option.value) && styles.filterChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Status */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Status</Text>
        <View style={styles.filterRow}>
          {STATUS_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterChip,
                filters.statuses.includes(option.value) && styles.filterChipActive,
              ]}
              onPress={() => toggleFilter('statuses', option.value)}
            >
              <Text style={styles.filterChipIcon}>{option.icon}</Text>
              <Text
                style={[
                  styles.filterChipText,
                  filters.statuses.includes(option.value) && styles.filterChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Filters */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Quick Filters</Text>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filters.showFavorites && styles.filterChipActive,
            ]}
            onPress={() => setFilters({ showFavorites: !filters.showFavorites })}
          >
            <Text style={styles.filterChipIcon}>⭐</Text>
            <Text
              style={[
                styles.filterChipText,
                filters.showFavorites && styles.filterChipTextActive,
              ]}
            >
              Favorites
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filters.showArchived && styles.filterChipActive,
            ]}
            onPress={() => setFilters({ showArchived: !filters.showArchived })}
          >
            <Text style={styles.filterChipIcon}>📦</Text>
            <Text
              style={[
                styles.filterChipText,
                filters.showArchived && styles.filterChipTextActive,
              ]}
            >
              Archived
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  clearButton: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#3b82f6',
  },
  filterChipIcon: {
    fontSize: 14,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#1e293b',
  },
});

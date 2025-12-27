import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSurveyData, getPersonalizedInsights } from '../hooks/useSurveyData';

/**
 * Example component showing how to use survey data for personalization
 * This can be integrated into the main dashboard/home screen
 */
export default function PersonalizedDashboard() {
  const { surveyData, loading } = useSurveyData();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (!surveyData) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No personalization data available</Text>
      </View>
    );
  }

  const insights = getPersonalizedInsights(surveyData);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Personalized Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Based on your preferences and goals
        </Text>
      </View>

      {/* Primary Goals */}
      {insights.primaryGoals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Your Goals</Text>
          {insights.primaryGoals.map((goal, index) => (
            <View key={index} style={styles.goalCard}>
              <Text style={styles.goalText}>{goal}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Struggling Areas */}
      {insights.strugglingAreas.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Focus Areas</Text>
          <View style={styles.tagsContainer}>
            {insights.strugglingAreas.map((area, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{area}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Current Behavior */}
      {insights.currentBehavior && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧠 Current Pattern</Text>
          <View style={styles.behaviorCard}>
            <Text style={styles.behaviorText}>{insights.currentBehavior}</Text>
          </View>
        </View>
      )}

      {/* Personalized Suggestions */}
      {insights.suggestions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Personalized Tips</Text>
          {insights.suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionCard}>
              <View style={styles.suggestionBullet} />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Desired Outcomes */}
      {insights.desiredOutcomes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ What Success Looks Like</Text>
          {insights.desiredOutcomes.map((outcome, index) => (
            <View key={index} style={styles.outcomeCard}>
              <Text style={styles.outcomeIcon}>→</Text>
              <Text style={styles.outcomeText}>{outcome}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  goalText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#eff6ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  tagText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
  },
  behaviorCard: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  behaviorText: {
    fontSize: 16,
    color: '#78350f',
    fontWeight: '500',
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  suggestionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginTop: 7,
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: '#14532d',
    lineHeight: 22,
  },
  outcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  outcomeIcon: {
    fontSize: 20,
    marginRight: 12,
    color: '#3b82f6',
  },
  outcomeText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
});

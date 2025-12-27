/**
 * DecisionProfileScreen
 *
 * Zeigt das personalisierte Entscheidungsprofil des Users
 * Archetyp, Stärken, Wachstumsbereiche, Empfehlungen
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { useDecisionStore } from '../store/decisionStore';

const { width } = Dimensions.get('window');

export default function DecisionProfileScreen({ navigation }) {
  const { profile, updateProfile, decisions, reviews } = useDecisionStore();

  useEffect(() => {
    updateProfile();
  }, [decisions, reviews]);

  if (!profile || decisions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👤</Text>
          <Text style={styles.emptyTitle}>Noch kein Profil</Text>
          <Text style={styles.emptyText}>
            Treffe mindestens 3 Entscheidungen, um dein Profil zu erstellen!
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.emptyButtonText}>Entscheidung treffen</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { archetype, strengths, growthAreas, recommendations, metrics } = profile;

  return (
    <ScrollView style={styles.container}>
      {/* Archetyp Header */}
      <View style={[styles.archetypeCard, { borderColor: archetype.color }]}>
        <Text style={styles.archetypeIcon}>{archetype.icon}</Text>
        <Text style={styles.archetypeName}>{archetype.name}</Text>
        <Text style={styles.archetypeDescription}>{archetype.description}</Text>

        {/* Traits */}
        <View style={styles.traitsContainer}>
          {archetype.traits.map((trait, idx) => (
            <View key={idx} style={[styles.traitBadge, { backgroundColor: archetype.color }]}>
              <Text style={styles.traitText}>{trait}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Metriken */}
      <View style={styles.metricsCard}>
        <Text style={styles.sectionTitle}>📊 Deine Metriken</Text>

        <View style={styles.metricsGrid}>
          <MetricBox
            label="Ø Klarheit"
            value={`${metrics.avgConfidence}%`}
            icon="🎯"
          />
          <MetricBox
            label="Erfolgsquote"
            value={`${metrics.avgSuccessScore}%`}
            icon="🏆"
          />
          <MetricBox
            label="Konsistenz"
            value={`${metrics.consistency}%`}
            icon="🔒"
          />
          <MetricBox
            label="Entscheidungen"
            value={metrics.totalDecisions}
            icon="📝"
          />
        </View>

        {/* Mode Preference */}
        <View style={styles.metricDetail}>
          <Text style={styles.metricDetailLabel}>Bevorzugter Modus</Text>
          <View style={styles.modeBar}>
            <View
              style={[
                styles.modeBarFill,
                { width: `${metrics.modePreference}%`, backgroundColor: '#3b82f6' }
              ]}
            />
          </View>
          <Text style={styles.metricDetailValue}>
            {metrics.modePreference}% Quick Mode
          </Text>
        </View>

        {/* Decision Balance */}
        <View style={styles.metricDetail}>
          <Text style={styles.metricDetailLabel}>Entscheidungs-Balance</Text>
          <View style={styles.balanceBar}>
            <View
              style={[
                styles.balanceBarFill,
                { width: `${metrics.decisionBalance}%`, backgroundColor: '#10b981' }
              ]}
            />
          </View>
          <Text style={styles.metricDetailValue}>
            {metrics.decisionBalance}% JA-Entscheidungen
          </Text>
        </View>

        {/* Clarity Trend */}
        {metrics.clarityTrend !== 'neutral' && (
          <View style={styles.trendBox}>
            <Text style={styles.trendIcon}>
              {metrics.clarityTrend === 'improving' ? '📈' : '📉'}
            </Text>
            <Text style={styles.trendText}>
              Deine Klarheit ist {metrics.clarityTrend === 'improving' ? 'steigend' : 'sinkend'}
            </Text>
          </View>
        )}
      </View>

      {/* Stärken */}
      {strengths.length > 0 && (
        <View style={styles.strengthsCard}>
          <Text style={styles.sectionTitle}>💪 Deine Stärken</Text>
          {strengths.map((strength, idx) => (
            <View key={idx} style={styles.strengthBox}>
              <Text style={styles.strengthIcon}>{strength.icon}</Text>
              <View style={styles.strengthContent}>
                <Text style={styles.strengthTitle}>{strength.title}</Text>
                <Text style={styles.strengthDescription}>{strength.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Wachstumsbereiche */}
      {growthAreas.length > 0 && (
        <View style={styles.growthCard}>
          <Text style={styles.sectionTitle}>🌱 Wachstumsbereiche</Text>
          {growthAreas.map((area, idx) => (
            <View key={idx} style={styles.growthBox}>
              <Text style={styles.growthIcon}>{area.icon}</Text>
              <View style={styles.growthContent}>
                <Text style={styles.growthTitle}>{area.title}</Text>
                <Text style={styles.growthDescription}>{area.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Empfehlungen */}
      {recommendations.length > 0 && (
        <View style={styles.recommendationsCard}>
          <Text style={styles.sectionTitle}>💡 Empfehlungen</Text>
          {recommendations.map((rec, idx) => (
            <View
              key={idx}
              style={[
                styles.recommendationBox,
                rec.priority === 'high' && styles.recommendationHighPriority
              ]}
            >
              <Text style={styles.recommendationText}>{rec.text}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Kategorie-Verteilung */}
      {Object.keys(metrics.categoryDistribution).length > 0 && (
        <View style={styles.categoriesCard}>
          <Text style={styles.sectionTitle}>🎯 Deine Fokus-Bereiche</Text>
          {Object.entries(metrics.categoryDistribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([category, count]) => (
              <View key={category} style={styles.categoryRow}>
                <Text style={styles.categoryLabel}>{category}</Text>
                <View style={styles.categoryBar}>
                  <View
                    style={[
                      styles.categoryBarFill,
                      {
                        width: `${(count / metrics.totalDecisions) * 100}%`,
                        backgroundColor: '#8b5cf6'
                      }
                    ]}
                  />
                </View>
                <Text style={styles.categoryCount}>{count}</Text>
              </View>
            ))}
        </View>
      )}

      {/* Preset Preference */}
      <View style={styles.presetCard}>
        <Text style={styles.sectionTitle}>⚖️ Bevorzugte Gewichtung</Text>
        <View style={styles.presetBox}>
          <Text style={styles.presetName}>{metrics.presetPreference}</Text>
          <Text style={styles.presetDescription}>
            Du nutzt diese Gewichtung am häufigsten
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/**
 * Metric Box Component
 */
function MetricBox({ label, value, icon }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  archetypeCard: {
    backgroundColor: '#1e293b',
    margin: 16,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 3
  },
  archetypeIcon: {
    fontSize: 72,
    marginBottom: 16
  },
  archetypeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center'
  },
  archetypeDescription: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center'
  },
  traitBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  traitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff'
  },
  metricsCard: {
    backgroundColor: '#1e293b',
    margin: 16,
    marginTop: 0,
    borderRadius: 20,
    padding: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20
  },
  metricBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    width: (width - 88) / 2,
    alignItems: 'center'
  },
  metricIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4
  },
  metricLabel: {
    fontSize: 12,
    color: '#94a3b8'
  },
  metricDetail: {
    marginBottom: 20
  },
  metricDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8
  },
  modeBar: {
    height: 8,
    backgroundColor: '#0f172a',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8
  },
  modeBarFill: {
    height: '100%',
    borderRadius: 4
  },
  balanceBar: {
    height: 8,
    backgroundColor: '#0f172a',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8
  },
  balanceBarFill: {
    height: '100%',
    borderRadius: 4
  },
  metricDetailValue: {
    fontSize: 12,
    color: '#64748b'
  },
  trendBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16
  },
  trendIcon: {
    fontSize: 24,
    marginRight: 12
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff'
  },
  strengthsCard: {
    backgroundColor: '#1e293b',
    margin: 16,
    marginTop: 0,
    borderRadius: 20,
    padding: 24
  },
  strengthBox: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  strengthIcon: {
    fontSize: 28,
    marginRight: 12
  },
  strengthContent: {
    flex: 1
  },
  strengthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4
  },
  strengthDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20
  },
  growthCard: {
    backgroundColor: '#1e293b',
    margin: 16,
    marginTop: 0,
    borderRadius: 20,
    padding: 24
  },
  growthBox: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  growthIcon: {
    fontSize: 28,
    marginRight: 12
  },
  growthContent: {
    flex: 1
  },
  growthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4
  },
  growthDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20
  },
  recommendationsCard: {
    backgroundColor: '#1e293b',
    margin: 16,
    marginTop: 0,
    borderRadius: 20,
    padding: 24
  },
  recommendationBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6'
  },
  recommendationHighPriority: {
    borderLeftColor: '#ef4444'
  },
  recommendationText: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 20
  },
  categoriesCard: {
    backgroundColor: '#1e293b',
    margin: 16,
    marginTop: 0,
    borderRadius: 20,
    padding: 24
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  categoryLabel: {
    fontSize: 14,
    color: '#ffffff',
    width: 100
  },
  categoryBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#0f172a',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 12
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 4
  },
  categoryCount: {
    fontSize: 14,
    color: '#94a3b8',
    width: 30,
    textAlign: 'right'
  },
  presetCard: {
    backgroundColor: '#1e293b',
    margin: 16,
    marginTop: 0,
    borderRadius: 20,
    padding: 24
  },
  presetBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  presetName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8
  },
  presetDescription: {
    fontSize: 14,
    color: '#94a3b8'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  emptyIcon: {
    fontSize: 72,
    marginBottom: 20
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32
  },
  emptyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff'
  }
});

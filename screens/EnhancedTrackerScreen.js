/**
 * EnhancedTrackerScreen
 *
 * Tracker mit Insights, Confidence Score und Pattern Recognition
 * Zeigt nicht nur ZAHLEN, sondern BEDEUTUNG
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useDecisionStore } from '../store/decisionStore';
import { ConfidenceScoreCalculator } from '../utils/confidenceScoreCalculator';

const { width } = Dimensions.get('window');

export default function EnhancedTrackerScreen({ navigation }) {
  const {
    decisions,
    reviews,
    confidenceScore,
    updateConfidenceScore,
    getUserInsights,
    getStatistics
  } = useDecisionStore();

  useEffect(() => {
    // Update Confidence Score beim Laden
    updateConfidenceScore();
  }, [decisions, reviews]);

  const stats = getStatistics();
  const insights = getUserInsights();
  const factorExplanations = ConfidenceScoreCalculator.getFactorExplanations();

  return (
    <ScrollView style={styles.container}>
      {/* Header: Confidence Score */}
      {confidenceScore && (
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreTitle}>Dein Decision Confidence Score</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.scoreLink}>Details ›</Text>
            </TouchableOpacity>
          </View>

          {/* Score Circle */}
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{confidenceScore.score}</Text>
            <Text style={styles.scoreLabel}>{confidenceScore.message}</Text>
          </View>

          {/* Trend */}
          {confidenceScore.trend !== 'neutral' && (
            <View style={styles.trendBadge}>
              <Text style={styles.trendText}>
                {confidenceScore.trend === 'improving' ? '📈 Steigend' : '📉 Sinkend'}
              </Text>
            </View>
          )}

          {/* Faktoren */}
          <View style={styles.factorsGrid}>
            {Object.entries(confidenceScore.factors).map(([key, value]) => {
              const factorInfo = factorExplanations[key];
              return (
                <View key={key} style={styles.factorItem}>
                  <Text style={styles.factorIcon}>{factorInfo.icon}</Text>
                  <Text style={styles.factorName}>{factorInfo.name}</Text>
                  <Text style={styles.factorValue}>{value}%</Text>
                </View>
              );
            })}
          </View>

          {/* Insights */}
          {confidenceScore.insights && confidenceScore.insights.length > 0 && (
            <View style={styles.scoreInsights}>
              {confidenceScore.insights.map((insight, idx) => (
                <Text key={idx} style={styles.scoreInsightText}>
                  {insight}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Statistiken */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>📊 Statistiken</Text>

        <View style={styles.statsGrid}>
          <StatBox
            label="Entscheidungen"
            value={stats.totalDecisions}
            icon="🎯"
          />
          <StatBox
            label="Reviews"
            value={stats.totalReviews}
            icon="🔄"
          />
          <StatBox
            label="Ø Klarheit"
            value={`${stats.avgConfidence}%`}
            icon="💡"
          />
          <StatBox
            label="Review-Rate"
            value={`${Math.round(stats.reviewRate)}%`}
            icon="📈"
          />
        </View>

        {/* Empfehlungs-Verteilung */}
        <View style={styles.distributionSection}>
          <Text style={styles.distributionTitle}>Empfehlungen</Text>
          <View style={styles.distributionBars}>
            <DistributionBar
              label="JA"
              count={stats.yesCount}
              total={stats.totalDecisions}
              color="#10b981"
            />
            <DistributionBar
              label="NEIN"
              count={stats.noCount}
              total={stats.totalDecisions}
              color="#ef4444"
            />
            <DistributionBar
              label="UNKLAR"
              count={stats.unclearCount}
              total={stats.totalDecisions}
              color="#f59e0b"
            />
          </View>
        </View>

        {/* Modus-Verteilung */}
        <View style={styles.distributionSection}>
          <Text style={styles.distributionTitle}>Modus</Text>
          <View style={styles.distributionBars}>
            <DistributionBar
              label="Quick"
              count={stats.quickCount}
              total={stats.totalDecisions}
              color="#3b82f6"
            />
            <DistributionBar
              label="Full"
              count={stats.fullCount}
              total={stats.totalDecisions}
              color="#8b5cf6"
            />
          </View>
        </View>
      </View>

      {/* User Insights */}
      {insights.length > 0 && (
        <View style={styles.insightsCard}>
          <Text style={styles.cardTitle}>✨ Deine Muster</Text>
          {insights.map((insight, idx) => (
            <View key={idx} style={styles.insightBox}>
              <Text style={styles.insightIcon}>{insight.icon}</Text>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insight.text}</Text>
                <Text style={styles.insightDetail}>{insight.detail}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Aktionen */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.actionButtonText}>👤 Mein Profil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Timeline')}
        >
          <Text style={styles.actionButtonText}>📅 Timeline</Text>
        </TouchableOpacity>
      </View>

      {/* Empty State */}
      {decisions.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyTitle}>Noch keine Entscheidungen</Text>
          <Text style={styles.emptyText}>
            Treffe deine erste Entscheidung, um deinen Score zu sehen!
          </Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/**
 * Stat Box Component
 */
function StatBox({ label, value, icon }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/**
 * Distribution Bar Component
 */
function DistributionBar({ label, count, total, color }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <View style={styles.distributionBar}>
      <View style={styles.distributionBarHeader}>
        <Text style={styles.distributionBarLabel}>{label}</Text>
        <Text style={styles.distributionBarCount}>
          {count} ({Math.round(percentage)}%)
        </Text>
      </View>
      <View style={styles.distributionBarTrack}>
        <View
          style={[
            styles.distributionBarFill,
            { width: `${percentage}%`, backgroundColor: color }
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  scoreCard: {
    backgroundColor: '#1e293b',
    margin: 16,
    borderRadius: 20,
    padding: 24
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  scoreLink: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600'
  },
  scoreCircle: {
    alignItems: 'center',
    marginBottom: 20
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  scoreLabel: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8
  },
  trendBadge: {
    alignSelf: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20
  },
  trendText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600'
  },
  factorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20
  },
  factorItem: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    width: (width - 88) / 2,
    alignItems: 'center'
  },
  factorIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  factorName: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4
  },
  factorValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  scoreInsights: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16
  },
  scoreInsightText: {
    fontSize: 14,
    color: '#e2e8f0',
    marginBottom: 8,
    lineHeight: 20
  },
  statsCard: {
    backgroundColor: '#1e293b',
    margin: 16,
    marginTop: 0,
    borderRadius: 20,
    padding: 24
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24
  },
  statBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    width: (width - 88) / 2,
    alignItems: 'center'
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8'
  },
  distributionSection: {
    marginBottom: 20
  },
  distributionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 12
  },
  distributionBars: {
    gap: 12
  },
  distributionBar: {
    marginBottom: 0
  },
  distributionBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  distributionBarLabel: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600'
  },
  distributionBarCount: {
    fontSize: 14,
    color: '#94a3b8'
  },
  distributionBarTrack: {
    height: 8,
    backgroundColor: '#0f172a',
    borderRadius: 4,
    overflow: 'hidden'
  },
  distributionBarFill: {
    height: '100%',
    borderRadius: 4
  },
  insightsCard: {
    backgroundColor: '#1e293b',
    margin: 16,
    marginTop: 0,
    borderRadius: 20,
    padding: 24
  },
  insightBox: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  insightIcon: {
    fontSize: 28,
    marginRight: 12
  },
  insightContent: {
    flex: 1
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4
  },
  insightDetail: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20
  },
  actions: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 12
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff'
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

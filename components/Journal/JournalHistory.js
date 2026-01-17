import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  Dimensions
} from 'react-native';
import { useJournalStore } from '../../store/journalStore';
import { useDecisionStore } from '../../store/decisionStore';

const { width } = Dimensions.get('window');

export default function JournalHistory({ onClose }) {
  const { journals, getStats, streaks } = useJournalStore();
  const { getDecisionById } = useDecisionStore();

  const [selectedJournal, setSelectedJournal] = useState(null);
  const [filter, setFilter] = useState('all'); // all, week, month

  const stats = getStats();

  // Filter journals
  const getFilteredJournals = () => {
    const now = new Date();
    let filtered = [...journals];

    if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(j => new Date(j.entryDate) >= weekAgo);
    } else if (filter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(j => new Date(j.entryDate) >= monthAgo);
    }

    return filtered.sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));
  };

  const filteredJournals = getFilteredJournals();

  // Group by date
  const groupedByDate = filteredJournals.reduce((acc, journal) => {
    const date = new Date(journal.entryDate).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(journal);
    return acc;
  }, {});

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Gerade eben';
    if (seconds < 3600) return `vor ${Math.floor(seconds / 60)} Min`;
    if (seconds < 86400) return `vor ${Math.floor(seconds / 3600)} Std`;
    if (seconds < 604800) return `vor ${Math.floor(seconds / 86400)} Tagen`;
    return date.toLocaleDateString('de-DE');
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Journal History</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalEntries}</Text>
            <Text style={styles.statLabel}>Einträge</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streaks.current} 🔥</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streaks.longest}</Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalWords}</Text>
            <Text style={styles.statLabel}>Wörter</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              Alle
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'week' && styles.filterTabActive]}
            onPress={() => setFilter('week')}
          >
            <Text style={[styles.filterTabText, filter === 'week' && styles.filterTabTextActive]}>
              Woche
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'month' && styles.filterTabActive]}
            onPress={() => setFilter('month')}
          >
            <Text style={[styles.filterTabText, filter === 'month' && styles.filterTabTextActive]}>
              Monat
            </Text>
          </TouchableOpacity>
        </View>

        {/* Timeline */}
        <ScrollView style={styles.timeline} contentContainerStyle={styles.timelineContent}>
          {Object.keys(groupedByDate).length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📓</Text>
              <Text style={styles.emptyStateText}>Keine Einträge gefunden</Text>
            </View>
          ) : (
            Object.entries(groupedByDate).map(([date, dayJournals]) => (
              <View key={date} style={styles.dateGroup}>
                <View style={styles.dateHeader}>
                  <View style={styles.dateLine} />
                  <Text style={styles.dateText}>{date}</Text>
                  <View style={styles.dateLine} />
                </View>

                {dayJournals.map((journal) => {
                  const decision = getDecisionById(journal.decisionId);

                  return (
                    <TouchableOpacity
                      key={journal.id}
                      style={styles.journalCard}
                      onPress={() => setSelectedJournal(journal)}
                    >
                      {/* Timeline Dot */}
                      <View style={styles.timelineDot} />
                      <View style={styles.timelineConnector} />

                      {/* Journal Content */}
                      <View style={styles.journalContent}>
                        <View style={styles.journalHeader}>
                          <Text style={styles.journalDecision} numberOfLines={1}>
                            {decision?.decision || 'Entscheidung gelöscht'}
                          </Text>
                          <Text style={styles.journalTime}>
                            {formatTimeAgo(journal.entryDate)}
                          </Text>
                        </View>

                        {journal.emotionalState && (
                          <View style={styles.emotionBadge}>
                            <Text style={styles.emotionText}>
                              💭 {journal.emotionalState.substring(0, 50)}
                              {journal.emotionalState.length > 50 ? '...' : ''}
                            </Text>
                          </View>
                        )}

                        {journal.decisiveFactor && (
                          <Text style={styles.journalSnippet} numberOfLines={2}>
                            🎯 {journal.decisiveFactor}
                          </Text>
                        )}

                        {/* Media indicators */}
                        <View style={styles.mediaIndicators}>
                          {journal.photoUris && journal.photoUris.length > 0 && (
                            <View style={styles.mediaIndicator}>
                              <Text style={styles.mediaIndicatorText}>
                                📷 {journal.photoUris.length}
                              </Text>
                            </View>
                          )}

                          {journal.voiceMemoUri && (
                            <View style={styles.mediaIndicator}>
                              <Text style={styles.mediaIndicatorText}>
                                🎤 {formatDuration(journal.voiceMemoDuration || 0)}
                              </Text>
                            </View>
                          )}

                          <View style={styles.wordCount}>
                            <Text style={styles.wordCountText}>
                              {journal.wordCount} Wörter
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          )}
        </ScrollView>

        {/* Detail Modal */}
        {selectedJournal && (
          <JournalDetailModal
            journal={selectedJournal}
            onClose={() => setSelectedJournal(null)}
          />
        )}
      </View>
    </Modal>
  );
}

// Journal Detail Modal
function JournalDetailModal({ journal, onClose }) {
  const { getDecisionById } = useDecisionStore();
  const decision = getDecisionById(journal.decisionId);

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.detailHeaderTitle}>Journal Eintrag</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.detailScroll}
          contentContainerStyle={styles.detailScrollContent}
        >
          {/* Decision Context */}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionLabel}>Entscheidung</Text>
            <Text style={styles.detailDecisionText}>
              {decision?.decision || 'Entscheidung gelöscht'}
            </Text>
            <Text style={styles.detailDate}>
              {new Date(journal.entryDate).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>

          {/* Decisive Factor */}
          {journal.decisiveFactor && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>
                🎯 Was war der entscheidende Faktor?
              </Text>
              <Text style={styles.detailText}>{journal.decisiveFactor}</Text>
            </View>
          )}

          {/* Emotional State */}
          {journal.emotionalState && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>
                💭 Welches Gefühl überwiegt jetzt?
              </Text>
              <Text style={styles.detailText}>{journal.emotionalState}</Text>
            </View>
          )}

          {/* Message to Future */}
          {journal.messageToFuture && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>
                💌 Nachricht an dein zukünftiges Ich
              </Text>
              <Text style={styles.detailText}>{journal.messageToFuture}</Text>
            </View>
          )}

          {/* Additional Notes */}
          {journal.additionalNotes && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>
                📝 Zusätzliche Gedanken
              </Text>
              <Text style={styles.detailText}>{journal.additionalNotes}</Text>
            </View>
          )}

          {/* Photos */}
          {journal.photoUris && journal.photoUris.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>📷 Fotos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.photosGrid}>
                  {journal.photoUris.map((uri, index) => (
                    <Image key={index} source={{ uri }} style={styles.detailPhoto} />
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Voice Memo */}
          {journal.voiceMemoUri && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>🎤 Voice Memo</Text>
              <View style={styles.voiceMemoPreview}>
                <Text style={styles.voiceMemoIcon}>🎵</Text>
                <Text style={styles.voiceMemoText}>
                  Aufnahme ({Math.floor((journal.voiceMemoDuration || 0) / 60)}:
                  {((journal.voiceMemoDuration || 0) % 60).toString().padStart(2, '0')})
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  closeButton: {
    fontSize: 24,
    color: '#374151'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center'
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center'
  },
  filterTabActive: {
    backgroundColor: '#3b82f6'
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280'
  },
  filterTabTextActive: {
    color: '#fff'
  },
  timeline: {
    flex: 1
  },
  timelineContent: {
    padding: 16
  },
  dateGroup: {
    marginBottom: 24
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb'
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    paddingHorizontal: 12
  },
  journalCard: {
    position: 'relative',
    marginBottom: 16,
    marginLeft: 20
  },
  timelineDot: {
    position: 'absolute',
    left: -20,
    top: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
    borderWidth: 2,
    borderColor: '#fff'
  },
  timelineConnector: {
    position: 'absolute',
    left: -14,
    top: 20,
    bottom: -16,
    width: 2,
    backgroundColor: '#e5e7eb'
  },
  journalContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  journalDecision: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8
  },
  journalTime: {
    fontSize: 12,
    color: '#9ca3af'
  },
  emotionBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  emotionText: {
    fontSize: 14,
    color: '#374151'
  },
  journalSnippet: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8
  },
  mediaIndicators: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8
  },
  mediaIndicator: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  mediaIndicatorText: {
    fontSize: 12,
    color: '#6b7280'
  },
  wordCount: {
    marginLeft: 'auto'
  },
  wordCountText: {
    fontSize: 12,
    color: '#9ca3af'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280'
  },
  // Detail Modal Styles
  detailContainer: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  detailHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  detailScroll: {
    flex: 1
  },
  detailScrollContent: {
    padding: 20
  },
  detailSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  detailSectionLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4
  },
  detailDecisionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4
  },
  detailDate: {
    fontSize: 14,
    color: '#9ca3af'
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12
  },
  detailText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22
  },
  photosGrid: {
    flexDirection: 'row',
    gap: 12
  },
  detailPhoto: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f3f4f6'
  },
  voiceMemoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    gap: 12
  },
  voiceMemoIcon: {
    fontSize: 32
  },
  voiceMemoText: {
    fontSize: 14,
    color: '#374151'
  }
});

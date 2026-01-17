import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useJournalStore } from '../store/journalStore';
import { useDecisionStore } from '../store/decisionStore';
import { useCardStore } from '../store/cardStore';
import { useAuth } from '../contexts/AuthContext';
import JournalEntry from '../components/Journal/JournalEntry';

// Emotion icon mapping (must match JournalEntry.js)
const emotionIcons = {
  smile: { icon: 'smile', color: '#10b981', bg: '#d1fae5', label: 'Glücklich' },
  meh: { icon: 'meh', color: '#f59e0b', bg: '#fef3c7', label: 'Neutral' },
  frown: { icon: 'frown', color: '#ef4444', bg: '#fee2e2', label: 'Besorgt' },
  sparkles: { icon: 'star', color: '#8b5cf6', bg: '#ede9fe', label: 'Begeistert' },
  coffee: { icon: 'coffee', color: '#78716c', bg: '#e7e5e4', label: 'Entspannt' },
  zap: { icon: 'zap', color: '#eab308', bg: '#fef9c3', label: 'Energiegeladen' },
  users: { icon: 'users', color: '#3b82f6', bg: '#dbeafe', label: 'Verbunden' },
  cloud: { icon: 'cloud-drizzle', color: '#6b7280', bg: '#f3f4f6', label: 'Nachdenklich' }
};

export default function JournalDashboardScreen({ navigation, completedDecisions: propDecisions }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const {
    journals,
    getStats,
    addJournal,
    setCurrentUser: setJournalUser
  } = useJournalStore();

  const { decisions: storeDecisions } = useDecisionStore();
  const cards = useCardStore((state) => state.cards);

  // Use completedDecisions from props (App.js) if available, otherwise fallback to store
  const decisions = propDecisions || storeDecisions;

  // Initialize journal store with current user
  useEffect(() => {
    if (user?.email) {
      console.log('Initializing journal store for user:', user.email);
      setJournalUser(user.email);
    }
  }, [user]);

  const [view, setView] = useState('list'); // 'list', 'entry', 'detail', 'select'
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [availableDecisions, setAvailableDecisions] = useState([]);

  const stats = getStats();

  // Helper function to get cards for a decision
  const getCardsForDecision = (decisionId) => {
    const cardArray = Array.from(cards.values());
    return cardArray.filter(card => card.linkedDecisionId === decisionId);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleNewEntry = () => {
    console.log('=== Journal Debug Info ===');
    console.log('Total decisions:', decisions.length);
    console.log('Total journals:', journals.length);

    // All decisions from App.js are already completed decisions
    if (decisions.length === 0) {
      alert('Du hast noch keine Entscheidungen! 📝\n\nErstelle zuerst eine Entscheidung im Decision Maker.');
      return;
    }

    // Get ALL decisions without journal (not just this month)
    const decisionsWithoutJournal = decisions.filter(d => {
      const hasJournal = journals.some(j => j.decisionId === d.id);
      return !hasJournal;
    });

    console.log('Decisions without journal:', decisionsWithoutJournal.length);

    if (decisionsWithoutJournal.length === 0) {
      alert('Du hast bereits für alle Entscheidungen ein Journal erstellt! 🎉\n\nErstelle eine neue Entscheidung, um weiterzuschreiben.');
      return;
    }

    // Sort by date descending (newest first)
    const sortedDecisions = [...decisionsWithoutJournal].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });

    setAvailableDecisions(sortedDecisions);
    setView('select');
  };

  const handleSelectDecision = (decision) => {
    console.log('Selected decision:', {
      id: decision.id,
      decision: decision.decision,
      date: decision.date
    });
    setSelectedDecision(decision);
    setView('entry');
  };

  const handleViewDetail = (journal) => {
    setSelectedJournal(journal);
    setView('detail');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Journal List View
  if (view === 'list') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header with Premium Status */}
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 56 }]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.headerTitleRow}>
              <Feather name="book-open" size={24} color="#fff" />
              <Text style={styles.headerTitle}>Decision Journal</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{journals.length}</Text>
                <Text style={styles.statLabel}>Einträge</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{decisions.length}</Text>
                <Text style={styles.statLabel}>Entscheidungen</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Meine Einträge</Text>
            <Text style={styles.sectionCount}>{journals.length} Einträge</Text>
          </View>

          {/* Journal Entries */}
          {journals.length > 0 ? (
            journals.map(journal => {
              const decision = decisions.find(d => d.id === journal.decisionId);
              return (
                <TouchableOpacity
                  key={journal.id}
                  style={styles.journalCard}
                  onPress={() => handleViewDetail(journal)}
                >
                  <View style={styles.journalHeader}>
                    <View style={styles.journalTitleContainer}>
                      <Text style={styles.journalTitle} numberOfLines={1}>
                        {decision?.decision || 'Entscheidung gelöscht'}
                      </Text>
                      <View style={styles.journalDateRow}>
                        <Feather name="calendar" size={14} color="#64748b" />
                        <Text style={styles.journalDate}>
                          {formatDate(journal.entryDate)}
                        </Text>
                      </View>
                    </View>
                    {journal.emotion && emotionIcons[journal.emotion] ? (
                      <View style={[
                        styles.journalEmojiIcon,
                        { backgroundColor: emotionIcons[journal.emotion].bg }
                      ]}>
                        <Feather
                          name={emotionIcons[journal.emotion].icon}
                          size={24}
                          color={emotionIcons[journal.emotion].color}
                        />
                      </View>
                    ) : (
                      <View style={[styles.journalEmojiIcon, { backgroundColor: '#f1f5f9' }]}>
                        <Feather name="meh" size={24} color="#64748b" />
                      </View>
                    )}
                  </View>

                  <View style={styles.journalBadges}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {decision?.category || 'Leben'}
                      </Text>
                    </View>
                    {journal.decisiveFactor && (
                      <View style={styles.factorBadge}>
                        <Text style={styles.factorBadgeText} numberOfLines={1}>
                          {journal.decisiveFactor.substring(0, 20)}...
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.journalFooter}>
                    <View style={styles.journalMedia}>
                      {journal.photoUris?.length > 0 && (
                        <View style={styles.mediaIndicator}>
                          <Feather name="camera" size={14} color="#6366f1" />
                          <Text style={styles.mediaText}>Foto</Text>
                        </View>
                      )}
                      {journal.voiceMemoUri && (
                        <View style={styles.mediaIndicator}>
                          <Feather name="mic" size={14} color="#6366f1" />
                          <Text style={styles.mediaText}>Audio</Text>
                        </View>
                      )}
                    </View>
                    <Feather name="chevron-right" size={20} color="#cbd5e1" />
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIconContainer}>
                <Feather name="book-open" size={48} color="#94a3b8" />
              </View>
              <Text style={styles.emptyStateTitle}>Noch keine Einträge</Text>
              <Text style={styles.emptyStateText}>
                Erstelle deinen ersten Journal-Eintrag nach einer Entscheidung
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Add Entry Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleNewEntry}
        >
          <Text style={styles.fabPlus}>+</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Decision Selection View
  if (view === 'select') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header */}
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.selectHeader, { paddingTop: insets.top + 56 }]}
        >
          <TouchableOpacity
            style={styles.selectBackButton}
            onPress={() => setView('list')}
          >
            <Text style={styles.selectBackIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.selectHeaderContent}>
            <Text style={styles.selectTitle}>Entscheidung wählen</Text>
            <Text style={styles.selectSubtitle}>
              {availableDecisions.length} verfügbare Entscheidungen
            </Text>
          </View>
        </LinearGradient>

        <ScrollView style={styles.selectScroll} contentContainerStyle={styles.selectContent}>
          {availableDecisions.map((decision) => {
            const decisionDate = new Date(decision.date);
            return (
              <TouchableOpacity
                key={decision.id}
                style={styles.decisionSelectCard}
                onPress={() => handleSelectDecision(decision)}
              >
                <View style={styles.decisionSelectHeader}>
                  <Text style={styles.decisionSelectTitle} numberOfLines={2}>
                    {decision.decision}
                  </Text>
                  <View style={[
                    styles.decisionSelectIcon,
                    { backgroundColor: decision.recommendation === 'JA' ? '#d1fae5' : '#fee2e2' }
                  ]}>
                    <Feather
                      name={decision.recommendation === 'JA' ? 'check' : 'x'}
                      size={20}
                      color={decision.recommendation === 'JA' ? '#10b981' : '#ef4444'}
                    />
                  </View>
                </View>

                <View style={styles.decisionSelectMeta}>
                  <View style={styles.decisionSelectBadge}>
                    <Text style={styles.decisionSelectBadgeText}>
                      {decision.category || 'Leben'}
                    </Text>
                  </View>

                  <Text style={styles.decisionSelectDate}>
                    {decisionDate.toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </View>

                <View style={styles.decisionSelectFooter}>
                  <Text style={styles.decisionSelectRecommendation}>
                    {decision.recommendation} ({decision.percentage}%)
                  </Text>
                  <Feather name="chevron-right" size={20} color="#cbd5e1" />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // New Entry View
  if (view === 'entry' && selectedDecision) {
    return (
      <JournalEntry
        decision={selectedDecision}
        onSave={async (journalData) => {
          setView('list');
          setSelectedDecision(null);
        }}
        onCancel={() => {
          setView('list');
          setSelectedDecision(null);
        }}
      />
    );
  }

  // Detail View
  if (view === 'detail' && selectedJournal) {
    const decision = decisions.find(d => d.id === selectedJournal.decisionId);
    const relatedCards = decision ? getCardsForDecision(decision.id) : [];

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Detail Header */}
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.detailHeader, { paddingTop: insets.top + 56 }]}
        >
          <TouchableOpacity
            style={styles.detailBackButton}
            onPress={() => setView('list')}
          >
            <Text style={styles.detailBackIcon}>✕</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between' }}>
            <View style={styles.detailHeaderContent}>
              <Text style={styles.detailTitle}>{decision?.decision || 'Entscheidung'}</Text>
              <View style={styles.detailDateRow}>
                <Feather name="calendar" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.detailDate}>
                  {new Date(selectedJournal.entryDate).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </View>
            {selectedJournal.emotion && emotionIcons[selectedJournal.emotion] ? (
              <View style={styles.detailEmojiIcon}>
                <Feather
                  name={emotionIcons[selectedJournal.emotion].icon}
                  size={32}
                  color="#fff"
                />
              </View>
            ) : (
              <View style={styles.detailEmojiIcon}>
                <Feather name="meh" size={32} color="#fff" />
              </View>
            )}
          </View>
        </LinearGradient>

        <ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailContent}>
          {/* Key Factor */}
          {selectedJournal.decisiveFactor && (
            <View style={styles.detailCard}>
              <View style={styles.detailCardHeader}>
                <View style={styles.detailCardIcon}>
                  <Feather name="lightbulb" size={20} color="#f59e0b" />
                </View>
                <Text style={styles.detailCardTitle}>Entscheidender Faktor</Text>
              </View>
              <Text style={styles.detailCardText}>{selectedJournal.decisiveFactor}</Text>
            </View>
          )}

          {/* Feeling */}
          {selectedJournal.emotionalState && (
            <View style={styles.detailCard}>
              <View style={styles.detailCardHeader}>
                <View style={[styles.detailCardIcon, { backgroundColor: '#f3e8ff' }]}>
                  <Feather name="heart" size={20} color="#8b5cf6" />
                </View>
                <Text style={styles.detailCardTitle}>Gefühl</Text>
              </View>
              <Text style={styles.detailCardText}>{selectedJournal.emotionalState}</Text>
            </View>
          )}

          {/* Future Message */}
          {selectedJournal.messageToFuture && (
            <View style={styles.futureMessageCard}>
              <View style={styles.detailCardHeader}>
                <View style={[styles.detailCardIcon, { backgroundColor: '#fff' }]}>
                  <Feather name="message-circle" size={20} color="#6366f1" />
                </View>
                <Text style={styles.detailCardTitle}>An mein zukünftiges Ich</Text>
              </View>
              <Text style={styles.futureMessageText}>
                "{selectedJournal.messageToFuture}"
              </Text>
            </View>
          )}

          {/* Related Cards from Board */}
          {relatedCards.length > 0 && (
            <View style={styles.cardsSection}>
              <View style={styles.cardsSectionHeader}>
                <Feather name="list" size={20} color="#6366f1" />
                <Text style={styles.cardsSectionTitle}>Board-Karten zu dieser Entscheidung</Text>
              </View>
              <Text style={styles.cardsSectionSubtext}>
                {relatedCards.length} {relatedCards.length === 1 ? 'Karte' : 'Karten'} aus deinem Board
              </Text>

              {relatedCards.map((card) => (
                <View key={card.id} style={styles.cardItem}>
                  <View style={styles.cardItemHeader}>
                    <View style={[
                      styles.cardCategoryIndicator,
                      { backgroundColor: card.category === 'done' ? '#10b981' : card.category === 'in_progress' ? '#f59e0b' : '#3b82f6' }
                    ]} />
                    <Text style={styles.cardItemTitle} numberOfLines={2}>
                      {card.title}
                    </Text>
                  </View>
                  {card.description && (
                    <Text style={styles.cardItemDescription} numberOfLines={2}>
                      {card.description}
                    </Text>
                  )}
                  <View style={styles.cardItemFooter}>
                    <View style={styles.cardItemBadge}>
                      <Text style={styles.cardItemBadgeText}>
                        {card.category === 'done' ? 'Erledigt' : card.category === 'in_progress' ? 'In Arbeit' : 'Offen'}
                      </Text>
                    </View>
                    {card.priority && (
                      <View style={[
                        styles.cardPriorityBadge,
                        {
                          backgroundColor: card.priority === 'high' ? '#fee2e2' : card.priority === 'medium' ? '#fef3c7' : '#f0f9ff',
                          borderColor: card.priority === 'high' ? '#ef4444' : card.priority === 'medium' ? '#f59e0b' : '#3b82f6'
                        }
                      ]}>
                        <Text style={[
                          styles.cardPriorityText,
                          { color: card.priority === 'high' ? '#ef4444' : card.priority === 'medium' ? '#f59e0b' : '#3b82f6' }
                        ]}>
                          {card.priority === 'high' ? 'Hoch' : card.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Timeline Note */}
          <View style={styles.timelineNote}>
            <Feather name="calendar" size={16} color="#6366f1" />
            <Text style={styles.timelineNoteText}>
              In 3 Monaten wirst du an diesen Eintrag erinnert
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  header: {
    // paddingTop wird dynamisch gesetzt
    paddingBottom: 32,
    paddingHorizontal: 24
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  backButtonIcon: {
    fontSize: 24,
    color: '#fff'
  },
  headerContent: {
    gap: 16
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16
  },
  headerIcon: {
    fontSize: 32
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff'
  },
  usageCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  usageLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)'
  },
  usageCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  usageBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12
  },
  usageBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4
  },
  upgradeButton: {
    backgroundColor: 'linear-gradient(to right, #fbbf24, #f97316)',
    backgroundColor: '#fbbf24',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  upgradeButtonIcon: {
    fontSize: 20
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  premiumCard: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  premiumIcon: {
    fontSize: 20
  },
  premiumLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
    flex: 1
  },
  premiumSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  sectionCount: {
    fontSize: 14,
    color: '#64748b'
  },
  journalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  journalTitleContainer: {
    flex: 1,
    marginRight: 12
  },
  journalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4
  },
  journalDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  journalDateIcon: {
    fontSize: 14
  },
  journalDate: {
    fontSize: 14,
    color: '#64748b'
  },
  journalEmojiIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  journalBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  categoryBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1'
  },
  factorBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    flex: 1
  },
  factorBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569'
  },
  journalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  journalMedia: {
    flexDirection: 'row',
    gap: 12
  },
  mediaIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  mediaText: {
    fontSize: 12,
    color: '#94a3b8'
  },
  chevron: {
    fontSize: 24,
    color: '#cbd5e1'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64
  },
  emptyStateIconContainer: {
    marginBottom: 16
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 32
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  fabPlus: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff'
  },
  detailHeader: {
    // paddingTop wird dynamisch gesetzt
    paddingBottom: 32,
    paddingHorizontal: 24
  },
  detailBackButton: {
    marginBottom: 16
  },
  detailBackIcon: {
    fontSize: 24,
    color: '#fff'
  },
  detailHeaderContent: {
    flex: 1
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  detailDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  detailDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)'
  },
  detailEmojiIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16
  },
  detailScroll: {
    flex: 1
  },
  detailContent: {
    padding: 24,
    paddingBottom: 40,
    gap: 24
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16
  },
  detailCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  detailCardIconText: {
    fontSize: 20
  },
  detailCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  detailCardText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24
  },
  futureMessageCard: {
    backgroundColor: '#eef2ff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#c7d2fe'
  },
  futureMessageText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    fontStyle: 'italic'
  },
  timelineNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fde68a'
  },
  timelineNoteText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
    textAlign: 'center'
  },
  // Selection View Styles
  selectHeader: {
    // paddingTop wird dynamisch gesetzt
    paddingBottom: 24,
    paddingHorizontal: 24
  },
  selectBackButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  selectBackIcon: {
    fontSize: 24,
    color: '#fff'
  },
  selectHeaderContent: {
    gap: 4
  },
  selectTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff'
  },
  selectSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)'
  },
  selectScroll: {
    flex: 1
  },
  selectContent: {
    padding: 24,
    paddingBottom: 40
  },
  decisionSelectCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  decisionSelectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  decisionSelectTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginRight: 12
  },
  decisionSelectIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  decisionSelectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  decisionSelectBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  decisionSelectBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1'
  },
  decisionSelectDate: {
    fontSize: 14,
    color: '#64748b'
  },
  decisionSelectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12
  },
  decisionSelectRecommendation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1'
  },
  // Stats Card Styles
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  statItem: {
    alignItems: 'center',
    gap: 4
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff'
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500'
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)'
  },
  // Cards Section Styles
  cardsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cardsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  cardsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  cardsSectionSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: -8
  },
  cardItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cardItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  cardCategoryIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginTop: 2
  },
  cardItemTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 22
  },
  cardItemDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginLeft: 16
  },
  cardItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 16
  },
  cardItemBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  cardItemBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1'
  },
  cardPriorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1
  },
  cardPriorityText: {
    fontSize: 12,
    fontWeight: '600'
  }
});

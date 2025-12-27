/**
 * Kanban Board View - Hauptansicht mit Kategorien-Spalten
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useCardStore } from '../../store/cardStore';
import CategoryColumn from './CategoryColumn';
import SearchBar from '../Filters/SearchBar';
import FilterPanel from '../Filters/FilterPanel';
import CardDetail from '../Card/CardDetail';
import AddCard from '../Card/AddCard';

const { width, height } = Dimensions.get('window');
const COLUMN_WIDTH = width > 768 ? 320 : width * 0.85;
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : 0;

export default function BoardView({ showTabBar = true, onNavigateToDecision }) {
  const {
    categories,
    getCardsByCategory,
    filters,
    isLoading,
    loadFromStorage,
    undo,
    redo,
    canUndo,
    canRedo,
    cards,
    updateCard,
  } = useCardStore();

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCardDetail, setShowCardDetail] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [addCardCategory, setAddCardCategory] = useState('backlog');

  useEffect(() => {
    loadFromStorage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCardPress = useCallback((card) => {
    setSelectedCard(card);
    setShowCardDetail(true);
  }, []);

  const handleAddCard = useCallback((categoryId) => {
    setAddCardCategory(categoryId);
    setShowAddCard(true);
  }, []);

  const handleCloseCardDetail = useCallback(() => {
    setShowCardDetail(false);
    setSelectedCard(null);
  }, []);

  const handleCloseAddCard = useCallback(() => {
    setShowAddCard(false);
  }, []);

  const handleQuickAction = useCallback((cardId, targetCategory) => {
    updateCard(cardId, { category: targetCategory });
  }, [updateCard]);

  const handleMakeDecision = useCallback((card) => {
    // Navigate to decision assistant with card context
    if (onNavigateToDecision) {
      onNavigateToDecision(card);
    }
  }, [onNavigateToDecision]);

  const totalCards = useMemo(() => Array.from(cards.values()).length, [cards]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <Text style={styles.loadingText}>Loading cards...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Safe Area Spacer for Status Bar */}
      <View style={styles.statusBarSpacer} />

      {/* Simplified Header - Clean & Minimal */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Board</Text>
          <Text style={styles.headerSubtitle}>
            {totalCards} cards
          </Text>
        </View>

        <View style={styles.headerActions}>
          {/* Filter Toggle */}
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={[styles.iconButton, showFilters && styles.iconButtonActive]}
          >
            <Text style={styles.iconButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar - Only when filter is active */}
      {showFilters && <SearchBar />}

      {/* Filter Panel */}
      {showFilters && <FilterPanel />}

      {/* Board Content */}
      {viewMode === 'kanban' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.boardScroll}
          contentContainerStyle={styles.boardContent}
        >
          {categories.map((category) => {
            const categoryCards = getCardsByCategory(category.id);
            return (
              <CategoryColumn
                key={category.id}
                category={category}
                cards={categoryCards}
                columnWidth={COLUMN_WIDTH}
                onCardPress={handleCardPress}
                onAddCard={handleAddCard}
                onQuickAction={handleQuickAction}
                onMakeDecision={handleMakeDecision}
              />
            );
          })}
        </ScrollView>
      ) : (
        <ScrollView style={styles.listView}>
          {categories.map((category) => {
            const cards = getCardsByCategory(category.id);
            if (cards.length === 0) return null;

            return (
              <View key={category.id} style={styles.listSection}>
                <Text style={styles.listSectionTitle}>
                  {category.icon} {category.name} ({cards.length})
                </Text>
                {cards.map((card) => (
                  <View key={card.id} style={styles.listCard}>
                    <Text style={styles.listCardTitle}>{card.title}</Text>
                    <Text style={styles.listCardMeta}>
                      {card.priority} • {card.type}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Modals */}
      {selectedCard && (
        <CardDetail
          visible={showCardDetail}
          card={cards.get(selectedCard.id)}
          onClose={handleCloseCardDetail}
        />
      )}

      <AddCard
        visible={showAddCard}
        onClose={handleCloseAddCard}
        defaultCategory={addCardCategory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  statusBarSpacer: {
    height: STATUS_BAR_HEIGHT,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  iconButtonText: {
    fontSize: 16,
  },
  boardScroll: {
    flex: 1,
  },
  boardContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 80, // Space for TabBar
  },
  listView: {
    flex: 1,
    padding: 16,
  },
  listSection: {
    marginBottom: 24,
  },
  listSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  listCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  listCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  listCardMeta: {
    fontSize: 12,
    color: '#64748b',
  },
});

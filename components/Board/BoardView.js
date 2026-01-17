import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCardStore } from '../../store/cardStore';
import { CircleIcon, CheckCircleIcon, ZapIcon, PlusIcon, SearchIcon } from '../Icons';
import CardDetail from '../Card/CardDetail';
import AddCard from '../Card/AddCard';

const { width } = Dimensions.get('window');

export default function BoardView({ showTabBar = true, onNavigateToDecision }) {
  const insets = useSafeAreaInsets();
  const {
    categories,
    getCardsByCategory,
    filters,
    isLoading,
    loadFromStorage,
    cards,
    updateCard,
  } = useCardStore();

  const [selectedCard, setSelectedCard] = useState(null);
  const [showCardDetail, setShowCardDetail] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [addCardCategory, setAddCardCategory] = useState('todo');

  useEffect(() => {
    loadFromStorage();
  }, []); 

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

  const totalCards = useMemo(() => Array.from(cards.values()).length, [cards]);

  const boardColumns = [
    {
      id: 'todo',
      title: 'To Do',
      color: 'slate',
      bgColor: '#f8fafc',
      borderColor: '#e2e8f0',
      iconName: 'circle'
    },
    {
      id: 'progress',
      title: 'In Progress',
      color: 'amber',
      bgColor: '#fffbeb',
      borderColor: '#fef3c7',
      iconName: 'zap'
    },
    {
      id: 'done',
      title: 'Done',
      color: 'emerald',
      bgColor: '#ecfdf5',
      borderColor: '#d1fae5',
      iconName: 'check'
    }
  ];

  const getColumnIcon = (iconName) => {
    switch (iconName) {
      case 'circle':
        return <CircleIcon size={20} color="#64748B" strokeWidth={2} />;
      case 'zap':
        return <ZapIcon size={20} color="#F59E0B" />;
      case 'check':
        return <CheckCircleIcon size={20} color="#059669" />;
      default:
        return null;
    }
  };

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

      {}
      <View style={[styles.header, { paddingTop: insets.top + 56 }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Board</Text>
            <Text style={styles.headerSubtitle}>{totalCards} cards</Text>
          </View>

          {}
          <TouchableOpacity style={styles.searchButton}>
            <SearchIcon size={20} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>

      {}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {boardColumns.map((column) => {

          let categoryCards = [];
          if (column.id === 'todo') {
            categoryCards = getCardsByCategory('todo');
          } else if (column.id === 'progress') {
            categoryCards = getCardsByCategory('in_progress');
          } else if (column.id === 'done') {
            categoryCards = getCardsByCategory('done');
          }

          return (
            <View key={column.id} style={styles.columnCard}>
              <View style={[styles.columnHeader, { backgroundColor: column.bgColor, borderBottomColor: column.borderColor }]}>
                <View style={styles.columnHeaderContent}>
                  {getColumnIcon(column.iconName)}
                  <Text style={styles.columnTitle}>{column.title}</Text>
                  <Text style={styles.columnCount}>{categoryCards.length} cards</Text>
                </View>
              </View>

              <View style={styles.columnContent}>
                {categoryCards.length === 0 ? (
                  <View style={styles.emptyState}>
                    <CircleIcon size={64} color="#CBD5E1" strokeWidth={1.5} />
                    <Text style={styles.emptyStateTitle}>No cards yet</Text>
                    <Text style={styles.emptyStateSubtitle}>Add your first card</Text>
                  </View>
                ) : (
                  
                  categoryCards.map((card) => (
                    <TouchableOpacity
                      key={card.id}
                      style={styles.cardItem}
                      onPress={() => handleCardPress(card)}
                    >
                      <Text style={styles.cardTitle}>{card.title}</Text>
                      {card.description && (
                        <Text style={styles.cardDescription} numberOfLines={2}>
                          {card.description}
                        </Text>
                      )}
                      <View style={styles.cardMeta}>
                        <Text style={styles.cardPriority}>{card.priority}</Text>
                        <Text style={styles.cardType}>{card.type}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => handleAddCard('backlog')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <PlusIcon size={24} color="#FFFFFF" strokeWidth={2.5} />
        </LinearGradient>
      </TouchableOpacity>

      {}
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    // paddingTop wird dynamisch gesetzt
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24, 
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 30, 
    fontWeight: 'bold',
    color: '#0f172a', 
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14, 
    color: '#64748b', 
  },
  searchButton: {
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: '#f1f5f9', 
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16, 
    paddingBottom: 120, 
  },

  columnCard: {
    backgroundColor: 'white',
    borderRadius: 16, 
    marginBottom: 16, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0', 
  },
  columnHeader: {
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    borderBottomWidth: 1,
  },
  columnHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  columnTitle: {
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#0f172a', 
    flex: 1,
  },
  columnCount: {
    fontSize: 14, 
    fontWeight: '500',
    color: '#64748b', 
  },

  columnContent: {
    paddingHorizontal: 20, 
    paddingVertical: 48, 
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94a3b8', 
    marginTop: 12,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#cbd5e1', 
    marginTop: 4,
  },

  cardItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  cardPriority: {
    fontSize: 12,
    color: '#64748b',
  },
  cardType: {
    fontSize: 12,
    color: '#94a3b8',
  },

  fab: {
    position: 'absolute',
    bottom: 96, 
    right: 24, 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

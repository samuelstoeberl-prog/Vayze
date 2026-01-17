import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useCardStore } from '../../store/cardStore';
import SwipeableCard from './SwipeableCard';

export default function CategoryColumn({
  category,
  cards,
  columnWidth,
  onCardPress,
  onAddCard,
  onQuickAction,
  onMakeDecision
}) {
  const handleCardPress = (card) => {
    if (onCardPress) {
      onCardPress(card);
    }
  };

  const handleAddCard = () => {
    if (onAddCard) {
      onAddCard(category.id);
    }
  };

  return (
    <View style={[styles.column, { width: columnWidth }]}>
      {}
      <View style={[styles.header, { borderTopColor: category.color }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerIcon}>{category.icon}</Text>
          <Text style={styles.headerTitle}>{category.name}</Text>
        </View>
        <View style={styles.headerBottom}>
          <Text style={styles.cardCount}>{cards.length} cards</Text>
        </View>
      </View>

      {}
      <ScrollView
        style={styles.cardsList}
        contentContainerStyle={styles.cardsContent}
        showsVerticalScrollIndicator={false}
      >
        {cards.map((card) => (
          <SwipeableCard
            key={card.id}
            card={card}
            onPress={() => handleCardPress(card)}
            onQuickAction={onQuickAction}
            onMakeDecision={onMakeDecision}
          />
        ))}

        {cards.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No cards yet</Text>
            <Text style={styles.emptySubtext}>Add your first card</Text>
          </View>
        )}
      </ScrollView>

      {}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddCard}
        activeOpacity={0.7}
      >
        <Text style={styles.addButtonText}>+ Add Card</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    backgroundColor: '#fafafa',
    borderRadius: 16,
    marginHorizontal: 8,
    minHeight: 200,
    maxHeight: '100%',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  header: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    letterSpacing: 0.3,
  },
  headerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardCount: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  cardsList: {
    flex: 1,
  },
  cardsContent: {
    padding: 12,
    paddingBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  addButton: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
});

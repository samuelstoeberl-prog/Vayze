import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useCardStore } from '../../store/cardStore';

export default function ChecklistSection({ cardId, checklist }) {
  const { addChecklistItem, toggleChecklistItem, deleteChecklistItem } = useCardStore();
  const [newItemText, setNewItemText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddItem = () => {
    if (newItemText.trim()) {
      addChecklistItem(cardId, newItemText.trim());
      setNewItemText('');
      setIsAdding(false);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>
          ✓ Checklist ({completedCount}/{totalCount})
        </Text>
        {totalCount > 0 && (
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        )}
      </View>

      {totalCount > 0 && (
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: progress === 100 ? '#10b981' : '#3b82f6',
              },
            ]}
          />
        </View>
      )}

      {checklist.map(item => (
        <View key={item.id} style={styles.checklistItem}>
          <TouchableOpacity
            onPress={() => toggleChecklistItem(cardId, item.id)}
            style={styles.checkbox}
          >
            <Text style={styles.checkboxIcon}>
              {item.completed ? '☑' : '☐'}
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.checklistText,
              item.completed && styles.checklistTextCompleted,
            ]}
          >
            {item.text}
          </Text>

          <TouchableOpacity
            onPress={() => deleteChecklistItem(cardId, item.id)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteIcon}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      {isAdding ? (
        <View style={styles.addItemForm}>
          <TextInput
            style={styles.addItemInput}
            value={newItemText}
            onChangeText={setNewItemText}
            placeholder="New checklist item..."
            autoFocus
            onSubmitEditing={handleAddItem}
            blurOnSubmit={false}
          />
          <View style={styles.addItemActions}>
            <TouchableOpacity
              onPress={() => {
                setNewItemText('');
                setIsAdding(false);
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAddItem}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setIsAdding(true)}
          style={styles.addItemButton}
        >
          <Text style={styles.addItemButtonText}>+ Add Item</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  checkbox: {
    padding: 4,
  },
  checkboxIcon: {
    fontSize: 20,
    color: '#3b82f6',
  },
  checklistText: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
  },
  checklistTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 16,
    color: '#94a3b8',
  },
  addItemButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  addItemButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  addItemForm: {
    marginTop: 8,
  },
  addItemInput: {
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  addItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

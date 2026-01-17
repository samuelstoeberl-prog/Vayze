import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useCardStore } from '../../store/cardStore';
import ChecklistSection from './ChecklistSection';
import CommentsSection from './CommentsSection';

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

export default function CardDetail({ visible, card, onClose }) {
  const { updateCard, deleteCard, duplicateCard, categories } = useCardStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(card?.title || '');
  const [editedDescription, setEditedDescription] = useState(card?.description || '');

  if (!card) return null;

  const handleSave = () => {
    if (editedTitle.trim()) {
      updateCard(card.id, {
        title: editedTitle.trim(),
        description: editedDescription.trim(),
      });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCard(card.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleDuplicate = () => {
    duplicateCard(card.id);
    onClose();
  };

  const handleToggleFavorite = () => {
    updateCard(card.id, { isFavorite: !card.isFavorite });
  };

  const handleToggleArchive = () => {
    updateCard(card.id, { isArchived: !card.isArchived });
  };

  const handlePriorityChange = (priority) => {
    updateCard(card.id, { priority });
  };

  const handleTypeChange = (type) => {
    updateCard(card.id, { type });
  };

  const handleCategoryChange = (categoryId) => {
    updateCard(card.id, { category: categoryId });
  };

  const currentPriority = PRIORITY_OPTIONS.find(p => p.value === card.priority);
  const currentType = TYPE_OPTIONS.find(t => t.value === card.type);
  const currentCategory = categories.find(c => c.id === card.category);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleToggleFavorite}
              style={styles.iconButton}
            >
              <Text style={styles.iconButtonText}>
                {card.isFavorite ? '⭐' : '☆'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDuplicate} style={styles.iconButton}>
              <Text style={styles.iconButtonText}>📋</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
              <Text style={styles.iconButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {}
          <View style={styles.section}>
            {isEditing ? (
              <>
                <TextInput
                  style={styles.titleInput}
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  placeholder="Card title..."
                  multiline
                  autoFocus
                />
                <TextInput
                  style={styles.descriptionInput}
                  value={editedDescription}
                  onChangeText={setEditedDescription}
                  placeholder="Add description..."
                  multiline
                  numberOfLines={4}
                />
                <View style={styles.editActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditedTitle(card.title);
                      setEditedDescription(card.description);
                      setIsEditing(false);
                    }}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSave}
                    style={styles.saveButton}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Text style={styles.title}>{card.title}</Text>
                  <Text style={styles.description}>
                    {card.description || 'No description'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Properties</Text>

            {}
            <View style={styles.property}>
              <Text style={styles.propertyLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.propertyOptions}>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.propertyChip,
                        card.category === category.id && {
                          backgroundColor: category.color + '20',
                          borderColor: category.color,
                        },
                      ]}
                      onPress={() => handleCategoryChange(category.id)}
                    >
                      <Text style={styles.propertyChipIcon}>{category.icon}</Text>
                      <Text style={styles.propertyChipText}>{category.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {}
            <View style={styles.property}>
              <Text style={styles.propertyLabel}>Priority</Text>
              <View style={styles.propertyOptions}>
                {PRIORITY_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.propertyChip,
                      card.priority === option.value && {
                        backgroundColor: option.color + '20',
                        borderColor: option.color,
                      },
                    ]}
                    onPress={() => handlePriorityChange(option.value)}
                  >
                    <Text style={styles.propertyChipIcon}>{option.icon}</Text>
                    <Text style={styles.propertyChipText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {}
            <View style={styles.property}>
              <Text style={styles.propertyLabel}>Type</Text>
              <View style={styles.propertyOptions}>
                {TYPE_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.propertyChip,
                      card.type === option.value && styles.propertyChipActive,
                    ]}
                    onPress={() => handleTypeChange(option.value)}
                  >
                    <Text style={styles.propertyChipIcon}>{option.icon}</Text>
                    <Text style={styles.propertyChipText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {}
          <ChecklistSection cardId={card.id} checklist={card.checklist} />

          {}
          <CommentsSection cardId={card.id} comments={card.comments} />

          {}
          <View style={styles.section}>
            <TouchableOpacity
              onPress={handleToggleArchive}
              style={styles.archiveButton}
            >
              <Text style={styles.archiveButtonText}>
                {card.isArchived ? '📦 Unarchive Card' : '📦 Archive Card'}
              </Text>
            </TouchableOpacity>
          </View>

          {}
          <View style={styles.metadata}>
            <Text style={styles.metadataText}>
              Created: {new Date(card.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.metadataText}>
              Updated: {new Date(card.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 24,
    color: '#64748b',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  iconButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 22,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 8,
  },
  descriptionInput: {
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  property: {
    marginBottom: 16,
  },
  propertyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  propertyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  propertyChip: {
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
  propertyChipActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#3b82f6',
  },
  propertyChipIcon: {
    fontSize: 14,
  },
  propertyChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  archiveButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  archiveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  metadata: {
    padding: 16,
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});

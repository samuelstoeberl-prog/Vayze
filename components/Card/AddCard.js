import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useCardStore } from '../../store/cardStore';

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

export default function AddCard({ visible, onClose, defaultCategory = 'backlog' }) {
  const { addCard, categories } = useCardStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [priority, setPriority] = useState('medium');
  const [type, setType] = useState('task');
  const [tags, setTags] = useState('');

  const handleCreate = () => {
    if (title.trim()) {
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      addCard({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        type,
        status: 'todo',
        tags: tagArray,
      });

      setTitle('');
      setDescription('');
      setCategory(defaultCategory);
      setPriority('medium');
      setType('task');
      setTags('');

      onClose();
    }
  };

  const handleClose = () => {
    
    setTitle('');
    setDescription('');
    setCategory(defaultCategory);
    setPriority('medium');
    setType('task');
    setTags('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Card</Text>
          <TouchableOpacity
            onPress={handleCreate}
            style={styles.createButton}
            disabled={!title.trim()}
          >
            <Text
              style={[
                styles.createButtonText,
                !title.trim() && styles.createButtonTextDisabled,
              ]}
            >
              Create
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {}
          <View style={styles.section}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Card title..."
              autoFocus
              multiline
            />
          </View>

          {}
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Add a more detailed description..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {}
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.options}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.optionChip,
                    category === cat.id && {
                      backgroundColor: cat.color + '20',
                      borderColor: cat.color,
                    },
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text style={styles.optionIcon}>{cat.icon}</Text>
                  <Text style={styles.optionText}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {}
          <View style={styles.section}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.options}>
              {PRIORITY_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionChip,
                    priority === option.value && {
                      backgroundColor: option.color + '20',
                      borderColor: option.color,
                    },
                  ]}
                  onPress={() => setPriority(option.value)}
                >
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <Text style={styles.optionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {}
          <View style={styles.section}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.options}>
              {TYPE_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionChip,
                    type === option.value && styles.optionChipActive,
                  ]}
                  onPress={() => setType(option.value)}
                >
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <Text style={styles.optionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {}
          <View style={styles.section}>
            <Text style={styles.label}>Tags</Text>
            <TextInput
              style={styles.tagsInput}
              value={tags}
              onChangeText={setTags}
              placeholder="work, urgent, review (comma-separated)"
            />
            <Text style={styles.hint}>Separate tags with commas</Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  createButton: {
    padding: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b82f6',
  },
  createButtonTextDisabled: {
    color: '#cbd5e1',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingVertical: 8,
  },
  descriptionInput: {
    fontSize: 15,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
  },
  tagsInput: {
    fontSize: 15,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
  },
  hint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
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
  optionChipActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#3b82f6',
  },
  optionIcon: {
    fontSize: 14,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
});

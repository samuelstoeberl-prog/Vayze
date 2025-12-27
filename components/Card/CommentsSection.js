/**
 * Comments Section - Discussion and notes on cards
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useCardStore } from '../../store/cardStore';

export default function CommentsSection({ cardId, comments }) {
  const { addComment } = useCardStore();
  const [newComment, setNewComment] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(cardId, newComment.trim());
      setNewComment('');
      setIsAdding(false);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>
          💬 Comments ({comments.length})
        </Text>
      </View>

      {comments.map(comment => (
        <View key={comment.id} style={styles.comment}>
          <View style={styles.commentHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {comment.author[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.commentMeta}>
              <Text style={styles.commentAuthor}>{comment.author}</Text>
              <Text style={styles.commentDate}>
                {formatCommentDate(comment.createdAt)}
              </Text>
            </View>
          </View>
          <Text style={styles.commentText}>{comment.text}</Text>
        </View>
      ))}

      {comments.length === 0 && !isAdding && (
        <Text style={styles.emptyText}>No comments yet</Text>
      )}

      {isAdding ? (
        <View style={styles.addCommentForm}>
          <TextInput
            style={styles.addCommentInput}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Write a comment..."
            multiline
            numberOfLines={3}
            autoFocus
            textAlignVertical="top"
          />
          <View style={styles.addCommentActions}>
            <TouchableOpacity
              onPress={() => {
                setNewComment('');
                setIsAdding(false);
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAddComment}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>Add Comment</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setIsAdding(true)}
          style={styles.addCommentButton}
        >
          <Text style={styles.addCommentButtonText}>+ Add Comment</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function formatCommentDate(date) {
  const commentDate = new Date(date);
  const now = new Date();
  const diffMs = now - commentDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return commentDate.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
  });
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
  },
  header: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  comment: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  commentMeta: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  commentDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  commentText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 16,
  },
  addCommentButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  addCommentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  addCommentForm: {
    marginTop: 8,
  },
  addCommentInput: {
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    marginBottom: 8,
  },
  addCommentActions: {
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

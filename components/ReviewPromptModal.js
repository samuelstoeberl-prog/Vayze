import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { useDecisionStore } from '../store/decisionStore';

export default function ReviewPromptModal({ visible, decision, onClose }) {
  const addReview = useDecisionStore(state => state.addReview);
  const markAsReminded = useDecisionStore(state => state.markAsReminded);

  const [outcome, setOutcome] = useState(null); 
  const [wouldDecideAgain, setWouldDecideAgain] = useState(null); 
  const [notes, setNotes] = useState('');
  const [learnedLesson, setLearnedLesson] = useState('');
  const [emotionalState, setEmotionalState] = useState(null); 

  if (!decision) return null;

  const handleSubmit = async () => {
    if (outcome === null || wouldDecideAgain === null) {
      Alert.alert('Fehlende Angaben', 'Bitte beantworte beide Hauptfragen.');
      return;
    }

    const reviewData = {
      outcome,
      wouldDecideAgain,
      notes,
      learnedLesson,
      emotionalState
    };

    await addReview(decision.id, reviewData);
    onClose();
    Alert.alert('Review gespeichert', 'Danke für deine Reflexion! 🙏');
  };

  const handleSkip = async () => {
    await markAsReminded(decision.id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            {}
            <View style={styles.header}>
              <Text style={styles.headerIcon}>🔄</Text>
              <Text style={styles.headerTitle}>Review-Zeit!</Text>
              <Text style={styles.headerSubtitle}>
                Vor 7 Tagen hast du entschieden:
              </Text>
            </View>

            {}
            <View style={styles.decisionBox}>
              <Text style={styles.decisionText}>{decision.decision}</Text>
              <View style={styles.decisionMeta}>
                <Text style={styles.decisionMetaText}>
                  Empfehlung: {decision.recommendation === 'yes' ? '✅ JA' : decision.recommendation === 'no' ? '❌ NEIN' : '🤔 UNKLAR'}
                </Text>
                <Text style={styles.decisionMetaText}>
                  Klarheit: {decision.finalScore}%
                </Text>
              </View>
            </View>

            {}
            <View style={styles.questionSection}>
              <Text style={styles.questionTitle}>Wie ist es gelaufen?</Text>
              <View style={styles.optionGroup}>
                <TouchableOpacity
                  style={[
                    styles.outcomeButton,
                    outcome === 'good' && styles.outcomeButtonSelected,
                    { backgroundColor: outcome === 'good' ? '#10b981' : '#1e293b' }
                  ]}
                  onPress={() => setOutcome('good')}
                >
                  <Text style={styles.outcomeIcon}>😊</Text>
                  <Text style={styles.outcomeText}>Gut</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.outcomeButton,
                    outcome === 'neutral' && styles.outcomeButtonSelected,
                    { backgroundColor: outcome === 'neutral' ? '#f59e0b' : '#1e293b' }
                  ]}
                  onPress={() => setOutcome('neutral')}
                >
                  <Text style={styles.outcomeIcon}>😐</Text>
                  <Text style={styles.outcomeText}>Neutral</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.outcomeButton,
                    outcome === 'bad' && styles.outcomeButtonSelected,
                    { backgroundColor: outcome === 'bad' ? '#ef4444' : '#1e293b' }
                  ]}
                  onPress={() => setOutcome('bad')}
                >
                  <Text style={styles.outcomeIcon}>😞</Text>
                  <Text style={styles.outcomeText}>Schlecht</Text>
                </TouchableOpacity>
              </View>
            </View>

            {}
            <View style={styles.questionSection}>
              <Text style={styles.questionTitle}>
                Würdest du es wieder so entscheiden?
              </Text>
              <View style={styles.optionGroup}>
                <TouchableOpacity
                  style={[
                    styles.boolButton,
                    wouldDecideAgain === true && styles.boolButtonSelected
                  ]}
                  onPress={() => setWouldDecideAgain(true)}
                >
                  <Text style={styles.boolIcon}>✓</Text>
                  <Text style={styles.boolText}>Ja, auf jeden Fall</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.boolButton,
                    wouldDecideAgain === false && styles.boolButtonSelected
                  ]}
                  onPress={() => setWouldDecideAgain(false)}
                >
                  <Text style={styles.boolIcon}>✕</Text>
                  <Text style={styles.boolText}>Nein, anders</Text>
                </TouchableOpacity>
              </View>
            </View>

            {}
            <View style={styles.questionSection}>
              <Text style={styles.questionTitle}>Wie fühlst du dich dabei? (optional)</Text>
              <View style={styles.emotionalGroup}>
                {[
                  { id: 'happy', icon: '😄', label: 'Glücklich' },
                  { id: 'neutral', icon: '😐', label: 'Neutral' },
                  { id: 'regret', icon: '😔', label: 'Bereue es' }
                ].map((emotion) => (
                  <TouchableOpacity
                    key={emotion.id}
                    style={[
                      styles.emotionalButton,
                      emotionalState === emotion.id && styles.emotionalButtonSelected
                    ]}
                    onPress={() => setEmotionalState(emotion.id)}
                  >
                    <Text style={styles.emotionalIcon}>{emotion.icon}</Text>
                    <Text style={styles.emotionalLabel}>{emotion.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {}
            <View style={styles.questionSection}>
              <Text style={styles.questionTitle}>Notizen (optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Was ist passiert? Details..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {}
            <View style={styles.questionSection}>
              <Text style={styles.questionTitle}>Was hast du gelernt? (optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Welche Erkenntnis nimmst du mit?"
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={2}
                value={learnedLesson}
                onChangeText={setLearnedLesson}
              />
            </View>

            {}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
              >
                <Text style={styles.skipButtonText}>Überspringen</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Review speichern</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    maxHeight: '90%'
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 12
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8'
  },
  decisionBox: {
    backgroundColor: '#1e293b',
    margin: 20,
    borderRadius: 16,
    padding: 16
  },
  decisionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12
  },
  decisionMeta: {
    flexDirection: 'row',
    gap: 16
  },
  decisionMetaText: {
    fontSize: 14,
    color: '#94a3b8'
  },
  questionSection: {
    paddingHorizontal: 20,
    marginBottom: 24
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12
  },
  optionGroup: {
    flexDirection: 'row',
    gap: 12
  },
  outcomeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  outcomeButtonSelected: {
    borderColor: '#ffffff'
  },
  outcomeIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  outcomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff'
  },
  boolButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  boolButtonSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#1e3a5f'
  },
  boolIcon: {
    fontSize: 24,
    marginRight: 8,
    color: '#ffffff'
  },
  boolText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff'
  },
  emotionalGroup: {
    flexDirection: 'row',
    gap: 12
  },
  emotionalButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  emotionalButtonSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#1e3a5f'
  },
  emotionalIcon: {
    fontSize: 24,
    marginBottom: 4
  },
  emotionalLabel: {
    fontSize: 12,
    color: '#ffffff'
  },
  textInput: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 14,
    textAlignVertical: 'top'
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 0
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#334155',
    alignItems: 'center'
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8'
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center'
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff'
  }
});

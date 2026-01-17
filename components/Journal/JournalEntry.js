import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useJournalStore } from '../../store/journalStore';

// Emotion icon mapping
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

export default function JournalEntry({ decision, onSave, onCancel }) {
  const { addJournal } = useJournalStore();
  const insets = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    decision: decision.decision,
    keyFactor: '',
    emotion: '',
    feeling: '',
    futureMessage: ''
  });

  const reflectionPrompts = [
    {
      step: 1,
      icon: '🎯',
      question: 'Für welche Entscheidung möchtest du reflektieren?',
      subtext: decision.decision,
      field: 'decision',
      readOnly: true
    },
    {
      step: 2,
      icon: '💡',
      question: 'Was war der entscheidende Faktor?',
      placeholder: 'Was hat letztendlich den Ausschlag gegeben?',
      field: 'keyFactor'
    },
    {
      step: 3,
      icon: '❤️',
      question: 'Wie fühlst du dich jetzt gerade?',
      subtext: 'Wähle ein Emoji das dein Gefühl beschreibt',
      field: 'emotion',
      type: 'emoji'
    },
    {
      step: 4,
      icon: '💭',
      question: 'Welches Gefühl überwiegt?',
      placeholder: 'Aufregung? Unsicherheit? Erleichterung?',
      field: 'feeling'
    },
    {
      step: 5,
      icon: '📖',
      question: 'Was würdest du deinem zukünftigen Ich sagen?',
      placeholder: 'Eine Nachricht an dich in 3 Monaten...',
      field: 'futureMessage',
      multiline: true
    }
  ];

  const currentPrompt = reflectionPrompts.find(p => p.step === currentStep);
  const progress = (currentStep / reflectionPrompts.length) * 100;

  const emotions = Object.keys(emotionIcons);

  const handleNext = () => {
    if (currentStep < reflectionPrompts.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSaveJournal();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveJournal = async () => {
    try {
      const journalData = {
        decisionId: decision.id,
        decisiveFactor: answers.keyFactor,
        emotionalState: answers.feeling,
        messageToFuture: answers.futureMessage,
        emotion: answers.emotion,
        entryDate: new Date().toISOString()
      };

      await addJournal(journalData, false); // false = not premium
      onSave(journalData);
    } catch (error) {
      console.error('Error saving journal:', error);
      alert('Fehler beim Speichern des Journals');
    }
  };

  const isCurrentStepValid = () => {
    if (currentPrompt.readOnly) return true;
    if (currentPrompt.type === 'emoji') {
      return answers[currentPrompt.field]?.length > 0;
    }
    return answers[currentPrompt.field]?.trim().length > 0;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Neuer Eintrag</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            Schritt {currentStep} von {reflectionPrompts.length}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Icon */}
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <Text style={styles.icon}>{currentPrompt.icon}</Text>
          </LinearGradient>

          {/* Question */}
          <Text style={styles.question}>{currentPrompt.question}</Text>
          {currentPrompt.subtext && !currentPrompt.readOnly && (
            <Text style={styles.subtext}>{currentPrompt.subtext}</Text>
          )}
          {currentPrompt.readOnly && (
            <View style={styles.decisionCard}>
              <Text style={styles.decisionText}>{currentPrompt.subtext}</Text>
            </View>
          )}

          {/* Input Field */}
          {!currentPrompt.readOnly && (
            <>
              {currentPrompt.type === 'emoji' ? (
                <View style={styles.emojiGrid}>
                  {emotions.map((emotionKey) => {
                    const emotion = emotionIcons[emotionKey];
                    const isSelected = answers.emotion === emotionKey;
                    return (
                      <TouchableOpacity
                        key={emotionKey}
                        onPress={() => setAnswers({ ...answers, emotion: emotionKey })}
                        style={[
                          styles.emojiButton,
                          isSelected && {
                            backgroundColor: emotion.bg,
                            borderColor: emotion.color
                          }
                        ]}
                      >
                        <Feather
                          name={emotion.icon}
                          size={32}
                          color={isSelected ? emotion.color : '#64748b'}
                        />
                        <Text style={[
                          styles.emotionLabel,
                          isSelected && { color: emotion.color }
                        ]}>
                          {emotion.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : currentPrompt.multiline ? (
                <TextInput
                  value={answers[currentPrompt.field]}
                  onChangeText={(text) => setAnswers({ ...answers, [currentPrompt.field]: text })}
                  placeholder={currentPrompt.placeholder}
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={6}
                  style={styles.textAreaInput}
                  textAlignVertical="top"
                />
              ) : (
                <TextInput
                  value={answers[currentPrompt.field]}
                  onChangeText={(text) => setAnswers({ ...answers, [currentPrompt.field]: text })}
                  placeholder={currentPrompt.placeholder}
                  placeholderTextColor="#94a3b8"
                  style={styles.textInput}
                />
              )}
            </>
          )}

          {/* Media Attachments (only on last step) */}
          {currentStep === reflectionPrompts.length && (
            <View style={styles.mediaSection}>
              <Text style={styles.mediaSectionTitle}>Optional anhängen:</Text>

              <TouchableOpacity style={styles.mediaButton}>
                <Text style={styles.mediaButtonIcon}>📷</Text>
                <Text style={styles.mediaButtonText}>Foto hinzufügen</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mediaButton}>
                <Text style={styles.mediaButtonIcon}>🎤</Text>
                <Text style={styles.mediaButtonText}>Voice Memo aufnehmen</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            {currentStep > 1 && (
              <TouchableOpacity
                onPress={handleBack}
                style={[styles.button, styles.backButton]}
              >
                <Text style={styles.backButtonText}>Zurück</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleNext}
              disabled={!isCurrentStepValid()}
              style={[
                styles.button,
                styles.nextButton,
                currentStep === 1 && { flex: 1 },
                !isCurrentStepValid() && styles.buttonDisabled
              ]}
            >
              <LinearGradient
                colors={isCurrentStepValid() ? ['#6366f1', '#8b5cf6'] : ['#cbd5e1', '#cbd5e1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === reflectionPrompts.length ? 'Eintrag speichern' : 'Weiter'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    // paddingTop wird dynamisch gesetzt
    paddingBottom: 16,
    paddingHorizontal: 24
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  closeButton: {
    fontSize: 24,
    color: '#64748b'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  progressContainer: {
    gap: 8
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center'
  },
  content: {
    flex: 1
  },
  contentContainer: {
    padding: 32,
    alignItems: 'center'
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24
  },
  icon: {
    fontSize: 32
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 16
  },
  subtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32
  },
  decisionCard: {
    width: '100%',
    backgroundColor: '#eef2ff',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#c7d2fe'
  },
  decisionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366f1',
    textAlign: 'center'
  },
  emojiGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24
  },
  emojiButton: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  emotionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center'
  },
  textInput: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1e293b',
    marginTop: 24
  },
  textAreaInput: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1e293b',
    marginTop: 24,
    minHeight: 150
  },
  mediaSection: {
    width: '100%',
    marginTop: 24,
    gap: 12
  },
  mediaSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8
  },
  mediaButton: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12
  },
  mediaButtonIcon: {
    fontSize: 20
  },
  mediaButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#475569'
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden'
  },
  backButton: {
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569'
  },
  nextButton: {
    flex: 1
  },
  nextButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff'
  },
  buttonDisabled: {
    opacity: 0.5
  }
});

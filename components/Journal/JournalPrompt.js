import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated
} from 'react-native';
import { useJournalStore } from '../../store/journalStore';
import JournalEntry from './JournalEntry';

export default function JournalPrompt({ decision, visible, onClose, onComplete }) {
  const [showFullEntry, setShowFullEntry] = useState(false);
  const { canCreateEntry, addJournal } = useJournalStore();

  const tierCheck = canCreateEntry(false); // Assume FREE tier

  const handleStartJournal = () => {
    if (!tierCheck.allowed) {
      // Show upgrade prompt
      alert(`FREE Limit erreicht: ${tierCheck.entriesThisMonth}/${tierCheck.limit} Einträge diesen Monat.\n\nUpgrade zu PREMIUM für unbegrenzte Journal-Einträge!`);
      onClose();
      return;
    }

    setShowFullEntry(true);
  };

  const handleSaveJournal = async (journalData) => {
    const saved = await addJournal(journalData, false);

    if (saved) {
      setShowFullEntry(false);
      onComplete && onComplete(saved);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      transparent={true}
      onRequestClose={onClose}
    >
      {!showFullEntry ? (
        <View style={styles.overlay}>
          <View style={styles.promptContainer}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📓</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Halte deine Gedanken fest</Text>
            <Text style={styles.subtitle}>
              Nutze das Reflection Journal, um deine Entscheidung zu dokumentieren
            </Text>

            {/* Benefits */}
            <View style={styles.benefits}>
              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>🎯</Text>
                <Text style={styles.benefitText}>
                  Reflektiere über die entscheidenden Faktoren
                </Text>
              </View>

              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>💭</Text>
                <Text style={styles.benefitText}>
                  Dokumentiere deine Gefühle im Moment
                </Text>
              </View>

              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>💌</Text>
                <Text style={styles.benefitText}>
                  Schreibe eine Nachricht an dein zukünftiges Ich
                </Text>
              </View>

              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>🔥</Text>
                <Text style={styles.benefitText}>
                  Baue deinen Reflection-Streak auf
                </Text>
              </View>
            </View>

            {/* Free Tier Info */}
            {!tierCheck.allowed ? (
              <View style={styles.limitBox}>
                <Text style={styles.limitText}>
                  ⚠️ FREE Limit erreicht: {tierCheck.entriesThisMonth}/{tierCheck.limit} Einträge diesen Monat
                </Text>
                <Text style={styles.limitSubtext}>
                  Upgrade zu PREMIUM für unbegrenzte Einträge
                </Text>
              </View>
            ) : (
              <View style={styles.remainingBox}>
                <Text style={styles.remainingText}>
                  {tierCheck.remaining} von {tierCheck.limit} FREE Einträgen übrig diesen Monat
                </Text>
              </View>
            )}

            {/* Buttons */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                !tierCheck.allowed && styles.buttonDisabled
              ]}
              onPress={handleStartJournal}
              disabled={!tierCheck.allowed}
            >
              <Text style={styles.primaryButtonText}>
                {!tierCheck.allowed ? '🔒 Upgrade zu PREMIUM' : 'Journal starten'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSkip}
            >
              <Text style={styles.secondaryButtonText}>Jetzt nicht</Text>
            </TouchableOpacity>

            <Text style={styles.hint}>
              💡 Du kannst später jederzeit ein Journal hinzufügen
            </Text>
          </View>
        </View>
      ) : (
        <JournalEntry
          decision={decision}
          onSave={handleSaveJournal}
          onCancel={() => {
            setShowFullEntry(false);
            onClose();
          }}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  promptContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%'
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#f3f4f6',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20
  },
  icon: {
    fontSize: 48
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24
  },
  benefits: {
    marginBottom: 20
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 32
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 20
  },
  limitBox: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  limitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 4
  },
  limitSubtext: {
    fontSize: 12,
    color: '#dc2626'
  },
  remainingBox: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0'
  },
  remainingText: {
    fontSize: 13,
    color: '#15803d',
    textAlign: 'center'
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12
  },
  secondaryButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500'
  },
  buttonDisabled: {
    opacity: 0.5
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center'
  }
});

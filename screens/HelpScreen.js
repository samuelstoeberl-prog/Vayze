import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function HelpScreen() {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const faqs = [
    {
      question: 'Wie funktioniert die Entscheidungsanalyse?',
      answer: 'Die App führt dich durch eine Reihe durchdachter Fragen, die dir helfen, deine Entscheidung aus verschiedenen Perspektiven zu betrachten. Am Ende erhältst du eine fundierte Empfehlung basierend auf deinen Antworten.',
    },
    {
      question: 'Was ist der Unterschied zwischen Vollständig und Schnell?',
      answer: 'Der vollständige Modus führt dich durch 6 detaillierte Schritte für wichtige Entscheidungen. Der Schnellmodus bietet 2 fokussierte Fragen für alltägliche Entscheidungen. Beide Methoden helfen dir, Klarheit zu gewinnen.',
    },
    {
      question: 'Sind meine Daten sicher?',
      answer: 'Ja, deine Privatsphäre ist uns wichtig. Alle deine Entscheidungen und Notizen werden lokal auf deinem Gerät gespeichert. Nur deine Account-Daten (E-Mail) werden verschlüsselt in der Cloud gespeichert.',
    },
    {
      question: 'Kann ich meine Entscheidungen später wieder ansehen?',
      answer: 'Natürlich! Alle abgeschlossenen Entscheidungen werden im Board gespeichert. Du kannst sie jederzeit öffnen, bearbeiten oder als Favoriten markieren. So behältst du den Überblick über deine wichtigsten Entscheidungen.',
    },
    {
      question: 'Was passiert, wenn ich eine Analyse abbreche?',
      answer: 'Keine Sorge, dein Fortschritt wird automatisch gespeichert. Beim nächsten Start der App kannst du entscheiden, ob du die Analyse fortsetzen oder neu beginnen möchtest. Nichts geht verloren.',
    },
  ];

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>💡</Text>
          <Text style={styles.headerTitle}>Hilfe & Häufige Fragen</Text>
          <Text style={styles.headerSubtitle}>
            Hier findest du Antworten auf die wichtigsten Fragen
          </Text>
        </View>

        {}
        <View style={styles.faqList}>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqCard}>
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleExpand(index)}
                accessibilityLabel={faq.question}
                accessibilityRole="button"
                accessibilityState={{ expanded: expandedIndex === index }}
                accessibilityHint={expandedIndex === index ? 'Antwort ausblenden' : 'Antwort anzeigen'}
              >
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Text style={styles.faqIcon}>
                  {expandedIndex === index ? '−' : '+'}
                </Text>
              </TouchableOpacity>

              {expandedIndex === index && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {}
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Weitere Fragen?</Text>
          <Text style={styles.supportText}>
            Wenn du weitere Unterstützung brauchst, sind wir für dich da.
            Schreib uns einfach eine E-Mail.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  faqList: {
    gap: 12,
    marginBottom: 32,
  },
  faqCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    gap: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
    lineHeight: 22,
  },
  faqIcon: {
    fontSize: 24,
    fontWeight: '300',
    color: '#3b82f6',
    width: 24,
    textAlign: 'center',
  },
  faqAnswer: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 21,
  },
  supportSection: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
});

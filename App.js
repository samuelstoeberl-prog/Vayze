import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [decision, setDecision] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [allAnswers, setAllAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Load from AsyncStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('decisionData');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.decision && data.decision.trim().length >= 10) {
          Alert.alert(
            'Fortsetzen?',
            'Möchtest du deine letzte Analyse fortsetzen?',
            [
              { text: 'Nein', style: 'cancel' },
              {
                text: 'Ja',
                onPress: () => {
                  setDecision(data.decision || '');
                  setAllAnswers(data.answers || {});
                  setCurrentStep(data.step || 0);
                  setShowResults(data.showResults || false);
                  setHasStarted(true);
                },
              },
            ]
          );
        }
      }
    } catch (e) {
      console.error('Error loading data:', e);
    }
  };

  // Save to AsyncStorage whenever state changes
  useEffect(() => {
    if (decision.trim().length >= 10) {
      saveData();
    }
  }, [decision, allAnswers, currentStep, showResults]);

  const saveData = async () => {
    try {
      await AsyncStorage.setItem(
        'decisionData',
        JSON.stringify({
          decision,
          answers: allAnswers,
          step: currentStep,
          showResults,
        })
      );
    } catch (e) {
      console.error('Error saving data:', e);
    }
  };

  const steps = [
    {
      title: 'Deine erste Intuition',
      question: 'Was ist dein spontanes Bauchgefühl?',
      options: ['Stark dafür', 'Eher dafür', 'Neutral', 'Eher dagegen', 'Stark dagegen'],
      insight: 'Deine erste Intuition ist oft wertvoll, kann aber durch Emotionen verzerrt sein.',
      weight: 2,
    },
    {
      title: 'Was steht auf dem Spiel?',
      question: 'Was könntest du verlieren? (Geld, Zeit, Beziehungen, Gesundheit, etc.)',
      type: 'text',
      minLength: 5,
      insight: 'Wichtig ist zu verstehen, welches echte Risiko du trägst und was im schlimmsten Fall passieren könnte.',
      followUp: 'Wie hoch schätzt du das Risiko ein?',
      followUpOptions: ['Sehr niedrig - kaum Verlust', 'Niedrig - überschaubar', 'Mittel - spürbar', 'Hoch - schmerzhaft', 'Sehr hoch - existenziell'],
      weight: 4,
    },
    {
      title: 'Kannst du zurück?',
      question: 'Wie leicht kannst du diese Entscheidung rückgängig machen?',
      type: 'text',
      minLength: 5,
      insight: 'Entscheidungen, die sich leicht umkehren lassen, können schneller getroffen werden.',
      followUp: 'Wie reversibel ist die Entscheidung?',
      followUpOptions: ['Vollständig reversibel', 'Größtenteils reversibel', 'Teilweise reversibel', 'Kaum reversibel', 'Irreversibel'],
      weight: 4,
    },
    {
      title: 'Zeitperspektive',
      question: 'Wie wirst du über diese Entscheidung denken?',
      type: 'multitext',
      fields: [
        { key: '10min', label: 'In 10 Minuten', placeholder: 'Direkt nach der Entscheidung?', minLength: 5 },
        { key: '10months', label: 'In 10 Monaten', placeholder: 'Mittelfristige Auswirkungen?', minLength: 5 },
        { key: '10years', label: 'In 10 Jahren', placeholder: 'Langfristige Auswirkungen?', minLength: 5 },
      ],
      insight: 'Diese Perspektive hilft, kurzfristige Emotionen von langfristigen Konsequenzen zu trennen.',
      followUp: 'Überwiegt der langfristige Nutzen?',
      followUpOptions: ['Ja, eindeutig', 'Eher ja', 'Unentschieden', 'Eher nein', 'Nein, eindeutig nicht'],
      weight: 4,
    },
    {
      title: 'Äußere Einflüsse',
      question: 'Gibt es Zahlen, Preise oder Meinungen, die deine Sicht stark beeinflussen?',
      type: 'text',
      minLength: 5,
      insight: 'Wir werden oft unbewusst von Informationen beeinflusst, die wir zuerst gehört haben.',
      followUp: 'Könntest du objektiver entscheiden, wenn du diese Einflüsse ignorierst?',
      followUpOptions: ['Ja, definitiv', 'Wahrscheinlich ja', 'Unsicher', 'Wahrscheinlich nein', 'Nein, ist zentral'],
      weight: 2,
    },
    {
      title: 'Der Rat an einen Freund',
      question: 'Was würdest du einem guten Freund in der gleichen Situation raten?',
      type: 'text',
      minLength: 5,
      insight: 'Wenn wir anderen raten, sind wir oft objektiver und weniger emotional.',
      followUp: 'Was würdest du dem Freund raten?',
      followUpOptions: ['Klar dafür', 'Eher dafür', 'Abwarten/mehr Info', 'Eher dagegen', 'Klar dagegen'],
      weight: 6,
    },
  ];

  const updateAnswer = (key, value) => {
    setAllAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleOptionClick = (option) => {
    updateAnswer(`step${currentStep}_rating`, option);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateDecision = () => {
    let score = 0;
    let maxScore = 0;
    const breakdown = [];

    const intuition = allAnswers.step0_rating;
    let intuitionScore = 0;
    if (intuition === 'Stark dafür') intuitionScore = 2;
    else if (intuition === 'Eher dafür') intuitionScore = 1;
    else if (intuition === 'Eher dagegen') intuitionScore = -1;
    else if (intuition === 'Stark dagegen') intuitionScore = -2;
    score += intuitionScore;
    maxScore += 2;
    breakdown.push({ name: 'Intuition', score: intuitionScore, max: 2, weight: steps[0].weight });

    const risk = allAnswers.step1_rating;
    let riskScore = 0;
    if (risk === 'Sehr niedrig - kaum Verlust') riskScore = 4;
    else if (risk === 'Niedrig - überschaubar') riskScore = 2;
    else if (risk === 'Mittel - spürbar') riskScore = 0;
    else if (risk === 'Hoch - schmerzhaft') riskScore = -2;
    else if (risk === 'Sehr hoch - existenziell') riskScore = -4;
    score += riskScore;
    maxScore += 4;
    breakdown.push({ name: 'Risiko', score: riskScore, max: 4, weight: steps[1].weight });

    const reversible = allAnswers.step2_rating;
    let revScore = 0;
    if (reversible === 'Vollständig reversibel') revScore = 4;
    else if (reversible === 'Größtenteils reversibel') revScore = 3;
    else if (reversible === 'Teilweise reversibel') revScore = 1;
    else if (reversible === 'Kaum reversibel') revScore = -1;
    else if (reversible === 'Irreversibel') revScore = -2;
    score += revScore;
    maxScore += 4;
    breakdown.push({ name: 'Reversibilität', score: revScore, max: 4, weight: steps[2].weight });

    const longterm = allAnswers.step3_rating;
    let ltScore = 0;
    if (longterm === 'Ja, eindeutig') ltScore = 4;
    else if (longterm === 'Eher ja') ltScore = 2;
    else if (longterm === 'Unentschieden') ltScore = 0;
    else if (longterm === 'Eher nein') ltScore = -2;
    else if (longterm === 'Nein, eindeutig nicht') ltScore = -4;
    score += ltScore;
    maxScore += 4;
    breakdown.push({ name: 'Langfristig', score: ltScore, max: 4, weight: steps[3].weight });

    const anchor = allAnswers.step4_rating;
    let anchorScore = 0;
    if (anchor === 'Ja, definitiv') anchorScore = 2;
    else if (anchor === 'Wahrscheinlich ja') anchorScore = 1;
    else if (anchor === 'Unsicher') anchorScore = 0;
    else if (anchor === 'Wahrscheinlich nein') anchorScore = -1;
    else if (anchor === 'Nein, ist zentral') anchorScore = -2;
    score += anchorScore;
    maxScore += 2;
    breakdown.push({ name: 'Anker-Freiheit', score: anchorScore, max: 2, weight: steps[4].weight });

    const outside = allAnswers.step5_rating;
    let outScore = 0;
    if (outside === 'Klar dafür') outScore = 6;
    else if (outside === 'Eher dafür') outScore = 3;
    else if (outside === 'Abwarten/mehr Info') outScore = 0;
    else if (outside === 'Eher dagegen') outScore = -3;
    else if (outside === 'Klar dagegen') outScore = -6;
    score += outScore;
    maxScore += 6;
    breakdown.push({ name: 'Außenperspektive', score: outScore, max: 6, weight: steps[5].weight });

    const percentage = ((score + maxScore) / (2 * maxScore)) * 100;

    return {
      score,
      maxScore,
      percentage: Math.round(percentage),
      recommendation: percentage >= 55 ? 'JA' : percentage <= 45 ? 'NEIN' : 'UNENTSCHIEDEN',
      breakdown,
    };
  };

  const reset = async () => {
    setDecision('');
    setCurrentStep(0);
    setAllAnswers({});
    setShowResults(false);
    setShowBreakdown(false);
    setHasStarted(false);
    await AsyncStorage.removeItem('decisionData');
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
    setShowResults(false);
  };

  if (!hasStarted) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.mainTitle}>🧠 Entscheidungs-Assistent Pro</Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Systematische Entscheidungsfindung</Text>
              <Text style={styles.infoText}>
                Diese App führt dich durch 6 wissenschaftlich fundierte Schritte, um bessere Entscheidungen zu treffen.
              </Text>
            </View>

            <Text style={styles.label}>Beschreibe deine Entscheidung kurz:</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              placeholder="z.B. Soll ich ein neues Auto kaufen?"
              value={decision}
              onChangeText={(text) => text.length <= 500 && setDecision(text)}
              maxLength={500}
            />
            <View style={styles.charCount}>
              <Text style={decision.trim().length >= 10 ? styles.validText : styles.invalidText}>
                {decision.trim().length >= 10 ? '✓ Ausreichend' : `Noch ${10 - decision.trim().length} Zeichen benötigt`}
              </Text>
              <Text style={styles.charCountText}>{decision.length}/500</Text>
            </View>

            <TouchableOpacity
              style={[styles.button, decision.trim().length < 10 && styles.buttonDisabled]}
              onPress={() => decision.trim().length >= 10 && setHasStarted(true)}
              disabled={decision.trim().length < 10}
            >
              <Text style={styles.buttonText}>
                {decision.trim().length < 10 ? `Noch ${10 - decision.trim().length} Zeichen` : 'Analyse starten'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (showResults) {
    const result = calculateDecision();
    const resultColor = result.recommendation === 'JA' ? '#10b981' : result.recommendation === 'NEIN' ? '#ef4444' : '#f59e0b';

    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.mainTitle}>✓ Deine Analyse</Text>
            </View>

            <View style={styles.decisionBox}>
              <Text style={styles.decisionLabel}>Entscheidung:</Text>
              <Text style={styles.decisionText}>{decision}</Text>
            </View>

            <View style={[styles.resultBox, { backgroundColor: resultColor }]}>
              <Text style={styles.resultIcon}>
                {result.recommendation === 'JA' ? '👍' : result.recommendation === 'NEIN' ? '👎' : '⚠️'}
              </Text>
              <Text style={styles.resultTitle}>{result.recommendation}</Text>
              <Text style={styles.resultPercentage}>Konfidenz: {result.percentage}%</Text>
              <Text style={styles.resultDescription}>
                {result.recommendation === 'JA'
                  ? 'Die Analyse spricht dafür, diese Entscheidung zu treffen.'
                  : result.recommendation === 'NEIN'
                  ? 'Die Analyse rät von dieser Entscheidung ab.'
                  : 'Die Analyse ist nicht eindeutig. Sammle mehr Informationen.'}
              </Text>
            </View>

            <TouchableOpacity style={styles.breakdownButton} onPress={() => setShowBreakdown(!showBreakdown)}>
              <Text style={styles.breakdownButtonText}>{showBreakdown ? '📊 Breakdown ausblenden' : '📊 Breakdown anzeigen'}</Text>
            </TouchableOpacity>

            {showBreakdown && (
              <View style={styles.breakdownBox}>
                <Text style={styles.breakdownTitle}>Detaillierte Punkteverteilung</Text>
                {result.breakdown.map((item, idx) => {
                  const percentage = ((item.score + item.max) / (2 * item.max)) * 100;
                  const barColor = percentage >= 60 ? '#10b981' : percentage >= 40 ? '#f59e0b' : '#ef4444';
                  return (
                    <View key={idx} style={styles.breakdownItem}>
                      <View style={styles.breakdownHeader}>
                        <Text style={styles.breakdownName}>{item.name}</Text>
                        <Text style={styles.breakdownScore}>
                          {item.score}/{item.max}
                        </Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: barColor }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {steps.map((step, idx) => (
              <View key={idx} style={styles.stepSummary}>
                <View style={styles.stepSummaryHeader}>
                  <Text style={styles.stepSummaryTitle}>{step.title}</Text>
                  <TouchableOpacity onPress={() => goToStep(idx)}>
                    <Text style={styles.editButton}>✏️</Text>
                  </TouchableOpacity>
                </View>
                {step.type === 'multitext' &&
                  step.fields &&
                  step.fields.map((field) => {
                    const fieldValue = allAnswers[`step${idx}_${field.key}`];
                    return fieldValue ? (
                      <View key={field.key} style={styles.multitextField}>
                        <Text style={styles.fieldLabel}>{field.label}</Text>
                        <Text style={styles.fieldValue}>{fieldValue}</Text>
                      </View>
                    ) : null;
                  })}
                {allAnswers[`step${idx}_text`] && <Text style={styles.stepAnswer}>{allAnswers[`step${idx}_text`]}</Text>}
                {allAnswers[`step${idx}_rating`] && <Text style={styles.stepRating}>→ {allAnswers[`step${idx}_rating`]}</Text>}
              </View>
            ))}

            <TouchableOpacity style={styles.resetButton} onPress={reset}>
              <Text style={styles.buttonText}>Neue Entscheidung analysieren</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  const step = steps[currentStep];
  const textKey = `step${currentStep}_text`;
  const currentTextValue = allAnswers[textKey] || '';

  let hasText = false;
  if (step.type === 'multitext') {
    hasText = step.fields.every((field) => {
      const fieldValue = allAnswers[`step${currentStep}_${field.key}`] || '';
      return fieldValue.trim().length >= field.minLength;
    });
  } else if (step.type === 'text') {
    hasText = currentTextValue.trim().length >= (step.minLength || 0);
  } else {
    hasText = true;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.progressHeader}>
            <Text style={styles.stepCounter}>
              Schritt {currentStep + 1} von {steps.length}
            </Text>
            <View style={styles.progressDots}>
              {steps.map((_, idx) => (
                <View key={idx} style={[styles.dot, idx <= currentStep && styles.dotActive]} />
              ))}
            </View>
          </View>

          <View style={styles.decisionBox}>
            <Text style={styles.decisionText}>{decision}</Text>
          </View>

          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepQuestion}>{step.question}</Text>

          <View style={styles.insightBox}>
            <Text style={styles.insightText}>{step.insight}</Text>
          </View>

          {step.type === 'multitext' ? (
            <View>
              {step.fields.map((field) => {
                const fieldKey = `step${currentStep}_${field.key}`;
                const fieldValue = allAnswers[fieldKey] || '';
                const isValid = fieldValue.trim().length >= field.minLength;
                return (
                  <View key={field.key} style={styles.multitextContainer}>
                    <Text style={styles.fieldLabel}>
                      {field.label} {isValid && '✓'}
                    </Text>
                    <TextInput
                      style={styles.textArea}
                      multiline
                      numberOfLines={3}
                      placeholder={field.placeholder}
                      value={fieldValue}
                      onChangeText={(text) => updateAnswer(fieldKey, text)}
                    />
                    <Text style={styles.charInfo}>
                      {fieldValue.length} Zeichen {!isValid && `(min. ${field.minLength})`}
                    </Text>
                  </View>
                );
              })}
              {hasText && step.followUp && (
                <View style={styles.followUpBox}>
                  <Text style={styles.followUpQuestion}>{step.followUp}</Text>
                  {step.followUpOptions.map((option) => (
                    <TouchableOpacity key={option} style={styles.optionButton} onPress={() => handleOptionClick(option)}>
                      <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : step.type === 'text' ? (
            <View>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={6}
                placeholder="Schreibe hier deine Gedanken... (Minimum 5 Zeichen)"
                value={currentTextValue}
                onChangeText={(text) => updateAnswer(textKey, text)}
              />
              <Text style={hasText ? styles.validText : styles.invalidText}>
                {currentTextValue.length} Zeichen {hasText ? '✓' : `(min. ${step.minLength})`}
              </Text>
              {hasText && step.followUp && (
                <View style={styles.followUpBox}>
                  <Text style={styles.followUpQuestion}>{step.followUp}</Text>
                  {step.followUpOptions.map((option) => (
                    <TouchableOpacity key={option} style={styles.optionButton} onPress={() => handleOptionClick(option)}>
                      <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View>
              {step.options.map((option) => (
                <TouchableOpacity key={option} style={styles.optionButton} onPress={() => handleOptionClick(option)}>
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={() => setCurrentStep(currentStep - 1)}>
              <Text style={styles.backButtonText}>← Zurück</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: '#e0e7ff',
    borderLeftWidth: 4,
    borderLeftColor: '#4f46e5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  validText: {
    color: '#10b981',
    fontWeight: '600',
  },
  invalidText: {
    color: '#6b7280',
  },
  charCountText: {
    color: '#9ca3af',
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  progressHeader: {
    marginBottom: 16,
  },
  stepCounter: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '600',
    marginBottom: 8,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    height: 8,
    flex: 1,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#4f46e5',
  },
  decisionBox: {
    backgroundColor: '#e0e7ff',
    borderLeftWidth: 4,
    borderLeftColor: '#4f46e5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  decisionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  decisionText: {
    fontSize: 14,
    color: '#374151',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  stepQuestion: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
  },
  insightBox: {
    backgroundColor: '#dbeafe',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  insightText: {
    fontSize: 14,
    color: '#374151',
  },
  optionButton: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#4b5563',
    fontSize: 16,
  },
  followUpBox: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  followUpQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  multitextContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  charInfo: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultBox: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  resultIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  resultPercentage: {
    fontSize: 20,
    color: 'white',
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  breakdownButton: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  breakdownButtonText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '600',
  },
  breakdownBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  breakdownItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  breakdownScore: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  stepSummary: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  stepSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  editButton: {
    fontSize: 18,
  },
  stepAnswer: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  stepRating: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '600',
  },
  multitextField: {
    borderLeftWidth: 2,
    borderLeftColor: '#a78bfa',
    paddingLeft: 12,
    marginBottom: 12,
  },
  fieldValue: {
    fontSize: 14,
    color: '#374151',
  },
  resetButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
});
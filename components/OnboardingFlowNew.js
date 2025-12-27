/**
 * Onboarding Flow - Premium 6-Screen Experience
 * Visuell identisch zur Web-Version, konvertiert für React Native
 *
 * Screens:
 * 1. Mirror - "They get me"
 * 2. Transformation - "This could help me"
 * 3. Proof - "I can trust this"
 * 4. Identity - "I want to be that person"
 * 5. Gateway - Account Creation
 * 6. Personalization - Survey (3 questions)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OnboardingFlowNew = ({ onComplete }) => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [surveyData, setSurveyData] = useState({
    context: null,
    style: null,
    outcome: null,
  });
  const [accountData, setAccountData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [surveyQuestion, setSurveyQuestion] = useState(0);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Animate in when screen changes
    fadeAnim.setValue(0);
    slideAnim.setValue(20);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentScreen, surveyQuestion]);

  const handleNext = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Screen 0, 1, 2: Normal progression
      if (currentScreen < 3) {
        setCurrentScreen(currentScreen + 1);
      }
      // Screen 3 (Identity): Jump directly to Survey (skip Gateway at index 4)
      else if (currentScreen === 3) {
        setCurrentScreen(5); // Jump to survey
      }
    });
  };

  const handleAccountCreate = () => {
    // Skip validation - just move to next screen
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentScreen(5); // Survey screen
    });
  };

  const handleSurveySelect = (field, value) => {
    setSurveyData({ ...surveyData, [field]: value });

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        if (surveyQuestion < 2) {
          setSurveyQuestion(surveyQuestion + 1);
        }
      });
    }, 400);
  };

  const completeSurvey = () => {
    if (surveyData.context && surveyData.style && surveyData.outcome) {
      // Just pass survey data - no account creation
      onComplete({
        survey: surveyData,
      });
    }
  };

  const screens = [
    <Screen1Mirror animate={fadeAnim} slideAnim={slideAnim} onNext={handleNext} />,
    <Screen2Transformation animate={fadeAnim} slideAnim={slideAnim} onNext={handleNext} />,
    <Screen3Proof animate={fadeAnim} slideAnim={slideAnim} onNext={handleNext} />,
    <Screen4Identity animate={fadeAnim} slideAnim={slideAnim} onNext={handleNext} />,
    <Screen5Gateway
      animate={fadeAnim}
      slideAnim={slideAnim}
      accountData={accountData}
      setAccountData={setAccountData}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      onSubmit={handleAccountCreate}
    />,
    <Screen6Personalization
      animate={fadeAnim}
      slideAnim={slideAnim}
      surveyData={surveyData}
      currentQuestion={surveyQuestion}
      onSelect={handleSurveySelect}
      onComplete={completeSurvey}
    />,
  ];

  return (
    <LinearGradient
      colors={['#3B82F6', '#2563EB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        {screens[currentScreen]}

        {/* Progress Dots - Only show for first 4 screens */}
        {currentScreen < 5 && (
          <View style={styles.progressContainer}>
            {[0, 1, 2, 3].map((dot) => (
              <View
                key={dot}
                style={[
                  styles.progressDot,
                  dot === currentScreen ? styles.progressDotActive : styles.progressDotInactive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

// Screen 1: The Mirror - "They get me"
const Screen1Mirror = ({ animate, slideAnim, onNext }) => {
  return (
    <Animated.View
      style={[
        {
          opacity: animate,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.screenCard}
      >
        {/* Hero Illustration */}
        <View style={styles.illustrationContainer}>
          <Svg width={200} height={200} viewBox="0 0 200 200">
            {/* Person at crossroads with fog */}
            <Circle cx="100" cy="60" r="20" fill="white" opacity="0.9" />
            <Line x1="100" y1="80" x2="100" y2="130" stroke="white" strokeWidth="3" opacity="0.9" />
            <Line x1="100" y1="95" x2="80" y2="110" stroke="white" strokeWidth="3" opacity="0.9" />
            <Line x1="100" y1="95" x2="120" y2="110" stroke="white" strokeWidth="3" opacity="0.9" />
            <Line x1="100" y1="130" x2="85" y2="155" stroke="white" strokeWidth="3" opacity="0.9" />
            <Line x1="100" y1="130" x2="115" y2="155" stroke="white" strokeWidth="3" opacity="0.9" />

            {/* Foggy paths */}
            <Path d="M 100 140 Q 60 160 40 180" stroke="white" strokeWidth="2" fill="none" opacity="0.3" strokeDasharray="5,5" />
            <Path d="M 100 140 Q 140 160 160 180" stroke="white" strokeWidth="2" fill="none" opacity="0.3" strokeDasharray="5,5" />

            {/* Fog circles */}
            <Circle cx="40" cy="170" r="15" fill="white" opacity="0.15" />
            <Circle cx="160" cy="170" r="15" fill="white" opacity="0.15" />
          </Svg>
        </View>

        {/* Content */}
        <View style={styles.contentCenter}>
          <Text style={styles.screen1Title}>
            Du bist nicht schlecht{'\n'}in Entscheidungen.
          </Text>

          <Text style={styles.screen1Subtitle}>
            Du machst dir nur tiefe Gedanken darüber, die richtige zu treffen.
          </Text>

          <View style={{ paddingTop: 8 }}>
            <Text style={styles.screen1Body}>
              Manche Entscheidungen halten dich nachts wach. Du spielst Szenarien durch. Fragst Freunde. Zweifelst an dir selbst.
            </Text>
          </View>

          <View style={{ paddingTop: 16 }}>
            <Text style={styles.screen1Italic}>
              Das ist keine Schwäche—das ist Weisheit, die ihren Weg sucht.
            </Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity onPress={onNext} style={styles.buttonWhite} activeOpacity={0.8}>
          <Text style={styles.buttonWhiteText}>Ich fühle das</Text>
          <Feather name="chevron-right" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

// Screen 2: Transformation - "This could help me"
const Screen2Transformation = ({ animate, slideAnim, onNext }) => {
  return (
    <Animated.View
      style={[
        {
          opacity: animate,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.screenCard, styles.screenWhite]}>
        {/* Split Visual */}
        <View style={styles.splitContainer}>
          <View style={styles.splitSide}>
            <Svg width={100} height={100} viewBox="0 0 100 100">
              {/* Chaotic tangled lines */}
              <Path d="M20,30 Q40,10 60,30 T80,50 Q60,70 40,50 T20,30" stroke="#EF4444" strokeWidth="2" fill="none" opacity="0.6" />
              <Path d="M30,20 Q50,40 70,20 T80,60" stroke="#F59E0B" strokeWidth="2" fill="none" opacity="0.6" />
              <Path d="M25,60 Q45,40 65,60" stroke="#DC2626" strokeWidth="2" fill="none" opacity="0.6" />
            </Svg>
            <Text style={styles.splitLabel}>Überforderung</Text>
          </View>

          <Text style={styles.splitArrow}>→</Text>

          <View style={styles.splitSide}>
            <Svg width={100} height={100} viewBox="0 0 100 100">
              {/* Clean straight path */}
              <Path d="M20,50 L80,50" stroke="#3B82F6" strokeWidth="3" fill="none" />
              <Circle cx="80" cy="50" r="8" fill="#3B82F6" />
              <Path d="M70,45 L80,50 L70,55" stroke="white" strokeWidth="2" fill="none" />
            </Svg>
            <Text style={styles.splitLabelBlue}>Klarheit</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentCenter}>
          <Text style={styles.screen2Title}>
            Stell dir vor, mit Sicherheit zu entscheiden—nicht mit Angst.
          </Text>

          <View style={{ marginTop: 20 }}>
            <Text style={styles.screen2Body}>
              Was, wenn schwierige Entscheidungen sich nicht mehr so schwer anfühlen würden?
            </Text>
            <Text style={[styles.screen2Body, { marginTop: 12 }]}>
              Was, wenn du dir selbst vertrauen könntest zu wissen, was wirklich zählt?
            </Text>
          </View>

          <View style={{ paddingTop: 16 }}>
            <Text style={styles.screen2Italic}>
              Die Antworten sind bereits in dir. Wir helfen dir, sie zu finden.
            </Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity onPress={onNext} style={styles.buttonBlue} activeOpacity={0.8}>
          <Text style={styles.buttonBlueText}>Zeig mir, wie</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Screen 3: Proof - "I can trust this"
const Screen3Proof = ({ animate, slideAnim, onNext }) => {
  const [demoStep, setDemoStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const demoSteps = [
    {
      label: 'Beschreibe deine Wahl',
      emoji: '📝',
      example: 'Soll ich diesen Job annehmen?',
      colors: ['#60A5FA', '#3B82F6'],
    },
    {
      label: 'Beantworte ein paar wichtige Fragen',
      emoji: '💭',
      example: 'Was ist dir am wichtigsten?',
      colors: ['#A78BFA', '#8B5CF6'],
    },
    {
      label: 'Erhalte Klarheit, keine Befehle',
      emoji: '✨',
      example: 'Das verraten deine Antworten',
      colors: ['#4ADE80', '#22C55E'],
    },
  ];

  return (
    <Animated.View
      style={[
        {
          opacity: animate,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.screenCard, styles.screenWhite]}>
        {/* Header accent */}
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.screen3Header}
        >
          <Feather name="star" size={24} color="white" />
        </LinearGradient>

        {/* Content */}
        <View style={[styles.contentCenter, { marginTop: -16 }]}>
          <Text style={styles.screen3Title}>Sieh es in Aktion.</Text>

          <Text style={styles.screen3Subtitle}>
            Vayze sagt dir nicht, was du tun sollst.{'\n'}Es hilft dir zu verstehen, was du wirklich willst.
          </Text>
        </View>

        {/* Phone Mockup Demo */}
        <View style={styles.phoneMockupContainer}>
          <View style={styles.phoneMockup}>
            <LinearGradient
              colors={demoSteps[demoStep].colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.phoneMockupScreen}
            >
              <Text style={styles.phoneMockupEmoji}>{demoSteps[demoStep].emoji}</Text>
              <Text style={styles.phoneMockupLabel}>{demoSteps[demoStep].label}</Text>
              <Text style={styles.phoneMockupExample}>"{demoSteps[demoStep].example}"</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Progress dots */}
        <View style={styles.demoProgressContainer}>
          {[0, 1, 2].map((dot) => (
            <View
              key={dot}
              style={[
                styles.demoDot,
                dot === demoStep ? styles.demoDotActive : styles.demoDotInactive,
              ]}
            />
          ))}
        </View>

        <Text style={styles.screen3Caption}>
          Echte Entscheidungen. Echte Klarheit. Kein Urteil.
        </Text>

        {/* CTA */}
        <TouchableOpacity onPress={onNext} style={styles.buttonBlue} activeOpacity={0.8}>
          <Text style={styles.buttonBlueText}>Ich bin bereit, es auszuprobieren</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Screen 4: Identity - "I want to be that person"
const Screen4Identity = ({ animate, slideAnim, onNext }) => {
  const statements = [
    'Ich treffe Entscheidungen, denen ich vertraue',
    'Ich zweifle nicht mehr tagelang',
    'Ich weiß, was ich wirklich will',
  ];

  return (
    <Animated.View
      style={[
        {
          opacity: animate,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.screenCard}
      >
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Svg width={180} height={180} viewBox="0 0 180 180">
            {/* Person with clear path ahead */}
            <Circle cx="90" cy="60" r="22" fill="white" opacity="0.95" />
            <Line x1="90" y1="82" x2="90" y2="135" stroke="white" strokeWidth="4" opacity="0.95" />
            <Line x1="90" y1="100" x2="70" y2="120" stroke="white" strokeWidth="4" opacity="0.95" />
            <Line x1="90" y1="100" x2="110" y2="120" stroke="white" strokeWidth="4" opacity="0.95" />
            <Line x1="90" y1="135" x2="75" y2="160" stroke="white" strokeWidth="4" opacity="0.95" />
            <Line x1="90" y1="135" x2="105" y2="160" stroke="white" strokeWidth="4" opacity="0.95" />

            {/* Clear straight path ahead with light */}
            <Path d="M 90 140 L 90 175" stroke="white" strokeWidth="3" opacity="0.8" />
            <Circle cx="90" cy="175" r="6" fill="white" opacity="0.9" />

            {/* Warm light rays */}
            <Line x1="90" y1="175" x2="60" y2="175" stroke="white" strokeWidth="1" opacity="0.4" />
            <Line x1="90" y1="175" x2="120" y2="175" stroke="white" strokeWidth="1" opacity="0.4" />
            <Line x1="90" y1="175" x2="75" y2="165" stroke="white" strokeWidth="1" opacity="0.3" />
            <Line x1="90" y1="175" x2="105" y2="165" stroke="white" strokeWidth="1" opacity="0.3" />
          </Svg>
        </View>

        {/* Content */}
        <View style={styles.contentCenter}>
          <Text style={styles.screen1Title}>Du, aber sicherer.</Text>

          <Text style={styles.screen1Subtitle}>
            Nicht perfekt. Nicht stressfrei.{'\n'}Nur klar darüber, was zählt—und{'\n'}selbstsicher nach vorne zu gehen.
          </Text>

          {/* Identity Statements */}
          <View style={{ paddingTop: 16 }}>
            {statements.map((statement, idx) => (
              <View key={idx} style={styles.statementRow}>
                <Feather name="check" size={20} color="white" style={{ marginTop: 2 }} />
                <Text style={styles.statementText}>"{statement}"</Text>
              </View>
            ))}
          </View>

          <View style={{ paddingTop: 24 }}>
            <Text style={styles.screen1Italic}>Das ist, wer du bereits wirst.</Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity onPress={onNext} style={styles.buttonWhite} activeOpacity={0.8}>
          <Text style={styles.buttonWhiteText}>Das ist, wer ich sein will</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

// Screen 5: Gateway (Account Creation) - "Let's do this"
const Screen5Gateway = ({ animate, slideAnim, accountData, setAccountData, showPassword, setShowPassword, onSubmit }) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
    >
      <Animated.View
        style={[
          {
            opacity: animate,
            transform: [{ translateY: slideAnim }],
          },
          { flex: 1 },
        ]}
      >
        <ScrollView
          style={[styles.screenCard, styles.screenWhite]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logo}
          >
            <Text style={styles.logoText}>V</Text>
          </LinearGradient>
        </View>

        {/* Content */}
        <View style={styles.contentCenter}>
          <Text style={styles.screen5Title}>Lass es uns persönlich machen.</Text>

          <Text style={styles.screen5Subtitle}>
            Um dir Klarheit zu geben, die wirklich zu deinem Leben passt, müssen wir verstehen, was dir am wichtigsten ist.
          </Text>

          {/* Value Propositions */}
          <View style={styles.valueProps}>
            <View style={styles.valueProp}>
              <View style={styles.valuePropDot}>
                <View style={styles.valuePropDotInner} />
              </View>
              <Text style={styles.valuePropText}>Deine Werte über alle Entscheidungen hinweg merken</Text>
            </View>
            <View style={styles.valueProp}>
              <View style={styles.valuePropDot}>
                <View style={styles.valuePropDotInner} />
              </View>
              <Text style={styles.valuePropText}>Muster erkennen, die dich selbstsicher machen</Text>
            </View>
            <View style={styles.valueProp}>
              <View style={styles.valuePropDot}>
                <View style={styles.valuePropDotInner} />
              </View>
              <Text style={styles.valuePropText}>Deinen Fortschritt privat und sicher aufbewahren</Text>
            </View>
          </View>
        </View>

        {/* Trust Signals */}
        <View style={styles.trustSignals}>
          <View style={styles.trustSignal}>
            <Feather name="shield" size={16} color="#6B7280" />
            <Text style={styles.trustSignalText}>Verschlüsselt</Text>
          </View>
          <View style={styles.trustSignal}>
            <Feather name="check" size={16} color="#6B7280" />
            <Text style={styles.trustSignalText}>Keine Werbung</Text>
          </View>
          <View style={styles.trustSignal}>
            <Feather name="zap" size={16} color="#6B7280" />
            <Text style={styles.trustSignalText}>20 Sekunden</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Dein Name"
            placeholderTextColor="#9CA3AF"
            value={accountData.name}
            onChangeText={(text) => setAccountData({ ...accountData, name: text })}
            autoCapitalize="words"
            textContentType="name"
            autoComplete="name"
          />

          <TextInput
            style={styles.input}
            placeholder="Deine E-Mail"
            placeholderTextColor="#9CA3AF"
            value={accountData.email}
            onChangeText={(text) => setAccountData({ ...accountData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
            autoComplete="email"
            importantForAutofill="yes"
            enablesReturnKeyAutomatically={false}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Passwort erstellen"
              placeholderTextColor="#9CA3AF"
              value={accountData.password}
              onChangeText={(text) => setAccountData({ ...accountData, password: text })}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              textContentType="newPassword"
              autoComplete="password-new"
              importantForAutofill="yes"
              passwordRules="minlength: 8;"
            />
            <TouchableOpacity
              style={styles.showPasswordButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showPasswordText}>{showPassword ? 'Verbergen' : 'Zeigen'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onSubmit} style={[styles.buttonBlue, { marginTop: 24 }]} activeOpacity={0.8}>
            <Text style={styles.buttonBlueText}>Meine Reise starten</Text>
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View style={styles.legalContainer}>
          <Text style={styles.legalText}>
            Mit dem Fortfahren stimmst du unseren{' '}
            <Text
              style={styles.legalLink}
              onPress={() => WebBrowser.openBrowserAsync('https://samuelstoeberl-prog.github.io/Vayze-Legal/index.html#terms')}
              accessibilityRole="link"
              accessibilityLabel="Nutzungsbedingungen"
            >
              Nutzungsbedingungen
            </Text>
            {' '}und{' '}
            <Text
              style={styles.legalLink}
              onPress={() => WebBrowser.openBrowserAsync('https://samuelstoeberl-prog.github.io/Vayze-Legal/index.html#privacy')}
              accessibilityRole="link"
              accessibilityLabel="Datenschutzerklärung"
            >
              Datenschutzerklärung
            </Text>
            {' '}zu.
          </Text>
        </View>
      </ScrollView>
    </Animated.View>
    </KeyboardAvoidingView>
  );
};

// Screen 6: Personalization - "This is mine now"
const Screen6Personalization = ({ animate, slideAnim, surveyData, currentQuestion, onSelect, onComplete }) => {
  const questions = [
    {
      id: 'context',
      headline: 'Welche Art von Entscheidungen hält dich wach?',
      intro: null,
      options: [
        { value: 'career', label: 'Karriere & Arbeit', emoji: '💼' },
        { value: 'relationships', label: 'Beziehungen & Familie', emoji: '❤️' },
        { value: 'money', label: 'Geld & Finanzen', emoji: '💰' },
        { value: 'health', label: 'Gesundheit & Lebensstil', emoji: '🏃' },
        { value: 'daily', label: 'Alltag & Routinen', emoji: '📅' },
        { value: 'creative', label: 'Kreatives & Persönliches', emoji: '🎨' },
      ],
      validation: (selected) => `Verstanden. Wir passen deine Erfahrung für ${selected.label.toLowerCase()} an.`,
    },
    {
      id: 'style',
      headline: 'Wie gehst du normalerweise mit großen Entscheidungen um?',
      intro: 'Kein Urteil—alle Stile sind gültig.',
      options: [
        { value: 'overthink', label: 'Ich überdenke tagelang alles', emoji: '🤔' },
        { value: 'impulsive', label: 'Ich entscheide schnell, bereue später', emoji: '⚡' },
        { value: 'social', label: 'Ich frage zuerst alle um Rat', emoji: '💬' },
        { value: 'gut', label: 'Ich vertraue sofort meinem Bauchgefühl', emoji: '✨' },
        { value: 'analytical', label: 'Ich mache Pro-Contra-Listen obsessiv', emoji: '📊' },
        { value: 'avoidant', label: 'Ich vermeide Entscheidungen bis es sein muss', emoji: '🙈' },
      ],
      validation: (selected) => `Das macht Sinn. Vayze passt sich an, wie du denkst.`,
    },
    {
      id: 'outcome',
      headline: 'Bei einer Entscheidung, was zählt am meisten?',
      intro: 'Wähl, was dich anspricht.',
      options: [
        { value: 'confidence', label: 'Sicher sein, die richtige Wahl getroffen zu haben', emoji: '💪' },
        { value: 'no-regret', label: 'Es später nicht bereuen', emoji: '🎯' },
        { value: 'speed', label: 'Schneller und stressfreier entscheiden', emoji: '⏱️' },
        { value: 'self-knowledge', label: 'Mich selbst besser verstehen', emoji: '🧠' },
        { value: 'trust', label: 'Meinem Urteilsvermögen mehr vertrauen', emoji: '🌟' },
        { value: 'clarity', label: 'Klar sein, nicht innerlich zerrissen', emoji: '🔆' },
      ],
      validation: (selected) => `Perfekt. Wir helfen dir dabei, dorthin zu kommen.`,
    },
  ];

  const currentQ = questions[currentQuestion];
  const isComplete = surveyData.context && surveyData.style && surveyData.outcome;

  return (
    <LinearGradient
      colors={['#3B82F6', '#2563EB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.surveyCard,
          {
            opacity: animate,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Progress */}
          <View style={styles.surveyProgress}>
            <View style={styles.surveyProgressHeader}>
              <Text style={styles.surveyProgressText}>Frage {currentQuestion + 1} von 3</Text>
              <Text style={styles.surveyProgressPercent}>{Math.round(((currentQuestion + 1) / 3) * 100)}%</Text>
            </View>
            <View style={styles.surveyProgressBar}>
              <View
                style={[
                  styles.surveyProgressFill,
                  { width: `${((currentQuestion + 1) / 3) * 100}%` },
                ]}
              />
            </View>
          </View>

          {/* Question Content */}
          <View>
            <Text style={styles.surveyHeadline}>{currentQ.headline}</Text>

            {currentQ.intro && <Text style={styles.surveyIntro}>{currentQ.intro}</Text>}

            {/* Options */}
            <View style={styles.surveyOptions}>
              {currentQ.options.map((option) => {
                const isSelected = surveyData[currentQ.id] === option.value;

                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => onSelect(currentQ.id, option.value)}
                    style={[
                      styles.surveyOption,
                      isSelected && styles.surveyOptionSelected,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.surveyOptionEmoji}>{option.emoji}</Text>
                    <Text style={styles.surveyOptionLabel}>{option.label}</Text>
                    {isSelected && <Feather name="check" size={20} color="#3B82F6" />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Validation Message */}
            {surveyData[currentQ.id] && (
              <View style={styles.validationMessage}>
                <Feather name="check" size={20} color="#059669" style={{ marginTop: 2 }} />
                <Text style={styles.validationText}>
                  {currentQ.validation(currentQ.options.find((o) => o.value === surveyData[currentQ.id]))}
                </Text>
              </View>
            )}

            {/* Complete Button */}
            {isComplete && currentQuestion === 2 && (
              <TouchableOpacity onPress={onComplete} style={[styles.buttonBlue, { marginTop: 32 }]} activeOpacity={0.8}>
                <Text style={styles.buttonBlueText}>Einrichtung abschließen</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    width: '100%',
    maxWidth: 448,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
  },
  progressDotActive: {
    width: 32,
    backgroundColor: 'white',
  },
  progressDotInactive: {
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  screenCard: {
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 25,
  },
  screenWhite: {
    backgroundColor: 'white',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  contentCenter: {
    alignItems: 'center',
  },
  // Screen 1 styles
  screen1Title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 24,
  },
  screen1Subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 27,
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  screen1Body: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  screen1Italic: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buttonWhite: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    marginTop: 40,
  },
  buttonWhiteText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  // Screen 2 styles
  splitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 16,
  },
  splitSide: {
    flex: 1,
    alignItems: 'center',
  },
  splitLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginTop: 12,
  },
  splitLabelBlue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginTop: 12,
  },
  splitArrow: {
    fontSize: 30,
    color: '#9CA3AF',
  },
  screen2Title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  screen2Body: {
    fontSize: 18,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 27,
    paddingHorizontal: 8,
  },
  screen2Italic: {
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buttonBlue: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    marginTop: 40,
  },
  buttonBlueText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Screen 3 styles
  screen3Header: {
    height: 64,
    marginHorizontal: -32,
    marginTop: -32,
    marginBottom: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screen3Title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  screen3Subtitle: {
    fontSize: 18,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 27,
  },
  phoneMockupContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  phoneMockup: {
    width: 256,
    height: 384,
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 25,
  },
  phoneMockupScreen: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  phoneMockupEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  phoneMockupLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  phoneMockupExample: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  demoProgressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  demoDot: {
    height: 8,
    borderRadius: 4,
  },
  demoDotActive: {
    width: 32,
    backgroundColor: '#3B82F6',
  },
  demoDotInactive: {
    width: 8,
    backgroundColor: '#D1D5DB',
  },
  screen3Caption: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  // Screen 4 styles
  statementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  statementText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  // Screen 5 styles
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 8,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700',
    color: 'white',
  },
  screen5Title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  screen5Subtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  valueProps: {
    paddingTop: 16,
    gap: 12,
    width: '100%',
  },
  valueProp: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  valuePropDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  valuePropDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  valuePropText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  trustSignals: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginVertical: 24,
  },
  trustSignal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustSignalText: {
    fontSize: 12,
    color: '#6B7280',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  showPasswordText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  legalContainer: {
    marginTop: 24,
    paddingHorizontal: 8,
  },
  legalText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    color: '#3B82F6',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Screen 6 styles
  surveyCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 448,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 25,
  },
  surveyProgress: {
    marginBottom: 32,
  },
  surveyProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  surveyProgressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  surveyProgressPercent: {
    fontSize: 14,
    color: '#6B7280',
  },
  surveyProgressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  surveyProgressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  surveyHeadline: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 32,
    marginBottom: 8,
  },
  surveyIntro: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  surveyOptions: {
    gap: 12,
    marginTop: 24,
  },
  surveyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    gap: 12,
  },
  surveyOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  surveyOptionEmoji: {
    fontSize: 24,
  },
  surveyOptionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  validationMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    gap: 12,
    marginTop: 24,
  },
  validationText: {
    flex: 1,
    fontSize: 14,
    color: '#047857',
  },
});

export default OnboardingFlowNew;

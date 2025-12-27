/**
 * Test/Demo script for Survey Onboarding
 * Use this in React Native Debugger console or a test component
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Reset onboarding to initial state
 * Call this to test the onboarding flow again
 */
export async function resetOnboarding() {
  try {
    await AsyncStorage.removeItem('onboardingCompleted');
    await AsyncStorage.removeItem('surveyAnswers');
    console.log('✅ Onboarding reset successfully. Restart the app to see the survey.');
    return true;
  } catch (error) {
    console.error('❌ Error resetting onboarding:', error);
    return false;
  }
}

/**
 * Get current onboarding status
 */
export async function getOnboardingStatus() {
  try {
    const completed = await AsyncStorage.getItem('onboardingCompleted');
    const answers = await AsyncStorage.getItem('surveyAnswers');

    const status = {
      isCompleted: completed === 'true',
      hasAnswers: answers !== null,
      answers: answers ? JSON.parse(answers) : null,
    };

    console.log('📊 Onboarding Status:', status);
    return status;
  } catch (error) {
    console.error('❌ Error getting status:', error);
    return null;
  }
}

/**
 * Set mock survey answers for testing
 * Useful for testing personalization features
 */
export async function setMockAnswers(variant = 'default') {
  const mockAnswers = {
    default: {
      goals: ['Think clearly under pressure', 'Stop overthinking'],
      areas: ['Work & Career', 'Daily life'],
      behavior: ['I overthink and lose time'],
      ideal_state: ['I trust myself', 'I act faster', 'I feel less stressed'],
    },
    confident: {
      goals: ['Make braver decisions', 'Become more productive'],
      areas: ['Goals & Self Growth', 'Work & Career'],
      behavior: ['I feel mostly confident'],
      ideal_state: ['My decisions feel clear', 'I feel in control of my life'],
    },
    impulsive: {
      goals: ['Stop overthinking', 'Feel more in control'],
      areas: ['Relationships', 'Money'],
      behavior: ['I decide impulsively and regret it'],
      ideal_state: ['I trust myself', 'My decisions feel clear'],
    },
    procrastinator: {
      goals: ['Make braver decisions', 'Become more productive'],
      areas: ['Daily life', 'Health & Habits'],
      behavior: ['I postpone decisions'],
      ideal_state: ['I act faster', 'I feel in control of my life'],
    },
  };

  const answers = mockAnswers[variant] || mockAnswers.default;

  try {
    await AsyncStorage.setItem('surveyAnswers', JSON.stringify(answers));
    await AsyncStorage.setItem('onboardingCompleted', 'true');
    console.log(`✅ Mock answers set (variant: ${variant}):`, answers);
    return answers;
  } catch (error) {
    console.error('❌ Error setting mock answers:', error);
    return null;
  }
}

/**
 * Print all stored data (for debugging)
 */
export async function debugStorage() {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const allData = await AsyncStorage.multiGet(allKeys);

    console.log('🔍 All AsyncStorage Data:');
    allData.forEach(([key, value]) => {
      if (key.includes('onboarding') || key.includes('survey')) {
        console.log(`  ${key}:`, value);
      }
    });

    return allData;
  } catch (error) {
    console.error('❌ Error debugging storage:', error);
    return null;
  }
}

/**
 * Clear all app data (use with caution!)
 */
export async function clearAllData() {
  try {
    await AsyncStorage.clear();
    console.log('🗑️ All AsyncStorage data cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    return false;
  }
}

/**
 * Example: Component for testing in development
 */
export const OnboardingDebugPanel = () => {
  return (
    <View style={{ padding: 20, backgroundColor: '#f3f4f6' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        🧪 Onboarding Debug Panel
      </Text>

      <TouchableOpacity
        style={debugButtonStyle}
        onPress={resetOnboarding}
      >
        <Text style={debugButtonTextStyle}>Reset Onboarding</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={debugButtonStyle}
        onPress={getOnboardingStatus}
      >
        <Text style={debugButtonTextStyle}>Check Status</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={debugButtonStyle}
        onPress={() => setMockAnswers('default')}
      >
        <Text style={debugButtonTextStyle}>Set Mock Answers (Default)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={debugButtonStyle}
        onPress={() => setMockAnswers('confident')}
      >
        <Text style={debugButtonTextStyle}>Set Mock Answers (Confident)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={debugButtonStyle}
        onPress={debugStorage}
      >
        <Text style={debugButtonTextStyle}>Debug Storage</Text>
      </TouchableOpacity>
    </View>
  );
};

const debugButtonStyle = {
  backgroundColor: '#3b82f6',
  padding: 12,
  borderRadius: 8,
  marginBottom: 8,
};

const debugButtonTextStyle = {
  color: 'white',
  textAlign: 'center',
  fontWeight: '600',
};

// Export for console usage
if (typeof window !== 'undefined') {
  window.onboardingDebug = {
    reset: resetOnboarding,
    status: getOnboardingStatus,
    setMock: setMockAnswers,
    debug: debugStorage,
    clear: clearAllData,
  };

  console.log(`
    🎯 Onboarding Debug Tools Loaded!

    Usage in console:
    - onboardingDebug.reset()         // Reset onboarding
    - onboardingDebug.status()        // Check current status
    - onboardingDebug.setMock('default')  // Set mock data
    - onboardingDebug.debug()         // View storage
    - onboardingDebug.clear()         // Clear all data
  `);
}

import AsyncStorage from '@react-native-async-storage/async-storage';

export async function resetOnboarding() {
  try {
    await AsyncStorage.removeItem('onboardingCompleted');
    await AsyncStorage.removeItem('surveyAnswers');
    
    return true;
  } catch (error) {
    
    return false;
  }
}

export async function getOnboardingStatus() {
  try {
    const completed = await AsyncStorage.getItem('onboardingCompleted');
    const answers = await AsyncStorage.getItem('surveyAnswers');

    const status = {
      isCompleted: completed === 'true',
      hasAnswers: answers !== null,
      answers: answers ? JSON.parse(answers) : null,
    };

    return status;
  } catch (error) {
    
    return null;
  }
}

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
    :`, answers);
    return answers;
  } catch (error) {
    
    return null;
  }
}

export async function debugStorage() {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const allData = await AsyncStorage.multiGet(allKeys);

    allData.forEach(([key, value]) => {
      if (key.includes('onboarding') || key.includes('survey')) {
        
      }
    });

    return allData;
  } catch (error) {
    
    return null;
  }
}

export async function clearAllData() {
  try {
    await AsyncStorage.clear();
    
    return true;
  } catch (error) {
    
    return false;
  }
}

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

if (typeof window !== 'undefined') {
  window.onboardingDebug = {
    reset: resetOnboarding,
    status: getOnboardingStatus,
    setMock: setMockAnswers,
    debug: debugStorage,
    clear: clearAllData,
  };

    - onboardingDebug.status()        
    - onboardingDebug.setMock('default')  
    - onboardingDebug.debug()         
    - onboardingDebug.clear()         
  `);
}

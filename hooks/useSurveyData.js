import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useSurveyData() {
  const [surveyData, setSurveyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSurveyData();
  }, []);

  const loadSurveyData = async () => {
    try {
      const data = await AsyncStorage.getItem('surveyAnswers');
      if (data) {
        setSurveyData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading survey data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSurveyData = async (newData) => {
    try {
      await AsyncStorage.setItem('surveyAnswers', JSON.stringify(newData));
      setSurveyData(newData);
    } catch (error) {
      console.error('Error updating survey data:', error);
    }
  };

  const clearSurveyData = async () => {
    try {
      await AsyncStorage.removeItem('surveyAnswers');
      await AsyncStorage.removeItem('onboardingCompleted');
      setSurveyData(null);
    } catch (error) {
      console.error('Error clearing survey data:', error);
    }
  };

  return {
    surveyData,
    loading,
    updateSurveyData,
    clearSurveyData,
    reload: loadSurveyData,
  };
}

export function getPersonalizedInsights(surveyData) {
  if (!surveyData) return null;

  const insights = {
    primaryGoals: surveyData.goals || [],
    strugglingAreas: surveyData.areas || [],
    currentBehavior: surveyData.behavior?.[0] || null,
    desiredOutcomes: surveyData.ideal_state || [],
  };

  const suggestions = [];

  if (insights.currentBehavior === 'I overthink and lose time') {
    suggestions.push('Try the Quick Decision mode for everyday choices');
    suggestions.push('Set time limits for decisions');
  }

  if (insights.currentBehavior === 'I decide impulsively and regret it') {
    suggestions.push('Use the Full Analysis mode to slow down');
    suggestions.push('Review past decisions to identify patterns');
  }

  if (insights.desiredOutcomes.includes('I act faster')) {
    suggestions.push('Practice with low-stakes decisions first');
  }

  if (insights.desiredOutcomes.includes('I feel less stressed')) {
    suggestions.push('Review your decision journal regularly');
    suggestions.push('Celebrate good decisions to build confidence');
  }

  return {
    ...insights,
    suggestions,
  };
}

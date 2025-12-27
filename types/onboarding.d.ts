/**
 * TypeScript definitions for Survey Onboarding System
 * Optional - for future TypeScript migration
 */

export interface SurveyAnswers {
  goals: string[];
  areas: string[];
  behavior: string[];
  ideal_state: string[];
}

export interface SurveyStep {
  id: keyof SurveyAnswers;
  title: string;
  multiSelect: boolean;
  options: string[];
}

export interface LoadingMessage {
  text: string;
  duration: number;
}

export interface PersonalizedInsights {
  primaryGoals: string[];
  strugglingAreas: string[];
  currentBehavior: string | null;
  desiredOutcomes: string[];
  suggestions: string[];
}

export interface UseSurveyDataReturn {
  surveyData: SurveyAnswers | null;
  loading: boolean;
  updateSurveyData: (data: SurveyAnswers) => Promise<void>;
  clearSurveyData: () => Promise<void>;
  reload: () => Promise<void>;
}

export interface SurveyOnboardingProps {
  onComplete?: (answers: SurveyAnswers) => void;
  onSkip?: (answers: SurveyAnswers) => void;
}

export interface PersonalizedDashboardProps {
  // No props currently, but defined for future extensibility
}

// Hook functions
export function useSurveyData(): UseSurveyDataReturn;
export function getPersonalizedInsights(
  surveyData: SurveyAnswers | null
): PersonalizedInsights | null;

// Component exports
export const SurveyOnboarding: React.FC<SurveyOnboardingProps>;
export const PersonalizedDashboard: React.FC<PersonalizedDashboardProps>;

# Survey Onboarding System - Documentation

## Overview
A modern, multi-step onboarding flow for the Decisio decision-making app that collects user preferences and goals through a survey-style interface.

## Features

### ✨ Key Capabilities
- **5-step survey flow** with progress tracking
- **Multi-select support** for steps 1, 2, and 4
- **Single-select mode** for step 3
- **Staged loading screen** with animated text transitions
- **Signup screen** with value proposition and skip option
- **Smooth animations** using React Native Animated API
- **Persistent state** using AsyncStorage
- **Accessibility compliant** with proper labels and roles

### 🎨 Design Features
- Matches existing app design system (colors, spacing, typography)
- Subtle micro-animations for better UX
- Progress bar with smooth transitions
- Checkbox-style selection indicators
- Responsive layout

## File Structure

```
Decision-asisstent/
├── components/
│   └── SurveyOnboarding.js      # Main onboarding component
├── hooks/
│   └── useSurveyData.js         # Custom hook for survey data access
├── App.js                        # Updated with survey integration
└── ONBOARDING_README.md         # This file
```

## Usage

### Basic Implementation

The onboarding is automatically shown on first app launch:

```javascript
import SurveyOnboarding from './components/SurveyOnboarding';

function App() {
  const handleComplete = (answers) => {
    console.log('User created account with answers:', answers);
    // Navigate to main app
  };

  const handleSkip = (answers) => {
    console.log('User skipped signup, answers saved:', answers);
    // Navigate to main app
  };

  return (
    <SurveyOnboarding
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}
```

### Using the Survey Data Hook

Access survey data anywhere in your app:

```javascript
import { useSurveyData, getPersonalizedInsights } from './hooks/useSurveyData';

function MyComponent() {
  const { surveyData, loading, updateSurveyData, clearSurveyData } = useSurveyData();

  if (loading) return <LoadingSpinner />;

  // Get personalized insights
  const insights = getPersonalizedInsights(surveyData);

  return (
    <View>
      <Text>Your primary goals: {insights.primaryGoals.join(', ')}</Text>
      {insights.suggestions.map(suggestion => (
        <Text key={suggestion}>{suggestion}</Text>
      ))}
    </View>
  );
}
```

## Data Structure

### Survey Answers Object

```javascript
{
  goals: string[],        // User's improvement goals
  areas: string[],        // Areas where user struggles
  behavior: string[],     // Current decision-making behavior (single item array)
  ideal_state: string[]   // Desired outcomes
}
```

### Example Data

```javascript
{
  goals: [
    "Think clearly under pressure",
    "Stop overthinking",
    "Make braver decisions"
  ],
  areas: [
    "Work & Career",
    "Daily life"
  ],
  behavior: [
    "I overthink and lose time"
  ],
  ideal_state: [
    "I trust myself",
    "I act faster",
    "I feel less stressed"
  ]
}
```

## Survey Steps

### Step 1: Goals (Multi-select)
**Question:** "What would you like to improve in your decisions?"
- Think clearly under pressure
- Stop overthinking
- Make braver decisions
- Become more productive
- Feel more in control

### Step 2: Struggle Areas (Multi-select)
**Question:** "Where do you struggle most with decisions?"
- Work & Career
- Relationships
- Money
- Daily life
- Goals & Self Growth
- Studies & Learning
- Health & Habits

### Step 3: Current Behavior (Single-select)
**Question:** "How do you currently feel when making decisions?"
- I overthink and lose time
- I decide impulsively and regret it
- I postpone decisions
- I ask others before deciding
- I feel mostly confident

### Step 4: Ideal State (Multi-select)
**Question:** "If Decisio worked perfectly, what would change?"
- I trust myself
- I act faster
- I feel less stressed
- My decisions feel clear
- I feel in control of my life

### Step 5: Loading & Signup
Staged loading screen followed by account creation prompt.

## Customization

### Modifying Survey Questions

Edit the `SURVEY_STEPS` array in `SurveyOnboarding.js`:

```javascript
const SURVEY_STEPS = [
  {
    id: 'goals',                    // Data key
    title: 'Your custom question',  // Question text
    multiSelect: true,              // Allow multiple selections
    options: [                      // Answer options
      'Option 1',
      'Option 2',
    ],
  },
  // ... more steps
];
```

### Customizing Loading Messages

Edit the `LOADING_MESSAGES` array:

```javascript
const LOADING_MESSAGES = [
  { text: 'Your message here...', duration: 1200 },
  // ... more messages
];
```

### Styling

All styles are contained in the `StyleSheet` at the bottom of `SurveyOnboarding.js`. Colors follow the existing design system:

- Primary: `#3b82f6` (blue)
- Text: `#1f2937` (dark gray)
- Secondary text: `#6b7280` (medium gray)
- Background: `#fafafa` (light gray)
- Border: `#e5e7eb` (light border)

## Accessibility

The component includes:
- `accessibilityRole` attributes for all interactive elements
- `accessibilityState` for selection states
- `accessibilityLabel` for clear descriptions
- Proper focus management
- Sufficient color contrast (WCAG AA compliant)

## Animation Timings

Following Material Design motion principles:
- Fade transitions: 200-300ms
- Slide transitions: 400ms (spring animation)
- Progress bar: 400ms
- Loading message transitions: 1200ms average

## Storage Keys

The onboarding uses these AsyncStorage keys:
- `onboardingCompleted`: `'true'` when survey is finished
- `surveyAnswers`: JSON string of the answers object

## Extending the System

### Adding a New Step

1. Add step configuration to `SURVEY_STEPS`:
```javascript
{
  id: 'new_step',
  title: 'Your question here?',
  multiSelect: false,
  options: ['Option 1', 'Option 2']
}
```

2. Update the answers state initialization in `SurveyOnboarding`:
```javascript
const [answers, setAnswers] = useState({
  goals: [],
  areas: [],
  behavior: [],
  ideal_state: [],
  new_step: [],  // Add your new step
});
```

### Adding Pre/Post Processing

Hook into lifecycle events:

```javascript
// Before showing signup
const handleLastStepComplete = () => {
  // Your custom logic here
  setShowLoading(true);
};

// After signup
const handleCreateAccount = async () => {
  // Your custom logic here
  await AsyncStorage.setItem('surveyAnswers', JSON.stringify(answers));
  onComplete?.(answers);
};
```

## Testing Locally

To reset and test the onboarding again:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clear onboarding state
await AsyncStorage.removeItem('onboardingCompleted');
await AsyncStorage.removeItem('surveyAnswers');

// Restart app
```

Or use the provided hook:

```javascript
const { clearSurveyData } = useSurveyData();
await clearSurveyData();
```

## Performance Considerations

- Uses `useNativeDriver: true` for transform animations (better performance)
- Minimal re-renders through proper state management
- Lazy loading of subsequent steps
- Efficient AsyncStorage operations

## Browser/Platform Support

- ✅ iOS (React Native)
- ✅ Android (React Native)
- ✅ Expo Go
- ✅ Expo managed workflow

## Future Enhancements

Possible extensions:
- Skip individual steps
- Go back to previous step (currently supported)
- Save partial progress
- A/B testing different question orders
- Analytics integration
- Conditional steps based on previous answers
- Progress persistence across app restarts (mid-onboarding)

## Troubleshooting

### Onboarding doesn't show
Check AsyncStorage: `onboardingCompleted` might be set to `'true'`.

### Animations not smooth
Ensure `useNativeDriver: true` is used for transform/opacity animations.

### Data not persisting
Verify AsyncStorage permissions and check error logs.

## License

Part of the Decisio app project.

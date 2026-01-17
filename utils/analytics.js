let analytics = null;

try {
  analytics = require('@react-native-firebase/analytics').default;
} catch (error) {
  console.log('Analytics module not available');
}

export const logEvent = async (eventName, params = {}) => {
  if (analytics) {
    try {
      await analytics().logEvent(eventName, params);
    } catch (error) {
      console.error('Error logging analytics event:', error);
    }
  }
};

export const isAnalyticsAvailable = () => {
  return analytics !== null;
};

export default {
  logEvent,
  isAnalyticsAvailable
};

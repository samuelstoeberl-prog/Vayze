/**
 * Firebase Configuration
 * WITH AsyncStorage Persistence for React Native
 */

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase config from google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyCVFwkATzDCXqrc18kw1gwwTUDyiqfwcuw",
  authDomain: "vayze-918fc.firebaseapp.com",
  projectId: "vayze-918fc",
  storageBucket: "vayze-918fc.firebasestorage.app",
  messagingSenderId: "761029973934",
  appId: "1:761029973934:android:458cff560db6c5c93d9a3f"
};

// Initialize Firebase
let app;
let auth;

try {
  app = initializeApp(firebaseConfig);

  // CRITICAL FIX: Initialize Auth with AsyncStorage persistence for React Native
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });

  if (__DEV__) {
    console.log('🔥 Firebase initialized successfully WITH AsyncStorage persistence');
  }
} catch (error) {
  console.error('🔥 Firebase initialization error:', error);
}

export { auth };
export default app;

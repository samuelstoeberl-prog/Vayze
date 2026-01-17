import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCVFwkATzDCXqrc18kw1gwwTUDyiqfwcuw",
  authDomain: "vayze-918fc.firebaseapp.com",
  projectId: "vayze-918fc",
  storageBucket: "vayze-918fc.firebasestorage.app",
  messagingSenderId: "761029973934",
  appId: "1:761029973934:android:458cff560db6c5c93d9a3f"
};

let app;
let auth;

try {
  app = initializeApp(firebaseConfig);

  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

export { auth };
export default app;

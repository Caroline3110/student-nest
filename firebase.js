// Import Firebase tools
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: "AIzaSyDIBnXjMPfk_xorEZFBRagIBEMxbZPou78",
  authDomain: "student-nest-f86b0.firebaseapp.com",
  projectId: "student-nest-f86b0",
  storageBucket: "student-nest-f86b0.firebasestorage.app",
  messagingSenderId: "1097479051358",
  appId: "1:1097479051358:web:bb1abd78d4bfa7837cfccf"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
export const db = getFirestore(app);

// Cloud Functions (the AI chat assistants call these)
export const functions = getFunctions(app);

import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyD9lkSmfFE5bzXYwhxSxPGNrM5XzqJ_VXU",
  authDomain: "myinvisiblefriendad.firebaseapp.com",
  projectId: "myinvisiblefriendad",
  storageBucket: "myinvisiblefriendad.firebasestorage.app",
  messagingSenderId: "749339297785",
  appId: "1:749339297785:android:00fef018fd3b8462d85f28"
};

const app = initializeApp(firebaseConfig);

let auth: Auth;

if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { auth };
export const firestore = getFirestore(app);
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'houzeo-a66eb.firebaseapp.com',
  projectId: 'houzeo-a66eb',
  storageBucket: 'houzeo-a66eb.firebasestorage.app',
  messagingSenderId: '993508876447',
  appId: '1:993508876447:web:7bd0459386ad1bc06342aa',
  measurementId: 'G-DRZHGF5P7K',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { credential } from "firebase-admin";
import admin from "firebase-admin";

// Your web app's Firebase configuration
// Replace with your actual Firebase config values
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.FIREBASE_APP_ID || "",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Admin (for server-side operations)
const adminApp = admin.initializeApp({
  credential: process.env.FIREBASE_ADMIN_CREDENTIALS 
    ? admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS))
    : admin.credential.applicationDefault(),
});

// Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const adminAuth = admin.auth(adminApp);
export const adminFirestore = admin.firestore(adminApp);

export default app;

// src/firebase/firebaseClient.js
// Safe client-side Firebase initialization for Next.js + Vercel

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "./config";

let firebaseApp = null;
let db = null;
let auth = null;

if (typeof window !== "undefined") {
  // Only initialize Firebase in the browser
  firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(firebaseApp);
  auth = getAuth(firebaseApp);
}

// Safe exports (server-side will see null, client-side will see real SDK)
export { db, auth, firebaseApp };
export default firebaseApp;

'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Define the shape of the Firebase SDKs object
 */
export interface FirebaseSdks {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

/**
 * Cached SDK object to ensure stable references for hooks like useMemoFirebase
 */
let cachedSdks: FirebaseSdks | null = null;

/**
 * Initialize Firebase app and return memoized SDKs
 */
export function initializeFirebase(): FirebaseSdks {
  if (!getApps().length) {
    let firebaseApp: FirebaseApp;

    try {
      // Try automatic initialization (used in Firebase App Hosting)
      firebaseApp = initializeApp();
    } catch (e) {
      // Fallback: use firebaseConfig during development or if automatic init fails
      if (process.env.NODE_ENV === 'production') {
        console.warn('Automatic Firebase initialization failed. Using config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  // Already initialized → reuse existing app
  return getSdks(getApp());
}

/**
 * Return memoized Firebase SDKs object
 * Ensures stable object reference for React Firebase hooks
 */
export function getSdks(firebaseApp: FirebaseApp): FirebaseSdks {
  if (!cachedSdks) {
    cachedSdks = {
      firebaseApp,
      auth: getAuth(firebaseApp),
      firestore: getFirestore(firebaseApp),
    };
  }

  return cachedSdks;
}

// Re-export everything else
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

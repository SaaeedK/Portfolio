/** Optional Firebase Web SDK bootstrap (Analytics when measurement ID is set). */
import { getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

function readFirebaseOptionsFromEnv(): FirebaseOptions | null {
  const {
    VITE_FIREBASE_API_KEY: apiKey,
    VITE_FIREBASE_AUTH_DOMAIN: authDomain,
    VITE_FIREBASE_PROJECT_ID: projectId,
    VITE_FIREBASE_STORAGE_BUCKET: storageBucket,
    VITE_FIREBASE_MESSAGING_SENDER_ID: messagingSenderId,
    VITE_FIREBASE_APP_ID: appId,
    VITE_FIREBASE_MEASUREMENT_ID: measurementId,
  } = import.meta.env;

  if (!apiKey || !projectId || !appId) return null;

  const options: FirebaseOptions = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
  if (measurementId) options.measurementId = measurementId;
  return options;
}

let cachedApp: FirebaseApp | null = null;

/**
 * Initializes the default Firebase app when `VITE_FIREBASE_*` env vars are set.
 * Safe to call multiple times. No-ops when config is incomplete (local dev without Firebase).
 */
export function initFirebase(): FirebaseApp | null {
  if (cachedApp) return cachedApp;

  const options = readFirebaseOptionsFromEnv();
  if (!options) return null;

  cachedApp = getApps().length > 0 ? getApps()[0]! : initializeApp(options);

  if (typeof window !== 'undefined' && options.measurementId) {
    void isSupported().then((supported) => {
      if (supported && cachedApp) {
        getAnalytics(cachedApp);
      }
    });
  }

  return cachedApp;
}

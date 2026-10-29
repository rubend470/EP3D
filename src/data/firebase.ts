import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const e = import.meta.env;
const config = {
  apiKey: e.VITE_FIREBASE_API_KEY,
  authDomain: e.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: e.VITE_FIREBASE_PROJECT_ID,
  storageBucket: e.VITE_FIREBASE_STORAGE_BUCKET,
  appId: e.VITE_FIREBASE_APP_ID,
};
if ([config.apiKey, config.authDomain, config.projectId, config.appId].some((v) => !v))
  throw new Error('Falta configuración de Firebase. Revisa .env.local y .env.example.');
const app = initializeApp(config);
export const db = getFirestore(app);
export const auth = getAuth(app);
export { app };

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

const placeholders = ['cole_', 'coloque_', 'seu-', 'seu_']

export const hasFirebaseConfig = Object.values(firebaseConfig).every(
  (value) =>
    value &&
    !placeholders.some((placeholder) =>
      String(value).toLowerCase().startsWith(placeholder),
    ),
)

export const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null

export const auth = app ? getAuth(app) : null
export const cloudFirestoreEnabled =
  hasFirebaseConfig && import.meta.env.VITE_FIREBASE_USE_FIRESTORE === 'true'
export const db = app && cloudFirestoreEnabled ? getFirestore(app) : null

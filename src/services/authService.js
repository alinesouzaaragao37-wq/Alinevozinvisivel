import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, cloudFirestoreEnabled, db, hasFirebaseConfig } from '../firebase/config'

function ensureFirebase() {
  if (!hasFirebaseConfig || !auth) {
    throw new Error('Configure as credenciais VITE_FIREBASE_* no arquivo .env.')
  }
}

export async function registerWithEmail({ name, email, password }) {
  ensureFirebase()
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName: name })

  if (cloudFirestoreEnabled && db) {
    const profile = {
      uid: credential.user.uid,
      name,
      email,
      role: 'jovem',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(doc(db, 'users', credential.user.uid), profile)
  }

  try {
    await sendEmailVerification(credential.user)
    return { user: credential.user, verificationEmailSent: true }
  } catch {
    return { user: credential.user, verificationEmailSent: false }
  }
}

export async function loginWithEmail(email, password) {
  ensureFirebase()
  return signInWithEmailAndPassword(auth, email, password)
}

export async function loginWithGoogle() {
  ensureFirebase()
  const provider = new GoogleAuthProvider()
  const credential = await signInWithPopup(auth, provider)

  if (!cloudFirestoreEnabled || !db) {
    return credential.user
  }

  const userRef = doc(db, 'users', credential.user.uid)
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      uid: credential.user.uid,
      name: credential.user.displayName || 'Pessoa acolhida',
      email: credential.user.email,
      role: 'jovem',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  return credential.user
}

export async function requestPasswordReset(email) {
  ensureFirebase()
  return sendPasswordResetEmail(auth, email)
}

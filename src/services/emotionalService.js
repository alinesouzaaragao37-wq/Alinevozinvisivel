import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db, hasFirebaseConfig } from '../firebase/config'
import { analisarRelato } from './analisarRelato'

function requireDb() {
  if (!hasFirebaseConfig || !db) {
    throw new Error('Firestore nao configurado. Verifique as variaveis VITE_FIREBASE_*.')
  }
}

export async function saveCheckin({ user, profile, emotion, intensity, note }) {
  requireDb()
  return addDoc(collection(db, 'checkins'), {
    userId: user.uid,
    userName: profile?.name || user.displayName || 'Pessoa acolhida',
    emotion,
    intensity,
    note,
    createdAt: serverTimestamp(),
  })
}

export async function saveDiaryEntry({ user, profile, text, emotion }) {
  requireDb()
  const analysis = analisarRelato(text, emotion)
  const payload = {
    userId: user.uid,
    userName: profile?.name || user.displayName || 'Pessoa acolhida',
    text,
    emotion,
    risk: analysis.risk,
    score: analysis.score,
    detectedWords: analysis.detectedWords,
    supportiveMessage: analysis.supportiveMessage,
    recommendation: analysis.recommendation,
    status: 'novo',
    createdAt: serverTimestamp(),
  }

  const entry = await addDoc(collection(db, 'emotionalLogs'), payload)

  if (analysis.risk !== 'baixo') {
    await addDoc(collection(db, 'alerts'), {
      logId: entry.id,
      userId: user.uid,
      userName: payload.userName,
      risk: analysis.risk,
      score: analysis.score,
      detectedWords: analysis.detectedWords,
      status: 'novo',
      createdAt: serverTimestamp(),
    })
  }

  return { id: entry.id, ...payload, analysis }
}

export function listenUserCheckins(userId, callback, onError) {
  requireDb()
  const q = query(
    collection(db, 'checkins'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(30),
  )
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(mapDoc)), onError)
}

export function listenUserLogs(userId, callback, onError) {
  requireDb()
  const q = query(
    collection(db, 'emotionalLogs'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(30),
  )
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(mapDoc)), onError)
}

export function listenAdminCollection(name, callback, onError) {
  requireDb()
  const q = query(collection(db, name), orderBy('createdAt', 'desc'), limit(100))
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(mapDoc)), onError)
}

export async function updateAlertStatus(id, status) {
  requireDb()
  return updateDoc(doc(db, 'alerts', id), { status, updatedAt: serverTimestamp() })
}

export async function getUsersCount() {
  requireDb()
  const snapshot = await getCountFromServer(collection(db, 'users'))
  return snapshot.data().count
}

function mapDoc(item) {
  return { id: item.id, ...item.data() }
}

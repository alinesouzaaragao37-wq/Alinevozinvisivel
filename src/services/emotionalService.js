import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { cloudFirestoreEnabled, db, hasFirebaseConfig } from '../firebase/config'
import { analisarRelato } from './analisarRelato'

const localPrefix = 'voz-invisivel.local.'
const localEvent = 'voz-invisivel-local-update'

function requireDb() {
  if (!hasFirebaseConfig || !db) {
    throw new Error('Firestore não configurado. Verifique as variáveis VITE_FIREBASE_*.')
  }
}

export async function saveCheckin({ user, profile, emotion, intensity, note }) {
  if (!cloudFirestoreEnabled) {
    return addLocalItem('checkins', {
      userId: user.uid,
      userName: profile?.name || user.displayName || 'Pessoa acolhida',
      emotion,
      intensity,
      note,
    })
  }

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
  }

  if (!cloudFirestoreEnabled) {
    const entry = addLocalItem('emotionalLogs', payload)

    if (analysis.risk !== 'baixo') {
      addLocalItem('alerts', {
        logId: entry.id,
        userId: user.uid,
        userName: payload.userName,
        risk: analysis.risk,
        score: analysis.score,
        detectedWords: analysis.detectedWords,
        status: 'novo',
      })
    }

    return { ...entry, analysis }
  }

  requireDb()
  const cloudPayload = { ...payload, createdAt: serverTimestamp() }
  const entry = await addDoc(collection(db, 'emotionalLogs'), cloudPayload)

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

  return { id: entry.id, ...cloudPayload, analysis }
}

export function listenUserCheckins(userId, callback, onError) {
  if (!cloudFirestoreEnabled) {
    return listenLocalCollection('checkins', callback, (item) => item.userId === userId)
  }

  requireDb()
  return listenRecentUserCollection('checkins', userId, callback, onError)
}

export function listenUserLogs(userId, callback, onError) {
  if (!cloudFirestoreEnabled) {
    return listenLocalCollection('emotionalLogs', callback, (item) => item.userId === userId)
  }

  requireDb()
  return listenRecentUserCollection('emotionalLogs', userId, callback, onError)
}

export function listenAdminCollection(name, callback, onError) {
  if (!cloudFirestoreEnabled) {
    return listenLocalCollection(name, callback)
  }

  requireDb()
  const q = query(collection(db, name), limit(100))
  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.docs.map(mapDoc).sort(sortByCreatedAtDesc)),
    onError,
  )
}

export async function updateAlertStatus(id, status) {
  if (!cloudFirestoreEnabled) {
    const items = readLocalCollection('alerts').map((item) =>
      item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item,
    )
    writeLocalCollection('alerts', items)
    return
  }

  requireDb()
  return updateDoc(doc(db, 'alerts', id), { status, updatedAt: serverTimestamp() })
}

export async function getUsersCount() {
  if (!cloudFirestoreEnabled) {
    return 0
  }

  requireDb()
  const snapshot = await getCountFromServer(collection(db, 'users'))
  return snapshot.data().count
}

function mapDoc(item) {
  return { id: item.id, ...item.data() }
}

function listenRecentUserCollection(name, userId, callback, onError) {
  const userQuery = query(collection(db, name), where('userId', '==', userId))
  return onSnapshot(
    userQuery,
    (snapshot) => callback(snapshot.docs.map(mapDoc).sort(sortByCreatedAtDesc).slice(0, 30)),
    onError,
  )
}

function sortByCreatedAtDesc(a, b) {
  const left = timestampValue(a.createdAt)
  const right = timestampValue(b.createdAt)
  return right - left
}

function timestampValue(value) {
  if (value?.toDate) {
    return value.toDate().getTime()
  }
  return new Date(value || 0).getTime()
}

function readLocalCollection(name) {
  try {
    return JSON.parse(localStorage.getItem(`${localPrefix}${name}`) || '[]')
  } catch {
    return []
  }
}

function writeLocalCollection(name, items) {
  localStorage.setItem(`${localPrefix}${name}`, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent(localEvent, { detail: name }))
}

function addLocalItem(name, payload) {
  const item = {
    id: crypto.randomUUID(),
    ...payload,
    createdAt: new Date().toISOString(),
  }
  writeLocalCollection(name, [item, ...readLocalCollection(name)])
  return item
}

function listenLocalCollection(name, callback, filter = () => true) {
  const emit = () => {
    callback(readLocalCollection(name).filter(filter).sort(sortByCreatedAtDesc).slice(0, 100))
  }
  const handleUpdate = (event) => {
    if (event.detail === name) {
      emit()
    }
  }

  emit()
  window.addEventListener(localEvent, handleUpdate)
  return () => window.removeEventListener(localEvent, handleUpdate)
}

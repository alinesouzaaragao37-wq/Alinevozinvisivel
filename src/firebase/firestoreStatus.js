import { firebaseApiKey, firebaseProjectId, hasFirebaseConfig } from './config'

let availabilityPromise

export async function ensureFirestoreAvailable() {
  if (!hasFirebaseConfig) {
    throw new Error('Firestore nao configurado. Verifique as variaveis VITE_FIREBASE_*.')
  }

  if (!availabilityPromise) {
    const endpoint =
      `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(firebaseProjectId)}` +
      `/databases/(default)/documents/checkins?pageSize=1&key=${encodeURIComponent(firebaseApiKey)}`

    availabilityPromise = fetch(endpoint).then(async (response) => {
      const body = await response.text()
      const message = body.toLowerCase()

      if (
        response.status === 404 &&
        message.includes('database') &&
        message.includes('does not exist')
      ) {
        throw new Error('The database (default) does not exist for this Firebase project.')
      }

      if (
        response.status === 403 &&
        message.includes('cloud firestore api') &&
        (message.includes('disabled') || message.includes('has not been used'))
      ) {
        throw new Error('Cloud Firestore API is disabled for this Firebase project.')
      }

      return true
    })
  }

  try {
    return await availabilityPromise
  } catch (error) {
    availabilityPromise = undefined
    throw error
  }
}

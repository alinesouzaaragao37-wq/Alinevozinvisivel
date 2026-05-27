import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, cloudFirestoreEnabled, db, hasFirebaseConfig } from '../firebase/config'
import { AuthContext } from './authContextValue'

function buildLocalProfile(currentUser) {
  return {
    uid: currentUser.uid,
    name: currentUser.displayName || 'Pessoa acolhida',
    email: currentUser.email,
    role: 'jovem',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(hasFirebaseConfig)
  const [firestoreError, setFirestoreError] = useState(null)

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) {
      return undefined
    }

    return onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true)
      setUser(currentUser)

      if (!currentUser) {
        setProfile(null)
        setFirestoreError(null)
        setLoading(false)
        return
      }

      if (!cloudFirestoreEnabled || !db) {
        const localProfile = buildLocalProfile(currentUser)
        localStorage.setItem(`voz-invisivel.profile.${currentUser.uid}`, JSON.stringify(localProfile))
        setFirestoreError(null)
        setProfile(localProfile)
        setLoading(false)
        return
      }

      try {
        setFirestoreError(null)
        const profileRef = doc(db, 'users', currentUser.uid)
        const snapshot = await getDoc(profileRef)

        if (!snapshot.exists()) {
          const fallbackProfile = {
            uid: currentUser.uid,
            name: currentUser.displayName || 'Pessoa acolhida',
            email: currentUser.email,
            role: 'jovem',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }

          await setDoc(profileRef, fallbackProfile)
          setProfile(fallbackProfile)
          setLoading(false)
          return
        }

        setProfile(
          snapshot.data(),
        )
      } catch (error) {
        setFirestoreError(error)
        setProfile(buildLocalProfile(currentUser))
      }
      setLoading(false)
    })
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      firestoreError,
      isAdmin: ['admin', 'gestor', 'profissional'].includes(profile?.role),
    }),
    [user, profile, loading, firestoreError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, hasFirebaseConfig } from '../firebase/config'
import { ensureFirestoreAvailable } from '../firebase/firestoreStatus'
import { AuthContext } from './authContextValue'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(hasFirebaseConfig)
  const [firestoreError, setFirestoreError] = useState(null)

  useEffect(() => {
    if (!hasFirebaseConfig || !auth || !db) {
      return undefined
    }

    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (!currentUser) {
        setProfile(null)
        setFirestoreError(null)
        setLoading(false)
        return
      }

      try {
        await ensureFirestoreAvailable()
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
        setProfile({
          uid: currentUser.uid,
          name: currentUser.displayName || 'Pessoa acolhida',
          email: currentUser.email,
          role: 'jovem',
        })
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

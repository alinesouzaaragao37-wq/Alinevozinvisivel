import { useState } from 'react'
import { traduzirErroFirebase } from '../firebase/errors'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { resendVerificationEmail, updateDisplayName } from '../services/authService'

function Perfil() {
  const { user, profile } = useAuth()
  const { notify } = useToast()
  const [displayName, setDisplayName] = useState(profile?.name || user.displayName || '')
  const [name, setName] = useState(profile?.name || user.displayName || '')
  const [savingName, setSavingName] = useState(false)
  const [sendingVerification, setSendingVerification] = useState(false)
  const [error, setError] = useState('')

  async function saveName(event) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (trimmedName.length < 2) {
      setError('Informe um nome com pelo menos 2 caracteres.')
      return
    }

    setError('')
    setSavingName(true)
    try {
      const updatedName = await updateDisplayName(user, trimmedName)
      setDisplayName(updatedName)
      notify('Nome de exibição atualizado com sucesso.')
    } catch (err) {
      setError(traduzirErroFirebase(err))
    } finally {
      setSavingName(false)
    }
  }

  async function resendVerification() {
    setError('')
    setSendingVerification(true)
    try {
      await resendVerificationEmail(user)
      notify('E-mail de confirmação reenviado. Verifique sua caixa de entrada.')
    } catch (err) {
      setError(traduzirErroFirebase(err))
    } finally {
      setSendingVerification(false)
    }
  }

  return (
    <main className="app-page">
      <section className="page-heading">
        <span className="eyebrow">Perfil</span>
        <h1>Dados da conta</h1>
        <p>Informações básicas usadas para personalizar a experiência.</p>
      </section>

      <section className="profile-grid">
        <article className="panel">
          <h2>{displayName || 'Pessoa acolhida'}</h2>
          <p>{profile?.email || user.email}</p>
          <form className="profile-name-form" onSubmit={saveName}>
            <label>
              Nome de exibição
              <input
                autoComplete="name"
                maxLength={80}
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
            <button className="button primary small" disabled={savingName} type="submit">
              {savingName ? 'Salvando...' : 'Salvar nome'}
            </button>
          </form>
          <div className="profile-meta">
            <span>Perfil: {profile?.role || 'jovem'}</span>
            <span>E-mail: {user.emailVerified ? 'confirmado' : 'confirmação pendente'}</span>
            <span>UID: {user.uid}</span>
          </div>
          {!user.emailVerified && (
            <button
              className="button secondary small profile-action"
              disabled={sendingVerification}
              type="button"
              onClick={resendVerification}
            >
              {sendingVerification ? 'Enviando...' : 'Reenviar confirmação'}
            </button>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </article>
        <article className="panel">
          <span className="eyebrow">Privacidade</span>
          <h2>Cuidado com dados sensíveis</h2>
          <p>
            O MVP separa usuários, check-ins, relatos e alertas. Regras de
            segurança limitam leitura individual aos próprios dados e leitura
            administrativa a perfis autorizados.
          </p>
        </article>
      </section>
    </main>
  )
}

export default Perfil

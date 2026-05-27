import { useState } from 'react'
import { Link } from 'react-router-dom'
import { traduzirErroFirebase } from '../firebase/errors'
import { useToast } from '../hooks/useToast'
import { loginWithEmail, loginWithGoogle } from '../services/authService'

function Login() {
  const { notify } = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginWithEmail(form.email, form.password)
      notify('Sessão iniciada com sucesso.')
    } catch (err) {
      setError(traduzirErroFirebase(err))
    } finally {
      setLoading(false)
    }
  }

  async function googleLogin() {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      notify('Login com Google realizado.')
    } catch (err) {
      setError(traduzirErroFirebase(err, 'google'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit} aria-busy={loading}>
        <div className="auth-intro">
          <span className="eyebrow">Bem-vindo de volta</span>
          <h1>Seu espaço espera por você.</h1>
          <p>Entre para continuar seus registros com privacidade e acolhimento.</p>
          <div className="auth-care-note">
            O que você sente importa. Voltar a registrar também é uma forma de se cuidar.
          </div>
        </div>

        <div className="auth-fields">
          <label>
            E-mail
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
              required
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
              minLength={6}
              required
            />
          </label>

          {error && (
            <p className="form-error" id="login-error" role="alert">
              {error}
            </p>
          )}

          <button className="button primary full" disabled={loading} type="submit">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <button
            className="button secondary full"
            disabled={loading}
            type="button"
            onClick={googleLogin}
          >
            Entrar com Google
          </button>

          <p className="auth-switch">
            Ainda não tem conta? <Link to="/cadastro">Criar cadastro</Link>
          </p>
        </div>
      </form>
    </main>
  )
}

export default Login

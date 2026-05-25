import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { traduzirErroFirebase } from '../firebase/errors'
import { useToast } from '../hooks/useToast'
import { loginWithEmail, loginWithGoogle } from '../services/authService'

function Login() {
  const navigate = useNavigate()
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
      notify('Sessao iniciada com sucesso.')
      navigate('/dashboard')
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
      navigate('/dashboard')
    } catch (err) {
      setError(traduzirErroFirebase(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">Acesso seguro</span>
        <h1>Entrar</h1>
        <p>Continue seu registro emocional em um ambiente privado e acolhedor.</p>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            required
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={form.password}
            onChange={(event) => update('password', event.target.value)}
            minLength={6}
            required
          />
        </label>

        {error && <p className="form-error">{error}</p>}

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
          Ainda nao tem conta? <Link to="/cadastro">Criar cadastro</Link>
        </p>
      </form>
    </main>
  )
}

export default Login

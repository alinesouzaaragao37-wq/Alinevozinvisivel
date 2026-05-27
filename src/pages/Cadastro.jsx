import { useState } from 'react'
import { Link } from 'react-router-dom'
import { traduzirErroFirebase } from '../firebase/errors'
import { useToast } from '../hooks/useToast'
import { registerWithEmail } from '../services/authService'

function Cadastro() {
  const { notify } = useToast()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })
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
      await registerWithEmail(form)
      notify('Cadastro criado. Bem-vindo à Voz Invisível.')
    } catch (err) {
      setError(traduzirErroFirebase(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card wide" onSubmit={submit} aria-busy={loading}>
        <div className="auth-intro">
          <span className="eyebrow">Comece com calma</span>
          <h1>Crie seu espaço de cuidado.</h1>
          <p>
            Aqui você pode registrar sentimentos, acompanhar sua jornada e buscar
            apoio com mais clareza.
          </p>
          <div className="auth-care-note">
            Seus registros são pessoais e devem ser tratados com respeito e privacidade.
          </div>
        </div>

        <div className="auth-fields">
          <label>
            Nome
            <input
              autoComplete="name"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'cadastro-error' : undefined}
              required
            />
          </label>
          <label>
            E-mail
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'cadastro-error' : undefined}
              required
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'cadastro-error' : undefined}
              minLength={6}
              required
            />
          </label>
          {error && (
            <p className="form-error" id="cadastro-error" role="alert">
              {error}
            </p>
          )}

          <button className="button primary full" disabled={loading} type="submit">
            {loading ? 'Criando...' : 'Criar cadastro'}
          </button>

          <p className="auth-switch">
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </form>
    </main>
  )
}

export default Cadastro

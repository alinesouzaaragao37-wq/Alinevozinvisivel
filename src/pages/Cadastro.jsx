import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { traduzirErroFirebase } from '../firebase/errors'
import { useToast } from '../hooks/useToast'
import { registerWithEmail } from '../services/authService'

function Cadastro() {
  const navigate = useNavigate()
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
      notify('Cadastro criado. Bem-vindo a Voz Invisivel.')
      navigate('/dashboard')
    } catch (err) {
      setError(traduzirErroFirebase(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card wide" onSubmit={submit}>
        <span className="eyebrow">Comece com calma</span>
        <h1>Crie seu espaco de cuidado.</h1>
        <p>
          Aqui voce pode registrar sentimentos, acompanhar sua jornada e buscar
          apoio com mais clareza.
        </p>
        <div className="auth-care-note">
          Seus registros sao pessoais e devem ser tratados com respeito e privacidade.
        </div>

        <label>
          Nome
          <input
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            required
          />
        </label>
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
          {loading ? 'Criando...' : 'Criar cadastro'}
        </button>

        <p className="auth-switch">
          Ja tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </main>
  )
}

export default Cadastro

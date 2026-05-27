import { signOut } from 'firebase/auth'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { auth } from '../firebase/config'
import { traduzirErroFirebase } from '../firebase/errors'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

function Navbar() {
  const navigate = useNavigate()
  const { user, profile, isAdmin } = useAuth()
  const { notify } = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function logout() {
    const confirmed = window.confirm(
      'Deseja sair da sua conta? Verifique se seus registros foram salvos antes de continuar.',
    )
    if (!confirmed) return

    setSigningOut(true)
    try {
      if (auth) await signOut(auth)
      notify('Sessão encerrada com segurança.')
      navigate('/', { replace: true })
    } catch (error) {
      notify(traduzirErroFirebase(error), 'error')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <header className={menuOpen ? 'navbar menu-open' : 'navbar'}>
      <Link to="/" className="brand" aria-label="Voz Invisível">
        <span className="brand-mark">VI</span>
        <span>Voz Invisível</span>
      </Link>

      <button
        className="nav-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
        aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        className="nav-links"
        id="main-navigation"
        onClick={() => setMenuOpen(false)}
      >
        {user && !isAdmin && <NavLink to="/dashboard">Meu espaço</NavLink>}
        {user && !isAdmin && <NavLink to="/diario">Diário</NavLink>}
        {user && !isAdmin && <NavLink to="/historico">Histórico</NavLink>}
        {user && isAdmin && <NavLink to="/admin">Painel de gestão</NavLink>}
        {user && <NavLink to="/perfil">Perfil</NavLink>}
        {!user ? (
          <>
            <NavLink to="/login">Login</NavLink>
            <Link className="button primary small" to="/cadastro">
              Cadastro
            </Link>
          </>
        ) : (
          <button
            type="button"
            className="button ghost small"
            disabled={signingOut}
            onClick={logout}
          >
            {signingOut ? 'Saindo...' : 'Sair'}
          </button>
        )}
      </nav>
      {user && (
        <div className="nav-user">
          <span>{profile?.name || user.displayName || 'Pessoa acolhida'}</span>
        </div>
      )}
    </header>
  )
}

export default Navbar

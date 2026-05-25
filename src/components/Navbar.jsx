import { signOut } from 'firebase/auth'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { auth } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'

function Navbar() {
  const navigate = useNavigate()
  const { user, profile, isAdmin } = useAuth()

  async function logout() {
    if (auth) await signOut(auth)
    navigate('/')
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand" aria-label="Voz Invisivel">
        <span className="brand-mark">VI</span>
        <span>Voz Invisivel</span>
      </Link>

      <nav className="nav-links">
        {user && !isAdmin && <NavLink to="/dashboard">Meu espaco</NavLink>}
        {user && !isAdmin && <NavLink to="/diario">Diario</NavLink>}
        {user && !isAdmin && <NavLink to="/historico">Historico</NavLink>}
        {user && isAdmin && <NavLink to="/admin">Painel de gestao</NavLink>}
        {user && <NavLink to="/perfil">Perfil</NavLink>}
        {!user ? (
          <>
            <NavLink to="/login">Login</NavLink>
            <Link className="button primary small" to="/cadastro">
              Cadastro
            </Link>
          </>
        ) : (
          <button type="button" className="button ghost small" onClick={logout}>
            Sair
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

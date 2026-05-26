import { useAuth } from '../hooks/useAuth'

function Perfil() {
  const { user, profile } = useAuth()

  return (
    <main className="app-page">
      <section className="page-heading">
        <span className="eyebrow">Perfil</span>
        <h1>Dados da conta</h1>
        <p>Informações básicas usadas para personalizar a experiência.</p>
      </section>

      <section className="profile-grid">
        <article className="panel">
          <h2>{profile?.name || user.displayName || 'Pessoa acolhida'}</h2>
          <p>{profile?.email || user.email}</p>
          <div className="profile-meta">
            <span>Perfil: {profile?.role || 'jovem'}</span>
            <span>UID: {user.uid}</span>
          </div>
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

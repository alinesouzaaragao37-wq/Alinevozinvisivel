import { useEffect, useMemo, useState } from 'react'
import EmotionalChart from '../components/EmotionalChart'
import StatCard from '../components/StatCard'
import { traduzirErroFirebase } from '../firebase/errors'
import { useAuth } from '../hooks/useAuth'
import {
  getUsersCount,
  listenAdminCollection,
  updateAlertStatus,
} from '../services/emotionalService'

const riskLabels = { baixo: 'baixo', medio: 'médio', alto: 'alto' }

function Admin() {
  const { profile } = useAuth()
  const [logs, setLogs] = useState([])
  const [checkins, setCheckins] = useState([])
  const [alerts, setAlerts] = useState([])
  const [usersCount, setUsersCount] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribers = []

    async function load() {
      try {
        setUsersCount(await getUsersCount())
        unsubscribers.push(
          listenAdminCollection('emotionalLogs', setLogs, (err) =>
            setError(traduzirErroFirebase(err)),
          ),
        )
        unsubscribers.push(
          listenAdminCollection('checkins', setCheckins, (err) =>
            setError(traduzirErroFirebase(err)),
          ),
        )
        unsubscribers.push(
          listenAdminCollection('alerts', setAlerts, (err) =>
            setError(traduzirErroFirebase(err)),
          ),
        )
      } catch (err) {
        setError(err.message)
      }
    }

    load()
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe?.())
  }, [])

  const emotionTop = useMemo(() => {
    if (!checkins.length) return 'Sem dados'
    const counts = checkins.reduce((acc, item) => {
      acc[item.emotion] = (acc[item.emotion] || 0) + 1
      return acc
    }, {})
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
  }, [checkins])

  async function resolveAlert(id) {
    try {
      await updateAlertStatus(id, 'acolhido')
    } catch (err) {
      setError(traduzirErroFirebase(err))
    }
  }

  return (
    <main className="app-page">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">Painel administrativo</span>
          <h1>
            {profile?.role === 'profissional'
              ? 'Acompanhamento profissional.'
              : 'Indicadores para decisão sensível.'}
          </h1>
          <p>
            {profile?.role === 'profissional'
              ? 'Visualize alertas emocionais e registros que exigem acolhimento responsável.'
              : 'Visualize volume de usuários, registros emocionais, emoções mais frequentes e alertas preventivos.'}
          </p>
        </div>
      </section>

      {error && <p className="form-error">{error}</p>}

      <section className="stats-grid">
        <StatCard label="Usuários" value={usersCount} detail="contas criadas" />
        <StatCard label="Check-ins" value={checkins.length} detail="registros emocionais" />
        <StatCard label="Relatos" value={logs.length} detail="analisados por IA" />
        <StatCard label="Alertas" value={alerts.length} detail={emotionTop} tone="warning" />
      </section>

      <section className="admin-grid">
        <section className="panel">
          <div className="panel-heading">
            <span className="eyebrow">Mapa emocional</span>
            <h2>Emoções mais registradas</h2>
          </div>
          <EmotionalChart items={checkins} />
        </section>

        <section className="panel alert-panel">
          <div className="panel-heading">
            <span className="eyebrow">Alertas</span>
            <h2>Sinais emocionais</h2>
          </div>
          {alerts.length === 0 && <p className="empty-state">Nenhum alerta encontrado.</p>}
          {alerts.map((alert) => (
            <article className={`alert-item ${alert.risk}`} key={alert.id}>
              <div>
                <span>Risco {riskLabels[alert.risk] || alert.risk}</span>
                <h3>{alert.userName}</h3>
                <p>{alert.detectedWords?.join(', ') || 'Sem palavra específica'}</p>
              </div>
              <button
                className="button secondary small"
                type="button"
                onClick={() => resolveAlert(alert.id)}
              >
                Acolhido
              </button>
            </article>
          ))}
        </section>
      </section>
    </main>
  )
}

export default Admin

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
const statusLabels = { novo: 'novo', acolhido: 'acolhido' }

function Admin() {
  const { profile } = useAuth()
  const [logs, setLogs] = useState([])
  const [checkins, setCheckins] = useState([])
  const [alerts, setAlerts] = useState([])
  const [usersCount, setUsersCount] = useState(0)
  const [error, setError] = useState('')
  const [riskFilter, setRiskFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')

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

  const filteredAlerts = useMemo(
    () =>
      alerts.filter(
        (alert) =>
          (riskFilter === 'todos' || alert.risk === riskFilter) &&
          (statusFilter === 'todos' || (alert.status || 'novo') === statusFilter),
      ),
    [alerts, riskFilter, statusFilter],
  )

  async function resolveAlert(id) {
    try {
      await updateAlertStatus(id, 'acolhido')
    } catch (err) {
      setError(traduzirErroFirebase(err))
    }
  }

  function exportSummary() {
    const riskCounts = ['baixo', 'medio', 'alto'].map((risk) => [
      `Alertas de risco ${riskLabels[risk]}`,
      alerts.filter((alert) => alert.risk === risk).length,
    ])
    const statusCounts = ['novo', 'acolhido'].map((status) => [
      `Alertas ${statusLabels[status]}s`,
      alerts.filter((alert) => (alert.status || 'novo') === status).length,
    ])
    const rows = [
      ['Indicador', 'Valor'],
      ['Usuários cadastrados', usersCount],
      ['Check-ins', checkins.length],
      ['Relatos analisados', logs.length],
      ['Alertas totais', alerts.length],
      ...riskCounts,
      ...statusCounts,
    ]
    const csv = rows.map((row) => row.join(';')).join('\n')
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `voz-invisivel-resumo-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
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

      <div className="admin-actions">
        <button className="button secondary small" type="button" onClick={exportSummary}>
          Exportar resumo CSV
        </button>
      </div>

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
          <div className="alert-filters" aria-label="Filtros de alertas">
            <label>
              Risco
              <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}>
                <option value="todos">Todos</option>
                <option value="alto">Alto</option>
                <option value="medio">Médio</option>
                <option value="baixo">Baixo</option>
              </select>
            </label>
            <label>
              Situação
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="todos">Todas</option>
                <option value="novo">Novo</option>
                <option value="acolhido">Acolhido</option>
              </select>
            </label>
          </div>
          {filteredAlerts.length === 0 && (
            <p className="empty-state">Nenhum alerta encontrado para os filtros selecionados.</p>
          )}
          {filteredAlerts.map((alert) => (
            <article className={`alert-item ${alert.risk}`} key={alert.id}>
              <div>
                <span>Risco {riskLabels[alert.risk] || alert.risk}</span>
                <h3>{alert.userName}</h3>
                <p>{alert.detectedWords?.join(', ') || 'Sem palavra específica'}</p>
              </div>
              {(alert.status || 'novo') === 'novo' ? (
                <button
                  className="button secondary small"
                  type="button"
                  onClick={() => resolveAlert(alert.id)}
                >
                  Marcar acolhido
                </button>
              ) : (
                <strong className="status-resolved">Acolhido</strong>
              )}
            </article>
          ))}
        </section>
      </section>
    </main>
  )
}

export default Admin

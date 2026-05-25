import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Chatbot from '../components/Chatbot'
import EmotionalChart from '../components/EmotionalChart'
import StatCard from '../components/StatCard'
import { traduzirErroFirebase } from '../firebase/errors'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { listenUserCheckins, listenUserLogs, saveCheckin } from '../services/emotionalService'

const emotions = [
  { id: 'feliz', label: 'Feliz', icon: ':)' },
  { id: 'cansado', label: 'Cansado', icon: 'zZ' },
  { id: 'triste', label: 'Triste', icon: ':(' },
  { id: 'ansioso', label: 'Ansioso', icon: '!' },
  { id: 'sozinho', label: 'Sozinho', icon: 'o' },
  { id: 'motivado', label: 'Motivado', icon: '^' },
  { id: 'sobrecarregado', label: 'Sobrecarregado', icon: '++' },
]

function Dashboard() {
  const { user, profile, isAdmin, firestoreError } = useAuth()
  const { notify } = useToast()
  const [selectedEmotion, setSelectedEmotion] = useState('ansioso')
  const [intensity, setIntensity] = useState(5)
  const [note, setNote] = useState('')
  const [checkins, setCheckins] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (firestoreError) {
      queueMicrotask(() => setError(traduzirErroFirebase(firestoreError)))
      return undefined
    }

    const unsubscribers = []

    try {
      unsubscribers.push(
        listenUserCheckins(user.uid, setCheckins, (err) => setError(traduzirErroFirebase(err))),
      )
      unsubscribers.push(
        listenUserLogs(user.uid, setLogs, (err) => setError(traduzirErroFirebase(err))),
      )
    } catch (err) {
      queueMicrotask(() => setError(err.message))
    }

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe?.())
  }, [user.uid, firestoreError])

  const mostFrequentEmotion = useMemo(() => {
    if (!checkins.length) return 'Sem registros'
    const counts = checkins.reduce((acc, item) => {
      acc[item.emotion] = (acc[item.emotion] || 0) + 1
      return acc
    }, {})
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
  }, [checkins])

  const highRiskCount = logs.filter((log) => log.risk === 'alto').length
  const latest = checkins[0]

  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }

  async function submitCheckin(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await saveCheckin({
        user,
        profile,
        emotion: selectedEmotion,
        intensity: Number(intensity),
        note,
      })
      setNote('')
      notify('Check-in salvo no Firestore.')
    } catch (err) {
      setError(traduzirErroFirebase(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-page">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">Dashboard principal</span>
          <h1>Oi, {profile?.name || user.displayName || 'pessoa acolhida'}.</h1>
          <p>
            Este e seu espaco de acompanhamento emocional. Registre o agora,
            observe padroes e use o diario quando precisar elaborar melhor.
          </p>
        </div>
        <div className="mood-summary">
          <span>Estado atual</span>
          <strong>{latest?.emotion || 'Aguardando check-in'}</strong>
          <small>{latest ? `Intensidade ${latest.intensity}/10` : 'Comece pelo check-in diario'}</small>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label="Check-ins" value={checkins.length} detail="ultimos registros" />
        <StatCard label="Emocao frequente" value={mostFrequentEmotion} detail="baseado no historico" />
        <StatCard label="Diario" value={logs.length} detail="relatos analisados por IA" />
        <StatCard label="Alertas altos" value={highRiskCount} detail="sinais preventivos" tone="danger" />
      </section>

      <section className="dashboard-grid">
        <form className="panel checkin-panel" onSubmit={submitCheckin}>
          <div className="panel-heading">
            <span className="eyebrow">Check-in diario</span>
            <h2>Como voce esta hoje?</h2>
          </div>
          <div className="emotion-picker">
            {emotions.map((emotion) => (
              <button
                className={selectedEmotion === emotion.id ? 'emotion active' : 'emotion'}
                key={emotion.id}
                type="button"
                onClick={() => setSelectedEmotion(emotion.id)}
              >
                <span>{emotion.icon}</span>
                {emotion.label}
              </button>
            ))}
          </div>
          <label>
            Intensidade
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(event) => setIntensity(event.target.value)}
            />
            <small>{intensity}/10</small>
          </label>
          <label>
            Observacao opcional
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Uma frase curta sobre o dia..."
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="button primary full" type="submit" disabled={loading || !!firestoreError}>
            {loading ? 'Salvando...' : 'Salvar check-in'}
          </button>
        </form>

        <section className="panel">
          <div className="panel-heading">
            <span className="eyebrow">Evolucao emocional</span>
            <h2>Frequencia recente</h2>
          </div>
          <EmotionalChart items={checkins} />
        </section>
      </section>

      <Chatbot />
    </main>
  )
}

export default Dashboard

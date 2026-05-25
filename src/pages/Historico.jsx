import { useEffect, useMemo, useState } from 'react'
import EmotionalChart from '../components/EmotionalChart'
import { traduzirErroFirebase } from '../firebase/errors'
import { useAuth } from '../hooks/useAuth'
import { listenUserCheckins, listenUserLogs } from '../services/emotionalService'

function Historico() {
  const { user, firestoreError } = useAuth()
  const [checkins, setCheckins] = useState([])
  const [logs, setLogs] = useState([])
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

  const timeline = useMemo(
    () =>
      [
        ...checkins.map((item) => ({ ...item, type: 'Check-in' })),
        ...logs.map((item) => ({ ...item, type: 'Diario' })),
      ].sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt)),
    [checkins, logs],
  )

  return (
    <main className="app-page">
      <section className="page-heading">
        <span className="eyebrow">Historico emocional</span>
        <h1>Sua evolucao recente.</h1>
        <p>Veja ultimos registros, emocoes mais frequentes e analises da IA.</p>
      </section>

      {error && <p className="form-error">{error}</p>}

      <section className="history-layout">
        <section className="panel">
          <div className="panel-heading">
            <span className="eyebrow">Grafico simples</span>
            <h2>Emocoes frequentes</h2>
          </div>
          <EmotionalChart items={checkins} />
        </section>

        <section className="panel timeline-panel">
          <div className="panel-heading">
            <span className="eyebrow">Linha do tempo</span>
            <h2>Ultimos registros</h2>
          </div>
          {timeline.length === 0 && <p className="empty-state">Nenhum registro ainda.</p>}
          {timeline.map((item) => (
            <article className="timeline-item" key={`${item.type}-${item.id}`}>
              <span>{item.type}</span>
              <h3>{item.emotion || `Risco ${item.risk}`}</h3>
              <p>{item.note || item.supportiveMessage || item.text}</p>
              <small>{formatDate(item.createdAt)}</small>
            </article>
          ))}
        </section>
      </section>
    </main>
  )
}

function getTime(date) {
  return date?.toDate ? date.toDate().getTime() : 0
}

function formatDate(date) {
  if (!date?.toDate) return 'Agora'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date.toDate())
}

export default Historico

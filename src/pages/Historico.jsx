import { useEffect, useMemo, useState } from 'react'
import EmotionalChart from '../components/EmotionalChart'
import { cloudFirestoreEnabled } from '../firebase/config'
import { traduzirErroFirebase } from '../firebase/errors'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import {
  deletePersonalRecord,
  listenUserCheckins,
  listenUserLogs,
  updatePersonalRecord,
} from '../services/emotionalService'

const emotions = ['feliz', 'cansado', 'triste', 'ansioso', 'sozinho', 'motivado', 'sobrecarregado']

function Historico() {
  const { user, firestoreError } = useAuth()
  const { notify } = useToast()
  const [checkins, setCheckins] = useState([])
  const [logs, setLogs] = useState([])
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [typeFilter, setTypeFilter] = useState('todos')

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
        ...logs.map((item) => ({ ...item, type: 'Diário' })),
      ]
        .sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt))
        .filter((item) => typeFilter === 'todos' || item.type === typeFilter),
    [checkins, logs, typeFilter],
  )

  function beginEdit(item) {
    setEditing({
      id: item.id,
      type: item.type,
      emotion: item.emotion,
      intensity: item.intensity || 5,
      note: item.note || '',
      text: item.text || '',
    })
    setError('')
  }

  async function saveEdit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      await updatePersonalRecord({ ...editing, user })
      setEditing(null)
      notify('Registro atualizado com sucesso.')
    } catch (err) {
      setError(traduzirErroFirebase(err))
    } finally {
      setSaving(false)
    }
  }

  async function removeRecord(item) {
    const confirmed = window.confirm(
      `Excluir este ${item.type === 'Check-in' ? 'check-in' : 'relato'}? Esta ação não poderá ser desfeita.`,
    )
    if (!confirmed) return

    setError('')
    try {
      await deletePersonalRecord({ type: item.type, id: item.id, userId: user.uid })
      if (editing?.id === item.id) {
        setEditing(null)
      }
      notify('Registro excluído com sucesso.')
    } catch (err) {
      setError(traduzirErroFirebase(err))
    }
  }

  return (
    <main className="app-page">
      <section className="page-heading">
        <span className="eyebrow">Histórico emocional</span>
        <h1>Sua evolução recente.</h1>
        <p>Veja últimos registros, emoções mais frequentes e análises preventivas.</p>
      </section>

      {error && <p className="form-error">{error}</p>}
      {!cloudFirestoreEnabled && (
        <p className="notice">
          Modo local ativo: este histórico reúne os registros salvos neste navegador.
        </p>
      )}

      <section className="history-layout">
        <section className="panel">
          <div className="panel-heading">
            <span className="eyebrow">Gráfico simples</span>
            <h2>Emoções frequentes</h2>
          </div>
          <EmotionalChart items={checkins} />
        </section>

        <section className="panel timeline-panel">
          <div className="panel-heading">
            <span className="eyebrow">Linha do tempo</span>
            <h2>Últimos registros</h2>
          </div>
          <div className="history-filters">
            <label>
              Tipo de registro
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="todos">Todos</option>
                <option value="Check-in">Check-ins</option>
                <option value="Diário">Diário</option>
              </select>
            </label>
          </div>
          {timeline.length === 0 && (
            <div className="empty-state warm">
              <strong>{typeFilter === 'todos' ? 'Sua jornada pode começar hoje.' : 'Nenhum registro neste filtro.'}</strong>
              <p>{typeFilter === 'todos' ? 'Faça um check-in quando estiver pronto. Cada registro ajuda a perceber seus caminhos.' : 'Selecione outro tipo para consultar sua linha do tempo.'}</p>
            </div>
          )}
          {timeline.map((item) => (
            <article className="timeline-item" key={`${item.type}-${item.id}`}>
              {editing?.id === item.id ? (
                <form className="timeline-edit" onSubmit={saveEdit}>
                  <strong>Editar {item.type === 'Check-in' ? 'check-in' : 'relato'}</strong>
                  <label>
                    Emoção
                    <select
                      value={editing.emotion}
                      onChange={(event) =>
                        setEditing((current) => ({ ...current, emotion: event.target.value }))
                      }
                    >
                      {emotions.map((emotion) => (
                        <option key={emotion} value={emotion}>{emotion}</option>
                      ))}
                    </select>
                  </label>
                  {item.type === 'Check-in' ? (
                    <>
                      <label>
                        Intensidade
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={editing.intensity}
                          onChange={(event) =>
                            setEditing((current) => ({ ...current, intensity: event.target.value }))
                          }
                        />
                        <small>{editing.intensity}/10</small>
                      </label>
                      <label>
                        Observação
                        <textarea
                          value={editing.note}
                          onChange={(event) =>
                            setEditing((current) => ({ ...current, note: event.target.value }))
                          }
                        />
                      </label>
                    </>
                  ) : (
                    <label>
                      Relato
                      <textarea
                        required
                        minLength={12}
                        value={editing.text}
                        onChange={(event) =>
                          setEditing((current) => ({ ...current, text: event.target.value }))
                        }
                      />
                    </label>
                  )}
                  <div className="timeline-actions">
                    <button className="button primary small" type="submit" disabled={saving}>
                      {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      className="button ghost small"
                      type="button"
                      onClick={() => setEditing(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <span>{item.type}</span>
                  <h3>{item.emotion || `Risco ${item.risk}`}</h3>
                  <p>{item.note || item.supportiveMessage || item.text}</p>
                  <small>{formatDate(item.createdAt)}</small>
                  <div className="timeline-actions">
                    <button className="button secondary small" type="button" onClick={() => beginEdit(item)}>
                      Editar
                    </button>
                    <button className="button danger small" type="button" onClick={() => removeRecord(item)}>
                      Excluir
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </section>
      </section>
    </main>
  )
}

function getTime(date) {
  return date?.toDate ? date.toDate().getTime() : new Date(date || 0).getTime()
}

function formatDate(date) {
  const value = date?.toDate ? date.toDate() : new Date(date)
  if (Number.isNaN(value.getTime())) return 'Agora'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value)
}

export default Historico

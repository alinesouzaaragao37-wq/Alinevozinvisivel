import { useState } from 'react'
import CareBanner from '../components/CareBanner'
import { traduzirErroFirebase } from '../firebase/errors'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { saveDiaryEntry } from '../services/emotionalService'

const emotions = ['feliz', 'cansado', 'triste', 'ansioso', 'sozinho', 'motivado', 'sobrecarregado']

function Diario() {
  const { user, profile, firestoreError } = useAuth()
  const { notify } = useToast()
  const [text, setText] = useState('')
  const [emotion, setEmotion] = useState('triste')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const firestoreMessage = firestoreError ? traduzirErroFirebase(firestoreError) : ''

  async function submit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const saved = await saveDiaryEntry({ user, profile, text, emotion })
      setResult(saved.analysis)
      setText('')
      notify('Relato analisado e salvo com seguranca.')
    } catch (err) {
      setError(traduzirErroFirebase(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-page">
      <section className="page-heading">
        <span className="eyebrow">Diario emocional</span>
        <h1>Escreva com suas palavras.</h1>
        <p>
          A IA textual procura sinais preventivos e devolve uma mensagem de
          acolhimento. Esta analise nao substitui atendimento profissional.
        </p>
      </section>

      <CareBanner compact />

      <section className="diary-layout">
        <form className="panel diary-form" onSubmit={submit}>
          <p className="form-intro">
            Este espaco e seu. Escreva no seu ritmo; nao ha jeito certo de
            explicar um sentimento.
          </p>
          <label>
            Emocao principal
            <select value={emotion} onChange={(event) => setEmotion(event.target.value)}>
              {emotions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            Relato
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              minLength={12}
              required
              placeholder="Ex.: Hoje estou me sentindo sozinho..."
            />
          </label>
          {(error || firestoreMessage) && <p className="form-error">{error || firestoreMessage}</p>}
          <button className="button primary full" type="submit" disabled={loading || !!firestoreError}>
            {loading ? 'Analisando...' : 'Analisar e salvar'}
          </button>
        </form>

        <aside className="panel ai-panel">
          <span className="eyebrow">Devolutiva cuidadosa</span>
          <h2>Uma leitura para apoiar seus proximos passos</h2>
          <p>
            O motor local avalia palavras-chave como sozinho, cansado,
            ansiedade, vazio, desaparecer e desistir. Depois soma o contexto da
            emocao escolhida e classifica o risco em baixo, medio ou alto.
          </p>
          {result && (
            <div className={`analysis-card ${result.risk}`}>
              <span>Risco {result.risk}</span>
              <h3>{result.supportiveMessage}</h3>
              <p>{result.recommendation}</p>
              {result.detectedWords.length > 0 && (
                <small>Sinais detectados: {result.detectedWords.join(', ')}</small>
              )}
            </div>
          )}
        </aside>
      </section>
    </main>
  )
}

export default Diario

import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db, hasFirebaseConfig } from '../firebase/config'
import { traduzirErroFirebase } from '../firebase/errors'
import { analisarRelato } from '../services/analisarRelato'

const humores = ['feliz', 'neutro', 'triste', 'ansioso', 'com medo', 'sobrecarregado']

function Cidadao({ usuario, perfil }) {
  const [texto, setTexto] = useState('')
  const [humor, setHumor] = useState('neutro')
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function enviarRelato(event) {
    event.preventDefault()
    setErro('')
    setCarregando(true)

    const analise = analisarRelato(texto, humor)

    if (!hasFirebaseConfig || !db) {
      setErro('Analise gerada em modo demonstracao. Configure o Firebase para salvar.')
      setResultado(analise)
      setTexto('')
      setHumor('neutro')
      setCarregando(false)
      return
    }

    try {
      await addDoc(collection(db, 'relatos'), {
        uid: usuario.uid,
        nomeUsuario: perfil?.nome || usuario.displayName || 'Cidadao',
        texto,
        humor,
        nivelRisco: analise.nivelRisco,
        pontuacao: analise.pontuacao,
        palavrasDetectadas: analise.palavrasDetectadas,
        mensagemAcolhimento: analise.mensagemAcolhimento,
        recomendacao: analise.recomendacao,
        status: 'novo',
        dataCriacao: serverTimestamp(),
      })

      setResultado(analise)
      setTexto('')
      setHumor('neutro')
    } catch (error) {
      setErro(traduzirErroFirebase(error))
      setResultado(analise)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="citizen-page">
      <section className="page-heading">
        <span className="eyebrow">Espaco de escuta</span>
        <h1>Como voce esta se sentindo hoje?</h1>
        <p>
          Escreva com suas palavras. O sistema faz uma triagem inicial e orienta
          caminhos de apoio sem substituir atendimento profissional.
        </p>
      </section>

      <section className="citizen-layout">
        <form className="relato-form" onSubmit={enviarRelato}>
          <label>
            Seu relato
            <textarea
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
              minLength={12}
              required
              placeholder="Conte brevemente o que voce esta sentindo..."
            />
          </label>

          <label>
            Humor do dia
            <select value={humor} onChange={(event) => setHumor(event.target.value)}>
              {humores.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          {erro && <p className="form-error">{erro}</p>}

          <button className="button primary full" type="submit" disabled={carregando}>
            {carregando ? 'Enviando...' : 'Enviar relato'}
          </button>
        </form>

        <aside className="support-card">
          <h2>Orientacao segura</h2>
          <p>
            Seus dados devem ser usados apenas para apoio e triagem. Se voce
            estiver em perigo imediato, procure ajuda urgente, servicos locais de
            emergencia ou alguem de confianca agora.
          </p>
          <p>
            Acolhimento humano importa. Uma conversa com um familiar, professor,
            amigo, unidade de saude ou servico social pode ser o primeiro passo.
          </p>
        </aside>
      </section>

      {resultado && (
        <section className={`result-card risco-${resultado.nivelRisco}`}>
          <span className={`risk-pill ${resultado.nivelRisco}`}>
            risco {resultado.nivelRisco}
          </span>
          <h2>{resultado.mensagemAcolhimento}</h2>
          <p>{resultado.recomendacao}</p>
          {resultado.palavrasDetectadas.length > 0 && (
            <p className="detected">
              Sinais observados: {resultado.palavrasDetectadas.join(', ')}
            </p>
          )}
        </section>
      )}
    </main>
  )
}

export default Cidadao

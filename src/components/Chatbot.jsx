import { useMemo, useState } from 'react'

const quickReplies = {
  ansiedade:
    'Respira comigo por alguns segundos. Voce pode nomear uma coisa que esta sentindo e uma coisa pequena que esta ao seu alcance agora?',
  sozinho:
    'Sentir-se sozinho pesa muito. Talvez uma mensagem simples para alguem de confianca ja abra uma fresta de apoio.',
  cansado:
    'Cansaco emocional tambem e sinal. Pausar, beber agua e reduzir uma exigencia do dia pode ser um primeiro cuidado.',
  ajuda:
    'Pedir ajuda nao diminui voce. Em risco imediato, procure emergencia, unidade de saude ou alguem proximo agora.',
}

const prompts = [
  { label: 'Estou ansioso', text: 'Estou com ansiedade hoje.' },
  { label: 'Me sinto sozinho', text: 'Estou me sentindo sozinho.' },
  { label: 'Estou cansado', text: 'Estou cansado emocionalmente.' },
  { label: 'Preciso de ajuda', text: 'Preciso de ajuda agora.' },
]

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: 'Oi. Eu sou o assistente de acolhimento da Voz Invisivel. Posso te ajudar a organizar o que voce esta sentindo.',
    },
  ])
  const [text, setText] = useState('')

  const suggestion = useMemo(() => {
    const normalized = text.toLowerCase()
    return (
      Object.entries(quickReplies).find(([key]) => normalized.includes(key))?.[1] ||
      'Obrigado por dividir isso. O que voce sente faz sentido e merece cuidado. Tente escrever uma frase sobre o que mais pesou hoje.'
    )
  }, [text])

  function send(event) {
    event.preventDefault()
    if (!text.trim()) return

    setMessages((current) => [
      ...current,
      { from: 'user', text },
      { from: 'bot', text: suggestion },
    ])
    setText('')
  }

  return (
    <section className="chatbot panel">
      <div className="panel-heading">
        <span className="eyebrow">Chat acolhedor</span>
        <h2>Eu estou aqui para te escutar.</h2>
        <p>Escolha uma frase para comecar ou escreva do seu jeito.</p>
      </div>
      <div className="chat-prompts" aria-label="Sugestoes de conversa">
        {prompts.map((prompt) => (
          <button key={prompt.label} onClick={() => setText(prompt.text)} type="button">
            {prompt.label}
          </button>
        ))}
      </div>
      <div className="chat-window">
        {messages.map((message, index) => (
          <p className={`chat-message ${message.from}`} key={`${message.from}-${index}`}>
            {message.text}
          </p>
        ))}
      </div>
      <form className="chat-form" onSubmit={send}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Escreva uma palavra ou sentimento..."
        />
        <button className="button primary" type="submit">
          Enviar
        </button>
      </form>
      <p className="chat-help">
        Se voce estiver em risco imediato, busque ajuda presencial agora. No Brasil,
        o CVV atende gratuitamente pelo 188, 24 horas por dia.
      </p>
    </section>
  )
}

export default Chatbot

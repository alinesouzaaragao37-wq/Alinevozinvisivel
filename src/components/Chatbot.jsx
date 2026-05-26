import { useState } from 'react'
import { getChatReply } from '../services/chatService'

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
      text: 'Oi. Eu sou o assistente de acolhimento da Voz Invisível. Posso te ajudar a organizar o que você está sentindo.',
    },
  ])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function send(event) {
    event.preventDefault()
    const content = text.trim()
    if (!content || sending) return

    const conversation = [...messages, { from: 'user', text: content }]
    setMessages(conversation)
    setText('')
    setError('')
    setSending(true)

    try {
      const result = await getChatReply(conversation)
      setMessages((current) => [...current, { from: 'bot', text: result.reply }])
    } catch {
      setError(
        'Não consegui responder agora. Tente novamente em instantes ou procure apoio humano se precisar.',
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="chatbot panel">
      <div className="panel-heading">
        <span className="eyebrow">Chat acolhedor</span>
        <h2>Eu estou aqui para te escutar.</h2>
        <p>Escolha uma frase para começar ou escreva do seu jeito.</p>
      </div>
      <div className="chat-prompts" aria-label="Sugestões de conversa">
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
        {sending && <p className="chat-message bot typing">Pensando em uma resposta cuidadosa...</p>}
      </div>
      <form className="chat-form" onSubmit={send}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Conte um pouco do que você está sentindo..."
          disabled={sending}
        />
        <button className="button primary" type="submit" disabled={sending || !text.trim()}>
          {sending ? 'Respondendo...' : 'Enviar'}
        </button>
      </form>
      {error && <p className="form-error">{error}</p>}
      <p className="chat-help">
        Suas mensagens são processadas por inteligência artificial para responder à conversa.
        Evite compartilhar dados pessoais.{' '}
        Se você estiver em risco imediato, busque ajuda presencial agora. No Brasil,
        o CVV atende gratuitamente pelo 188, 24 horas por dia.
      </p>
    </section>
  )
}

export default Chatbot

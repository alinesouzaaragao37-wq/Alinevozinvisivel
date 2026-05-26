import { getFunctions, httpsCallable } from 'firebase/functions'
import { app, hasFirebaseConfig } from '../firebase/config'
import { analisarRelato } from './analisarRelato'

const cloudChatEnabled =
  hasFirebaseConfig && import.meta.env.VITE_FIREBASE_USE_AI_CHAT === 'true'
const functions = app && cloudChatEnabled ? getFunctions(app, 'southamerica-east1') : null
const respondToChat = functions ? httpsCallable(functions, 'respondToChat') : null

const crisisReply =
  'Sinto muito que isso esteja pesando assim. Sua segurança vem primeiro agora: procure uma pessoa de confiança que possa ficar com você, uma unidade de saúde ou o serviço de emergência local. No Brasil, você pode ligar gratuitamente para o CVV no 188, 24 horas por dia.'

export async function getChatReply(messages) {
  const latest = messages[messages.length - 1]?.text || ''
  const analysis = analisarRelato(latest, 'cansado')

  if (analysis.risk === 'alto') {
    return { reply: crisisReply, urgent: true }
  }

  if (!cloudChatEnabled || !respondToChat) {
    return {
      reply: `${analysis.supportiveMessage} ${analysis.recommendation}`,
      urgent: false,
    }
  }

  const history = messages
    .slice(-8)
    .filter((message) => message.from === 'user' || message.from === 'bot')
    .map((message) => ({
      role: message.from === 'bot' ? 'assistant' : 'user',
      content: String(message.text).slice(0, 1200),
    }))

  const result = await respondToChat({ history })
  return result.data
}

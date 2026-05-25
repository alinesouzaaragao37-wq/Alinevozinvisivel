import { getFunctions, httpsCallable } from 'firebase/functions'
import { app, hasFirebaseConfig } from '../firebase/config'
import { analisarRelato } from './analisarRelato'

const functions = app ? getFunctions(app, 'southamerica-east1') : null
const respondToChat = functions ? httpsCallable(functions, 'respondToChat') : null

const crisisReply =
  'Sinto muito que isso esteja pesando assim. Sua seguranca vem primeiro agora: procure uma pessoa de confianca que possa ficar com voce, uma unidade de saude ou o servico de emergencia local. No Brasil, voce pode ligar gratuitamente para o CVV no 188, 24 horas por dia.'

export async function getChatReply(messages) {
  if (!hasFirebaseConfig || !respondToChat) {
    throw new Error('O assistente ainda nao esta configurado.')
  }

  const latest = messages[messages.length - 1]?.text || ''
  if (analisarRelato(latest, 'cansado').risk === 'alto') {
    return { reply: crisisReply, urgent: true }
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

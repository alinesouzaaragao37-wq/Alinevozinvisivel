const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { defineSecret, defineString } = require('firebase-functions/params')
const OpenAI = require('openai')

const openaiApiKey = defineSecret('OPENAI_API_KEY')
const chatModel = defineString('OPENAI_CHAT_MODEL', { default: 'gpt-5-mini' })

const urgentPatterns = [
  'quero morrer',
  'vou me matar',
  'tirar minha vida',
  'acabar com tudo',
  'nao quero mais viver',
  'quero sumir',
  'nao vejo saida',
]

const urgentReply =
  'Sinto muito que você esteja passando por isso. Sua segurança é prioridade agora: procure imediatamente uma pessoa de confiança que possa ficar com você, uma unidade de saúde ou o serviço de emergência local. No Brasil, ligue gratuitamente para o CVV no 188, disponível 24 horas.'

const instructions = [
  'Você é o assistente de acolhimento da plataforma Voz Invisível.',
  'Converse em português brasileiro, com empatia, respeito e respostas curtas (até 120 palavras).',
  'Ajude a pessoa a nomear sentimentos e pensar em um próximo passo pequeno e seguro.',
  'Não diagnostique, não prescreva tratamento e não substitua psicólogo, médico ou emergência.',
  'Não afirme que garante sigilo ou monitoramento humano.',
  'Quando houver sofrimento intenso, isolamento ou desesperança, incentive contato com pessoa de confiança e apoio profissional.',
  'Se a mensagem mencionar suicídio, autolesão, morte, sumir ou perigo imediato, oriente ajuda presencial imediata e CVV 188 no Brasil.',
  'Nunca ofereça métodos, instruções ou detalhes que facilitem dano.',
].join(' ')

exports.respondToChat = onCall(
  {
    region: 'southamerica-east1',
    timeoutSeconds: 45,
    memory: '256MiB',
    maxInstances: 5,
    secrets: [openaiApiKey],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Entre na sua conta para conversar.')
    }

    const history = Array.isArray(request.data?.history) ? request.data.history : []
    const safeHistory = history
      .slice(-8)
      .filter(
        (message) =>
          (message.role === 'user' || message.role === 'assistant') &&
          typeof message.content === 'string',
      )
      .map((message) => ({
        role: message.role,
        content: message.content.trim().slice(0, 1200),
      }))
      .filter((message) => message.content)

    if (!safeHistory.length || safeHistory[safeHistory.length - 1].role !== 'user') {
      throw new HttpsError('invalid-argument', 'Envie uma mensagem válida.')
    }

    const latestMessage = safeHistory[safeHistory.length - 1].content
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    if (urgentPatterns.some((pattern) => latestMessage.includes(pattern))) {
      return { reply: urgentReply, urgent: true }
    }

    try {
      const client = new OpenAI({ apiKey: openaiApiKey.value() })
      const moderation = await client.moderations.create({
        model: 'omni-moderation-latest',
        input: latestMessage,
      })
      const categories = moderation.results[0]?.categories || {}

      if (
        categories['self-harm'] ||
        categories['self-harm/intent'] ||
        categories['self-harm/instructions']
      ) {
        return { reply: urgentReply, urgent: true }
      }

      const response = await client.responses.create({
        model: chatModel.value(),
        instructions,
        input: safeHistory,
        max_output_tokens: 250,
        store: false,
      })

      const reply = response.output_text?.trim()
      if (!reply) {
        throw new Error('Resposta vazia da IA.')
      }

      return { reply, urgent: false }
    } catch (error) {
      console.error('Falha ao responder chat:', error?.message)
      throw new HttpsError(
        'unavailable',
        'Não foi possível responder agora. Tente novamente em instantes.',
      )
    }
  },
)

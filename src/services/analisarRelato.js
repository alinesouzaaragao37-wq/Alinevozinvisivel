const keywordGroups = [
  {
    level: 'alto',
    weight: 5,
    words: [
      'desaparecer',
      'desistir',
      'nao aguento mais',
      'nao vejo saida',
      'quero sumir',
      'sumir',
      'sem saida',
      'morrer',
      'acabar com tudo',
    ],
  },
  {
    level: 'medio',
    weight: 3,
    words: [
      'sozinho',
      'sozinha',
      'ninguem me entende',
      'ninguem liga',
      'vazio',
      'tristeza',
      'medo',
      'ansiedade',
      'cansado emocionalmente',
      'sobrecarregado',
    ],
  },
  {
    level: 'baixo',
    weight: 1,
    words: ['cansado', 'triste', 'confuso', 'preocupado', 'dificil', 'chorei'],
  },
]

const emotionScore = {
  feliz: 0,
  motivado: 0,
  cansado: 1,
  triste: 2,
  ansioso: 2,
  sozinho: 3,
  sobrecarregado: 3,
}

export function analisarRelato(text = '', emotion = 'cansado') {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

  const matches = keywordGroups.flatMap((group) =>
    group.words
      .filter((word) => normalized.includes(word))
      .map((word) => ({ word, level: group.level, weight: group.weight })),
  )

  const score =
    matches.reduce((total, match) => total + match.weight, 0) +
    (emotionScore[emotion] || 0) +
    (normalized.length > 220 ? 1 : 0)

  let risk = 'baixo'
  if (score >= 8 || matches.some((match) => match.level === 'alto')) {
    risk = 'alto'
  } else if (score >= 4) {
    risk = 'medio'
  }

  const messages = {
    baixo:
      'Obrigado por confiar esse registro a voce mesmo. Perceber o que sente ja e uma forma de cuidado.',
    medio:
      'Voce nao esta sozinho. O que apareceu no texto merece atencao e pode ficar mais leve quando compartilhado com alguem seguro.',
    alto:
      'Seu relato indica sofrimento importante. Buscar ajuda tambem e um ato de coragem; procure uma pessoa de confianca ou um servico de apoio agora.',
  }

  const recommendations = {
    baixo:
      'Continue acompanhando seus sentimentos e tente repetir o check-in amanha.',
    medio:
      'Considere conversar com familiar, professor, unidade de saude, servico social ou alguem de confianca ainda hoje.',
    alto:
      'Se houver risco imediato, procure emergencia, unidade de saude, CVV 188 no Brasil ou alguem proximo que possa ficar com voce.',
  }

  return {
    risk,
    score,
    detectedWords: matches.map((match) => match.word),
    supportiveMessage: messages[risk],
    recommendation: recommendations[risk],
  }
}

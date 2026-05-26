# Voz Invisível

MVP full stack em React, Vite e Firebase para sensibilidade pública, acolhimento emocional e prevenção social. O projeto foi pensado para o programa **Do Piauí para o Mundo**, eixo **Novas Tecnologias para Cidadãos, Indústrias e Governos**.

## Problema que enfrentamos

Muitos jovens passam por ansiedade, isolamento, sobrecarga emocional ou pensamentos de desistir sem encontrar um canal simples e reservado para registrar o que estão sentindo. Quando os sinais aparecem apenas em conversas informais ou quando a situação já se agravou, escolas, famílias e redes de apoio perdem tempo valioso para acolher e orientar.

O problema não é substituir atendimento profissional por tecnologia. É reduzir o silêncio entre o primeiro sinal de sofrimento e a chegada de ajuda humana qualificada. Para isso, é necessário oferecer escuta inicial acessível, acompanhar mudanças emocionais ao longo do tempo e destacar situações que merecem atenção responsável.

O **Voz Invisível** nasce para apoiar esse percurso: a pessoa pode registrar emoção e relatos em ambiente protegido, receber orientação acolhedora e permitir que profissionais ou gestores autorizados observem alertas preventivos, sempre respeitando privacidade e limites éticos.

## O que o MVP entrega

- Home moderna com proposta de impacto social.
- Cadastro, login, login com Google, logout e persistência de sessão via Firebase Authentication.
- Dashboard do jovem com check-in emocional diário.
- Diário emocional com IA textual simples baseada em palavras-chave.
- Classificação preventiva de risco: baixo, médio e alto.
- Chatbot acolhedor com respostas reais geradas por IA em backend protegido.
- Histórico com últimos registros, emoções frequentes e gráfico simples.
- Perfil do usuário.
- Painel administrativo com usuários, check-ins, relatos, emoções frequentes e alertas.
- Firestore organizado em `users`, `checkins`, `emotionalLogs` e `alerts`.
- Rotas protegidas, loading screen, notificações e layout responsivo.

## Instalar e rodar

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

No Windows, se o PowerShell bloquear `npm.ps1`, use:

```bash
npm.cmd run dev
npm.cmd run build
```

## Configurar Firebase

1. Acesse o Console do Firebase e crie um projeto.
2. Ative **Authentication** com os provedores **Email/senha** e **Google**.
3. Crie um **Cloud Firestore Database**.
4. Copie `.env.example` para `.env`.
5. Preencha as variáveis:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_USE_FIRESTORE=true
```

6. Publique as regras:

```bash
firebase login
firebase use --add
firebase deploy --only firestore:rules,firestore:indexes
```

Enquanto o banco ainda não tiver sido criado, mantenha
`VITE_FIREBASE_USE_FIRESTORE=false`. Nesse modo, autenticação continua no
Firebase e os registros ficam somente no navegador, sem sincronização em
nuvem. Depois de criar o Firestore e publicar as regras, altere para `true`.

## Configurar chatbot com IA real

O chatbot usa uma **Firebase Cloud Function** para manter a chave da OpenAI fora do navegador. A conversa exige usuário autenticado e contém proteção imediata local e moderação de mensagens relacionadas a autolesão antes de gerar respostas.

1. No projeto Firebase `voz-invisivel-3ed80`, habilite Cloud Functions. A publicação de funções normalmente requer o plano Blaze.
2. Instale as dependências do backend:

```bash
npm install --prefix functions
```

3. Com o Firebase CLI autenticado, cadastre a chave da OpenAI como segredo:

```bash
firebase functions:secrets:set OPENAI_API_KEY --project voz-invisivel-3ed80
```

4. Publique a função:

```bash
firebase deploy --only functions:respondToChat --project voz-invisivel-3ed80
```

O modelo padrão é `gpt-5-mini`; ele pode ser alterado no parâmetro `OPENAI_CHAT_MODEL` durante a publicação. Nunca coloque `OPENAI_API_KEY` no arquivo `.env` do frontend.

## Estrutura Firestore

### `users`

Perfil básico do usuário autenticado.

```js
{
  uid,
  name,
  email,
  role: 'jovem' | 'profissional' | 'gestor' | 'admin',
  createdAt,
  updatedAt
}
```

### `checkins`

Check-ins emocionais diários.

```js
{
  userId,
  userName,
  emotion,
  intensity,
  note,
  createdAt
}
```

### `emotionalLogs`

Relatos livres do diário emocional com resultado da IA textual.

```js
{
  userId,
  userName,
  text,
  emotion,
  risk,
  score,
  detectedWords,
  supportiveMessage,
  recommendation,
  status,
  createdAt
}
```

### `alerts`

Alertas criados automaticamente quando o risco é médio ou alto.

```js
{
  logId,
  userId,
  userName,
  risk,
  score,
  detectedWords,
  status,
  createdAt
}
```

## Lógica da IA textual

A IA do MVP está em `src/services/analisarRelato.js`. Ela normaliza o texto, remove acentos, busca palavras-chave e soma uma pontuação de risco.

Palavras e expressões de alto peso incluem:

- `desaparecer`
- `desistir`
- `nao aguento mais`
- `nao vejo saida`
- `quero sumir`

Palavras de atenção média incluem:

- `sozinho`
- `ninguem me entende`
- `vazio`
- `ansiedade`
- `sobrecarregado`

O resultado gera:

- `risk`: `baixo`, `medio` ou `alto` (valores internos usados pelo sistema)
- `score`: pontuação numérica
- `detectedWords`: sinais encontrados
- `supportiveMessage`: mensagem acolhedora
- `recommendation`: orientação segura

## Estrutura do código

```txt
src/
  components/       componentes reutilizáveis
  context/          providers globais
  firebase/         configuração e erros Firebase
  hooks/            hooks de auth e notificação
  pages/            Home, Login, Cadastro, Dashboard, Diario, Historico, Perfil, Admin
  services/         autenticação, Firestore e IA textual
  index.css         design system responsivo do MVP
functions/
  index.js          chatbot real via OpenAI em Cloud Functions
```

## Deploy

Para publicar em Firebase Hosting, atualize `firebase.json` com Hosting ou use:

```bash
firebase init hosting
npm run build
firebase deploy --only hosting,firestore:rules,firestore:indexes,functions
```

Configuração recomendada:

```json
{
  "firestore": {
    "rules": "firestore.rules"
  },
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

## Aviso ético

Este MVP não substitui psicólogos, médicos, assistentes sociais ou serviços de emergência. Ele serve como ferramenta de registro, triagem inicial e apoio a rotas de cuidado. Em risco imediato, procure emergência, unidade de saúde, CVV 188 no Brasil ou uma pessoa de confiança.

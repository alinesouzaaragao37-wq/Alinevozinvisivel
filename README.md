# Voz Invisivel

MVP full stack em React, Vite e Firebase para sensibilidade publica, acolhimento emocional e prevencao social. O projeto foi pensado para o programa **Do Piaui para o Mundo**, eixo **Novas Tecnologias para Cidadaos, Industrias e Governos**.

## O que o MVP entrega

- Home moderna com proposta de impacto social.
- Cadastro, login, login com Google, logout e persistencia de sessao via Firebase Authentication.
- Dashboard do jovem com check-in emocional diario.
- Diario emocional com IA textual simples baseada em palavras-chave.
- Classificacao preventiva de risco: baixo, medio e alto.
- Chatbot acolhedor com respostas humanizadas.
- Historico com ultimos registros, emocoes frequentes e grafico simples.
- Perfil do usuario.
- Painel administrativo com usuarios, check-ins, relatos, emocoes frequentes e alertas.
- Firestore organizado em `users`, `checkins`, `emotionalLogs` e `alerts`.
- Rotas protegidas, loading screen, notificacoes e layout responsivo.

## Instalar e rodar

```bash
npm install
npm run dev
```

Build de producao:

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
5. Preencha as variaveis:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

6. Publique as regras:

```bash
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

## Estrutura Firestore

### `users`

Perfil basico do usuario autenticado.

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

Check-ins emocionais diarios.

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

Relatos livres do diario emocional com resultado da IA textual.

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

Alertas criados automaticamente quando o risco e medio ou alto.

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

## Logica da IA textual

A IA do MVP esta em `src/services/analisarRelato.js`. Ela normaliza o texto, remove acentos, busca palavras-chave e soma uma pontuacao de risco.

Palavras e expressoes de alto peso incluem:

- `desaparecer`
- `desistir`
- `nao aguento mais`
- `nao vejo saida`
- `quero sumir`

Palavras de atencao media incluem:

- `sozinho`
- `ninguem me entende`
- `vazio`
- `ansiedade`
- `sobrecarregado`

O resultado gera:

- `risk`: baixo, medio ou alto
- `score`: pontuacao numerica
- `detectedWords`: sinais encontrados
- `supportiveMessage`: mensagem acolhedora
- `recommendation`: orientacao segura

## Estrutura do codigo

```txt
src/
  components/       componentes reutilizaveis
  context/          providers globais
  firebase/         configuracao e erros Firebase
  hooks/            hooks de auth e notificacao
  pages/            Home, Login, Cadastro, Dashboard, Diario, Historico, Perfil, Admin
  services/         autenticacao, Firestore e IA textual
  index.css         design system responsivo do MVP
```

## Deploy

Para publicar em Firebase Hosting, atualize `firebase.json` com Hosting ou use:

```bash
firebase init hosting
npm run build
firebase deploy
```

Configuracao recomendada:

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

## Aviso etico

Este MVP nao substitui psicologos, medicos, assistentes sociais ou servicos de emergencia. Ele serve como ferramenta de registro, triagem inicial e apoio a rotas de cuidado. Em risco imediato, procure emergencia, unidade de saude, CVV 188 no Brasil ou uma pessoa de confianca.

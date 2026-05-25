export function traduzirErroFirebase(error) {
  const code = error?.code || ''
  const message = String(error?.message || '').toLowerCase()

  if (
    message.includes('cloud firestore api') &&
    (message.includes('disabled') || message.includes('has not been used'))
  ) {
    return 'Ative o Cloud Firestore no Console Firebase para salvar check-ins.'
  }

  if (message.includes('database') && message.includes('does not exist')) {
    return 'Crie o banco Cloud Firestore no Console Firebase para salvar check-ins.'
  }

  if (code === 'failed-precondition' || message.includes('requires an index')) {
    return 'Os indices do Firestore ainda estao sendo criados ou nao foram publicados. Publique os indices de check-ins e diario no Firebase.'
  }

  const mensagens = {
    'auth/email-already-in-use': 'Este email ja esta cadastrado.',
    'auth/invalid-email': 'Informe um email valido.',
    'auth/invalid-credential':
      'Conta nao encontrada ou senha incorreta. Se este for seu primeiro acesso neste ambiente, crie seu cadastro.',
    'auth/configuration-not-found':
      'O Firebase Authentication ainda nao esta configurado para este projeto.',
    'auth/admin-restricted-operation':
      'O cadastro por email e senha esta bloqueado. Ative o provedor Email/senha no Firebase Authentication.',
    'auth/operation-not-allowed':
      'Ative o provedor Email/senha no Firebase Authentication.',
    'auth/missing-password': 'Informe uma senha para criar a conta.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/api-key-not-valid': 'A chave de API do Firebase esta invalida.',
    'auth/unauthorized-domain':
      'Este dominio nao esta autorizado no Firebase Authentication.',
    'auth/network-request-failed':
      'Nao foi possivel conectar ao Firebase. Verifique sua conexao.',
    'permission-denied':
      'Permissao negada pelo Firestore. Publique regras de seguranca que permitam esta operacao.',
    'unavailable':
      'O Firebase esta temporariamente indisponivel. Tente novamente em instantes.',
  }

  return (
    mensagens[code] ||
    `Nao foi possivel concluir a acao. Verifique o Firebase. Codigo: ${code || 'desconhecido'}`
  )
}

export function traduzirErroFirebase(error, authProvider = '') {
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
    return 'Os índices do Firestore ainda estão sendo criados ou não foram publicados. Publique os índices de check-ins e diário no Firebase.'
  }

  if (code === 'auth/operation-not-allowed' && authProvider === 'google') {
    return 'Ative o provedor Google no Firebase Authentication para entrar com sua conta Google.'
  }

  const mensagens = {
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/invalid-email': 'Informe um e-mail válido.',
    'auth/missing-email': 'Informe seu e-mail para continuar.',
    'auth/too-many-requests':
      'Muitas tentativas foram realizadas. Aguarde alguns instantes e tente novamente.',
    'auth/invalid-credential':
      'Conta não encontrada ou senha incorreta. Se este for seu primeiro acesso neste ambiente, crie seu cadastro.',
    'auth/configuration-not-found':
      'O Firebase Authentication ainda não está configurado para este projeto.',
    'auth/admin-restricted-operation':
      'O cadastro por e-mail e senha está bloqueado. Ative o provedor E-mail/senha no Firebase Authentication.',
    'auth/operation-not-allowed':
      'Ative o provedor E-mail/senha no Firebase Authentication.',
    'auth/missing-password': 'Informe uma senha para criar a conta.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/api-key-not-valid': 'A chave de API do Firebase está inválida.',
    'auth/unauthorized-domain':
      'Este domínio não está autorizado no Firebase Authentication.',
    'auth/network-request-failed':
      'Não foi possível conectar ao Firebase. Verifique sua conexão.',
    'permission-denied':
      'Permissão negada pelo Firestore. Publique regras de segurança que permitam esta operação.',
    'unavailable':
      'O Firebase está temporariamente indisponível. Tente novamente em instantes.',
  }

  return (
    mensagens[code] ||
    `Não foi possível concluir a ação. Verifique o Firebase. Código: ${code || 'desconhecido'}`
  )
}

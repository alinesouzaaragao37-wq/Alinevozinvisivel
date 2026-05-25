function RelatoCard({ relato, onStatusChange }) {
  const data = relato.dataCriacao?.toDate
    ? relato.dataCriacao.toDate().toLocaleString('pt-BR')
    : 'Data indisponivel'

  return (
    <article className={`relato-card risco-${relato.nivelRisco}`}>
      <div className="relato-top">
        <div>
          <span className="eyebrow">Relato recente</span>
          <h3>{relato.nomeUsuario || 'Cidadao'}</h3>
        </div>
        <span className={`risk-pill ${relato.nivelRisco}`}>
          {relato.nivelRisco}
        </span>
      </div>

      <p className="relato-texto">{relato.texto}</p>

      <div className="relato-meta">
        <span>Humor: {relato.humor}</span>
        <span>Pontos: {relato.pontuacao}</span>
        <span>Status: {relato.status}</span>
        <span>{data}</span>
      </div>

      {relato.palavrasDetectadas?.length > 0 && (
        <p className="detected">
          Sinais detectados: {relato.palavrasDetectadas.join(', ')}
        </p>
      )}

      <div className="relato-actions">
        <button
          type="button"
          className="button secondary small"
          onClick={() => onStatusChange(relato.id, 'em acompanhamento')}
        >
          Em acompanhamento
        </button>
        <button
          type="button"
          className="button ghost small"
          onClick={() => onStatusChange(relato.id, 'concluido')}
        >
          Concluido
        </button>
      </div>
    </article>
  )
}

export default RelatoCard

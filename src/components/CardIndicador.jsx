function CardIndicador({ titulo, valor, tom = 'azul' }) {
  return (
    <article className={`indicator ${tom}`}>
      <span>{titulo}</span>
      <strong>{valor}</strong>
    </article>
  )
}

export default CardIndicador

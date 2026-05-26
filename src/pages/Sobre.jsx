function Sobre() {
  return (
    <main className="about-page">
      <section className="page-heading">
        <span className="eyebrow">Proposta</span>
        <h1>Uma tecnologia para ampliar escuta, não para substituir cuidado.</h1>
        <p>
          O Projeto Voz Invisível é um MVP de sensibilidade pública. Ele mostra
          como relatos espontâneos podem apoiar triagem inicial, leitura de
          vulnerabilidades e encaminhamento humanizado.
        </p>
      </section>

      <section className="section-grid">
        <article>
          <h2>Privacidade</h2>
          <p>
            As informações devem ser acessadas apenas por equipes autorizadas e
            usadas estritamente para apoio, acolhimento e melhoria de políticas
            públicas.
          </p>
        </article>
        <article>
          <h2>Responsabilidade</h2>
          <p>
            A análise deste MVP é simulada. Ela não emite diagnósticos, não
            substitui atendimento profissional e não deve ser usada de forma
            punitiva.
          </p>
        </article>
        <article>
          <h2>Encaminhamento</h2>
          <p>
            Em situação de risco, a prioridade é aproximar a pessoa de apoio
            humano: família, escola, saúde, assistência social ou emergência.
          </p>
        </article>
      </section>
    </main>
  )
}

export default Sobre

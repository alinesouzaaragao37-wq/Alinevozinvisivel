function Sobre() {
  return (
    <main className="about-page">
      <section className="page-heading">
        <span className="eyebrow">Proposta</span>
        <h1>Uma tecnologia para ampliar escuta, nao para substituir cuidado.</h1>
        <p>
          O Projeto Voz Invisivel e um MVP de sensibilidade publica. Ele mostra
          como relatos espontaneos podem apoiar triagem inicial, leitura de
          vulnerabilidades e encaminhamento humanizado.
        </p>
      </section>

      <section className="section-grid">
        <article>
          <h2>Privacidade</h2>
          <p>
            As informacoes devem ser acessadas apenas por equipes autorizadas e
            usadas estritamente para apoio, acolhimento e melhoria de politicas
            publicas.
          </p>
        </article>
        <article>
          <h2>Responsabilidade</h2>
          <p>
            A analise deste MVP e simulada. Ela nao emite diagnosticos, nao
            substitui atendimento profissional e nao deve ser usada de forma
            punitiva.
          </p>
        </article>
        <article>
          <h2>Encaminhamento</h2>
          <p>
            Em situacao de risco, a prioridade e aproximar a pessoa de apoio
            humano: familia, escola, saude, assistencia social ou emergencia.
          </p>
        </article>
      </section>
    </main>
  )
}

export default Sobre

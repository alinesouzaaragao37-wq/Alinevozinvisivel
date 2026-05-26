function CareBanner({ compact = false }) {
  return (
    <section className={compact ? 'care-banner compact' : 'care-banner'}>
      <div>
        <span className="eyebrow">Uma pausa com cuidado</span>
        <h2>Você não precisa passar por tudo sozinho.</h2>
        <p>
          Registrar o que sente é um primeiro passo. Quando puder, compartilhe
          esse momento com uma pessoa em quem confia.
        </p>
      </div>
      <aside className="care-contact">
        <strong>Precisa conversar agora?</strong>
        <p>O CVV oferece apoio emocional gratuito, 24 horas por dia.</p>
        <a href="https://cvv.org.br/ligue-188-3/" rel="noreferrer" target="_blank">
          Ligue 188
        </a>
        <small>Em risco imediato, procure o serviço de emergência local.</small>
      </aside>
    </section>
  )
}

export default CareBanner

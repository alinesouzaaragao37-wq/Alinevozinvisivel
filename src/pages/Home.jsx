import { Link } from 'react-router-dom'
import CareBanner from '../components/CareBanner'

function Home() {
  return (
    <main className="home-page">
      <section className="platform-hero">
        <div className="hero-orbit">
          <div className="hero-statusbar">
            <span>Voz Invisivel</span>
            <strong>Centro de sensibilidade publica</strong>
            <small>Escuta, prevencao e acolhimento</small>
          </div>

          <div className="hero-grid-panel">
            <div className="hero-intro-card">
              <span className="eyebrow">Tecnologia social aplicada</span>
              <h1>Voz Invisivel</h1>
              <p className="hero-frase">
                Uma plataforma de IA para transformar relatos emocionais em
                sinais preventivos, acolhimento e decisao publica responsavel.
              </p>
              <p>
                Jovens registram como se sentem. A plataforma organiza check-ins,
                diario emocional, historico, alertas e indicadores para equipes
                autorizadas agirem com mais sensibilidade.
              </p>
              <div className="hero-actions">
                <Link className="button primary" to="/cadastro">
                  Iniciar acolhimento
                </Link>
                <Link className="button secondary" to="/login">
                  Acessar plataforma
                </Link>
              </div>
            </div>

            <div className="product-console" aria-label="Previa da jornada de cuidado">
              <div className="console-top">
                <div>
                  <span>Acolhimento em andamento</span>
                  <strong>Um passo de cada vez</strong>
                </div>
                <em>presente</em>
              </div>

              <div className="risk-board">
                <article>
                  <span>Baixo</span>
                  <strong>18</strong>
                </article>
                <article className="medium">
                  <span>Medio</span>
                  <strong>7</strong>
                </article>
                <article className="high">
                  <span>Alto</span>
                  <strong>2</strong>
                </article>
              </div>

              <div className="triage-card">
                <div>
                  <span>Mensagem acolhedora</span>
                  <p>"Estou cansado emocionalmente e me sentindo sozinho."</p>
                </div>
                <strong>voce merece apoio</strong>
              </div>

              <div className="console-chart">
                <span style={{ height: '52%' }} />
                <span style={{ height: '76%' }} />
                <span style={{ height: '34%' }} />
                <span style={{ height: '88%' }} />
                <span style={{ height: '61%' }} />
                <span style={{ height: '43%' }} />
              </div>
            </div>
          </div>

          <div className="care-flow">
            <article>
              <span>01</span>
              <strong>Check-in</strong>
              <p>Registro emocional diario com intensidade e observacao.</p>
            </article>
            <article>
              <span>02</span>
              <strong>IA textual</strong>
              <p>Palavras-chave geram risco, mensagem e recomendacao.</p>
            </article>
            <article>
              <span>03</span>
              <strong>Alerta</strong>
              <p>Sinais medios e altos entram no painel administrativo.</p>
            </article>
            <article>
              <span>04</span>
              <strong>Acolhimento</strong>
              <p>Equipe autorizada acompanha indicadores e encaminhamentos.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="operating-system">
        <div className="system-copy">
          <span className="eyebrow">Tecnologia para avaliacao social</span>
          <h2>Mais que uma tela bonita: uma arquitetura de cuidado.</h2>
          <p>
            A Voz Invisivel conecta relato, analise, historico e gestao em um
            fluxo unico. A proposta e demonstrar viabilidade tecnica e impacto
            social sem prometer diagnostico clinico.
          </p>
        </div>
        <div className="system-modules">
          <article>
            <strong>Espaco do jovem</strong>
            <span>Check-in, diario, chatbot e historico emocional.</span>
          </article>
          <article>
            <strong>Motor preventivo</strong>
            <span>Classificacao textual transparente e auditavel.</span>
          </article>
          <article>
            <strong>Painel de gestao</strong>
            <span>Indicadores, alertas e emocoes frequentes.</span>
          </article>
        </div>
      </section>
      <CareBanner />
    </main>
  )
}

export default Home

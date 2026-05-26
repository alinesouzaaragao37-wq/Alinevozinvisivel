import { Link } from 'react-router-dom'
import CareBanner from '../components/CareBanner'

function Home() {
  return (
    <main className="home-page">
      <section className="platform-hero">
        <div className="hero-orbit">
          <div className="hero-statusbar">
            <span>Voz Invisível</span>
            <strong>Centro de sensibilidade pública</strong>
            <small>Escuta, prevenção e acolhimento</small>
          </div>

          <div className="hero-grid-panel">
            <div className="hero-intro-card">
              <span className="eyebrow">Tecnologia social aplicada</span>
              <h1>Voz Invisível</h1>
              <p className="hero-frase">
                Uma plataforma de IA para transformar relatos emocionais em
                sinais preventivos, acolhimento e decisão pública responsável.
              </p>
              <p>
                Jovens registram como se sentem. A plataforma organiza check-ins,
                diário emocional, histórico, alertas e indicadores para equipes
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

            <div className="product-console" aria-label="Prévia da jornada de cuidado">
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
                  <span>Médio</span>
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
                <strong>você merece apoio</strong>
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
              <p>Registro emocional diário com intensidade e observação.</p>
            </article>
            <article>
              <span>02</span>
              <strong>IA textual</strong>
              <p>Palavras-chave geram risco, mensagem e recomendação.</p>
            </article>
            <article>
              <span>03</span>
              <strong>Alerta</strong>
              <p>Sinais médios e altos entram no painel administrativo.</p>
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
          <span className="eyebrow">Tecnologia para avaliação social</span>
          <h2>Mais que uma tela bonita: uma arquitetura de cuidado.</h2>
          <p>
            A Voz Invisível conecta relato, análise, histórico e gestão em um
            fluxo único. A proposta é demonstrar viabilidade técnica e impacto
            social sem prometer diagnóstico clínico.
          </p>
        </div>
        <div className="system-modules">
          <article>
            <strong>Espaço do jovem</strong>
            <span>Check-in, diário, chatbot e histórico emocional.</span>
          </article>
          <article>
            <strong>Motor preventivo</strong>
            <span>Classificação textual transparente e auditável.</span>
          </article>
          <article>
            <strong>Painel de gestão</strong>
            <span>Indicadores, alertas e emoções frequentes.</span>
          </article>
        </div>
      </section>
      <CareBanner />
    </main>
  )
}

export default Home

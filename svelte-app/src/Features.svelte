<script>
  import { onMount } from 'svelte'

  let isVisible = false

  onMount(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          isVisible = true
        }
      })
    }, { threshold: 0.1 })

    const section = document.querySelector('.features')
    if (section) observer.observe(section)

    return () => observer.disconnect()
  })
</script>

<section class="features" class:visible={isVisible}>
  <div class="container">
    <h2>Security Features</h2>
    <p class="section-subtitle">Comprehensive analysis to protect your investments</p>

    <div class="bento-grid">
      <!-- Large: Mint Authority -->
      <div class="card large">
        <div class="card-icon">🔐</div>
        <h3>Mint Authority Check</h3>
        <p>Detect if developers can mint unlimited tokens. Active authority means potential dilution risk.</p>
        <div class="badge danger">High Priority</div>
      </div>

      <!-- Medium: Freeze Authority -->
      <div class="card medium">
        <div class="card-icon">❄️</div>
        <h3>Freeze Authority</h3>
        <p>Check if token accounts can be frozen by developers.</p>
        <div class="badge warning">Watch</div>
      </div>

      <!-- Medium: Metadata Lock -->
      <div class="card medium">
        <div class="card-icon">🔒</div>
        <h3>Metadata Lock</h3>
        <p>Verify if token identity (name, symbol, image) can be changed.</p>
        <div class="badge info">Verify</div>
      </div>

      <!-- Wide: Developer History -->
      <div class="card wide">
        <div class="card-icon">👨‍💻</div>
        <h3>Developer History Tracking</h3>
        <p>Track deployment history to detect serial scammers. See tokens deployed, rugged, and win rate.</p>
        <div class="stats">
          <div class="stat">
            <span class="stat-value">5</span>
            <span class="stat-label">Deployed</span>
          </div>
          <div class="stat">
            <span class="stat-value">80%</span>
            <span class="stat-label">Win Rate</span>
          </div>
        </div>
      </div>

      <!-- Small: Real-time Data -->
      <div class="card small">
        <div class="card-icon">⚡</div>
        <h3>Real-time</h3>
        <div class="badge success">100% Live</div>
      </div>

      <!-- Small: Scan Speed -->
      <div class="card small">
        <div class="card-icon">⏱️</div>
        <h3>Fast Scan</h3>
        <div class="badge success">~3s</div>
      </div>

      <!-- Medium: Liquidity Analysis -->
      <div class="card medium">
        <div class="card-icon">💧</div>
        <h3>Liquidity Analysis</h3>
        <p>Check if there's enough liquidity for safe trading.</p>
        <div class="badge success">Live Check</div>
      </div>

      <!-- Medium: Holder Distribution -->
      <div class="card medium">
        <div class="card-icon">📊</div>
        <h3>Holder Distribution</h3>
        <p>Analyze wallet concentration and whale risk.</p>
        <div class="badge info">Top 10</div>
      </div>

      <!-- Wide: Honeypot Detection -->
      <div class="card wide">
        <div class="card-icon">🍯</div>
        <h3>Honeypot Detection</h3>
        <p>Identify tokens with sell restrictions, transfer limits, or hidden malicious functions designed to trap buyers.</p>
        <div class="badge danger">Critical</div>
      </div>
    </div>
  </div>
</section>

<style>
  .features {
    min-height: 100vh;
    padding: 6rem 2rem;
    background: rgba(0, 0, 0, 0.1);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  h2 {
    font-size: 3rem;
    text-align: center;
    margin: 0 0 1rem;
    font-weight: 700;
  }

  .section-subtitle {
    text-align: center;
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 4rem;
  }

  .bento-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .features.visible .bento-grid {
    opacity: 1;
    transform: translateY(0);
  }

  .card {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 2rem;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
  }

  .card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  .card.large {
    grid-column: span 2;
    grid-row: span 2;
  }

  .card.wide {
    grid-column: span 2;
  }

  .card.medium {
    grid-column: span 1;
  }

  .card.small {
    grid-column: span 1;
  }

  .card-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .card h3 {
    font-size: 1.5rem;
    margin: 0 0 1rem;
    font-weight: 600;
  }

  .card p {
    margin: 0 0 1rem;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    flex: 1;
  }

  .badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    margin-top: auto;
  }

  .badge.danger {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.5);
    color: #fca5a5;
  }

  .badge.warning {
    background: rgba(251, 191, 36, 0.2);
    border: 1px solid rgba(251, 191, 36, 0.5);
    color: #fcd34d;
  }

  .badge.success {
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid rgba(16, 185, 129, 0.5);
    color: #6ee7b7;
  }

  .badge.info {
    background: rgba(59, 130, 246, 0.2);
    border: 1px solid rgba(59, 130, 246, 0.5);
    color: #93c5fd;
  }

  .stats {
    display: flex;
    gap: 2rem;
    margin-top: auto;
  }

  .stat {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #10b981;
  }

  .stat-label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
  }

  @media (max-width: 1024px) {
    .bento-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .card.large,
    .card.wide {
      grid-column: span 2;
    }

    .card.medium,
    .card.small {
      grid-column: span 1;
    }
  }

  @media (max-width: 640px) {
    .bento-grid {
      grid-template-columns: 1fr;
    }

    .card {
      grid-column: span 1 !important;
      grid-row: span 1 !important;
    }

    h2 {
      font-size: 2rem;
    }
  }
</style>

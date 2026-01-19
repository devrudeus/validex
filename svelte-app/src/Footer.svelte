<script>
  const currentYear = new Date().getFullYear()
</script>

<footer>
  <div class="container">
    <div class="footer-content">
      <div class="footer-section">
        <h3>Validex</h3>
        <p>Free Solana token security scanner. Protect your investments with real-time analysis.</p>
      </div>

      <div class="footer-section">
        <h4>Features</h4>
        <ul>
          <li><a href="#features">Mint Authority Check</a></li>
          <li><a href="#features">Freeze Authority</a></li>
          <li><a href="#features">Honeypot Detection</a></li>
          <li><a href="#features">Developer Tracking</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Resources</h4>
        <ul>
          <li><a href="https://github.com/devrudeus/validex" target="_blank" rel="noopener">GitHub</a></li>
          <li><a href="https://solana.com" target="_blank" rel="noopener">Solana</a></li>
          <li><a href="https://docs.solana.com" target="_blank" rel="noopener">Docs</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Legal</h4>
        <ul>
          <li><a href="#privacy">Privacy Policy</a></li>
          <li><a href="#terms">Terms of Service</a></li>
          <li><a href="#disclaimer">Disclaimer</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {currentYear} Validex. Built with ❤️ for the Solana Community.</p>
      <p class="disclaimer-text">Not financial advice. Always do your own research.</p>
    </div>
  </div>
</footer>

<style>
  footer {
    background: rgba(0, 0, 0, 0.3);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 4rem 2rem 2rem;
    backdrop-filter: blur(10px);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .footer-content {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 3rem;
    margin-bottom: 3rem;
  }

  .footer-section h3 {
    font-size: 1.5rem;
    margin: 0 0 1rem;
    font-weight: 700;
    background: linear-gradient(45deg, #fff, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .footer-section h4 {
    font-size: 1.1rem;
    margin: 0 0 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .footer-section p {
    margin: 0;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
  }

  .footer-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .footer-section ul li {
    margin-bottom: 0.75rem;
  }

  .footer-section ul li a {
    color: rgba(255, 255, 255, 0.7);
    transition: color 0.3s ease;
  }

  .footer-section ul li a:hover {
    color: #fff;
  }

  .footer-bottom {
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .footer-bottom p {
    margin: 0.5rem 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
  }

  .disclaimer-text {
    font-size: 0.8rem !important;
    color: rgba(255, 255, 255, 0.5) !important;
  }

  @media (max-width: 1024px) {
    .footer-content {
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
  }

  @media (max-width: 640px) {
    .footer-content {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    footer {
      padding: 3rem 1.5rem 1.5rem;
    }
  }
</style>

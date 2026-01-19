<script>
  let tokenAddress = ''
  let isLoading = false
  let auditResult = null
  let error = null

  async function handleAudit() {
    if (!tokenAddress.trim()) {
      error = 'Please enter a token address'
      return
    }

    isLoading = true
    error = null
    auditResult = null

    try {
      const response = await fetch(`/api/audit/${tokenAddress}`)
      const data = await response.json()

      if (data.success) {
        auditResult = data
      } else {
        error = data.error || 'Failed to audit token'
      }
    } catch (err) {
      error = 'Failed to connect to API'
      console.error(err)
    } finally {
      isLoading = false
    }
  }
</script>

<section class="hero">
  <div class="container">
    <div class="hero-content">
      <img src="/validex.png" alt="Validex Logo" class="logo" />
      <h1>Validex</h1>
      <p class="tagline">Solana Token Security Scanner</p>
      <p class="subtitle">Free real-time security analysis for Solana SPL tokens</p>

      <div class="search-box">
        <input
          type="text"
          bind:value={tokenAddress}
          placeholder="Enter Solana token address..."
          on:keypress={(e) => e.key === 'Enter' && handleAudit()}
        />
        <button on:click={handleAudit} disabled={isLoading}>
          {isLoading ? 'Scanning...' : 'Scan Token'}
        </button>
      </div>

      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      {#if auditResult}
        <div class="result-preview">
          <h3>Scan Complete!</h3>
          <p>Token: {auditResult.token}</p>
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  .hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
  }

  .container {
    max-width: 800px;
    width: 100%;
  }

  .hero-content {
    animation: fadeIn 0.8s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .logo {
    width: 120px;
    height: 120px;
    margin: 0 auto 1rem;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  h1 {
    font-size: 4rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    background: linear-gradient(45deg, #fff, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .tagline {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
    color: rgba(255, 255, 255, 0.95);
  }

  .subtitle {
    font-size: 1.1rem;
    margin: 0 0 2rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .search-box {
    display: flex;
    gap: 1rem;
    max-width: 600px;
    margin: 0 auto 2rem;
  }

  input {
    flex: 1;
    padding: 1rem 1.5rem;
    font-size: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }

  input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.15);
  }

  button {
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: #fff;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(16, 185, 129, 0.4);
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-message {
    padding: 1rem;
    background: rgba(239, 68, 68, 0.2);
    border: 2px solid rgba(239, 68, 68, 0.5);
    border-radius: 12px;
    color: #fca5a5;
    margin-top: 1rem;
  }

  .result-preview {
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    margin-top: 1rem;
    backdrop-filter: blur(10px);
  }

  .result-preview h3 {
    margin: 0 0 0.5rem;
    color: #10b981;
  }

  .result-preview p {
    margin: 0;
    font-family: 'Space Mono', monospace;
    font-size: 0.9rem;
    word-break: break-all;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 2.5rem;
    }

    .tagline {
      font-size: 1.2rem;
    }

    .search-box {
      flex-direction: column;
    }

    button {
      width: 100%;
    }
  }
</style>

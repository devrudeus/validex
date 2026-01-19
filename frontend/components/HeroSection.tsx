'use client'

import { useState } from 'react'
import { Shield, ArrowRight, Sparkles, Loader } from 'lucide-react'
import AuditResultModal from './AuditResultModal'

export default function HeroSection() {
  const [tokenAddress, setTokenAddress] = useState('')
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [auditResult, setAuditResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const handleAudit = async () => {
    if (!tokenAddress.trim()) {
      setError('Please enter a token address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`http://localhost:3000/api/audit/${tokenAddress.trim()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        setAuditResult(result)
        setError('')
      } else {
        setError(result.error || 'Failed to audit token')
      }
    } catch (err) {
      console.error('Audit error:', err)
      setError('Failed to connect to audit service. Please make sure the backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 cyber-grid opacity-30" />

      {/* Gradient orbs for ambiance */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-cyber-purple rounded-full blur-3xl opacity-20 animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyber-pink rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center mb-8 animate-float">
          <Shield className="w-16 h-16 text-cyber-purple mr-4" />
          <h1 className="text-4xl md:text-5xl font-bold gradient-text">
            SolanaGuard
          </h1>
        </div>

        {/* Main Headline */}
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
          <span className="block text-white mb-2">Don't Get</span>
          <span className="block gradient-text text-glow-purple">Rugged.</span>
        </h2>

        <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
          Audit Any Solana Token in Seconds
        </p>

        <p className="text-sm md:text-base text-gray-400 mb-12 max-w-2xl mx-auto">
          Comprehensive smart contract security analysis powered by real-time blockchain data.
          Detect rug pulls, honeypots, and malicious code before you invest.
        </p>

        {/* Input Section */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative group">
            {/* Glow effect on hover */}
            <div className="absolute -inset-1 bg-gradient-cyber rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500" />

            <div className="relative flex flex-col sm:flex-row gap-4 bg-cyber-dark-card border-2 border-cyber-dark-border rounded-2xl p-3">
              <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="Paste Solana Token Address (e.g., EPjFWdd5AufqSSqeM2qN...)"
                className="flex-1 bg-transparent text-white placeholder-gray-500 px-6 py-4 outline-none text-sm md:text-base"
                onKeyPress={(e) => e.key === 'Enter' && handleAudit()}
              />

              <button
                onClick={handleAudit}
                disabled={isLoading}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative px-8 py-4 bg-gradient-cyber text-white font-bold rounded-xl btn-glow transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'rotate-12 scale-110' : ''}`} />
                    <span>Audit Now</span>
                    <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border-2 border-red-500/30 rounded-xl text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Quick info */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
              <span>Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
              <span>Instant Results</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
              <span>No Sign-Up Required</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
          {[
            { value: '10K+', label: 'Tokens Scanned' },
            { value: '99.9%', label: 'Accuracy Rate' },
            { value: '<3s', label: 'Avg Response Time' },
            { value: '$50M+', label: 'Protected Value' },
          ].map((stat, index) => (
            <div key={index} className="bg-cyber-dark-card border border-cyber-dark-border rounded-xl p-6 card-hover">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-cyber-purple rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-cyber-purple rounded-full animate-pulse" />
        </div>
      </div>

      {/* Audit Result Modal */}
      {auditResult && (
        <AuditResultModal
          result={auditResult}
          onClose={() => setAuditResult(null)}
        />
      )}
    </section>
  )
}

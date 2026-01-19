'use client'

import { CheckCircle2, XCircle, AlertTriangle, Shield, Lock, Droplet, TrendingUp } from 'lucide-react'

export default function LiveAuditDemo() {
  // Mock audit data
  const auditData = {
    tokenName: 'PepeSol',
    symbol: 'PEPE',
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    riskScore: 85,
    riskLevel: 'Safe',
    checks: [
      { name: 'Mint Authority Revoked', status: 'pass', icon: Shield },
      { name: 'Liquidity Locked', status: 'pass', icon: Lock },
      { name: 'Freeze Authority Revoked', status: 'pass', icon: CheckCircle2 },
      { name: 'Ownership Renounced', status: 'pass', icon: CheckCircle2 },
      { name: 'Honeypot Test', status: 'pass', icon: Droplet },
      { name: 'Top 10 Holders < 50%', status: 'warning', icon: TrendingUp },
    ],
    warnings: [
      'Top holder owns 15% of supply - Monitor for whale activity',
    ],
    scannedAt: new Date().toLocaleString(),
  }

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-cyber-green rounded-full blur-3xl opacity-10" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-cyber-purple rounded-full blur-3xl opacity-10" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-sm font-semibold text-cyber-green uppercase tracking-wider mb-4">
            LIVE DEMO
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold mb-6">
            See It In
            <span className="gradient-text-success"> Action</span>
          </h3>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Here's what a comprehensive audit report looks like. All data is analyzed in real-time from the Solana blockchain.
          </p>
        </div>

        {/* Audit Result Card */}
        <div className="bg-cyber-dark-card border-2 border-cyber-dark-border rounded-3xl overflow-hidden shadow-2xl">
          {/* Header Section */}
          <div className="relative bg-gradient-to-r from-cyber-dark-bg via-cyber-green/5 to-cyber-dark-bg p-8 border-b border-cyber-dark-border">
            {/* Animated pulse background */}
            <div className="absolute inset-0 bg-cyber-green/5 animate-pulse-glow" />

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-3xl font-bold text-white">{auditData.tokenName}</h4>
                  <span className="text-2xl text-gray-400">({auditData.symbol})</span>
                </div>
                <p className="text-sm text-gray-500 font-mono">
                  {auditData.address.substring(0, 20)}...
                </p>
              </div>

              {/* Risk Score Badge */}
              <div className="relative">
                <div className="absolute inset-0 bg-cyber-green rounded-2xl blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-success rounded-2xl px-8 py-4 border-2 border-cyber-green">
                  <div className="text-sm text-white/80 font-semibold mb-1">Risk Score</div>
                  <div className="text-4xl font-black text-white flex items-baseline gap-2">
                    {auditData.riskScore}
                    <span className="text-lg text-white/60">/100</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    ✅ {auditData.riskLevel}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Checks Grid */}
          <div className="p-8">
            <h5 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyber-green" />
              Security Checks
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {auditData.checks.map((check, index) => {
                const Icon = check.icon
                const isPass = check.status === 'pass'
                const isWarning = check.status === 'warning'

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                      isPass
                        ? 'bg-cyber-green/5 border-cyber-green/30 hover:border-cyber-green/50'
                        : isWarning
                        ? 'bg-orange-500/5 border-orange-500/30 hover:border-orange-500/50'
                        : 'bg-red-500/5 border-red-500/30 hover:border-red-500/50'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        isPass
                          ? 'bg-cyber-green/20'
                          : isWarning
                          ? 'bg-orange-500/20'
                          : 'bg-red-500/20'
                      }`}
                    >
                      {isPass ? (
                        <CheckCircle2 className="w-6 h-6 text-cyber-green" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-6 h-6 text-orange-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm">
                        {check.name}
                      </div>
                    </div>

                    <div
                      className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold ${
                        isPass
                          ? 'bg-cyber-green/20 text-cyber-green'
                          : isWarning
                          ? 'bg-orange-500/20 text-orange-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {isPass ? 'PASS' : isWarning ? 'WARNING' : 'FAIL'}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Warnings Section */}
            {auditData.warnings.length > 0 && (
              <div className="bg-orange-500/10 border-2 border-orange-500/30 rounded-xl p-6">
                <h6 className="text-sm font-bold text-orange-500 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Warnings & Recommendations
                </h6>
                <ul className="space-y-2">
                  {auditData.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer Info */}
            <div className="mt-6 pt-6 border-t border-cyber-dark-border flex items-center justify-between text-sm text-gray-500">
              <span>Scanned: {auditData.scannedAt}</span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
                Live Data
              </span>
            </div>
          </div>
        </div>

        {/* CTA Below Demo */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">
            Ready to audit your token? It only takes a few seconds.
          </p>
          <a
            href="#hero"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-cyber text-white font-bold rounded-xl btn-glow transition-all duration-300"
          >
            <Shield className="w-5 h-5" />
            Start Your Free Audit
          </a>
        </div>
      </div>
    </section>
  )
}

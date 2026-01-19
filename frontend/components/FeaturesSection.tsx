'use client'

import { Shield, Droplet, Lock, Zap, AlertTriangle, TrendingUp } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Mint Authority Check',
    description: 'Detect hidden token inflation risks. We verify if developers can mint unlimited tokens, protecting you from supply manipulation.',
    color: 'purple',
    stats: '100% Detection Rate',
  },
  {
    icon: Droplet,
    title: 'Honeypot Detector',
    description: 'Simulate buy/sell transactions to expose honeypot scams. We test if you can actually sell the token before you buy.',
    color: 'pink',
    stats: 'Real-time Simulation',
  },
  {
    icon: Lock,
    title: 'Liquidity Analysis',
    description: 'Analyze liquidity pool security and lock status. Ensure your investment is protected from rug pulls and sudden liquidity removal.',
    color: 'green',
    stats: 'Multi-DEX Support',
  },
  {
    icon: Zap,
    title: 'Instant Smart Scan',
    description: 'Lightning-fast contract analysis using advanced pattern recognition. Get comprehensive results in under 3 seconds.',
    color: 'blue',
    stats: '<3s Response',
  },
  {
    icon: AlertTriangle,
    title: 'Risk Scoring Engine',
    description: 'AI-powered risk assessment with detailed warnings. Each token receives a security score from 0-100 based on multiple factors.',
    color: 'orange',
    stats: '15+ Risk Factors',
  },
  {
    icon: TrendingUp,
    title: 'Ownership Distribution',
    description: 'Track top holder concentrations and whale wallets. Identify if token supply is controlled by a few addresses.',
    color: 'cyan',
    stats: 'Top 100 Holders',
  },
]

const colorClasses = {
  purple: {
    bg: 'bg-cyber-purple/10',
    border: 'border-cyber-purple/30',
    icon: 'text-cyber-purple',
    glow: 'group-hover:shadow-neon-purple',
  },
  pink: {
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    icon: 'text-pink-500',
    glow: 'group-hover:shadow-neon-pink',
  },
  green: {
    bg: 'bg-cyber-green/10',
    border: 'border-cyber-green/30',
    icon: 'text-cyber-green',
    glow: 'group-hover:shadow-neon-green',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-500',
    glow: 'group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]',
  },
  orange: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    icon: 'text-orange-500',
    glow: 'group-hover:shadow-[0_0_20px_rgba(249,115,22,0.5)]',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    icon: 'text-cyan-500',
    glow: 'group-hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]',
  },
}

export default function FeaturesSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-cyber-purple to-transparent" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-cyber-purple uppercase tracking-wider mb-4">
            SECURITY FEATURES
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold mb-6">
            Military-Grade
            <span className="gradient-text"> Token Analysis</span>
          </h3>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Our advanced auditing engine scans every critical security parameter to protect your investment from scams and rug pulls.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const colors = colorClasses[feature.color as keyof typeof colorClasses]
            const Icon = feature.icon

            return (
              <div
                key={index}
                className={`group relative bg-cyber-dark-card border-2 ${colors.border} rounded-2xl p-8 card-hover transition-all duration-300 ${colors.glow}`}
              >
                {/* Icon */}
                <div className={`${colors.bg} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 ${colors.icon}`} />
                </div>

                {/* Content */}
                <h4 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h4>

                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  {feature.description}
                </p>

                {/* Stats badge */}
                <div className={`inline-flex items-center ${colors.bg} ${colors.border} border px-3 py-1 rounded-full`}>
                  <span className={`text-xs font-semibold ${colors.icon}`}>
                    {feature.stats}
                  </span>
                </div>

                {/* Hover effect overlay */}
                <div className={`absolute inset-0 ${colors.bg} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`} />
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-6">
            All features are completely free. No hidden fees, no subscriptions.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
              <span className="text-gray-300">Open Source Algorithm</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
              <span className="text-gray-300">Real-time Blockchain Data</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
              <span className="text-gray-300">Community Driven</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import { Users, TrendingUp, Shield, Zap } from 'lucide-react'

const stats = [
  {
    icon: Users,
    value: '10,000+',
    label: 'Tokens Scanned',
    description: 'Community members protected daily',
    color: 'purple',
  },
  {
    icon: TrendingUp,
    value: '$50M+',
    label: 'Value Protected',
    description: 'Prevented losses from scam tokens',
    color: 'green',
  },
  {
    icon: Shield,
    value: '99.9%',
    label: 'Accuracy Rate',
    description: 'Verified detection accuracy',
    color: 'pink',
  },
  {
    icon: Zap,
    value: '2.8s',
    label: 'Avg Response',
    description: 'Lightning-fast analysis',
    color: 'blue',
  },
]

const partners = [
  { name: 'Solana', logo: 'S' },
  { name: 'Raydium', logo: 'R' },
  { name: 'Jupiter', logo: 'J' },
  { name: 'Orca', logo: 'O' },
  { name: 'Magic Eden', logo: 'ME' },
  { name: 'Phantom', logo: 'P' },
]

const testimonials = [
  {
    name: 'Alex Chen',
    role: 'DeFi Trader',
    avatar: 'AC',
    comment: 'Saved me from a $5K rug pull. This tool is essential for any Solana investor.',
    rating: 5,
  },
  {
    name: 'Sarah Martinez',
    role: 'Crypto Analyst',
    avatar: 'SM',
    comment: 'The most comprehensive token auditor I\'ve used. Fast, accurate, and free!',
    rating: 5,
  },
  {
    name: 'Mike Johnson',
    role: 'NFT Collector',
    avatar: 'MJ',
    comment: 'I check every token here before buying. The honeypot detector is a game changer.',
    rating: 5,
  },
]

export default function TrustSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-cyber-dark-bg">
      <div className="max-w-7xl mx-auto">
        {/* Stats Section */}
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-cyber-purple uppercase tracking-wider mb-4">
            TRUSTED BY THOUSANDS
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold mb-6">
            Protecting The
            <span className="gradient-text"> Solana Community</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="group relative bg-cyber-dark-card border-2 border-cyber-dark-border rounded-2xl p-8 text-center card-hover"
              >
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="bg-cyber-purple/10 w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-cyber-purple" />
                  </div>
                </div>

                {/* Value */}
                <div className="text-4xl font-black gradient-text mb-2">
                  {stat.value}
                </div>

                {/* Label */}
                <div className="text-lg font-bold text-white mb-2">
                  {stat.label}
                </div>

                {/* Description */}
                <div className="text-sm text-gray-400">
                  {stat.description}
                </div>
              </div>
            )
          })}
        </div>

        {/* Partners Section */}
        <div className="mb-20">
          <h4 className="text-center text-gray-400 text-sm mb-8 uppercase tracking-wider">
            Integrated With Leading Solana Protocols
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-cyber rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                <div className="relative bg-cyber-dark-card border-2 border-cyber-dark-border rounded-xl px-8 py-4 hover:border-cyber-purple/50 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyber-purple/20 rounded-lg flex items-center justify-center font-bold text-cyber-purple">
                      {partner.logo}
                    </div>
                    <span className="text-white font-semibold">{partner.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div>
          <h4 className="text-center text-2xl font-bold text-white mb-12">
            What Our Users Say
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-cyber-dark-card border-2 border-cyber-dark-border rounded-2xl p-6 card-hover"
              >
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-cyber-purple fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                  "{testimonial.comment}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-cyber rounded-full flex items-center justify-center font-bold text-white">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyber-green" />
            <span>Open Source</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyber-green" />
            <span>No Data Tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyber-green" />
            <span>100% Free</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyber-green" />
            <span>Community Driven</span>
          </div>
        </div>
      </div>
    </section>
  )
}

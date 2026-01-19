'use client'

import { Shield, Github, Twitter, Send, BookOpen, AlertTriangle } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t border-cyber-dark-border bg-cyber-dark-card">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-cyber-purple" />
              <h3 className="text-2xl font-bold gradient-text">SolanaGuard</h3>
            </div>
            <p className="text-gray-400 text-sm mb-6 max-w-md">
              Your trusted companion for auditing Solana tokens. We provide real-time security analysis to protect you from rug pulls, honeypots, and malicious contracts.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-cyber-dark-bg border border-cyber-dark-border rounded-lg flex items-center justify-center hover:border-cyber-purple hover:shadow-neon-purple transition-all duration-300"
              >
                <Twitter className="w-5 h-5 text-gray-400 hover:text-cyber-purple transition-colors" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-cyber-dark-bg border border-cyber-dark-border rounded-lg flex items-center justify-center hover:border-cyber-purple hover:shadow-neon-purple transition-all duration-300"
              >
                <Github className="w-5 h-5 text-gray-400 hover:text-cyber-purple transition-colors" />
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-cyber-dark-bg border border-cyber-dark-border rounded-lg flex items-center justify-center hover:border-cyber-purple hover:shadow-neon-purple transition-all duration-300"
              >
                <Send className="w-5 h-5 text-gray-400 hover:text-cyber-purple transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-cyber-purple transition-colors text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-cyber-purple transition-colors text-sm flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-cyber-purple transition-colors text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  API Docs
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-cyber-purple transition-colors text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Security Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-cyber-purple transition-colors text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-cyber-purple transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-cyber-purple transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-cyber-purple transition-colors text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Important Disclaimer */}
        <div className="mt-12 pt-8 border-t border-cyber-dark-border">
          <div className="bg-orange-500/10 border-2 border-orange-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <h5 className="text-orange-500 font-bold mb-2 text-sm">IMPORTANT DISCLAIMER</h5>
                <p className="text-gray-400 text-sm leading-relaxed">
                  This tool provides automated security analysis based on publicly available blockchain data.
                  <strong className="text-white"> It is NOT financial advice.</strong> Always do your own research (DYOR) before investing in any cryptocurrency.
                  Past security scores do not guarantee future safety. Token contracts can be upgraded, and new vulnerabilities may emerge.
                  Use this tool as one of many resources in your investment decision process.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-cyber-dark-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm text-center md:text-left">
            © {currentYear} SolanaGuard. All rights reserved. Built with ❤️ for the Solana community.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyber-purple to-transparent" />
    </footer>
  )
}

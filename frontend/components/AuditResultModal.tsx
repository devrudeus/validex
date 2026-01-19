'use client'

import { X, CheckCircle2, AlertTriangle, XCircle, Shield } from 'lucide-react'

interface AuditResultModalProps {
  result: any
  onClose: () => void
}

export default function AuditResultModal({ result, onClose }: AuditResultModalProps) {
  if (!result) return null

  const scoreColor = result.riskAssessment.score >= 80 ? 'green'
    : result.riskAssessment.score >= 50 ? 'orange' : 'red'

  const scoreColorClass = result.riskAssessment.score >= 80 ? 'text-cyber-green'
    : result.riskAssessment.score >= 50 ? 'text-orange-500' : 'text-red-500'

  const scoreBgClass = result.riskAssessment.score >= 80 ? 'bg-cyber-green/10 border-cyber-green/30'
    : result.riskAssessment.score >= 50 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-red-500/10 border-red-500/30'

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-cyber-dark-card border-2 border-cyber-dark-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyber-dark-border sticky top-0 bg-cyber-dark-card z-10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyber-purple" />
            Audit Results
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-cyber-dark-bg rounded-lg flex items-center justify-center hover:bg-cyber-purple/20 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Token Info */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              {result.tokenInfo.name}
              <span className="text-gray-400">({result.tokenInfo.symbol})</span>
            </h3>
            <p className="text-xs text-gray-500 font-mono break-all">
              {result.tokenInfo.mintAddress}
            </p>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="text-gray-400">Supply: <span className="text-white font-semibold">{result.tokenInfo.supply}</span></span>
              <span className="text-gray-400">Decimals: <span className="text-white font-semibold">{result.tokenInfo.decimals}</span></span>
            </div>
          </div>

          {/* Risk Score */}
          <div className={`${scoreBgClass} border-2 rounded-2xl p-6 mb-6 text-center`}>
            <div className="text-5xl font-black text-white mb-2">
              {result.riskAssessment.score}<span className="text-2xl text-gray-400">/100</span>
            </div>
            <div className={`text-xl font-bold ${scoreColorClass}`}>
              {result.riskAssessment.level === 'Safe' && '✅ Safe'}
              {result.riskAssessment.level === 'Caution' && '⚠️ Caution'}
              {result.riskAssessment.level === 'Rug Pull Risk' && '🚨 Rug Pull Risk'}
            </div>
          </div>

          {/* Authority Status */}
          <div className="mb-6">
            <h4 className="font-bold text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyber-purple" />
              Authority Status
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mint Authority */}
              <div className={`rounded-xl p-4 border-2 ${
                result.authorityStatus.mintAuthority.isActive
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-cyber-green/10 border-cyber-green/30'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {result.authorityStatus.mintAuthority.isActive ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-cyber-green" />
                  )}
                  <span className="font-semibold text-white text-sm">Mint Authority</span>
                </div>
                <div className={`text-xs font-bold ${
                  result.authorityStatus.mintAuthority.isActive ? 'text-red-500' : 'text-cyber-green'
                }`}>
                  {result.authorityStatus.mintAuthority.isActive ? '❌ ACTIVE (Risk!)' : '✅ REVOKED (Safe)'}
                </div>
                {result.authorityStatus.mintAuthority.address && (
                  <div className="text-xs text-gray-500 mt-1 font-mono truncate">
                    {result.authorityStatus.mintAuthority.address.substring(0, 20)}...
                  </div>
                )}
              </div>

              {/* Freeze Authority */}
              <div className={`rounded-xl p-4 border-2 ${
                result.authorityStatus.freezeAuthority.isActive
                  ? 'bg-orange-500/10 border-orange-500/30'
                  : 'bg-cyber-green/10 border-cyber-green/30'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {result.authorityStatus.freezeAuthority.isActive ? (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-cyber-green" />
                  )}
                  <span className="font-semibold text-white text-sm">Freeze Authority</span>
                </div>
                <div className={`text-xs font-bold ${
                  result.authorityStatus.freezeAuthority.isActive ? 'text-orange-500' : 'text-cyber-green'
                }`}>
                  {result.authorityStatus.freezeAuthority.isActive ? '⚠️ ACTIVE (Caution)' : '✅ REVOKED (Safe)'}
                </div>
                {result.authorityStatus.freezeAuthority.address && (
                  <div className="text-xs text-gray-500 mt-1 font-mono truncate">
                    {result.authorityStatus.freezeAuthority.address.substring(0, 20)}...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Info */}
          <div className="mb-6">
            <div className={`rounded-xl p-4 border-2 ${
              result.metadataInfo.isMutable
                ? 'bg-orange-500/10 border-orange-500/30'
                : 'bg-cyber-green/10 border-cyber-green/30'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {result.metadataInfo.isMutable ? (
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-cyber-green" />
                )}
                <span className="font-semibold text-white text-sm">Metadata</span>
              </div>
              <div className={`text-xs font-bold ${
                result.metadataInfo.isMutable ? 'text-orange-500' : 'text-cyber-green'
              }`}>
                {result.metadataInfo.isMutable ? '⚠️ MUTABLE (Can be changed)' : '✅ IMMUTABLE (Locked)'}
              </div>
            </div>
          </div>

          {/* Warnings */}
          <div className="bg-cyber-dark-bg rounded-xl p-4 mb-6">
            <h4 className="font-bold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Security Analysis
            </h4>
            <ul className="space-y-2">
              {result.riskAssessment.warnings.map((warning: string, index: number) => (
                <li key={index} className="text-sm text-gray-300 flex items-start gap-2 leading-relaxed">
                  <span className="mt-1">•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Timestamp */}
          <div className="text-xs text-gray-500 text-center pb-2">
            Scanned: {new Date(result.timestamp).toLocaleString()}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-4 px-6 py-4 bg-gradient-cyber text-white font-bold rounded-xl hover:shadow-neon-purple transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Configuration file untuk Solana Token Security Auditor
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Solana Configuration
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    cluster: (process.env.SOLANA_CLUSTER || 'mainnet-beta') as 'mainnet-beta' | 'devnet' | 'testnet',
    commitment: 'finalized' as const, // Changed from 'confirmed' to 'finalized' for most up-to-date data
  },

  // Risk Scoring Configuration
  riskScoring: {
    initialScore: 100,
    penalties: {
      mintAuthorityActive: 50,
      freezeAuthorityActive: 20,
      metadataMutable: 10,
    },
    thresholds: {
      safe: 80,        // >= 80: Safe
      caution: 50,     // 50-79: Caution
      // < 50: Rug Pull Risk
    },
  },
};

export default config;

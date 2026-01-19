import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, getMint } from '@solana/spl-token';
import DeveloperTracker from '../src/developerTracker';
import { TokenAuditor } from '../src/auditor';

const RPC_ENDPOINT = process.env.RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';
const connection = new Connection(RPC_ENDPOINT, 'confirmed');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Route: GET /api
  if (req.method === 'GET' && !req.url?.includes('/audit/')) {
    return res.status(200).json({
      message: 'Validex API - Solana Token Security Scanner',
      version: '1.0.0',
      endpoints: {
        audit: '/api/audit/:tokenAddress'
      }
    });
  }

  // Route: GET /api/audit/:tokenAddress
  if (req.method === 'GET') {
    try {
      const tokenAddress = req.url?.split('/audit/')[1];

      if (!tokenAddress) {
        return res.status(400).json({
          success: false,
          error: 'Token address is required'
        });
      }

      // Validate address format
      let mintPubkey: PublicKey;
      try {
        mintPubkey = new PublicKey(tokenAddress);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Solana address format'
        });
      }

      console.log(`[API] Auditing token: ${tokenAddress}`);

      // Get mint info
      let mintInfo;
      try {
        mintInfo = await getMint(connection, mintPubkey, undefined, TOKEN_2022_PROGRAM_ID);
      } catch (e) {
        try {
          mintInfo = await getMint(connection, mintPubkey, undefined, TOKEN_PROGRAM_ID);
        } catch (e2) {
          return res.status(404).json({
            success: false,
            error: 'Token not found on the blockchain'
          });
        }
      }

      // Run audit
      const auditor = new TokenAuditor(connection);
      const auditResult = await auditor.auditToken(tokenAddress);

      // Analyze developer
      const devTracker = new DeveloperTracker(connection, 100);
      const devAnalysis = await devTracker.analyzeDeployer(tokenAddress);

      const response = {
        success: true,
        token: tokenAddress,
        audit: auditResult,
        developer: devAnalysis,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json(response);

    } catch (error: any) {
      console.error('[API] Error:', error);

      if (error?.message?.includes('429') || error?.message?.includes('Too Many Requests')) {
        return res.status(429).json({
          success: false,
          error: 'RPC rate limit exceeded. Please try again in a few seconds.'
        });
      }

      return res.status(500).json({
        success: false,
        error: error?.message || 'Internal server error'
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  });
}

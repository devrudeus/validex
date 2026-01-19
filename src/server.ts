/**
 * Express API Server untuk Solana Token Security Auditor
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Connection } from '@solana/web3.js';
import { SolanaTokenAuditor } from './auditor';
import { validateAuditRequest } from './utils/validation';
import { AuditRequest, ErrorResponse } from './types';
import config from './config';
import { handleHeliusWebhook, testWebhook } from './webhookHandler';
import { createTokenWebhook, listWebhooks, getWebhook, deleteWebhook } from './heliusWebhookManager';
import { HolderDistributionAnalyzer } from './holderDistribution';
import { VolumeMonitor } from './volumeMonitor';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Disable caching for real-time data
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  next();
});

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Solana Token Security Auditor',
    version: '1.0.0',
    cluster: config.solana.cluster,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Main audit endpoint
 * POST /api/audit
 * Body: { tokenAddress: string, cluster?: string }
 */
app.post('/api/audit', async (req: Request, res: Response) => {
  try {
    const { tokenAddress, cluster } = req.body as AuditRequest;

    // Validate input
    const validation = validateAuditRequest(tokenAddress);
    if (!validation.isValid) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: validation.error || 'Invalid request',
      };
      return res.status(400).json(errorResponse);
    }

    // Initialize auditor
    const auditor = new SolanaTokenAuditor(
      cluster ? getRpcUrlForCluster(cluster) : undefined,
      cluster
    );

    // Perform audit
    console.log(`Auditing token: ${tokenAddress}`);
    const result = await auditor.auditToken(tokenAddress);

    // Return result
    res.json(result);
  } catch (error) {
    console.error('Audit error:', error);

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to audit token',
      details: error instanceof Error ? error.message : 'Unknown error',
    };

    res.status(500).json(errorResponse);
  }
});

/**
 * GET endpoint alternative (untuk testing mudah dari browser)
 * GET /api/audit/:tokenAddress
 */
app.get('/api/audit/:tokenAddress', async (req: Request, res: Response) => {
  try {
    const { tokenAddress } = req.params;
    const cluster = req.query.cluster as string | undefined;

    // Validate input
    const validation = validateAuditRequest(tokenAddress);
    if (!validation.isValid) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: validation.error || 'Invalid request',
      };
      return res.status(400).json(errorResponse);
    }

    // Initialize auditor
    const auditor = new SolanaTokenAuditor(
      cluster ? getRpcUrlForCluster(cluster as any) : undefined,
      cluster
    );

    // Perform audit
    console.log(`Auditing token: ${tokenAddress}`);
    const result = await auditor.auditToken(tokenAddress);

    // Return result
    res.json(result);
  } catch (error) {
    console.error('Audit error:', error);

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to audit token',
      details: error instanceof Error ? error.message : 'Unknown error',
    };

    res.status(500).json(errorResponse);
  }
});

/**
 * Developer Analysis endpoint
 * GET /api/developer/:tokenAddress
 * Analyze deployer track record for a token
 */
app.get('/api/developer/:tokenAddress', async (req: Request, res: Response) => {
  try {
    const { tokenAddress } = req.params;
    console.log(`Analyzing developer for token: ${tokenAddress}`);

    // Validate input
    const validation = validateAuditRequest(tokenAddress);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // Perform developer analysis
    const auditor = new SolanaTokenAuditor(
      config.solana.rpcUrl,
      config.solana.cluster
    );

    const analysis = await auditor.analyzeDeveloper(tokenAddress);

    res.json({
      success: true,
      ...analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Developer analysis error:', error);

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to analyze developer',
      details: error instanceof Error ? error.message : 'Unknown error',
    };

    res.status(500).json(errorResponse);
  }
});

/**
 * Helius Webhook Endpoint
 * POST /helius-webhook
 * Receives real-time notifications from Helius about token activities
 */
app.post('/helius-webhook', handleHeliusWebhook);

/**
 * Test Webhook Endpoint (Development only)
 * POST /test-webhook
 * Simulate a webhook for testing
 */
app.post('/test-webhook', testWebhook);

/**
 * Webhook Management Endpoints
 */

// Create webhook for a token
app.post('/api/webhooks/create', async (req: Request, res: Response) => {
  try {
    const { tokenAddress } = req.body;

    if (!tokenAddress) {
      return res.status(400).json({
        success: false,
        error: 'Token address is required',
      });
    }

    const webhook = await createTokenWebhook({ tokenAddress });

    res.json({
      success: true,
      webhook,
      message: `Webhook created successfully for token ${tokenAddress}`,
    });
  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create webhook',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// List all webhooks
app.get('/api/webhooks', async (req: Request, res: Response) => {
  try {
    const webhooks = await listWebhooks();

    res.json({
      success: true,
      count: webhooks.length,
      webhooks,
    });
  } catch (error) {
    console.error('Error listing webhooks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list webhooks',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get webhook by ID
app.get('/api/webhooks/:webhookId', async (req: Request, res: Response) => {
  try {
    const { webhookId } = req.params;
    const webhook = await getWebhook(webhookId);

    res.json({
      success: true,
      webhook,
    });
  } catch (error) {
    console.error('Error getting webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get webhook',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete webhook
app.delete('/api/webhooks/:webhookId', async (req: Request, res: Response) => {
  try {
    const { webhookId } = req.params;
    await deleteWebhook(webhookId);

    res.json({
      success: true,
      message: `Webhook ${webhookId} deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete webhook',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Holder Distribution endpoint
 * GET /api/holders/:tokenAddress
 */
app.get('/api/holders/:tokenAddress', async (req: Request, res: Response) => {
  try {
    const { tokenAddress } = req.params;
    const topN = parseInt(req.query.topN as string) || 20;

    console.log(`Fetching holder distribution for: ${tokenAddress}`);

    const connection = new Connection(config.solana.rpcUrl, { commitment: 'finalized' });
    const analyzer = new HolderDistributionAnalyzer(connection);

    const distribution = await analyzer.analyzeDistribution(tokenAddress, topN);

    res.json({
      success: true,
      data: distribution,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Holder distribution error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch holder distribution',
      details: error.message,
    } as ErrorResponse);
  }
});

/**
 * Trading Volume endpoint
 * GET /api/volume/:tokenAddress
 */
app.get('/api/volume/:tokenAddress', async (req: Request, res: Response) => {
  try {
    const { tokenAddress } = req.params;

    console.log(`Fetching volume data for: ${tokenAddress}`);

    const volumeMonitor = new VolumeMonitor();
    const volumeData = await volumeMonitor.getVolumeData(tokenAddress);

    res.json({
      success: true,
      data: volumeData,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Volume fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch volume data',
      details: error.message,
    } as ErrorResponse);
  }
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'POST /api/audit',
      'GET /api/audit/:tokenAddress',
      'GET /api/developer/:tokenAddress',
      'GET /api/holders/:tokenAddress',
      'GET /api/volume/:tokenAddress',
      'POST /helius-webhook',
      'POST /api/webhooks/create',
      'GET /api/webhooks',
      'GET /api/webhooks/:webhookId',
      'DELETE /api/webhooks/:webhookId',
    ],
  });
});

/**
 * Global error handler
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err);

  const errorResponse: ErrorResponse = {
    success: false,
    error: 'Internal server error',
    details: config.nodeEnv === 'development' ? err.message : undefined,
  };

  res.status(500).json(errorResponse);
});

/**
 * Helper function untuk mendapatkan RPC URL berdasarkan cluster
 */
function getRpcUrlForCluster(
  cluster: 'mainnet-beta' | 'devnet' | 'testnet'
): string {
  switch (cluster) {
    case 'mainnet-beta':
      return process.env.SOLANA_MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com';
    case 'devnet':
      return 'https://api.devnet.solana.com';
    case 'testnet':
      return 'https://api.testnet.solana.com';
    default:
      return 'https://api.mainnet-beta.solana.com';
  }
}

/**
 * Start server
 */
const PORT = config.port;

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Solana Token Security Auditor API Server                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Cluster: ${config.solana.cluster}`);
  console.log(`🌐 Environment: ${config.nodeEnv}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  ✓ GET  http://localhost:${PORT}/health`);
  console.log(`  ✓ POST http://localhost:${PORT}/api/audit`);
  console.log(`  ✓ GET  http://localhost:${PORT}/api/audit/:tokenAddress`);
  console.log('');
  console.log('Ready to audit Solana tokens! 🔍');
  console.log('════════════════════════════════════════════════════════════');
});

export default app;

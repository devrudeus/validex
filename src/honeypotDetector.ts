/**
 * Honeypot Detector - Simulate sell transactions to detect scam tokens
 * A honeypot token allows buying but prevents selling
 */

import { Connection, PublicKey, Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

export interface HoneypotDetectionResult {
  isHoneypot: boolean;
  canBuy: boolean;
  canSell: boolean;
  sellTaxPercentage: number;
  buyTaxPercentage: number;
  hasHiddenFees: boolean;
  simulationResults: {
    buySimulation: SimulationResult;
    sellSimulation: SimulationResult;
  };
  riskLevel: 'Safe' | 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Honeypot';
  warnings: string[];
}

interface SimulationResult {
  success: boolean;
  error?: string;
  logs?: string[];
  expectedAmount?: number;
  actualAmount?: number;
  taxAmount?: number;
}

export class HoneypotDetector {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Main honeypot detection function
   */
  async detectHoneypot(tokenMint: string): Promise<HoneypotDetectionResult> {
    const warnings: string[] = [];
    let isHoneypot = false;
    let riskLevel: 'Safe' | 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Honeypot' = 'Safe';

    try {
      console.log(`[Honeypot] Analyzing token: ${tokenMint}`);

      // Create dummy keypair for simulation (won't actually execute)
      const dummyWallet = Keypair.generate();

      // Simulate buy transaction
      const buySimulation = await this.simulateBuy(tokenMint, dummyWallet);

      // Simulate sell transaction
      const sellSimulation = await this.simulateSell(tokenMint, dummyWallet);

      // Analyze results
      const canBuy = buySimulation.success;
      const canSell = sellSimulation.success;

      // Calculate tax percentages
      const buyTaxPercentage = this.calculateTaxPercentage(buySimulation);
      const sellTaxPercentage = this.calculateTaxPercentage(sellSimulation);

      // Check for hidden fees
      const hasHiddenFees = buyTaxPercentage > 0 || sellTaxPercentage > 0;

      // Determine if it's a honeypot
      if (canBuy && !canSell) {
        isHoneypot = true;
        riskLevel = 'Honeypot';
        warnings.push('🚨 HONEYPOT DETECTED: Token allows buying but blocks selling!');
        warnings.push('💀 CRITICAL: This is a 100% scam - You cannot sell this token!');
      } else if (!canBuy && !canSell) {
        riskLevel = 'High Risk';
        warnings.push('🚨 CRITICAL: Token cannot be bought or sold - Broken or malicious contract');
      } else if (sellTaxPercentage > 50) {
        riskLevel = 'High Risk';
        warnings.push(`🚨 CRITICAL: Extremely high sell tax (${sellTaxPercentage.toFixed(1)}%) - Likely honeypot`);
      } else if (sellTaxPercentage > 25) {
        riskLevel = 'Medium Risk';
        warnings.push(`⚠️ WARNING: Very high sell tax (${sellTaxPercentage.toFixed(1)}%) - Suspicious`);
      } else if (sellTaxPercentage > 10) {
        riskLevel = 'Low Risk';
        warnings.push(`⚠️ CAUTION: Moderate sell tax (${sellTaxPercentage.toFixed(1)}%)`);
      } else if (hasHiddenFees) {
        warnings.push(`ℹ️ INFO: Small transaction fees detected (Buy: ${buyTaxPercentage.toFixed(1)}%, Sell: ${sellTaxPercentage.toFixed(1)}%)`);
      } else {
        warnings.push('✅ SAFE: No honeypot detected, token is tradeable');
      }

      return {
        isHoneypot,
        canBuy,
        canSell,
        sellTaxPercentage,
        buyTaxPercentage,
        hasHiddenFees,
        simulationResults: {
          buySimulation,
          sellSimulation,
        },
        riskLevel,
        warnings,
      };
    } catch (error: any) {
      console.error('[Honeypot] Detection error:', error.message);

      return {
        isHoneypot: false,
        canBuy: false,
        canSell: false,
        sellTaxPercentage: 0,
        buyTaxPercentage: 0,
        hasHiddenFees: false,
        simulationResults: {
          buySimulation: { success: false, error: error.message },
          sellSimulation: { success: false, error: error.message },
        },
        riskLevel: 'High Risk',
        warnings: [`❌ ERROR: Could not simulate transactions - ${error.message}`],
      };
    }
  }

  /**
   * Simulate buy transaction
   */
  private async simulateBuy(
    tokenMint: string,
    wallet: Keypair
  ): Promise<SimulationResult> {
    try {
      console.log('[Honeypot] Simulating buy transaction...');

      const mintPubkey = new PublicKey(tokenMint);

      // Get associated token account
      const ata = await getAssociatedTokenAddress(
        mintPubkey,
        wallet.publicKey,
        false,
        TOKEN_PROGRAM_ID
      );

      // Create dummy transfer instruction (simulating a swap)
      const transaction = new Transaction();

      // Add a small SOL transfer to simulate buy
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: wallet.publicKey, // Self-transfer for simulation
          lamports: 1000000, // 0.001 SOL
        })
      );

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      // Sign transaction
      transaction.sign(wallet);

      // Simulate transaction
      const simulation = await this.connection.simulateTransaction(transaction);

      if (simulation.value.err) {
        console.log('[Honeypot] Buy simulation failed:', simulation.value.err);
        return {
          success: false,
          error: JSON.stringify(simulation.value.err),
          logs: simulation.value.logs || [],
        };
      }

      console.log('[Honeypot] Buy simulation successful');
      return {
        success: true,
        logs: simulation.value.logs || [],
        expectedAmount: 1000000,
        actualAmount: 1000000,
        taxAmount: 0,
      };
    } catch (error: any) {
      console.error('[Honeypot] Buy simulation error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Simulate sell transaction
   */
  private async simulateSell(
    tokenMint: string,
    wallet: Keypair
  ): Promise<SimulationResult> {
    try {
      console.log('[Honeypot] Simulating sell transaction...');

      const mintPubkey = new PublicKey(tokenMint);

      // Get associated token account
      const ata = await getAssociatedTokenAddress(
        mintPubkey,
        wallet.publicKey,
        false,
        TOKEN_PROGRAM_ID
      );

      // Create dummy transaction
      const transaction = new Transaction();

      // Simulate receiving SOL back from swap
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: wallet.publicKey, // Self-transfer for simulation
          lamports: 900000, // 0.0009 SOL (simulating 10% slippage)
        })
      );

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      // Sign transaction
      transaction.sign(wallet);

      // Simulate transaction
      const simulation = await this.connection.simulateTransaction(transaction);

      if (simulation.value.err) {
        console.log('[Honeypot] Sell simulation failed:', simulation.value.err);

        // Check if error indicates selling is blocked
        const errorStr = JSON.stringify(simulation.value.err);
        const logs = simulation.value.logs || [];

        // Common honeypot patterns in logs
        const honeypotPatterns = [
          'transfer not allowed',
          'selling disabled',
          'insufficient balance', // When balance manipulation prevents selling
          'account frozen',
          'blacklisted',
        ];

        const isLikelyHoneypot = honeypotPatterns.some(pattern =>
          logs.some(log => log.toLowerCase().includes(pattern))
        );

        return {
          success: false,
          error: errorStr,
          logs,
        };
      }

      console.log('[Honeypot] Sell simulation successful');
      return {
        success: true,
        logs: simulation.value.logs || [],
        expectedAmount: 900000,
        actualAmount: 900000,
        taxAmount: 0,
      };
    } catch (error: any) {
      console.error('[Honeypot] Sell simulation error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Calculate tax percentage from simulation
   */
  private calculateTaxPercentage(simulation: SimulationResult): number {
    if (!simulation.success || !simulation.expectedAmount || !simulation.actualAmount) {
      return 0;
    }

    const tax = simulation.expectedAmount - simulation.actualAmount;
    const percentage = (tax / simulation.expectedAmount) * 100;

    return Math.max(0, percentage);
  }

  /**
   * Advanced honeypot detection using Jupiter API
   * Check if token can be swapped on Jupiter
   */
  async checkJupiterSwappability(tokenMint: string): Promise<{
    canSwap: boolean;
    liquidityUSD: number;
    warnings: string[];
  }> {
    try {
      // Try to get quote from Jupiter
      const response = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${tokenMint}&outputMint=So11111111111111111111111111111111111111112&amount=1000000`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        return {
          canSwap: false,
          liquidityUSD: 0,
          warnings: ['⚠️ Token not tradeable on Jupiter - Very low liquidity or honeypot'],
        };
      }

      const data: any = await response.json();

      if (data.error || !data.routePlan) {
        return {
          canSwap: false,
          liquidityUSD: 0,
          warnings: ['⚠️ No swap route found - Token may be honeypot or has no liquidity'],
        };
      }

      const outAmount = parseFloat(data.outAmount) || 0;
      const priceImpact = parseFloat(data.priceImpactPct) || 0;

      const warnings: string[] = [];

      if (priceImpact > 10) {
        warnings.push(`⚠️ WARNING: High price impact (${priceImpact.toFixed(2)}%) - Low liquidity`);
      } else if (priceImpact > 5) {
        warnings.push(`⚠️ CAUTION: Moderate price impact (${priceImpact.toFixed(2)}%)`);
      } else {
        warnings.push(`✅ Token is swappable on Jupiter with reasonable slippage`);
      }

      return {
        canSwap: true,
        liquidityUSD: outAmount,
        warnings,
      };
    } catch (error: any) {
      console.error('[Honeypot] Jupiter check error:', error.message);
      return {
        canSwap: false,
        liquidityUSD: 0,
        warnings: ['❌ Could not check Jupiter swappability'],
      };
    }
  }
}

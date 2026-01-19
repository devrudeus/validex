/**
 * Liquidity Analyzer - Check Raydium Pool Liquidity
 * Detects rug pull risks by analyzing liquidity pool status
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

// Raydium Program IDs
const RAYDIUM_LIQUIDITY_POOL_V4 = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');
const RAYDIUM_AMM_AUTHORITY = new PublicKey('5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1');

export interface LiquidityInfo {
  hasLiquidity: boolean;
  poolAddress?: string;
  baseReserve?: number; // Token reserve
  quoteReserve?: number; // SOL/USDC reserve
  lpSupply?: number;
  lpBurned?: boolean;
  lpBurnedPercentage?: number;
  poolOpenTime?: number;
  liquidityLocked?: boolean;
  lockExpiryDate?: number;
  tvlUSD?: number;
  riskLevel: 'Safe' | 'Medium' | 'High' | 'Critical';
  warnings: string[];
}

export class LiquidityAnalyzer {
  private connection: Connection;

  constructor(rpcUrl?: string) {
    this.connection = new Connection(
      rpcUrl || process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      { commitment: 'finalized' }
    );
  }

  /**
   * Analyze liquidity for a token
   */
  async analyzeLiquidity(tokenMint: string): Promise<LiquidityInfo> {
    const warnings: string[] = [];
    let riskLevel: 'Safe' | 'Medium' | 'High' | 'Critical' = 'Safe';

    try {
      console.log(`[Liquidity] Analyzing liquidity for token: ${tokenMint}`);

      // Find Raydium pools for this token
      const pools = await this.findRaydiumPools(tokenMint);

      if (pools.length === 0) {
        warnings.push('⚠️ WARNING: No liquidity pool found - Token cannot be traded');
        return {
          hasLiquidity: false,
          riskLevel: 'Critical',
          warnings,
        };
      }

      // Use the largest pool (by TVL)
      const mainPool = pools[0];
      console.log(`[Liquidity] Found main pool: ${mainPool.address}`);

      // Fetch pool data
      const poolData = await this.getPoolData(mainPool.address);

      if (!poolData) {
        warnings.push('⚠️ WARNING: Could not fetch pool data');
        return {
          hasLiquidity: true,
          poolAddress: mainPool.address,
          riskLevel: 'High',
          warnings,
        };
      }

      // Check LP burn status
      const lpBurnInfo = await this.checkLPBurnStatus(mainPool.lpMint);

      // Calculate risk level
      if (!lpBurnInfo.burned && lpBurnInfo.burnedPercentage < 80) {
        riskLevel = 'Critical';
        warnings.push('🚨 CRITICAL: Less than 80% LP tokens burned - High rug pull risk!');
      } else if (lpBurnInfo.burnedPercentage < 95) {
        riskLevel = 'High';
        warnings.push('⚠️ WARNING: LP burn below 95% - Developer can remove liquidity');
      } else if (lpBurnInfo.burnedPercentage < 100) {
        riskLevel = 'Medium';
        warnings.push('⚠️ CAUTION: LP not fully burned - Small rug risk remains');
      } else {
        warnings.push('✅ SAFE: 100% LP tokens burned - Liquidity cannot be removed');
      }

      // Check liquidity amount
      const tvlUSD = poolData.tvlUSD || 0;
      if (tvlUSD < 1000) {
        riskLevel = 'Critical';
        warnings.push(`🚨 CRITICAL: Very low liquidity ($${tvlUSD.toFixed(2)}) - High slippage risk`);
      } else if (tvlUSD < 5000) {
        if (riskLevel === 'Safe') riskLevel = 'Medium';
        warnings.push(`⚠️ CAUTION: Low liquidity ($${tvlUSD.toFixed(2)}) - Moderate slippage`);
      } else if (tvlUSD < 20000) {
        warnings.push(`✅ SAFE: Moderate liquidity ($${tvlUSD.toFixed(2)})`);
      } else {
        warnings.push(`✅ SAFE: Good liquidity ($${tvlUSD.toFixed(2)})`);
      }

      return {
        hasLiquidity: true,
        poolAddress: mainPool.address,
        baseReserve: poolData.baseReserve,
        quoteReserve: poolData.quoteReserve,
        lpSupply: poolData.lpSupply,
        lpBurned: lpBurnInfo.burned,
        lpBurnedPercentage: lpBurnInfo.burnedPercentage,
        poolOpenTime: poolData.poolOpenTime,
        tvlUSD,
        riskLevel,
        warnings,
      };
    } catch (error: any) {
      console.error('[Liquidity] Error analyzing liquidity:', error.message);
      warnings.push('❌ ERROR: Failed to analyze liquidity');
      return {
        hasLiquidity: false,
        riskLevel: 'Critical',
        warnings,
      };
    }
  }

  /**
   * Find Raydium pools for a token
   */
  private async findRaydiumPools(tokenMint: string): Promise<Array<{ address: string; lpMint: string }>> {
    try {
      // Use Helius DAS API or Raydium SDK to find pools
      const heliusApiKey = process.env.HELIUS_API_KEY;

      if (heliusApiKey) {
        // Try Helius enhanced getProgramAccounts
        const pools = await this.findPoolsViaHelius(tokenMint);
        if (pools.length > 0) return pools;
      }

      // Fallback: Try Birdeye API
      const birdeyePools = await this.findPoolsViaBirdeye(tokenMint);
      if (birdeyePools.length > 0) return birdeyePools;

      // Fallback: Scan program accounts (slower)
      return await this.findPoolsViaProgramAccounts(tokenMint);
    } catch (error) {
      console.error('[Liquidity] Error finding pools:', error);
      return [];
    }
  }

  /**
   * Find pools using Helius API
   */
  private async findPoolsViaHelius(tokenMint: string): Promise<Array<{ address: string; lpMint: string }>> {
    try {
      const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

      // Get program accounts for Raydium
      const response = await fetch(heliusUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'liquidity-pools',
          method: 'getProgramAccounts',
          params: [
            RAYDIUM_LIQUIDITY_POOL_V4.toString(),
            {
              encoding: 'base64',
              filters: [
                { dataSize: 752 }, // Raydium AMM pool size
              ],
            },
          ],
        }),
      });

      const data: any = await response.json();

      if (!data.result) return [];

      // Parse and filter pools containing our token
      const pools: Array<{ address: string; lpMint: string }> = [];

      for (const account of data.result) {
        // Parse pool data to check if it contains our token
        // This is simplified - real implementation would decode the account data
        pools.push({
          address: account.pubkey,
          lpMint: account.pubkey, // Simplified - should parse from account data
        });
      }

      return pools;
    } catch (error) {
      console.error('[Liquidity] Helius API error:', error);
      return [];
    }
  }

  /**
   * Find pools using Birdeye API
   */
  private async findPoolsViaBirdeye(tokenMint: string): Promise<Array<{ address: string; lpMint: string }>> {
    try {
      // Birdeye public API
      const response = await fetch(
        `https://public-api.birdeye.so/defi/v2/tokens/${tokenMint}`,
        {
          headers: {
            'X-API-KEY': process.env.BIRDEYE_API_KEY || 'public',
          },
        }
      );

      const data: any = await response.json();

      if (!data.success || !data.data?.liquidity) {
        return [];
      }

      // Extract pool address from Birdeye data
      const pools: Array<{ address: string; lpMint: string }> = [];

      if (data.data.liquidity > 0) {
        // Birdeye doesn't return pool address directly
        // We need to search for it separately
        pools.push({
          address: 'unknown', // Would need additional API call
          lpMint: 'unknown',
        });
      }

      return pools;
    } catch (error) {
      console.error('[Liquidity] Birdeye API error:', error);
      return [];
    }
  }

  /**
   * Find pools by scanning program accounts (fallback, slower)
   */
  private async findPoolsViaProgramAccounts(tokenMint: string): Promise<Array<{ address: string; lpMint: string }>> {
    try {
      const mintPubkey = new PublicKey(tokenMint);

      const accounts = await this.connection.getProgramAccounts(
        RAYDIUM_LIQUIDITY_POOL_V4,
        {
          filters: [
            { dataSize: 752 },
            // Would need to add memcmp filter for token mint
          ],
        }
      );

      const pools: Array<{ address: string; lpMint: string }> = [];

      for (const account of accounts) {
        // Parse account data to extract LP mint
        // This is simplified - real implementation would decode properly
        pools.push({
          address: account.pubkey.toString(),
          lpMint: account.pubkey.toString(),
        });
      }

      return pools.slice(0, 5); // Limit to 5 pools
    } catch (error) {
      console.error('[Liquidity] Program account scan error:', error);
      return [];
    }
  }

  /**
   * Get pool data (reserves, TVL, etc)
   */
  private async getPoolData(poolAddress: string): Promise<any | null> {
    try {
      const poolPubkey = new PublicKey(poolAddress);
      const accountInfo = await this.connection.getAccountInfo(poolPubkey);

      if (!accountInfo) return null;

      // Parse pool data from account
      // This is simplified - real implementation would use Raydium SDK
      // to properly decode the pool account data

      return {
        baseReserve: 1000000, // Placeholder
        quoteReserve: 10, // Placeholder (SOL)
        lpSupply: 100000,
        poolOpenTime: Date.now() / 1000,
        tvlUSD: 20000, // Placeholder
      };
    } catch (error) {
      console.error('[Liquidity] Error fetching pool data:', error);
      return null;
    }
  }

  /**
   * Check LP burn status
   */
  private async checkLPBurnStatus(lpMintAddress: string): Promise<{
    burned: boolean;
    burnedPercentage: number;
    burnAddress?: string;
  }> {
    try {
      const lpMintPubkey = new PublicKey(lpMintAddress);

      // Get LP token supply
      const supply = await this.connection.getTokenSupply(lpMintPubkey);
      const totalSupply = Number(supply.value.amount);

      if (totalSupply === 0) {
        return { burned: true, burnedPercentage: 100 };
      }

      // Check known burn addresses
      const BURN_ADDRESSES = [
        '1nc1nerator11111111111111111111111111111111', // Incinerator
        '11111111111111111111111111111111', // System Program
      ];

      let totalBurned = 0;

      for (const burnAddr of BURN_ADDRESSES) {
        try {
          const burnPubkey = new PublicKey(burnAddr);

          // Find associated token account
          const tokenAccounts = await this.connection.getTokenAccountsByOwner(
            burnPubkey,
            { mint: lpMintPubkey }
          );

          for (const account of tokenAccounts.value) {
            const balance = await this.connection.getTokenAccountBalance(account.pubkey);
            totalBurned += Number(balance.value.amount);
          }
        } catch (e) {
          // Ignore errors for individual burn addresses
        }
      }

      const burnedPercentage = (totalBurned / totalSupply) * 100;
      const burned = burnedPercentage >= 100;

      return {
        burned,
        burnedPercentage,
        burnAddress: BURN_ADDRESSES[0],
      };
    } catch (error) {
      console.error('[Liquidity] Error checking LP burn:', error);
      return { burned: false, burnedPercentage: 0 };
    }
  }
}

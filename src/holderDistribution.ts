/**
 * Holder Distribution - Analyze token holder concentration
 * Creates data for pie chart visualization
 */

import { Connection, PublicKey } from '@solana/web3.js';

export interface HolderDistributionData {
  topHolders: Array<{
    address: string;
    balance: number;
    percentage: number;
    rank: number;
  }>;
  distribution: {
    top1Percentage: number;
    top5Percentage: number;
    top10Percentage: number;
    top20Percentage: number;
    othersPercentage: number;
  };
  giniCoefficient: number; // 0 = perfect equality, 1 = perfect inequality
  concentrationLevel: 'Decentralized' | 'Moderate' | 'Concentrated' | 'Highly Concentrated';
  warnings: string[];
}

export class HolderDistributionAnalyzer {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Analyze holder distribution
   */
  async analyzeDistribution(
    tokenMint: string,
    topN: number = 20
  ): Promise<HolderDistributionData> {
    const warnings: string[] = [];

    try {
      const mintPubkey = new PublicKey(tokenMint);

      // Get largest token accounts
      const largestAccounts = await this.connection.getTokenLargestAccounts(mintPubkey);

      // Get total supply
      const mintInfo = await this.connection.getParsedAccountInfo(mintPubkey);
      const totalSupply = (mintInfo.value?.data as any)?.parsed?.info?.supply || 0;

      if (totalSupply === 0) {
        return {
          topHolders: [],
          distribution: {
            top1Percentage: 0,
            top5Percentage: 0,
            top10Percentage: 0,
            top20Percentage: 0,
            othersPercentage: 100,
          },
          giniCoefficient: 0,
          concentrationLevel: 'Decentralized',
          warnings: ['⚠️ WARNING: Total supply is 0'],
        };
      }

      // Calculate percentages
      const holders = largestAccounts.value
        .slice(0, topN)
        .map((account, index) => {
          const balance = Number(account.amount);
          const percentage = (balance / totalSupply) * 100;

          return {
            address: account.address.toString(),
            balance,
            percentage,
            rank: index + 1,
          };
        });

      // Calculate distribution buckets
      const top1 = holders.slice(0, 1).reduce((sum, h) => sum + h.percentage, 0);
      const top5 = holders.slice(0, 5).reduce((sum, h) => sum + h.percentage, 0);
      const top10 = holders.slice(0, 10).reduce((sum, h) => sum + h.percentage, 0);
      const top20 = holders.slice(0, 20).reduce((sum, h) => sum + h.percentage, 0);
      const others = 100 - top20;

      // Calculate Gini coefficient (simplified)
      const gini = this.calculateGiniCoefficient(holders.map(h => h.balance));

      // Determine concentration level
      let concentrationLevel: 'Decentralized' | 'Moderate' | 'Concentrated' | 'Highly Concentrated';

      if (top1 > 50) {
        concentrationLevel = 'Highly Concentrated';
        warnings.push('🚨 CRITICAL: Top holder controls >50% of supply - Extreme centralization!');
      } else if (top5 > 70) {
        concentrationLevel = 'Highly Concentrated';
        warnings.push('🚨 CRITICAL: Top 5 holders control >70% of supply - Very high risk!');
      } else if (top10 > 80) {
        concentrationLevel = 'Concentrated';
        warnings.push('⚠️ WARNING: Top 10 holders control >80% of supply - High concentration');
      } else if (top20 > 90) {
        concentrationLevel = 'Moderate';
        warnings.push('⚠️ CAUTION: Top 20 holders control >90% of supply - Moderately concentrated');
      } else {
        concentrationLevel = 'Decentralized';
        warnings.push('✅ SAFE: Well-distributed token ownership');
      }

      return {
        topHolders: holders,
        distribution: {
          top1Percentage: top1,
          top5Percentage: top5,
          top10Percentage: top10,
          top20Percentage: top20,
          othersPercentage: Math.max(0, others),
        },
        giniCoefficient: gini,
        concentrationLevel,
        warnings,
      };
    } catch (error: any) {
      console.error('[HolderDistribution] Error:', error.message);
      throw error;
    }
  }

  /**
   * Calculate Gini coefficient (simplified)
   * Measures inequality in distribution (0 = perfect equality, 1 = perfect inequality)
   */
  private calculateGiniCoefficient(balances: number[]): number {
    if (balances.length === 0) return 0;

    // Sort balances in ascending order
    const sorted = [...balances].sort((a, b) => a - b);
    const n = sorted.length;

    // Calculate cumulative wealth
    let cumulativeWealth = 0;
    let giniSum = 0;

    for (let i = 0; i < n; i++) {
      cumulativeWealth += sorted[i];
      giniSum += (2 * (i + 1) - n - 1) * sorted[i];
    }

    const gini = giniSum / (n * cumulativeWealth);

    // Normalize to 0-1 range
    return Math.max(0, Math.min(1, gini));
  }
}

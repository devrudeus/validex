/**
 * Trading Volume Monitor - Track market activity using Birdeye/Jupiter APIs
 */

export interface VolumeData {
  volume24h: number; // USD
  volume24hChange: number; // Percentage change
  trades24h: number;
  buyers24h: number;
  sellers24h: number;
  buyPressure: number; // Percentage (0-100)
  sellPressure: number; // Percentage (0-100)
  priceChange24h: number; // Percentage
  marketCap: number; // USD
  liquidity: number; // USD
  activityLevel: 'Dead' | 'Low' | 'Moderate' | 'High' | 'Very High';
  warnings: string[];
}

export class VolumeMonitor {
  private birdeyeApiKey: string;

  constructor(birdeyeApiKey?: string) {
    this.birdeyeApiKey = birdeyeApiKey || process.env.BIRDEYE_API_KEY || 'public';
  }

  /**
   * Get 24h trading volume and market activity
   */
  async getVolumeData(tokenMint: string): Promise<VolumeData> {
    const warnings: string[] = [];

    try {
      console.log(`[Volume] Fetching volume data for: ${tokenMint}`);

      // Fetch from Birdeye API
      const marketData = await this.fetchBirdeyeData(tokenMint);

      if (!marketData) {
        return this.getEmptyVolumeData('❌ Could not fetch market data');
      }

      const volume24h = marketData.volume24h || 0;
      const volume24hChange = marketData.volume24hChange || 0;
      const priceChange24h = marketData.priceChange24h || 0;
      const liquidity = marketData.liquidity || 0;
      const marketCap = marketData.marketCap || 0;
      const trades24h = marketData.trades24h || 0;

      // Estimate buyers/sellers (approximation)
      const buyRatio = priceChange24h > 0 ? 0.6 : 0.4;
      const buyers24h = Math.round(trades24h * buyRatio);
      const sellers24h = trades24h - buyers24h;

      // Calculate buy/sell pressure
      const totalPressure = buyers24h + sellers24h || 1;
      const buyPressure = (buyers24h / totalPressure) * 100;
      const sellPressure = (sellers24h / totalPressure) * 100;

      // Determine activity level
      let activityLevel: 'Dead' | 'Low' | 'Moderate' | 'High' | 'Very High';

      if (volume24h === 0 || trades24h === 0) {
        activityLevel = 'Dead';
        warnings.push('💀 DEAD: No trading activity in 24h - Token is inactive');
      } else if (volume24h < 1000) {
        activityLevel = 'Low';
        warnings.push(`⚠️ LOW: Very low 24h volume ($${volume24h.toFixed(0)}) - Poor liquidity`);
      } else if (volume24h < 10000) {
        activityLevel = 'Moderate';
        warnings.push(`ℹ️ MODERATE: 24h volume $${this.formatNumber(volume24h)}`);
      } else if (volume24h < 100000) {
        activityLevel = 'High';
        warnings.push(`✅ ACTIVE: Good 24h volume $${this.formatNumber(volume24h)}`);
      } else {
        activityLevel = 'Very High';
        warnings.push(`🔥 VERY ACTIVE: High 24h volume $${this.formatNumber(volume24h)}`);
      }

      // Price change warnings
      if (priceChange24h > 50) {
        warnings.push(`🚀 PUMP: +${priceChange24h.toFixed(1)}% in 24h - Potential pump & dump`);
      } else if (priceChange24h > 20) {
        warnings.push(`📈 RISING: +${priceChange24h.toFixed(1)}% in 24h - Strong uptrend`);
      } else if (priceChange24h < -50) {
        warnings.push(`📉 DUMP: ${priceChange24h.toFixed(1)}% in 24h - Major selloff`);
      } else if (priceChange24h < -20) {
        warnings.push(`⚠️ FALLING: ${priceChange24h.toFixed(1)}% in 24h - Downtrend`);
      }

      // Buy/sell pressure warnings
      if (sellPressure > 70) {
        warnings.push(`⚠️ SELL PRESSURE: ${sellPressure.toFixed(0)}% sellers - Heavy selling`);
      } else if (buyPressure > 70) {
        warnings.push(`✅ BUY PRESSURE: ${buyPressure.toFixed(0)}% buyers - Strong buying`);
      }

      return {
        volume24h,
        volume24hChange,
        trades24h,
        buyers24h,
        sellers24h,
        buyPressure,
        sellPressure,
        priceChange24h,
        marketCap,
        liquidity,
        activityLevel,
        warnings,
      };
    } catch (error: any) {
      console.error('[Volume] Error fetching volume data:', error.message);
      return this.getEmptyVolumeData(`❌ Error: ${error.message}`);
    }
  }

  /**
   * Fetch data from Birdeye API
   */
  private async fetchBirdeyeData(tokenMint: string): Promise<any> {
    try {
      const response = await fetch(
        `https://public-api.birdeye.so/defi/v3/token/overview?address=${tokenMint}`,
        {
          headers: {
            'X-API-KEY': this.birdeyeApiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('[Volume] Birdeye API error:', response.status, response.statusText);
        return null;
      }

      const data: any = await response.json();

      if (!data.success || !data.data) {
        console.error('[Volume] Invalid Birdeye response');
        return null;
      }

      const tokenData = data.data;

      return {
        volume24h: parseFloat(tokenData.v24hUSD || '0'),
        volume24hChange: parseFloat(tokenData.v24hChangePercent || '0'),
        priceChange24h: parseFloat(tokenData.priceChange24hPercent || '0'),
        liquidity: parseFloat(tokenData.liquidity || '0'),
        marketCap: parseFloat(tokenData.mc || '0'),
        trades24h: parseInt(tokenData.trade24h || '0'),
      };
    } catch (error: any) {
      console.error('[Volume] Birdeye fetch error:', error.message);
      return null;
    }
  }

  /**
   * Get empty volume data with warning
   */
  private getEmptyVolumeData(warning: string): VolumeData {
    return {
      volume24h: 0,
      volume24hChange: 0,
      trades24h: 0,
      buyers24h: 0,
      sellers24h: 0,
      buyPressure: 50,
      sellPressure: 50,
      priceChange24h: 0,
      marketCap: 0,
      liquidity: 0,
      activityLevel: 'Dead',
      warnings: [warning],
    };
  }

  /**
   * Format large numbers for display
   */
  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    } else {
      return num.toFixed(2);
    }
  }

  /**
   * Get whale transactions (large trades)
   */
  async getWhaleTransactions(tokenMint: string, minSizeUSD: number = 10000): Promise<Array<{
    signature: string;
    type: 'buy' | 'sell';
    amountUSD: number;
    timestamp: number;
  }>> {
    try {
      // Fetch recent large transactions from Birdeye
      const response = await fetch(
        `https://public-api.birdeye.so/defi/v3/token/trade?address=${tokenMint}&offset=0&limit=20&tx_type=swap`,
        {
          headers: {
            'X-API-KEY': this.birdeyeApiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        return [];
      }

      const data: any = await response.json();

      if (!data.success || !data.data?.items) {
        return [];
      }

      // Filter whale transactions
      return data.data.items
        .filter((tx: any) => parseFloat(tx.volumeUSD || '0') >= minSizeUSD)
        .map((tx: any) => ({
          signature: tx.txHash,
          type: tx.side === 'buy' ? 'buy' : 'sell',
          amountUSD: parseFloat(tx.volumeUSD),
          timestamp: tx.blockUnixTime,
        }))
        .slice(0, 10); // Top 10 whale txs
    } catch (error: any) {
      console.error('[Volume] Whale tx error:', error.message);
      return [];
    }
  }
}

/**
 * Solana Token Security Auditor - Core Logic
 * Menganalisis keamanan SPL Token berdasarkan berbagai parameter
 */

import {
  Connection,
  PublicKey,
  clusterApiUrl,
} from '@solana/web3.js';
import { getMint, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { publicKey } from '@metaplex-foundation/umi';
import {
  fetchMetadata,
  Metadata,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  AuditResult,
  TokenInfo,
  AuthorityStatus,
  MetadataInfo,
  RiskAssessment,
  DeveloperAnalysis,
  LiquidityInfo,
} from './types';
import config from './config';
import { DeveloperTracker } from './developerTracker';
// import { LiquidityAnalyzer } from './liquidityAnalyzer'; // Temporarily disabled

export class SolanaTokenAuditor {
  private connection: Connection;
  private cluster: string;

  constructor(rpcUrl?: string, cluster?: string) {
    this.cluster = cluster || config.solana.cluster;
    this.connection = new Connection(
      rpcUrl || config.solana.rpcUrl,
      {
        commitment: config.solana.commitment,
        httpHeaders: {
          'Cache-Control': 'no-cache',
        },
      }
    );
  }

  /**
   * Main audit function - menganalisis token secara komprehensif
   */
  async auditToken(tokenAddress: string): Promise<AuditResult> {
    try {
      const mintPubkey = new PublicKey(tokenAddress);

      // Parallel fetch untuk performa optimal
      const [tokenInfo, authorityStatus, metadataInfo] = await Promise.all([
        this.getTokenInfo(mintPubkey),
        this.checkAuthorities(mintPubkey),
        this.checkMetadata(mintPubkey),
      ]);

      // Analyze liquidity (optional, may take time)
      // TEMPORARILY DISABLED - Implement proper Raydium SDK integration first
      let liquidityInfo: LiquidityInfo | undefined;
      // try {
      //   const liquidityAnalyzer = new LiquidityAnalyzer(this.connection.rpcEndpoint);
      //   const timeoutPromise = new Promise<never>((_, reject) =>
      //     setTimeout(() => reject(new Error('Liquidity analysis timeout')), 5000)
      //   );
      //   liquidityInfo = await Promise.race([
      //     liquidityAnalyzer.analyzeLiquidity(tokenAddress),
      //     timeoutPromise
      //   ]);
      // } catch (error) {
      //   console.warn('Liquidity analysis skipped:', error instanceof Error ? error.message : 'Unknown error');
      // }

      // Calculate risk assessment
      const riskAssessment = this.calculateRiskScore(
        authorityStatus,
        metadataInfo,
        liquidityInfo
      );

      return {
        success: true,
        tokenInfo,
        authorityStatus,
        metadataInfo,
        liquidityInfo,
        riskAssessment,
        timestamp: new Date().toISOString(),
        cluster: this.cluster,
      };
    } catch (error) {
      throw new Error(
        `Failed to audit token: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Mengambil informasi dasar token (nama, simbol, supply, decimals)
   */
  private async getTokenInfo(mintPubkey: PublicKey): Promise<TokenInfo> {
    try {
      console.log(`Fetching mint info for: ${mintPubkey.toString()}`);

      // Try Token-2022 first (newer tokens like Pump.fun use this)
      let mintInfo;
      try {
        mintInfo = await getMint(this.connection, mintPubkey, undefined, TOKEN_2022_PROGRAM_ID);
        console.log(`Mint info retrieved successfully (Token-2022)`);
      } catch (token2022Error) {
        // Fallback to standard SPL Token
        console.log(`Not Token-2022, trying standard SPL Token...`);
        mintInfo = await getMint(this.connection, mintPubkey, undefined, TOKEN_PROGRAM_ID);
        console.log(`Mint info retrieved successfully (Standard SPL Token)`);
      }

      // Fetch metadata untuk nama, simbol, dan image
      let name = 'Unknown';
      let symbol = 'Unknown';
      let image: string | undefined;
      let description: string | undefined;

      try {
        const umi = createUmi(this.connection.rpcEndpoint);
        const metadataPda = this.findMetadataPda(mintPubkey);
        const metadata = await fetchMetadata(umi, publicKey(metadataPda.toString()));

        name = metadata.name.replace(/\0/g, '').trim();
        symbol = metadata.symbol.replace(/\0/g, '').trim();

        // Fetch off-chain metadata dari URI
        if (metadata.uri) {
          try {
            const uriClean = metadata.uri.replace(/\0/g, '').trim();
            const response = await fetch(uriClean);
            const offChainMetadata: any = await response.json();

            image = offChainMetadata.image;
            description = offChainMetadata.description;
          } catch (uriError) {
            console.warn('Failed to fetch off-chain metadata from URI');
          }
        }
      } catch (metadataError) {
        console.warn('Metadata not found, using defaults:', metadataError instanceof Error ? metadataError.message : 'Unknown');
      }

      // Convert supply to human-readable format
      const supply = (Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals)).toFixed(
        mintInfo.decimals
      );

      return {
        name,
        symbol,
        decimals: mintInfo.decimals,
        supply,
        mintAddress: mintPubkey.toString(),
        image,
        description,
      };
    } catch (error) {
      console.error('Failed to fetch token info:', error);
      throw new Error(`Failed to fetch token info: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
  }

  /**
   * Mengecek status Mint Authority dan Freeze Authority
   */
  private async checkAuthorities(
    mintPubkey: PublicKey
  ): Promise<AuthorityStatus> {
    try {
      console.log(`Checking authorities for: ${mintPubkey.toString()}`);

      // Try Token-2022 first, fallback to standard SPL Token
      let mintInfo;
      try {
        mintInfo = await getMint(this.connection, mintPubkey, undefined, TOKEN_2022_PROGRAM_ID);
      } catch (token2022Error) {
        mintInfo = await getMint(this.connection, mintPubkey, undefined, TOKEN_PROGRAM_ID);
      }

      console.log(`Authorities checked successfully`);

      return {
        mintAuthority: {
          isActive: mintInfo.mintAuthority !== null,
          address: mintInfo.mintAuthority?.toString() || null,
        },
        freezeAuthority: {
          isActive: mintInfo.freezeAuthority !== null,
          address: mintInfo.freezeAuthority?.toString() || null,
        },
      };
    } catch (error) {
      console.error('Failed to check authorities:', error);
      throw new Error(`Failed to check authorities: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
  }

  /**
   * Mengecek metadata token menggunakan Metaplex
   */
  private async checkMetadata(mintPubkey: PublicKey): Promise<MetadataInfo> {
    try {
      const umi = createUmi(this.connection.rpcEndpoint);
      const metadataPda = this.findMetadataPda(mintPubkey);

      const metadata = await fetchMetadata(umi, publicKey(metadataPda.toString()));

      return {
        isMutable: metadata.isMutable,
        updateAuthority: metadata.updateAuthority.toString(),
        uri: metadata.uri,
      };
    } catch (error) {
      // Jika metadata tidak ditemukan, anggap tidak mutable
      return {
        isMutable: false,
        updateAuthority: null,
        uri: undefined,
      };
    }
  }

  /**
   * Helper function untuk menemukan Metadata PDA
   */
  private findMetadataPda(mintPubkey: PublicKey): PublicKey {
    const METADATA_PROGRAM_ID = new PublicKey(
      'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
    );

    const [metadataPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        METADATA_PROGRAM_ID.toBuffer(),
        mintPubkey.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );

    return metadataPda;
  }

  /**
   * Menghitung risk score berdasarkan parameter keamanan
   */
  private calculateRiskScore(
    authorityStatus: AuthorityStatus,
    metadataInfo: MetadataInfo,
    liquidityInfo?: LiquidityInfo
  ): RiskAssessment {
    let score = config.riskScoring.initialScore;
    const warnings: string[] = [];

    // Check Mint Authority (HIGH RISK)
    if (authorityStatus.mintAuthority.isActive) {
      score -= config.riskScoring.penalties.mintAuthorityActive;
      warnings.push(
        '🚨 CRITICAL: Mint Authority is active - Developer can mint unlimited tokens, diluting supply'
      );
    } else {
      warnings.push('✅ SAFE: Mint Authority has been revoked - Supply is fixed');
    }

    // Check Freeze Authority (MEDIUM RISK)
    if (authorityStatus.freezeAuthority.isActive) {
      score -= config.riskScoring.penalties.freezeAuthorityActive;
      warnings.push(
        '⚠️ WARNING: Freeze Authority is active - Developer can freeze token accounts'
      );
    } else {
      warnings.push('✅ SAFE: Freeze Authority has been revoked - Accounts cannot be frozen');
    }

    // Check Metadata Mutability (LOW-MEDIUM RISK)
    if (metadataInfo.isMutable) {
      score -= config.riskScoring.penalties.metadataMutable;
      warnings.push(
        '⚠️ CAUTION: Metadata is mutable - Name, symbol, or image can be changed'
      );
    } else {
      warnings.push('✅ SAFE: Metadata is immutable - Token identity is locked');
    }

    // Check Liquidity (CRITICAL RISK FACTOR)
    if (liquidityInfo) {
      if (liquidityInfo.riskLevel === 'Critical') {
        score -= 40; // Major penalty for critical liquidity issues
        warnings.push(...liquidityInfo.warnings);
      } else if (liquidityInfo.riskLevel === 'High') {
        score -= 25;
        warnings.push(...liquidityInfo.warnings);
      } else if (liquidityInfo.riskLevel === 'Medium') {
        score -= 10;
        warnings.push(...liquidityInfo.warnings);
      } else {
        // Safe liquidity adds confidence
        warnings.push(...liquidityInfo.warnings);
      }
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    // Determine risk level
    let level: 'Safe' | 'Caution' | 'Rug Pull Risk';
    if (score >= config.riskScoring.thresholds.safe) {
      level = 'Safe';
    } else if (score >= config.riskScoring.thresholds.caution) {
      level = 'Caution';
    } else {
      level = 'Rug Pull Risk';
    }

    return {
      score,
      level,
      warnings,
    };
  }

  /**
   * Analyze Developer/Deployer Track Record
   */
  async analyzeDeveloper(tokenAddress: string): Promise<DeveloperAnalysis> {
    try {
      const tracker = new DeveloperTracker(this.connection, 100); // Scan last 100 transactions
      return await tracker.analyzeDeployer(tokenAddress);
    } catch (error) {
      throw new Error(
        `Failed to analyze developer: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export default SolanaTokenAuditor;

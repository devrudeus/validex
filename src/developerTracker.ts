/**
 * Developer Tracker - Solana Token Deployer Analysis
 * Melacak rekam jejak wallet yang mendeploy token untuk mendeteksi serial scammers
 */

import {
  Connection,
  PublicKey,
  ParsedTransactionWithMeta,
  PartiallyDecodedInstruction,
  ParsedInstruction,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, getMint } from '@solana/spl-token';

// Pump.fun program IDs (multiple versions exist)
const PUMPFUN_PROGRAM_IDS = [
  new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'), // Original
  new PublicKey('FoaFt2Dtz58RA6DPjbRb9t9z8sLJRChiGFTv21EfaseZ'), // New version
];
const PUMPFUN_MINT_AUTHORITY = new PublicKey('TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM');

interface DeployedToken {
  address: string;
  signature: string;
  timestamp: number;
  isRugged: boolean;
  liquidityValue: number;
  name?: string;
  symbol?: string;
  age?: number;
  status: 'Active' | 'Rugged' | 'Dead';
}

interface DeveloperAnalysis {
  deployerAddress: string;
  tokensCreatedCount: number;
  ruggedCount: number;
  winRate: number; // Percentage
  riskLevel: 'Serial Scammer' | 'High Risk' | 'Medium Risk' | 'Clean';
  tokensDeployed: DeployedToken[];
  averageTimeBetweenDeploys?: number;
  oldestDeployment?: number;
  newestDeployment?: number;
  activeTokens?: number;
  deadTokens?: number;
  totalDeploymentDays?: number;
}

export class DeveloperTracker {
  private connection: Connection;
  private maxSignaturesToScan: number;
  private metadataCache: Map<string, { name?: string; symbol?: string }>;
  private requestDelay: number;

  constructor(connection: Connection, maxSignaturesToScan: number = 100) {
    this.connection = connection;
    this.maxSignaturesToScan = maxSignaturesToScan;
    this.metadataCache = new Map();
    this.requestDelay = 300; // Minimum delay between requests in ms
  }

  /**
   * Sleep helper to add delay between requests
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry helper with exponential backoff for rate limiting
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        // Check if it's a rate limit error
        if (error?.message?.includes('429') || error?.message?.includes('Too Many Requests')) {
          const delay = initialDelay * Math.pow(2, i);
          console.log(`[DeveloperTracker] Rate limited, waiting ${delay}ms before retry ${i + 1}/${maxRetries}`);
          await this.sleep(delay);
        } else {
          // For non-rate-limit errors, throw immediately
          throw error;
        }
      }
    }

    throw lastError;
  }

  /**
   * Main function: Analisis deployer dari token address
   */
  async analyzeDeployer(tokenAddress: string): Promise<DeveloperAnalysis> {
    try {
      console.log(`[DeveloperTracker] Analyzing deployer for token: ${tokenAddress}`);

      const mintPubkey = new PublicKey(tokenAddress);

      // Step 1: Find deployer wallet
      const deployerAddress = await this.findDeployer(mintPubkey);
      if (!deployerAddress) {
        throw new Error('Could not identify deployer wallet');
      }

      console.log(`[DeveloperTracker] Found deployer: ${deployerAddress}`);

      // Step 2: Scan past deployments
      const tokensDeployed = await this.scanPastDeployments(deployerAddress);

      console.log(`[DeveloperTracker] Found ${tokensDeployed.length} tokens deployed by this wallet`);

      // Step 3: Calculate statistics
      const ruggedCount = tokensDeployed.filter(t => t.isRugged || t.status === 'Rugged').length;
      const activeCount = tokensDeployed.filter(t => t.status === 'Active').length;
      const deadCount = tokensDeployed.filter(t => t.status === 'Dead').length;

      const winRate = tokensDeployed.length > 0
        ? ((tokensDeployed.length - ruggedCount) / tokensDeployed.length) * 100
        : 100;

      // Calculate time statistics
      const timestamps = tokensDeployed.map(t => t.timestamp).sort((a, b) => a - b);
      const oldestDeployment = timestamps[0];
      const newestDeployment = timestamps[timestamps.length - 1];

      let averageTimeBetweenDeploys: number | undefined;
      if (timestamps.length > 1) {
        const timeDiffs = [];
        for (let i = 1; i < timestamps.length; i++) {
          timeDiffs.push(timestamps[i] - timestamps[i - 1]);
        }
        const avgSeconds = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
        averageTimeBetweenDeploys = avgSeconds / 3600; // Convert to hours
      }

      const totalDeploymentDays = oldestDeployment && newestDeployment
        ? Math.floor((newestDeployment - oldestDeployment) / 86400)
        : 0;

      // Step 4: Determine risk level
      const riskLevel = this.calculateRiskLevel(tokensDeployed.length, ruggedCount, winRate);

      return {
        deployerAddress,
        tokensCreatedCount: tokensDeployed.length,
        ruggedCount,
        winRate: Math.round(winRate * 100) / 100,
        riskLevel,
        tokensDeployed: tokensDeployed, // Return all tokens now
        averageTimeBetweenDeploys: averageTimeBetweenDeploys ? Math.round(averageTimeBetweenDeploys * 100) / 100 : undefined,
        oldestDeployment,
        newestDeployment,
        activeTokens: activeCount,
        deadTokens: deadCount,
        totalDeploymentDays,
      };
    } catch (error) {
      console.error('[DeveloperTracker] Error:', error);
      throw new Error(`Failed to analyze deployer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Step 1: Menemukan deployer wallet dari token address
   */
  private async findDeployer(mintPubkey: PublicKey): Promise<string | null> {
    try {
      // Method 1: Check mint authority (masih aktif)
      try {
        const mintInfo = await getMint(this.connection, mintPubkey, undefined, TOKEN_2022_PROGRAM_ID)
          .catch(() => getMint(this.connection, mintPubkey, undefined, TOKEN_PROGRAM_ID));

        if (mintInfo.mintAuthority) {
          console.log(`[DeveloperTracker] Found active mint authority: ${mintInfo.mintAuthority.toString()}`);

          // Check if it's Pump.fun mint authority (not the real deployer)
          if (!mintInfo.mintAuthority.equals(PUMPFUN_MINT_AUTHORITY)) {
            return mintInfo.mintAuthority.toString();
          } else {
            console.log('[DeveloperTracker] This is a Pump.fun token, searching for creator from creation tx...');
          }
        }
      } catch (e) {
        console.log('[DeveloperTracker] Mint authority check failed, trying creation transaction');
      }

      // Method 2: Find creation transaction
      const signatures = await this.connection.getSignaturesForAddress(
        mintPubkey,
        { limit: 1000 }
      );

      if (signatures.length === 0) {
        return null;
      }

      // Get the oldest signature (creation tx)
      const creationSignature = signatures[signatures.length - 1];
      console.log(`[DeveloperTracker] Fetching creation tx: ${creationSignature.signature}`);

      const tx = await this.connection.getParsedTransaction(
        creationSignature.signature,
        { maxSupportedTransactionVersion: 0 }
      );

      if (!tx || !tx.transaction) {
        return null;
      }

      // For Pump.fun tokens: Check if this is a Pump.fun creation
      const instructions = tx.transaction.message.instructions;
      let isPumpfun = false;

      for (const ix of instructions) {
        // Check if this is a Pump.fun instruction (check all known program IDs)
        for (const pumpfunProgramId of PUMPFUN_PROGRAM_IDS) {
          if (ix.programId.equals(pumpfunProgramId)) {
            isPumpfun = true;
            console.log(`[DeveloperTracker] Detected Pump.fun creation (program: ${pumpfunProgramId.toString()})`);
            break;
          }
        }
        if (isPumpfun) break;
      }

      if (isPumpfun) {
        // For Pump.fun: Try to get creator from API first (most accurate)
        try {
          const apiCreator = await this.getPumpfunCreatorFromAPI(mintPubkey.toString());
          if (apiCreator) {
            console.log(`[DeveloperTracker] Found Pump.fun creator from API: ${apiCreator}`);
            return apiCreator;
          }
        } catch (e) {
          console.log('[DeveloperTracker] Pump.fun API failed, falling back to transaction analysis');
        }

        // Fallback: Get the signer (fee payer)
        const accountKeys = tx.transaction.message.accountKeys;
        for (const account of accountKeys) {
          if (account.signer) {
            const creator = account.pubkey.toString();
            console.log(`[DeveloperTracker] Found Pump.fun creator (fee payer): ${creator}`);
            return creator;
          }
        }
      }

      // Fallback: The fee payer is usually the deployer
      const feePayer = tx.transaction.message.accountKeys[0].pubkey.toString();
      console.log(`[DeveloperTracker] Found fee payer (deployer): ${feePayer}`);

      return feePayer;
    } catch (error) {
      console.error('[DeveloperTracker] Error finding deployer:', error);
      return null;
    }
  }

  /**
   * Step 2: Scan riwayat deployment dari deployer wallet
   */
  private async scanPastDeployments(deployerAddress: string): Promise<DeployedToken[]> {
    try {
      const deployerPubkey = new PublicKey(deployerAddress);
      const tokensFound: DeployedToken[] = [];
      const seenMints = new Set<string>();

      console.log(`[DeveloperTracker] Scanning ${this.maxSignaturesToScan} recent transactions...`);

      // Get recent signatures
      const signatures = await this.connection.getSignaturesForAddress(
        deployerPubkey,
        { limit: this.maxSignaturesToScan },
        'confirmed'
      );

      console.log(`[DeveloperTracker] Found ${signatures.length} signatures to analyze`);

      // Process in smaller batches with longer delays to avoid rate limiting
      const batchSize = 3; // Reduced from 10 to 3
      for (let i = 0; i < signatures.length; i += batchSize) {
        const batch = signatures.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (sigInfo) => {
            try {
              const token = await this.analyzeTransactionForTokenCreation(
                sigInfo.signature,
                sigInfo.blockTime || 0
              );

              if (token && !seenMints.has(token.address)) {
                seenMints.add(token.address);
                tokensFound.push(token);
              }
            } catch (e) {
              // Skip failed transactions silently
            }
          })
        );

        // Rate limiting: longer delay between batches
        if (i + batchSize < signatures.length) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Increased from 100ms to 500ms
        }
      }

      console.log(`[DeveloperTracker] Found ${tokensFound.length} unique tokens created`);

      // Check liquidity for each token (rug check)
      await this.checkTokensLiquidity(tokensFound);

      return tokensFound.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('[DeveloperTracker] Error scanning deployments:', error);
      return [];
    }
  }

  /**
   * Analisis transaksi untuk deteksi pembuatan token
   */
  private async analyzeTransactionForTokenCreation(
    signature: string,
    blockTime: number
  ): Promise<DeployedToken | null> {
    try {
      const tx = await this.connection.getParsedTransaction(
        signature,
        { maxSupportedTransactionVersion: 0 }
      );

      if (!tx || !tx.meta || tx.meta.err) {
        return null;
      }

      // Look for InitializeMint instruction
      const instructions = tx.transaction.message.instructions;

      for (const ix of instructions) {
        const parsed = ix as ParsedInstruction;

        // Check for SPL Token InitializeMint
        if (
          parsed.programId.equals(TOKEN_PROGRAM_ID) ||
          parsed.programId.equals(TOKEN_2022_PROGRAM_ID)
        ) {
          if (parsed.parsed && parsed.parsed.type === 'initializeMint') {
            const mintAddress = parsed.parsed.info.mint;

            // Get token metadata
            const { name, symbol } = await this.getTokenMetadata(mintAddress);
            const age = Math.floor((Date.now() / 1000 - blockTime) / 86400); // Days since deployment

            return {
              address: mintAddress,
              signature,
              timestamp: blockTime,
              isRugged: false, // Will be checked later
              liquidityValue: 0,
              name,
              symbol,
              age,
              status: 'Active', // Will be updated later
            };
          }
        }

        // Check for Pump.fun token creation (check all known program IDs)
        let isPumpfunCreate = false;
        for (const pumpfunProgramId of PUMPFUN_PROGRAM_IDS) {
          if (parsed.programId.equals(pumpfunProgramId)) {
            isPumpfunCreate = true;
            break;
          }
        }

        if (isPumpfunCreate) {
          // Pump.fun creates token, look for mint in account keys
          const accounts = tx.transaction.message.accountKeys;

          // Try to find the newly created mint
          for (const account of accounts) {
            if (account.writable && !account.signer) {
              try {
                // Verify it's a valid mint
                const mintInfo = await getMint(
                  this.connection,
                  account.pubkey,
                  undefined,
                  TOKEN_2022_PROGRAM_ID
                ).catch(() => null);

                if (mintInfo) {
                  const mintAddress = account.pubkey.toString();
                  const { name, symbol } = await this.getTokenMetadata(mintAddress);
                  const age = Math.floor((Date.now() / 1000 - blockTime) / 86400);

                  return {
                    address: mintAddress,
                    signature,
                    timestamp: blockTime,
                    isRugged: false,
                    liquidityValue: 0,
                    name,
                    symbol,
                    age,
                    status: 'Active',
                  };
                }
              } catch (e) {
                // Not a mint, continue
              }
            }
          }
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Step 3: Check liquidity untuk deteksi rug pull (Real-time data from blockchain)
   */
  private async checkTokensLiquidity(tokens: DeployedToken[]): Promise<void> {
    console.log(`[DeveloperTracker] Checking liquidity for ${tokens.length} tokens (real-time data)...`);

    // Process tokens sequentially to avoid overwhelming RPC
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      try {
        await this.retryWithBackoff(async () => {
          const mintPubkey = new PublicKey(token.address);

          // Add delay before request
          await this.sleep(this.requestDelay);

          // Get mint info to check if token still exists and has supply (REAL-TIME DATA)
          const mintInfo = await getMint(
            this.connection,
            mintPubkey,
            undefined,
            TOKEN_2022_PROGRAM_ID
          ).catch(() => getMint(this.connection, mintPubkey, undefined, TOKEN_PROGRAM_ID));

          // Simple rug check: If mint authority is still active OR supply is 0
          if (mintInfo.mintAuthority !== null && !mintInfo.mintAuthority.equals(PUMPFUN_MINT_AUTHORITY)) {
            // Suspicious: Authority not revoked (except Pump.fun)
            token.isRugged = true;
            token.liquidityValue = 0;
            token.status = 'Rugged';
            return;
          }

          if (Number(mintInfo.supply) === 0) {
            // Token has no supply = dead/rugged
            token.isRugged = true;
            token.liquidityValue = 0;
            token.status = 'Rugged';
            return;
          }

          // Add delay before next request
          await this.sleep(this.requestDelay);

          // Get largest token holders to estimate liquidity (REAL-TIME DATA)
          const largestAccounts = await this.connection.getTokenLargestAccounts(mintPubkey);

          if (largestAccounts.value.length === 0) {
            token.isRugged = true;
            token.liquidityValue = 0;
            token.status = 'Rugged';
            return;
          }

          // If top holder has >95% of supply, likely rugged/abandoned
          const topHolderAmount = largestAccounts.value[0].amount;
          const totalSupply = mintInfo.supply;
          const topHolderPercentage = (Number(topHolderAmount) / Number(totalSupply)) * 100;

          if (topHolderPercentage > 95) {
            token.isRugged = true;
            token.liquidityValue = 0;
            token.status = 'Rugged';
          } else if (topHolderPercentage > 80) {
            token.status = 'Dead'; // Likely abandoned
            token.liquidityValue = 1;
          } else {
            token.status = 'Active';
            token.liquidityValue = 10;
          }
        });
      } catch (e) {
        // If can't fetch after retries, assume dead
        console.log(`[DeveloperTracker] Failed to check token ${token.address}:`, e);
        token.status = 'Dead';
        token.liquidityValue = 0;
      }
    }

    console.log(`[DeveloperTracker] Liquidity check complete. Real-time blockchain data retrieved.`);
  }

  /**
   * Get token metadata (name & symbol) from chain with caching
   */
  private async getTokenMetadata(mintAddress: string): Promise<{ name?: string; symbol?: string }> {
    // Check cache first
    if (this.metadataCache.has(mintAddress)) {
      return this.metadataCache.get(mintAddress)!;
    }

    try {
      const result = await this.retryWithBackoff(async () => {
        const mintPubkey = new PublicKey(mintAddress);

        // Derive metadata PDA (Metaplex standard)
        const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
        const [metadataPDA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('metadata'),
            METADATA_PROGRAM_ID.toBuffer(),
            mintPubkey.toBuffer(),
          ],
          METADATA_PROGRAM_ID
        );

        // Add delay before request
        await this.sleep(this.requestDelay);

        // Fetch metadata account
        const accountInfo = await this.connection.getAccountInfo(metadataPDA);

        if (accountInfo && accountInfo.data) {
          // Parse metadata (simplified - Metaplex metadata structure)
          const data = accountInfo.data;

          // Skip header (1 byte key + 32 bytes update authority + 32 bytes mint)
          let offset = 1 + 32 + 32;

          // Read name (u32 length + string)
          const nameLen = data.readUInt32LE(offset);
          offset += 4;
          const name = Buffer.from(data.subarray(offset, offset + nameLen)).toString('utf8').replace(/\0/g, '').trim();
          offset += nameLen;

          // Read symbol (u32 length + string)
          const symbolLen = data.readUInt32LE(offset);
          offset += 4;
          const symbol = Buffer.from(data.subarray(offset, offset + symbolLen)).toString('utf8').replace(/\0/g, '').trim();

          return { name, symbol };
        }

        return { name: undefined, symbol: undefined };
      });

      // Cache the result
      this.metadataCache.set(mintAddress, result);
      return result;
    } catch (error) {
      const fallback = { name: undefined, symbol: undefined };
      this.metadataCache.set(mintAddress, fallback);
      return fallback;
    }
  }

  /**
   * Calculate risk level based on deployment history
   */
  private calculateRiskLevel(
    totalTokens: number,
    ruggedCount: number,
    winRate: number
  ): 'Serial Scammer' | 'High Risk' | 'Medium Risk' | 'Clean' {
    // Serial Scammer: Multiple tokens deployed, >50% rugged
    if (totalTokens >= 3 && ruggedCount >= 2 && winRate < 50) {
      return 'Serial Scammer';
    }

    // High Risk: Multiple tokens, some rugged
    if (totalTokens >= 2 && ruggedCount >= 1) {
      return 'High Risk';
    }

    // Medium Risk: First-time deployer or 1 rug
    if (totalTokens === 1 || ruggedCount === 1) {
      return 'Medium Risk';
    }

    // Clean: No rugs detected
    return 'Clean';
  }

  /**
   * Get Pump.fun creator from external API
   */
  private async getPumpfunCreatorFromAPI(mintAddress: string): Promise<string | null> {
    try {
      // Try Pump.fun API endpoints
      const apiUrls = [
        `https://frontend-api.pump.fun/coins/${mintAddress}`,
        `https://pumpportal.fun/api/data/token?address=${mintAddress}`,
      ];

      for (const apiUrl of apiUrls) {
        try {
          const response = await fetch(apiUrl, {
            headers: {
              'User-Agent': 'SolanaGuard/1.0',
            },
            signal: AbortSignal.timeout(5000), // 5 second timeout
          });

          if (response.ok) {
            const data: any = await response.json();

            // Try different field names where creator might be stored
            const creator = data.creator || data.creator_address || data.deployer || data.user;

            if (creator && typeof creator === 'string') {
              return creator;
            }
          }
        } catch (e) {
          // Try next endpoint
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error('[DeveloperTracker] Error fetching from Pump.fun API:', error);
      return null;
    }
  }
}

export default DeveloperTracker;

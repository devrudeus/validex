/**
 * Holder Cluster Analysis - Solana Token
 * Mendeteksi apakah top holders dikendalikan oleh satu entitas
 * melalui analisis funding source (wallet yang pertama kali mengirim SOL)
 */

import { config as dotenvConfig } from 'dotenv';
import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';
import pLimit from 'p-limit';

// Load environment variables
dotenvConfig();

// Known CEX wallets (partial list - expand as needed)
const CEX_WALLETS = new Set([
  // Binance
  '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9',
  'CuieVDEDtLo7FypA9SbLM9saXFdb1dsshEkyErMqkRQq',
  '3kvrNEkLiVZAh9u5URgdvMGqKZN7zMJj1D9bKrRMfT1Z',
  // Coinbase
  '2AQdpHJ2JpcEgPiATUXjQxA8QmafFegfQwSLWSprPicm',
  'GJRs4FwHtemZ5ZE9x3FNvJ8TMwitKTh21yxdRPqn7npE',
  'H8sMJSCQxfKiFTCfDR3DUMLPwcRbM61LGFJ8N4dK3WjS',
  // OKX
  'AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2',
  // Add more as needed
]);

// Known mixer/tumbler services
const MIXER_WALLETS = new Set<string>([
  // Add known mixer addresses
]);

interface HolderInfo {
  address: string;
  balance: bigint;
  percentageOfSupply: number;
  rank: number;
}

interface FundingSource {
  funder: string;
  signature: string;
  timestamp: number;
  amount: number;
  isCEX: boolean;
  isMixer: boolean;
}

interface ClusterInfo {
  funder: string;
  holders: Array<{
    address: string;
    balance: bigint;
    percentage: number;
    rank: number;
    fundingSignature: string;
  }>;
  totalBalance: bigint;
  totalPercentage: number;
  holderCount: number;
  isCEX: boolean;
  isMixer: boolean;
}

interface TokenMetadata {
  name: string;
  symbol: string;
  image: string | null;
  description?: string;
}

interface ClusterAnalysisResult {
  tokenAddress: string;
  tokenMetadata?: TokenMetadata;
  totalSupply: bigint;
  topHoldersAnalyzed: number;
  clusters: ClusterInfo[];
  suspiciousClusters: ClusterInfo[];
  summary: {
    totalClusters: number;
    largestClusterSize: number;
    largestClusterPercentage: number;
    suspiciousControlPercentage: number;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  };
}

/**
 * Fetch token metadata (name, symbol, image)
 */
async function getTokenMetadata(tokenAddress: string): Promise<TokenMetadata | null> {
  try {
    const heliusApiKey = process.env.HELIUS_API_KEY;
    if (!heliusApiKey) {
      console.log('[Metadata] HELIUS_API_KEY not set, skipping metadata fetch');
      return null;
    }

    const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;

    // Use Helius DAS API to get asset info
    const response = await fetch(heliusUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'token-metadata',
        method: 'getAsset',
        params: {
          id: tokenAddress,
        },
      }),
    });

    const data: any = await response.json();

    if (data.error || !data.result) {
      console.log('[Metadata] Could not fetch from DAS API, trying on-chain metadata...');

      // Fallback: Try to fetch on-chain metadata
      const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');
      const mintPubkey = new PublicKey(tokenAddress);
      const mintInfo = await connection.getParsedAccountInfo(mintPubkey);

      if (mintInfo.value?.data && 'parsed' in mintInfo.value.data) {
        const parsed: any = mintInfo.value.data.parsed;
        return {
          name: parsed.info?.name || 'Unknown Token',
          symbol: parsed.info?.symbol || 'UNKNOWN',
          image: null,
        };
      }

      return null;
    }

    const asset: any = data.result;
    const content: any = asset.content;

    return {
      name: content?.metadata?.name || asset.content?.json_uri?.name || 'Unknown Token',
      symbol: content?.metadata?.symbol || asset.content?.json_uri?.symbol || 'UNKNOWN',
      image: content?.links?.image || content?.files?.[0]?.uri || null,
      description: content?.metadata?.description || asset.content?.json_uri?.description,
    };
  } catch (error: any) {
    console.log(`[Metadata] Failed to fetch metadata: ${error.message}`);
    return null;
  }
}

/**
 * Retry helper dengan exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Handle rate limiting specifically
      if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
        const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
        console.log(`[Retry] Rate limited, waiting ${Math.round(delay)}ms before retry ${i + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Handle timeout
      if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`[Retry] Timeout, waiting ${Math.round(delay)}ms before retry ${i + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // For other errors, throw immediately
      throw error;
    }
  }

  throw lastError!;
}

/**
 * Check if address is a known CEX wallet
 */
function isCEXWallet(address: string): boolean {
  return CEX_WALLETS.has(address);
}

/**
 * Check if address is a known mixer
 */
function isMixerWallet(address: string): boolean {
  return MIXER_WALLETS.has(address);
}

/**
 * Get top N token holders
 */
async function getTopHolders(
  connection: Connection,
  tokenAddress: string,
  topN: number = 20
): Promise<{ holders: HolderInfo[]; totalSupply: bigint }> {
  console.log(`[Cluster] Fetching top ${topN} holders for token: ${tokenAddress}`);

  const mintPubkey = new PublicKey(tokenAddress);

  // Get total supply first
  const mintInfo = await retryWithBackoff(() =>
    connection.getParsedAccountInfo(mintPubkey)
  );

  const totalSupply = BigInt(
    (mintInfo.value?.data as any)?.parsed?.info?.supply || 0
  );

  console.log(`[Cluster] Total Supply: ${totalSupply}`);

  // Try getTokenLargestAccounts first (works for most tokens)
  try {
    const largestAccounts = await retryWithBackoff(() =>
      connection.getTokenLargestAccounts(mintPubkey)
    );

    const holders: HolderInfo[] = largestAccounts.value
      .slice(0, topN)
      .map((account, index) => ({
        address: account.address.toString(),
        balance: BigInt(account.amount),
        percentageOfSupply: (Number(account.amount) / Number(totalSupply)) * 100,
        rank: index + 1,
      }));

    console.log(`[Cluster] Found ${holders.length} holders using getTokenLargestAccounts`);
    return { holders, totalSupply };
  } catch (error: any) {
    // If getTokenLargestAccounts fails (too many accounts), show helpful error
    if (error.message?.includes('Too many accounts')) {
      throw new Error(
        `This token has too many holders (>1M accounts) for cluster analysis.\n` +
        `Cluster analysis works best with smaller tokens (pump.fun tokens, small cap tokens, etc).\n` +
        `Popular tokens like USDC, USDT, SOL have millions of holders and cannot be analyzed efficiently.\n\n` +
        `Suggestion: Try analyzing a smaller token with <100k holders.`
      );
    }
    throw error;
  }
}

/**
 * Find the first transaction (funding source) for a wallet
 */
async function findFundingSource(
  connection: Connection,
  walletAddress: string
): Promise<FundingSource | null> {
  try {
    const pubkey = new PublicKey(walletAddress);

    // Strategy 1: Get oldest transactions (binary search approach)
    // Start with getting all signatures in batches
    let allSignatures: any[] = [];
    let lastSignature: string | undefined;
    const batchSize = 1000;

    // Get signatures in batches (going backwards in time)
    for (let i = 0; i < 3; i++) {
      // Limit to 3 batches (3000 tx) for performance
      const signatures = await retryWithBackoff(() =>
        connection.getSignaturesForAddress(pubkey, {
          limit: batchSize,
          before: lastSignature,
        })
      );

      if (signatures.length === 0) break;

      allSignatures = allSignatures.concat(signatures);
      lastSignature = signatures[signatures.length - 1].signature;

      if (signatures.length < batchSize) break; // No more signatures
    }

    if (allSignatures.length === 0) {
      console.log(`[Funding] No transactions found for ${walletAddress}`);
      return null;
    }

    // Get the oldest transaction (likely the funding transaction)
    const oldestSig = allSignatures[allSignatures.length - 1];

    console.log(`[Funding] Analyzing oldest transaction for ${walletAddress.slice(0, 8)}...`);

    // Parse the transaction to find the funder
    const tx = await retryWithBackoff(() =>
      connection.getParsedTransaction(oldestSig.signature, {
        maxSupportedTransactionVersion: 0,
      })
    );

    if (!tx || !tx.meta) {
      return null;
    }

    // Find the funder (account that sent SOL to this wallet)
    const accountKeys = tx.transaction.message.accountKeys;
    const preBalances = tx.meta.preBalances;
    const postBalances = tx.meta.postBalances;

    // Find who sent SOL (decreased balance) to this wallet (increased balance)
    let funder: string | null = null;
    let fundAmount: number = 0;

    for (let i = 0; i < accountKeys.length; i++) {
      const account = accountKeys[i].pubkey.toString();
      const preBalance = preBalances[i];
      const postBalance = postBalances[i];
      const balanceChange = postBalance - preBalance;

      // If this is the target wallet and received SOL
      if (account === walletAddress && balanceChange > 0) {
        fundAmount = balanceChange / 1e9; // Convert lamports to SOL
      }

      // If this account sent SOL (decreased balance) and is not the wallet itself
      if (account !== walletAddress && balanceChange < 0 && !funder) {
        funder = account;
      }
    }

    // Fallback: Check for SystemProgram transfer instruction
    if (!funder) {
      const instructions = tx.transaction.message.instructions;

      for (const ix of instructions) {
        if ('parsed' in ix && ix.program === 'system' && ix.parsed.type === 'transfer') {
          const info = ix.parsed.info;
          if (info.destination === walletAddress) {
            funder = info.source;
            fundAmount = info.lamports / 1e9;
            break;
          }
        }
      }
    }

    if (!funder) {
      console.log(`[Funding] Could not identify funder for ${walletAddress.slice(0, 8)}...`);
      return null;
    }

    const fundingSource: FundingSource = {
      funder,
      signature: oldestSig.signature,
      timestamp: oldestSig.blockTime || 0,
      amount: fundAmount,
      isCEX: isCEXWallet(funder),
      isMixer: isMixerWallet(funder),
    };

    console.log(
      `[Funding] ${walletAddress.slice(0, 8)}... funded by ${funder.slice(0, 8)}... (${fundAmount.toFixed(4)} SOL) ${fundingSource.isCEX ? '[CEX]' : ''} ${fundingSource.isMixer ? '[MIXER]' : ''}`
    );

    return fundingSource;
  } catch (error) {
    console.error(`[Funding] Error finding funding source for ${walletAddress}:`, error);
    return null;
  }
}

/**
 * Group holders by funding source (cluster analysis)
 */
function groupHoldersByFunder(
  holders: HolderInfo[],
  fundingSources: Map<string, FundingSource>,
  totalSupply: bigint
): ClusterInfo[] {
  const clusters = new Map<string, ClusterInfo>();

  for (const holder of holders) {
    const funding = fundingSources.get(holder.address);

    if (!funding) continue; // Skip if funding source not found

    const funder = funding.funder;

    if (!clusters.has(funder)) {
      clusters.set(funder, {
        funder,
        holders: [],
        totalBalance: BigInt(0),
        totalPercentage: 0,
        holderCount: 0,
        isCEX: funding.isCEX,
        isMixer: funding.isMixer,
      });
    }

    const cluster = clusters.get(funder)!;
    cluster.holders.push({
      address: holder.address,
      balance: holder.balance,
      percentage: holder.percentageOfSupply,
      rank: holder.rank,
      fundingSignature: funding.signature,
    });
    cluster.totalBalance += holder.balance;
    cluster.totalPercentage += holder.percentageOfSupply;
    cluster.holderCount++;
  }

  // Convert to array and sort by total percentage
  return Array.from(clusters.values()).sort((a, b) => b.totalPercentage - a.totalPercentage);
}

/**
 * Identify suspicious clusters (excluding CEX and single holders)
 */
function identifySuspiciousClusters(clusters: ClusterInfo[]): ClusterInfo[] {
  return clusters.filter(
    (cluster) =>
      cluster.holderCount >= 2 && // At least 2 holders
      !cluster.isCEX && // Not from CEX
      !cluster.isMixer && // Not from mixer
      cluster.totalPercentage >= 5 // Controls at least 5% of supply
  );
}

/**
 * Calculate risk level based on cluster analysis
 */
function calculateRiskLevel(
  suspiciousClusters: ClusterInfo[],
  totalPercentage: number
): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (suspiciousClusters.length === 0) return 'Low';

  const largestCluster = suspiciousClusters[0];

  // Critical: One entity controls >30% via multiple wallets
  if (largestCluster.totalPercentage > 30) return 'Critical';

  // High: One entity controls >20% via multiple wallets
  if (largestCluster.totalPercentage > 20) return 'High';

  // Medium: One entity controls >10% via multiple wallets
  if (largestCluster.totalPercentage > 10) return 'Medium';

  // Low: Suspicious but small control
  return 'Low';
}

/**
 * Main Cluster Analysis Function
 */
export async function analyzeHolderClusters(
  connection: Connection,
  tokenAddress: string,
  topN: number = 20
): Promise<ClusterAnalysisResult> {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║          Holder Cluster Analysis - Starting               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Step 0: Fetch token metadata
  console.log('[Metadata] Fetching token metadata...');
  const tokenMetadata = await getTokenMetadata(tokenAddress);

  if (tokenMetadata) {
    console.log(`[Metadata] Token: ${tokenMetadata.name} (${tokenMetadata.symbol})`);
    if (tokenMetadata.image) {
      console.log(`[Metadata] Image: ${tokenMetadata.image}`);
    }
  }

  // Step 1: Get top holders
  const { holders, totalSupply } = await getTopHolders(connection, tokenAddress, topN);

  // Step 2: Find funding sources with rate limiting
  console.log(`\n[Cluster] Analyzing funding sources (rate-limited to 5 concurrent requests)...\n`);

  const limit = pLimit(5); // Max 5 concurrent requests
  const fundingSources = new Map<string, FundingSource>();

  const fundingPromises = holders.map((holder) =>
    limit(async () => {
      const funding = await findFundingSource(connection, holder.address);
      if (funding) {
        fundingSources.set(holder.address, funding);
      }
      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 200));
    })
  );

  await Promise.all(fundingPromises);

  console.log(`\n[Cluster] Found funding sources for ${fundingSources.size}/${holders.length} holders\n`);

  // Step 3: Group by funding source
  const clusters = groupHoldersByFunder(holders, fundingSources, totalSupply);

  // Step 4: Identify suspicious clusters
  const suspiciousClusters = identifySuspiciousClusters(clusters);

  // Step 5: Calculate summary
  const suspiciousControlPercentage = suspiciousClusters.reduce(
    (sum, c) => sum + c.totalPercentage,
    0
  );

  const largestCluster = clusters[0];
  const riskLevel = calculateRiskLevel(suspiciousClusters, suspiciousControlPercentage);

  const result: ClusterAnalysisResult = {
    tokenAddress,
    tokenMetadata: tokenMetadata || undefined,
    totalSupply,
    topHoldersAnalyzed: holders.length,
    clusters,
    suspiciousClusters,
    summary: {
      totalClusters: clusters.length,
      largestClusterSize: largestCluster?.holderCount || 0,
      largestClusterPercentage: largestCluster?.totalPercentage || 0,
      suspiciousControlPercentage,
      riskLevel,
    },
  };

  // Print results
  printClusterAnalysis(result);

  return result;
}

/**
 * Pretty print cluster analysis results
 */
function printClusterAnalysis(result: ClusterAnalysisResult): void {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              CLUSTER ANALYSIS RESULTS                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Display token metadata if available
  if (result.tokenMetadata) {
    console.log('🪙 TOKEN INFORMATION');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Name: ${result.tokenMetadata.name}`);
    console.log(`Symbol: ${result.tokenMetadata.symbol}`);
    if (result.tokenMetadata.image) {
      console.log(`Image: ${result.tokenMetadata.image}`);
    }
    if (result.tokenMetadata.description) {
      console.log(`Description: ${result.tokenMetadata.description}`);
    }
    console.log(`Address: ${result.tokenAddress}`);
    console.log(`Total Supply: ${result.totalSupply}`);
    console.log(`Top Holders Analyzed: ${result.topHoldersAnalyzed}\n`);
  } else {
    console.log(`Token: ${result.tokenAddress}`);
    console.log(`Total Supply: ${result.totalSupply}`);
    console.log(`Top Holders Analyzed: ${result.topHoldersAnalyzed}\n`);
  }

  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total Clusters Found: ${result.summary.totalClusters}`);
  console.log(`Largest Cluster Size: ${result.summary.largestClusterSize} wallets`);
  console.log(
    `Largest Cluster Control: ${result.summary.largestClusterPercentage.toFixed(2)}% of supply`
  );
  console.log(
    `Suspicious Control: ${result.summary.suspiciousControlPercentage.toFixed(2)}% of supply`
  );
  console.log(`Risk Level: ${result.summary.riskLevel}\n`);

  if (result.suspiciousClusters.length > 0) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🚨 SUSPICIOUS CLUSTERS (Non-CEX, Multiple Holders)');
    console.log('═══════════════════════════════════════════════════════════\n');

    result.suspiciousClusters.forEach((cluster, index) => {
      console.log(`\n[Cluster ${String.fromCharCode(65 + index)}] Funder: ${cluster.funder}`);
      console.log(`  Controls: ${cluster.holderCount} wallets`);
      console.log(`  Total Holding: ${cluster.totalPercentage.toFixed(2)}% of supply`);
      console.log(`  Holders:`);

      cluster.holders.forEach((holder) => {
        console.log(
          `    - Rank #${holder.rank}: ${holder.address.slice(0, 8)}... (${holder.percentage.toFixed(2)}%)`
        );
      });
    });
  } else {
    console.log('✅ No suspicious clusters detected (all holders appear independent)');
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📋 ALL CLUSTERS');
  console.log('═══════════════════════════════════════════════════════════\n');

  result.clusters.slice(0, 10).forEach((cluster, index) => {
    const label = cluster.isCEX ? '[CEX]' : cluster.isMixer ? '[MIXER]' : '';
    console.log(
      `${index + 1}. Funder: ${cluster.funder.slice(0, 8)}... ${label}`
    );
    console.log(
      `   ${cluster.holderCount} wallet(s), ${cluster.totalPercentage.toFixed(2)}% supply\n`
    );
  });

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              Analysis Complete                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

/**
 * CLI Usage
 */
if (require.main === module) {
  const tokenAddress = process.argv[2];

  if (!tokenAddress) {
    console.error('Usage: ts-node clusterCheck.ts <tokenAddress>');
    process.exit(1);
  }

  const HELIUS_RPC_URL =
    process.env.SOLANA_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=3ad61b57-e57d-4bc9-9176-cbd567b737ad';

  const connection = new Connection(HELIUS_RPC_URL, {
    commitment: 'confirmed',
    httpHeaders: {
      'Cache-Control': 'no-cache',
    },
  });

  analyzeHolderClusters(connection, tokenAddress, 20)
    .then(() => {
      console.log('✅ Analysis completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    });
}

export default {
  analyzeHolderClusters,
  getTopHolders,
  findFundingSource,
};

/**
 * TypeScript Interfaces untuk Solana Token Security Auditor
 */

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
  mintAddress: string;
  image?: string; // Token logo URL
  description?: string; // Token description
}

export interface AuthorityStatus {
  mintAuthority: {
    isActive: boolean;
    address: string | null;
  };
  freezeAuthority: {
    isActive: boolean;
    address: string | null;
  };
}

export interface MetadataInfo {
  isMutable: boolean;
  updateAuthority: string | null;
  uri?: string;
}

export interface RiskAssessment {
  score: number; // 0-100
  level: 'Safe' | 'Caution' | 'Rug Pull Risk';
  warnings: string[];
}

export interface LiquidityInfo {
  hasLiquidity: boolean;
  poolAddress?: string;
  baseReserve?: number;
  quoteReserve?: number;
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

export interface HoneypotInfo {
  isHoneypot: boolean;
  canBuy: boolean;
  canSell: boolean;
  sellTaxPercentage: number;
  buyTaxPercentage: number;
  hasHiddenFees: boolean;
  riskLevel: 'Safe' | 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Honeypot';
  warnings: string[];
}

export interface AuditResult {
  success: boolean;
  tokenInfo: TokenInfo;
  authorityStatus: AuthorityStatus;
  metadataInfo: MetadataInfo;
  liquidityInfo?: LiquidityInfo;
  honeypotInfo?: HoneypotInfo;
  riskAssessment: RiskAssessment;
  timestamp: string;
  cluster: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

export interface AuditRequest {
  tokenAddress: string;
  cluster?: 'mainnet-beta' | 'devnet' | 'testnet';
}

// Developer Tracker Types
export interface DeployedToken {
  address: string;
  signature: string;
  timestamp: number;
  isRugged: boolean;
  liquidityValue: number;
  name?: string;
  symbol?: string;
  age?: number; // Days since deployment
  status: 'Active' | 'Rugged' | 'Dead';
}

export interface DeveloperAnalysis {
  deployerAddress: string;
  tokensCreatedCount: number;
  ruggedCount: number;
  winRate: number;
  riskLevel: 'Serial Scammer' | 'High Risk' | 'Medium Risk' | 'Clean';
  tokensDeployed: DeployedToken[];
  // Enhanced statistics
  averageTimeBetweenDeploys?: number; // in hours
  oldestDeployment?: number; // timestamp
  newestDeployment?: number; // timestamp
  activeTokens?: number;
  deadTokens?: number;
  totalDeploymentDays?: number;
}

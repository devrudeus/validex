/**
 * Validation utilities untuk input sanitization
 */

import { PublicKey } from '@solana/web3.js';

/**
 * Validasi apakah string adalah alamat Solana yang valid
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validasi input request audit
 */
export function validateAuditRequest(tokenAddress: string): {
  isValid: boolean;
  error?: string;
} {
  // Check if address is provided
  if (!tokenAddress || tokenAddress.trim() === '') {
    return {
      isValid: false,
      error: 'Token address is required',
    };
  }

  // Check if address format is valid
  if (!isValidSolanaAddress(tokenAddress)) {
    return {
      isValid: false,
      error: 'Invalid Solana address format',
    };
  }

  return { isValid: true };
}

/**
 * Helius Webhook Handler - Real-time Token Watchdog
 * Mendeteksi perubahan berbahaya pada token yang dimonitor
 */

import { Request, Response } from 'express';
import crypto from 'crypto';

// Types
interface HeliusWebhookPayload {
  accountData: Array<{
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges: Array<{
      mint: string;
      rawTokenAmount: {
        tokenAmount: string;
        decimals: number;
      };
      userAccount: string;
    }>;
  }>;
  description: string;
  events: {
    setAuthority?: Array<{
      account: string;
      from: string | null;
      to: string | null;
      instructionIndex: number;
      authorityType: 'mintTokens' | 'freezeAccount' | 'accountOwner' | 'closeAccount';
    }>;
    mintTo?: Array<{
      mint: string;
      amount: string;
      decimals: number;
      mintAuthority: string;
      instructionIndex: number;
    }>;
  };
  fee: number;
  feePayer: string;
  instructions: Array<{
    accounts: string[];
    data: string;
    programId: string;
    innerInstructions: Array<any>;
  }>;
  nativeTransfers: Array<any>;
  signature: string;
  slot: number;
  source: string;
  timestamp: number;
  tokenTransfers: Array<any>;
  transactionError: any;
  type: string;
}

interface AlertData {
  tokenAddress: string;
  alertType: 'CRITICAL' | 'WARNING' | 'SUPPLY_ALERT';
  severity: 'high' | 'medium' | 'low';
  message: string;
  details: {
    signature: string;
    timestamp: number;
    feePayer: string;
    authorityChange?: {
      type: string;
      from: string | null;
      to: string | null;
    };
    mintAmount?: string;
  };
}

// Webhook secret untuk verifikasi (set di environment variable)
const HELIUS_WEBHOOK_SECRET = process.env.HELIUS_WEBHOOK_SECRET || '';

/**
 * Verifikasi signature dari Helius Webhook
 * Helius menggunakan HMAC-SHA256 untuk signing
 */
function verifyHeliusSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!secret) {
    console.warn('[Webhook] HELIUS_WEBHOOK_SECRET not set - skipping verification');
    return true; // In development, allow without signature
  }

  try {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch (error) {
    console.error('[Webhook] Signature verification error:', error);
    return false;
  }
}

/**
 * Deteksi Authority Changes yang berbahaya
 */
function detectAuthorityChanges(webhook: HeliusWebhookPayload): AlertData | null {
  const setAuthorityEvents = webhook.events.setAuthority;

  if (!setAuthorityEvents || setAuthorityEvents.length === 0) {
    return null;
  }

  for (const event of setAuthorityEvents) {
    // CRITICAL: Mint Authority diaktifkan kembali (dari null ke address)
    if (
      event.authorityType === 'mintTokens' &&
      event.from === null &&
      event.to !== null
    ) {
      return {
        tokenAddress: event.account,
        alertType: 'CRITICAL',
        severity: 'high',
        message: '🚨 CRITICAL ALERT: Mint Authority has been RE-ENABLED! Developer can now mint unlimited tokens.',
        details: {
          signature: webhook.signature,
          timestamp: webhook.timestamp,
          feePayer: webhook.feePayer,
          authorityChange: {
            type: 'Mint Authority',
            from: 'Revoked (null)',
            to: event.to,
          },
        },
      };
    }

    // CRITICAL: Mint Authority dipindahkan ke address baru
    if (
      event.authorityType === 'mintTokens' &&
      event.from !== null &&
      event.to !== null &&
      event.from !== event.to
    ) {
      return {
        tokenAddress: event.account,
        alertType: 'CRITICAL',
        severity: 'high',
        message: '🚨 CRITICAL ALERT: Mint Authority has been TRANSFERRED to a new address!',
        details: {
          signature: webhook.signature,
          timestamp: webhook.timestamp,
          feePayer: webhook.feePayer,
          authorityChange: {
            type: 'Mint Authority Transfer',
            from: event.from,
            to: event.to,
          },
        },
      };
    }

    // WARNING: Freeze Authority diaktifkan kembali
    if (
      event.authorityType === 'freezeAccount' &&
      event.from === null &&
      event.to !== null
    ) {
      return {
        tokenAddress: event.account,
        alertType: 'WARNING',
        severity: 'medium',
        message: '⚠️ WARNING: Freeze Authority has been RE-ENABLED! Developer can freeze accounts.',
        details: {
          signature: webhook.signature,
          timestamp: webhook.timestamp,
          feePayer: webhook.feePayer,
          authorityChange: {
            type: 'Freeze Authority',
            from: 'Revoked (null)',
            to: event.to,
          },
        },
      };
    }

    // WARNING: Freeze Authority dipindahkan
    if (
      event.authorityType === 'freezeAccount' &&
      event.from !== null &&
      event.to !== null &&
      event.from !== event.to
    ) {
      return {
        tokenAddress: event.account,
        alertType: 'WARNING',
        severity: 'medium',
        message: '⚠️ WARNING: Freeze Authority has been TRANSFERRED to a new address!',
        details: {
          signature: webhook.signature,
          timestamp: webhook.timestamp,
          feePayer: webhook.feePayer,
          authorityChange: {
            type: 'Freeze Authority Transfer',
            from: event.from,
            to: event.to,
          },
        },
      };
    }
  }

  return null;
}

/**
 * Deteksi Mint Events (mencetak token dalam jumlah besar)
 */
function detectLargeMints(webhook: HeliusWebhookPayload): AlertData | null {
  const mintToEvents = webhook.events.mintTo;

  if (!mintToEvents || mintToEvents.length === 0) {
    return null;
  }

  for (const event of mintToEvents) {
    const amount = parseFloat(event.amount);
    const humanAmount = amount / Math.pow(10, event.decimals);

    // Alert jika mint lebih dari 1 juta token (threshold bisa disesuaikan)
    const LARGE_MINT_THRESHOLD = 1_000_000;

    if (humanAmount >= LARGE_MINT_THRESHOLD) {
      return {
        tokenAddress: event.mint,
        alertType: 'SUPPLY_ALERT',
        severity: 'high',
        message: `⚠️ SUPPLY ALERT: Large mint detected! ${humanAmount.toLocaleString()} tokens minted.`,
        details: {
          signature: webhook.signature,
          timestamp: webhook.timestamp,
          feePayer: webhook.feePayer,
          mintAmount: `${humanAmount.toLocaleString()} tokens`,
        },
      };
    }

    // Medium alert untuk mint > 100k tokens
    if (humanAmount >= 100_000) {
      return {
        tokenAddress: event.mint,
        alertType: 'SUPPLY_ALERT',
        severity: 'medium',
        message: `⚠️ SUPPLY ALERT: Significant mint detected! ${humanAmount.toLocaleString()} tokens minted.`,
        details: {
          signature: webhook.signature,
          timestamp: webhook.timestamp,
          feePayer: webhook.feePayer,
          mintAmount: `${humanAmount.toLocaleString()} tokens`,
        },
      };
    }
  }

  return null;
}

/**
 * Send Email Alert (placeholder - integrate dengan service seperti SendGrid, AWS SES, dll)
 */
async function sendEmailAlert(
  userEmail: string,
  tokenAddress: string,
  alertData: AlertData
): Promise<void> {
  console.log('\n[EMAIL ALERT] ========================================');
  console.log(`To: ${userEmail}`);
  console.log(`Subject: ${alertData.alertType} - Token ${tokenAddress}`);
  console.log(`Message: ${alertData.message}`);
  console.log('Details:', JSON.stringify(alertData.details, null, 2));
  console.log('=====================================================\n');

  // TODO: Implement actual email sending
  // Example with SendGrid:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: userEmail,
    from: 'alerts@solanaguard.com',
    subject: `${alertData.alertType} - Token ${tokenAddress}`,
    text: alertData.message,
    html: `
      <h2>${alertData.alertType}</h2>
      <p>${alertData.message}</p>
      <h3>Details:</h3>
      <ul>
        <li>Token: ${tokenAddress}</li>
        <li>Signature: <a href="https://solscan.io/tx/${alertData.details.signature}">${alertData.details.signature}</a></li>
        <li>Time: ${new Date(alertData.details.timestamp * 1000).toISOString()}</li>
        <li>Fee Payer: ${alertData.details.feePayer}</li>
      </ul>
    `,
  };

  await sgMail.send(msg);
  */
}

/**
 * Send Discord/Telegram Alert (alternative notification channel)
 */
async function sendDiscordAlert(webhookUrl: string, alertData: AlertData): Promise<void> {
  if (!webhookUrl) return;

  const colorMap = {
    high: 15158332, // Red
    medium: 16776960, // Yellow
    low: 3447003, // Blue
  };

  const payload = {
    embeds: [
      {
        title: `${alertData.alertType} Detected`,
        description: alertData.message,
        color: colorMap[alertData.severity],
        fields: [
          {
            name: 'Token Address',
            value: `\`${alertData.tokenAddress}\``,
            inline: true,
          },
          {
            name: 'Timestamp',
            value: new Date(alertData.details.timestamp * 1000).toISOString(),
            inline: true,
          },
          {
            name: 'Transaction',
            value: `[View on Solscan](https://solscan.io/tx/${alertData.details.signature})`,
            inline: false,
          },
        ],
        footer: {
          text: 'SolanaGuard Watchdog',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('[Discord] Failed to send alert:', response.statusText);
    }
  } catch (error) {
    console.error('[Discord] Error sending alert:', error);
  }
}

/**
 * Main Webhook Handler
 */
export async function handleHeliusWebhook(req: Request, res: Response): Promise<void> {
  try {
    // 1. Verify signature
    const signature = req.headers['x-helius-signature'] as string;
    const rawBody = JSON.stringify(req.body);

    if (HELIUS_WEBHOOK_SECRET && signature) {
      const isValid = verifyHeliusSignature(rawBody, signature, HELIUS_WEBHOOK_SECRET);
      if (!isValid) {
        console.warn('[Webhook] Invalid signature detected!');
        res.status(401).json({ success: false, error: 'Invalid signature' });
        return;
      }
    }

    // 2. Parse payload
    const webhook: HeliusWebhookPayload = req.body[0] || req.body; // Helius bisa kirim array

    console.log(`[Webhook] Received transaction: ${webhook.signature}`);
    console.log(`[Webhook] Type: ${webhook.type}`);
    console.log(`[Webhook] Description: ${webhook.description}`);

    // 3. Detect dangerous changes
    let alert: AlertData | null = null;

    // Check authority changes first (paling critical)
    alert = detectAuthorityChanges(webhook);

    // If no authority changes, check for large mints
    if (!alert) {
      alert = detectLargeMints(webhook);
    }

    // 4. Trigger notifications if alert found
    if (alert) {
      console.log(`\n[ALERT DETECTED] ${alert.alertType} - ${alert.message}`);

      // Get user email from database based on token address (mock for now)
      const userEmail = 'user@example.com'; // TODO: Query dari database watchlist

      // Send notifications
      await sendEmailAlert(userEmail, alert.tokenAddress, alert);

      // Optional: Send to Discord/Telegram
      const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
      if (discordWebhookUrl) {
        await sendDiscordAlert(discordWebhookUrl, alert);
      }

      // TODO: Store alert in database for dashboard
      /*
      await db.alerts.create({
        tokenAddress: alert.tokenAddress,
        alertType: alert.alertType,
        severity: alert.severity,
        message: alert.message,
        signature: alert.details.signature,
        timestamp: alert.details.timestamp,
        notified: true,
      });
      */
    } else {
      console.log('[Webhook] No suspicious activity detected');
    }

    // 5. Respond to Helius (important to avoid retries)
    res.status(200).json({ success: true, processed: true });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

/**
 * Test endpoint untuk simulate webhook (development only)
 */
export async function testWebhook(req: Request, res: Response): Promise<void> {
  const mockWebhook: HeliusWebhookPayload = {
    accountData: [],
    description: 'Test authority change',
    events: {
      setAuthority: [
        {
          account: 'TokenMintAddressHere...',
          from: null,
          to: 'NewAuthorityAddressHere...',
          instructionIndex: 0,
          authorityType: 'mintTokens',
        },
      ],
    },
    fee: 5000,
    feePayer: 'FeePayerAddressHere...',
    instructions: [],
    nativeTransfers: [],
    signature: '5TestSignatureHere...',
    slot: 123456789,
    source: 'HELIUS',
    timestamp: Math.floor(Date.now() / 1000),
    tokenTransfers: [],
    transactionError: null,
    type: 'SET_AUTHORITY',
  };

  req.body = mockWebhook;
  await handleHeliusWebhook(req, res);
}

export default {
  handleHeliusWebhook,
  testWebhook,
};

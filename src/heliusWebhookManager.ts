/**
 * Helius Webhook Manager
 * Script untuk mendaftarkan dan mengelola webhooks di Helius API
 */

import axios from 'axios';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '3ad61b57-e57d-4bc9-9176-cbd567b737ad';
const HELIUS_API_BASE = 'https://api.helius.xyz/v0';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/helius-webhook'; // Your public webhook URL

interface HeliusWebhook {
  webhookID: string;
  wallet: string;
  webhookURL: string;
  transactionTypes: string[];
  accountAddresses: string[];
  webhookType: 'enhanced' | 'raw' | 'discord';
  authHeader?: string;
}

interface CreateWebhookParams {
  tokenAddress: string;
  webhookURL?: string;
  authHeader?: string;
}

/**
 * Create a new webhook for monitoring a token address
 */
export async function createTokenWebhook(params: CreateWebhookParams): Promise<HeliusWebhook> {
  const { tokenAddress, webhookURL = WEBHOOK_URL, authHeader } = params;

  try {
    console.log(`[Helius] Creating webhook for token: ${tokenAddress}`);

    const payload = {
      webhookURL,
      transactionTypes: [
        'SET_AUTHORITY', // Detect authority changes (CRITICAL)
        'MINT_TOKEN', // Detect new token mints (SUPPLY_ALERT)
      ],
      accountAddresses: [tokenAddress],
      webhookType: 'enhanced', // Enhanced provides parsed transaction data
      authHeader: authHeader || undefined, // Optional: Add your own auth header
    };

    const response = await axios.post(`${HELIUS_API_BASE}/webhooks?api-key=${HELIUS_API_KEY}`, payload);

    console.log('[Helius] Webhook created successfully:');
    console.log(`  Webhook ID: ${response.data.webhookID}`);
    console.log(`  Token Address: ${tokenAddress}`);
    console.log(`  Webhook URL: ${webhookURL}`);

    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error('[Helius] Error creating webhook:', error.response.data);
      throw new Error(`Failed to create webhook: ${error.response.data.error || error.message}`);
    }
    throw error;
  }
}

/**
 * Get all existing webhooks
 */
export async function listWebhooks(): Promise<HeliusWebhook[]> {
  try {
    const response = await axios.get(`${HELIUS_API_BASE}/webhooks?api-key=${HELIUS_API_KEY}`);
    return response.data;
  } catch (error: any) {
    console.error('[Helius] Error listing webhooks:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get webhook by ID
 */
export async function getWebhook(webhookId: string): Promise<HeliusWebhook> {
  try {
    const response = await axios.get(
      `${HELIUS_API_BASE}/webhooks/${webhookId}?api-key=${HELIUS_API_KEY}`
    );
    return response.data;
  } catch (error: any) {
    console.error('[Helius] Error getting webhook:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Update webhook (e.g., add more addresses to monitor)
 */
export async function updateWebhook(
  webhookId: string,
  updates: Partial<{
    webhookURL: string;
    transactionTypes: string[];
    accountAddresses: string[];
  }>
): Promise<HeliusWebhook> {
  try {
    console.log(`[Helius] Updating webhook: ${webhookId}`);

    const response = await axios.put(
      `${HELIUS_API_BASE}/webhooks/${webhookId}?api-key=${HELIUS_API_KEY}`,
      updates
    );

    console.log('[Helius] Webhook updated successfully');
    return response.data;
  } catch (error: any) {
    console.error('[Helius] Error updating webhook:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Delete webhook
 */
export async function deleteWebhook(webhookId: string): Promise<void> {
  try {
    console.log(`[Helius] Deleting webhook: ${webhookId}`);

    await axios.delete(`${HELIUS_API_BASE}/webhooks/${webhookId}?api-key=${HELIUS_API_KEY}`);

    console.log('[Helius] Webhook deleted successfully');
  } catch (error: any) {
    console.error('[Helius] Error deleting webhook:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Add token address to existing webhook
 */
export async function addTokenToWebhook(webhookId: string, tokenAddress: string): Promise<void> {
  try {
    const webhook = await getWebhook(webhookId);
    const currentAddresses = webhook.accountAddresses || [];

    if (currentAddresses.includes(tokenAddress)) {
      console.log(`[Helius] Token ${tokenAddress} already monitored in webhook ${webhookId}`);
      return;
    }

    await updateWebhook(webhookId, {
      accountAddresses: [...currentAddresses, tokenAddress],
    });

    console.log(`[Helius] Token ${tokenAddress} added to webhook ${webhookId}`);
  } catch (error) {
    console.error('[Helius] Error adding token to webhook:', error);
    throw error;
  }
}

/**
 * Remove token address from webhook
 */
export async function removeTokenFromWebhook(
  webhookId: string,
  tokenAddress: string
): Promise<void> {
  try {
    const webhook = await getWebhook(webhookId);
    const currentAddresses = webhook.accountAddresses || [];

    const updatedAddresses = currentAddresses.filter((addr) => addr !== tokenAddress);

    if (updatedAddresses.length === currentAddresses.length) {
      console.log(`[Helius] Token ${tokenAddress} not found in webhook ${webhookId}`);
      return;
    }

    await updateWebhook(webhookId, {
      accountAddresses: updatedAddresses,
    });

    console.log(`[Helius] Token ${tokenAddress} removed from webhook ${webhookId}`);
  } catch (error) {
    console.error('[Helius] Error removing token from webhook:', error);
    throw error;
  }
}

/**
 * CLI Helper - Run from command line
 */
if (require.main === module) {
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];

  (async () => {
    try {
      switch (command) {
        case 'create':
          if (!arg1) {
            console.error('Usage: ts-node heliusWebhookManager.ts create <tokenAddress>');
            process.exit(1);
          }
          await createTokenWebhook({ tokenAddress: arg1 });
          break;

        case 'list':
          const webhooks = await listWebhooks();
          console.log('\n=== All Webhooks ===');
          webhooks.forEach((wh, idx) => {
            console.log(`\n[${idx + 1}] Webhook ID: ${wh.webhookID}`);
            console.log(`    URL: ${wh.webhookURL}`);
            console.log(`    Monitoring ${wh.accountAddresses.length} addresses`);
            console.log(`    Types: ${wh.transactionTypes.join(', ')}`);
          });
          break;

        case 'get':
          if (!arg1) {
            console.error('Usage: ts-node heliusWebhookManager.ts get <webhookId>');
            process.exit(1);
          }
          const webhook = await getWebhook(arg1);
          console.log('\n=== Webhook Details ===');
          console.log(JSON.stringify(webhook, null, 2));
          break;

        case 'delete':
          if (!arg1) {
            console.error('Usage: ts-node heliusWebhookManager.ts delete <webhookId>');
            process.exit(1);
          }
          await deleteWebhook(arg1);
          break;

        case 'add-token':
          if (!arg1 || !arg2) {
            console.error('Usage: ts-node heliusWebhookManager.ts add-token <webhookId> <tokenAddress>');
            process.exit(1);
          }
          await addTokenToWebhook(arg1, arg2);
          break;

        case 'remove-token':
          if (!arg1 || !arg2) {
            console.error('Usage: ts-node heliusWebhookManager.ts remove-token <webhookId> <tokenAddress>');
            process.exit(1);
          }
          await removeTokenFromWebhook(arg1, arg2);
          break;

        default:
          console.log(`
=== Helius Webhook Manager ===

Commands:
  create <tokenAddress>                      Create new webhook for token
  list                                        List all webhooks
  get <webhookId>                            Get webhook details
  delete <webhookId>                         Delete webhook
  add-token <webhookId> <tokenAddress>       Add token to existing webhook
  remove-token <webhookId> <tokenAddress>    Remove token from webhook

Examples:
  npm run webhook create TokenAddress123...
  npm run webhook list
  npm run webhook delete webhook-id-123
          `);
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  })();
}

export default {
  createTokenWebhook,
  listWebhooks,
  getWebhook,
  updateWebhook,
  deleteWebhook,
  addTokenToWebhook,
  removeTokenFromWebhook,
};

/**
 * Run Telegram Bot
 * Usage: npx ts-node src/runTelegramBot.ts
 */

import { config as dotenvConfig } from 'dotenv';
import { TokenAuditorBot } from './telegramBot';

// Load environment variables
dotenvConfig();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN not set in .env file');
  console.error('\nPlease add your Telegram Bot token to .env:');
  console.error('TELEGRAM_BOT_TOKEN=your_bot_token_here');
  console.error('\nGet a bot token from @BotFather on Telegram');
  process.exit(1);
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║       Solana Token Security Auditor - Telegram Bot        ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Create and start bot
const bot = new TokenAuditorBot(TELEGRAM_BOT_TOKEN);
bot.start();

console.log('✅ Bot is now listening for commands...');
console.log('\nAvailable commands:');
console.log('  /start - Welcome message');
console.log('  /audit <token_address> - Full security audit');
console.log('  /volume <token_address> - Trading volume analysis');
console.log('  /holders <token_address> - Holder distribution');
console.log('  /help - Show help message\n');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down bot...');
  bot.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down bot...');
  bot.stop();
  process.exit(0);
});

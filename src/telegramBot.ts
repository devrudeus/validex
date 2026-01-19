/**
 * Telegram Bot for Token Auditing
 * Commands:
 * /start - Welcome message
 * /audit <token_address> - Audit a token
 * /help - Show available commands
 */

import TelegramBot from 'node-telegram-bot-api';
import { SolanaTokenAuditor } from './auditor';
import { HolderDistributionAnalyzer } from './holderDistribution';
import { VolumeMonitor } from './volumeMonitor';
import { Connection } from '@solana/web3.js';
import config from './config';

export class TokenAuditorBot {
  private bot: TelegramBot;
  private auditor: SolanaTokenAuditor;
  private connection: Connection;

  constructor(token: string) {
    this.bot = new TelegramBot(token, { polling: true });
    this.auditor = new SolanaTokenAuditor();
    this.connection = new Connection(config.solana.rpcUrl, { commitment: 'finalized' });

    this.setupCommands();
  }

  /**
   * Setup bot commands
   */
  private setupCommands() {
    // /start command
    this.bot.onText(/\/start/, (msg) => {
      this.handleStart(msg);
    });

    // /help command
    this.bot.onText(/\/help/, (msg) => {
      this.handleHelp(msg);
    });

    // /audit command
    this.bot.onText(/\/audit (.+)/, (msg, match) => {
      if (match && match[1]) {
        this.handleAudit(msg, match[1].trim());
      } else {
        this.bot.sendMessage(
          msg.chat.id,
          '❌ Usage: /audit <token_address>\n\nExample:\n/audit DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'
        );
      }
    });

    // /volume command
    this.bot.onText(/\/volume (.+)/, (msg, match) => {
      if (match && match[1]) {
        this.handleVolume(msg, match[1].trim());
      }
    });

    // /holders command
    this.bot.onText(/\/holders (.+)/, (msg, match) => {
      if (match && match[1]) {
        this.handleHolders(msg, match[1].trim());
      }
    });

    console.log('✅ Telegram Bot is running...');
  }

  /**
   * Handle /start command
   */
  private handleStart(msg: TelegramBot.Message) {
    const welcomeMessage = `
🤖 **Solana Token Security Auditor Bot**

Welcome! I can help you analyze Solana tokens for security risks.

**Available Commands:**
/audit <address> - Full security audit
/volume <address> - Trading volume & activity
/holders <address> - Holder distribution
/help - Show this message

**Example:**
\`/audit DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263\`

⚠️ Always DYOR (Do Your Own Research)
`;

    this.bot.sendMessage(msg.chat.id, welcomeMessage, { parse_mode: 'Markdown' });
  }

  /**
   * Handle /help command
   */
  private handleHelp(msg: TelegramBot.Message) {
    this.handleStart(msg); // Same as start
  }

  /**
   * Handle /audit command
   */
  private async handleAudit(msg: TelegramBot.Message, tokenAddress: string) {
    const chatId = msg.chat.id;

    // Send "analyzing" message
    const loadingMsg = await this.bot.sendMessage(
      chatId,
      '🔍 Analyzing token... Please wait...'
    );

    try {
      // Validate address format (basic check)
      if (tokenAddress.length < 32 || tokenAddress.length > 44) {
        throw new Error('Invalid token address format');
      }

      // Perform audit
      const result = await this.auditor.auditToken(tokenAddress);

      if (!result.success) {
        throw new Error('Audit failed');
      }

      // Format audit result message
      const message = this.formatAuditResult(result);

      // Delete loading message
      await this.bot.deleteMessage(chatId, loadingMsg.message_id);

      // Send result
      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      });
    } catch (error: any) {
      // Delete loading message
      await this.bot.deleteMessage(chatId, loadingMsg.message_id);

      // Send error message
      await this.bot.sendMessage(
        chatId,
        `❌ **Error:** ${error.message}\n\nPlease check the token address and try again.`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  /**
   * Handle /volume command
   */
  private async handleVolume(msg: TelegramBot.Message, tokenAddress: string) {
    const chatId = msg.chat.id;

    const loadingMsg = await this.bot.sendMessage(chatId, '📊 Fetching volume data...');

    try {
      const volumeMonitor = new VolumeMonitor();
      const volumeData = await volumeMonitor.getVolumeData(tokenAddress);

      const message = this.formatVolumeData(volumeData, tokenAddress);

      await this.bot.deleteMessage(chatId, loadingMsg.message_id);
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error: any) {
      await this.bot.deleteMessage(chatId, loadingMsg.message_id);
      await this.bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  }

  /**
   * Handle /holders command
   */
  private async handleHolders(msg: TelegramBot.Message, tokenAddress: string) {
    const chatId = msg.chat.id;

    const loadingMsg = await this.bot.sendMessage(chatId, '📊 Analyzing holders...');

    try {
      const analyzer = new HolderDistributionAnalyzer(this.connection);
      const distribution = await analyzer.analyzeDistribution(tokenAddress, 10);

      const message = this.formatHolderDistribution(distribution, tokenAddress);

      await this.bot.deleteMessage(chatId, loadingMsg.message_id);
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error: any) {
      await this.bot.deleteMessage(chatId, loadingMsg.message_id);
      await this.bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  }

  /**
   * Format audit result for Telegram
   */
  private formatAuditResult(result: any): string {
    const { tokenInfo, authorityStatus, riskAssessment } = result;

    const scoreEmoji = this.getScoreEmoji(riskAssessment.score);
    const riskEmoji = this.getRiskEmoji(riskAssessment.level);

    let message = `
🪙 **${tokenInfo.name} (${tokenInfo.symbol})**
${tokenInfo.description || ''}

${scoreEmoji} **Risk Score:** ${riskAssessment.score}/100
${riskEmoji} **Risk Level:** ${riskAssessment.level}

**Authority Status:**
${authorityStatus.mintAuthority.isActive ? '🚨 Mint Authority: ACTIVE' : '✅ Mint Authority: Revoked'}
${authorityStatus.freezeAuthority.isActive ? '⚠️ Freeze Authority: ACTIVE' : '✅ Freeze Authority: Revoked'}

**Warnings:**
`;

    // Add warnings (limit to 5 for brevity)
    riskAssessment.warnings.slice(0, 5).forEach((warning: string) => {
      message += `${warning}\n`;
    });

    message += `\n📍 Address: \`${tokenInfo.mintAddress}\``;

    if (tokenInfo.image) {
      message += `\n🖼️ [View Token Image](${tokenInfo.image})`;
    }

    return message;
  }

  /**
   * Format volume data for Telegram
   */
  private formatVolumeData(data: any, tokenAddress: string): string {
    let message = `
📊 **Trading Volume Analysis**

**24h Activity:**
💵 Volume: $${this.formatNumber(data.volume24h)}
📈 Trades: ${data.trades24h}
👥 Buyers: ${data.buyers24h} | Sellers: ${data.sellers24h}

**Market Data:**
📊 Market Cap: $${this.formatNumber(data.marketCap)}
💧 Liquidity: $${this.formatNumber(data.liquidity)}
📉 Price Change: ${data.priceChange24h.toFixed(2)}%

**Activity Level:** ${data.activityLevel}

**Warnings:**
`;

    data.warnings.forEach((warning: string) => {
      message += `${warning}\n`;
    });

    message += `\n📍 \`${tokenAddress}\``;

    return message;
  }

  /**
   * Format holder distribution for Telegram
   */
  private formatHolderDistribution(data: any, tokenAddress: string): string {
    let message = `
📊 **Holder Distribution**

**Concentration:**
Top 1: ${data.distribution.top1Percentage.toFixed(2)}%
Top 5: ${data.distribution.top5Percentage.toFixed(2)}%
Top 10: ${data.distribution.top10Percentage.toFixed(2)}%

**Level:** ${data.concentrationLevel}
**Gini Coefficient:** ${data.giniCoefficient.toFixed(3)}

**Warnings:**
`;

    data.warnings.forEach((warning: string) => {
      message += `${warning}\n`;
    });

    message += `\n📍 \`${tokenAddress}\``;

    return message;
  }

  /**
   * Helper functions
   */
  private getScoreEmoji(score: number): string {
    if (score >= 80) return '🛡️';
    if (score >= 50) return '⚠️';
    return '🚨';
  }

  private getRiskEmoji(level: string): string {
    if (level === 'Safe') return '✅';
    if (level === 'Caution') return '⚠️';
    return '🚨';
  }

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
   * Start the bot
   */
  start() {
    console.log('🤖 Telegram Bot started successfully!');
  }

  /**
   * Stop the bot
   */
  stop() {
    this.bot.stopPolling();
    console.log('🛑 Telegram Bot stopped');
  }
}

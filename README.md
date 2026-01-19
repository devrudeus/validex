# Validex - Solana Token Security Scanner

<div align="center">

![Validex Logo](svelte-app/public/validex.png)

**Free real-time security analysis for Solana SPL tokens**

[![Built with Svelte](https://img.shields.io/badge/Built%20with-Svelte-FF3E00?style=flat&logo=svelte)](https://svelte.dev)
[![Powered by Solana](https://img.shields.io/badge/Powered%20by-Solana-14F195?style=flat&logo=solana)](https://solana.com)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat&logo=vercel)](https://vercel.com)

[Live Demo](#) • [Documentation](#documentation) • [API Reference](#api-endpoints)

</div>

---

## 🎯 Overview

Validex is a comprehensive security scanner for Solana SPL tokens that helps investors make informed decisions by analyzing critical security parameters in real-time. Built with a modern tech stack combining Svelte frontend and Node.js serverless backend.

### Key Features

- ✅ **Mint Authority Check** - Detect if developers can mint unlimited tokens
- ✅ **Freeze Authority Check** - Identify if accounts can be frozen
- ✅ **Metadata Analysis** - Verify if token identity can be changed
- ✅ **Liquidity Analysis** - Check if there's enough liquidity for safe trading
- ✅ **Holder Distribution** - Analyze wallet concentration
- ✅ **Developer Tracking** - Track deployment history to detect serial scammers
- ✅ **Honeypot Detection** - Identify tokens designed to trap buyers
- ✅ **Real-time Data** - Live blockchain analysis (~3s scan time)
- ✅ **Modern UI** - Beautiful, responsive interface with animations

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **npm** or **yarn**
- **Solana RPC endpoint** (optional, uses public by default)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/validex.git
cd validex

# Install dependencies (root + frontend)
npm install
cd svelte-app && npm install && cd ..

# Build project
npm run build
```

### Development

```bash
# Start frontend dev server
cd svelte-app
npm run dev
# Opens at http://localhost:3003

# Start backend API (in separate terminal)
npm run dev
# API runs at http://localhost:3000
```

### Production Build

```bash
# Build everything
npm run build

# Preview production build
cd svelte-app && npm run preview
```

---

## 📁 Project Structure

```
validex/
├── svelte-app/              # Frontend application
│   ├── src/
│   │   ├── App.svelte       # Main app component
│   │   ├── Hero.svelte      # Hero section with branding
│   │   ├── Features.svelte  # Security features grid
│   │   ├── Footer.svelte    # Footer with links
│   │   └── About.svelte     # About page
│   ├── public/
│   │   └── validex.png      # Logo & favicon
│   └── dist/                # Production build output
├── api/
│   └── index.ts             # Vercel serverless function
├── src/
│   ├── auditor/             # Core audit logic
│   │   └── TokenAuditor.ts  # Main auditor class
│   └── utils/               # Utility functions
├── vercel.json              # Vercel deployment config
├── package.json             # Backend dependencies
└── README.md                # This file
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

#### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/validex)

#### Manual Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod
```

#### Environment Variables

Set these in Vercel Dashboard or via CLI:

```bash
# Solana RPC endpoint
vercel env add SOLANA_RPC_URL
# Value: https://api.mainnet-beta.solana.com

# Optional: Helius API key for faster RPC
vercel env add HELIUS_API_KEY
# Value: your-helius-api-key
```

**Vercel Configuration** (`vercel.json`):
- ✅ Frontend: Static hosting via CDN
- ✅ Backend: Serverless functions (Node.js 18)
- ✅ Build: Automatic on git push
- ✅ Routes: `/` → Frontend, `/api/*` → Backend

See [VERCEL_DEPLOY_GUIDE.md](VERCEL_DEPLOY_GUIDE.md) for detailed instructions.

---

## 📡 API Endpoints

### Backend API

Base URL: `https://your-app.vercel.app/api`

#### 1. Audit Token (GET)

```bash
GET /api/audit/:tokenAddress
```

**Example**:
```bash
curl https://validex.vercel.app/api/audit/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

**Response**:
```json
{
  "success": true,
  "token": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "audit": {
    "mintAuthority": {
      "enabled": false,
      "authority": null,
      "risk": "safe"
    },
    "freezeAuthority": {
      "enabled": false,
      "authority": null,
      "risk": "safe"
    },
    "metadata": {
      "name": "USD Coin",
      "symbol": "USDC",
      "uri": "https://...",
      "locked": true
    },
    "supply": {
      "total": "1000000000",
      "decimals": 6
    }
  },
  "developer": {
    "address": "...",
    "tokensDeployed": 5,
    "rugged": 1,
    "winRate": 80.0
  },
  "timestamp": "2025-01-19T10:30:00.000Z"
}
```

#### 2. Audit Token (POST)

```bash
POST /api/audit
Content-Type: application/json

{
  "tokenAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
}
```

See [api/index.ts](api/index.ts) for full API implementation.

---

## 🎨 Frontend Features

### Bento Grid Layout

Modern card-based layout showcasing security features:

1. **Mint Authority Check** (Large, 2×2)
   - Active = Dangerous ❌
   - Revoked = Safe ✅

2. **Freeze Authority** (Medium, 1×1)
   - High risk if active

3. **Metadata Lock** (Medium, 1×1)
   - Watch if mutable

4. **Developer History** (Wide, 2×1)
   - Tokens deployed, rugged, win rate

5. **Real-time Data** (Small, 1×1)
   - 100% live data badge

6. **Scan Speed** (Small, 1×1)
   - ~3s average time

7. **Liquidity Analysis** (Medium, 1×1)
   - Live check badge

8. **Holder Distribution** (Medium, 1×1)
   - Top 10 holders analysis

9. **Honeypot Detection** (Wide, 2×1)
   - Sell restrictions, transfer limits, hidden functions

### Responsive Design

- **Desktop**: 4-column grid with hover animations
- **Tablet**: 2-column adaptive layout
- **Mobile**: Single column stack

### Animations

- Intersection Observer for staggered fade-in
- Hover effects with scale & translation
- Smooth transitions with cubic-bezier easing
- Icon animations (bounce, rotate, pulse)

---

## 🧪 Testing

### Test with Real Tokens

```bash
# USDC (Stablecoin - Centralized but trusted)
curl http://localhost:3000/api/audit/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# SOL (Wrapped Solana)
curl http://localhost:3000/api/audit/So11111111111111111111111111111111111111112

# BONK (Community token)
curl http://localhost:3000/api/audit/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263
```

### Frontend Testing

1. Navigate to `http://localhost:3003`
2. Scroll to Features section
3. Observe animations trigger on scroll
4. Hover over cards for interactive effects
5. Test responsive layout (resize browser)

---

## 🔒 Security Considerations

### For Investors

**Red Flags** 🚨:
- ❌ Mint Authority active → Can mint unlimited tokens
- ❌ Freeze Authority active → Can freeze your wallet
- ❌ Metadata mutable → Can change token identity
- ❌ Developer has history of rugging → High risk
- ❌ Concentrated holder distribution → Whale risk
- ❌ Low liquidity → Can't sell safely

**Green Flags** ✅:
- ✅ All authorities revoked
- ✅ Metadata locked
- ✅ Good developer history
- ✅ Distributed holders
- ✅ Sufficient liquidity

### For Developers

**Best Practices**:
1. Revoke Mint Authority after initial distribution
2. Revoke Freeze Authority to build trust
3. Lock metadata after finalizing branding
4. Maintain transparent on-chain history
5. Ensure adequate liquidity pools

---

## 📦 Dependencies

### Frontend (Svelte)
- **svelte** - Reactive UI framework
- **vite** - Build tool & dev server
- **typescript** - Type safety

### Backend (Node.js)
- **@solana/web3.js** - Solana SDK
- **@solana/spl-token** - Token program interface
- **@metaplex-foundation/mpl-token-metadata** - Metadata parsing
- **express** - Web framework (local dev)
- **typescript** - Type safety

### Deployment
- **vercel** - Serverless hosting platform

---

## ⚡ Performance

### Build Performance
```
✓ Frontend build: 1.92s
✓ Backend compile: 0.5s
✓ Total: 2.42s
```

### Bundle Sizes
```
Frontend:
├── HTML: 1.63 kB (gzip: 0.72 kB)
├── CSS: 71.29 kB (gzip: 10.99 kB)
└── JS: 287.74 kB (gzip: 94.74 kB)

Total (gzipped): 106.45 kB
```

### Runtime Performance
- **Token Audit**: 2-5 seconds (depends on RPC speed)
- **Page Load**: <1 second (CDN cached)
- **Animations**: 60fps (GPU accelerated)

### Optimization Tips

1. **Use Premium RPC**
   - QuickNode, Helius, or Alchemy
   - 10-50x faster than public endpoints

2. **Implement Caching**
   - Cache audit results (Redis/Upstash)
   - TTL: 5-15 minutes

3. **Rate Limiting**
   - Prevent abuse
   - Use Vercel edge middleware

---

## 🛠️ Development

### Scripts

```bash
# Install all dependencies
npm install && cd svelte-app && npm install

# Frontend development
cd svelte-app && npm run dev

# Backend development
npm run dev

# Build everything
npm run build

# Type checking
npm run type-check
cd svelte-app && npm run check

# Lint
npm run lint
```

### Adding Features

1. **Frontend**: Edit `svelte-app/src/Features.svelte`
2. **Backend**: Edit `api/index.ts` or `src/auditor/`
3. **Styling**: Use CSS in `<style>` blocks (scoped)
4. **Assets**: Add to `svelte-app/public/`

---

## 📚 Documentation

- [VERCEL_DEPLOY_GUIDE.md](VERCEL_DEPLOY_GUIDE.md) - Complete deployment guide
- [LOGO_IMPLEMENTATION.md](LOGO_IMPLEMENTATION.md) - Branding setup
- [LOCALHOST_SETUP.md](LOCALHOST_SETUP.md) - Local development guide
- [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - Deployment overview

---

## 🐛 Troubleshooting

### Build Errors

**Issue**: `Cannot find module '@solana/web3.js'`

**Fix**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### RPC Rate Limiting

**Issue**: `429 Too Many Requests` from Solana RPC

**Fix**:
1. Use premium RPC provider (recommended)
2. Add delays between requests
3. Implement caching
4. Use Helius/QuickNode API keys

### CORS Errors

**Issue**: CORS errors when calling API from frontend

**Fix**: Already handled in `api/index.ts`:
```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
```

### Vercel Deployment Issues

**Issue**: Build fails on Vercel

**Fix**:
1. Check `vercel.json` configuration
2. Ensure all dependencies in `package.json`
3. Set environment variables in Vercel dashboard
4. Check build logs for specific errors

---

## 🤝 Contributing

Contributions welcome! Please follow these guidelines:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style

- Use TypeScript for type safety
- Follow existing code patterns
- Add comments for complex logic
- Test before submitting PR

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **Solana Foundation** - For the amazing blockchain platform
- **Metaplex** - For metadata standards
- **Svelte Team** - For the reactive framework
- **Vercel** - For serverless hosting

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/validex/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/validex/discussions)
- **Twitter**: [@validex](https://twitter.com/validex) (if applicable)

---

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Core audit functionality
- [x] Modern frontend UI
- [x] Vercel deployment
- [x] Real-time analysis

### Phase 2 (Planned)
- [ ] Historical audit data
- [ ] Price integration
- [ ] Wallet connection
- [ ] Saved tokens/watchlist
- [ ] Email alerts

### Phase 3 (Future)
- [ ] API rate limiting
- [ ] Premium features
- [ ] Mobile app
- [ ] Multi-chain support

---

<div align="center">

**Built with ❤️ for the Solana Community**

Stay Safe! Happy Auditing! 🚀

[⬆ Back to Top](#validex---solana-token-security-scanner)

</div>

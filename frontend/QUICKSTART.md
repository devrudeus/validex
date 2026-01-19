# 🚀 Quick Start Guide - SolanaGuard Landing Page

Get your landing page running in 2 minutes!

## Step 1: Install Dependencies

```bash
cd frontend
npm install
```

**Wait time**: ~1-2 minutes (depending on internet speed)

## Step 2: Start Development Server

```bash
npm run dev
```

You should see:

```
✓ Ready in 2.5s
○ Local:   http://localhost:3000
```

## Step 3: Open in Browser

Navigate to: **http://localhost:3000**

You're done! 🎉

---

## What You'll See

### Hero Section ✨
- Large "Don't Get Rugged" headline
- Token address input field
- Glowing "Audit Now" button
- Animated background with cyber grid

### Features Section 🛡️
- 6 feature cards with icons
- Hover effects with neon glow
- Responsive grid layout

### Live Demo 📊
- Mock audit result showing "PepeSol" token
- Risk score: 85/100 (Safe)
- Security checks with green checkmarks

### Trust Section 🏆
- Statistics: 10K+ tokens scanned
- Partner logos
- User testimonials

### Footer 📝
- Important disclaimer
- Social links
- Company info

---

## Common Commands

```bash
# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Type checking
npx tsc --noEmit
```

---

## Customization Quick Tips

### Change Colors

Edit `tailwind.config.ts` → `theme.extend.colors.cyber`

### Change Hero Text

Edit `components/HeroSection.tsx` → Update headline text

### Change Features

Edit `components/FeaturesSection.tsx` → Modify `features` array

### Add Your Logo

Replace Shield icon in `components/HeroSection.tsx` with your logo component

---

## Integration with Backend API

The landing page is ready to connect to your backend!

**File to edit**: `components/HeroSection.tsx`

Find this function:

```typescript
const handleAudit = () => {
  if (tokenAddress.trim()) {
    console.log('Auditing token:', tokenAddress)
    // API call logic here  <-- Add your API call here
  }
}
```

Replace with:

```typescript
const handleAudit = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenAddress })
    })
    const result = await response.json()
    console.log('Audit result:', result)
    // Display result to user
  } catch (error) {
    console.error('Audit failed:', error)
  }
}
```

---

## Troubleshooting

### Port 3000 already in use?

```bash
# Use different port
PORT=3001 npm run dev
```

### Module not found?

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors?

```bash
# This is normal during development
# Check with: npx tsc --noEmit
```

---

## Next Steps

1. ✅ Customize colors and content
2. ✅ Connect to backend API
3. ✅ Add your branding/logo
4. ✅ Test on mobile devices
5. ✅ Deploy to Vercel/Netlify

**Deploy to Vercel**: `npx vercel`

---

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review component files for inline comments
- Test each section individually

**Happy Building! 🚀**

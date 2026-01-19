# SolanaGuard - Svelte Version

A more natural, less AI-generated looking landing page for the Solana Token Security Auditor.

## Design Philosophy

This version ditches the over-polished, "generated" aesthetic for something more real:

- **No perfect grids** - Layouts breathe naturally
- **Less dramatic copy** - Honest, casual tone
- **No emoji spam** - Used sparingly and meaningfully
- **Real personality** - Feels handcrafted, not templated
- **Subtle animations** - Not flashy, just smooth
- **Honest messaging** - No overpromising or hype

## What's Different from the Next.js Version?

| Next.js Version | Svelte Version |
|-----------------|----------------|
| "Don't Get RUGGED" (dramatic) | "Stop gambling with sketchy tokens" (real) |
| Neon cyberpunk everything | Subtle purple accents |
| Perfect grid layouts | Organic, natural spacing |
| 10+ features section | 3 clear points |
| Generic testimonials | No fake social proof |
| Emoji overload | Minimal, tasteful icons |

## Running the App

```bash
npm install
npm run dev
```

Open http://localhost:3002

## Tech Stack

- **Svelte 4** - Simple, fast, no virtual DOM
- **Vite** - Lightning fast build tool
- **Vanilla CSS** - No Tailwind bloat
- **Custom fonts** - Inter + Space Mono

## Structure

```
src/
├── App.svelte         # Main app logic & routing
├── Hero.svelte        # Hero section with parallax
├── Scanner.svelte     # Input + examples
├── ResultView.svelte  # Scan results display
├── Footer.svelte      # Footer with disclaimer
├── app.css            # Global styles & design system
└── main.js            # Entry point
```

## Design System

```css
Colors:
--bg: #0d0d12 (dark background)
--surface: #16161f (cards)
--accent: #7d5fff (purple - not neon)
--danger: #ff4757 (red)
--warning: #ffa502 (orange)
--success: #2ed573 (green)
--text: #e4e4e7 (light)
--text-dim: #9ca3af (dim text)
--border: #27273a (subtle borders)

Typography:
- Headlines: Inter, bold, tight leading
- Body: Inter, regular
- Code: Space Mono

Spacing:
- Not perfect multiples of 8
- Natural gaps that feel right
- No obsessive consistency
```

## Features

### 1. Real Hero Section
- Parallax scroll effect (subtle)
- Live badge with pulsing dot
- Humble stats (not inflated)
- Casual, honest copy

### 2. Smart Scanner
- Clean input field
- Example buttons (try: USDC, BONK)
- Error states
- Loading animation
- Real info cards (not marketing fluff)

### 3. Results Display
- Big, clear score
- Simple check list
- Honest warnings
- Bottom disclaimer

### 4. Footer
- Minimal links
- Real disclaimer
- No fake partners

## API Integration

The scanner calls your backend:

```javascript
const res = await fetch(`http://localhost:3000/api/audit/${address}`)
const data = await res.json()
```

Make sure your backend is running on port 3000!

## Customization

### Change Colors
Edit `src/app.css`:
```css
:root {
  --accent: #your-color;
}
```

### Change Copy
Edit components directly:
- Hero text: `Hero.svelte`
- Info cards: `Scanner.svelte`
- Disclaimer: `Footer.svelte`

### Add Features
Svelte makes it easy - just add to the component:
```svelte
<script>
  let yourState = 'whatever'
</script>

<div>{yourState}</div>

<style>
  /* scoped to this component */
</style>
```

## Why Svelte?

1. **Smaller bundle** - No framework runtime
2. **Faster** - No virtual DOM diffing
3. **Simpler** - Less boilerplate
4. **Reactive** - Built-in reactivity
5. **Scoped styles** - CSS that doesn't leak

## Deployment

### Build for production:
```bash
npm run build
# Outputs to dist/
```

### Deploy to Vercel/Netlify:
```
Build command: npm run build
Output directory: dist
```

## Comparison

**Before (Generic AI Vibe):**
- "Military-Grade Token Analysis"
- Neon purple/green everywhere
- Perfect grid of 6 features
- Fake testimonials
- 10,000+ metrics everywhere
- "Game changer" type copy

**After (Human Touch):**
- "Stop gambling with sketchy tokens"
- Subtle purple accent
- 3 honest info points
- No fake social proof
- Real stats (8,247 scans)
- Casual, real talk

## Notes

- This is meant to feel like a real product, not a landing page template
- Copy is conversational, not marketing-speak
- Design has imperfections (by design)
- No trying to look "premium" or "enterprise"
- Just a useful tool with a clean interface

---

Made with Svelte. No BS, just code.

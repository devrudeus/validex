# 🧩 Component Guide - SolanaGuard Frontend

Detailed guide untuk setiap component di landing page.

---

## 📁 Component Structure

```
components/
├── HeroSection.tsx          # Main hero dengan input
├── FeaturesSection.tsx      # Features grid
├── LiveAuditDemo.tsx        # Demo audit result
├── TrustSection.tsx         # Stats & testimonials
└── Footer.tsx               # Footer dengan disclaimer
```

---

## 1. HeroSection.tsx

### Purpose
First section yang dilihat user - capture attention dan provide main action (input token address).

### Features
- ✨ Large gradient headline
- 📝 Token address input field
- 🔘 Glowing "Audit Now" button
- 📊 Stats grid (4 metrics)
- 🎨 Animated background
- 📍 Scroll indicator

### Props
None (self-contained)

### State Management
```typescript
const [tokenAddress, setTokenAddress] = useState('')
const [isHovered, setIsHovered] = useState(false)
```

### Key Functions
```typescript
handleAudit() // Process audit request
```

### Customization Points

**Change Headline**
```typescript
<h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
  <span className="block text-white mb-2">Your New</span>
  <span className="block gradient-text text-glow-purple">Headline</span>
</h2>
```

**Change Stats**
```typescript
const stats = [
  { value: '10K+', label: 'Your Metric' },
  // Add more...
]
```

**Change Input Placeholder**
```typescript
placeholder="Your new placeholder text..."
```

### Animations
- `animate-float` - Floating logo
- `animate-pulse` - Pulsing status dots
- `animate-bounce` - Scroll indicator
- `cyber-grid` - Moving background grid

---

## 2. FeaturesSection.tsx

### Purpose
Showcase main features/capabilities dengan visual hierarchy.

### Features
- 🎯 6 feature cards
- 🎨 Color-coded by category
- ✨ Hover glow effects
- 📊 Feature statistics
- 📱 Responsive grid

### Props
None (self-contained)

### Data Structure
```typescript
const features = [
  {
    icon: Shield,           // Lucide icon component
    title: 'Feature Name',
    description: 'Description...',
    color: 'purple',        // Theme color
    stats: 'Metric',
  },
]
```

### Available Colors
```typescript
type Colors = 'purple' | 'pink' | 'green' | 'blue' | 'orange' | 'cyan'
```

### Customization Points

**Add New Feature**
```typescript
{
  icon: YourIcon,
  title: 'Your Feature',
  description: 'Description of your feature...',
  color: 'purple',
  stats: 'Your Metric',
}
```

**Change Grid Layout**
```typescript
// Current: 3 columns on large screens
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Change to 2 columns:
className="grid grid-cols-1 md:grid-cols-2 gap-6"
```

**Change Section Title**
```typescript
<h3 className="text-4xl md:text-5xl font-bold mb-6">
  Your New
  <span className="gradient-text"> Title</span>
</h3>
```

### Hover Effects
- Card lift on hover
- Neon glow shadow
- Icon scale up
- Background opacity change

---

## 3. LiveAuditDemo.tsx

### Purpose
Show users what an audit result looks like - build trust dan set expectations.

### Features
- 🎯 Mock audit result card
- 📊 Risk score badge
- ✅ Security checks grid
- ⚠️ Warnings section
- 🕐 Timestamp display

### Props
None (uses mock data)

### Mock Data Structure
```typescript
const auditData = {
  tokenName: 'PepeSol',
  symbol: 'PEPE',
  address: '...',
  riskScore: 85,
  riskLevel: 'Safe',
  checks: [
    { name: 'Check name', status: 'pass', icon: Icon },
  ],
  warnings: ['Warning text...'],
  scannedAt: new Date().toLocaleString(),
}
```

### Check Status Types
```typescript
type Status = 'pass' | 'warning' | 'fail'
```

### Customization Points

**Change Token Example**
```typescript
const auditData = {
  tokenName: 'YourToken',
  symbol: 'SYMB',
  riskScore: 90,
  // ...
}
```

**Add New Security Check**
```typescript
checks: [
  ...existingChecks,
  { name: 'Your Check', status: 'pass', icon: YourIcon },
]
```

**Change Score Colors**
```typescript
const scoreColor =
  score >= 80 ? 'green' :
  score >= 50 ? 'orange' : 'red'
```

### Visual Indicators
- 🟢 Green: Pass/Safe
- 🟠 Orange: Warning/Caution
- 🔴 Red: Fail/Risk

---

## 4. TrustSection.tsx

### Purpose
Build credibility through statistics, partners, dan user testimonials.

### Features
- 📊 4 key statistics
- 🤝 Partner logos (6 items)
- 💬 User testimonials (3 cards)
- 🛡️ Trust badges

### Props
None (self-contained)

### Data Structures

**Stats**
```typescript
const stats = [
  {
    icon: Users,
    value: '10,000+',
    label: 'Tokens Scanned',
    description: 'Community members protected daily',
    color: 'purple',
  },
]
```

**Partners**
```typescript
const partners = [
  { name: 'Solana', logo: 'S' },  // Placeholder logo
]
```

**Testimonials**
```typescript
const testimonials = [
  {
    name: 'Alex Chen',
    role: 'DeFi Trader',
    avatar: 'AC',              // Initials for avatar
    comment: 'Review text...',
    rating: 5,
  },
]
```

### Customization Points

**Update Statistics**
```typescript
// Change values to reflect your actual metrics
value: '50,000+'
label: 'Your Metric'
```

**Add Real Partner Logos**
```typescript
// Replace placeholder with actual logo
<img src="/logos/partner.png" alt="Partner" />
```

**Update Testimonials**
```typescript
{
  name: 'Real User Name',
  role: 'Their Role',
  avatar: 'RU',
  comment: 'Their actual review...',
  rating: 5,
}
```

**Add More Testimonials**
```typescript
// Grid will auto-adjust
className="grid grid-cols-1 md:grid-cols-3 gap-6"
// Change to: md:grid-cols-4 for 4 columns
```

---

## 5. Footer.tsx

### Purpose
Provide navigation links, legal info, dan important disclaimer.

### Features
- 🏢 Brand section dengan social links
- 🔗 Quick links (Resources & Company)
- ⚠️ Legal disclaimer (IMPORTANT)
- ⚡ System status indicator
- 📅 Copyright info

### Props
None (self-contained)

### Social Links
```typescript
<a href="https://twitter.com" target="_blank">
  <Twitter className="w-5 h-5" />
</a>
```

### Customization Points

**Update Social Links**
```typescript
// Replace placeholder URLs
href="https://twitter.com/yourhandle"
href="https://github.com/yourrepo"
```

**Add New Link Section**
```typescript
<div>
  <h4 className="text-white font-bold mb-4">New Section</h4>
  <ul className="space-y-3">
    <li><a href="#">Link 1</a></li>
    <li><a href="#">Link 2</a></li>
  </ul>
</div>
```

**Customize Disclaimer**
```typescript
<p className="text-gray-400 text-sm leading-relaxed">
  Your custom disclaimer text...
</p>
```

**Change Copyright**
```typescript
const currentYear = new Date().getFullYear()
© {currentYear} YourCompany. All rights reserved.
```

---

## 🎨 Shared Styling Patterns

### Gradient Text
```typescript
className="gradient-text"           // Purple-Pink gradient
className="gradient-text-success"   // Green gradient
```

### Neon Glow Effects
```typescript
className="shadow-neon-purple"      // Purple glow
className="shadow-neon-green"       // Green glow
className="shadow-neon-pink"        // Pink glow
```

### Card Styles
```typescript
className="bg-cyber-dark-card border-2 border-cyber-dark-border rounded-2xl p-6"
```

### Hover Effects
```typescript
className="card-hover"              // Lift + glow on hover
className="btn-glow"                // Button glow effect
```

### Animations
```typescript
className="animate-float"           // Floating motion
className="animate-glow"            // Pulsing glow
className="animate-pulse-glow"      // Opacity pulse
```

---

## 🔧 Global Utilities (globals.css)

### Custom Classes Available

```css
.gradient-text                 /* Gradient text effect */
.gradient-text-success         /* Green gradient */
.btn-glow                      /* Button glow on hover */
.card-hover                    /* Card lift + glow */
.cyber-grid                    /* Animated background grid */
.text-glow-purple             /* Purple text shadow */
.text-glow-green              /* Green text shadow */
.border-glow-purple           /* Purple border glow */
.border-glow-green            /* Green border glow */
```

### Usage Example
```typescript
<h1 className="gradient-text text-glow-purple">
  Glowing Gradient Text
</h1>

<button className="btn-glow bg-gradient-cyber">
  Glowing Button
</button>

<div className="card-hover border-glow-purple">
  Interactive Card
</div>
```

---

## 📱 Responsive Design

### Breakpoints
```typescript
// Mobile: default (< 640px)
className="text-2xl"

// Tablet: md (640px+)
className="md:text-4xl"

// Desktop: lg (1024px+)
className="lg:text-6xl"
```

### Grid Responsiveness
```typescript
// 1 column on mobile, 2 on tablet, 3 on desktop
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

### Visibility Control
```typescript
// Hide on mobile, show on desktop
className="hidden lg:block"

// Show on mobile, hide on desktop
className="block lg:hidden"
```

---

## 🎭 Icon Usage (Lucide React)

### Import Icons
```typescript
import { Shield, Zap, Lock, AlertTriangle } from 'lucide-react'
```

### Icon Sizing
```typescript
className="w-4 h-4"   // Small
className="w-5 h-5"   // Medium
className="w-8 h-8"   // Large
className="w-16 h-16" // Extra Large
```

### Icon Colors
```typescript
className="text-cyber-purple"
className="text-cyber-green"
className="text-white"
className="text-gray-400"
```

### Animated Icons
```typescript
<Icon className="animate-spin" />     // Spinning
<Icon className="animate-pulse" />    // Pulsing
<Icon className="animate-bounce" />   // Bouncing
```

---

## 🚀 Performance Tips

### Component Optimization
```typescript
// Use 'use client' only when needed
'use client'

// Lazy load heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'))
```

### Image Optimization
```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={200}
  priority // For above-fold images
/>
```

### Animation Performance
```typescript
// Use CSS transforms (GPU accelerated)
transform: translateY(-5px)  ✅
top: -5px                     ❌
```

---

## 🧪 Testing Components

### Manual Testing Checklist

**HeroSection**
- [ ] Input accepts text
- [ ] Button shows hover effect
- [ ] Stats display correctly
- [ ] Responsive on mobile

**FeaturesSection**
- [ ] All 6 features render
- [ ] Hover effects work
- [ ] Icons display correctly
- [ ] Grid responsive

**LiveAuditDemo**
- [ ] Mock data displays
- [ ] Score badge visible
- [ ] Checks render correctly
- [ ] Warnings show

**TrustSection**
- [ ] Stats display
- [ ] Testimonials render
- [ ] Partners show
- [ ] Responsive grid

**Footer**
- [ ] Links work
- [ ] Disclaimer visible
- [ ] Social icons clickable
- [ ] Copyright updates

---

## 📚 Component Dependencies

| Component | Dependencies | Optional |
|-----------|-------------|----------|
| HeroSection | lucide-react | - |
| FeaturesSection | lucide-react | - |
| LiveAuditDemo | lucide-react | - |
| TrustSection | lucide-react | - |
| Footer | lucide-react | - |

All components are self-contained and can work independently!

---

**Happy Customizing! 🎨**

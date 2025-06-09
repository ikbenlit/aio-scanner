# GEO Scanner - Complete Tech Stack & Architecture

## 🎯 Project Overview
**Product:** AI-powered website analysis tool for LLM search engine optimization  
**Framework:** SvelteKit + TypeScript  
**Strategy:** MVP-first approach with hybrid UI system  
**Launch Target:** 6-8 weeks from start

---

## 🏗️ Frontend Architecture

### **Core Framework**
- **SvelteKit** v2.0+ with TypeScript
- **Vite** for build tooling and HMR
- **Tailwind CSS** for utility-first styling
- **Mobile-first responsive design**

### **UI Component Strategy - Hybrid Approach**
- **Shadcn-svelte** for standard UI components (70% of interface)
- **Custom components** for unique GEO Scanner features (30%)
- **Copy-paste approach** - full control, no heavy dependencies

#### **Shadcn Components (Foundation)**
```bash
# Core components for MVP
npx shadcn-svelte@latest add button      # CTA buttons, actions
npx shadcn-svelte@latest add card        # Score panels, module cards
npx shadcn-svelte@latest add input       # Email capture, URL input
npx shadcn-svelte@latest add dialog      # Email capture modal
npx shadcn-svelte@latest add badge       # Status indicators, tiers
npx shadcn-svelte@latest add collapsible # Module accordions
npx shadcn-svelte@latest add progress    # Scan progress bars
npx shadcn-svelte@latest add alert       # Error states, notifications
npx shadcn-svelte@latest add form        # Checkout forms
```

#### **Custom Components (Unique Features)**
```
src/lib/components/
├── ui/                    # Shadcn components
├── custom/                # GEO Scanner specific
│   ├── ScoreCircle.svelte       # Animated score visualization
│   ├── RadarChart.svelte        # 8-module radar visualization
│   ├── ScanProgress.svelte      # Live scanning animation
│   ├── WebsitePreview.svelte    # URL screenshot + status
│   └── ModuleIcon.svelte        # AI module status icons
└── composite/             # Hybrid combinations
    ├── EmailCaptureModal.svelte # Shadcn Dialog + custom content
    ├── ResultsDashboard.svelte  # Shadcn Cards + custom charts
    ├── QuickWins.svelte         # Shadcn Collapsible + custom logic
    └── UpgradePrompts.svelte    # Shadcn Alert + custom positioning
```

### **Styling System Integration**
```css
/* app.css - Unified theming */
:root {
  /* Shadcn theme tokens (override defaults) */
  --primary: 211 80% 51%;        /* AIO-Scanner primary-blue */
  --secondary: 38 75% 61%;       /* AIO-Scanner secondary-yellow */
  --destructive: 4 69% 58%;      /* AIO-Scanner accent-red */
  --ring: 211 80% 51%;           /* Focus states */
  
  /* GEO Scanner custom tokens (preserved) */
  --primary-blue: #2E9BDA;
  --primary-gradient: linear-gradient(135deg, #2E9BDA, #4FACFE);
  --secondary-yellow: #F5B041;
  --accent-red: #E74C3C;
  --success-green: #10b981;
  --cyber-accent: #00F5FF;
  --dark: #1a1a1a;
  --text-gray: #64748b;
  --border-gray: #e2e8f0;
  --bg-light: #f8fafc;
  
  /* Typography */
  --font-header: 'Orbitron', system-ui, sans-serif;
  --font-body: 'Exo 2', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

---

## 🗄️ Backend & Database

### **Authentication & Database**
- **Supabase** (all-in-one solution)
  - PostgreSQL database with ACID transactions
  - Row Level Security (RLS) for data protection
  - Real-time subscriptions for scan updates
  - File storage for PDFs and screenshots
  - Built-in authentication (email/password)

### **Payment Processing**
- **Mollie** (European payment provider)
  - iDEAL, credit cards, SEPA, Bancontact
  - GDPR compliant by design
  - Webhook-based payment confirmation
  - €19.95 / €49.95 credit packages

### **Business Model**
- **Credit-based system** (no recurring subscriptions)
- **Tiered pricing**: Free (1 scan) → Starter (2 scans) → Pro (5 scans)
- **Credits never expire** (with service change rights)

---

## 🕷️ Scanning Engine

### **Web Scraping Strategy - Hybrid Approach**
- **Cheerio** (primary) - Lightweight jQuery-like HTML parsing
- **Playwright** (fallback) - JavaScript-heavy sites only
- **90/10 rule**: Most sites work with Cheerio, Playwright for SPAs

### **Scanning Architecture**
```typescript
// Intelligent scanning strategy
1. Fetch HTML with Cheerio (fast, low resource)
2. Detect if JavaScript rendering needed
3. Use Playwright only for React/Vue/Angular sites
4. Parse with specialized modules:
   - robots-parser (robots.txt analysis)
   - sitemap-parser (XML sitemap processing)
   - cheerio (HTML structure analysis)
```

### **AI Analysis Modules (8 Core)**
1. **AI Content Analysis** - FAQ detection, content structure
2. **Technical SEO** - robots.txt, sitemap, meta tags
3. **Schema Markup** - JSON-LD validation, structured data
4. **Cross-web Presence** - External citations, backlinks
5. **Authority & Citations** - Author bio, expertise signals
6. **Content Freshness** - Publication dates, update signals
7. **Multimodal Optimization** - Alt text, transcripts
8. **Monitoring Hooks** - Analytics, tracking setup

---

## 📄 Document Generation & Email

### **PDF Generation Strategy**
- **Phase 1 (MVP)**: HTML email reports (rich formatting)
- **Phase 2**: Basic PDF export using Playwright
- **Phase 3**: Professional branded PDFs with custom templates

### **Email Service**
- **Resend** (modern, developer-friendly)
  - 3,000 emails/month free tier
  - EU-based for GDPR compliance
  - React Email component integration
  - Transactional + marketing emails

### **Email Flow Architecture**
```
1. User completes scan
2. Email capture gate (conversion optimization)
3. PDF generated server-side
4. Email sent with Resend
5. Follow-up sequences for conversion
```

---

## ☁️ Hosting & Deployment

### **Primary Hosting**
- **Vercel** (SvelteKit-optimized)
  - Automatic Edge CDN distribution
  - Serverless functions for scan processing
  - Preview deployments for testing
  - Built-in analytics and monitoring

### **Performance Optimizations**
- **Edge caching** for static assets
- **Incremental Static Regeneration** for scan results
- **Code splitting** via SvelteKit's automatic optimization
- **Image optimization** via Vercel's built-in service

---

## 📊 Development Workflow

### **Core Dependencies (MVP)**
```json
{
  "dependencies": {
    // Framework
    "@sveltejs/kit": "^2.0.0",
    "svelte": "^5.0.0",
    "typescript": "^5.3.0",
    
    // UI System
    "tailwindcss": "^3.4.0",
    "lucide-svelte": "^0.263.1",  // Icons for shadcn
    "bits-ui": "^0.21.0",         // Headless components
    "clsx": "^2.0.0",             // Class merging
    "tailwind-variants": "^0.1.0", // Component variants
    
    // Services
    "@supabase/supabase-js": "^2.38.0",
    "@mollie/api-client": "^3.7.0",
    "resend": "^2.0.0",
    
    // Scanning
    "cheerio": "^1.0.0-rc.12",
    "robots-parser": "^3.0.1",
    "sitemap-parser": "^4.0.0",
    
    // Validation
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@sveltejs/adapter-auto": "^3.0.0",
    "vite": "^5.0.0",
    "@tailwindcss/typography": "^0.5.0"
  }
}
```

### **Project Structure**
```
src/
├── lib/
│   ├── components/
│   │   ├── ui/              # Shadcn components
│   │   ├── custom/          # GEO Scanner specific
│   │   └── composite/       # Hybrid combinations
│   ├── stores/
│   │   ├── auth.ts          # Supabase auth state
│   │   ├── scan.ts          # Scan progress/results
│   │   └── credits.ts       # User credit management
│   ├── utils/
│   │   ├── supabase.ts      # Database client
│   │   ├── mollie.ts        # Payment client
│   │   └── validators.ts    # Zod schemas
│   └── scanner/
│       ├── modules/         # 8 AI analysis modules
│       ├── engine.ts        # Scan orchestration
│       └── parsers/         # Cheerio/Playwright logic
├── routes/                  # SvelteKit routes
│   ├── api/                 # Server endpoints
│   ├── scan/               # Scan flow pages
│   ├── checkout/           # Payment flow
│   └── dashboard/          # User account
└── app.html                # Root template
```

---

## 🔧 Development & Production Environment

### **Environment Configuration**
```bash
# .env.local (development)
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOi..."
MOLLIE_API_KEY="test_xxx"
RESEND_API_KEY="re_xxx"

# Production
MOLLIE_API_KEY="live_xxx"
PUBLIC_VERCEL_URL="https://geoscanner.nl"
```

### **Development Scripts**
```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "test": "vitest",
    "lint": "prettier --check . && eslint .",
    "format": "prettier --write .",
    
    // Shadcn integration
    "ui:add": "npx shadcn-svelte@latest add",
    "ui:init": "npx shadcn-svelte@latest init"
  }
}
```

---

## 🚀 Implementation Phases

### **Phase 1: Foundation (Week 1-2)**
- ✅ SvelteKit + Tailwind setup
- ✅ Shadcn-svelte installation and theming
- ✅ Supabase authentication integration
- ✅ Basic scan engine with Cheerio
- ✅ Landing page with URL input

### **Phase 2: Core Features (Week 3-4)**
- ✅ Email capture modal (Shadcn Dialog + custom styling)
- ✅ Results dashboard (Shadcn Cards + custom ScoreCircle)
- ✅ 8-module analysis implementation
- ✅ Credit system with Supabase
- ✅ PDF email reports via Resend

### **Phase 3: Monetization (Week 5-6)**
- ✅ Mollie payment integration
- ✅ Tier-based feature gating
- ✅ User dashboard with Shadcn components
- ✅ Upgrade prompts and conversion flows

### **Phase 4: Production (Week 7-8)**
- ✅ Vercel deployment optimization
- ✅ Error handling and monitoring
- ✅ Performance testing and tuning
- ✅ Launch preparation and marketing

---

## 🎯 Key Architectural Decisions

### **Why Shadcn-Svelte Hybrid?**
- **Development Speed**: 70% faster UI development with pre-built components
- **Consistency**: Unified design system across all interfaces
- **Flexibility**: Custom components for unique GEO Scanner features
- **Maintainability**: Standard patterns + business-specific logic
- **Performance**: Only bundle what you use, no bloated UI libraries

### **Why Supabase over Firebase?**
- **SQL Database**: Better for complex business logic and reporting
- **ACID Transactions**: Essential for credit system integrity
- **Real-time Features**: WebSocket updates for scan progress
- **Built-in Auth**: Reduces complexity while maintaining flexibility
- **EU Hosting**: GDPR compliance for European market

### **Why Credit System over Subscriptions?**
- **Lower Friction**: One-time purchase vs recurring commitment
- **Clear Value**: Users buy exactly what they need
- **Conversion Friendly**: Easier to upsell additional credits
- **Cash Flow**: Immediate revenue vs delayed recurring income

---

## 💡 Post-MVP Considerations

### **Scaling Architecture**
- **Caching Layer**: Redis for scan result caching
- **Queue System**: Background job processing for large scans
- **CDN Optimization**: Global edge caching for static assets
- **Database Optimization**: Indexing and query optimization

### **Advanced Features**
- **API Access**: Developer integrations and white-label solutions
- **Bulk Scanning**: Enterprise-level multi-URL analysis
- **Custom Branding**: Agency and enterprise branded reports
- **Advanced Analytics**: User behavior and conversion optimization

---

**Status**: ✅ Architecture finalized, ready for development  
**Next Step**: Phase 1 implementation with shadcn-svelte setup  
**Timeline**: 6-8 weeks to production-ready MVP
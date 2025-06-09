# AIO-Scanner v2.0 - Product Requirements Document (PRD)

## 🎯 Product Overview

**Product:** AI-powered website analysis tool for LLM search engine optimization  
**Target Market:** Nederlandse MKB, SEO-specialisten, marketingbureaus  
**Business Model:** Credit-based purchases (€19,95 / €49,95)  
**Tech Stack:** SvelteKit + Supabase + Mollie + Shadcn-Svelte  

---

## 🔍 Kernbeslissingen & Tegenstrijdigheden

### **Beslispunt 1: Authenticatie Model ✅ BESLOTEN**
**Tegenstrijdigheid:** Anonieme scans vs. Account-first approach  
**Beslissing:** **Hybrid Model**
- Gratis tier: Anoniem + email capture gate
- Betaalde tiers: Account verplicht
- Email wordt gebruikt voor account creation bij eerste aankoop

**Account Identificatie:**
- **User ID:** Numerieke auto-increment primaire key
- **Email:** Unique constraint, business identifier
- **Firebase UID:** Session management na account creation

**Account Lifecycle:**
```
Anonymous (email-only) → Registered (bij betaling) → Paid Customer
```

### **Beslispunt 2: Feature Gating Strategy ✅ BESLOTEN**
**Tegenstrijdigheid:** Simpel credit model vs. Feature differences  
**Beslissing:** **MVP Simpel Credit Model met Future-Proofing**
- **MVP:** Exact dezelfde features voor beide tiers (Starter: 2 credits, Pro: 5 credits)
- **Future:** Feature gating mogelijk, maar met grandfathering voor early adopters
- **Database:** `plan_type` en `grandfathered` kolommen alvast voorbereid
- **Rationale:** Snellere ontwikkeling + geen edge case complexiteit + fair voor early users

### **Beslispunt 3: Payment Flow Complexiteit ✅ BESLOTEN**
**Tegenstrijdigheid:** Direct checkout vs. Multi-step flow  
**Beslissing:** **Smart 2-Step Flow met Mollie Hosted**
1. Package Selection (+ email indien nodig + voorwaarden checkbox)
2. Mollie Hosted Payment Page (externe redirect)

**Email Handling Logic:**
- Email bekend (van scan gate/account) → Pre-fill Mollie
- Email onbekend (direct buyer) → Vraag op package selection
- Returning user → Account email automatisch

**Rationale:** Minimale friction + Nederlandse payment UX (iDEAL redirects normaal)

### **Beslispunt 4: UI Component Strategy**
**Status:** 🔄 **UITGESTELD** - Pending component inventory analysis
**Plan:** Mockups + beschrijvingen samenvoegen → Component mapping → Shadcn vs Custom ratio bepalen

---

## 📋 Functionele Requirements

### **1. Core Scan Functionaliteit**

#### **1.1 URL Input & Validatie**
- URL invoer met real-time validatie
- Support voor HTTP/HTTPS
- Domein extractie voor branding
- Error handling voor onbereikbare sites

#### **1.2 Live Scanning Experience**
- 8 parallelle analysemodules (30 seconden totaal)
- Real-time voortgangsindicator met status updates
- Live activity log: "Checking robots.txt...", "Analyzing content..."
- Module completion visualisatie (checkmarks)
- Estimated completion time countdown

#### **1.3 AI Analysis Modules (8 Core)**
1. **AI Content Analysis** - FAQ detectie, content structuur
2. **Technical SEO** - robots.txt, sitemap, meta tags  
3. **Schema Markup** - JSON-LD validatie, structured data
4. **Cross-web Presence** - Externe vermeldingen, backlinks
5. **Authority & Citations** - Auteur bio, expertise signals
6. **Content Freshness** - Publicatiedatums, update signals
7. **Multimodal Optimization** - Alt text, transcripts
8. **Monitoring Hooks** - Analytics, tracking setup

### **2. Gebruikersbeheer & Authenticatie**

#### **2.1 Gratis Tier (Anoniem)**
- 1 scan per email adres
- Geen account creation vereist
- Email capture gate voor resultaten
- PDF rapport via email

**Enforcement Rules:**
- Cookie check (device-level)
- Email lookup (cross-device enforcement)
- Combinatie: Cookie + Email = robust limit

#### **2.2 Betaalde Tiers (Account Vereist)**
- Supabase email/password authenticatie
- Firebase UID synchronisatie voor session management
- Credit saldo tracking
- Scan geschiedenis (30/90 dagen)

**Account Upgrade Path:**
- Email pre-fill in checkout bij eerste betaling
- Automatic account creation bij payment success
- Wachtwoord via email voor eerste login

#### **2.3 Credit Systeem**
- **Starter Pack:** €19,95 = 2 credits
- **Professional Pack:** €49,95 = 5 credits  
- Credits never expire (met service change rights)
- Atomaire credit transactions met audit trail

### **3. Email Capture & Conversie**

#### **3.1 Email Capture Gate (Maximum Leverage)**
- **Timing:** Direct na scan completion, VOOR resultaten
- Glassmorphism modal met website preview
- **Conversion Triggers:**
  - ✅ Scan Complete Icon (success state)
  - 🖼️ Website Screenshot met "✅ Gescand" badge
  - 📊 Partial Score (78/100) + Status (Goed)
  - 📋 Top 2 findings + "3 andere kritieke punten" (blurred)
  - 🔒 "Email vereist voor volledige resultaten en PDF"

**Psychologische Triggers:**
- Achievement: "Scan voltooid!" (dopamine hit)
- Progress: "78/100 - maar verbetering mogelijk"
- Curiosity Gap: "3 andere kritieke bevindingen..."
- Social Proof: "500+ bedrijven gebruiken deze scan"
- Authority: Screenshot toont "jouw website" (personalisatie)

**Target conversion:** 60%+ email capture rate

#### **3.2 Email Delivery**
- Resend.com voor transactionele emails
- Rich HTML email templates
- PDF attachment voor rapporten
- Follow-up sequences voor conversie

### **4. Results Dashboard**

#### **4.1 Score Visualisatie**
- Grote score cirkel (0-100) met animatie
- Kleurcodering: Groen (80+), Oranje (50-79), Rood (<50)
- Status labels: Uitstekend, Goed, Verbetering Nodig, Kritiek

#### **4.2 Radar Chart**
- 8-module visualisatie met interactieve hover
- Module-specifieke kleuren per status
- Real-time tooltip met module details

#### **4.3 Quick Wins Sectie**
- Top 5 geprioriteerde verbeteracties
- Impact/effort matrix visualisatie
- Uitklapbare implementatie details
- Code snippets voor technische fixes

#### **4.4 Module Detail Accordions**
- 8 uitklapbare module secties
- Bevindingen: Success, Warning, Error states
- Aanbevelingen met prioriteit ranking
- Copy-paste code voorbeelden

### **5. Payment Flow (Mollie)**

#### **5.1 Package Selection**
- Side-by-side vergelijking cards
- "Populair" badge voor Starter Pack
- Feature lijst per package
- Social proof en testimonials

#### **5.2 Checkout Proces**
```
Package Selection (+ email/voorwaarden) → Mollie Hosted Payment → Success/Failure
           (/upgrade)                          (External)           (/success)
```

#### **5.3 Payment Methods**
- iDEAL (primair voor Nederlandse markt)
- Credit cards (internationaal)
- Bancontact, SEPA, PayPal
- Mollie webhook voor payment confirmatie

#### **5.4 Post-Payment Flow**
- Success page met onboarding
- Credit toevoeging aan account
- Email confirmatie met factuur
- Redirect naar dashboard met welcome banner

---

## 🎨 User Experience Requirements

### **1. Landing Page**
- Hero sectie met grote URL input
- Live scan demo embed (embedded iframe)
- Trust indicators: "Gratis scan", "30 seconden", "GDPR-compliant"
- Social proof: "500+ bedrijven gebruiken AIO-Scanner"
- **Primary CTA:** "Gratis Scan Starten"
- **Secondary CTA:** "Direct Kopen" (header/pricing)

### **2. Responsive Design**
- Mobile-first approach
- Desktop: 2-column layout (score + radar chart)
- Tablet: Stacked layout met compacte modules
- Mobile: Single column met touch-optimized accordions

### **3. Performance Requirements**
- Scan completion: <30 seconden
- Email delivery: <60 seconden
- Page load: <2 seconden (LCP)
- Score animation: 1.5 seconden smooth transition

### **4. Accessibility**
- WCAG 2.1 AA compliance
- Screen reader compatible
- Keyboard navigation
- Color contrast ratios: 4.5:1 minimum

---

## 🔧 Technische Requirements

### **1. Tech Stack**
- **Frontend:** SvelteKit + TypeScript + Tailwind CSS
- **UI Components:** Shadcn-Svelte + Custom (ratio TBD na component analysis)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Payments:** Mollie (European provider, hosted payment pages)
- **Email:** Resend.com (3k/month free tier)
- **Hosting:** Vercel (Edge CDN + Serverless functions)

### **2. Web Scraping Architecture**
- **Primary:** Cheerio (lightweight HTML parsing)
- **Fallback:** Playwright (JavaScript-heavy sites)
- **90/10 rule:** Most sites via Cheerio, SPA detection → Playwright
- **Specialized parsers:** robots-parser, sitemap-parser

### **3. API Endpoints**
```
GET  /api/scan/anonymous          # Gratis scan
POST /api/scan/authenticated      # Betaalde scan (credit aftrek)
POST /api/mollie/create-payment   # Payment initialization
POST /api/mollie/webhook          # Payment confirmation
GET  /api/user/credits            # Credit saldo
GET  /api/scan/history            # Scan geschiedenis
```

---

## 📊 Business Requirements

### **1. Monetisatie Model**
- **Revenue Streams:** Credit packages (één keer betaling)
- **Pricing:** €19,95 (2 credits) / €49,95 (5 credits)
- **Target:** €10k MRR binnen 6 maanden
- **LTV/CAC ratio:** 3:1 minimum

### **2. Conversion Funnel**
```
Landing Page → Gratis Scan → Email Capture → Results → Upgrade Prompt → Payment
    100%           60%          80%           15%         30%
```

### **3. Key Metrics**
- **Email capture rate:** 60%+ (gate effectiveness)
- **Free-to-paid conversion:** 15%+ (post-scan upgrade)
- **Payment completion:** 85%+ (Mollie checkout)
- **Customer satisfaction:** NPS 50+ (product quality)

### **4. Revenue Targets**
- **Month 1:** €1k (50 customers, validation)
- **Month 3:** €3k (150 customers, product-market fit)
- **Month 6:** €10k (500 customers, scaling)

---

## 🚀 Implementation Roadmap

### **Phase 1: Core MVP (Week 1-3)**
- SvelteKit + Shadcn setup met custom theming
- Supabase authenticatie + database schema
- Basic scan engine (Cheerio + 8 modules)
- Email capture modal met Resend integration
- Landing page met URL input

### **Phase 2: Results & Payment (Week 4-6)**
- Results dashboard met score circle + radar chart
- Quick wins + module accordions
- Mollie payment flow (3-step process)
- Credit systeem met Supabase transactions
- User dashboard met scan geschiedenis

### **Phase 3: Optimization & Launch (Week 7-8)**
- Performance optimization (Edge caching)
- Error handling + monitoring
- A/B testing setup voor conversion
- Marketing website + SEO optimization
- Production deployment + monitoring

---

## ⚠️ Risico's & Mitigaties

### **Technische Risico's**
- **Web scraping blocking:** Multiple user agents + rate limiting
- **Payment failures:** Mollie webhook redundancy + manual verification
- **Scan timeouts:** Module-level timeouts + graceful degradation

### **Business Risico's**
- **Lage conversie:** A/B testing van email capture + upgrade prompts
- **Churn:** Focus op immediate value delivery + quick wins
- **Concurrentie:** Eerste Nederlandse AI-scanning tool, snelle iteratie

### **Juridische Overwegingen**
- **GDPR compliance:** Supabase EU hosting + data minimization
- **Web scraping ethics:** Robots.txt respect + rate limiting
- **BTW administration:** Mollie automatische afhandeling

---

**Status:** Ready for development  
**Timeline:** 8 weken tot production-ready MVP  
**Next Step:** Phase 1 SvelteKit + Shadcn setup
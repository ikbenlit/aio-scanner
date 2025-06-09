# 🚀 **AIO-Scanner Design Brief v1.0**

## **Project Overview**
Create a cutting-edge SaaS landing page and app for "AIO-Scanner" - an AI-powered website analysis tool that helps businesses prepare their websites for AI search engines like ChatGPT, Claude, and Google AI.

**Previous Name**: GEO Scanner → **New Name**: AIO-Scanner (All-In-One)

## **Brand Identity & Visual Design**

### **Color Palette**
```css
/* Primary Colors (from existing code) */
--primary-blue: #2E9BDA        /* Tech trust, scanning action */
--primary-gradient: linear-gradient(135deg, #2E9BDA, #4FACFE)
--secondary-yellow: #F5B041    /* Energy, highlights, warnings */
--accent-red: #E74C3C          /* Urgency, critical issues */
--success-green: #10b981       /* Good scores, checkmarks */

/* Enhanced Palette (from new brief) */
--cyber-accent: #00F5FF        /* Special AI highlights */
--dark-primary: #1a1a1a        /* Headers, contrast */
--dark-secondary: #0f172a      /* Dark sections, depth */
--background-primary: #FFFFFF   /* Main background */
--background-secondary: #f1f5f9 /* Section variety (slate-50) */
--text-gray: #64748b           /* Body text, metadata */
--border-gray: #e2e8f0         /* Borders, dividers */
--bg-light: #f8fafc            /* Light sections */
```

### **Typography System**
```css
/* Headers & Logo (Futuristic AI Feel) */
font-family: 'Orbitron', system-ui, sans-serif;
font-weight: 600, 700;

/* Body Text (Tech + Readability Balance) */
font-family: 'Exo 2', 'Inter', system-ui, sans-serif;
font-weight: 400, 500;

/* Code Snippets (Developer Credibility) */
font-family: 'JetBrains Mono', 'Courier New', monospace;

/* Fallback */
font-family: system-ui, -apple-system, sans-serif;
```

### **Design Style: "Soft Tech Professional"**
- **Glassmorphism cards** with subtle blur effects
- **Large rounded corners** (16px standard)
- **Soft shadows** with multiple layers
- **Subtle gradient backgrounds**
- **Clean, spacious layouts** (generous whitespace)
- **Micro-animations** on hover/scroll for engagement
- **Radar/circular visual metaphors** for AI scanning

## **Pricing Structure (From Kennisbank)**

### **Credit-Based System (NO Subscriptions)**
```
🆓 GRATIS
- 1 scan per email address
- Basis rapport met algemene tips
- Email required voor resultaten
- Upgrade prompts na resultaten
- [Probeer Nu Gratis]

💎 STARTER PACK - €19,95
- Enhanced analysis
- PDF downloads  
- Scan history
- Email support
- [Meest Populair]

🚀 PROFESSIONAL - €69,95
- AI-powered suggestions
- Implementation guides
- Priority support
- Advanced features
- [Voor Pro's]
```

**Payment Processing**: Mollie (Dutch, iDEAL + Credit Cards, GDPR compliant)

## **Core User Flows & Wireframe Requirements**

### **1. Landing Page Structure**
```
HERO SECTION:
- Headline: "Test je Website AI-Gereedheid - Gratis!"
- Subline: "Ontdek in 30 seconden of jouw website klaar is voor AI zoekmachines"
- URL input field (prominent, centered)
- CTA: "Analyseer Nu Gratis" (primary-blue)
- Trust signals: "✓ Gratis eerste scan ✓ Geen registratie ✓ 8 AI modules"
- Radar visual (existing design element)

VALUE PROPS (3 cards):
🤖 "8 AI-Modules" - Complete analyse voor moderne zoekmachines
⚡ "30-Seconden Scan" - Instant inzicht in website prestaties  
🎯 "Concrete Acties" - Implementeerbare verbeterstappen

PRICING SECTION:
- 3 tiers (Gratis, Starter €19,95, Pro €69,95)
- Credit-based messaging
- "Most Popular" badge on Starter
- Mollie payment integration

FEATURES SHOWCASE:
- Bento grid layout showing 8 modules
- Glassmorphism cards per feature
- Hover animations

SOCIAL PROOF:
- "500+ Nederlandse bedrijven vertrouwen op AIO-Scanner"
- Testimonials (if available)
- Usage stats

FINAL CTA:
- Duplicate hero form
- "Klaar in 30 seconden"
```

### **2. Critical Missing Wireframes Needed:**

#### **A. Live Scan Experience** ✅ (Exists in live_scan_demo.html)
- Real-time progress (0-100%)
- Live activity log updates
- 8 modules checking off progressively
- Estimated completion time
- User engagement during 30s wait

#### **B. Email Capture Gate** ❌ (MISSING - CRITICAL)
```
TIMING: Right after scan completion, before results
LAYOUT: Center modal/overlay
CONTENT:
- "Voer je email in voor volledige resultaten en PDF rapport"
- Email input field
- "Bekijk Resultaten" button
- Trust building: "Geen spam policy" + "Direct bezorging"
- NO skip option (email required)
```

#### **C. Results Dashboard** ❌ (MISSING - CRITICAL)
```
LEFT PANEL:
- Large score circle (78/100)
- Color coding (red/orange/green)
- "Download PDF" button
- "Deel Resultaten" button  
- "Scan Opnieuw" option

RIGHT PANEL:
- Radar chart (8 modules)
- Interactive hover states
- Color-coded areas

BOTTOM SECTION:
- Quick Wins (top 5 priorities)
- Module accordions (expandable details)
- Code snippets with copy buttons
- Upgrade prompts for paid features
```

#### **D. Payment/Credits Flow** ❌ (MISSING)
```
CREDIT SELECTION:
- 3 tier cards (visual hierarchy)
- Mollie integration
- iDEAL/Credit card options
- "Most Popular" highlighting

USER DASHBOARD:
- Credit balance (prominent)
- Scan history
- Quick rescan buttons
- Account management
```

## **Technical Implementation Requirements**

### **Framework & Stack (From Kennisbank)**
- **Frontend**: SvelteKit + TypeScript
- **Styling**: Tailwind CSS (responsive, mobile-first)
- **Database**: Supabase (auth + PostgreSQL + storage)
- **Payments**: Mollie (Dutch, GDPR compliant)
- **Hosting**: Vercel (CDN + edge functions)
- **Email**: Resend (3k emails/month free)

### **Critical UX Principles (From User Journey)**
1. **Progressive Value Delivery**: Show before ask
2. **Seamless Email Capture**: Natural integration at peak engagement
3. **Clear Credit Economics**: Transparent, no hidden costs
4. **Instant Gratification**: <30s scans, immediate results
5. **Growth Loops**: Dashboard value encourages return visits

### **Conversion Optimization Focus**
- **Primary Goal**: Email capture (60%+ rate target)
- **Secondary Goal**: Free to paid (10%+ rate target)
- **Retention Goal**: Credit repurchase (70%+ rate target)

## **Content & Messaging Strategy**

### **Target Audiences**
1. **SEO/Content Specialists** (primary)
   - Pain: Manual AI testing across platforms
   - Value: One dashboard vs testing in each AI tool

2. **MKB Entrepreneurs** (secondary)  
   - Pain: Future-proofing business for AI search
   - Value: Clear action items without tech jargon

3. **Agencies/Consultants** (tertiary)
   - Pain: Client-ready reports for AI optimization
   - Value: Professional PDFs and white-label options

### **Key Messaging**
- **Urgency**: "AI zoekmachines worden mainstream"
- **Simplicity**: "30 seconden, 8 modules, concrete acties"
- **Trust**: "Nederlandse tool, GDPR-compliant, geen verplichtingen"
- **Expertise**: "AI-ready is de nieuwe SEO-ready"

## **Next Steps: Wireframe Development Priority**

### **Phase 1: Critical Conversion Points** 🔥
1. **Email Capture Gate** - Missing link in conversion funnel
2. **Results Dashboard** - Main value delivery screen
3. **Payment Flow** - Monetization touchpoint

### **Phase 2: Enhanced Experience**
4. **Enhanced Landing Page** - Implement new design system
5. **User Dashboard** - Credit management & history
6. **Mobile Optimization** - Touch-first interactions

### **Design System Implementation**
- Orbitron headers for AI-tech feel
- Glassmorphism cards with 16px radius
- Cyber accent (#00F5FF) for special highlights
- Micro-animations on all interactive elements
- Maintain existing radar visual as core brand element

---

**Deliverable Goal**: Complete, conversion-optimized flow from landing → scan → email → results → payment that maximizes user acquisition and revenue per visitor while maintaining premium, trustworthy brand perception.

**Success Metrics**: 
- Email capture rate >60%
- Free to paid conversion >10%  
- User satisfaction with professional, clear interface
- Mobile-responsive performance across all flows
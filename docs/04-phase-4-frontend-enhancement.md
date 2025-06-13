# Phase 4: Frontend & UX Enhancement - AIO Scanner Refactor

> **🔧 REFACTOR CONTEXT:** Uitbreiden van bestaande frontend voor tier-based user experience. Hergebruik bestaande components en voeg tier selector, payment flow en upgrade prompts toe.

---

## 📊 **Fase Status & Voortgang**

| Sub-fase | Taak | Status | Tijdsinschatting | Opmerkingen |
|----------|------|--------|------------------|-------------|
| **4.1 Landing Page Enhancement** | Tier selector component | 🔴 To do | 60 min | Pricing table met tier comparison |
| | URL input integration | 🔴 To do | 30 min | Connect met nieuwe tier endpoints |
| | CTA button logic | 🔴 To do | 20 min | Basic vs payment flow routing |
| **4.2 Results Page Refactoring** | Tier-specific content display | 🔴 To do | 75 min | Show/hide based on scan tier |
| | AI insights presentation | 🔴 To do | 45 min | Business tier LLM results |
| | Upgrade prompts integration | 🔴 To do | 30 min | Strategic conversion points |
| **4.3 Payment Flow Implementation** | Pricing page creation | 🔴 To do | 60 min | Package comparison & selection |
| | Mollie integration frontend | 🔴 To do | 45 min | Payment initiation flow |
| | Success/failure pages | 🔴 To do | 30 min | Post-payment user journey |
| **4.4 Email Capture Refactoring** | Basic tier email removal | 🔴 To do | 20 min | Remove email gate for free scans |
| | Paid tier email integration | 🔴 To do | 25 min | Email for PDF delivery only |
| **4.5 Component Integration** | Existing component updates | 🔴 To do | 45 min | Update props/interfaces |
| | Mobile responsiveness | 🔴 To do | 30 min | Test & fix tier selector UI |

**Totale tijd:** ~6.5 uur  
**Dependencies:** Phase 1-3 backend, bestaande UI components  
**Next Phase:** Phase 5 (Deployment & Monitoring)

**Status Legenda:**
- 🔴 To do - Nog niet gestart
- 🟡 In Progress - Bezig met implementatie  
- 🟢 Done - Voltooid en getest
- ⚪ Blocked - Wacht op dependency

---

## ⚠️ VEILIGE REFACTOR REGELS

### **BESTAANDE COMPONENTS - HERGEBRUIKEN:**
✅ **BEHOUDEN & UITBREIDEN:**
- `src/lib/components/core/URLInput.svelte` - Props uitbreiden voor tier integration
- `src/lib/components/features/scan/*.svelte` - Progress components hergebruiken
- `src/lib/components/layout/*.svelte` - Header/Footer behouden
- `src/lib/components/ui/*.svelte` - Shadcn components uitbreiden

### **EMAIL CAPTURE REFACTORING:**
🔄 **STRATEGISCHE WIJZIGING:**
- **Basic tier:** Email capture VERWIJDEREN (friction reductie)
- **Paid tiers:** Email voor PDF delivery en account-loos systeem
- **Bestaande modals:** Repurpose voor paid tier flow

### **UI PATTERNS BEHOUDEN:**
🎨 **DESIGN CONSISTENCY:**
- Bestaande color scheme en typography
- Glassmorphism en card patterns
- Button styles en interactions
- Mobile-first responsive approach

---

## 📁 BESTAANDE COMPONENTS ANALYSE

### **Huidige Component Structure (uit project tree):**
```
src/lib/components/
├── core/URLInput.svelte                    # UITBREIDEN voor tier routing
├── features/
│   ├── landing/*.svelte                    # UITBREIDEN met tier selector
│   ├── scan/*.svelte                       # BEHOUDEN, props aanpassen
│   └── email/EmailCapture*.svelte          # REFACTOR voor paid tiers only
├── layout/                                 # BEHOUDEN
└── ui/                                     # UITBREIDEN voor payment flow
```

### **Huidige Pages (uit project tree):**
```
src/routes/
├── +page.svelte                           # UITBREIDEN met tier selector
├── scan/[scanId]/+page.svelte            # MINIMAAL aanpassen
└── scan/[scanId]/results/+page.svelte    # GROTE REFACTOR voor tier display
```

---

## 🔧 TECHNISCHE IMPLEMENTATIE

### **4.1 Landing Page Enhancement**

#### **Stap A: Tier Selector Component** 🔴 To do
**Nieuw bestand:** `src/lib/components/features/pricing/TierSelector.svelte`
```typescript
// Component interface
export interface TierOption {
  id: ScanTier;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

// Usage in +page.svelte
let selectedTier: ScanTier = 'basic';
let url = '';

function handleScan() {
  if (selectedTier === 'basic') {
    goto(`/scan/basic?url=${encodeURIComponent(url)}`);
  } else {
    goto(`/pricing?tier=${selectedTier}&url=${encodeURIComponent(url)}`);
  }
}
```

#### **Stap B: URL Input Integration** 🔴 To do
**Bestaand bestand:** `src/lib/components/core/URLInput.svelte` - **UITBREIDEN**
```typescript
// TOEVOEGEN aan bestaande props
export let selectedTier: ScanTier = 'basic';
export let onScanClick: (url: string, tier: ScanTier) => void;

// Bestaande validation behouden, nieuwe tier logic toevoegen
```

#### **Stap C: Landing Page Update** 🔴 To do
**Bestaand bestand:** `src/routes/+page.svelte` - **UITBREIDEN**
- Hero section: Behouden, tier selector toevoegen
- Pricing teaser: Uitbreiden naar volledige tier comparison
- CTA logic: Basic direct scan vs payment redirect

### **4.2 Results Page Refactoring**

#### **Stap A: Tier-Specific Content Display** 🔴 To do
**Bestaand bestand:** `src/routes/scan/[scanId]/results/+page.svelte` - **GROTE REFACTOR**
```svelte
<!-- Conditional rendering based on tier -->
<script>
  export let data: { scanResult: ScanResult };
  
  $: showUpgradePrompts = data.scanResult.tier === 'basic';
  $: showAIInsights = ['business', 'enterprise'].includes(data.scanResult.tier);
  $: showPDFDownload = ['starter', 'business'].includes(data.scanResult.tier);
</script>

<!-- Tier-specific content blocks -->
{#if showUpgradePrompts}
  <UpgradePromptBanner />
{/if}

{#if showAIInsights && data.scanResult.llmInsights}
  <AIInsightsSection insights={data.scanResult.llmInsights} />
{/if}
```

#### **Stap B: AI Insights Component** 🔴 To do
**Nieuw bestand:** `src/lib/components/features/results/AIInsights.svelte`
```typescript
// Display LLM-enhanced insights voor business tier
export let insights: AIInsights;

// Before/after examples
// Implementation priority
// Authority enhancements
// Citability improvements
```

#### **Stap C: Upgrade Prompts** 🔴 To do
**Nieuw bestand:** `src/lib/components/features/results/UpgradePrompt.svelte`
```typescript
// Strategic placement upgrade prompts
export let currentTier: ScanTier;
export let scanScore: number;

// Different prompts based on score/tier
// Discount offers for returning users
// Social proof integration
```

### **4.3 Payment Flow Implementation**

#### **Stap A: Pricing Page** 🔴 To do
**Nieuw bestand:** `src/routes/pricing/+page.svelte`
```typescript
// Package comparison table
// Email input voor account-loos system
// Mollie payment initiation
// URL preservation through flow

// Props from query params
export let tier: ScanTier;
export let url: string;
```

#### **Stap B: Payment Processing Pages** 🔴 To do
**Nieuwe bestanden:**
- `src/routes/scan/processing/+page.svelte` - Payment pending state
- `src/routes/scan/success/+page.svelte` - Success confirmation
- `src/routes/scan/failed/+page.svelte` - Error handling

```typescript
// Success page flow:
// 1. Payment confirmation
// 2. Scan initiation
// 3. Redirect to live scan
```

#### **Stap C: Mollie Integration Frontend** 🔴 To do
**Nieuw bestand:** `src/lib/payment/mollieClient.ts`
```typescript
// Frontend payment initiation
export async function createPayment(tier: ScanTier, email: string, url: string) {
  const response = await fetch('/api/payment/create', {
    method: 'POST',
    body: JSON.stringify({ tier, email, url })
  });
  
  const { paymentUrl } = await response.json();
  window.location.href = paymentUrl;
}
```

### **4.4 Email Capture Refactoring**

#### **Stap A: Basic Tier Email Removal** 🔴 To do
**Bestaand bestand:** `src/routes/scan/[scanId]/+page.svelte` - **AANPASSEN**
```svelte
<!-- VERWIJDEREN: Email capture gate voor basic scans -->
<!-- Direct naar results na scan completion -->

<script>
  // Check tier from scan result
  $: requiresEmail = scanResult?.tier !== 'basic';
</script>

<!-- Only show email capture for paid tiers -->
{#if requiresEmail && !emailCaptured}
  <EmailCaptureModal purpose="paid_tier" {tier} />
{/if}
```

#### **Stap B: Paid Tier Email Integration** 🔴 To do
**Bestaand bestand:** `src/lib/components/features/email/EmailCaptureModal.svelte` - **REFACTOR**
```typescript
// AANPASSEN: Purpose-driven email capture
export let purpose: 'pdf_delivery' | 'deprecated_basic' = 'pdf_delivery';
export let tier: ScanTier;

// Different messaging:
// - Basic (deprecated): "Email voor resultaten"  
// - Paid: "Email voor PDF bezorging"
```

### **4.5 Component Integration**

#### **Stap A: Existing Component Updates** 🔴 To do
**Props/interfaces aanpassen:**

**`ProgressCircle.svelte`** - **PROPS UITBREIDEN**
```typescript
// Tier-specific progress display
export let tier: ScanTier = 'basic';
export let showTierBadge: boolean = false;
```

**`ModuleProgressGrid.svelte`** - **CONDITIONAL RENDERING**
```typescript
// Show/hide modules based on tier
export let tier: ScanTier;
export let modules: ModuleResult[];

$: visibleModules = tier === 'basic' 
  ? modules.slice(0, 4) 
  : modules;
```

**`WebsitePreview.svelte`** - **TIER INDICATOR**
```typescript
// Add tier badge to preview
export let tier: ScanTier;
```

#### **Stap B: Mobile Responsiveness** 🔴 To do
**Critical responsive updates:**
- Tier selector: Stack on mobile
- Payment flow: Touch-optimized inputs
- Results display: Collapsible sections
- AI insights: Horizontal scroll cards

```css
/* Mobile-first tier selector */
@media (max-width: 768px) {
  .tier-selector {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .tier-card {
    min-height: auto;
  }
}
```

---

## 🎨 UI/UX CONSIDERATIONS

### **Conversion Optimization:**
- **Basic tier CTA:** "Scan Gratis" (prominent, green)
- **Paid tier CTA:** "Betaal & Scan €19,95" (secondary, blue)
- **Upgrade prompts:** Strategic placement na resultaten
- **Social proof:** "500+ bedrijven gebruiken AIO-Scanner"

### **User Flow Changes:**
```
OLD: URL → Email Gate → Results → Upgrade
NEW: URL → Tier Choice → [Payment] → Scan → Results
```

### **Error States:**
- Payment failures: Clear retry options
- Scan failures: Graceful degradation messaging
- Network issues: Offline-friendly feedback

---

## 📱 RESPONSIVE DESIGN CHECKLIST

- [ ] Tier selector mobile layout
- [ ] Payment form touch optimization  
- [ ] Results page mobile navigation
- [ ] AI insights horizontal scroll
- [ ] Upgrade prompts mobile placement
- [ ] Email capture modal mobile sizing

---

## ✅ DEFINITION OF DONE

- [ ] Landing page tier selector geïmplementeerd
- [ ] Results page toont tier-specific content
- [ ] Payment flow volledig werkend
- [ ] Email capture alleen voor paid tiers
- [ ] Upgrade prompts strategisch geplaatst
- [ ] Mobile responsiveness getest
- [ ] Bestaande components behouden & uitgebreid
- [ ] User flow end-to-end getest
- [ ] Error handling gevalideerd
- [ ] Performance acceptable op mobile
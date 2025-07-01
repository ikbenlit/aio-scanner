# AIO-Scanner: Van MVP naar Quality-Based Pricing
## Gefaseerd Implementatieplan

> **Doel:** De bestaande MVP omzetten naar een tier-gebaseerd systeem zonder user accounts, gefocust op directe waarde per scan.

---

## 🎯 **Strategie & Prioriteiten**

### **Van Waar Naar Waar**
```
HUIDIGE MVP (email gate model):
- Anonymous scan → Email capture gate → Results
- Users tabel met credits systeem
- Email verplicht voor resultaten

NIEUWE VISIE (tier-based model):
- Basic scan: Direct naar resultaten (geen email vereist)
- Starter/Business: Email alleen voor PDF rapport bezorging
- Payment per scan, geen account systeem
```

---

**Kernbeslissing: Account-Loos Systeem**
- **Geen user registratie** → Maximum friction reductie
- **Direct: URL → Tier → Betaling → Scan → Resultaat**
- **Email alleen voor rapport bezorging** bij betaalde tiers
- **Payment verification via Mollie payment_id**

---

## 🏗️ **Tier Definitie & Technische Mapping**

### **Tier 1: Basic Scan (Gratis)**
**Doel:** Lead generation & product demo
```typescript
// Hergebruik huidige scan logica ZONDER email gate
const basicScan = await scanOrchestrator.executeBasicScan(url);
// Features: 4 SEO modules (pattern-based only)
// Result: Direct naar resultaten, geen email vereist
// Cost: €0 (geen AI calls)
```

**Flow wijziging:**
- ❌ Verwijder email capture gate
- ✅ Direct scan → resultaten
- ✅ Upgrade prompts in resultaten
- ✅ Optioneel email voor nieuwsbrief

### **Tier 2: Starter Scan (€19,95)**
**Doel:** Professional rapportage
```typescript
// Basic scan + AI rapport generatie
const starterScan = await scanOrchestrator.executeStarterScan(url);
const professionalReport = await aiReportGenerator.generate(starterScan);
// Enhancement: Pattern results → AI geschreven rapport
// Cost: ~€0.02 per scan (AI rapport only)
```

**Nieuwe implementatie nodig:**
- AI Report Generator service 🔨
- Email delivery voor PDF 🔨
- Payment verification 🔨

### **Tier 3: Business Scan (€49,95)** ⭐ **KERN DIFFERENTIATOR**
**Doel:** Hybrid pattern + LLM analyse
```typescript
// Enhanced content extraction + LLM insights
const businessScan = await scanOrchestrator.executeHybridScan(url);
// Features: Smart content sampling + authority enhancement
// Cost: ~€0.05-0.10 per scan (LLM enhancement)
```

**Nieuwe modules ontwikkelen:**
- Enhanced ContentExtractor 🔨
- LLM Enhancement Service 🔨
- Authority signal detection 🔨
- Missed opportunity identifier 🔨

### **Tier 4: Enterprise Scan (€149,95)**
**Doel:** Future premium offering
```typescript
// Complete AI strategy analyse (toekomstige implementatie)
// Features: Multi-page analysis + industry insights
// Cost: ~€0.50-2.00 per scan
```

---

## 📅 **Gefaseerde Implementatie**

### **📊 Overzichtstabel - Voortgang Tracking**

| Fase | Subfase | Status | Opmerkingen |
|------|---------|--------|-------------|
| **FASE 1: Fundament** | 1.1 Database Migratie | 🔴 To do | Safe approach - geen tabellen verwijderen |
| | 1.2 Email Historie Systeem | 🔴 To do | Nieuwe user_scan_history tabel |
| | 1.3 API Endpoints Structuur | 🔴 To do | Basic/starter/business routes |
| | 1.4 Types & Backwards Compatibility | 🔴 To do | ScanTier types + legacy support |
| **FASE 2: Core Tiers** | 2.1 ScanOrchestrator Refactoring | 🔴 To do | Tier-based scan execution |
| | 2.2 AI Report Generator | 🔴 To do | Starter tier enhancement |
| | 2.3 Payment Integration | 🔴 To do | Mollie payment flow |
| | 2.4 Email Marketing Foundation | 🔴 To do | Post-scan email campaigns |
| **FASE 3: Business Tier** | 3.1 Enhanced Content Extraction | 🔴 To do | Smart authority signal detection |
| | 3.2 LLM Enhancement Service | 🔴 To do | Hybrid pattern + AI analysis |
| | 3.3 Hybrid Scan Implementation | 🔴 To do | Core differentiator feature |
| **FASE 4: Frontend & UX** | 4.1 Landing Page Tier Selector | 🔴 To do | Pricing table + tier comparison |
| | 4.2 Results Page Enhancement | 🔴 To do | Tier-specific content display |
| | 4.3 Payment Flow UI | 🔴 To do | Pricing → Payment → Success |
| | 4.4 Upgrade Prompts | 🔴 To do | Conversion optimization |

**Status Legenda:**
- 🔴 To do - Nog niet gestart
- 🟡 In Progress - Bezig met implementatie  
- 🟢 Done - Voltooid en getest
- ⚪ Blocked - Wacht op dependency

---

### **🏃‍♂️ FASE 1: Fundament** 🔴 **To do**
**Doel:** Database + API structuur voorbereiden

#### **1.1 Database Migratie - Safe Approach** 🔴 **To do**
```sql
-- GEEN tabellen verwijderen! Markeer als deprecated
ALTER TABLE users ADD COLUMN deprecated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE user_credits ADD COLUMN deprecated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE credits ADD COLUMN deprecated_at TIMESTAMP DEFAULT NOW();

-- Scans tabel uitbreiden (backwards compatible)
ALTER TABLE scans ADD COLUMN tier TEXT DEFAULT 'basic';
ALTER TABLE scans ADD COLUMN payment_reference TEXT;
ALTER TABLE scans ADD COLUMN user_email TEXT; -- Email historie bewaren

-- Payment tracking (nieuw systeem)
CREATE TABLE scan_payments (
  id UUID PRIMARY KEY,
  scan_id UUID REFERENCES scans(id),
  tier TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  mollie_payment_id TEXT,
  user_email TEXT NOT NULL, -- Voor historie en marketing
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email historie table (voor marketing en retentie)
CREATE TABLE user_scan_history (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  scan_ids UUID[], -- Array van scan IDs
  first_scan_at TIMESTAMP,
  last_scan_at TIMESTAMP,
  total_scans INTEGER DEFAULT 0,
  paid_scans INTEGER DEFAULT 0,
  total_spent DECIMAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index voor email lookups
CREATE INDEX idx_user_scan_history_email ON user_scan_history(email);
CREATE INDEX idx_scans_user_email ON scans(user_email);
```

#### **API Endpoints Voorbereiden**
```
src/routes/api/scan/
├── basic/+server.ts      // Hernoem anonymous
├── starter/+server.ts    // Nieuw
├── business/+server.ts   // Nieuw  
└── enterprise/+server.ts // Placeholder
```

#### **1.2 Email Historie Systeem** 🔴 **To do**
```typescript
// src/lib/email/historyService.ts - NIEUW BESTAND
export class EmailHistoryService {
  async updateUserScanHistory(
    email: string, 
    tier: ScanTier, 
    scanId: string,
    amountPaid: number = 0
  ): Promise<void> {
    const { data: existing } = await supabase
      .from('user_scan_history')
      .select('*')
      .eq('email', email)
      .single();

    if (existing) {
      // Update bestaande historie
      await supabase
        .from('user_scan_history')
        .update({
          scan_ids: [...existing.scan_ids, scanId],
          last_scan_at: new Date(),
          total_scans: existing.total_scans + 1,
          paid_scans: tier !== 'basic' ? existing.paid_scans + 1 : existing.paid_scans,
          total_spent: existing.total_spent + amountPaid,
          updated_at: new Date()
        })
        .eq('email', email);
    } else {
      // Nieuwe gebruiker
      await supabase
        .from('user_scan_history')
        .insert({
          email,
          scan_ids: [scanId],
          first_scan_at: new Date(),
          last_scan_at: new Date(),
          total_scans: 1,
          paid_scans: tier !== 'basic' ? 1 : 0,
          total_spent: amountPaid
        });
    }
  }

  async getUserHistory(email: string): Promise<UserScanHistory | null> {
    const { data } = await supabase
      .from('user_scan_history')
      .select('*')
      .eq('email', email)
      .single();
    
    return data;
  }

  async getRetentionCandidates(): Promise<string[]> {
    // Gebruikers die > 7 dagen geleden laatste scan deden
    const { data } = await supabase
      .from('user_scan_history')
      .select('email')
      .lt('last_scan_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return data?.map(row => row.email) || [];
  }

  async getUpgradeCandidates(): Promise<string[]> {
    // Gebruikers met meerdere basic scans maar geen betaalde
    const { data } = await supabase
      .from('user_scan_history')
      .select('email')
      .gte('total_scans', 2)
      .eq('paid_scans', 0);
    
    return data?.map(row => row.email) || [];
  }
}

// Types
export interface UserScanHistory {
  id: string;
  email: string;
  scan_ids: string[];
  first_scan_at: Date;
  last_scan_at: Date;
  total_scans: number;
  paid_scans: number;
  total_spent: number;
}
```

#### **1.4 Types & API Structure** 🔴 **To do**
```typescript
// src/lib/compatibility/legacySupport.ts - NIEUW
export class LegacyCompatibilityService {
  async handleLegacyEmailCapture(email: string, scanId: string): Promise<void> {
    console.warn('LEGACY: Email capture gebruikt - migreer naar nieuwe flow');
    
    // Update nieuwe email historie systeem
    await emailHistoryService.updateUserScanHistory(email, 'basic', scanId);
    
    // Behoud oude email capture data voor backwards compatibility
    // Maar gebruik nieuwe systeem als primary
  }

  async migrateLegacyUserData(): Promise<void> {
    // Migratie script om oude user data naar nieuwe historie systeem te zetten
    const { data: oldScans } = await supabase
      .from('scans')
      .select('*')
      .not('email', 'is', null);

    for (const scan of oldScans || []) {
      if (scan.email) {
        await emailHistoryService.updateUserScanHistory(
          scan.email,
          scan.tier || 'basic',
          scan.id,
          0 // Legacy scans hadden geen payment tracking
        );
      }
    }
  }
}
```

#### **Code Deprecation Strategy - SAFE APPROACH**
```typescript
// src/lib/deprecated/README.md - NIEUW BESTAND
/*
DEPRECATED CODE TRACKING
========================

WAAROM: Overgang naar tier-based systeem zonder accounts
WANNEER: [DATUM VAN DEPRECATION]
CLEANUP PLAN: Na 3 maanden succesvolle werking nieuwe systeem

DEPRECATED BESTANDEN:
- src/routes/api/scan/anonymous/+server.ts → basic/+server.ts
- src/routes/api/scan/email-capture/+server.ts → Email nu onderdeel van betaalde flow
- src/lib/components/features/email/EmailCapture.svelte → Alleen voor betaalde tiers
- User account gerelateerde API endpoints

BACKWARDS COMPATIBILITY:
- Oude endpoints blijven werken maar loggen deprecation warnings
- Database tabellen blijven bestaan maar worden niet meer gebruikt
- Email adressen worden bewaard in nieuwe user_scan_history tabel
*/

// src/lib/deprecated/types.ts - Move oude types hierheen
export interface DeprecatedUserAccount {
  // ... oude user types
}

// src/lib/deprecated/auth.ts - Oude auth logica
// TODO: DEPRECATED - Verwijderen na 3 maanden nieuwe systeem
```

#### **Email Capture Refactoring - PRESERVE & REPURPOSE**
```typescript
// src/lib/components/features/email/EmailCapture.svelte - AANPASSEN
<script lang="ts">
  // DEPRECATED voor basic scans, REPURPOSED voor betaalde scans
  export let purpose: 'deprecated_basic' | 'paid_tier' = 'deprecated_basic';
  export let tier: ScanTier | null = null;
  
  // Behoud huidige functionaliteit maar mark usage
  async function handleEmailSubmit() {
    if (purpose === 'deprecated_basic') {
      console.warn('DEPRECATED: Basic email capture - migreer naar tier systeem');
      // Oude flow maar wel email historie bijwerken
      await updateEmailHistory(email, 'basic');
    } else {
      // Nieuwe flow voor betaalde tiers
      await handlePaidTierEmail(email, tier);
    }
  }
</script>

<!-- Conditional rendering gebaseerd op purpose -->
{#if purpose === 'deprecated_basic'}
  <!-- Oude UI maar met deprecation warning voor dev -->
  <div class="deprecated-email-capture">
    <!-- Bestaande email capture UI -->
  </div>
{:else}
  <!-- Nieuwe UI voor betaalde tiers -->
  <div class="paid-tier-email-capture">
    <!-- Email capture voor rapport bezorging -->
  </div>
{/if}
```

#### **1.3 Email Capture Verwijdering** 🔴 **To do**

**Safe removal strategy:**
```typescript
// STAP 1: Markeer componenten als deprecated
// src/lib/components/features/email/EmailCaptureForm.svelte
/*
DEPRECATED: Email capture gate wordt vervangen door tier-based systeem
Deze component kan volledig verwijderd worden na succesvolle migratie
Datum: [DATUM]
Reden: Nieuwe flow: Basic scan → Direct resultaten
*/

// STAP 2: Update scan flow in routes
// src/routes/scan/[scanId]/+page.svelte - AANPASSEN
// Verwijder email gate logica, direct naar resultaten

// STAP 3: API endpoint cleanup  
// src/routes/api/scan/email-capture/+server.ts - DEPRECATED
// Markeer voor verwijdering maar laat bestaan tijdens migratie
```

**Anonymous scan hernoemen:**
```typescript
// src/routes/api/scan/anonymous/+server.ts → basic/+server.ts
// Verwijder email requirement uit logica
export async function POST({ request }) {
  const { url } = await request.json(); // Geen email meer vereist
  
  const scanResult = await scanOrchestrator.executeBasicScan(url);
  return json({
    ...scanResult,
    tier: 'basic',
    requiresEmail: false // Nieuwe property
  });
}
```
```typescript
// src/routes/api/scan/anonymous/+server.ts - DEPRECATED maar werkend
export async function POST({ request }) {
  console.warn('DEPRECATED API: /api/scan/anonymous - Gebruik /api/scan/basic');
  
  // Log deprecation usage voor monitoring
  await trackDeprecationUsage('anonymous_scan', request);
  
  // Redirect naar nieuwe endpoint maar behoud functionaliteit
  const { url } = await request.json();
  return await basicScanHandler(url, 'basic');
}

// src/routes/api/scan/basic/+server.ts - NIEUW (wrapper around oude logica)
export async function POST({ request }) {
  const { url, email } = await request.json();
  
  // Update email historie als email wordt meegegeven
  if (email) {
    await updateUserScanHistory(email, 'basic');
  }
  
  // Hergebruik bestaande scan logica
  return await executeScan(url, 'basic', { email });
}
```

**Fase 1 Definition of Done:**
- [ ] Database schema uitgebreid (oude tabellen behouden)
- [ ] Email historie systeem geïmplementeerd
- [ ] API endpoints structuur klaar (oude routes blijven werken)
- [ ] Backwards compatibility layer werkend
- [ ] Deprecation tracking systeem actief
- [ ] Legacy data migratie script klaar
- [ ] Types en interfaces gedefinieerd
- [ ] Basic endpoint werkt (hergebruik MVP + email historie)

---

### **🔧 FASE 2: Core Tiers + Email Marketing** 🔴 **To do**
**Doel:** Basic + Starter tier werkend + email marketing foundation

#### **2.1 ScanOrchestrator Refactoring** 🔴 **To do**
```typescript
// src/lib/scan/ScanOrchestrator.ts - UITBREIDEN
class ScanOrchestrator {
  constructor(
    private emailHistoryService: EmailHistoryService,
    private emailMarketingService: EmailMarketingService
  ) {}

  async executeTierScan(
    url: string, 
    tier: ScanTier, 
    email?: string,
    paymentId?: string
  ): Promise<ScanResult> {
    const scanId = generateScanId();
    
    // Execute scan based on tier
    let result: ScanResult;
    switch (tier) {
      case 'basic':
        result = await this.executeBasicScan(url, scanId);
        break;
      case 'starter':
        result = await this.executeStarterScan(url, scanId);
        break;
      case 'business':
        result = await this.executeHybridScan(url, scanId); // Sprint 3
        break;
      default:
        throw new Error(`Tier ${tier} not implemented yet`);
    }

    // Update email historie als email beschikbaar
    if (email) {
      await this.emailHistoryService.updateUserScanHistory(
        email, 
        tier, 
        scanId,
        tier === 'starter' ? 19.95 : tier === 'business' ? 49.95 : 0
      );
      
      // Trigger email marketing flows
      await this.emailMarketingService.triggerPostScanFlow(email, tier, result);
    }

    return result;
  }

  private async executeStarterScan(url: string, scanId: string): Promise<ScanResult> {
    const basicResults = await this.executeBasicScan(url, scanId);
    const aiReport = await this.aiReportGenerator.generate(basicResults);
    
    return {
      ...basicResults,
      tier: 'starter',
      aiReport,
      scanId
    };
  }
}
```

#### **2.2 AI Report Generator** 🔴 **To do**
```typescript
// src/lib/email/marketingService.ts - NIEUW
export class EmailMarketingService {
  async triggerPostScanFlow(email: string, tier: ScanTier, result: ScanResult): Promise<void> {
    const history = await this.emailHistoryService.getUserHistory(email);
    
    switch (tier) {
      case 'basic':
        await this.sendBasicScanEmail(email, result, history);
        break;
      case 'starter':
        await this.sendStarterScanEmail(email, result);
        break;
      case 'business':
        await this.sendBusinessScanEmail(email, result);
        break;
    }
  }

  private async sendBasicScanEmail(
    email: string, 
    result: ScanResult, 
    history: UserScanHistory | null
  ): Promise<void> {
    const template = history?.total_scans > 1 
      ? 'basic-scan-returning-user'  // Stronger upgrade push
      : 'basic-scan-first-time';     // Gentle intro

    await this.emailSender.send({
      to: email,
      template,
      data: {
        score: result.overallScore,
        topIssues: result.modules.slice(0, 3),
        upgradeDiscount: history?.total_scans > 2 ? 0.2 : 0.1
      }
    });
  }

  private async sendStarterScanEmail(email: string, result: ScanResult): Promise<void> {
    await this.emailSender.send({
      to: email,
      template: 'starter-scan-complete',
      data: {
        pdfUrl: result.pdfUrl,
        score: result.overallScore,
        businessUpgradeOffer: true
      }
    });
  }

  // Scheduled email campaigns
  async runRetentionCampaign(): Promise<void> {
    const candidates = await this.emailHistoryService.getRetentionCandidates();
    
    for (const email of candidates) {
      await this.sendRetentionEmail(email);
    }
  }

  async runUpgradeCampaign(): Promise<void> {
    const candidates = await this.emailHistoryService.getUpgradeCandidates();
    
    for (const email of candidates) {
      await this.sendUpgradeEmail(email);
    }
  }
}
```

#### **2.3 Payment Integration** 🔴 **To do**
```typescript
// src/lib/email/templates/index.ts - NIEUW
export const emailTemplates = {
  'basic-scan-first-time': {
    subject: '🎉 Je eerste AI-scan is klaar!',
    html: `
      <h1>Welkom bij AIO-Scanner!</h1>
      <p>Je website scoort {{score}}/100 voor AI-assistenten.</p>
      
      <h2>Top 3 verbeterpunten:</h2>
      {{#each topIssues}}
        <li>{{this.title}}: {{this.recommendation}}</li>
      {{/each}}
      
      <div class="upgrade-cta">
        <h3>Wil je meer details?</h3>
        <p>Upgrade naar Starter voor €19,95 en krijg:</p>
        <ul>
          <li>✅ Uitgebreide PDF met implementatiegids</li>
          <li>✅ AI-gegenereerde aanbevelingen</li>
          <li>✅ 2 extra scans</li>
        </ul>
        <a href="{{upgradeUrl}}">Upgrade Nu</a>
      </div>
    `
  },
  
  'basic-scan-returning-user': {
    subject: '🔄 Je {{totalScans}}e scan is klaar - tijd voor een upgrade?',
    html: `
      <h1>Hallo weer!</h1>
      <p>Dit is je {{totalScans}}e scan. Je website scoort nu {{score}}/100.</p>
      
      <div class="special-offer">
        <h2>🎁 Speciale aanbieding!</h2>
        <p>Omdat je een trouwe gebruiker bent: {{upgradeDiscount}}% korting op Starter!</p>
        <a href="{{upgradeUrl}}">Claim Korting</a>
      </div>
    `
  }
};
```

#### **ScanOrchestrator Refactoring**
```typescript
// src/lib/scan/ScanOrchestrator.ts
class ScanOrchestrator {
  async executeTierScan(url: string, tier: ScanTier): Promise<ScanResult> {
    switch (tier) {
      case 'basic':
        return this.executeBasicScan(url);
      case 'starter':
        return this.executeStarterScan(url);
      case 'business':
        return this.executeHybridScan(url); // Sprint 3
      case 'enterprise':
        throw new Error('Not implemented yet');
    }
  }

  private async executeStarterScan(url: string): Promise<ScanResult> {
    const basicResults = await this.executeBasicScan(url);
    const aiReport = await this.aiReportGenerator.generate(basicResults);
    return {
      ...basicResults,
      tier: 'starter',
      aiReport
    };
  }
}
```

#### **AI Report Generator**
```typescript
// src/lib/scan/AIReportGenerator.ts - NIEUW
class AIReportGenerator {
  async generate(scanResults: ScanResult): Promise<string> {
    const prompt = this.buildPrompt(scanResults);
    const response = await this.vertexAI.generate(prompt);
    return this.formatReport(response);
  }

  private buildPrompt(results: ScanResult): string {
    return `
    Analyseer deze website scan resultaten en schrijf een professioneel rapport:
    - Modules: ${JSON.stringify(results.modules)}
    - Scores: ${JSON.stringify(results.scores)}
    
    Geef concrete, uitvoerbare aanbevelingen.
    `;
  }
}
```

#### **Payment Integration**
```typescript
// src/routes/api/payment/create/+server.ts - NIEUW
export async function POST({ request }) {
  const { tier, url, email } = await request.json();
  
  const price = TIER_PRICES[tier];
  const payment = await mollie.payments.create({
    amount: { currency: 'EUR', value: price },
    description: `AIO-Scanner ${tier} scan`,
    redirectUrl: `${PUBLIC_BASE_URL}/scan/processing`,
    webhookUrl: `${PUBLIC_BASE_URL}/api/mollie/webhook`,
    metadata: { tier, url, email }
  });
  
  return json({ payment_url: payment.getCheckoutUrl() });
}
```

**Sprint 2 Definition of Done:**
- [ ] Basic tier hergebruikt MVP logica
- [ ] Starter tier: basic + AI rapport
- [ ] AIReportGenerator werkend
- [ ] Mollie payment flow geïmplementeerd
- [ ] Email delivery voor starter tier
- [ ] Payment webhook handling

---

### **🤖 SPRINT 3: Business Tier - Hybrid AI (Week 3)**
**Doel:** De kern differentiator - hybrid pattern + LLM analyse

#### **Enhanced Content Extraction**
```typescript
// src/lib/scan/ContentExtractor.ts - UITBREIDEN
class ContentExtractor {
  // Huidige functionaliteit behouden + uitbreiden
  
  async extractEnhancedContent(html: string): Promise<EnhancedContent> {
    const basicContent = await this.extractContent(html); // Bestaand
    
    // NIEUW: Smart pattern detection
    const authoritySignals = this.detectAuthoritySignals(html);
    const timeBasedClaims = this.detectTemporalClaims(html);
    const qualityClaims = this.detectQualityClaims(html);
    
    return {
      ...basicContent,
      authoritySignals,
      timeBasedClaims,
      qualityClaims,
      enhancementOpportunities: this.identifyOpportunities(html)
    };
  }

  private detectAuthoritySignals(html: string): AuthoritySignal[] {
    // "een eeuw lang" → 100 years experience
    // "familiebedrijf sinds" → generational business
    // "heel erg goed" → quality claim needing substantiation
    const patterns = [
      { pattern: /een eeuw lang/gi, type: 'temporal_authority', value: 100 },
      { pattern: /(\d+)\+?\s*jaar\s*ervaring/gi, type: 'experience_years' },
      { pattern: /sinds\s*(\d{4})/gi, type: 'established_year' },
      { pattern: /familiebedrijf/gi, type: 'family_business' }
    ];
    
    return patterns.map(p => this.extractMatches(html, p)).flat();
  }
}
```

#### **3.2 LLM Enhancement Service** 🔴 **To do**
```typescript
// src/lib/scan/LLMEnhancementService.ts - NIEUW
class LLMEnhancementService {
  async enhanceFindings(
    modules: ModuleResult[], 
    extractedContent: EnhancedContent
  ): Promise<EnhancedInsights> {
    
    const prompt = `
    Analyseer deze website bevindingen voor AI-assistant optimalisatie:
    
    BEVINDINGEN: ${JSON.stringify(modules)}
    CONTENT SIGNALS: ${JSON.stringify(extractedContent.authoritySignals)}
    
    Geef specifieke verbeteringen die:
    1. Vage claims transformeren naar citeerbare feiten
    2. Gemiste autoriteit signalen identificeren  
    3. Concrete voor/na voorbeelden geven
    
    Focus op: citability, authority, trustworthiness voor AI systems.
    `;
    
    const response = await this.vertexAI.generate(prompt);
    return this.parseEnhancements(response);
  }

  private parseEnhancements(response: string): EnhancedInsights {
    // Parse AI response naar gestructureerde insights
    return {
      missedOpportunities: [],
      authorityEnhancements: [],
      citabilityImprovements: [],
      implementationPriority: []
    };
  }
}
```

#### **3.3 Hybrid Scan Implementation** 🔴 **To do**
```typescript
// ScanOrchestrator.ts - UITBREIDEN
private async executeHybridScan(url: string): Promise<ScanResult> {
  // 1. Enhanced content extraction
  const html = await this.contentFetcher.fetchContent(url);
  const enhancedContent = await this.contentExtractor.extractEnhancedContent(html);
  
  // 2. Run existing pattern modules
  const basicModules = await this.runBasicModules(url, html);
  
  // 3. LLM enhancement layer
  const llmInsights = await this.llmEnhancementService.enhanceFindings(
    basicModules, 
    enhancedContent
  );
  
  // 4. Combine results
  return {
    modules: basicModules,
    enhancedContent,
    llmInsights,
    tier: 'business',
    overallScore: this.calculateHybridScore(basicModules, llmInsights)
  };
}
```

**Fase 3 Definition of Done:**
- [ ] Enhanced ContentExtractor met authority signal detection
- [ ] LLMEnhancementService werkend
- [ ] Hybrid scan combineert pattern + AI insights
- [ ] Business tier volledig geïmplementeerd
- [ ] Cost monitoring voor AI calls
- [ ] Before/after voorbeelden in output

---

### **🎨 FASE 4: Frontend & UX** 🔴 **To do**
**Doel:** Complete user interface voor tier selectie en resultaten

#### **4.1 Landing Page Tier Selector** 🔴 **To do**
```svelte
<!-- src/routes/+page.svelte - AANPASSEN -->
<script lang="ts">
  let selectedTier: ScanTier = 'basic';
  let url = '';
  
  async function handleScan() {
    if (selectedTier === 'basic') {
      // Direct naar basic scan
      goto(`/scan/basic?url=${encodeURIComponent(url)}`);
    } else {
      // Naar payment flow
      goto(`/pricing?tier=${selectedTier}&url=${encodeURIComponent(url)}`);
    }
  }
</script>

<div class="tier-selector">
  <!-- Pricing table met tier differences -->
  <TierComparisonTable bind:selectedTier />
  <URLInput bind:value={url} />
  <button on:click={handleScan}>
    {selectedTier === 'basic' ? 'Scan Gratis' : `Betaal & Scan (${TIER_PRICES[selectedTier]})`}
  </button>
</div>
```

#### **4.2 Results Page Enhancement** 🔴 **To do**
```svelte
<!-- src/routes/scan/[scanId]/results/+page.svelte - AANPASSEN -->
<script lang="ts">
  export let data: { scanResult: ScanResult };
  
  $: showUpgradePrompts = data.scanResult.tier === 'basic';
  $: showAIInsights = ['business', 'enterprise'].includes(data.scanResult.tier);
</script>

{#if showUpgradePrompts}
  <UpgradePromptBanner />
{/if}

<ScoreCircle score={data.scanResult.overallScore} />

{#if showAIInsights && data.scanResult.llmInsights}
  <AIInsightsSection insights={data.scanResult.llmInsights} />
{/if}

<!-- Module accordions met tier-specific content -->
{#each data.scanResult.modules as module}
  <ModuleAccordion {module} tier={data.scanResult.tier} />
{/each}
```

#### **4.3 Payment Flow UI** 🔴 **To do**

```
src/routes/pricing/+page.svelte          // Tier selection & payment
src/routes/scan/processing/+page.svelte  // Payment processing
src/routes/scan/success/+page.svelte     // Payment success
```

#### **4.4 Upgrade Prompts** 🔴 **To do**

```svelte
<!-- Upgrade prompts voor basic users -->
<UpgradePromptBanner />
```

**Fase 4 Definition of Done:**
- [ ] Landing page met tier selector
- [ ] Pricing comparison table
- [ ] Payment flow UI geïmplementeerd
- [ ] Results page toont tier-specific content
- [ ] Upgrade prompts voor basic users
- [ ] Responsive design voor alle schermen

**Sprint 5 Definition of Done:**
- [ ] A/B testing setup werkend
- [ ] Performance monitoring geïmplementeerd
- [ ] Error handling & fallbacks getest
- [ ] Cost monitoring dashboard
- [ ] Productie deployment succesvol
- [ ] End-to-end user journey getest

---

## 📁 **Bestanden Mapping (Referentie voor AI)**

### **Bestaande Bestanden (hergebruiken/aanpassen)**
```
✅ BESTAAT AL:
- src/lib/scan/ScanOrchestrator.ts (uitbreiden voor tier system)
- src/routes/api/scan/anonymous/+server.ts (hernoemen naar basic)
- src/lib/scan/types.ts (uitbreiden met tier types)
- src/lib/scan/ContentExtractor.ts (uitbreiden voor business tier)
- src/lib/email/* (bestaande email infrastructure)
- src/lib/supabase.ts (database client)

🟡 AANPASSEN:
- src/routes/+page.svelte (tier selector toevoegen)
- src/routes/scan/[scanId]/results/+page.svelte (tier-specific content)
- src/lib/components/features/email/EmailCapture*.svelte (repurpose)
```

### **Nieuwe Bestanden (aanmaken)**
```
🔴 DEPRECATED COMPONENTEN (te verwijderen):
- src/lib/components/features/email/EmailCaptureForm.svelte
- src/lib/components/features/email/EmailCaptureModal.svelte
- src/lib/components/features/scan/EmailCaptureModal.svelte
- src/lib/components/ui/overlay/EmailCaptureModal.svelte
- src/routes/api/scan/email-capture/+server.ts

🔄 HERNOEMEN/AANPASSEN:
- src/routes/api/scan/anonymous/+server.ts → basic/+server.ts
- src/routes/scan/[scanId]/+page.svelte (remove email gate flow)

🆕 NIEUWE API ENDPOINTS:
- src/routes/api/scan/starter/+server.ts
- src/routes/api/scan/business/+server.ts
- src/routes/api/payment/create/+server.ts
- src/routes/api/mollie/webhook/+server.ts

🔴 NIEUWE SERVICES:
- src/lib/email/historyService.ts
- src/lib/email/marketingService.ts
- src/lib/scan/AIReportGenerator.ts
- src/lib/scan/LLMEnhancementService.ts
- src/lib/compatibility/legacySupport.ts
- src/lib/monitoring/deprecationTracker.ts

🔴 NIEUWE UI COMPONENTS:
- src/lib/components/features/pricing/TierSelector.svelte
- src/lib/components/features/results/UpgradePrompt.svelte
- src/lib/components/features/results/AIInsights.svelte

🔴 NIEUWE PAGES:
- src/routes/pricing/+page.svelte
- src/routes/scan/processing/+page.svelte
- src/routes/scan/success/+page.svelte
```

### **Database Migratie**
```
🔴 NIEUWE TABELLEN:
- migrations/add_tier_system.sql
- migrations/add_email_history.sql
- migrations/add_payment_tracking.sql
```

---

**Focus: Technische implementatie van MVP naar tier-based systeem met veilige migratie en email marketing foundation.** 🎯
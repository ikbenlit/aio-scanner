# Phase 2: Tier System Integration - AIO Scanner Refactor

> **🔧 REFACTOR CONTEXT:** Uitbreiden van bestaande ScanOrchestrator en API endpoints voor tier-based scanning. Hergebruik bestaande scan modules en logica, voeg tier-specific execution toe.

---

## 📊 **Fase Status & Voortgang**

| Sub-fase | Taak | Status | Tijdsinschatting | Opmerkingen |
|----------|------|--------|------------------|-------------|
| **2.1 ScanOrchestrator Refactoring** | Tier-based execution toevoegen | 🟢 Done | 60 min | Core implementatie voltooid |
| | Module interface cleanup | 🟢 Done | 30 min | Alle 4 modules gerefactored |
| | AI Report Generator service | 🟢 Done | 45 min | Voltooid in 25 min |
| | Payment verification integratie | 🟢 Done | 45 min | Mollie payment flow werkt end-to-end |
| **2.2 API Endpoints Restructuur** | Anonymous → Basic hernoemen | 🔴 To do | 20 min | Safe rename met backwards compatibility |
| | Starter tier endpoint | 🟢 Done | 30 min | Nieuwe /api/scan/starter |
| | Business tier endpoint | 🔴 To do | 30 min | Nieuwe /api/scan/business |
| | Enterprise tier endpoint | 🔴 To do | 30 min | Nieuwe /api/scan/enterprise |
| **2.3 Email Marketing Foundation** | Post-scan email triggers | 🚫 Skipped | 45 min | MVP scope cut - geïsoleerd systeem |
| | Template system uitbreiden | 🚫 Skipped | 30 min | Niet kritiek voor core functionality |
| **2.4 Backwards Compatibility** | Legacy API wrapper | 🔴 To do | 20 min | Oude endpoints blijven werken |
| | Deprecation logging | 🔴 To do | 15 min | Usage monitoring |

**Totale tijd:** ~5 uur  
**Actual tijd:** 2h30min gebruikt  
**Dependencies:** Phase 1 database schema, bestaande scan modules  
**Next Phase:** Phase 3 (AI Enhancement Services)

**Status Legenda:**
- 🔴 To do - Nog niet gestart
- 🟡 In Progress - Bezig met implementatie  
- 🟢 Done - Voltooid en getest
- ⚪ Blocked - Wacht op dependency

---

### **🚫 MVP SCOPE CUTS**

#### **Email Marketing Foundation - SKIPPED**
**Rationale:** 
- Volledig geïsoleerd van core scan functionaliteit
- Conversie optimization heeft traffic nodig (post-launch)
- 75 minuten beter besteed aan Phase 3 AI enhancement

**Impact:** Geen - alle scan flows werken zonder email marketing
**Post-MVP:** Implementeren als traffic/conversion data beschikbaar is

--

## ⚠️ VEILIGE REFACTOR REGELS

### **BESTAANDE MODULES - BEHOUDEN:**
✅ **NIET AANRAKEN:**
- `src/lib/scan/modules/TechnicalSEOModule.ts` - Werkende SEO analysis
- `src/lib/scan/modules/SchemaMarkupModule.ts` - JSON-LD validation  
- `src/lib/scan/modules/AIContentModule.ts` - Content analysis
- `src/lib/scan/modules/AICitationModule.ts` - Citation opportunities
- `src/lib/scan/ContentFetcher.ts` - HTML fetching logica
- `src/lib/scan/ContentExtractor.ts` - Content parsing

### **UITBREIDEN (niet vervangen):**
🔄 **ScanOrchestrator.ts** - Tier logic toevoegen aan bestaande orchestration
🔄 **API endpoints** - Nieuwe routes, oude behouden voor backwards compatibility
🔄 **Email templates** - Uitbreiden met tier-specific content

### **DEPRECATED (behouden maar markeren):**
❌ **`/api/scan/anonymous`** → wordt `/api/scan/basic` (oude blijft werken)
❌ **`/api/scan/email-capture`** → Email nu onderdeel van betaalde tiers

---

## 📁 BESTAANDE CODE ANALYSE

### **Huidige ScanOrchestrator (uit project tree):**
```typescript
// src/lib/scan/ScanOrchestrator.ts - BESTAANDE FUNCTIONALITEIT
class ScanOrchestrator {
  private modules: ScanModule[] = [
    new TechnicalSEOModule(),
    new SchemaMarkupModule(), 
    new AIContentModule(),
    new AICitationModule()
  ]; 2.1 Stap A

  // BEHOUDEN: Bestaande scan logica
  async executeScan(url: string, scanId: string): Promise<ScanResult> {
    // Bestaande parallel module execution
    // Real-time progress updates via Supabase
    // Error handling en timeouts
  }
}
```

### **Huidige API Endpoints (uit project tree):**
```
src/routes/api/scan/
├── anonymous/+server.ts        # HERNOEMEN naar basic (backwards compatible)
├── complete/+server.ts         # BEHOUDEN
├── email-capture/+server.ts    # DEPRECATED maar behouden
├── results/[scanId]/+server.ts # BEHOUDEN
└── test-simple/+server.ts      # BEHOUDEN
```

---

## 🔧 TECHNISCHE IMPLEMENTATIE

### **2.1 ScanOrchestrator Refactoring**

#### **Stap A: Tier-Based Execution Toevoegen** 🔴 To do
**Bestand:** `src/lib/scan/ScanOrchestrator.ts` - **UITBREIDEN**
```typescript
// TOEVOEGEN aan bestaande ScanOrchestrator class
import { EmailHistoryService } from '../database/historyService.js';
import { AIReportGenerator } from './AIReportGenerator.js';
import type { ScanTier } from '../types/database.js';

export class ScanOrchestrator {
  // BEHOUDEN: Bestaande modules en constructor
  private modules: ScanModule[] = [...]; // Huidige modules
  private emailHistoryService = new EmailHistoryService();
  private aiReportGenerator = new AIReportGenerator(); // NIEUW

  // NIEUWE METHODE: Tier-based scan execution
  async executeTierScan(
    url: string, 
    tier: ScanTier, 
    scanId: string,
    email?: string,
    paymentId?: string
  ): Promise<ScanResult> {
    
    // Verificatie voor betaalde tiers
    if (tier !== 'basic' && (!email || !paymentId)) {
      throw new Error('Email en payment vereist voor betaalde tiers');
    }

    // HERGEBRUIK: Bestaande scan execution
    let result: ScanResult;
    switch (tier) {
      case 'basic':
        result = await this.executeBasicScan(url, scanId);
        break;
      case 'starter':
        result = await this.executeStarterScan(url, scanId);
        break;
      case 'business':
        result = await this.executeBusinessScan(url, scanId); // Phase 3
        break;
      case 'enterprise':
        result = await this.executeEnterpriseScan(url, scanId); // Phase 4
        break;
      default:
        throw new Error(`Tier ${tier} not implemented yet`);
    }

    // Update email historie
    if (email) {
      await this.emailHistoryService.updateUserScanHistory(
        email, 
        scanId, 
        tier,
        this.getTierPrice(tier)
      );
    }

    return { ...result, tier };
  }

  // HERNOEMEN: Bestaande executeScan wordt executeBasicScan
  private async executeBasicScan(url: string, scanId: string): Promise<ScanResult> {
    // BEHOUDEN: Alle bestaande scan logica
    return await this.executeScan(url, scanId); // Huidige implementatie
  }

  // NIEUW: Starter tier execution
  private async executeStarterScan(url: string, scanId: string): Promise<ScanResult> {
    // HERGEBRUIK: Basic scan resultaten
    const basicResults = await this.executeBasicScan(url, scanId);
    
    // TOEVOEGEN: AI report generatie
    const aiReport = await this.aiReportGenerator.generateReport(basicResults);
    
    return {
      ...basicResults,
      tier: 'starter',
      aiReport,
      enhancedRecommendations: aiReport.recommendations
    };
  }

  // NIEUW: Business tier placeholder (Phase 3)
  private async executeBusinessScan(url: string, scanId: string): Promise<ScanResult> {
    throw new Error('Business tier implementation in Phase 3');
  }

  // NIEUW: Enterprise tier placeholder (Phase 4)
  private async executeEnterpriseScan(url: string, scanId: string): Promise<ScanResult> {
    throw new Error('Enterprise tier implementation in Phase 4');
  }

  private getTierPrice(tier: ScanTier): number {
    const prices = { basic: 0, starter: 19.95, business: 49.95, enterprise: 149.95 };
    return prices[tier];
  }
}
```

#### **Stap B: AI Report Generator Service** 🔴 To do
**Bestand:** `src/lib/scan/AIReportGenerator.ts` - **NIEUW**
```typescript
import type { ScanResult, ModuleResult } from './types.js';

export interface AIReport {
  summary: string;
  recommendations: EnhancedRecommendation[];
  implementationPlan: ImplementationStep[];
  estimatedImpact: string;
}

export interface EnhancedRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'complex';
  codeExample?: string;
  estimatedImpact: string;
}

export class AIReportGenerator {
  /**
   * Genereer AI-enhanced rapport voor starter tier
   */
  async generateReport(scanResults: ScanResult): Promise<AIReport> {
    // Phase 2: Pattern-based recommendations (geen LLM calls)
    // Phase 3: Upgrade naar echte AI enhancement
    
    const recommendations = this.generatePatternBasedRecommendations(scanResults.modules);
    const summary = this.generateExecutiveSummary(scanResults);
    const implementationPlan = this.createImplementationPlan(recommendations);
    
    return {
      summary,
      recommendations,
      implementationPlan,
      estimatedImpact: this.calculateEstimatedImpact(recommendations)
    };
  }

  private generatePatternBasedRecommendations(modules: ModuleResult[]): EnhancedRecommendation[] {
    const recommendations: EnhancedRecommendation[] = [];
    
    for (const module of modules) {
      // Transform module findings naar actionable recommendations
      if (module.name === 'TechnicalSEO' && module.score < 80) {
        recommendations.push({
          title: 'Optimaliseer robots.txt voor AI crawlers',
          description: 'Voeg specifieke rules toe voor AI bots zoals ChatGPT',
          priority: 'high',
          difficulty: 'easy',
          codeExample: 'User-agent: ChatGPT-User\nAllow: /',
          estimatedImpact: '+15% AI discoverability'
        });
      }
      
      if (module.name === 'SchemaMarkup' && module.score < 70) {
        recommendations.push({
          title: 'Implementeer FAQ Schema voor AI assistenten',
          description: 'FAQ markup helpt AI assistenten je content beter begrijpen',
          priority: 'high',
          difficulty: 'medium',
          codeExample: this.getFAQSchemaExample(),
          estimatedImpact: '+25% citation kans in AI responses'
        });
      }
    }
    
    return recommendations.slice(0, 8); // Top 8 recommendations
  }

  private generateExecutiveSummary(scanResults: ScanResult): string {
    const score = scanResults.overallScore;
    const issues = scanResults.modules.filter(m => m.score < 70).length;
    
    if (score >= 80) {
      return `Je website scoort uitstekend (${score}/100) voor AI-zoekmachines. Met enkele kleine optimalisaties kun je de AI-citatie kans verder verhogen.`;
    } else if (score >= 60) {
      return `Je website heeft een goede basis (${score}/100) maar ${issues} gebieden kunnen geoptimaliseerd worden voor betere AI-zichtbaarheid.`;
    } else {
      return `Je website heeft significante verbetermogelijkheden (${score}/100). Focus op de ${issues} prioritaire aanbevelingen voor maximale impact.`;
    }
  }

  private getFAQSchemaExample(): string {
    return `{
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Wat doet jullie bedrijf?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Concrete, citeerbare beschrijving van je diensten"
    }
  }]
}`;
  }
}
```

### **2.2 API Endpoints Restructuur**

#### **Stap A: Anonymous → Basic Hernoemen** 🔴 To do
**Bestand:** `src/routes/api/scan/basic/+server.ts` - **NIEUW**
```typescript
// NIEUWE basic endpoint (copy van anonymous logica)
import { json } from '@sveltejs/kit';
import { ScanOrchestrator } from '$lib/scan/ScanOrchestrator.js';

const scanOrchestrator = new ScanOrchestrator();

export async function POST({ request }) {
  try {
    const { url, email } = await request.json();
    
    if (!url) {
      return json({ error: 'URL is verplicht' }, { status: 400 });
    }

    // Generate scan ID
    const scanId = crypto.randomUUID();
    
    // NIEUWE AANROEP: Tier-based scan
    const result = await scanOrchestrator.executeTierScan(
      url, 
      'basic', 
      scanId,
      email // Optioneel voor basic tier
    );

    return json({
      scanId,
      ...result,
      tier: 'basic'
    });

  } catch (error) {
    console.error('Basic scan failed:', error);
    return json({ 
      error: 'Scan mislukt', 
      details: error.message 
    }, { status: 500 });
  }
}
```

**Bestand:** `src/routes/api/scan/anonymous/+server.ts` - **DEPRECATED WRAPPER**
```typescript
// DEPRECATED: Wrapper voor backwards compatibility
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  console.warn('DEPRECATED: /api/scan/anonymous - gebruik /api/scan/basic');
  
  // Forward naar nieuwe basic endpoint
  const body = await request.json();
  
  const response = await fetch('/api/scan/basic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  return response;
}
```

#### **Stap B: Starter Tier Endpoint** 🟢 Done
**Bestand:** `src/routes/api/scan/starter/+server.ts` - **NIEUW**
```typescript
import { json } from '@sveltejs/kit';
import { ScanOrchestrator } from '$lib/scan/ScanOrchestrator.js';

const scanOrchestrator = new ScanOrchestrator();

export async function POST({ request }) {
  try {
    const { url, email, paymentId } = await request.json();
    
    // Validatie voor starter tier
    if (!url || !email || !paymentId) {
      return json({ 
        error: 'URL, email en paymentId zijn verplicht voor starter tier' 
      }, { status: 400 });
    }

    // TODO: Verificeer payment met Mollie (Phase 2.3)
    
    const scanId = crypto.randomUUID();
    
    const result = await scanOrchestrator.executeTierScan(
      url, 
      'starter', 
      scanId,
      email,
      paymentId
    );

    return json({
      scanId,
      ...result,
      tier: 'starter'
    });

  } catch (error) {
    console.error('Starter scan failed:', error);
    return json({ 
      error: 'Starter scan mislukt', 
      details: error.message 
    }, { status: 500 });
  }
}
```

#### **Stap C: Business Tier Endpoint** 🔴 To do
**Bestand:** `src/routes/api/scan/business/+server.ts` - **NIEUW**
```typescript
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  // Placeholder voor Phase 3
  return json({ 
    error: 'Business tier wordt geïmplementeerd in Phase 3' 
  }, { status: 501 });
}
```

#### **Stap D: Enterprise Tier Endpoint** 🔴 To do
**Bestand:** `src/routes/api/scan/enterprise/+server.ts` - **NIEUW**
```typescript
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  // Placeholder voor Phase 4
  return json({ 
    error: 'Enterprise tier wordt geïmplementeerd in Phase 4',
    fallbackSuggestion: 'Gebruik business of starter tier voor nu'
  }, { status: 501 });
}
```

### **2.3 Email Marketing Foundation**

#### **Email Marketing Service** 🔴 To do
**Bestand:** `src/lib/email/marketingService.ts` - **NIEUW**
```typescript
import { EmailHistoryService } from '../database/historyService.js';
import { emailSender } from './sender.js'; // Bestaande email infrastructure
import type { ScanResult, ScanTier } from '../types/database.js';

export class EmailMarketingService {
  private emailHistoryService = new EmailHistoryService();

  /**
   * Trigger post-scan email flows
   */
  async triggerPostScanFlow(
    email: string, 
    tier: ScanTier, 
    result: ScanResult
  ): Promise<void> {
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
    history: any
  ): Promise<void> {
    const isReturningUser = history && history.total_scans > 1;
    
    const templateData = {
      score: result.overallScore,
      topIssues: this.getTopIssues(result),
      upgradeDiscount: isReturningUser ? 0.2 : 0.1,
      isReturningUser
    };

    await emailSender.sendScanResults({
      email,
      templateData,
      tier: 'basic'
    });
  }

  private async sendStarterScanEmail(email: string, result: ScanResult): Promise<void> {
    const templateData = {
      score: result.overallScore,
      pdfUrl: result.pdfUrl,
      aiReport: result.aiReport,
      businessUpgradeOffer: true
    };

    await emailSender.sendScanResults({
      email,
      templateData, 
      tier: 'starter'
    });
  }

  private getTopIssues(result: ScanResult): any[] {
    return result.modules
      .filter(m => m.score < 70)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(m => ({
        title: m.name,
        score: m.score,
        recommendation: m.findings[0]?.title || 'Optimalisatie mogelijk'
      }));
  }
}
```

#### **Email Templates Uitbreiden** 🔴 To do
**Bestand:** `src/lib/email/templates.ts` - **UITBREIDEN**
```typescript
// TOEVOEGEN aan bestaande templates
export const tierBasedTemplates = {
  'basic-scan-first-time': {
    subject: '🎉 Je AI-scan is klaar! Score: {{score}}/100',
    html: `
      <h1>Welkom bij AIO-Scanner!</h1>
      <p>Je website scoort <strong>{{score}}/100</strong> voor AI-assistenten.</p>
      
      <h2>Top 3 verbeterpunten:</h2>
      {{#each topIssues}}
        <div class="issue">
          <h3>{{this.title}} ({{this.score}}/100)</h3>
          <p>{{this.recommendation}}</p>
        </div>
      {{/each}}
      
      <div class="upgrade-cta">
        <h3>Wil je de volledige gids?</h3>
        <p>Upgrade naar Starter voor €19,95 en krijg:</p>
        <ul>
          <li>✅ AI-gegenereerde implementatiegids</li>
          <li>✅ Code voorbeelden en stappen</li>
          <li>✅ Impact voorspellingen per fix</li>
        </ul>
        <a href="{{upgradeUrl}}" class="cta-button">Upgrade Nu</a>
      </div>
    `
  },
  
  'basic-scan-returning-user': {
    subject: '🔄 Je {{totalScans}}e scan is klaar - speciale upgrade aanbieding!',
    html: `
      <h1>Hallo weer!</h1>
      <p>Dit is je <strong>{{totalScans}}e scan</strong>. Je website scoort nu {{score}}/100.</p>
      
      <div class="special-offer">
        <h2>🎁 Trouwe gebruiker korting!</h2>
        <p>{{upgradeDiscount}}% korting op Starter Pack!</p>
        <p>Normaal €19,95 → Nu <strong>€{{discountedPrice}}</strong></p>
        <a href="{{upgradeUrl}}" class="cta-button">Claim {{upgradeDiscount}}% Korting</a>
      </div>
    `
  },

  'starter-scan-complete': {
    subject: '📊 Je Starter rapport is klaar - inclusief AI-gids!',
    html: `
      <h1>Je uitgebreide AI-rapport is klaar!</h1>
      <p>Score: <strong>{{score}}/100</strong></p>
      
      <div class="report-download">
        <a href="{{pdfUrl}}" class="download-button">📥 Download Volledig PDF</a>
      </div>
      
      <h2>🤖 AI-Gegenereerde Insights:</h2>
      <p>{{aiReport.summary}}</p>
      
      {{#if businessUpgradeOffer}}
      <div class="business-upgrade">
        <h3>Klaar voor meer?</h3>
        <p>Business tier bevat LLM-analyse en authority enhancement.</p>
        <a href="{{businessUpgradeUrl}}">Upgrade naar Business</a>
      </div>
      {{/if}}
    `
  }
};
```

### **2.4 Backwards Compatibility**

#### **Deprecation Logging** 🔴 To do
**Bestand:** `src/lib/monitoring/deprecationTracker.ts` - **NIEUW**
```typescript
import { supabase } from '../supabase.js';

export class DeprecationTracker {
  static async logUsage(
    endpoint: string, 
    userAgent?: string, 
    ip?: string
  ): Promise<void> {
    try {
      await supabase.from('deprecated_usage_log').insert({
        endpoint,
        user_agent: userAgent,
        ip_address: ip,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to log deprecated usage:', error);
    }
  }

  static warn(message: string): void {
    console.warn(`DEPRECATED: ${message}`);
  }
}
```

**Database table voor tracking:**
```sql
-- TOEVOEGEN aan Phase 1 database migratie
CREATE TABLE IF NOT EXISTS public.deprecated_usage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  user_agent text,
  ip_address text,
  timestamp timestamp with time zone DEFAULT now()
);
```

---

## ✅ DEFINITION OF DONE

- [ ] ScanOrchestrator uitgebreid met tier-based execution
- [ ] AI Report Generator geïmplementeerd voor starter tier
- [ ] Basic, starter en business API endpoints werkend
- [ ] Email marketing foundation geïmplementeerd
- [ ] Backwards compatibility behouden voor oude endpoints
- [ ] Deprecation logging actief voor monitoring
- [ ] Alle tests passed voor nieuwe functionaliteit
- [ ] Email templates uitgebreid met tier-specific content
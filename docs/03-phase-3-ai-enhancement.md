# Phase 3: AI Enhancement Services - AIO Scanner Refactor

> **🔧 REFACTOR CONTEXT:** Implementeren van LLM-enhanced analyse voor business tier. Uitbreiden van bestaande ContentExtractor en toevoegen van echte AI insights voor premium differentiatie.

---

## 📊 **Fase Status & Voortgang**

| Sub-fase | Taak | Status | Tijdsinschatting | Opmerkingen |
|----------|------|--------|------------------|-------------|
| **3.1 Enhanced Content Extraction** | Authority signal detection | 🔴 To do | 75 min | Smart pattern recognition voor AI-citatie |
| | Content quality assessment | 🔴 To do | 45 min | Temporal claims en vague statements |
| | Missed opportunity identifier | 🔴 To do | 60 min | Gap analysis voor AI optimization |
| **3.2 LLM Enhancement Service** | Vertex AI client setup | 🔴 To do | 30 min | Google Cloud integration |
| | Prompt engineering | 🔴 To do | 45 min | AI-specific optimization prompts |
| | Response parsing | 🔴 To do | 30 min | Structured insights extraction |
| | Cost monitoring | 🔴 To do | 20 min | Budget controls en fallbacks |
| **3.3 Business Tier Implementation** | Hybrid scan orchestration | 🔴 To do | 60 min | Pattern + LLM combination |
| | Before/after examples | 🔴 To do | 45 min | Concrete improvement suggestions |
| | Implementation prioritization | 🔴 To do | 30 min | Impact-based ranking |
| **3.4 Integration & Testing** | Phase 2 ScanOrchestrator integratie | 🔴 To do | 30 min | Business tier endpoint activeren |
| | Error handling & fallbacks | 🔴 To do | 45 min | Graceful degradation |
| | Cost validation | 🔴 To do | 15 min | LLM usage monitoring |

**Totale tijd:** ~7 uur  
**Dependencies:** Phase 2 tier system, Google Vertex AI access  
**Next Phase:** Phase 4 (Frontend Enhancement)

**Status Legenda:**
- 🔴 To do - Nog niet gestart
- 🟡 In Progress - Bezig met implementatie  
- 🟢 Done - Voltooid en getest
- ⚪ Blocked - Wacht op dependency

---

## ⚠️ VEILIGE REFACTOR REGELS

### **BESTAANDE MODULES - HERGEBRUIKEN:**
✅ **BASIS BLIJFT HETZELFDE:**
- `src/lib/scan/ContentExtractor.ts` - Uitbreiden, niet vervangen
- `src/lib/scan/modules/*.ts` - Alle bestaande modules blijven werkend
- `src/lib/scan/types.ts` - Uitbreiden met nieuwe interfaces

### **ENHANCEMENT STRATEGY:**
🔄 **HYBRID APPROACH:**
- Pattern-based analysis (bestaand) + LLM insights (nieuw)
- Bestaande modules leveren input voor LLM enhancement
- Fallback naar pattern-only als LLM faalt
- Cost-controlled AI usage met caching

### **COST MANAGEMENT:**
💰 **BUDGET CONTROLS:**
- Max €0.10 per business scan (strict limit)
- Caching van vergelijkbare content analysis
- Graceful degradation naar starter tier bij budget overschrijding
- Real-time cost monitoring

---

## 📁 BESTAANDE CODE ANALYSE

### **Huidige ContentExtractor (uit project tree):**
```typescript
// src/lib/scan/ContentExtractor.ts - BESTAANDE FUNCTIONALITEIT
class ContentExtractor {
  // BEHOUDEN: Basis content extraction
  async extractContent(html: string): Promise<ExtractedContent> {
    // FAQ detection, heading structure, meta data
    // Schema markup parsing
    // Basic content analysis
  }
}
```

### **Bestaande Scan Modules:**
```
src/lib/scan/modules/
├── TechnicalSEOModule.ts    # HERGEBRUIKEN als input voor LLM
├── SchemaMarkupModule.ts    # HERGEBRUIKEN als input voor LLM  
├── AIContentModule.ts       # HERGEBRUIKEN als input voor LLM
└── AICitationModule.ts      # HERGEBRUIKEN als input voor LLM
```

---

## 🔧 TECHNISCHE IMPLEMENTATIE

### **3.1 Enhanced Content Extraction**

#### **Stap A: Authority Signal Detection** 🔴 To do
**Bestand:** `src/lib/scan/ContentExtractor.ts` - **UITBREIDEN**
```typescript
// TOEVOEGEN aan bestaande ContentExtractor class
export interface AuthoritySignal {
  type: 'temporal_authority' | 'experience_years' | 'established_year' | 'family_business' | 'certification' | 'award';
  value: string | number;
  context: string;
  location: string;
  confidence: number;
}

export interface EnhancedContent extends ExtractedContent {
  // BEHOUDEN: Alle bestaande properties
  
  // NIEUW: Authority signals
  authoritySignals: AuthoritySignal[];
  timeBasedClaims: TimeBasedClaim[];
  qualityClaims: QualityClaim[];
  missedOpportunities: MissedOpportunity[];
}

// TOEVOEGEN aan bestaande class
async extractEnhancedContent(html: string): Promise<EnhancedContent> {
  // HERGEBRUIK: Bestaande content extraction
  const basicContent = await this.extractContent(html);
  
  // NIEUW: Enhanced pattern detection
  const authoritySignals = this.detectAuthoritySignals(html);
  const timeBasedClaims = this.detectTemporalClaims(html);
  const qualityClaims = this.detectQualityClaims(html);
  const missedOpportunities = this.identifyMissedOpportunities(html, basicContent);
  
  return {
    ...basicContent,
    authoritySignals,
    timeBasedClaims,
    qualityClaims,
    missedOpportunities
  };
}

private detectAuthoritySignals(html: string): AuthoritySignal[] {
  const signals: AuthoritySignal[] = [];
  const text = this.stripHtml(html);
  
  // Experience years pattern
  const experiencePattern = /(\d+)\+?\s*jaar\s*(ervaring|actief|bezig)/gi;
  let match;
  while ((match = experiencePattern.exec(text)) !== null) {
    signals.push({
      type: 'experience_years',
      value: parseInt(match[1]),
      context: match[0],
      location: 'body_text',
      confidence: 0.8
    });
  }
  
  // Established year
  const establishedPattern = /sinds\s*(\d{4})|opgericht\s*in\s*(\d{4})|established\s*(\d{4})/gi;
  while ((match = establishedPattern.exec(text)) !== null) {
    const year = parseInt(match[1] || match[2] || match[3]);
    if (year > 1900 && year <= new Date().getFullYear()) {
      signals.push({
        type: 'established_year',
        value: year,
        context: match[0],
        location: 'body_text',
        confidence: 0.9
      });
    }
  }
  
  // Family business indicators
  const familyPattern = /familiebedrijf|family\s*business|generaties|vader\s*en\s*zoon/gi;
  while ((match = familyPattern.exec(text)) !== null) {
    signals.push({
      type: 'family_business',
      value: true,
      context: match[0],
      location: 'body_text',
      confidence: 0.7
    });
  }
  
  return signals;
}

private detectTemporalClaims(html: string): TimeBasedClaim[] {
  const claims: TimeBasedClaim[] = [];
  const text = this.stripHtml(html);
  
  // Vague temporal claims die beter kunnen
  const vaguePatterns = [
    /een\s*eeuw\s*lang/gi,
    /jarenlange?\s*ervaring/gi,
    /vele\s*jaren/gi,
    /lange\s*tijd/gi
  ];
  
  vaguePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      claims.push({
        type: 'vague_temporal',
        claim: match[0],
        suggestion: 'Vervang met specifiek aantal jaren',
        improvementImpact: 'high',
        context: this.getContext(text, match.index, 50)
      });
    }
  });
  
  return claims;
}

private detectQualityClaims(html: string): QualityClaim[] {
  const claims: QualityClaim[] = [];
  const text = this.stripHtml(html);
  
  // Vague quality claims
  const vagueQualityPatterns = [
    /heel\s*(goed|erg\s*goed)/gi,
    /beste\s*(kwaliteit|service)/gi,
    /uitstekende?\s*(service|kwaliteit)/gi,
    /hoogste\s*kwaliteit/gi
  ];
  
  vagueQualityPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      claims.push({
        type: 'vague_quality',
        claim: match[0],
        suggestion: 'Onderbouw met concrete data, certificeringen of reviews',
        improvementImpact: 'high',
        context: this.getContext(text, match.index, 100)
      });
    }
  });
  
  return claims;
}
```

### **3.2 LLM Enhancement Service**

#### **Stap A: Vertex AI Client Setup** 🔴 To do
**Bestand:** `src/lib/ai/vertexClient.ts` - **NIEUW**
```typescript
import { VertexAI } from '@google-cloud/vertexai';

export class VertexAIClient {
  private vertex: VertexAI;
  private model: any;
  private costTracker: CostTracker;

  constructor() {
    this.vertex = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: 'europe-west4' // EU region voor GDPR
    });
    
    // Cost-effective model voor MVP
    this.model = this.vertex.getGenerativeModel({
      model: 'gemini-1.5-flash-001',
      generationConfig: {
        maxOutputTokens: 1000, // Budget control
        temperature: 0.3 // Consistency over creativity
      }
    });
    
    this.costTracker = new CostTracker(0.10); // Max €0.10 per scan
  }

  async generateInsights(
    moduleResults: ModuleResult[], 
    enhancedContent: EnhancedContent
  ): Promise<AIInsights> {
    
    // Cost check vooraf
    if (!await this.costTracker.canAffordRequest()) {
      throw new Error('BUDGET_EXCEEDED');
    }
    
    const prompt = this.buildOptimizationPrompt(moduleResults, enhancedContent);
    
    try {
      const startTime = Date.now();
      const result = await this.model.generateContent(prompt);
      const duration = Date.now() - startTime;
      
      // Log cost
      await this.costTracker.recordRequest(duration, prompt.length);
      
      return this.parseInsights(result.response.text());
      
    } catch (error) {
      console.error('Vertex AI call failed:', error);
      throw new Error('AI_ENHANCEMENT_FAILED');
    }
  }

  private buildOptimizationPrompt(
    moduleResults: ModuleResult[], 
    enhancedContent: EnhancedContent
  ): string {
    return `
Analyseer deze website voor AI-assistant optimalisatie:

SCAN RESULTATEN:
${JSON.stringify(moduleResults, null, 2)}

AUTHORITY SIGNALS:
${JSON.stringify(enhancedContent.authoritySignals, null, 2)}

VAGE CLAIMS GEDETECTEERD:
${JSON.stringify(enhancedContent.timeBasedClaims.concat(enhancedContent.qualityClaims), null, 2)}

TAAK:
Geef specifieke, implementeerbare verbeteringen die:
1. Vage claims transformeren naar citeerbare feiten
2. Gemiste autoriteit signalen identificeren
3. Concrete voor/na voorbeelden geven
4. Focussen op AI-citatie verbetering

RESPONSE FORMAT (JSON):
{
  "missedOpportunities": [
    {
      "title": "Concrete titel",
      "description": "Wat er mist",
      "solution": "Exacte implementatie",
      "beforeExample": "Huidige tekst",
      "afterExample": "Verbeterde tekst",
      "impactScore": 1-10,
      "difficulty": "easy|medium|complex"
    }
  ],
  "authorityEnhancements": [...],
  "citabilityImprovements": [...],
  "implementationPriority": ["hoogste prioriteit eerst"]
}

Geef maximaal 5 concrete verbeteringen. Focus op impact voor AI-assistenten.
`;
  }

  private parseInsights(response: string): AIInsights {
    try {
      // Parse JSON response van AI
      const parsed = JSON.parse(response);
      
      return {
        missedOpportunities: parsed.missedOpportunities || [],
        authorityEnhancements: parsed.authorityEnhancements || [],
        citabilityImprovements: parsed.citabilityImprovements || [],
        implementationPriority: parsed.implementationPriority || [],
        generatedAt: new Date().toISOString(),
        confidence: this.calculateConfidence(parsed)
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      // Fallback naar empty insights
      return this.getEmptyInsights();
    }
  }
}
```

#### **Stap B: Cost Monitoring** 🔴 To do
**Bestand:** `src/lib/ai/costTracker.ts` - **NIEUW**
```typescript
export class CostTracker {
  private maxBudgetPerScan: number;
  private currentScanCost: number = 0;
  
  constructor(maxBudget: number) {
    this.maxBudgetPerScan = maxBudget;
  }

  async canAffordRequest(): Promise<boolean> {
    return this.currentScanCost < this.maxBudgetPerScan;
  }

  async recordRequest(durationMs: number, inputTokens: number): Promise<void> {
    // Gemini 1.5 Flash pricing (ongeveer)
    const inputCost = (inputTokens / 1000) * 0.000075; // €0.000075 per 1K tokens
    const outputCost = 0.0001; // Estimate voor output
    
    const requestCost = inputCost + outputCost;
    this.currentScanCost += requestCost;
    
    // Log voor monitoring
    console.log(`AI Request cost: €${requestCost.toFixed(6)}, Total scan cost: €${this.currentScanCost.toFixed(6)}`);
    
    // Alert bij hoge kosten
    if (this.currentScanCost > this.maxBudgetPerScan * 0.8) {
      console.warn(`Approaching budget limit: €${this.currentScanCost.toFixed(4)}`);
    }
  }

  reset(): void {
    this.currentScanCost = 0;
  }

  getCurrentCost(): number {
    return this.currentScanCost;
  }
}
```

### **3.3 Business Tier Implementation**

#### **Stap A: LLM Enhancement Service** 🔴 To do
**Bestand:** `src/lib/scan/LLMEnhancementService.ts` - **NIEUW**
```typescript
import { VertexAIClient } from '../ai/vertexClient.js';
import type { ModuleResult, EnhancedContent } from './types.js';

export interface AIInsights {
  missedOpportunities: MissedOpportunity[];
  authorityEnhancements: AuthorityEnhancement[];
  citabilityImprovements: CitabilityImprovement[];
  implementationPriority: string[];
  generatedAt: string;
  confidence: number;
}

export class LLMEnhancementService {
  private vertexClient: VertexAIClient;
  private cache: Map<string, AIInsights> = new Map();

  constructor() {
    this.vertexClient = new VertexAIClient();
  }

  async enhanceFindings(
    moduleResults: ModuleResult[], 
    enhancedContent: EnhancedContent
  ): Promise<AIInsights> {
    
    // Check cache eerst (cost optimization)
    const cacheKey = this.generateCacheKey(moduleResults, enhancedContent);
    if (this.cache.has(cacheKey)) {
      console.log('Using cached AI insights');
      return this.cache.get(cacheKey)!;
    }

    try {
      // LLM enhancement
      const insights = await this.vertexClient.generateInsights(moduleResults, enhancedContent);
      
      // Cache resultaat
      this.cache.set(cacheKey, insights);
      
      return insights;
      
    } catch (error) {
      if (error.message === 'BUDGET_EXCEEDED') {
        console.warn('AI budget exceeded, falling back to pattern-based insights');
        return this.getFallbackInsights(moduleResults, enhancedContent);
      }
      
      if (error.message === 'AI_ENHANCEMENT_FAILED') {
        console.warn('AI enhancement failed, falling back to pattern-based insights');
        return this.getFallbackInsights(moduleResults, enhancedContent);
      }
      
      throw error;
    }
  }

  private getFallbackInsights(
    moduleResults: ModuleResult[], 
    enhancedContent: EnhancedContent
  ): AIInsights {
    // Pattern-based insights als fallback
    const insights: AIInsights = {
      missedOpportunities: [],
      authorityEnhancements: [],
      citabilityImprovements: [],
      implementationPriority: [],
      generatedAt: new Date().toISOString(),
      confidence: 0.6 // Lower confidence voor pattern-based
    };

    // Transform detected issues naar actionable insights
    enhancedContent.timeBasedClaims.forEach(claim => {
      insights.missedOpportunities.push({
        title: `Maak temporele claim specifiek: "${claim.claim}"`,
        description: 'Vage tijdsaanduiding vermindert AI-citatie kans',
        solution: claim.suggestion,
        beforeExample: claim.claim,
        afterExample: this.generateSpecificExample(claim.claim),
        impactScore: 8,
        difficulty: 'easy'
      });
    });

    enhancedContent.qualityClaims.forEach(claim => {
      insights.citabilityImprovements.push({
        title: `Onderbouw kwaliteitsclaim: "${claim.claim}"`,
        description: 'Subjectieve claims zijn niet citeerbaar voor AI',
        solution: claim.suggestion,
        beforeExample: claim.claim,
        afterExample: 'Gecertificeerd door [certificaat] met 4.8/5 klantbeoordeling',
        impactScore: 9,
        difficulty: 'medium'
      });
    });

    return insights;
  }

  private generateCacheKey(moduleResults: ModuleResult[], enhancedContent: EnhancedContent): string {
    const keyData = {
      scores: moduleResults.map(m => ({ name: m.name, score: m.score })),
      authorityCount: enhancedContent.authoritySignals.length,
      claimsCount: enhancedContent.timeBasedClaims.length + enhancedContent.qualityClaims.length
    };
    return Buffer.from(JSON.stringify(keyData)).toString('base64').substring(0, 32);
  }
}
```

#### **Stap B: Hybrid Scan Implementation** 🔴 To do
**Bestand:** `src/lib/scan/ScanOrchestrator.ts` - **UITBREIDEN**
```typescript
// TOEVOEGEN aan bestaande ScanOrchestrator (Phase 2)
import { LLMEnhancementService } from './LLMEnhancementService.js';

// TOEVOEGEN aan constructor
private llmEnhancementService = new LLMEnhancementService();

// IMPLEMENTEREN: Business tier execution (was placeholder in Phase 2)
private async executeBusinessScan(url: string, scanId: string): Promise<ScanResult> {
  console.log('🚀 Starting business tier hybrid scan...');
  
  try {
    // 1. Enhanced content extraction
    const html = await this.contentFetcher.fetchContent(url);
    const enhancedContent = await this.contentExtractor.extractEnhancedContent(html);
    
    // 2. Run existing pattern modules (hergebruik Phase 1-2)
    const basicModules = await this.runModulesParallel(url, html, scanId);
    
    // 3. LLM enhancement layer
    const llmInsights = await this.llmEnhancementService.enhanceFindings(
      basicModules, 
      enhancedContent
    );
    
    // 4. Calculate hybrid score
    const hybridScore = this.calculateHybridScore(basicModules, llmInsights);
    
    return {
      scanId,
      url,
      modules: basicModules,
      overallScore: hybridScore,
      enhancedContent,
      llmInsights,
      tier: 'business',
      completedAt: new Date().toISOString(),
      costTracking: {
        aiCost: this.llmEnhancementService.getCurrentCost?.() || 0,
        scanDuration: Date.now() - this.scanStartTime
      }
    };
    
  } catch (error) {
    console.error('Business scan failed:', error);
    
    // Graceful degradation naar starter tier
    console.log('⬇️ Falling back to starter tier...');
    return await this.executeStarterScan(url, scanId);
  }
}

private calculateHybridScore(modules: ModuleResult[], insights: AIInsights): number {
  // Basis score van modules
  const baseScore = modules.reduce((sum, m) => sum + m.score, 0) / modules.length;
  
  // Bonus voor LLM insights kwaliteit
  const insightBonus = Math.min(10, insights.missedOpportunities.length * 2);
  
  // Penalty voor low confidence
  const confidencePenalty = insights.confidence < 0.8 ? 5 : 0;
  
  return Math.round(Math.min(100, baseScore + insightBonus - confidencePenalty));
}
```

### **3.4 Integration & Testing**

#### **Error Handling & Fallbacks** 🔴 To do
**Bestand:** `src/lib/scan/errorHandling.ts` - **NIEUW**
```typescript
export class BusinessTierErrorHandler {
  static async handleAIFailure(
    error: Error, 
    fallbackFunction: () => Promise<any>
  ): Promise<any> {
    
    console.error('Business tier AI failure:', error.message);
    
    // Log voor monitoring
    await this.logAIFailure(error);
    
    // Determine fallback strategy
    if (error.message === 'BUDGET_EXCEEDED') {
      console.log('🔄 Budget exceeded, falling back to starter tier');
      return await fallbackFunction();
    }
    
    if (error.message === 'AI_ENHANCEMENT_FAILED') {
      console.log('🔄 AI enhancement failed, using pattern-based insights');
      return await fallbackFunction();
    }
    
    // Unknown error - still fallback
    console.log('🔄 Unknown error, falling back gracefully');
    return await fallbackFunction();
  }
  
  private static async logAIFailure(error: Error): Promise<void> {
    // Log naar monitoring systeem
    console.warn('AI_FAILURE_LOG:', {
      error: error.message,
      timestamp: new Date().toISOString(),
      tier: 'business'
    });
  }
}
```

#### **Business Tier API Endpoint Activatie** 🔴 To do
**Bestand:** `src/routes/api/scan/business/+server.ts` - **VERVANGEN PLACEHOLDER**
```typescript
// VERVANG Phase 2 placeholder implementatie
import { json } from '@sveltejs/kit';
import { ScanOrchestrator } from '$lib/scan/ScanOrchestrator.js';

const scanOrchestrator = new ScanOrchestrator();

export async function POST({ request }) {
  try {
    const { url, email, paymentId } = await request.json();
    
    // Validatie voor business tier
    if (!url || !email || !paymentId) {
      return json({ 
        error: 'URL, email en paymentId zijn verplicht voor business tier' 
      }, { status: 400 });
    }

    // TODO: Verificeer payment met Mollie
    
    const scanId = crypto.randomUUID();
    
    const result = await scanOrchestrator.executeTierScan(
      url, 
      'business', 
      scanId,
      email,
      paymentId
    );

    return json({
      scanId,
      ...result,
      tier: 'business'
    });

  } catch (error) {
    console.error('Business scan failed:', error);
    return json({ 
      error: 'Business scan mislukt', 
      details: error.message 
    }, { status: 500 });
  }
}
```

---

## ✅ DEFINITION OF DONE

- [ ] Enhanced ContentExtractor met authority signal detection
- [ ] LLMEnhancementService werkend met Vertex AI
- [ ] Cost monitoring en budget controls actief
- [ ] Hybrid scan combineert pattern + AI insights
- [ ] Business tier volledig geïmplementeerd
- [ ] Graceful degradation bij AI failures
- [ ] Before/after voorbeelden in AI output
- [ ] Error handling getest en werkend
- [ ] Cost per scan onder €0.10 budget
- [ ] Fallback naar starter tier bij problemen
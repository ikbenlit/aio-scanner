# Refactoring Prompt Management

**Datum:** 2025-07-11  
**Auteur:** Gemini  
**Bijgewerkt:** Na refinement + finale besprekingen

## Hoofddoelen
1. **Gecentraliseerd prompt management** via Strategy Pattern
2. **ScanOrchestrator lichter maken** (-130 regels enterprise prompt-logica)
3. **Maximaal hergebruik bestaande codebase** (copy-first strategie)
4. **SOC & DRY principes** strikt bewaken

## Implementatie-overzicht

| Fase | Subfase | Beschrijving | Status | Hergebruik |
|------|---------|--------------|--------|------------|
| 1 | 1.1 | Directory-structuur + shared helpers | ✅ DONE | 0% (nieuw) |
| 1 | 1.2 | Interface `PromptStrategy` + `BasePromptStrategy` | ✅ DONE | 0% (nieuw) |
| 1 | 1.3 | Token-limiet helper (`prompts/shared/`) | ✅ DONE | 0% (nieuw) |
| 1 | 1.4 | `PromptHelpers.ts` voor DRY (JSON format, headers) | ⬜ TODO | 0% (nieuw) |
| 2 | 2.1 | **COPY** `vertexClient` prompts → strategies | ⬜ TODO | 95% (copy) |
| 2 | 2.2 | **COPY** `ScanOrchestrator` enterprise → strategy | ⬜ TODO | 95% (copy) |
| 2 | 2.3 | Snapshot-tests voor alle copied prompts | ⬜ TODO | 30% (pattern) |
| 3 | 3.1 | Registry-based `PromptFactory` + auto-registratie | ⬜ TODO | 30% (pattern) |
| 4 | 4.1 | **EXTEND** `vertexClient` met method overloads | ⬜ TODO | 80% (extend) |
| 4 | 4.2 | **UPDATE** tier strategies → PromptFactory | ⬜ TODO | 80% (minimal) |
| 4 | 4.3 | **UPDATE** LLMEnhancementService → PromptFactory | ⬜ TODO | 80% (minimal) |
| 5 | 5.1 | Legacy code verwijderen (na 1 release) | ⬜ TODO | 90% (cleanup) |
| 5 | 5.2 | Regression tests + QA validatie | ⬜ TODO | 90% (extend) |

## 1. Probleemstelling

Momenteel zijn de prompt-strings die naar de Vertex AI API worden gestuurd op twee verschillende locaties in de codebase gedefinieerd:

1.  `src/lib/ai/vertexClient.ts`: Bevat de prompts voor het genereren van `AIInsights` en `NarrativeReport`.
2.  `src/lib/scan/ScanOrchestrator.ts`: Bevat een complexe prompt voor het genereren van een strategisch rapport voor de *Enterprise Tier*.

Deze aanpak heeft een aantal nadelen:

-   **Schending van het Single Responsibility Principle (SRP):** De `vertexClient` en `ScanOrchestrator` zijn nu verantwoordelijk voor zowel hun kernlogica (API-communicatie, orkestratie) als voor het samenstellen van complexe prompts.
-   **Onderhoudbaarheid:** Het is lastig om prompts te beheren, te vergelijken en te versioneren als ze verspreid zijn over de codebase.
-   **Complexiteit:** De `ScanOrchestrator` wordt onnodig zwaar en complex door de aanwezigheid van een grote, ingebedde prompt-string (130+ regels).
-   **Schaalbaarheid:** Het toevoegen van nieuwe AI-gestuurde features of rapporttypes vereist het aanpassen van bestaande, complexe klassen.

## 2. Voorgestelde Oplossing: Gecentraliseerd Prompt Management

### 2.1. Nieuwe Directory Structuur (Copy-first Approach)

```
src/
└── lib/
    └── ai/
        ├── prompts/
        │   ├── PromptStrategy.ts           # Interface + BasePromptStrategy
        │   ├── InsightsPromptStrategy.ts   # Copy van vertexClient.buildInsightsPrompt
        │   ├── NarrativePromptStrategy.ts  # Copy van vertexClient.buildNarrativePrompt
        │   ├── EnterprisePromptStrategy.ts # Copy van ScanOrchestrator enterprise logic
        │   ├── PromptFactory.ts            # Registry-based factory
        │   ├── shared/
        │   │   ├── PromptHelpers.ts        # DRY: JSON formatting, headers
        │   │   ├── TokenLimiter.ts         # Token counting + context trimming
        │   │   └── index.ts                # Barrel exports
        │   └── __tests__/
        │       ├── fixtures/               # Test data voor snapshot tests
        │       └── *.test.ts               # Strategy unit tests
        └── vertexClient.ts                 # Extended met method overloads
```

### 2.2. Concrete Interface Definitie (Vastgesteld)

```typescript
// PromptStrategy.ts
export interface PromptInput {
  // Core data (altijd beschikbaar)
  moduleResults?: ModuleResult[];
  enhancedContent?: EnhancedContent;
  url?: string;
  
  // Contextual data (per prompt-type)
  insights?: AIInsights;           // Voor narrative prompts
  enterpriseFeatures?: {           // Voor enterprise prompts
    multiPageAnalysis?: any[];
    siteWidePatterns?: any;
    competitiveContext?: any;
    industryBenchmark?: any;
  };
  
  // Extensie voor toekomst
  extras?: Record<string, unknown>;
}

export interface PromptStrategy {
  buildPrompt(data: PromptInput): string;
}

export abstract class BasePromptStrategy implements PromptStrategy {
  protected tokenLimiter = new TokenLimiter(12000); // 12k token limit
  protected helpers = PromptHelpers;
  
  abstract buildPrompt(data: PromptInput): string;
  
  protected formatJSON(obj: any): string {
    return this.helpers.formatJSON(obj);
  }
}
```

### 2.3. Registry-based Factory (Vastgesteld)

```typescript
// PromptFactory.ts
export type PromptType = 'insights' | 'narrative' | 'enterprise';

export class PromptFactory {
  private static registry = new Map<PromptType, () => PromptStrategy>();
  
  static register(type: PromptType, creator: () => PromptStrategy): void {
    this.registry.set(type, creator);
  }
  
  static create(type: PromptType): PromptStrategy {
    const creator = this.registry.get(type);
    if (!creator) {
      throw new Error(`Unknown prompt type: ${type}. Available: ${Array.from(this.registry.keys()).join(', ')}`);
    }
    return creator();
  }
  
  static getRegisteredTypes(): PromptType[] {
    return Array.from(this.registry.keys());
  }
}

// Auto-registratie in strategy files:
// InsightsPromptStrategy.ts:
PromptFactory.register('insights', () => new InsightsPromptStrategy());

// NarrativePromptStrategy.ts:
PromptFactory.register('narrative', () => new NarrativePromptStrategy());

// EnterprisePromptStrategy.ts:
PromptFactory.register('enterprise', () => new EnterprisePromptStrategy());
```

### 2.4. Backwards Compatible VertexClient

```typescript
// vertexClient.ts - Method overloads voor backwards compatibility
export class VertexAIClient {
  
  // NEW: Primary signature (post-refactor)
  async generateInsights(prompt: string): Promise<AIInsights>;
  
  // LEGACY: Deprecated signature (1 release lang)
  /** @deprecated Use PromptFactory.create('insights').buildPrompt() + generateInsights(prompt) */
  async generateInsights(
    moduleResults: ModuleResult[], 
    enhancedContent: EnhancedContent, 
    url: string
  ): Promise<AIInsights>;
  
  // Implementation
  async generateInsights(
    promptOrModuleResults: string | ModuleResult[], 
    enhancedContent?: EnhancedContent, 
    url?: string
  ): Promise<AIInsights> {
    let prompt: string;
    
    if (typeof promptOrModuleResults === 'string') {
      // New way: direct prompt
      prompt = promptOrModuleResults;
    } else {
      // Legacy way: build prompt internally
      console.warn('DEPRECATED: Use PromptFactory for prompt generation');
      prompt = this.buildInsightsPrompt(promptOrModuleResults, enhancedContent!, url!);
    }
    
    // ... rest of implementation
  }
}
```

## 3. ScanOrchestrator Verlichting (Concreet)

### Voor Refactor:
```typescript
// ScanOrchestrator.ts: 1040 regels
class ScanOrchestrator {
  // ... 860 regels orkestratie logica
  
  private async generateEnterpriseNarrative(...) {  // 130+ regels enterprise prompt
    const enhancedPrompt = `
      Je bent een senior AI-consultant...
      // ... grote prompt string ...
    `;
    
    const result = await this.generateLLMContent(enhancedPrompt);
    // ... parsing logic
  }
  
  // ... andere methoden
}
```

### Na Refactor:
```typescript
// ScanOrchestrator.ts: ~910 regels (-130 regels)
class ScanOrchestrator {
  // ... 860 regels orkestratie logica (ongewijzigd)
  
  // VERWIJDERD: generateEnterpriseNarrative() methode
  // GEDELEGEERD naar: EnterpriseTierStrategy via PromptFactory
  
  // ... andere methoden (ongewijzigd)
}

// EnterpriseTierStrategy.ts: +nieuwe methode
class EnterpriseTierStrategy {
  async generateEnhancedReport(...) {
    const strategy = PromptFactory.create('enterprise');
    const prompt = strategy.buildPrompt({...enterpriseFeatures});
    return await this.vertexClient.generateNarrativeReport(prompt);
  }
}
```

**Resultaat:** ScanOrchestrator krijgt -13% regels en wordt puur orchestrator.

## 4. Gefaseerd Technisch Implementatieplan

### Fase 1 – Fundament & DRY Setup (2 punten)

**1.1 Directory-structuur**  
• Maak `src/lib/ai/prompts/` + `shared/` + `__tests__/`
• Verplaats `WebsiteContextAnalyzer.ts` naar prompts/

**1.2 Interfaces & Base-klasse**  
• `PromptStrategy.ts` met concrete `PromptInput` interface
• `BasePromptStrategy` abstracte klasse voor DRY

**1.3 Token-limiet helper**  
• `TokenLimiter.ts`: tiktelling + context-afkapping bij 12k tokens
• Unit-test voor edge cases

**1.4 DRY Helpers**  
• `PromptHelpers.ts`: JSON formatting, header templates, common text blocks
• Voorkom code-duplicatie tussen strategies

---

### Fase 2 – Copy-first Migratie (5 punten)

**2.1 VertexClient prompts kopiëren**  
• **COPY** `buildInsightsPrompt()` (regel 185-256) → `InsightsPromptStrategy`
• **COPY** `buildNarrativePrompt()` (regel 257-334) → `NarrativePromptStrategy`
• **BEHOUD** originele methoden (nog niet verwijderen)

**2.2 ScanOrchestrator enterprise prompt kopiëren**  
• **COPY** enterprise prompt (regel 632-720) → `EnterprisePromptStrategy`
• **BEHOUD** originele `generateEnterpriseNarrative()` methode

**2.3 Snapshot-tests**  
• Test-fixtures in `__tests__/fixtures/` met representative data
• Snapshot-test voor elke strategie om output te vergelijken
• **CRITICAL:** Verify output identical tussen oud/nieuw

---

### Fase 3 – Registry Factory (3 punten)

**3.1 PromptFactory implementatie**  
• Registry-based factory (geen switch-statement)
• Auto-registratie vanuit strategy-bestanden
• Error-handling voor unknown types
• Unit-tests voor factory-functionaliteit

---

### Fase 4 – Backwards Compatible Integration (3 punten)

**4.1 VertexClient method overloads**  
• Nieuwe signature: `generateInsights(prompt: string)`
• Legacy signature met deprecation warning
• Fallback naar bestaande `build*` methoden voor 1 release

**4.2 TierStrategy updates**  
• `EnterpriseTierStrategy`: gebruik PromptFactory voor enterprise prompts
• `BusinessTierStrategy`: (indien nodig) gebruik PromptFactory
• **MINIMALE** wijzigingen, focus op delegatie

**4.3 LLMEnhancementService updates**  
• Update `enhanceFindings()` om PromptFactory te gebruiken
• Behoud bestaande error-handling en flow
• **MINIMALE** wijzigingen

---

### Fase 5 – Cleanup & QA (2 punten)

**5.1 Legacy code verwijderen (na 1 release)**  
• Verwijder `build*Prompt` methoden uit VertexClient
• Verwijder `generateEnterpriseNarrative` uit ScanOrchestrator
• Update method signatures (remove overloads)

**5.2 Volledige test-suite**  
• Regression-tests: JSON output identiek voor/na
• Integration-tests: complete flows per tier
• Performance-tests: geen degradatie
• Documentation updates

---

## 5. Beslissingen & Actiepunten

| # | Beslissing / Actie | Verantwoordelijke | Status |
|---|--------------------|-------------------|--------|
| 1 | **Copy-first strategie:** Alle prompt-logica eerst kopiëren, dan verwijderen | Team | ✅ Akkoord |
| 2 | **Registry-based factory:** Geen switch, wel auto-registratie | LD/BE | ✅ Akkoord |
| 3 | **Method overloads:** 1 release backwards compatibility | LD | ✅ Akkoord |
| 4 | **Token-limiter:** 12k tokens hard limit in BasePromptStrategy | BE | ✅ Akkoord |
| 5 | **DRY via PromptHelpers:** Gemeenschappelijke formatting/headers | Team | ✅ Akkoord |
| 6 | **Snapshot-tests verplicht:** Regression prevention | QA | ✅ Akkoord |
| 7 | **ScanOrchestrator verlichten:** -130 regels enterprise logic | BE | ✅ Akkoord |

### Legacy Fallback Beleid (Vastgesteld)
- **Duur:** 1 release (4 weken) na go-live nieuwe systeem
- **Implementatie:** Method overloads met `@deprecated` annotations
- **Monitoring:** Log elke legacy-call voor usage-tracking
- **Afbouw:** Release +1 feature-flag, release +2 volledig verwijderen

### Sprint-doel
"Nieuwe prompt-architectuur staat, ScanOrchestrator is lichter, business-flow gebruikt strategieën"

**Story-points totaal: 15 punten** (haalbaar 2-week sprint)  
**Voortgang: 7/15 punten voltooid** (Fase 1.1-1.3 = 2+2+3 punten)

### RACI & Tijdsindicatie

| Rol | F1 | F2 | F3 | F4 | F5 |
|-----|----|----|----|----|----|
| Lead dev | A/R | C | R | R | A |
| Backend dev | R | A/R | A | A | R |
| QA | C | R | C | R | A/R |
| PO | I | I | I | C | I |

## Implementatie Progress (2025-07-11)

### ✅ Fase 1.1 - Directory Structure (VOLTOOID)
**Implementatie:**
- ✅ `src/lib/ai/prompts/shared/` directory aangemaakt
- ✅ `src/lib/ai/prompts/__tests__/fixtures/` directory aangemaakt
- ✅ `WebsiteContextAnalyzer.ts` verplaatst naar `shared/`
- ✅ Import paths bijgewerkt in `vertexClient.ts`

### ✅ Fase 1.2 - PromptStrategy Interface (VOLTOOID)
**Implementatie:**
- ✅ `PromptStrategy.ts` met interface + `BasePromptStrategy` abstract class
- ✅ `PromptInput` interface voor alle prompt data
- ✅ Common utility methods: `formatJSON()`, `limitTokens()`, `getCurrentTimestamp()`
- ✅ `index.ts` barrel exports voor clean imports
- ✅ `PromptStrategy.test.ts` unit tests

### ✅ Fase 1.3 - TokenLimiter Helper (VOLTOOID)
**Implementatie:**
- ✅ `TokenLimiter.ts` - Advanced token counting & content trimming
- ✅ Multiple truncation strategies: 'end', 'middle', 'smart'
- ✅ Structured data limiting met priority preservation
- ✅ Configureerbare token limits (default 12k tokens)
- ✅ Smart truncation identificeert belangrijke secties
- ✅ `BasePromptStrategy` geïntegreerd met TokenLimiter
- ✅ `TokenLimiter.test.ts` - Comprehensive test suite

**Morgen 09:00: Kickoff implementatie Fase 1.4**

Legenda: **A** = Accountable, **R** = Responsible, **C** = Consulted, **I** = Informed.

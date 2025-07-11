# Refactoring Prompt Management

**Datum:** 2025-07-11
**Auteur:** Gemini

## Implementatie-overzicht

| Fase | Subfase | Beschrijving | Status |
|------|---------|--------------|--------|
| 1 | 1.1 | Directory-structuur aanmaken | ⬜ TODO |
| 1 | 1.2 | Interface `PromptStrategy` definiëren | ⬜ TODO |
| 2 | 2.1 | Prompt-logica uit `vertexClient.ts` migreren | ⬜ TODO |
| 2 | 2.2 | Prompt-logica uit `ScanOrchestrator.ts` migreren | ⬜ TODO |
| 3 | 3.1 | `PromptFactory.ts` implementeren | ⬜ TODO |
| 4 | 4.1 | `vertexClient.ts` refactoren | ⬜ TODO |
| 4 | 4.2 | Services aanpassen naar `PromptFactory` | ⬜ TODO |
| 5 | 5.1 | Oude code verwijderen | ⬜ TODO |
| 5 | 5.2 | Tests en QA uitvoeren | ⬜ TODO |

## 1. Probleemstelling

Momenteel zijn de prompt-strings die naar de Vertex AI API worden gestuurd op twee verschillende locaties in de codebase gedefinieerd:

1.  `src/lib/ai/vertexClient.ts`: Bevat de prompts voor het genereren van `AIInsights` en `NarrativeReport`.
2.  `src/lib/scan/ScanOrchestrator.ts`: Bevat een complexe prompt voor het genereren van een strategisch rapport voor de *Enterprise Tier*.

Deze aanpak heeft een aantal nadelen:

-   **Schending van het Single Responsibility Principle (SRP):** De `vertexClient` en `ScanOrchestrator` zijn nu verantwoordelijk voor zowel hun kernlogica (API-communicatie, orkestratie) als voor het samenstellen van complexe prompts.
-   **Onderhoudbaarheid:** Het is lastig om prompts te beheren, te vergelijken en te versioneren als ze verspreid zijn over de codebase.
-   **Complexiteit:** De `ScanOrchestrator` wordt onnodig zwaar en complex door de aanwezigheid van een grote, ingebedde prompt-string.
-   **Schaalbaarheid:** Het toevoegen van nieuwe AI-gestuurde features of rapporttypes vereist het aanpassen van bestaande, complexe klassen.

## 2. Voorgestelde Oplossing: Gecentraliseerd Prompt Management

Ik stel voor om een gecentraliseerd systeem voor prompt management te introduceren, gebaseerd op het **Strategy Pattern**. Dit patroon is al succesvol toegepast voor de `TierStrategy` en past goed bij dit probleem.

### 2.1. Nieuwe Directory Structuur

Alle prompt-gerelateerde logica wordt verplaatst naar een nieuwe, speciale map:

```
src/
└── lib/
    └── ai/
        ├── prompts/
        │   ├── PromptStrategy.ts         # Interface voor alle prompt strategieën
        │   ├── InsightsPromptStrategy.ts   # Strategie voor AI Insights
        │   ├── NarrativePromptStrategy.ts  # Strategie voor Narrative Reports
        │   ├── EnterprisePromptStrategy.ts # Strategie voor Enterprise Reports
        │   └── PromptFactory.ts            # Factory om de juiste strategie te selecteren
        └── vertexClient.ts                 # Blijft, maar zonder prompt-logica
```

### 2.2. Het Prompt Strategy Pattern

-   **`PromptStrategy.ts` (Interface):**
    Definieert een gemeenschappelijke interface voor alle prompt-strategieën.
    ```typescript
    export interface PromptInput {
      moduleResults?: ModuleResult[];
      enhancedContent?: EnhancedContent;
      insights?: AIInsights;
      // ... andere benodigde data
    }

    export interface PromptStrategy {
      buildPrompt(data: PromptInput): string;
    }
    ```

-   **Concrete Strategieën:**
    Elke klasse implementeert de `PromptStrategy` interface en is verantwoordelijk voor het bouwen van één specifieke prompt.
    -   `InsightsPromptStrategy.ts`: Bouwt de prompt voor `generateInsights`.
    -   `NarrativePromptStrategy.ts`: Bouwt de prompt voor `generateNarrativeReport`.
    -   `EnterprisePromptStrategy.ts`: Bouwt de prompt die nu in `ScanOrchestrator` staat.

### 2.3. De PromptFactory

-   **`PromptFactory.ts`:**
    Een eenvoudige factory die op basis van een type de juiste prompt-strategie instantieert en teruggeeft.
    ```typescript
    import { InsightsPromptStrategy } from './InsightsPromptStrategy';
    import { NarrativePromptStrategy } from './NarrativePromptStrategy';
    // ... etc.

    export type PromptType = 'insights' | 'narrative' | 'enterprise';

    export class PromptFactory {
      static create(type: PromptType): PromptStrategy {
        switch (type) {
          case 'insights':
            return new InsightsPromptStrategy();
          case 'narrative':
            return new NarrativePromptStrategy();
          case 'enterprise':
            return new EnterprisePromptStrategy();
          default:
            throw new Error(`Unknown prompt type: ${type}`);
        }
      }
    }
    ```

### 2.4. Refactoring van Bestaande Klassen

-   **`src/lib/ai/vertexClient.ts`:**
    -   De private methodes `buildInsightsPrompt` en `buildNarrativePrompt` worden volledig verwijderd.
    -   De public methodes `generateInsights` en `generateNarrativeReport` ontvangen niet langer de ruwe data, maar een kant-en-klare prompt-string. Hun enige taak is de communicatie met de Vertex AI API.

    *Voorbeeld (vereenvoudigd):*
    ```typescript
    // OUD
    // async generateInsights(moduleResults: ModuleResult[], enhancedContent: EnhancedContent, url: string) {
    //   const prompt = this.buildInsightsPrompt(moduleResults, enhancedContent, url);
    //   // ... api call
    // }

    // NIEUW
    // async generateInsights(prompt: string): Promise<AIInsights> {
    //   // ... api call met de gegeven prompt
    // }
    ```
    *Noot: Een alternatief is dat de `vertexClient` de factory aanroept, maar de verantwoordelijkheid scheiden is schoner.*

-   **`src/lib/scan/LLMEnhancementService.ts` (of vergelijkbaar):**
    Deze service wordt de *gebruiker* van het nieuwe prompt-systeem.
    ```typescript
    import { PromptFactory } from '../ai/prompts/PromptFactory';

    class LLMEnhancementService {
      async enhanceFindings(moduleResults, enhancedContent, url) {
        // 1. Genereer insights prompt
        const insightsStrategy = PromptFactory.create('insights');
        const insightsPrompt = insightsStrategy.buildPrompt({ moduleResults, enhancedContent, url });

        // 2. Stuur prompt naar VertexAI
        const insights = await this.vertexClient.generateInsights(insightsPrompt);

        // ... etc. voor narrative report
      }
    }
    ```

-   **`src/lib/scan/ScanOrchestrator.ts`:**
    -   De `generateEnterpriseNarrative` methode en de ingebedde prompt worden volledig verwijderd.
    -   De logica wordt verplaatst naar de `EnterprisePromptStrategy` en de aanroep gebeurt in de `EnterpriseTierStrategy`. Dit maakt de `ScanOrchestrator` aanzienlijk lichter en meer gefocust op orkestratie.

## 3. Voordelen van de Nieuwe Aanpak

1.  **Duidelijke Scheiding van Verantwoordelijkheden (SoC):**
    -   **Prompt Strategieën:** Weten *hoe* een prompt moet worden opgebouwd.
    -   **Prompt Factory:** Weet *welke* strategie te gebruiken.
    -   **LLM/Enhancement Service:** Weet *wanneer* een prompt nodig is en orkestreert het proces.
    -   **VertexClient:** Weet *hoe* met de externe API te praten.
2.  **Verbeterde Onderhoudbaarheid:** Alle prompts staan op één centrale, voorspelbare plek. Aanpassingen zijn geïsoleerd tot één strategie-bestand.
3.  **Verhoogde Testbaarheid:** Elke prompt-strategie kan geïsoleerd getest worden door de `buildPrompt` methode aan te roepen en de output te valideren, zonder een daadwerkelijke API-call te hoeven doen.
4.  **Betere Schaalbaarheid:** Het toevoegen van een nieuw rapport of AI-feature is nu een kwestie van een nieuwe strategie-klasse toevoegen, zonder bestaande code te hoeven wijzigen (Open/Closed Principle).

## 4. Implementatiestappen

1.  **Creëer de nieuwe directory structuur:** `src/lib/ai/prompts/`.
2.  **Definieer de `PromptStrategy` interface** in `PromptStrategy.ts`.
3.  **Verplaats de prompt-logica** uit `vertexClient.ts` naar `InsightsPromptStrategy.ts` en `NarrativePromptStrategy.ts`.
4.  **Verplaats de prompt-logica** uit `ScanOrchestrator.ts` naar `EnterprisePromptStrategy.ts`.
5.  **Implementeer de `PromptFactory.ts`**.
6.  **Refactor `vertexClient.ts`** om de `build...` methodes te verwijderen en prompts als argument te accepteren.
7.  **Refactor de aanroepende services** (zoals `LLMEnhancementService` en `EnterpriseTierStrategy`) om de `PromptFactory` te gebruiken voor het genereren van prompts.
8.  **Verwijder de oude, overbodige code** uit `ScanOrchestrator.ts`.
9.  **Test de volledige flow** om zeker te stellen dat de prompts correct worden gegenereerd en verwerkt.

## 5. Gefaseerd Technisch Implementatieplan

### Fase 1 – Fundament (Setup)

**1.1 Directory-structuur**  
• Maak map `src/lib/ai/prompts/` aan.  
• Verplaats eventuele bestaande prompt-gerelateerde helpers (bv. `WebsiteContextAnalyzer.ts`) naar deze map.

**1.2 Interface `PromptStrategy`**  
• Maak `PromptStrategy.ts` met `PromptInput`- en `PromptStrategy`-interface.  
• Voeg extensiepunt toe: `extras?: Record<string, unknown>` zodat toekomstige prompts backwards-compatible blijven.

---

### Fase 2 – Migratie Prompt-logica

**2.1 `vertexClient` prompts → `InsightsPromptStrategy` & `NarrativePromptStrategy`**  
• Kopieer de huidige `buildInsightsPrompt`- en `buildNarrativePrompt`-methoden.  
• Schrijf snapshot-tests op de string-output.

**2.2 `ScanOrchestrator` enterprise prompt → `EnterprisePromptStrategy`**  
• Kopieer prompttekst, parametriseer `enterpriseFeatures`.  
• Implementeer token-limiet helper om runaway prompts te voorkomen.

---

### Fase 3 – Factory

**3.1 `PromptFactory.ts`**  
• Implementeer registry-based factory (avoid switch):  
  ```ts
  PromptFactory.register('insights', () => new InsightsPromptStrategy());
  ```  
• Test: onbekend type moet een duidelijke fout geven.

---

### Fase 4 – Refactor Call-sites

**4.1 `vertexClient.ts`**  
• Pas methodesignatures aan: `generateInsights(prompt: string)`.  
• Laat intern een fallback-prompt bestaan voor legacy calls (deprecatie noteren).

**4.2 Services & TierStrategies**  
• Injecteer `PromptFactory` en vervang directe `build...`-calls.  
• Update dependency-injectie-config waar nodig.

---

### Fase 5 – Cleanup & QA

**5.1 Legacy code verwijderen**  
• Verwijder `build*Prompt`-methoden uit `vertexClient.ts`.  
• Verwijder inline enterprise prompt uit `ScanOrchestrator.ts`.

**5.2 Tests & kwaliteitscontrole**  
• Draai unit-, integratie- en snapshot-tests.  
• Lint, format en genereer bijgewerkte documentatie.

---

### RACI & Tijdsindicatie

| Rol | F1 | F2 | F3 | F4 | F5 |
|-----|----|----|----|----|----|
| Lead dev | A/R | C | C | R | A |
| Team devs | C | A/R | R | A | R |
| QA | I | C | C | A/R | A/R |
| PM | I | I | I | I | I |

Legenda: **A** = Accountable, **R** = Responsible, **C** = Consulted, **I** = Informed.

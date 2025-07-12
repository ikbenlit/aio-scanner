# Fase 3: De Verfijning - Hybride AI-Intelligentie (Business Tier)

**Voortbouwend op:** Fase 1 (Perfecte Single-Page Scanner) & Fase 2 (Site-Wide Crawler).
**Doel van deze fase:** De Business-tier verrijken met een diepere laag aan intelligentie. We gebruiken onze eigen AI om te beoordelen hoe een andere AI de site zou interpreteren, waardoor de kloof met de Starter-tier nog groter en waardevoller wordt.

---

## 1. Projectoverzicht & Status

| Fase | Sub-fase / Deliverable | Status | Verantwoordelijke(n) | Notities |
| :--- | :--- | :--- | :--- | :--- |
| **Fase 3** | 3.1 AI-Service Infrastructure | ⏳ Gepland | Backend | Dependency injection + nieuwe methodes |
| | 3.2 Gerichte AI-Prompts Development | ⏳ Gepland | Backend | Prompt engineering + JSON contracts |
| | 3.3 Hybride Module Integratie | ⏳ Gepland | Backend | AICitationModule + AIContentModule |
| | 3.4 Frontend AI-Insights Visualisatie | ⏳ Gepland | Frontend | UI verfijning + AI-iconen |
| | 3.5 UX & Marketing Communicatie | ⏳ Gepland | UX | Waarde propositie + tooltips |
| | 3.6 Finale Integratie & Verificatie | ⏳ Gepland | Backend, Frontend, UX | End-to-end testing |

---

## 2. Architecturale Principes

Alle ontwikkeling volgt deze kernprincipes:
*   **Hybride Model (80/20 Rule):** 80% van de analyse gebeurt door snelle, deterministische modules. 20% wordt gedelegeerd aan AI voor nuance en contextueel begrip.
*   **Lokale AI-Integratie:** Intelligentie wordt binnen de relevante modules toegevoegd, niet op orchestrator-niveau.
*   **Predictable AI Output:** Alle AI-calls retourneren strak gedefinieerde JSON-objecten met voorspelbare structuren.
*   **Backwards Compatibility:** Bestaande `Finding` interface wordt uitgebreid zonder breaking changes.
*   **Performance First:** AI-calls worden alleen uitgevoerd op pre-geïdentificeerde kandidaten, niet op bulk-data.

---

## Fase 3: De Verfijning - Hybride AI-Intelligentie (Business Tier)

### **Sub-fase 3.1: AI-Service Infrastructure**

*   **Doel:** De infrastructuur opzetten voor AI-integratie binnen de bestaande scan-modules.
*   **Backend Engineer Taken:**
    1.  **Dependency Injection Setup:** Pas de `ScanOrchestrator.ts` aan om een `VertexAIClient` instantie door te geven aan modules die AI-functies ondersteunen.
        ```typescript
        // In ScanOrchestrator.ts
        const aiClient = new VertexAIClient(config.vertexAI);
        const aiContentModule = new AIContentModule(aiClient);
        const aiCitationModule = new AICitationModule(aiClient);
        ```
    2.  **Module Constructor Update:** Voeg optionele `aiClient?: VertexAIClient` parameter toe aan `AIContentModule` en `AICitationModule` constructors.
    3.  **Feature Flag Implementation:** Implementeer `hasAIAnalysis` flag in module configuration om AI-functies te activeren alleen voor Business-tier.

### **Sub-fase 3.2: Gerichte AI-Prompts Development**

*   **Doel:** Specifieke AI-methodes ontwikkelen voor micro-analyses met voorspelbare output.
*   **Backend Engineer Taken:**
    1.  **Uitbreiden `VertexAIClient.ts`:** Voeg nieuwe, specifieke methodes toe:
        ```typescript
        // API Contract: getToneAnalysis
        async getToneAnalysis(textSnippet: string): Promise<ToneAnalysisResult> {
          // Return: { "toneScore": 0-100, "assessment": string, "suggestion": string }
        }
        
        // API Contract: getEEATStrength  
        async getEEATStrength(evidence: string): Promise<EEATAnalysisResult> {
          // Return: { "score": 0-100, "suggestion": string, "improvements": string[] }
        }
        
        // API Contract: getContentRelevance
        async getContentRelevance(content: string, context: string): Promise<RelevanceResult> {
          // Return: { "relevanceScore": 0-100, "contextFit": string, "suggestion": string }
        }
        ```
    2.  **Prompt Engineering:** Ontwikkel specifieke prompts voor elke methode:
        *   **Tone Analysis Prompt:** "Analyseer deze tekst op aanspreekvorm (formeel/informeel), sentiment en doelgroep-aansluiting. Geef een score van 0-100 voor toon-consistentie en een concrete suggestie voor verbetering."
        *   **E-E-A-T Prompt:** "Evalueer deze E-E-A-T claim op geloofwaardigheid en verifieerbaarheid. Geef een score van 0-100 en specifieke suggesties om de claim sterker te maken voor zoekmachines."
        *   **Content Relevance Prompt:** "Beoordeel hoe relevant deze content is voor de context. Geef een score van 0-100 en suggesties voor betere aansluiting."
    3.  **Error Handling & Fallbacks:** Implementeer robuuste error handling met fallback naar non-AI suggesties bij API failures.

### **Sub-fase 3.3: Hybride Module Integratie**

*   **Doel:** De AI-functies integreren in bestaande modules met slimme kandidaat-identificatie.
*   **Backend Engineer Taken:**
    1.  **`AIContentModule` Enhancement:**
        ```typescript
        // Workflow implementatie:
        private async analyzeWithAI(content: string, context: string): Promise<AIInsight> {
          // 1. Identificeer kandidaten voor AI-analyse
          const candidates = this.identifyAICandidates(content);
          
          // 2. Roep AI-methodes aan voor geselecteerde kandidaten
          const toneAnalysis = await this.aiClient?.getToneAnalysis(candidates.toneText);
          const relevanceAnalysis = await this.aiClient?.getContentRelevance(candidates.content, context);
          
          // 3. Integreer AI-insights in Finding object
          return this.mergeAIInsights(toneAnalysis, relevanceAnalysis);
        }
        ```
    2.  **`AICitationModule` Enhancement:**
        ```typescript
        // E-E-A-T specifieke implementatie:
        private async analyzeEEATClaims(claims: string[]): Promise<EEATInsight[]> {
          const insights = [];
          for (const claim of claims.slice(0, 3)) { // Limiteer tot 3 claims
            const analysis = await this.aiClient?.getEEATStrength(claim);
            insights.push({
              evidence: claim,
              aiSuggestion: analysis.suggestion,
              confidence: analysis.score
            });
          }
          return insights;
        }
        ```
    3.  **`Finding` Interface Update:** Breid de `Finding` interface uit in `src/lib/types/scan.ts`:
        ```typescript
        interface Finding {
          // ... bestaande velden
          aiInsights?: {
            type: 'tone' | 'eeat' | 'relevance';
            score: number;
            suggestion: string;
            confidence: number;
            evidence?: string;
          }[];
        }
        ```

### **Sub-fase 3.4: Frontend AI-Insights Visualisatie**

*   **Doel:** AI-gegenereerde inzichten duidelijk en waardevol presenteren aan gebruikers.
*   **Frontend Engineer Taken:**
    1.  **`AIInsightCard.svelte` Component:** Ontwikkel nieuwe component voor AI-insights:
        ```svelte
        <!-- API Contract: Props -->
        <script lang="ts">
          export let aiInsights: AIInsight[];
          export let isBusinessTier: boolean = false;
        </script>
        
        <!-- Conditionele rendering met AI-badge -->
        {#if isBusinessTier && aiInsights?.length > 0}
          <div class="ai-insights-container">
            <div class="ai-badge">
              <SparkleIcon />
              <span>AI-Analyse</span>
            </div>
            <!-- Insights rendering -->
          </div>
        {/if}
        ```
    2.  **`SmartFindingCard.svelte` Enhancement:** Integreer AI-insights in bestaande component:
        ```svelte
        <!-- Uitbreiding van bestaande component -->
        {#if finding.aiInsights}
          <AIInsightCard aiInsights={finding.aiInsights} isBusinessTier={true} />
        {/if}
        ```
    3.  **Icon Set Development:** Voeg AI-specifieke iconen toe:
        *   `SparkleIcon.svelte` - Voor AI-badge
        *   `BrainIcon.svelte` - Voor intelligentie-indicatie
        *   `MagicWandIcon.svelte` - Voor AI-suggesties

### **Sub-fase 3.5: UX & Marketing Communicatie**

*   **Doel:** De waarde van AI-functies duidelijk communiceren zonder complexiteit.
*   **UX Expert Taken:**
    1.  **AI-Feature Communication Design:**
        *   **Tooltip Design:** "Deze suggestie is gegenereerd door onze AI-analyse voor een dieper inzicht in uw content."
        *   **Badge Design:** Subtiel "AI" badge met sparkle-effect
        *   **Value Proposition:** "Krijg contextuele suggesties die verder gaan dan standaard SEO-regels"
    2.  **Pricing Page Enhancement:** Update waardeproposities:
        *   **Starter:** "AI-samenvatting van uw scan-resultaten"
        *   **Business:** "Directe AI-inzichten tijdens de scan + AI-gegenereerde verbeteringsuggesties"
    3.  **User Journey Mapping:** Definieer complete ervaring:
        *   Discovery → Scan → AI-insights → Action → Improvement

### **Sub-fase 3.6: Finale Integratie & Verificatie**

*   **Doel:** End-to-end testing en productie-gereed maken van hybride AI-functionaliteit.
*   **Backend Engineer Taken:**
    1.  **Integration Testing:** Implementeer tests voor AI-workflow:
        ```typescript
        // Test scenario's:
        // 1. AI-client beschikbaar + Business tier → AI-insights gegenereerd
        // 2. AI-client niet beschikbaar → Graceful fallback
        // 3. AI-API timeout → Fallback naar standaard suggesties
        // 4. Malformed AI-response → Error handling
        ```
    2.  **Performance Monitoring:** Implementeer monitoring voor AI-call performance en success rates.
*   **Frontend Engineer Taken:**
    1.  **Cross-Browser Testing:** Verifieer AI-insights rendering op alle ondersteunde browsers.
    2.  **Mobile Optimization:** Zorg voor correcte weergave van AI-badges en insights op mobiele apparaten.
*   **Backend Engineer, Frontend Engineer & UX Expert Taken:**
    1.  **End-to-End Verificatie:** Voer volledige test uit volgens testprotocol:
        ```
        Test Protocol - Hybride AI-Functionaliteit:
        [ ] Business-tier gebruiker krijgt AI-insights bij scan
        [ ] AI-badges worden correct weergegeven
        [ ] Tooltips functioneren op desktop en mobiel
        [ ] Fallback werkt bij AI-API uitval
        [ ] Performance impact < 2 seconden extra scan-tijd
        [ ] PDF rapporten bevatten AI-insights
        [ ] Starter-tier gebruikers zien geen AI-functies
        [ ] Error states worden correct afgehandeld
        ```

---

## 3. Technische Specificaties

### **API Contracts**

#### **VertexAIClient Nieuwe Methodes:**
```typescript
interface ToneAnalysisResult {
  toneScore: number;        // 0-100
  assessment: string;       // "Persoonlijk en positief"
  suggestion: string;       // Concrete verbetering
}

interface EEATAnalysisResult {
  score: number;           // 0-100
  suggestion: string;      // Hoofdsuggestie
  improvements: string[];  // Lijst van verbeteringen
}

interface RelevanceResult {
  relevanceScore: number;  // 0-100
  contextFit: string;      // "Hoog relevant voor doelgroep"
  suggestion: string;      // Verbetersuggestie
}
```

#### **Finding Interface Extension:**
```typescript
interface AIInsight {
  type: 'tone' | 'eeat' | 'relevance';
  score: number;
  suggestion: string;
  confidence: number;
  evidence?: string;
}

interface Finding {
  // ... bestaande velden
  aiInsights?: AIInsight[];
}
```

### **Performance Targets**
*   **AI-Call Timeout:** 10 seconden maximum
*   **Scan Time Impact:** < 2 seconden extra voor AI-analyse
*   **Fallback Response Time:** < 500ms bij AI-API failure
*   **Success Rate Target:** > 95% successful AI-calls

### **Error Handling Strategy**
1.  **AI-API Timeout:** Fallback naar standaard suggesties
2.  **Malformed Response:** Log error, gebruik cached suggesties
3.  **Rate Limiting:** Implementeer exponential backoff
4.  **Service Unavailable:** Graceful degradation zonder AI-insights

---

## 4. Definition of Done voor Fase 3

### **Backend (Sub-fase 3.1 - 3.3):**
*   [ ] `VertexAIClient` bevat 3 nieuwe methodes met voorspelbare JSON-output
*   [ ] `AIContentModule` en `AICitationModule` gebruiken AI voor gerichte analyses
*   [ ] Dependency injection voor AI-client geïmplementeerd
*   [ ] Error handling en fallbacks volledig getest
*   [ ] Performance monitoring geïmplementeerd

### **Frontend (Sub-fase 3.4):**
*   [ ] `AIInsightCard` component ontwikkeld en geïntegreerd
*   [ ] AI-badges en iconen consistent geïmplementeerd
*   [ ] Conditionele rendering voor Business-tier gebruikers
*   [ ] Mobile-responsive design voor alle AI-features

### **UX & Marketing (Sub-fase 3.5):**
*   [ ] Tooltips en help-teksten gedefinieerd en geïmplementeerd
*   [ ] Pricing page updated met AI-features
*   [ ] User journey voor AI-insights geoptimaliseerd
*   [ ] A/B testing plan voor AI-feature adoption

### **Integratie & Verificatie (Sub-fase 3.6):**
*   [ ] End-to-end testprotocol succesvol uitgevoerd
*   [ ] Performance targets behaald
*   [ ] Cross-browser compatibiliteit geverifieerd
*   [ ] Production deployment zonder issues

### **Business Impact:**
*   [ ] Duidelijk verschil tussen Starter en Business tier features
*   [ ] Waardepropositie significant verhoogd voor Business-tier
*   [ ] AI-insights leiden tot actionable verbeteringen
*   [ ] User retention verhoogd door toegevoegde waarde

---

## 5. Risico Management

### **Technische Risico's:**
*   **AI-API Reliability:** Mitigatie via robuuste fallbacks
*   **Response Time Impact:** Mitigatie via async processing en caching
*   **Cost Escalation:** Mitigatie via usage monitoring en rate limiting

### **UX Risico's:**
*   **Feature Complexity:** Mitigatie via progressive disclosure
*   **Value Communication:** Mitigatie via A/B testing van messaging
*   **User Overwhelm:** Mitigatie via contextual help en tooltips

### **Business Risico's:**
*   **Differentiation Insufficient:** Mitigatie via user feedback loops
*   **Development Delays:** Mitigatie via agile sprints en MVP approach
*   **Market Acceptance:** Mitigatie via beta testing met select users

---

**🎯 SUCCESS CRITERIA:**
*   Business-tier gebruikers krijgen 3-5 AI-gegenereerde insights per scan
*   AI-insights hebben > 80% user satisfaction score
*   Business-tier conversie verhoogd met > 25%
*   Technical performance targets 100% behaald

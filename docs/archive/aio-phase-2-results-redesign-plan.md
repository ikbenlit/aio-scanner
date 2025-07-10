# 📈 AIO Scanner – Results Page Redesign (Fase 2)
*Gefaseerd Plan voor Diepte en Personalisatie per Tier*

> **Doel:** Dit document beschrijft de gefaseerde implementatie om de resultatenpagina en bijbehorende PDF-rapporten dynamisch en relevant te maken voor elke gebruikerstier (Basic, Starter, Business, Enterprise).

---

## 1. Visie & Contentstrategie
*Wat is de waarde die we per tier leveren?*

| Tier | Prijs | Kernbelofte | AI-Narrative | PDF |
|------|-------|-------------|--------------|-----|
| **Basic** | € 0 | **AI-Preview:** 3 concrete Quick Wins (1 AI-actie gegarandeerd) om de waarde te proeven. | ❌ | ❌ |
| **Starter** | € 19,95 | **Volledige Actielijst:** Alle (±15) quick wins in een samenvattend PDF-rapport. | Beknopt | ✔️ Samenvattend |
| **Business** | € 49,95 | **Strategisch Groeiplan:** Volledige actielijst plus een AI-gegenereerde narrative en roadmap in een uitgebreid PDF. | Volledig | ✔️ Uitgebreid |
| **Enterprise**| € 149,95 | **Diepte-analyse op Maat:** Multi-page analyse en een white-label PDF met KPI-dashboard voor strategische beslissingen. | Strategisch | ✔️ White-label |

---

## 2. Architectuur & Risicobeheer
*Hoe zorgen we voor een schaalbare en robuuste technische basis?*

### 2.1 Architectuurprincipe: Separation of Concerns (SOC) ✅ **GEÏMPLEMENTEERD**
De `ScanOrchestrator` is succesvol gerefactored naar het **Strategy Pattern**. Elke tier heeft nu een aparte `...TierStrategy` klasse die de tier-specifieke logica bevat:

- ✅ `BasicTierStrategy` - Gratis tier (TechnicalSEO + SchemaMarkup)
- ✅ `StarterTierStrategy` - €19,95 tier (Basic + AI rapport)  
- ✅ `BusinessTierStrategy` - €49,95 tier (Alle modules + LLM enhancement)
- ✅ `EnterpriseTierStrategy` - €149,95 tier (Business + multi-page analysis)
- ✅ `TierStrategyFactory` - Clean strategy instantiation

**Status:** **VOLLEDIG COMPLEET** - Backwards compatibility behouden, alle E2E tests slagen.

### 2.2 Risicobeheer
| Risico | Mitigatie Strategie |
|---|---|
| **Backwards Compatibility** | Oude scans zonder `tier` worden als `basic` behandeld. De code krijgt `null` checks. |
| **Upgrade & Caching** | Een upgrade triggert een **volledige re-scan** met de nieuwe tier-instellingen. De UI communiceert dit duidelijk aan de gebruiker. |
| **Enterprise Scope** | De "Multi-page crawl" is initieel een **sample van max. 2 extra pagina's**. Een volledige 250-pagina crawl wordt als een aparte feature (Fase 3) gezien. |

---

## 3. Gefaseerd Implementatieplan & Status
*De concrete stappen, opgedeeld in logische fases.*

**Status Legend:** 🔴 Niet gestart | 🟡 In progress | 🟢 Compleet | ⚠️ Geblokkeerd

| Fase | Focus | Tijdsinschatting | Verantwoordelijk | Status |
|---|---|---|---|---|
| **Fase 0: Architectuur Refactoring** | `ScanOrchestrator` ombouwen naar Strategy Pattern. | 8 u | Dev (Architect) | 🟢 **COMPLEET** |
| **Fase 1: Resultatenpagina per Tier** | De web-interface dynamisch maken. | 11 u | | 🟢 **COMPLEET** |
| *Sub 1.1: Server Logica* | Tier-aware Quick Wins & data-props. | 3 u | Dev | 🟢 |
| *Sub 1.2: Frontend Componenten* | Badge, CTA-switch, lock-overlays. | 4 u | Dev / Design | 🟢 **COMPLEET** |
| *Sub 1.3: AI-Narrative Component* | Nieuwe component voor AI-teksten. | 2 u | Dev | 🟢 **COMPLEET** |
| *Sub 1.4: Integratie & Testen* | E2E-testen per tier + metrics tracking. | 2 u | QA / Content | 🟢 **COMPLEET** |
| **Fase 2: PDF-uitbreiding per Tier** | De PDF-rapporten verrijken. | 12 u | | 🟡 **IN UITVOERING** |
| *Sub 2.1: Starter PDF* | Samenvattend rapport genereren. | 3 u | Dev | 🟢 **COMPLEET** |
| *Sub 2.2: Business PDF* | AI-Narrative & grafieken toevoegen. | 4 u | Dev / Design | 🟢 **COMPLEET** |
| *Sub 2.3: Enterprise PDF* | KPI-dashboard & strategic insights. | 2 u | Dev / Design | 🟢 **COMPLEET** |

**Totaal Geschat:** 28 uur | **Voltooid:** 28 uur (Alle fasen compleet) | **Nog te doen:** 0 uur

---

## 4. Details: UX & Componenten
*Hoe vertalen we de strategie naar de interface?*

### 4.1 Component-aanpassingen
| Component | Aanpassing |
|---|---|
| `QuickWinsSection.svelte` | Krijgt `tier` prop; toont bij **Basic** een "🤖 AI-Preview" badge. |
| `GentleConversion.svelte` | Krijgt `tier` prop; toont de juiste upgrade-CTA. |
| `AiNarrativeSection.svelte` | **Nieuwe component** die het `aiNarrative` object toont (zichtbaar vanaf Starter). |
| `Results +page.svelte` | Orchestreert bovenstaande. Geeft props door en rendert `AiNarrativeSection` conditioneel. |

### 4.2 UX-Flows per Tier
1. **Basic → Starter:**
   - Banner onder Quick Wins: _“We vonden nog **{totalActions-3} extra AI-kansen** – upgrade voor volledig rapport (€19,95).”_
   - Minimaal één Quick Win is een `< 15 min` taak met `≥ +8 punten` impact voor een "instant gratification" gevoel.
2. **Starter → Business:**
   - Lock-overlay op de (lege) `AiNarrativeSection`: _“Ontgrendel je Strategisch Groeiplan – inclusief roadmap & concurrent-inzichten (€49,95).”_
3. **Business → Enterprise:**
   - Sidebar checklist: _“Diepte-analyse nodig? Upgrade naar Enterprise voor multi-page sampling, white-label PDF's en een KPI-dashboard.”_

### 4.3 PDF Specificaties
*Om Fase 2 "klaar voor implementatie" te maken, zijn hier de specifieke vereisten per PDF.*

---

#### **Starter PDF: "Het Samenvattende Rapport"**
-   **Content-blokken:**
    1.  Header met AIO Scanner-branding.
    2.  Scan-details (Datum, URL).
    3.  Hero Score (`/100`) met interpretatie (bv. "Goed").
    4.  Volledige lijst van alle Quick Wins (`BusinessAction`s), gegroepeerd per module.
    5.  Footer met link naar de online resultatenpagina.
-   **Design:** Simpel, A4-layout, focus op leesbaarheid. Geen complexe grafieken. Link naar Figma-ontwerp is vereist voor start.
-   **Technische Aanpak:** Genereert een HTML-template op basis van de `scan` data en converteert deze naar PDF met een bibliotheek zoals `puppeteer` of `playwright`.

---

#### **Business PDF: "Het Strategische Groeiplan"**
-   **Content-blokken:**
    1.  Alle content van de Starter PDF.
    2.  **Klantlogo** in de header (white-labeling light).
    3.  Uitgebreide **AI-Narrative** tekst (1-2 alinea's).
    4.  **Grafieken:**
        -   Staafdiagram: Score per scan-module.
        -   Cirkeldiagram: Verdeling van acties per moeilijkheidsgraad (makkelijk, gemiddeld, uitdagend).
-   **Design:** Professioneler, met visuele datavisualisaties. Vereist een specifiek Figma-ontwerp voor de grafieken en layout.
-   **Technische Aanpak:** Data voor grafieken wordt apart berekend. Grafieken worden gegenereerd met een library (bv. `Chart.js`) als afbeeldingen en ingevoegd in de HTML-template voor de PDF-conversie.

---

#### **Enterprise PDF: "Het KPI-Dashboard"**
-   **Content-blokken:**
    1.  Alle content van de Business PDF.
    2.  Volledig **white-label** (geen AIO Scanner-branding).
    3.  **KPI-dashboard sectie:**
        -   ROI-Barometer: Visuele weergave van geschatte impact vs. tijd.
        -   Trendgrafiek: Score-evolutie (vereist historische scan-data).
        -   Concurrentie-benchmark (indien data beschikbaar).
-   **Design:** Premium, rapport-stijl. Focus op indrukwekkende en heldere datavisualisaties. Vereist een gedetailleerd Figma-ontwerp.
-   **Technische Aanpak:** Vereist extra databronnen (historische scans, concurrentie-data). De PDF-generator moet flexibel genoeg zijn om deze complexe datastructuren te verwerken. De technische complexiteit is significant hoger.

---

### 4.4 AI-Narrative Specificaties
*Om Fase 1.3 "klaar voor implementatie" te maken.*

-   **Design & Layout:**
    -   De component (`AiNarrativeSection.svelte`) toont in de "unlocked" state een titel (bv. "Strategisch Groeiplan") en de AI-gegenereerde tekst in een duidelijk leesbaar tekstblok.
    -   De `aiInsights` worden weergegeven als een bullet-point lijst onder de hoofdtekst.
    -   Vereist een simpele wireframe of Figma-design voordat de bouw start.
-   **Data Handling:**
    -   De `aiNarrative` prop wordt behandeld als een platte tekst-string.
    -   De `aiInsights` prop is een array van strings, die elk als een apart punt in de bullet-point lijst worden weergegeven.
-   **Interactie:** De component is in eerste instantie volledig statisch. Er zijn geen klikbare elementen binnen de tekst.

---

### 4.5 Technische Implementatie Details
*Specifieke code-aanwijzingen gebaseerd op de huidige codebase.*

#### **Bestaande Code-Status**
**✅ Al Compleet:**
- `src/lib/results/translation.ts` - Bevat `translateFindings()` en `getPositiveFindings()`
- `src/lib/results/prioritization.ts` - Bevat `selectTop3QuickWins()` en `selectVariedQuickWins()`  
- `src/lib/results/interpretation.ts` - Bevat score-interpretatie logica
- `src/routes/scan/[scanId]/results/+page.server.ts` - Tier-aware data loading is al geïmplementeerd
- `src/lib/scan/ScanOrchestrator.ts` - **Strategy Pattern volledig geïmplementeerd!**
- `src/lib/scan/strategies/` - **Alle 4 tier strategies bestaan en zijn functioneel**
- Bestaande componenten: `ScoreHero`, `QuickWinsSection`, `GentleConversion`, `PositiveReinforcement`
- `src/lib/components/features/scan/AiNarrativeSection.svelte` - **Volledig geïmplementeerd!**

**🚀 Belangrijke Ontdekkingen:** 
1. **Strategy Pattern refactoring is 100% compleet** - ScanOrchestrator kan al tier-aware scans uitvoeren
2. **AiNarrativeSection component bestaat al** - Met tier-aware locking, blurred previews, upgrade CTAs, en markdown formatting
3. **Component is al geïntegreerd** - Wordt al geïmporteerd in de results pagina

De backend-infrastructuur voor tier-based content én de belangrijkste frontend component zijn dus al volledig operationeel!

**❌ Nog Te Implementeren:**
- ~~`AiNarrativeSection.svelte` - Nieuwe component~~ ✅ **COMPLEET**
- ~~**Sub 1.2**: Tier-aware props in `QuickWinsSection` en `GentleConversion`~~ ✅ **COMPLEET**
- ~~**Sub 1.4**: Analytics events + final testing~~ ✅ **COMPLEET**
- 🟢 **Fase 2**: PDF-uitbreiding per tier - **VOLLEDIG COMPLEET**
    - 🟢 **Sub 2.1 Starter PDF**: COMPLEET (Professional template)
    - 🟢 **Sub 2.2 Business PDF**: COMPLEET (Charts + AI narrative)
    - 🟢 **Sub 2.3 Enterprise PDF**: COMPLEET (KPI Dashboard + Strategic insights)

#### **Data Flow Specificatie**
```typescript
// src/routes/scan/[scanId]/results/+page.server.ts (AL GEÏMPLEMENTEERD)
interface PageData {
  businessInsights: {
    quickWins: PrioritizedAction[];        // Via selectVariedQuickWins() voor basic
    positiveFindings: string[];            // Via getPositiveFindings()
    totalActions: number;                  // Voor upgrade-banner tekst
    allActions: BusinessAction[];          // Volledige lijst
    aiNarrative: any;                      // Van result_json.narrativeReport  
    aiInsights: any;                       // Van result_json.aiInsights
    tier: ScanTier;                        // Van database.tier veld
    aiPreviewBadge: string | null;         // Via getAIPreviewBadge()
    isBasicTier: boolean;                  // tier === 'basic'
    hasAIContent: boolean;                 // tier !== 'basic'
    hasAdvancedInsights: boolean;          // tier === 'business' | 'enterprise'
  };
}
```

#### **Component Props Interfaces**
```typescript
// Sub 1.2: Uit te breiden props voor bestaande componenten

// QuickWinsSection.svelte - BESTAAND, UITBREIDEN
interface QuickWinsSectionProps {
  quickWins: PrioritizedAction[];
  tier: ScanTier;                          // TOEVOEGEN
  aiPreviewBadge?: string | null;          // TOEVOEGEN voor Basic badge
}

// GentleConversion.svelte - BESTAAND, UITBREIDEN  
interface GentleConversionProps {
  tier: ScanTier;                          // TOEVOEGEN
  totalActions: number;                    // TOEVOEGEN voor "nog X kansen" tekst
  currentActionsShown: number;             // TOEVOEGEN (3 voor basic)
}

// Sub 1.3: Nieuwe component
// AiNarrativeSection.svelte - NIEUW AANMAKEN
interface AiNarrativeSectionProps {
  aiNarrative: string | null;
  aiInsights: string[] | null;
  tier: ScanTier;
  isLocked: boolean;                       // tier === 'basic'
}
```

#### **Bestandsstructuur & Wijzigingen**
```
NIEUWE BESTANDEN:
src/lib/components/features/scan/AiNarrativeSection.svelte

WIJZIGEN:
src/lib/components/features/scan/QuickWinsSection.svelte    (+tier prop, +badge logic)
src/lib/components/features/scan/GentleConversion.svelte     (+tier prop, +upgrade text)
src/routes/scan/[scanId]/results/+page.svelte               (+AiNarrativeSection component)

ONGEWIJZIGD (gebruiken bestaande props):
src/lib/components/features/scan/ScoreHero.svelte
src/lib/components/features/scan/PositiveReinforcement.svelte
src/lib/components/features/scan/ActionCard.svelte
```

#### **Sub 1.4: Integratie & Testen - Praktische Aanpak**

**A. Props Uitbreiden (1 uur)**
```typescript
// Simpel: Voeg tier prop toe aan 2 bestaande componenten

// QuickWinsSection.svelte - voeg tier prop toe
export let tier: ScanTier;

// GentleConversion.svelte - voeg tier prop toe  
export let tier: ScanTier;

// +page.svelte - geef tier door
<QuickWinsSection {quickWins} {tier} />
<GentleConversion {tier} />
```

**B. Simpele Analytics (30 min)**
```typescript
// Gebruik bestaande console.log patroon uit de codebase
// Later upgraden naar echte analytics als nodig

// In componenten waar CTA's zijn:
function handleUpgradeClick() {
  console.log('ANALYTICS: upgrade_click', { from: tier, to: 'starter' });
  // + existing click logic
}
```

**C. Visual Test (30 min)**
```typescript
// Test gewoon handmatig per tier:
// 1. Basic scan → zie je 3 quick wins + upgrade banner?
// 2. Business scan → zie je volledige AI section?
// 3. Zijn er console errors?
// 4. Bouwen zonder TypeScript errors?
```

#### **PDF Generatie Technische Specificatie (Fase 2)**
```typescript
// Nieuwe bestanden voor Fase 2
src/lib/pdf/
├── PdfGenerator.ts          // Main generator class
├── templates/
│   ├── StarterTemplate.ts   // HTML template voor Starter PDF
│   ├── BusinessTemplate.ts  // HTML template + grafieken voor Business PDF  
│   └── EnterpriseTemplate.ts // White-label template voor Enterprise PDF
└── charts/
    ├── ScoreChart.ts        // Staafdiagram per module
    └── ActionChart.ts       // Cirkeldiagram per moeilijkheidsgraad

// Database schema uitbreiding (migration vereist)
ALTER TABLE scans ADD COLUMN pdf_tier_data JSONB; -- Voor charts data
```

**PDF Data Processing:**
```typescript
// Uitbreiding van result_json structure voor PDF's
interface ScanResultJson {
  // Bestaande velden...
  pdfData?: {
    chartData: {
      moduleScores: { name: string; score: number }[];
      actionDistribution: { difficulty: string; count: number }[];
    };
    customerLogo?: string; // Base64 voor Business+
    generatedAt: string;
  };
}
```

---

## 5. Succesmeting
*Wanneer is dit project geslaagd?*

### 5.1 Definition of Done
- [ ] **Fase 0:** `ScanOrchestrator` is gerefactored; alle bestaande scans werken nog identiek.
- [ ] **Fase 1:** De resultatenpagina toont per tier de juiste componenten en data.
- [ ] **Fase 2:** De PDF-download levert per tier het correcte, verrijkte rapport op.
- [ ] Alle CTA's en teksten zijn correct per tier.
- [ ] `npm run build` slaagt zonder errors.

### 5.2 Succes-metrics (KPI's)
| Metric | Baseline | Target |
|---|---|---|
| **Upgrade-rate Basic → Starter** | 4 % | **→ 4,6 %** (+15%) |
| **Scroll-diepte Starter → Narrative lock** | 55 % | **≥ 70 %** |
| **Contact-clicks Business → Enterprise demo** | 2 % | **≥ 5 %** |

### 5.3 Metrics Implementatie
*Om Fase 1.4 "klaar voor implementatie" te maken.*

-   **Analytics Tool:** We gebruiken een client-side analytics tool (bv. **PostHog** of **Plausible**). De events worden vanuit de Svelte-componenten getriggerd.
-   **Te implementeren Events:**
    1.  **Event:** `upgrade_cta_clicked`
        -   **Trigger:** Klik op de upgrade-banner of een "lock" overlay.
        -   **Properties:** `source_tier: string`, `target_tier: string`.
        -   **Meet KPI:** "Upgrade-rate Basic → Starter".
    2.  **Event:** `view_section`
        -   **Trigger:** Wanneer een sectie (zoals de AI-Narrative lock-overlay) in de viewport van de gebruiker komt.
        -   **Properties:** `section_name: 'narrative_lock'`.
        -   **Meet KPI:** "Scroll-diepte Starter → Narrative lock".
    3.  **Event:** `demo_request_clicked`
        -   **Trigger:** Klik op de "Plan demo" knop voor de Enterprise-tier.
        -   **Properties:** `source_tier: 'business'`.
        -   **Meet KPI:** "Contact-clicks Business → Enterprise demo".

### 5.4 Sub 1.4 - Simpele Checklist
*Praktische stappen om 1.4 af te ronden.*

**✅ Sub 1.4 Klaar wanneer:**
- [ ] `QuickWinsSection.svelte` heeft `tier` prop en gebruikt deze
- [ ] `GentleConversion.svelte` heeft `tier` prop en gebruikt deze  
- [ ] `+page.svelte` geeft `tier` door aan beide componenten
- [ ] Basic scan toont andere content dan Business scan
- [ ] Console.log analytics events werken bij clicks
- [ ] `npm run build` zonder TypeScript errors
- [ ] Visueel: pagina ziet er goed uit per tier

### 5.5 Snelle Sub 1.4 Implementatie
*Direct te doen stappen (2 uur totaal).*

**Stap 1: Props toevoegen (1 uur)**
1. Open `QuickWinsSection.svelte` → voeg `export let tier: ScanTier;` toe
2. Open `GentleConversion.svelte` → voeg `export let tier: ScanTier;` toe  
3. Open `+page.svelte` → geef `{tier}` door aan beide componenten
4. Test: `npm run build` → fix TypeScript errors

**Stap 2: Tier-based content (45 min)**
1. In `QuickWinsSection`: als `tier === 'basic'` → toon "🤖 AI Preview" badge
2. In `GentleConversion`: pas upgrade tekst aan per tier
3. Test: doe basic scan en business scan → zie verschil?

**Stap 3: Simple tracking (15 min)**
1. Voeg `console.log('ANALYTICS: upgrade_click', {tier})` toe bij CTA clicks
2. Test: klik upgrade buttons → zie console logs?
3. Klaar! ✅

**Dag 2-3 - Component Updates:**
1. **Props uitbreiden:** Voeg `tier` props toe aan bestaande componenten
2. **Conditional rendering:** Implementeer tier-based content filtering
3. **Analytics events:** Voeg tracking toe aan alle CTA's en lock-overlays

**Dag 4 - Testing & Polish:**
1. **E2E tests per tier:** Test Basic, Starter, Business flows
2. **Visual QA:** Controleer alle badges, banners en lock-states
3. **Performance check:** Zorg dat geen regressie in laadtijd

**Klaar voor Merge:** 
- [ ] Alle bestaande E2E tests slagen
- [ ] Nieuwe tier-functies werken correct
- [ ] Analytics events triggeren correct
- [ ] Geen console errors

---
*Plan Status: 100% Development-Ready | Laatste update: December 2024*

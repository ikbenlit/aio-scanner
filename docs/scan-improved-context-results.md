# Technisch Implementatieplan: Verbeterde Scanresultaten

**Referentie:** [AIO Scanner Results & PDF Redesign Concept](aio_scanner_redesign_concept.md)

## 1. Doel

Dit document beschrijft de technische implementatie voor de herontwerp van de AIO Scanner resultatenpagina en PDF-rapportage. Het doel is om de huidige, technische checklist te transformeren naar een business-impact-gedreven, gepersonaliseerde en actiegerichte ervaring voor de gebruiker, conform het redesign concept.

**Kernprincipes:**
- **Copy-First:** Maximaal hergebruik van de bestaande SvelteKit + Supabase architectuur.
- **Separation of Concerns (SoC):** Duidelijke scheiding tussen data-laag (Supabase), AI-logica (Prompts), en presentatie-laag (SvelteKit).
- **Don't Repeat Yourself (DRY):** Generieke componenten en functies voor zowel de web- als PDF-weergave.

## 2. Architectuur en Datamodel

De kern van deze implementatie is de introductie van een rijker datamodel voor scan-bevindingen. Dit model zal de basis vormen voor zowel de web-interface als het PDF-rapport.

### 2.1. Backend (Supabase)

#### 2.1.1. Nieuw Database Schema: `scan_findings`

We introduceren een nieuwe tabel `scan_findings` om de verrijkte resultaten op te slaan. Dit vervangt (of is een aanvulling op) de huidige manier van opslag.

**Tabel: `scan_findings`**
```sql
CREATE TYPE finding_priority AS ENUM ('urgent', 'high_impact', 'recommended');

CREATE TABLE scan_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID REFERENCES scans(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Core Finding Info
    title TEXT NOT NULL,
    priority finding_priority NOT NULL,
    time_estimate_minutes INT,
    
    -- Business Context (AI-generated)
    problem_statement TEXT,
    solution_summary TEXT,
    business_impact_summary TEXT, -- e.g., "+25% conversie"
    
    -- Expanded Details (for detail view)
    implementation_steps JSONB, -- { "title": "Stap 1", "description": "..." }[]
    roi_analysis JSONB, -- { "investment": "...", "return": "...", "calculation": "..." }
    before_after_example JSONB, -- { "before": "...", "after": "..." }

    -- Metadata
    is_completed BOOLEAN DEFAULT FALSE,
    category TEXT -- e.g., 'SEO', 'Content', 'Technical'
);
```

**Overwegingen:**
- `JSONB` wordt gebruikt voor flexibele, gestructureerde data zoals stappenplannen en ROI-analyses.
- Een `priority` ENUM zorgt voor consistente data en maakt prioriteren eenvoudig.
- De relatie met een eventuele `scans` tabel blijft behouden via `scan_id`.

#### 2.1.2. Aanpassing AI Prompt Strategieën

De bestaande AI-logica moet worden aangepast om de velden in de `scan_findings` tabel te vullen.

**Aanpak:**
1.  **Hergebruik Prompt Refactor:** We bouwen voort op de recente `refactor-prompt-management` inspanning. Er wordt een nieuwe `PromptStrategy` gemaakt, bijvoorbeeld `RichFindingGenerationStrategy`.
2.  **Output Structuur:** De prompt wordt ontworpen om een JSON-array te genereren die direct overeenkomt met de structuur van `scan_findings`.
3.  **(Suggestie) Prompt Chaining:** Om de betrouwbaarheid van de output te verhogen, kunnen we een "chain-of-thought" aanpak overwegen:
    *   **Prompt 1 (Identificatie):** Identificeert de kernproblemen (zoals nu).
    *   **Prompt 2 (Verrijking):** Neemt elk geïdentificeerd probleem als input en genereert de bijbehorende business context, ROI, stappenplan, etc. Dit verdeelt de taak in kleinere, beter beheersbare stappen voor de LLM.

### 2.2. Frontend (SvelteKit)

#### 2.2.1. Data Models (TypeScript)

We definiëren TypeScript interfaces die overeenkomen met het `scan_findings` schema voor type-safety in de SvelteKit-applicatie.

```typescript
// src/lib/types/scan.ts
export type FindingPriority = 'urgent' | 'high_impact' | 'recommended';

export interface ScanFinding {
  id: string;
  scan_id: string;
  title: string;
  priority: FindingPriority;
  time_estimate_minutes: number;
  problem_statement: string;
  solution_summary: string;
  business_impact_summary: string;
  implementation_steps: { title: string; description: string }[];
  roi_analysis: { investment: string; return: string; calculation: string };
  before_after_example: { before: string; after: string };
  is_completed: boolean;
  category: string;
}
```

#### 2.2.2. Componenten Structuur (Copy-First)

We hergebruiken de bestaande componentenstructuur en voegen de volgende, nieuwe componenten toe:

-   `src/lib/components/results/`
    -   `ExecutiveSummary.svelte`: De hero-sectie met de algemene score en samenvatting.
    -   `FindingsLayout.svelte`: De hoofdlayout die bevindingen groepeert op prioriteit.
    -   `FindingCard.svelte`: De basis-kaartweergave van een bevinding.
        -   Props: `finding: ScanFinding`
    -   `FindingDetail.svelte`: De uitklapbare weergave met het stappenplan en ROI. Wordt conditioneel gerenderd binnen `FindingCard`.
    -   `ProgressTracker.svelte`: Indicator die toont "3 van 8 acties voltooid".

**(Suggestie) State Management:**
Om de status (`is_completed`) van bevindingen over de componenten heen te synchroniseren, gebruiken we een Svelte *writable store*. Dit maakt de UI reactief en voorkomt complexe prop-drilling. Bij het markeren van een taak als voltooid, passen we een **optimistische UI** update toe voor een soepele gebruikerservaring.

## 3. PDF Generatie

Voor de PDF-rapportage stellen we een robuuste, server-side aanpak voor om consistentie en kwaliteit te waarborgen.

### 3.1. Architectuur: Supabase Edge Function

1.  **Creëer een Edge Function:** `supabase/functions/generate-pdf-report`.
2.  **Gebruik Deno-Puppeteer:** Deze functie gebruikt een browser-engine om een HTML-template om te zetten naar een PDF.
3.  **Input:** De functie accepteert een `scan_id` als parameter.
4.  **Proces:**
    a. Haalt de `scan_findings` op voor de gegeven `scan_id`.
    b. Rendert een private Svelte-component of HTML-template met deze data.
    c. Gebruikt Puppeteer om deze HTML-pagina "te printen" naar een PDF-buffer.
    d. Retourneert de PDF als een `Blob`.

### 3.2. Template

We kunnen een aparte set Svelte-componenten maken, geoptimaliseerd voor PDF-layout (`src/lib/components/pdf/`), die de data van de bevindingen gebruiken. Dit maximaliseert hergebruik van logica en styling (met print-specifieke CSS).

## 4. Implementatieplan (Fasering)

### Fase 1: Backend en Datamodel (5-8 dagen)
-   [ ] **1.1:** Finaliseren en migreren van het `scan_findings` Supabase schema.
-   [ ] **1.2:** Ontwikkelen van de nieuwe `RichFindingGenerationStrategy` voor de AI, inclusief prompt-engineering en output validatie (JSON-schema).
-   [ ] **1.3:** Creëren van een `seed` script om de database te vullen met test-bevindingen voor frontend-ontwikkeling.

### Fase 2: Web Resultaten Pagina (Frontend) (5-8 dagen)
-   [ ] **2.1:** Ontwikkelen van de nieuwe Svelte-componenten (`ExecutiveSummary`, `FindingCard`, etc.) in een readonly-staat.
-   [ ] **2.2:** Implementeren van data-fetching vanuit Supabase in de SvelteKit `+page.server.ts`.
-   [ ] **2.3:** Toevoegen van interactiviteit:
    -   Uitklapbare secties voor details.
    -   State management (Svelte store) voor `is_completed` status.
    -   Implementeren van de "Markeer als Gedaan" knop met optimistische UI updates.

### Fase 3: PDF Generatie (3-5 dagen)
-   [ ] **3.1:** Opzetten van de Supabase Edge Function `generate-pdf-report`.
-   [ ] **3.2:** Ontwikkelen van de HTML/CSS-template voor het PDF-rapport.
-   [ ] **3.3:** Integreren van de "Download PDF" knop op de web-interface, die de Edge Function aanroept.

### Fase 4: Testen en Afronding (2-3 dagen)
-   [ ] **4.1:** End-to-end testen van de volledige flow: van scan tot weergave en PDF-download.
-   [ ] **4.2:** Regressietesten om zeker te zijn dat bestaande functionaliteit niet is beïnvloed.
-   [ ] **4.3:** (Optioneel) Implementeren van de nieuwe weergave achter een feature flag.

## 5. Aanvullende Aanbevelingen (Lead Dev Input)

-   **Feature Flagging:** Om risico's te minimaliseren, introduceren we de nieuwe resultatenpagina via een feature flag in Supabase (bv. via een `config` tabel of PostgREST). Dit laat ons toe de feature te testen in productie voor specifieke gebruikers alvorens deze voor iedereen live te zetten.
-   **Generic Components:** De `FindingCard` moet zo generiek mogelijk worden opgezet, zodat deze met minimale aanpassingen ook kan dienen als basis voor de rijen in het PDF-template. Styling kan worden overschreven met CSS-variabelen of aparte stylesheets.
-   **I18n (Internationalisatie):** Hoewel de huidige focus Nederlands is, is het verstandig om UI-strings (zoals "Urgent", "Stappenplan") niet hard te coderen, maar via een i18n-bibliotheek te laten lopen. Dit vereenvoudigt toekomstige vertalingen.

---

## 6. Sessielog: Kick-off & Plan Review

**Datum:** 2024-07-26
**Aanwezig:** Lead Dev (LD), Product Owner (PO), Backend Dev (BD), Frontend Dev (FE), UX Designer (UX).

**Doel:** Het technische implementatieplan valideren, vragen beantwoorden en gezamenlijk begrip creëren.

### Discussie & Besluiten

**PO:** "Wat is het grootste risico in dit plan? En kunnen we sneller waarde leveren?"
**LD (Antwoord):** Het grootste risico is de **kwaliteit van de AI-output** (Fase 1.2). We mitigeren dit met *Prompt Chaining* en robuuste validatie. Om sneller waarde te leveren, **parallelliseren we Fase 1 en 2**: FE kan starten met de UI zodra de databasestructuur en testdata er zijn, terwijl BD werkt aan de AI-integratie.

**UX:** "Hoe zorgen we dat de AI-teksten persoonlijk en niet robotachtig aanvoelen, conform het concept?"
**LD (Antwoord):** Dit wordt bepaald door de **prompt-engineering**. We geven de AI context mee over de *tone-of-voice* en de doelgroep. De afgedwongen JSON-structuur zorgt ervoor dat de business impact altijd centraal staat. We itereren op de prompts tot de kwaliteit goed is.

**BD:** "Vervangen we het oude datamodel of draaien we parallel? En wat is de fallback als de AI faalt?"
**LD (Antwoord):** We kiezen voor een **parallelle aanpak** initieel. Het nieuwe `scan_findings` systeem draait naast het oude, achter een feature flag. Dit minimaliseert risico. De **fallback** bij een AI-fout is om een generieke, minder gedetailleerde bevinding op te slaan, zodat de scan nooit volledig mislukt.

**FE:** "Waarom een zware server-side PDF-generatie en geen lichtere client-side oplossing?"
**LD (Antwoord):** De server-side aanpak met Puppeteer **garandeert een pixel-perfecte, consistente PDF-output** die exact overeenkomt met ons professionele design. Client-side oplossingen zijn te onbetrouwbaar en inconsistent tussen verschillende browsers voor de vereiste kwaliteit. De acceptabele wachttijd voor een hoogwaardig rapport weegt op tegen de nadelen van client-side generatie.

### Conclusie
Het plan is goedgekeurd door het team. De risico's zijn geïdentificeerd en de mitigaties zijn duidelijk. De Q&A wordt aan dit document toegevoegd voor naslag.

# Technisch Implementatieplan: Verbeterde Scanresultaten

**Referentie:** [AIO Scanner Results & PDF Redesign Concept](aio_scanner_redesign_concept.md)

## Overzicht per Fase

| Fase | Subfase                       | Status | Eigenaar |
|------|-------------------------------|--------|----------|
| 1    | 1.1 DB Schema & Migratie      | ⬜ TODO | BD       |
| 1    | 1.2 AI Strategy Ontwikkeling  | ⬜ TODO | BD       |
| 1    | 1.3 Seed Script               | ⬜ TODO | BD       |
| 2    | 2.1 Svelte Componenten        | ⬜ TODO | FE       |
| 2    | 2.2 Data Fetching             | ⬜ TODO | FE       |
| 2    | 2.3 UI Interactiviteit        | ⬜ TODO | FE       |
| 3    | 3.1 PDF Edge Function         | ⬜ TODO | BD       |
| 3    | 3.2 PDF Template              | ⬜ TODO | FE       |
| 3    | 3.3 PDF UI Integratie         | ⬜ TODO | FE       |
| 4    | 4.1 End-to-End Testen         | ⬜ TODO | QA       |
| 4    | 4.2 Regressietesten           | ⬜ TODO | QA       |
| 4    | 4.3 Feature Flag Release      | ⬜ TODO | LD/PO    |

_Legenda status: ⬜ TODO · 🔄 IN PROGRESS · ✅ DONE_

## 1. Introductie & Doel

Dit document beschrijft de technische implementatie voor de herontwerp van de AIO Scanner resultatenpagina en PDF-rapportage. Het hoofddoel is om de huidige, technische checklist te transformeren naar een **business-impact-gedreven, gepersonaliseerde en actiegerichte ervaring** voor de gebruiker.

**Kernprincipes:**
- **Copy-First:** Maximaal hergebruik van de bestaande SvelteKit + Supabase architectuur.
- **Separation of Concerns (SoC):** Duidelijke scheiding tussen data-laag (Supabase), AI-logica (Prompts), en presentatie-laag (SvelteKit).
- **Don't Repeat Yourself (DRY):** Generieke componenten en functies voor zowel de web- als PDF-weergave.

---

## Fase 1: Backend & Datamodel (5-8 dagen)

**Doel:** De fundering leggen voor de verrijkte scanresultaten. Dit omvat het uitbreiden van het datamodel in Supabase en het ontwikkelen van de AI-logica die de nieuwe, contextrijke data kan genereren.

### 1.1. Architectuur: Database & AI

#### Nieuw Database Schema: `scan_findings`
We introduceren een nieuwe tabel `scan_findings` om de verrijkte resultaten op te slaan.

**Tabel: `scan_findings`**
```sql
CREATE TYPE finding_priority AS ENUM ('urgent', 'high_impact', 'recommended');

CREATE TABLE scan_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID REFERENCES scans(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT NOT NULL,
    priority finding_priority NOT NULL,
    time_estimate_minutes INT,
    problem_statement TEXT,
    solution_summary TEXT,
    business_impact_summary TEXT, -- e.g., "+25% conversie"
    implementation_steps JSONB, -- { "title": "Stap 1", "description": "..." }[]
    roi_analysis JSONB, -- { "investment": "...", "return": "...", "calculation": "..." }
    before_after_example JSONB, -- { "before": "...", "after": "..." }
    is_completed BOOLEAN DEFAULT FALSE,
    category TEXT -- e.g., 'SEO', 'Content', 'Technical'
);
```
- **Overwegingen:** `JSONB` biedt flexibiliteit voor gestructureerde data. De `priority` ENUM zorgt voor consistentie.

#### Aanpassing AI Prompt Strategieën
De bestaande AI-logica wordt aangepast om de velden in de `scan_findings` tabel te vullen.
1.  **Hergebruik:** We bouwen voort op de `refactor-prompt-management` inspanning en maken een nieuwe `RichFindingGenerationStrategy`.
2.  **Output Structuur:** De prompt wordt ontworpen om een JSON-array te genereren die overeenkomt met de `scan_findings` structuur.
3.  **Suggestie (Prompt Chaining):** Om betrouwbaarheid te verhogen, splitsen we de AI-taak op:
    *   **Prompt 1 (Identificatie):** Identificeert kernproblemen.
    *   **Prompt 2 (Verrijking):** Genereert voor elk probleem de business context, ROI en stappenplan.

### 1.2. Taken
-   [ ] **1.1:** Finaliseren en migreren van het `scan_findings` Supabase schema via een SQL-migratiebestand in `supabase/migrations/` (bijv. `20250726_scan_findings.sql`).
-   [ ] **1.2:** Ontwikkelen van de nieuwe `RichFindingGenerationStrategy` voor de AI, inclusief prompt-engineering en output validatie (JSON-schema).
-   [ ] **1.3:** Creëren van een `seed` script om de database te vullen met test-bevindingen voor frontend-ontwikkeling.

#### Definition of Done
* Migratiebestand `supabase/migrations/20250726_scan_findings.sql` succesvol uitgerold in DEV en STAGING.
* `scan_findings` tabel zichtbaar in Supabase Studio en bevat testdata.
* `RichFindingGenerationStrategy` produceert valide JSON volgens schema (> 95 % succesrate in unit-tests).
* Seed-script levert ≥ 20 dummy findings verdeeld over alle prioriteiten.

---

## Fase 2: Web Resultaten Pagina (Frontend) (5-8 dagen)

**Doel:** De nieuwe, verrijkte data visualiseren in een actiegerichte en gebruiksvriendelijke webinterface, volledig in lijn met het UX/UI-concept.

### 2.1. Architectuur: SvelteKit

#### Data Models (TypeScript)
We definiëren een `ScanFinding` interface in `src/lib/types/scan.ts` voor type-safety, die het `scan_findings` schema spiegelt.
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

#### Componenten Structuur (`src/lib/components/results/`)
We ontwikkelen de volgende herbruikbare componenten:
-   `ExecutiveSummary.svelte`: De hero-sectie met de algemene score.
-   `FindingsLayout.svelte`: Groepeert bevindingen op prioriteit (`urgent`, etc.).
-   `FindingCard.svelte`: De compacte kaartweergave van een bevinding.
-   `FindingDetail.svelte`: De uitklapbare weergave met stappenplan en ROI.
-   `ProgressTracker.svelte`: Indicator voor voltooide acties.

#### State Management
We gebruiken een Svelte *writable store* om de `is_completed` status van bevindingen te beheren. Dit zorgt voor een reactieve UI en maakt optimistische updates mogelijk voor een soepele gebruikerservaring.

### 2.2. Taken
-   [ ] **2.1:** Ontwikkelen van de nieuwe Svelte-componenten in een readonly-staat.
-   [ ] **2.2:** Implementeren van data-fetching vanuit Supabase in de SvelteKit `+page.server.ts`.
-   [ ] **2.3:** Toevoegen van interactiviteit:
    -   Uitklapbare secties voor details.
    -   State management (Svelte store) voor `is_completed` status.
    -   Implementeren van de "Markeer als Gedaan" knop met optimistische UI updates.

#### Definition of Done
* Alle componenten renderen zonder console-errors in Storybook.
* Data-fetch via Supabase in `+page.server.ts` ≤ 500 ms in DEV.
* "Markeer als Gedaan" update UI én Supabase binnen 1 s (optimistisch schrijven).
* UX-review: pixel-perfect voor desktop (≥ 1280 px) en mobile (≤ 375 px).

---

## Fase 3: PDF Generatie (3-5 dagen)

**Doel:** Een professioneel, pixel-perfect PDF-rapport genereren op basis van de scanresultaten, geschikt voor offline gebruik en presentaties.

### 3.1. Architectuur: Supabase Edge Function

1.  **Creëer een Edge Function:** `supabase/functions/generate-pdf-report`.
2.  **Technologie:** We gebruiken Deno-Puppeteer om een HTML-template server-side om te zetten naar een PDF. Dit garandeert een consistente, hoogwaardige output.
3.  **Proces:**
    a. De functie ontvangt een `scan_id`.
    b. Haalt alle bijbehorende `scan_findings` op.
    c. Rendert een HTML-template met deze data.
    d. "Print" de pagina naar een PDF en retourneert deze.

### 3.2. Taken
-   [ ] **3.1:** Opzetten van de Supabase Edge Function `generate-pdf-report`.
-   [ ] **3.2:** Ontwikkelen van de HTML/CSS-template voor het PDF-rapport (eventueel met `src/lib/components/pdf/` componenten).
-   [ ] **3.3:** Integreren van de "Download PDF" knop op de web-interface die de Edge Function aanroept.

#### Definition of Done
* Edge Function gedeployed; PDF ≤ 5 MB en gegenereerd < 20 s (p95).
* Visuele regressietest (Percy) toont < 1 % afwijking t.o.v. Figma-design.
* Download-knop retourneert HTTP 200 met correcte `Content-Disposition`-header.

---

## Fase 4: Testen en Afronding (2-3 dagen)

**Doel:** De kwaliteit en correcte werking van de volledige flow waarborgen en de feature gecontroleerd uitrollen naar productie.

### 4.1. Taken
-   [ ] **4.1:** End-to-end testen van de volledige flow: van scan tot weergave en PDF-download.
-   [ ] **4.2:** Regressietesten om zeker te zijn dat bestaande functionaliteit niet is beïnvloed.
-   [ ] **4.3:** Implementeren en testen van de nieuwe weergave achter een feature flag.

#### Definition of Done
* Cypress E2E-suite (≥ 15 scenario’s) slaagt in CI.
* Regressietest baseline < 0,5 % UI-afwijking.
* Feature-flag `scan_results_v2` kan live togglen zonder downtime.

---

## Algemene Aanbevelingen

-   **Feature Flagging:** Om risico's te minimaliseren, introduceren we de nieuwe resultatenpagina via een feature flag in Supabase. Dit laat ons toe de feature te testen in productie voor specifieke gebruikers.
-   **Generic Components:** De `FindingCard` moet zo generiek mogelijk worden opgezet, zodat deze met minimale aanpassingen ook kan dienen als basis voor de rijen in het PDF-template.
-   **I18n (Internationalisatie):** Hoewel de focus Nederlands is, coderen we UI-strings niet hard, maar gebruiken we een i18n-bibliotheek ter voorbereiding op toekomstige vertalingen.

---

## Sessielog: Kick-off & Plan Review

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

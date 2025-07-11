# AIO Scanner: Project Samenvatting

AIO Scanner is een SvelteKit webapplicatie voor het analyseren van websites op hun online aanwezigheid en AI-gereedheid. Het genereert AI-verrijkte PDF-rapporten.

### Kernfunctionaliteit
1.  **URL Scan:** Haalt webcontent op via Playwright/Cheerio.
2.  **Patroon Analyse:** Evalueert content met modulaire `ScanModules` (SEO, Schema, AI-content, etc.).
3.  **AI-verrijking:** Gebruikt Google Vertex AI voor diepgaande analyse en rapportage.
4.  **Rapportage:** Genereert PDF-rapporten.

### Technische Architectuur
-   **Framework:** **SvelteKit** (Full-stack TypeScript)
-   **Backend & DB:** **Supabase**
-   **AI:** **Google Vertex AI**
-   **Betalingen:** **Mollie**
-   **Styling:** **Tailwind CSS** & `shadcn-svelte`

### Scan Engine: Strategy Pattern
De `ScanOrchestrator` gebruikt een **Strategy Pattern** om verschillende analyseniveaus (tiers) zoals `starter` en `business` aan te bieden. Een `TierStrategyFactory` selecteert de juiste strategie, die bepaalt welke modules worden uitgevoerd en hoe diep de AI-analyse gaat.

-   **Locatie:** `src/lib/scan/ScanOrchestrator.ts`
-   **Modules:** `src/lib/scan/modules/`
-   **Configuratie:** `patterns/*.json`

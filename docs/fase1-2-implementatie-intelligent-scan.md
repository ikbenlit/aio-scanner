# Technisch Implementatieplan: Verbeterde AIO Scanner (Gedetailleerd)

**Doel:** De AIO Scanner transformeren naar een betrouwbare, waardevolle service voor de Starter en Business tiers. Dit document dient als leidraad voor de development sprints.

---

## 1. Projectoverzicht & Status

| Fase | Sub-fase / Deliverable | Status | Verantwoordelijke(n) | Notities |
| :--- | :--- | :--- | :--- | :--- |
| **Fase 1** | 1.1 Data-Acquisitie Engine (`Playwright`) | ✅ Voltooid | Backend | Strategy pattern geïmplementeerd |
| | 1.2 "Slimme" Analyse Modules | ✅ Voltooid | Backend | Evidence + suggestions geïmplementeerd |
| | 1.3 Frontend Integratie & PDF Rapportage | ✅ Voltooid | Frontend, Backend, UX | SmartFindingCard geïntegreerd |
| | 1.4 Finale Integratie & Verificatie | ✅ Voltooid | Frontend, UX | End-to-end pipeline geverifieerd |
| **Fase 2** | 2.1 `CrawlManager` Service & Database | ⏳ Gepland | Backend | Enige grote nieuwbouw |
| | 2.2 Async API & Frontend voor Crawling | ⏳ Gepland | Backend, Frontend, UX | Complexe user journey |
| **Fase 3** | 3.1 Hybride AI-Analyse (Backend) | ⏳ Gepland | Backend | Vereist prompt engineering |
| | 3.2 UI Verfijning voor AI-inzichten | ⏳ Gepland | Frontend, UX | Communicatie is key |

---

## 2. Architecturale Principes

Alle ontwikkeling volgt deze kernprincipes:
*   **DRY (Don't Repeat Yourself):** Hergebruik bestaande componenten maximaal.
*   **SOC (Separation of Concerns):** Isoleer nieuwe functionaliteit in eigen services/modules.
*   **Slanke `ScanOrchestrator`:** De orkestrator delegeert taken en bevat zelf minimale logica.
*   **Maximaal Hergebruik:** Leun op de bestaande codebase (`Playwright`, `VertexAIClient`, etc.).

---

## Fase 1: De Fundering - De Perfecte Single-Page Scanner (Starter Tier)

**Doel:** Een gebruiker met een Starter-abonnement kan één pagina scannen en krijgt een 100% betrouwbaar en uiterst waardevol, specifiek rapport.

### **Sub-fase 1.1: Data-Acquisitie Engine**

*   **Doel:** Garanderen dat we altijd 100% correcte, volledig gerenderde HTML ophalen.
*   **Backend Engineer Taken:**
    1.  **Refactor `ContentFetcher.ts`:** Pas de `execute` methode aan om een `strategy: 'fetch' | 'playwright'` parameter te accepteren.
    2.  **Implementeer Playwright Strategie:** Voor de `'playwright'` strategie, gebruik de volgende instellingen: `waitUntil: 'networkidle0'`, een realistische `User-Agent` (bv. een recente Chrome-versie op Windows), en een configureerbare timeout van 30 seconden.
    3.  **Implementeer Error Handling:** Zorg dat de `PlaywrightFetcher` een gestructureerd error-object teruggeeft bij een timeout, 4xx/5xx statuscode, of andere browser-error.
    4.  **Update `ScanOrchestrator`:** Pas de `ScanOrchestrator` (of de laag erboven) aan zodat deze op basis van de gebruikerstier de juiste `strategy` doorgeeft aan de `ContentFetcher` ('fetch' voor Basic, 'playwright' voor Starter+).

### **Sub-fase 1.2: "Slimme" Analyse Modules**

*   **Doel:** De output van de modules transformeren van generiek naar specifiek en actiegericht.
*   **Backend Engineer Taken:**
    1.  **Pas `Finding` Interface aan:** Voeg in `src/lib/types/scan.ts` de optionele velden `evidence?: string[]` en `suggestion?: string` toe. Als een veld geen data bevat, wordt de key niet meegestuurd in de JSON-response.
    2.  **Refactor Module Logica:** Herschrijf de `analyze...` functies in `AIContentModule` en `AICitationModule` als eerste prioriteit. De logica moet de contextuele zin opslaan in `evidence` (maximaal 3 items).
    3.  **Genereer Suggestions:** Formuleer een concrete en bruikbare `suggestion`.

### **Sub-fase 1.3: Rapportage & Frontend Integratie**

*   **Doel:** De nieuwe, rijke data op een heldere manier presenteren aan de gebruiker.
*   **Backend Engineer Taken:**
    1.  **Verrijk AI-Prompt voor PDF:** Gebruik `PromptFactory.create('narrative')` om narrative prompts te genereren. De PromptFactory strategie zorgt ervoor dat de AI de nieuwe `evidence` en `suggestion` velden gebruikt voor een rijkere samenvatting.
*   **Frontend Engineer Taken:**
    1.  **Ontwikkel `SmartFindingCard.svelte`:** Bouw de Svelte-component die conditioneel (`{#if ...}`) de `evidence` en `suggestion` toont na een klik op een "Toon details & suggestie" knop.
    2.  **Implementeer PDF Download Flow:** De knop `Download PDF met AI-samenvatting` toont een loading state met de tekst: `Een moment geduld, onze AI stelt uw persoonlijke rapport samen...`.
*   **UX Expert Taken:**
    1.  **Ontwerp `SmartFindingCard`:** Ontwerp een ingeklapte kaart die de `evidence` (als `<blockquote>`, max 3) en `suggestion` (met gloeilamp-icoon) toont na een klik. De knoptekst wisselt tussen `Toon details & suggestie` en `Verberg details`.
    2.  **Definieer PDF User Journey:** Finaliseer alle copy voor de PDF-flow.

### **Sub-fase 1.4: Finale Integratie & Verificatie**

*   **Doel:** De gebouwde `SmartFindingCard`-component en de verbeterde PDF-flow daadwerkelijk integreren in de scanresultatenpagina en de end-to-end gebruikerservaring verifiëren.
*   **Frontend Engineer Taken:**
    1.  **Integratie `SmartFindingCard`:** Vervang de oude resultaatkaart in `/src/routes/scan/[id]/+page.svelte` door de nieuwe `<SmartFindingCard {finding} />` component binnen de `{#each}` loop.
*   **Frontend Engineer & UX Expert Taken:**
    1.  **End-to-End Verificatie:** Voer een volledige test uit volgens het testprotocol:
        *   [ ] Werkt de `SmartFindingCard` (in/uitklappen, conditionele weergave knop)?
        *   [ ] Werkt de volledige PDF-flow (knop, loading state, download)?
        *   [ ] Is de weergave correct op mobiele formaten?
*   **Lead Dev & UX Expert Taken:**
    1.  **Finale Goedkeuring:** UX geeft finale 'go' op de user experience. Lead Dev werkt de status van sub-fase 1.3 bij na succesvolle afronding.

### **Definition of Done voor Fase 1:**
*   Een gebruiker met een Starter-tier kan een JavaScript-zware website scannen en krijgt correcte resultaten.
*   De resultatenpagina toont gedetailleerde bevindingen inclusief concrete voorbeelden (`evidence`) en suggesties.
*   De gebruiker kan een PDF downloaden met daarin een AI-gegenereerde samenvatting die is gebaseerd op de slimme bevindingen.

---

## Fase 2: De Opschaling - Site-Wide Analyse (Business Tier)

**Doel:** De Business-tier introduceren met een Site-Wide Crawl, terwijl de mogelijkheid voor een hoogwaardige Single-Page Scan behouden blijft.

### **Sub-fase 2.1: `CrawlManager` Service & Database**

*   **Doel:** De backend-infrastructuur bouwen om een volledige website te kunnen scannen.
*   **Backend Engineer Taken:**
    1.  **Ontwikkel `CrawlManager.ts`:** Bouw deze geïsoleerde service. De service beheert een wachtrij, respecteert `robots.txt`, en roept de `SinglePageAnalyzer` aan. Limieten: max 250 pagina's, max diepte 5.
    2.  **Ontwerp Database Schema:** Implementeer de tabellen in Supabase:
        *   `crawls` (`id`, `user_id`, `root_url`, `status ('pending', 'running', 'completed', 'failed')`, `created_at`).
        *   `crawl_pages` (`id`, `crawl_id`, `url`, `status`, `http_status`, `scan_result_id` (FK)).
    3.  **Implementeer Asynchrone API Endpoints:**
        *   `POST /api/scan/crawl`: Start de crawl.
        *   `GET /api/scan/crawl/:id`: Geeft de status terug. **API Contract:** `{ "crawlId", "rootUrl", "status", "pagesScanned", "createdAt", "reportUrl"? }`. De `status` is één van: `pending`, `running`, `completed`, `failed`. `reportUrl` wordt toegevoegd bij `completed`.
        *   `GET /api/scan/results/crawl/:id`: **Nieuw endpoint.** Geeft de volledige (gepagineerde) resultatenlijst van een voltooide crawl.

### **Sub-fase 2.2: Frontend voor Crawling**

*   **Doel:** Een intuïtieve interface bieden voor het starten en monitoren van een langdurige crawl.
*   **Frontend Engineer Taken:**
    1.  **Bouw Crawl-Interface:** Een startpagina (`Analyseer uw volledige website`) en een "in progress" pagina die de status-endpoint pollt en de `pagesScanned` teller toont.
    2.  **Visualiseer Site-Wide Resultaten:** Bouw het dashboard. Na voltooiing van de poll, roep het nieuwe `GET /api/scan/results/crawl/:id` endpoint aan om de data op te halen voor de statistieken en de filterbare tabel.
*   **UX Expert Taken:**
    1.  **Ontwerp de Crawl Flow:** Definieer de volledige journey, inclusief de geruststellende "in progress" pagina (`Uw site wordt geanalyseerd...`) en de mensvriendelijke error state (`De scan is onverwacht gestopt...`).
    2.  **Ontwerp de Data Visualisatie:** Werk het dashboard-ontwerp uit, met focus op de belangrijkste site-brede inzichten en de interactieve tabel.
    3.  **Schrijf E-mailnotificatie:** Stel de e-mail op die wordt verstuurd bij voltooiing, met als onderwerp: `✅ Uw site-analyse voor [domeinnaam] is voltooid!`.

### **Definition of Done voor Fase 2:**
*   Een Business-gebruiker kan een site-brede scan starten.
*   De UI toont de voortgang van de scan en een duidelijk dashboard na voltooiing.
*   Vanuit het dashboard kan een gebruiker een nieuwe Single-Page scan starten voor een specifieke URL.

*(Fase 3: De Hybride AI-Verfijning wordt hierna gepland.)*

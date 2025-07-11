# Technisch Implementatieplan: Van MVP naar Intelligente AIO-Scanner

**Status:** Definitief Voorstel
**Auteur:** Gemini AI & Team
**Datum:** 17 juli 2024

## 1. Visie & Leidend Principe

Alle technische en functionele keuzes in dit plan worden gemaakt met één leidend principe in gedachten:

> **De AIO Scanner moet de gebruiker helpen te begrijpen hoe zijn website wordt geïnterpreteerd door Large Language Models (LLM's) en AI-gedreven zoekmachines, en concrete handvatten bieden om die vindbaarheid en representatie te optimaliseren.**

Dit betekent dat we niet focussen op traditionele SEO-metrics, maar op signalen die bijdragen aan autoriteit, betrouwbaarheid, citeerbaarheid en contextuele relevantie in de ogen van een AI.

## 2. Probleemstelling

De huidige scanner schiet tekort in het vervullen van deze visie door twee fundamentele beperkingen:
1.  **Onbetrouwbare Data-Input:** De `fetch`-gebaseerde methode voor het ophalen van HTML is onbetrouwbaar voor moderne websites, waardoor we niet zien wat een geavanceerde AI-crawler ziet.
2.  **Generieke Analyse:** De huidige scanmodules zijn contextloos. Ze *tellen* patronen in plaats van ze te *begrijpen* vanuit het perspectief van een LLM.

## 3. De Drie Tiers: Een Duidelijke Waardeladder

De nieuwe functionaliteit wordt direct gekoppeld aan een heldere tier-structuur. Elke stap omhoog ontgrendelt een fundamenteel krachtigere mogelijkheid om de website "AI-ready" te maken.

| Functionaliteit | Basic (Kennismaking) | Starter (Perfecte Pagina-Analyse) | Business (Complete Site-Analyse) |
| :--- | :--- | :--- | :--- |
| **Data Ophalen** | Standaard `fetch` (onbetrouwbaar) | **Playwright** (100% accuraat) | **Playwright** |
| **Analyse Methode**| "Domme" Modules (contextloos) | **"Slimme" Modules** (contextueel) | "Slimme" Modules + **Hybride AI-Scan** |
| **Scan Scope** | Single Page | Single Page | **Site-Wide Crawl** (tot 250p) |
| **Online Rapport** | Basis | Gedetailleerd & Specifiek | Gedetailleerd + **Directe AI-inzichten** |
| **PDF Export** | Nee | Ja | Ja (met rijkere data) |
| **AI in PDF** | Nee | **AI-gegenereerde Samenvatting** | Samenvatting op basis van rijkere data|
| **KEY UPGRADE** | - | **Betrouwbaarheid & Kwaliteit** | **Scope & Diepgang** |

## 4. Gefaseerd Implementatieplan (3 Fases)

We rollen dit plan uit in drie logische, sequentiële fases.

### Fase 1: De Fundering - De Perfecte Single-Page Scanner (Starter Tier)
*   **Doel:** De kernpropositie van de Starter-tier waarmaken: een 100% betrouwbare en waardevolle analyse voor één enkele pagina, met het oog op AI-optimalisatie.
*   **Technische Acties:**
    1.  **Playwright Implementatie:** De `fetch`-methode in de `ScanOrchestrator` wordt voor alle betaalde scans vervangen door een robuuste `PlaywrightFetcher` service.
    2.  **"Slimme" Modules Ontwikkelen:** De logica van de bestaande modules wordt herschreven. De focus ligt op het citeren van `evidence` en het doen van `suggestions` die direct bijdragen aan de AI-optimalisatie (bv. citeerbare zinnen, E-E-A-T signalen).
    3.  **PDF met AI-Samenvatting:** Implementeer de PDF-exportfunctie. Na de analyse door de slimme modules wordt de lijst met `Findings` naar Vertex AI gestuurd om een managementsamenvatting te genereren, geframed rondom de AIO-doelstelling.
*   **Resultaat na Fase 1:** De Starter-tier is volledig functioneel en levert significant meer waarde voor AIO dan het huidige product.

### Fase 2: De Opschaling - Site-Wide Analyse (Business Tier)
*   **Doel:** De Business-tier introduceren met de Site-Wide Crawl als de belangrijkste, onmisbare feature voor een holistische AIO-strategie.
*   **Technische Acties:**
    1.  **Crawl-Module Ontwikkelen:** Bouw de logica voor het crawlen van een website. Dit omvat het beheren van een URL-wachtrij, het detecteren van interne links, en het aanroepen van de in Fase 1 gebouwde `SinglePageAnalyzer` voor elke pagina.
    2.  **State Management:** Zet een systeem op (bijv. in Supabase) om de voortgang van lange scans op te slaan.
    3.  **UI voor Crawling:** Ontwikkel de interface om een site-brede scan te starten en de geaggregeerde resultaten weer te geven.
*   **Resultaat na Fase 2:** Gebruikers kunnen volledige websites analyseren op AIO-consistentie, wat de Business-tier een duidelijke meerwaarde geeft.

### Fase 3: De Verfijning - Hybride AI-Intelligentie (Business Tier)
*   **Doel:** De Business-tier verder verrijken met een diepere laag aan intelligentie, door een AI te gebruiken om te beoordelen hoe een andere AI de site zou zien.
*   **Technische Acties:**
    1.  **Hybride AI-integratie:** Pas de "Slimme Modules" aan. Voor bepaalde, genuanceerde analyses (bv. E-E-A-T, Tone of Voice) roepen deze modules *tijdens de scan* de hulp in van Vertex AI.
    2.  **Prompt Engineering:** Ontwikkel specifieke, gerichte prompts die de AI instrueren te redeneren als een LLM die content zoekt.
    3.  **Resultaten Integreren:** Zorg ervoor dat de door AI gegenereerde inzichten naadloos worden geïntegreerd in de online en PDF-rapporten van de Business-tier.
*   **Resultaat na Fase 3:** Het volledige productportfolio voor Basic, Starter en Business is geïmplementeerd en de waardepropositie per tier is kraakhelder en volledig gericht op AIO.

## 5. Analyse van de Huidige Codebase & Implementatie-strategie

Een gedetailleerde analyse van de codebase toont aan dat het project verrassend goed is voorbereid op deze evolutie. Veel van de benodigde "zware" componenten (Playwright, AI-integratie) zijn al aanwezig. De implementatie zal zich daarom richten op het **herpositioneren en verfijnen** van deze componenten, met minimale nieuwbouw, met de principes van DRY (Don't Repeat Yourself) en SOC (Separation of Concerns) en een slanke `ScanOrchestrator` als leidraad.

### Implementatie per Fase

#### Fase 1: De Fundering (Starter Tier)

*   **Playwright Implementatie:**
    *   **Bestaande Code:** `src/lib/scan/ContentFetcher.ts` bevat al een `fetchWithPlaywright` methode.
    *   **Actie:** We bouwen **geen nieuwe fetcher**. We refactoren `ContentFetcher.ts` om een `strategy` ('fetch' of 'playwright') te accepteren. De `ScanOrchestrator` delegeert de keuze van de strategie aan de `ContentFetcher` op basis van de gebruikerstier, en blijft zelf slank.

*   **"Slimme" Modules Ontwikkelen:**
    *   **Bestaande Code:** Alle modules in `src/lib/scan/modules/` en de `Finding` interface in `src/lib/types/scan.ts`.
    *   **Actie:** We passen de `Finding` interface aan met optionele `evidence` en `suggestion` velden. Vervolgens herschrijven we de interne logica van de modules om context te verzamelen en specifieke aanbevelingen te formuleren. De aanpassingen zijn lokaal per module (SOC).

*   **PDF met AI-Samenvatting:**
    *   **Bestaande Code:** De `pdf/generator.ts` en de `VertexAIClient` in `src/lib/ai/vertexClient.ts`.
    *   **Actie:** We hergebruiken de bestaande services (DRY). De workflow wordt gevoed met de rijkere `Finding`-objecten en de prompt voor de AI wordt verfijnd om gebruik te maken van deze nieuwe, gedetailleerde data.

#### Fase 2: De Opschaling (Business Tier)

*   **Crawl-Module Ontwikkelen:**
    *   **Bestaande Code:** Dit is de **enige significante nieuwbouw**.
    *   **Actie:** We creëren een nieuwe, afzonderlijke `CrawlManager.ts` service (SOC). Deze service gebruikt de bestaande `SinglePageAnalyzer`-logica als dependency (DRY) en roept deze aan voor elke gevonden URL. De `ScanOrchestrator` wordt hier niet mee belast. Link-extractie kan worden toegevoegd als een functie aan de bestaande `ContentExtractor.ts`.

#### Fase 3: De Verfijning (Business Tier)

*   **Hybride AI-integratie:**
    *   **Bestaande Code:** De "Slimme" Modules en de `VertexAIClient`.
    *   **Actie:** We leggen een nieuwe verbinding door de `VertexAIClient` beschikbaar te maken voor de modules (bv. via dependency injection). De modules kunnen dan, waar nodig, zelfstandig de hulp inroepen van de AI voor een diepgaande analyse op een specifiek punt (SOC), waarbij de AI-service wordt hergebruikt (DRY).

### Analyse van de Huidige Prompting

De codebase bevat een geavanceerde `VertexAIClient` (`src/lib/ai/vertexClient.ts`) met een gecentraliseerd PromptFactory systeem:
1.  `InsightsPromptStrategy`: Voor diepgaande, gestructureerde analyse.
2.  `NarrativePromptStrategy`: Voor het genereren van verhalende samenvattingen.
3.  `EnterprisePromptStrategy`: Voor enterprise-level strategische rapporten.

Deze prompts zijn goed ontworpen en worden beheerd via het PromptFactory pattern voor maximale herbruikbaarheid en onderhoudbaarheid.

**Actieplan voor Prompting:**
1.  **Gebruik** het bestaande PromptFactory systeem om consistent prompts te genereren die de rijkere `evidence` en `suggestion` velden optimaal benutten.
2.  **Ontwikkel** nieuwe, zeer specifieke en beknopte prompts voor de "Hybride AI-Scan" (Fase 3). Deze prompts moeten de AI instrueren om als een specialist een chirurgische analyse op een klein stukje data uit te voeren en het resultaat in een strak, voorspelbaar JSON-formaat terug te geven.

## 6. Volgende Stappen
1.  **Goedkeuring:** Finaliseer en keur dit gefocuste plan goed.
2.  **Backlog Opstellen:** Breek de acties uit de drie fases op in concrete user stories en technische taken, met de AIO-visie als leidraad.
3.  **Start Fase 1:** Het development team begint met de implementatie van de `PlaywrightFetcher` en de "Slimme Modules".

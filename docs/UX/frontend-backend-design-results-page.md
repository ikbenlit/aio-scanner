# Technisch Ontwerp: Resultaten-Dashboard (MVP)

**Datum:** 17 Juli 2024
**Status:** Definitief MVP Plan
**Gebaseerd op:** `docs/UX/results-dashboard-brainstorm.md`

## 1. Doel van de MVP (Product Owner)

Het doel van deze eerste versie is om de **kernwaarde** van de scanresultaten te leveren aan onze twee primaire persona's, met een focus op snelheid van ontwikkeling en het verzamelen van feedback.

-   **Voor Marlies (Ondernemer):** Een direct, helder overzicht van de algehele score en de top 3 meest impactvolle actiepunten, inclusief een simpele uitleg.
-   **Voor Sven (Expert):** Toegang tot de volledige, onbewerkte lijst van alle bevindingen, sorteerbaar op prioriteit, inclusief de technische bewijsvoering.

We bouwen een **desktop-first** versie die functioneel is op touchscreens, maar we stellen de volledig geoptimaliseerde mobiele 'Drill-Down View' en de complexe dynamische filters uit naar een volgende fase.

---

## 2. Backend Ontwerp (Backend Engineer)

### 2.1 API Endpoint

Er wordt één primair endpoint ontwikkeld voor het ophalen van de resultaten.

-   **Endpoint:** `GET /api/scan/results/[scanId]`
-   **Respons:** Geeft een enkel, uitgebreid JSON-object terug dat alle benodigde data voor de MVP bevat. Dit voorkomt meerdere netwerk-requests aan de client-zijde. De respons moet ook een samenvattend `metadata` object bevatten (bv. `findingStats: { total: 128, high: 15 }`) voor toekomstige features zoals paginering.

### 2.2 Datastructuur (JSON Respons & Database)

De API-respons en de onderliggende datamodellen moeten de volgende structuur ondersteunen.

```typescript
// Voorbeeld van de API-respons structuur
interface ScanResultResponse {
  scanId: string;
  url: string;
  screenshotUrl?: string;
  overallScore: number;
  summary: {
    management: string; // Korte AI-samenvatting
  };
  moduleScores: {
    name: 'Vindbaarheid' | 'Vertrouwen & Autoriteit' | 'Conversiepotentieel' | 'Actualiteit';
    score: number;
  }[];
  findings: Finding[]; // Volledige lijst van alle bevindingen
  findingStats: { // Nieuw metadata object
    total: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface Finding {
  id: string;
  title: string;
  description: string; // De "Waarom is dit belangrijk?" tekst
  recommendation: string; // De "Hoe los je dit op?" tekst
  priority: 'high' | 'medium' | 'low';
  module: string; // Naam van de module waar de finding bij hoort
  evidence?: Evidence; // Het technische bewijsmateriaal
}

// Het 'evidence' object is flexibel om verschillende soorten bewijs te ondersteunen
interface Evidence {
  type: 'code_snippet' | 'raw_data' | 'json_ld';
  content: string | Record<string, any>;
  language?: 'html' | 'css' | 'json'; // Voor syntax highlighting
  notes?: string; // Bv. "Gevonden op regel 84"
}
```

### 2.3 Aanpassing Scan Engine

Dit is een significante taak die gefaseerd wordt uitgevoerd.
- **Vereiste:** Elke scanmodule moet worden geüpdatet om het specifieke `evidence`-fragment te extraheren.
- **Consistentie:** Er wordt een centrale 'helper'-functie (bv. `createCodeEvidence()`) ontwikkeld die modules moeten gebruiken om `evidence`-objecten te creëren. Dit garandeert een consistente datastructuur.
- **Ontkoppeling:** Voor de MVP wordt een placeholder-strategie voor AI-samenvattingen gehanteerd. Als een AI-summary nog niet beschikbaar is, wordt een generieke tekst teruggegeven.

---

## 3. Frontend Ontwerp (Frontend Engineer)

### 3.1 Componenten Architectuur (Svelte)

De interface wordt opgebouwd uit de volgende herbruikbare componenten:
-   `ResultsPage.svelte`: De hoofdpagina die de data ophaalt en de layout beheert.
-   `ResultsHeader.svelte`: De permanente header (score, screenshot, samenvatting).
-   `CategoryOverview.svelte`: Container voor de `CategoryCard` componenten.
-   `TopActionItems.svelte`: Toont de top 3 bevindingen. Elke item opent de `ActionItemModal`.
-   `ActionItemModal.svelte`: Een "domme" modal die de `description` en `recommendation` als props ontvangt.
-   **Nieuwe Pagina:** `[scanId]/results/findings/index.svelte`: Aparte pagina voor de volledige lijst met bevindingen.
-   `FindingsTable.svelte`: De tabel op de detailpagina, met logica voor het sorteren.
-   `FindingRow.svelte`: Een rij in de tabel. Bevat de logica voor het uitklappen en het aansturen van de `EvidenceViewer`.
-   `EvidenceViewer.svelte`: Een "domme" component die de `evidence` als prop ontvangt en rendert, inclusief syntax highlighting.

### 3.2 State Management & Data Flow

-   **Data Laden:** De `ResultsPage` laadt de initiële data. Bij navigatie naar de `findings`-detailpagina wordt de al opgehaalde data **hergebruikt via een client-side store (bv. SvelteKit page store)** om een onnodige netwerk-request te voorkomen.
-   **Client-side State:** De sorteerstatus van de `FindingsTable` wordt lokaal in die component beheerd.

### 3.3 Styling (Look & Feel)

-   **Thema:** We starten met de implementatie van **Smaak A: "Clean & Focused" (Licht Thema)**.
-   **Techniek:** We gebruiken CSS Custom Properties (variabelen), wat een latere toevoeging van een donker thema vereenvoudigt.
-   **MVP Interaction:** Om de verwachtingen van de gebruiker te managen, zullen de niet-interactieve categoriekaarten in de MVP **geen hover-effecten** hebben.

---

## 4. URL Structuur

Om de applicatie logisch en RESTful te structureren, wordt de volgende URL-structuur gehanteerd:
- `/scan/[id]/results/`: De overzichtspagina van het dashboard (MVP).
- `/scan/[id]/results/findings/`: De detailpagina met de volledige lijst van bevindingen.

---

## 5. Gefaseerd Ontwikkelplan (Product Owner)

### Fase 1: MVP (Huidige Scope)
- Implementatie van alle hierboven beschreven punten.
- **Doel:** Werkende, stabiele versie die de kernwaarde levert.

### Fase 2: Fast Follow (Na MVP-feedback)
- Het dashboard **interactief** maken: categoriekaarten worden filters.
- De aparte detailpagina vervangen door de **"Spotlight-Focus"** modal op desktop.
- **Geavanceerde filtering** toevoegen aan de `FindingsTable`.

### Fase 3: Toekomst
- Implementatie van de volledig geoptimaliseerde mobiele **"Drill-Down View"**.
- Toevoegen van **"Voor/Na"**-visualisaties.
- **Export-functionaliteit** naar Jira/Notion.
- Een optioneel **donker thema**.

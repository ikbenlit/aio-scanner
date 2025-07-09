# Plan: Finalize AIO Scanner MVP

> **🔧 CONTEXT:** Afronden van de laatste 10-15% van de AIO Scanner. Focus op het productieklaar maken van de frontend, het stroomlijnen van de user flows en het verfijnen van de output (UI & PDF) voor een succesvolle lancering.

---

## 📊 **Fase Status & Voortgang**

| Fase | Taak | Status | Tijdsinschatting | Opmerkingen |
|------|------|--------|------------------|-------------|
| **FASE 1: Frontend & UX** | 1.1 Pricing Section Refactor | 🔴 To do | 60 min | Landingspagina met 4 tiers + correcte prijzen |
| | 1.2 Results Page Tier-Aware | 🔴 To do | 90 min | Dynamische UI (locks, banners, content) per tier |
| | 1.3 Navigatie & CTA Flow | 🔴 To do | 30 min | Zorgen dat knoppen naar de juiste flow leiden |
| **FASE 2: Payment & Scan Flow** | 2.1 Checkout Page Implementation | 🔴 To do | 60 min | **NIEUW:** Ontbrekende schakel voor e-mail capture |
| | 2.2 Payment Return Page | 🔴 To do | 60 min | Automatisch scan starten na succesvolle betaling |
| | 2.3 Post-Scan Async Processing | 🔴 To do | 75 min | **NIEUW:** Decoupled PDF/E-mail service |
| **FASE 3: Output Verfijning** | 3.1 Enterprise PDF Template | 🔴 To do | 45 min | Specifiek template met KPI Dashboard & multi-page data |
| | 3.2 Styling Consistentie | 🔴 To do | 30 min | Visuele uniformiteit over alle PDF-rapporten |
| **FASE 4: Afronding** | 4.1 Code Cleanup | 🔴 To do | 45 min | `// TODO`'s oplossen, test-code verwijderen |
| | 4.2 Documentatie Update | 🔴 To do | 30 min | `README.md` etc. actualiseren met finale werking |
| **FASE 5: UX Polish (Low Prio)** | 5.1 Enhanced Error Handling | 🔴 To do | 45 min | Wat als de scan faalt na betaling? |
| | 5.2 Results Page Loading State | 🔴 To do | 60 min | In-progress UI tonen tijdens het scannen |
| | 5.3 Email Scan Result Link | 🔴 To do | 30 min | E-mailen van de link naar het online rapport |

**Totale tijd:** ~ 10 uur  
**Dependencies:** Alle backend-logica (scanning, AI, PDF-basis) is voltooid ✅  
**Next Step:** Productie deployment na afronding van deze fasen.

**Status Legenda:**
- 🔴 To do - Nog niet gestart
- 🟡 In Progress - Bezig met implementatie
- 🟢 Done - Voltooid en getest

---

## ⚠️ VEILIGE IMPLEMENTATIE REGELS

### **Backend Blijft Stabiel:**
✅ **NIET WIJZIGEN:**
- De `ScanOrchestrator` en de `Strategy` implementaties.
- De API-endpoints (`/api/scan/*`).
- De database-interacties en het Supabase-schema.
- De kernlogica van de PDF-generator en AI-services.

### **Frontend Focus:**
🔄 **ITERATIEF VERBETEREN:**
- Werk component voor component: eerst de `PricingSection`, dan de resultatenpagina.
- Hergebruik bestaande componenten (`Button`, `Card`, etc.) maximaal.
- Gebruik de data die al door de `+page.server.ts` wordt aangeleverd; de backend levert alles wat nodig is.

### **Zero Breaking Changes:**
❌ **FOCUS OP INTEGRATIE:**
- Het doel is niet om nieuwe features te bouwen, maar om de bestaande, werkende backend-features correct te ontsluiten in de frontend.

---

## 🔧 TECHNISCHE IMPLEMENTATIE

### **FASE 1: Frontend & UX (± 3 uur)**

#### **1.1 Pricing Section Refactor**
**Bestand:** `src/lib/components/features/landing/PricingSection.svelte`  
**Doel:** De statische prijstabel functioneel en correct maken.
**Conceptuele Implementatie:**
1.  **Data:** Maak een array met 4 tier-objecten (naam, prijs, features, CTA-tekst).
2.  **E-mail Input**: Voeg een e-mail inputveld toe in de UI, vereist voordat een betaalde scan kan worden gestart.
3.  **Renderen:** Gebruik een `#each` block om de 4 tier-kaarten dynamisch te renderen.
4.  **Functionaliteit (`on:click`):**
    *   **Basic Tier Knop**: Roep een `dispatch` event aan (bv. `startBasicScan`) die op `+page.svelte` wordt opgevangen om de gratis scan te starten.
    *   **Betaalde Tier Knoppen**: Navigeer de gebruiker naar de nieuwe checkout pagina. Concept: `goto(`/checkout?tier=starter&url=${encodeURIComponent(scanUrl)}`)`.

#### **1.2 Results Page Tier-Aware**
**Bestand:** `src/routes/scan/[scanId]/results/+page.svelte`  
**Doel:** De resultatenpagina intelligent maken op basis van de tier.
**Conceptuele Implementatie:**
1.  **Data Ontvangen:** De `data.businessInsights.tier` variabele is de "source of truth".
2.  **Conditionele Rendering:**
    *   **GentleConversion Banner**: Toon deze banner altijd, maar pas de `tier` prop dynamisch aan om de juiste upgrade-boodschap te tonen.
    *   **AiNarrativeSection**:
        ```html
        <AiNarrativeSection
          {aiNarrative}
          isLocked={data.businessInsights.tier === 'basic' || data.businessInsights.tier === 'starter'}
          tier={data.businessInsights.tier}
        />
        ```
    *   **Quick Wins Title**: Pas de titel aan. Als `isBasicTier`, toon de `aiPreviewBadge`.
    *   **PDF Download Knop**: Render deze knop alleen als `!isBasicTier` en de PDF-status `completed` is.

#### **1.3 Navigatie & CTA Flow**
**Bestanden:** Diverse Svelte componenten en routes (`PricingSection`, `checkout`, `payment-return`, `results`)
**Doel:** Een naadloze en logische gebruikersflow garanderen van tier-keuze tot aan het zien van het resultaat. Dit is de "lijm" tussen de UI-componenten.
**Conceptuele Implementatie:**
1.  **Vanaf `PricingSection`:**
    *   **CTA Basic Tier**: `on:click` roept een `dispatch` event aan (`startBasicScan`) dat de gratis scan initieert op de landingspagina zelf.
    *   **CTA Betaalde Tiers**: `on:click` navigeert de gebruiker met de juiste context naar de checkout-pagina.
        ```javascript
        goto(`/checkout?tier=${tier.name}&url=${encodeURIComponent(scanUrl)}`);
        ```
2.  **Op de `Checkout Page`:**
    *   **CTA "Ga naar betaling"**: `on:click` roept een functie aan die de API call (`/api/payment/create`) doet en de gebruiker vervolgens doorstuurt naar de externe Mollie betaalpagina.
        ```javascript
        window.location.href = paymentUrl;
        ```
3.  **Vanaf de `Payment Return Page`:**
    *   **Geen CTA (automatisch)**: Bij het laden van de pagina (`onMount`) wordt de scan direct gestart via een API call (`/api/scan/...`).
    *   **Automatische Navigatie**: Na een succesvolle API-respons wordt de gebruiker direct doorgestuurd naar de resultatenpagina.
        ```javascript
        goto(`/scan/${result.scanId}/results`);
        ```
4.  **Op de `Results Page`:**
    *   **CTA PDF Download**: Deze knop is conditioneel zichtbaar en functioneel.
    *   **CTA in `GentleConversionBanner`**: De knop in de upgrade-banner moet correct verwijzen naar de checkout-pagina met de juiste parameters voor een upgrade.

### **FASE 2: Payment & Scan Flow (± 2.5 uur)**

#### **2.1 Checkout Page Implementation**
**Bestand:** `src/routes/checkout/+page.svelte` - **NIEUW**
**Doel:** De ontbrekende schakel tussen de tier-selectie en de Mollie-betaling.
**Conceptuele Implementatie:**
1.  **Data uit URL**: Haal in de `load` functie de `tier` en `url` uit de URL-parameters.
2.  **UI**: Toon de geselecteerde tier en prijs ter bevestiging. Voeg een `input` veld toe dat verplicht is voor het e-mailadres.
3.  **Payment Initiation (`on:click` op "Ga naar betaling"):**
    *   Roep een `async` functie aan die de `tier`, `url` en het ingevulde `email` adres verzamelt.
    *   Doet een `fetch` request naar `/api/payment/create` met de data in de body.
    *   Ontvangt de `{ paymentUrl }` en stuurt de gebruiker door via `window.location.href = paymentUrl`.
4.  **Error Handling**: Toon duidelijke foutmeldingen als het e-mailadres ongeldig is of de API faalt.

#### **2.2 Payment Return Page**
**Bestand:** `src/routes/scan/payment-return/+page.svelte`  
**Doel:** De betaal-bevestigingspagina automatiseren en de scan starten.
**Conceptuele Implementatie (Vereenvoudigd):**
1.  **Data uit URL**: Haal in `onMount` de `paymentId`, `tier`, `url`, en `email` uit de URL-parameters.
2.  **Direct Scan Starten**: Doe *direct* een `fetch` naar het **bestaande** scan-endpoint. De betalingsverificatie is daar al ingebouwd.
    ```javascript
    // Concept in payment-return/+page.svelte onMount
    const response = await fetch(`/api/scan/${tier}`, {
        method: 'POST',
        body: JSON.stringify({ url, email, paymentId })
    });
    const result = await response.json();
    ```
3.  **Redirect**: Als de `scanId` wordt ontvangen, stuur de gebruiker direct door.
    ```javascript
    if (result.scanId) {
        goto(`/scan/${result.scanId}/results`);
    } else {
        // Toon foutmelding aan gebruiker
    }
    ```
4.  **UI**: Toon een laad-indicator ("Betaling wordt geverifieerd, scan wordt gestart...") tijdens dit proces.

#### **API Contract Reference**
Een concreet overzicht van de twee kern-endpoints die in deze fase worden gebruikt.

| Endpoint | Methode | Request Body (voorbeeld) | Response (voorbeeld) |
|----------|---------|--------------------------|----------------------|
| `/api/payment/create` | `POST` | `{ "tier": "starter", "url": "https://example.com", "email": "user@example.com" }` | `201 Created` → `{ "paymentUrl": "https://www.mollie.com/payments/XYZ" }` |
| `/api/scan/:tier` | `POST` | `{ "url": "https://example.com", "email": "user@example.com", "paymentId": "tr_12345" }`<br/>`tier` path-param ∈ `basic\|starter\|business\|enterprise` | `202 Accepted` → `{ "scanId": "8464f0f9-...", "status": "queued" }` |

**Type-validatie (Zod):**
```typescript
import { z } from 'zod';

export const PaymentCreateSchema = z.object({
  tier: z.enum(['starter', 'business', 'enterprise']),
  url: z.string().url(),
  email: z.string().email()
});

export const ScanRequestSchema = z.object({
  url: z.string().url(),
  email: z.string().email().optional(),
  paymentId: z.string().optional()
});
```

#### **2.3 Asynchronous Post-Scan Processing**
**Bestand:** `src/lib/services/PostScanProcessorService.ts` & `supabase/functions/process-scan/index.ts` - **NIEUW**
**Doel:** PDF-generatie en e-mailverzending loskoppelen van de `ScanOrchestrator` voor betere performance en SoC.
**Conceptuele Implementatie:**
1.  **`ScanOrchestrator` Aanpassing**:
    *   De *enige* toevoeging aan de `ScanOrchestrator` is een "fire-and-forget" aanroep op het einde van een succesvolle scan.
    *   `await supabase.functions.invoke('process-scan', { body: { scanId } })`
2.  **`PostScanProcessorService` (Nieuwe Service)**:
    *   Deze service bevat de logica die voorheen in de orchestrator zou komen.
    *   `handle(scanId)`: Haalt scan op -> genereert PDF -> slaat PDF op -> verstuurt e-mail.
3.  **Supabase Edge Function (`process-scan`)**:
    *   Een simpele wrapper die de `PostScanProcessorService` aanroept. Dit zorgt voor de asynchrone executie.
**Flow:**
*   `ScanOrchestrator` voltooit de scan en slaat resultaten op.
*   Gebruiker wordt *direct* naar de webresultaten gestuurd.
*   Ondertussen draait de Edge Function op de achtergrond om de PDF te maken en te mailen.

**Deployment Checklist & ENV Requirements**

**Deployment Stappen:**
1. **Supabase Edge Function Deploy:**
   * Navigeer naar de `supabase/functions/process-scan` directory.
   * Voer `supabase functions deploy process-scan` uit om de functie te deployen.
   * Verifieer de deployment via de Supabase dashboard logs.

2. **PostScanProcessorService Deploy:**
   * Zorg dat de service in de `src/lib/services` map staat.
   * Controleer of de service correct wordt geïmporteerd en aangeroepen in de `ScanOrchestrator`.

**ENV Requirements:**
- `MOLLIE_KEY`: API sleutel voor Mollie betalingen.
- `EMAIL_API_KEY`: Sleutel voor de e-mailservice.
- `SUPABASE_URL`: URL van de Supabase instance.
- `SUPABASE_ANON_KEY`: Anonieme sleutel voor Supabase toegang.

**Error Reporting:**
- **Supabase Logs:** Controleer de logs in het Supabase dashboard voor fouten in de Edge Function.
- **Service Logs:** Voeg logging toe in de `PostScanProcessorService` voor elke stap (PDF generatie, e-mail verzending) en log fouten naar een centrale logging service of bestand.

### **FASE 3: Output Verfijning (± 1.25 uur)**

#### **3.1 Enterprise PDF Template**
**Bestand:** `src/lib/pdf/narrativeGenerator.ts` (of een nieuw `enterpriseTemplate.ts`)  
**Doel:** De visuele weergave van Enterprise-data in het PDF-rapport.
**Conceptuele Implementatie:**
1.  **Data Check**: Controleer in de `TierAwarePDFGenerator` of er `enterpriseFeatures` in het `scanResult` object zitten.
2.  **Duidelijk Data-Contract**: De te ontwikkelen functies moeten een duidelijk data-contract hebben. Voorbeeld:
    ```typescript
    interface KpiData {
        estimatedRoi: number;
        roiTimeframeMonths: number;
        benchmarkScore: number;
        topCompetitorScore: number;
    }
    interface MultiPageData { /* ... */ }
    ```
3.  **Nieuwe Secties**: Creëer HTML-generatie functies met dit contract:
    *   `generateKPIDashboard(kpiData: KpiData)`
    *   `generateMultiPageAnalysis(multiPageData: MultiPageData)`
4.  **Template Logica**: In de `generatePdfHtml` methode, voeg conditionele logica toe om deze nieuwe secties alleen te renderen als de tier 'enterprise' is en de data beschikbaar is.

### **FASE 4: Afronding (± 1.25 uur)**

#### **4.1 Code Cleanup**
**Doel:** Een schone, onderhoudbare codebase achterlaten.
**Acties:**
1.  **Zoek & Vernietig**: `grep` de hele `src` map voor `// TODO:` en `console.log`.
2.  **Analyseer & Beslis**: Evalueer elke `console.log`. Is het een nuttige debug-log voor productie (houd), of een overblijfsel van ontwikkeling (verwijder)?
3.  **Refactor**: Los de TODO's op. Dit zijn vaak kleine refactors of het afmaken van edge-case logica.

#### **4.2 Documentatie Update**
**Bestand:** `README.md` & `docs/*.md`  
**Doel:** Zorgen dat nieuwe ontwikkelaars (of je toekomstige zelf) snel op stoom kunnen komen.
**Acties:**
1.  **README**: Update de "Getting Started" sectie en beschrijf kort de tier-structuur.
2.  **Architectuur Document**: Werk een document zoals `02-phase-2-5-prequel-pattern-refactor.md` bij om de finale frontend-structuur en de user-flow per tier te beschrijven.

### **FASE 5: UX Polish & Robustness (Lage Prioriteit)**

#### **5.1 Enhanced Error Handling**
**Doel:** Een robuuste gebruikerservaring bieden, zelfs als er iets misgaat na de betaling.
**Conceptuele Implementatie:**
1.  **Results Page Logic**: In `src/routes/scan/[scanId]/results/+page.svelte`, controleer op `data.scan.status === 'failed'`.
2.  **Error Component**: Maak een specifieke error component die wordt getoond bij een gefaalde scan.
3.  **User Message**: De component moet de gebruiker geruststellen en duidelijke instructies geven: "Je betaling is succesvol ontvangen, maar helaas kon de scan voor [URL] niet worden voltooid. Neem contact op met support en vermeld scan ID: [scanId] voor een gratis nieuwe scan of een terugbetaling."

#### **5.2 Results Page Loading State**
**Doel:** De gebruiker informeren en betrokken houden terwijl de scan wordt uitgevoerd.
**Conceptuele Implementatie:**
1.  **Directe Navigatie**: De `goto` na het starten van een scan stuurt de gebruiker *onmiddellijk* naar de resultatenpagina.
2.  **Loading UI**: De `+page.svelte` checkt de `data.scan.status`.
    *   Indien `pending` of `running`: Toon een laad-UI (bv. een progress bar, animatie) met de boodschap: "Analyse voor [URL] wordt uitgevoerd... Dit duurt ongeveer 60 seconden."
    *   Indien `completed` of `failed`: Toon het resultaat of de foutmelding.
3.  **Auto-Refresh**: Implementeer een mechanisme (bv. een `meta http-equiv="refresh"` tag met een interval van 15 seconden, of een Svelte-action die pollt) om de pagina data opnieuw te laden totdat de scan voltooid is.

#### **5.3 Email Scan Result Link**
**Doel:** Zorgen dat een gebruiker zijn betaalde rapport niet kwijtraakt.
**Conceptuele Implementatie:**
1.  **Aanpassing `PostScanProcessorService`**: In `src/lib/services/PostScanProcessorService.ts`, breid de `handle(scanId)` functie uit.
2.  **Nieuwe E-mail Taak**: Naast het genereren van de PDF, roep de `EmailService` nogmaals aan (of breid de bestaande aanroep uit).
3.  **E-mail Inhoud**: Verstuur een simpele e-mail met de tekst: "Je AIO Scanner rapport voor [URL] is klaar. Je kunt het online bekijken via de volgende link: [domain]/scan/[scanId]/results. De PDF-versie is bijgevoegd."

---

## ✅ DEFINITION OF DONE

- [ ] De landingspagina toont 4 functionele tier-kaarten.
- [ ] De resultatenpagina toont conditioneel de juiste content voor elke tier.
- [ ] De betaalflow is naadloos: betalen start automatisch de scan en redirect de gebruiker.
- [ ] De Enterprise PDF bevat de unieke KPI- en multi-page data.
- [ ] De codebase is vrij van ontwikkel-specifieke `console.log`'s en openstaande `TODO`'s.
- [ ] De documentatie reflecteert de finale staat van de applicatie.

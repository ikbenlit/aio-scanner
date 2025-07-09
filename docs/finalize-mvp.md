# Plan: Finalize AIO Scanner MVP

> **🔧 CONTEXT:** Afronden van de laatste 10-15% van de AIO Scanner. Focus op het productieklaar maken van de frontend, het stroomlijnen van de user flows en het verfijnen van de output (UI & PDF) voor een succesvolle lancering.

---

## 📊 **Fase Status & Voortgang**

| Fase | Taak | Status | Tijdsinschatting | Opmerkingen |
|------|------|--------|------------------|-------------|
| **FASE 1: Frontend & UX** | 1.1 Pricing Section Refactor | 🔴 To do | 60 min | Landingspagina met 4 tiers + correcte prijzen |
| | 1.2 Results Page Tier-Aware | 🔴 To do | 90 min | Dynamische UI (locks, banners, content) per tier |
| | 1.3 Navigatie & CTA Flow | 🔴 To do | 30 min | Zorgen dat knoppen naar de juiste flow leiden |
| **FASE 2: Payment & Scan Flow** | 2.1 Payment Return Page | 🔴 To do | 60 min | Automatisch scan starten na succesvolle betaling |
| | 2.2 E-mail & PDF Delivery | 🔴 To do | 30 min | Triggeren van PDF-generatie & e-mail na betaling |
| **FASE 3: Output Verfijning** | 3.1 Enterprise PDF Template | 🔴 To do | 45 min | Specifiek template met KPI Dashboard & multi-page data |
| | 3.2 Styling Consistentie | 🔴 To do | 30 min | Visuele uniformiteit over alle PDF-rapporten |
| **FASE 4: Afronding** | 4.1 Code Cleanup | 🔴 To do | 45 min | `// TODO`'s oplossen, test-code verwijderen |
| | 4.2 Documentatie Update | 🔴 To do | 30 min | `README.md` etc. actualiseren met finale werking |

**Totale tijd:** ~ 6 uur  
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
2.  **Renderen:** Gebruik een `#each` block om de 4 tier-kaarten dynamisch te renderen.
3.  **Functionaliteit:**
    *   Bind een `on:click` event aan elke CTA-knop.
    *   **Basic Tier Knop**: Roep een `dispatch` event aan (bv. `startBasicScan`) die op `+page.svelte` wordt opgevangen om de gratis scan te starten.
    *   **Betaalde Tier Knoppen**: Navigeer de gebruiker naar de betaal-API met de juiste parameters. Concept: `goto('/api/payment/create?tier=starter&url=' + scanUrl)`.

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

### **FASE 2: Payment & Scan Flow (± 1.5 uur)**

#### **2.1 Payment Return Page**
**Bestand:** `src/routes/scan/payment-return/+page.svelte`  
**Doel:** De betaal-bevestigingspagina automatiseren.
**Conceptuele Implementatie:**
1.  **Data uit URL**: Haal `paymentId`, `tier`, en `scanUrl` uit de URL-parameters in `onMount`.
2.  **Backend Verificatie**: `fetch` naar een nieuw backend endpoint (bv. `/api/payment/verify`) met de `paymentId`.
3.  **Scan Starten**: Als de verificatie slaagt:
    *   `fetch` naar het juiste scan-endpoint (`/api/scan/starter` of `/api/scan/business`) met de benodigde `url`, `email` en `paymentId`.
    *   Wacht op de `scanId` die de API retourneert.
4.  **Redirect**: Stuur de gebruiker direct door naar de resultatenpagina: `goto('/scan/' + scanId + '/results')`.
5.  **UI**: Toon een laad-indicator ("Bezig met verwerken...", "Scan wordt gestart...") tijdens dit proces.

### **FASE 3: Output Verfijning (± 1.25 uur)**

#### **3.1 Enterprise PDF Template**
**Bestand:** `src/lib/pdf/narrativeGenerator.ts` (of een nieuw `enterpriseTemplate.ts`)  
**Doel:** De visuele weergave van Enterprise-data in het PDF-rapport.
**Conceptuele Implementatie:**
1.  **Data Check**: Controleer in de `TierAwarePDFGenerator` of er `enterpriseFeatures` in het `scanResult` object zitten.
2.  **Nieuwe Secties**: Creëer HTML-generatie functies voor:
    *   `generateKPIDashboard(enterpriseFeatures.kpiData)`
    *   `generateMultiPageAnalysis(enterpriseFeatures.multiPageAnalysis)`
3.  **Template Logica**: In de `generatePdfHtml` methode, voeg conditionele logica toe om deze nieuwe secties alleen te renderen als de tier 'enterprise' is.

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

---

## ✅ DEFINITION OF DONE

- [ ] De landingspagina toont 4 functionele tier-kaarten.
- [ ] De resultatenpagina toont conditioneel de juiste content voor elke tier.
- [ ] De betaalflow is naadloos: betalen start automatisch de scan en redirect de gebruiker.
- [ ] De Enterprise PDF bevat de unieke KPI- en multi-page data.
- [ ] De codebase is vrij van ontwikkel-specifieke `console.log`'s en openstaande `TODO`'s.
- [ ] De documentatie reflecteert de finale staat van de applicatie.

# Implementatieplan: Quality-Based Pricing Model

Dit document beschrijft de technische stappen die nodig zijn om de AIO-Scanner om te zetten van het oorspronkelijke model naar een tier-gebaseerd, account-loos systeem zoals beschreven in de PRD.

---

## Fase 1: Fundament Leggen (Backend & Database)

**Doel:** De basisinfrastructuur voorbereiden op het nieuwe model door de database aan te passen en de API-structuur en types te definiëren.

### Subfase 1.1: Database Migratie

**Beschrijving:** We passen het databaseschema aan om de user/credit-gerelateerde tabellen te verwijderen en de `scans` tabel voor te bereiden op de nieuwe data.

*   **Actie:** Maak een nieuw migratiebestand in de `migrations/` map.
*   **Logica:**
    1.  `DROP TABLE IF EXISTS users, user_credits, credits;` (of vergelijkbare namen).
    2.  `ALTER TABLE scans ADD COLUMN tier TEXT NOT NULL DEFAULT 'basic';`
    3.  `ALTER TABLE scans ADD COLUMN payment_reference TEXT;`
    4.  `CREATE TABLE scan_payments (...)` zoals gespecificeerd in de PRD.

### Subfase 1.2: API Endpoints Voorbereiden

**Beschrijving:** We definiëren de nieuwe API-routes. De daadwerkelijke logica wordt in Fase 2 geïmplementeerd.

*   **Bestanden aan te passen:** De mappenstructuur binnen `src/routes/api/scan/` moet worden aangepast.
*   **Acties:**
    1.  Hernoem of maak de map `src/routes/api/scan/basic/` aan met een `+server.ts` bestand. Dit vervangt het oude `/anonymous` endpoint.
    2.  Maak mappen en `+server.ts` bestanden aan voor:
        *   `src/routes/api/scan/starter/`
        *   `src/routes/api/scan/business/`
        *   `src/routes/api/scan/enterprise/` (kan leeg blijven, voor de toekomst).

### Subfase 1.3: Types en Interfaces Uitbreiden

**Beschrijving:** We zorgen ervoor dat alle gedeelde types en interfaces de nieuwe concepten (zoals `ScanTier`) ondersteunen.

*   **Bestand aan te passen:** `src/lib/scan/types.ts`
*   **Acties:**
    1.  Definieer het type voor de Tiers.
        ```typescript
        export type ScanTier = 'basic' | 'starter' | 'business' | 'enterprise';
        ```
    2.  Pas de `ScanResult` interface aan om de `tier` op te nemen.
        ```typescript
        export interface ScanResult {
          // ... bestaande velden
          tier: ScanTier;
        }
        ```
    3.  Definieer de interfaces voor de API request bodies.
        ```typescript
        export interface BasicScanRequest {
          url: string;
        }

        export interface PaidScanRequest {
          url: string;
          email: string;
          mollie_payment_id: string; // Of een andere betalingsverificatie token
        }
        ```

### Subfase 1.4: Email Capture Markeren voor Verwijdering

**Beschrijving:** Markeer de email capture functionaliteit voor toekomstige verwijdering en schakel deze uit in de basic flow.

*   **Bestanden aan te passen:**
    1. `src/routes/api/scan/email-capture/+server.ts`
    2. `src/lib/components/features/email/EmailCapture.svelte`
    3. `src/routes/+page.svelte`
    4. `src/lib/scan/types.ts`

*   **Acties:**
    1. Markeer code voor verwijdering met TODO comments:
        ```typescript
        // TODO: DEPRECATED - Te verwijderen na succesvolle migratie naar tier-based systeem
        // Reden: Email capture wordt alleen nog gebruikt voor betaalde tiers
        // Gerelateerde bestanden:
        // - src/lib/components/features/email/EmailCapture.svelte
        // - src/routes/api/scan/email-capture/+server.ts
        ```

    2. Commentarieer de code uit in plaats van verwijderen:
        ```typescript
        // In src/routes/+page.svelte
        // TODO: DEPRECATED - Email capture voor basic scan
        /* 
        {#if !emailVerified}
          <EmailCapture on:verified={handleEmailVerified} />
        {/if}
        */
        ```

    3. Maak een deprecation log bestand:
        ```markdown
        # deprecated-components.md
        
        ## Email Capture Systeem
        - **Status:** Gemarkeerd voor verwijdering
        - **Datum:** [DATUM]
        - **Reden:** Overgang naar tier-based systeem
        - **Te verwijderen na:** Succesvolle implementatie van tier-systeem
        - **Afhankelijke componenten:**
          - EmailCapture.svelte
          - email-capture API endpoint
          - Email verificatie logica in basic scan flow
        ```

    4. Update de scan types met backwards compatibility:
        ```typescript
        // In src/lib/scan/types.ts
        export interface BasicScanRequest {
          url: string;
          email?: string; // Optional gemaakt, maar behouden voor backwards compatibility
        }
        ```

*   **Voordelen van deze aanpak:**
    - Veilig: Geen directe verwijdering van functionaliteit
    - Documentatie: Duidelijke markering waarom code verwijderd gaat worden
    - Reversibel: Makkelijk terug te draaien als nodig
    - Historie: Behoud van context en beslissingen

*   **Validatie:**
    - Controleer of basic scan werkt zonder email requirement
    - Verifieer dat bestaande tests niet breken
    - Test of betaalde tiers nog steeds correct werken met email requirement

*   **Clean-up Plan:**
    - Na succesvolle implementatie en testing van het nieuwe tier-systeem
    - Na verificatie dat geen oude routes meer worden aangeroepen
    - Na backup van relevante code voor historische referentie

---

## Fase 2: Implementatie van de Tiers (Scan Logica)

**Doel:** De kernlogica in de `ScanOrchestrator` bouwen om de verschillende analyseniveaus uit te voeren.

### Subfase 2.1: Basic Tier Finaliseren

**Beschrijving:** Koppel de bestaande MVP-scanlogica aan het nieuwe `basic` endpoint.

*   **Bestand aan te passen:** `src/routes/api/scan/basic/+server.ts`
*   **Actie:** Implementeer de `POST` handler die de `ScanOrchestrator` aanroept, de scan uitvoert en het resultaat opslaat met `tier: 'basic'`.

### Subfase 2.2: ScanOrchestrator Uitbreiden

**Beschrijving:** Maak de `ScanOrchestrator` de centrale controller die de juiste scanmethode kiest op basis van de tier.

*   **Bestand aan te passen:** `src/lib/scan/ScanOrchestrator.ts`
*   **Acties:**
    1.  Refactor de bestaande `execute` methode naar `executeBasicScan`.
    2.  Creëer een nieuwe hoofd-methode:
        ```typescript
        public async executeTierScan(url: string, tier: ScanTier, options?: ScanOptions): Promise<ScanResult> {
            switch (tier) {
                case 'basic':
                    return this.executeBasicScan(url);
                case 'starter':
                    // Wordt geïmplementeerd in volgende subfase
                    return this.executeStarterScan(url);
                case 'business':
                    // Wordt geïmplementeerd in volgende subfase
                    return this.executeHybridScan(url);
                // ... etc
            }
        }
        ```

### Subfase 2.3: Starter Tier Implementeren (AI Rapportage)

**Beschrijving:** Voeg de AI-rapportagelaag toe bovenop de resultaten van de basis-scan.

*   **Nieuw bestand (suggestie):** `src/lib/scan/AIReportGenerator.ts`
*   **Bestanden aan te passen:** `src/lib/scan/ScanOrchestrator.ts`, `src/routes/api/scan/starter/+server.ts`
*   **Acties:**
    1.  Bouw een `AIReportGenerator` service die de `ModuleResult[]` van een scan als input neemt en een professioneel, door AI geschreven rapport genereert.
    2.  Implementeer de `executeStarterScan` methode in de `ScanOrchestrator`. Deze roept `executeBasicScan` aan en stuurt de resultaten naar de `AIReportGenerator`.
    3.  Implementeer de `POST` handler in het `starter` endpoint om de betaling te verifiëren en `executeTierScan(url, 'starter')` aan te roepen.

### Subfase 2.4: Business Tier Implementeren (Hybride Analyse)

**Beschrijving:** Bouw de unieke hybride analyse van de Business Tier.

*   **Bestanden aan te passen:** `src/lib/scan/ScanOrchestrator.ts`, `src/lib/scan/ContentExtractor.ts`, en mogelijk nieuwe modules in `src/lib/scan/modules/`.
*   **Acties:**
    1.  Implementeer de `executeHybridScan` methode in de `ScanOrchestrator`.
    2.  Verbeter `ContentExtractor.ts` om de "Smart Content Sampling" (e.g., "een eeuw lang") te ondersteunen.
    3.  Ontwikkel een nieuwe service of module, `LLMEnhancementService`, die de bevindingen (`findings`) van de standaard modules kan verrijken met contextuele AI-inzichten. Dit is de kern van de "Hybrid AI Enhancement".

---

## Fase 3: Frontend & Betaling Integratie

**Doel:** De gebruikersinterface bouwen waarmee gebruikers een tier kunnen kiezen, betalen en de resultaten kunnen zien.

### Subfase 3.1: UI Componenten voor Tier Selectie

**Beschrijving:** Bouw de Svelte-componenten op de voorpagina voor het selecteren van een scan-tier.

*   **Bestanden aan te passen:** `src/routes/+page.svelte` en nieuwe componenten in `src/lib/components/features/landing/`.
*   **Actie:** Maak een "pricing table" of vergelijkbare UI waar een gebruiker een URL kan invoeren en een tier kan kiezen. De state van de applicatie moet de gekozen tier en URL bijhouden.

### Subfase 3.2: Mollie Betalingsintegratie

**Beschrijving:** Implementeer de betalingsflow met Mollie.

*   **Bestanden aan te passen:** De frontend componenten en een nieuw API-endpoint voor het aanmaken van betalingen, bv. `src/routes/api/payment/create/+server.ts`.
*   **Acties:**
    1.  Wanneer een gebruiker een betaalde tier kiest, roep een backend endpoint aan om een Mollie-betaling aan te maken.
    2.  Redirect de gebruiker naar de Mollie checkout pagina.
    3.  Na een succesvolle betaling, wordt de gebruiker teruggestuurd naar een bevestigingspagina die de scan triggert met de verkregen `mollie_payment_id`.

### Subfase 3.3: Resultaten Pagina Aanpassen

**Beschrijving:** Zorg ervoor dat de resultatenpagina de tier-specifieke informatie correct weergeeft.

*   **Bestanden aan te passen:** `src/routes/scan/[scanId]/results/+page.svelte`
*   **Actie:** De resultatenpagina moet de data van een `ScanResult` ophalen. De UI moet conditioneel de extra's van de `Starter` (bv. het AI-gegenereerde rapport) of `Business` (bv. specifieke AI-inzichten per bevinding) tonen. Er moeten ook duidelijke "upgrade" prompts worden getoond voor gebruikers van de Basic tier.

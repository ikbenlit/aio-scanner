# Implementatieplan: AIO-Scanner

Dit document beschrijft het gefaseerde implementatieplan voor de AIO-Scanner applicatie. Het plan is opgesteld na analyse van de codebase en de projectdocumentatie.

**Statuslegend:**
- ⚪️ To Do
- 🟡 In Progress
- ✅ Done

---

## Fase 1: Core Functionaliteit & Foundation

Deze fase richt zich op het opzetten van de basis van de applicatie, de backend-infrastructuur en de kernfunctionaliteit van het scannen.

| Sub-fase | Taak | Status | Notities |
| :--- | :--- | :--- | :--- |
| **1.1 Project Setup** | Opzetten SvelteKit project | ✅ Done | Project is opgezet met SvelteKit, TypeScript, Tailwind. |
| | Basis UI componenten (Shadcn) | 🟡 In Progress | Inventarisatie is afgerond. Veel UI componenten moeten nog gebouwd worden. |
| | Layout (Header/Footer) | ✅ Done | `Header.svelte` en `Footer.svelte` zijn aanwezig. |
| **1.2 Backend & Database** | Opzetten Supabase project | ✅ Done | Project aangemaakt, environment variabelen geconfigureerd. |
| | Database schema ontwerp | ✅ Done | Schema is gedefinieerd in `04-database-scheme.md`. |
| | Implementatie database schema | ✅ Done | Phase 1 tabellen (`users`, `scans`) zijn aangemaakt in Supabase. |
| **1.3 Scan Engine** | Ontwikkelen web scraper (Cheerio/Playwright) | 🟡 In Progress | ContentFetcher (Cheerio+Playwright fallback) is gebouwd. |
| | API endpoint voor anonieme scan (`/api/scan/anonymous`) | 🟡 In Progress | API endpoint is aangemaakt, nog kleine TypeScript fixes nodig. |
| | Implementatie van de 8 analysemodules | 🟡 In Progress | TechnicalSEOModule + SchemaMarkupModule compleet. 2 van 4 core modules done. |
| **1.4 Basis User Flow**| Landing page URL input | ✅ Done | `URLInput.svelte` is aanwezig. |
| | Live scan-voortgang pagina (`/scan/[scanId]`) | 🟡 In Progress | Frontend componenten zijn er (`ModuleProgressGrid`, etc.), maar geen backend koppeling. |

---

## Fase 2: User Experience & Conversie

Deze fase bouwt voort op de kernfunctionaliteit met een focus op de gebruikerservaring, het vastleggen van gebruikersgegevens en de weergave van resultaten.

| Sub-fase | Taak | Status | Notities |
| :--- | :--- | :--- | :--- |
| **2.1 Landing Page** | Ontwikkelen landingspagina secties | ✅ Done | Alle secties (`Hero`, `Features`, `Testimonials`, etc.) zijn aanwezig. |
| | Integreren live demo | ⚪️ To Do | |
| **2.2 Email Capture** | Ontwikkelen Email Capture Modal | ⚪️ To Do | Ontwerp is gespecificeerd in de documentatie. |
| | Integratie met Resend.com voor email delivery | ⚪️ To Do | |
| | Opzetten email templates | ⚪️ To Do | |
| **2.3 Results Dashboard** | Ontwikkelen score visualisatie | 🟡 In Progress | Componenten lijken aanwezig, koppeling met data nodig. |
| | Ontwikkelen radar chart | ⚪️ To Do | |
| | Ontwikkelen 'Quick Wins' en module details | 🟡 In Progress | Basis accordeon/uitklap-structuur kan aanwezig zijn. |
| | Genereren van basis PDF rapport | ⚪️ To Do | |

---

## Fase 3: Monetization & User Accounts

Deze fase introduceert het businessmodel, inclusief betalingen en gebruikersaccounts.

| Sub-fase | Taak | Status | Notities |
| :--- | :--- | :--- | :--- |
| **3.1 Authenticatie** | Opzetten Supabase Auth | ⚪️ To Do | |
| | Implementatie Login/Register flow | ⚪️ To Do | |
| | Account upgrade pad (anoniem -> betaald) | ⚪️ To Do | |
| **3.2 Payments** | Integratie Mollie | ⚪️ To Do | |
| | Ontwikkelen Package Selection pagina (`/upgrade`) | ⚪️ To Do | De `checkout` feature map is nu nog leeg. |
| | Opzetten Mollie webhook voor confirmatie | ⚪️ To Do | |
| | Credit systeem (toevoegen & aftrekken) | ⚪️ To Do | |
| **3.3 Authenticated User Features**| API endpoint voor betaalde scan (`/api/scan/authenticated`) | ⚪️ To Do | |
| | Scan geschiedenis in dashboard | ⚪️ To Do | |
| | Genereren van uitgebreid PDF rapport | ⚪️ To Do | |

---

## Fase 4: Afronding & Deployment

De laatste fase richt zich op het testen, optimaliseren en live zetten van de applicatie.

| Sub-fase | Taak | Status | Notities |
| :--- | :--- | :--- | :--- |
| **4.1 Testing** | End-to-end testing van alle user flows | ⚪️ To Do | |
| | Testen van payment flow | ⚪️ To Do | |
| | Testen van responsive design | ⚪️ To Do | |
| **4.2 Optimalisatie** | Performance optimalisatie (LCP, etc.) | ⚪️ To Do | |
| | Accessibility (WCAG 2.1 AA) | ⚪️ To Do | |
| **4.3 Deployment** | Opzetten Vercel hosting | ⚪️ To Do | |
| | Configuratie productie-omgeving (env vars) | ⚪️ To Do | |
| | Go-live | ⚪️ To Do | |

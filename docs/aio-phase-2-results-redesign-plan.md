# 📈 AIO Scanner – Results Page Redesign (Fase 2)
*Gefaseerd Plan voor Diepte en Personalisatie per Tier*

> **Doel:** Dit document beschrijft de gefaseerde implementatie om de resultatenpagina en bijbehorende PDF-rapporten dynamisch en relevant te maken voor elke gebruikerstier (Basic, Starter, Business, Enterprise).

---

## 1. Visie & Contentstrategie
*Wat is de waarde die we per tier leveren?*

| Tier | Prijs | Kernbelofte | AI-Narrative | PDF |
|------|-------|-------------|--------------|-----|
| **Basic** | € 0 | **AI-Preview:** 3 concrete Quick Wins (1 AI-actie gegarandeerd) om de waarde te proeven. | ❌ | ❌ |
| **Starter** | € 19,95 | **Volledige Actielijst:** Alle (±15) quick wins in een samenvattend PDF-rapport. | Beknopt | ✔️ Samenvattend |
| **Business** | € 49,95 | **Strategisch Groeiplan:** Volledige actielijst plus een AI-gegenereerde narrative en roadmap in een uitgebreid PDF. | Volledig | ✔️ Uitgebreid |
| **Enterprise**| € 149,95 | **Diepte-analyse op Maat:** Multi-page analyse en een white-label PDF met KPI-dashboard voor strategische beslissingen. | Strategisch | ✔️ White-label |

---

## 2. Architectuur & Risicobeheer
*Hoe zorgen we voor een schaalbare en robuuste technische basis?*

### 2.1 Architectuurprincipe: Separation of Concerns (SOC)
Om te voorkomen dat `ScanOrchestrator.ts` ononderhoudbaar wordt, bouwen we nieuwe tier-logica niet direct in de orchestrator. We refactoren de `ScanOrchestrator` om een **Strategy Pattern** te gebruiken. Voor elke tier komt een aparte `...TierStrategy` klasse die de tier-specifieke logica bevat.

**Impact:** Dit is een **fundamentele refactoring** van de kernlogica (moeilijkheidsgraad: medium). Het vereist precisie en grondige E2E-testen om regressie te voorkomen. De ingeschatte tijd in Fase 0 is bestemd voor deze zorgvuldige implementatie.

### 2.2 Risicobeheer
| Risico | Mitigatie Strategie |
|---|---|
| **Backwards Compatibility** | Oude scans zonder `tier` worden als `basic` behandeld. De code krijgt `null` checks. |
| **Upgrade & Caching** | Een upgrade triggert een **volledige re-scan** met de nieuwe tier-instellingen. De UI communiceert dit duidelijk aan de gebruiker. |
| **Enterprise Scope** | De "Multi-page crawl" is initieel een **sample van max. 2 extra pagina's**. Een volledige 250-pagina crawl wordt als een aparte feature (Fase 3) gezien. |

---

## 3. Gefaseerd Implementatieplan & Status
*De concrete stappen, opgedeeld in logische fases.*

**Status Legend:** 🔴 Niet gestart | 🟡 In progress | 🟢 Compleet | ⚠️ Geblokkeerd

| Fase | Focus | Tijdsinschatting | Verantwoordelijk | Status |
|---|---|---|---|---|
| **Fase 0: Architectuur Refactoring** | `ScanOrchestrator` ombouwen naar Strategy Pattern. | 8 u | Dev (Architect) | 🔴 |
| **Fase 1: Resultatenpagina per Tier** | De web-interface dynamisch maken. | 11 u | | 🔴 |
| *Sub 1.1: Server Logica* | Tier-aware Quick Wins & data-props. | 3 u | Dev | 🔴 |
| *Sub 1.2: Frontend Componenten* | Badge, CTA-switch, lock-overlays. | 4 u | Dev / Design | 🔴 |
| *Sub 1.3: AI-Narrative Component* | Nieuwe component voor AI-teksten. | 2 u | Dev | 🔴 |
| *Sub 1.4: Integratie & Testen* | E2E-testen per tier + metrics tracking. | 2 u | QA / Content | 🔴 |
| **Fase 2: PDF-uitbreiding per Tier** | De PDF-rapporten verrijken. | 12 u | | 🔴 |
| *Sub 2.1: Starter PDF* | Samenvattend rapport genereren. | 3 u | Dev | 🔴 |
| *Sub 2.2: Business PDF* | AI-Narrative & grafieken toevoegen. | 4 u | Dev / Design | 🔴 |
| *Sub 2.3: Enterprise PDF* | White-label & KPI-dashboard design. | 5 u | Dev / Design | 🔴 |

**Totaal Geschat:** 31 uur

---

## 4. Details: UX & Componenten
*Hoe vertalen we de strategie naar de interface?*

### 4.1 Component-aanpassingen
| Component | Aanpassing |
|---|---|
| `QuickWinsSection.svelte` | Krijgt `tier` prop; toont bij **Basic** een "🤖 AI-Preview" badge. |
| `GentleConversion.svelte` | Krijgt `tier` prop; toont de juiste upgrade-CTA. |
| `AiNarrativeSection.svelte` | **Nieuwe component** die het `aiNarrative` object toont (zichtbaar vanaf Starter). |
| `Results +page.svelte` | Orchestreert bovenstaande. Geeft props door en rendert `AiNarrativeSection` conditioneel. |

### 4.2 UX-Flows per Tier
1. **Basic → Starter:**
   - Banner onder Quick Wins: _“We vonden nog **{totalActions-3} extra AI-kansen** – upgrade voor volledig rapport (€19,95).”_
   - Minimaal één Quick Win is een `< 15 min` taak met `≥ +8 punten` impact voor een "instant gratification" gevoel.
2. **Starter → Business:**
   - Lock-overlay op de (lege) `AiNarrativeSection`: _“Ontgrendel je Strategisch Groeiplan – inclusief roadmap & concurrent-inzichten (€49,95).”_
3. **Business → Enterprise:**
   - Sidebar checklist: _“Diepte-analyse nodig? Upgrade naar Enterprise voor multi-page sampling, white-label PDF's en een KPI-dashboard.”_

---

## 5. Succesmeting
*Wanneer is dit project geslaagd?*

### 5.1 Definition of Done
- [ ] **Fase 0:** `ScanOrchestrator` is gerefactored; alle bestaande scans werken nog identiek.
- [ ] **Fase 1:** De resultatenpagina toont per tier de juiste componenten en data.
- [ ] **Fase 2:** De PDF-download levert per tier het correcte, verrijkte rapport op.
- [ ] Alle CTA's en teksten zijn correct per tier.
- [ ] `npm run build` slaagt zonder errors.

### 5.2 Succes-metrics (KPI's)
| Metric | Baseline | Target |
|---|---|---|
| **Upgrade-rate Basic → Starter** | 4 % | **→ 4,6 %** (+15%) |
| **Scroll-diepte Starter → Narrative lock** | 55 % | **≥ 70 %** |
| **Contact-clicks Business → Enterprise demo** | 2 % | **≥ 5 %** |

---
*Laatste update: {{datum bij implementatie}}*

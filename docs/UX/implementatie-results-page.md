# Technisch Implementatieplan: Resultaten-Dashboard

**Project:** AIO Scanner – Scanresultaten MVP  
**Datum:** 17 juli 2024  
**Status:** Definitief – klaar voor ontwikkeling  
**Bronnen:**  
• `docs/UX/results-dashboard-brainstorm.md`  
• `docs/UX/frontend-backend-design-results-page.md`

---

## Aanleiding & Doel

De huidige scanresultatenpagina is onoverzichtelijk en onvoldoende actiegericht.  
Gebruikers (Marlies – ondernemer & Sven – SEO-expert) missen een duidelijke totaalscore, concrete actiepunten en toegang tot technische details.  

**Doel van dit MVP-traject:**  
Een desktop-first resultaten-dashboard leveren dat:
1.  Marlies in één oogopslag inzicht geeft in haar score en de drie belangrijkste verbeteracties.  
2.  Sven alle bevindingen inclusief onweerlegbaar technisch bewijsmateriaal biedt.  
3.  Als solide fundament dient voor latere uitbreidingen (interactieve filters, mobiele drill-down, export, dark theme).

---

## 1. Projectoverzicht & Status

| Fase | Sub-fase / Deliverable | Status | Eigenaar(s) | Notities |
| :--- | :--- | :--- | :--- | :--- |
| **Fase 1** | 1.1 API-laag & Datamodel | 🔲 | Backend | Endpoint + evidence-schema |
| | 1.2 Frontend Scaffold (Dashboard + Detail) | 🔲 | Frontend | Component-hiërarchie & routes |
| | 1.3 Evidence-viewer & Sortering | 🔲 | Frontend | Uitklapbare rij + syntax highlighting |
| | 1.4 QA & Integratie | 🔲 | FE, BE, QA | Unit + E2E tests, DoD-check |
| **Fase 2** | 2.1 Interactieve Dashboard-Filters | ⚙️ Gepland | Frontend | `interactiveDashboard` flag |
| | 2.2 Spotlight-Modal (desktop) | ⚙️ Gepland | Frontend | idem |
| **Fase 3** | 3.1 Mobile Drill-Down | ⚙️ Gepland | Frontend | `mobileOptimizedView` flag |
| | 3.2 Voor/Na-visualisaties | ⚙️ Gepland | FE + BE | `visualizeSolution` flag |
| | 3.3 Export-functionaliteit | ⚙️ Gepland | Backend | `exportFeature` flag |
| | 3.4 Dark Theme | ⚙️ Gepland | Frontend | `darkTheme` flag |

Legenda: 🔲 Te Starten | ⚙️ Gepland | ✅ Afgerond

---

## 2. Architecturale Principes

1. **MVP-first** – alleen bouwen wat Marlies & Sven nu nodig hebben.  
2. **SOC & DRY** – duidelijke scheiding tussen UI, state-management en services; hergebruik helper-functies.  
3. **Feature Flags** – nieuwe functionaliteit pas zichtbaar maken als hij af is.  
4. **Performance by Default** – één API-call, client-side caching.  
5. **Test-gedreven** – unit-tests voor helpers, E2E voor kernflow.

---

## 3. Fase 1 – MVP **(Desktop-first)**

### Sub-fase 1.1 – API-laag & Datamodel (Backend)

| ID | Taak | Details | Status |
| --- | --- | --- | --- |
| **BE-1** | Endpoint `GET /api/scan/results/[scanId]` | Volledig object incl. `findingStats` | 🔲 |
| **BE-2** | DB-migratie | Velden `evidence`, `findingStats` | 🔲 |
| **BE-3** | Helper `createCodeEvidence()` | Voor consistente `Evidence` objects | 🔲 |
| **BE-4** | Module refactor – TechnicalSEO | Evidence extractie | 🔲 |
| **BE-5** | Module refactor – overige modules | Parallel | 🔲 |
| **BE-6** | Placeholder AI-summary | Generieke tekst indien leeg | 🔲 |

### Sub-fase 1.2 – Frontend Scaffold (Componenten & Routes)

| ID | Taak | Details | Status |
| --- | --- | --- | --- |
| **FE-1** | Routes opzetten | `/results` en `/results/findings` | 🔲 |
| **FE-2** | `scanDataStore` | Hydrate in `load()` en hergebruiken | 🔲 |
| **FE-3** | Componenten | `ResultsHeader`, `CategoryOverview`, `TopActionItems`, `ActionItemModal` | 🔲 |
| **FE-4** | Styling | Clean & Focused thema, CSS vars | 🔲 |

### Sub-fase 1.3 – Evidence-viewer & Sortering

| ID | Taak | Details | Status |
| --- | --- | --- | --- |
| **FE-5** | `FindingsTable` | Sorteerbaar op `priority` | 🔲 |
| **FE-6** | `FindingRow` | Uitklapbare rij, label “Voor de ontwikkelaar” | 🔲 |
| **FE-7** | `EvidenceViewer` | Syntax highlight (`prismjs`) | 🔲 |
| **FE-8** | Loading & Error states | Skeleton, retry, fallback copy | 🔲 |

### Sub-fase 1.4 – QA & Integratie

| ID | Taak | Scope | Status |
| --- | --- | --- | --- |
| **QA-1** | Unit-tests Backend | Helper & mappers | 🔲 |
| **QA-2** | Unit-tests Frontend | Stores & utils | 🔲 |
| **QA-3** | E2E flow (Playwright) | Dashboard → Details → Evidence | 🔲 |
| **INT-1** | Cross-device audit | Desktop + iPad Mini viewport | 🔲 |

#### Definition of Done Fase 1
* Dashboard toont score, screenshot, samenvatting & Top 3 actiepunten.  
* Detailpagina toont alle bevindingen met uitklapbare evidence.  
* Alle QA-tests (QA-1 t/m QA-3) geslaagd.

---

## 4. Fase 2 – Interactive Dashboard (Feature flag `interactiveDashboard`)

**Doel:** Categoriekaarten fungeren als filters; Spotlight-modal voor details op desktop.

### Hoogtepunten
* **State-management:** Globale `activeCategoryStore`.  
* **Spotlight UI:** Generieke `Modal` component, content via slot-props.  
* **Backend:** hergebruik fase-1 endpoint.

#### Definition of Done Fase 2
* Filteren op categorie zonder extra API-calls.  
* Spotlight-modal toont details; keyboard-& screenreader- toegankelijk.

---

## 5. Fase 3 – Overige Roadmap (Feature flags)

| Flag | Feature | Korte beschrijving |
| --- | --- | --- |
| `mobileOptimizedView` | Mobile Drill-Down | Volledig scherm ‘slide-in’ detailview voor telefoons |
| `visualizeSolution` | Voor/Na | Inline code-diff of SERP-preview |
| `exportFeature` | Export | Export naar Jira/Notion (t.b.v. Sven) |
| `darkTheme` | Donker Thema | CSS-vars & toggle |

---

## 6. Risico’s & Mitigatie

| Risico | Impact | Mitigatie |
| --- | --- | --- |
| Onvolledige evidence | Expert frustreert | Helper + module refactor checklist |
| Grote API-payload | Trage load | `findingStats` + toekomstige paginering |
| Scope creep | Vertraging | Strikte fases + feature flags |

---

## 7. Governance

* **Lead Dev** bewaakt architectuur & scope.  
* **PO** prioriteert features en beoordeelt DoD.  
* **UX** levert wireframes + copy.  
* **Engineers** volgen dit document als bron van waarheid.  
* Wijzigingen alleen via **pull request** met review van Lead Dev + PO.

---

> Laatste update: 17 juli 2024 – door Lead Dev i.o.m. Frontend, Backend & UX

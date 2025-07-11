# Design-spec: Vernieuwde AIO Scanner Results Page

Dit document is de officiële overdracht van UX naar visual design (Lovable team). Het bevat alle component-specificaties, design-tokens en interactie-details die nodig zijn om een compleet en consistent Figma-ontwerp te maken voor de vernieuwde scanner-resultatenpagina.

---

## 1. Doel & Doelgroep

- **Doel:** Een resultatenpagina die in één oogopslag inzicht, overzicht en actiegericht advies biedt, weg van de "data-dump".
- **Persona’s:**
  - **Sanne (MKB-eigenaar):** Wil een duidelijke score, simpele taal en "Quick Wins".
  - **Jeroen (SEO-specialist):** Zoekt data, filters, en deelbare rapporten voor klanten.
  - **Linda (Developer):** Heeft behoefte aan concrete, technische stappen en code-voorbeelden.

---

## 2. Design-tokens (voor Figma Styles)

- **Primary Font:** Inter, `16px` basis, `1.5` line-height.
- **Heading-sizes (scale):** H1=`28px`, H2=`24px`, H3=`20px`.
- **Spacing Scale (4pt grid):** `4`, `8`, `12`, `16`, `24`, `32`.
- **Color Palette (functioneel):**
  - `Impact-HOOG`: `#E53935` (red-600)
  - `Impact-MED`: `#FB8C00` (orange-600)
  - `Impact-LAAG`: `#9E9E9E` (grey-500)
  - `Inspanning-QUICK`: `#43A047` (green-600)
  - `Inspanning-MED`: `#1E88E5` (blue-600)
  - `Inspanning-HOOG`: `#6A1B9A` (purple-700)
  - `BG-surface`: `#FFFFFF`
  - `BG-section`: `#F8F9FA`
  - `Primary-CTA`: `#1E88E5` (blue-600)
- **Border Radius:** `8px` voor kaarten, `16px` voor categorie-tegels.
- **Shadows:** `level-1` (hover): `0 2px 4px rgba(0,0,0,.08)`, `level-2` (drawer): `0 4px 12px rgba(0,0,0,.1)`.

---

## 3. Pagina-hiërarchie & Flow

De pagina volgt een strikte top-down flow:
`Header` → `ScanSummary (Hero)` → `DashboardExplanation` → `CategoryGrid` → `CategoryDrawer (ActionList)` → `IssueOverlay` → `Afgerond-sectie` → `Footer`

---

## 4. Component-specificaties

#### A) Header
- **Layout:** Sticky, hoogte `64px`, `1px` border-bottom `#E0E0E0`.
- **Content:** Logo (links), CTA "Nieuwe scan" & "Mijn rapporten" (rechts), Help-icoon.

#### B) ScanSummary (Hero)
- **Layout:** Tweekoloms grid met `32px` gap. Lichtblauwe gradient background (`#EEF7FF` → `#FFFFFF`).
- **Links:** Grote Gauge-component (diameter `140px` tot `280px`), AI-gegenereerde samenvatting in paragrafen.
- **Rechts:** "Scan Overzicht" checklist met 4-6 items (icoon + label).

#### C) DashboardExplanation
- **Layout:** Full-width strip met zachte achtergrond `#F8F9FA`.
- **Content:** Legenda met de `Impact`- en `Inspanning`-badges en hun betekenis.

#### D) CategoryTile (Tegel)
- **Layout:** Frame `160x160px`, `16px` radius, hover-effect (zie animaties).
- **Content:** `48x48px` icoon (boven), Titel (`18px` bold), Issue-teller badge (rechtsboven). Progress-ring (`56px`) als overlay linksonder.
- **State:** Kleur van de tegel is gebaseerd op de *hoogste impact* van de issues binnen die categorie.

#### E) CategoryDrawer (Zijpaneel)
- **Layout:** Slide-over paneel. Desktop: `40vw` rechts. Mobiel: `100vw`.
- **Content:** Breadcrumb (`← Terug`), Filter-pills (`Impact`, `Inspanning`, `Zoek...`), scrollbare lijst met `ActionItemCard`s.

#### F) ActionItemCard (Actiekaart)
- **Layout:** `100%` breed, `8px` radius, `12px` margin-bottom.
- **Top-row:** `Impact`-badge, `Inspanning`-badge, Titel (`20px` H3).
- **Body:** Collapsible via `<details>` element. Bevat "Waarom?" en "Hoe?" secties.
- **Voor/Ná blok:** Tweekoloms `<code>` blok (`14px` monospace) met rode en groene achtergrond.
- **Buttons:** "✔️ Markeer als opgelost", "📋 Kopieer code", "🔗 Meer lezen".

#### G) IssueOverlay (Modal)
- **Layout:** Gecentreerde modal. Desktop: `60vw`. Mobiel: full-screen.
- **Behavior:** `z-index: 1300`, `60%` dimmed background, `Esc` sluit, focus-trap.

#### H) Floating Action Button (FAB)
- **Layout:** `56x56px` cirkel, rechtsonder in viewport, primaire kleur `#1E88E5`.
- **Content:** Download-icoon (`⬇️`).
- **Behavior:** Fade-in zodra `≥ 1` kaart is afgevinkt.

---

## 5. Interacties & Animaties

- **Gauge-meter:** `1s` `ease-out` sweep animatie bij laden.
- **Tegel hover:** `translateY(-2px)` + `shadow-level-1`.
- **Tegel click:** `scale(0.96)` → `scale(1)` op `120ms` bij click, gevolgd door drawer-animatie.
- **Drawer open/close:** `240ms` `cubic-bezier(.22,.61,.36,1)` slide-in/out.
- **Accordion open/close:** `200ms` `ease-out` `height` transitie.
- **Kaart opgelost:** `270ms` fade naar `#E8F5E9` achtergrond en verplaatsing naar "Afgerond"-lijst.

---

## 6. Responsiveness

- **≥ 1024px (Desktop):** 12-koloms grid. Categorie-tegels nemen `4` kolommen in.
- **768-1023px (Tablet):** 8-koloms grid. Tegels `3` kolommen.
- **≤ 767px (Mobiel):** 4-koloms grid. Tegels `2` kolommen. Header wordt hamburger-menu. Filter-pills worden een horizontale scroll-list.

---

## 7. Toegankelijkheid (A11Y)

- **Contrast:** Alle tekst op achtergrond moet een contrastratio van `≥ 4.5:1` hebben.
- **Keyboard Nav:** Alle interactieve elementen zijn bereikbaar en bruikbaar met de `Tab`-toets. Focus-outline is duidelijk zichtbaar.
- **ARIA:** Gebruik `role="button"`, `aria-label`, en `aria-pressed` waar nodig.

---

## 8. Deliverables van Lovable

1. **Figma-bestand** met:
   a. "Design Tokens" pagina (styles).
   b. "Component Library" pagina (alle bovenstaande componenten).
   c. "Pagina Flows" pagina (Desktop & Mobiele frames).
2. **Prototyping links** om de gedefinieerde animaties te demonstreren.
3. **Export van alle benodigde SVG-iconen** (op een `24px` grid).
4. **Toelichting** op edge-cases (bv. 0 issues, 50+ issues, error states).

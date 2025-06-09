# Website Tooling - Component Inventarisatie

## 📊 Overzicht
**Totaal: 48 componenten**
- **Shadcn-Svelte: 21 componenten (44%)**
- **Custom: 27 componenten (56%)**

---

## ✅ SHADCN-SVELTE COMPONENTEN (21)

### 📝 Forms & Inputs (4)
- **Email Input Field** - Standard input met email validatie
- **Password Input Field** - Input met show/hide toggle
- **Checkbox (voorwaarden)** - Styled checkbox voor akkoord voorwaarden
- **Submit Buttons** - Primary/secondary button styling

### 🔘 Buttons & CTAs (3)
- **Primary CTA Button** - Hoofdactie buttons (blauw, prominent)
- **Secondary Button** - Tweede keuze buttons (outline/ghost)
- **Icon Buttons** - Buttons met iconen (share, download, etc.)

### 📊 Data Display (3)
- **Progress Bar/Circle** - Voortgang indicatoren voor scans
- **Status Indicators** - Badges voor status (✅⏳⏸️)
- **Scan History List** - Tabel/lijst van eerdere scans

### 🃏 Cards & Containers (4)
- **Package Pricing Cards** - Standaard pricing cards layout
- **Feature Cards** - Grid van features met icoon + tekst
- **Testimonial Cards** - Klantreviews in card format
- **Purchase Confirmation Card** - Bevestiging na aankoop

### 🎭 Overlays & Modals (3)
- **Background Overlay** - Dialog backdrop (blur/darken)
- **Toast Notifications** - Success/error meldingen
- **Loading States** - Skeleton loaders tijdens laden

### 🎮 Interactive Elements (3)
- **Accordions (8 modules)** - Uitklapbare secties voor modules
- **Tabs (auth page)** - Login/Register tab switching
- **Hover Tooltips** - Info tooltips bij hover

### 🧭 Layout (1)
- **Breadcrumbs** - Navigatie breadcrumbs

---

## 🛠️ CUSTOM COMPONENTEN (27)

### 🧭 Layout & Navigation (4)
- **Header/Navigation Bar** - Complex nav met logo, menu, user account
- **Footer** - Multi-column footer met links en contact info
- **Page Container** - Responsive wrapper met max-width en padding
- **Grid Layout (responsive)** - Custom grid systeem voor verschillende breakpoints

### 📝 Forms & Inputs (2)
- **URL Input Field (large, hero)** - Grote, prominente input op homepage
- **Form Validation (real-time)** - Live validatie feedback tijdens typen

### 🔘 Buttons & CTAs (2)
- **Social Share Buttons** - Integratie met social media APIs
- **Package Selection Cards** - Interactieve cards die fungeren als radio buttons

### 📊 Data Display (5)
- **Score Circle (animated 0-100)** - Geanimeerde SVG circle met score
- **Radar Chart (8-module)** - Interactieve 8-punts radar voor modules
- **Module Grid (8 items)** - Custom grid voor 8 SEO modules
- **Activity Log (live updates)** - Real-time feed van scan activiteiten
- **Credit Balance Display** - Styled weergave van beschikbare credits

### 🃏 Cards & Containers (3)
- **Quick Wins Cards (expandable)** - Cards die uitklappen met details
- **Module Accordion Cards** - Custom accordion per SEO module
- **Website Preview Card** - Screenshot + metadata van gescande site

### 🎭 Overlays & Modals (1)
- **Email Capture Modal (glassmorphism)** - Styled modal met glassmorphism effect

### ⚡ Specialized Components (7)
- **Live Scan Interface** - Real-time scanning UI met progress en feedback
- **Countdown Timer** - Geanimeerde timer voor tijdelijke aanbiedingen
- **Website Screenshot Display** - Component voor het tonen van website screenshots
- **PDF Download Button** - Button die PDF rapport genereert en download
- **Discount Banner** - Promotionele banner met animaties
- **Trust Badges** - Vertrouwenssignalen (SSL, beveiliging, reviews)
- **Social Proof Indicators** - Live tellers van gebruikers, scans, etc.

### 🎮 Interactive Elements (3)
- **Expandable Sections** - Custom uitklapbare content secties
- **Copy-to-clipboard** - Kopieer functionaliteit met feedback
- **Smart Email Detection** - Automatische email detectie en suggesties

---

## 🎯 Prioriteit Custom Components

### 🔥 High Priority (Core Features)
1. **Score Circle** - Hero element, eerste indruk
2. **Live Scan Interface** - Kern van de applicatie
3. **Radar Chart** - Unieke selling point
4. **Email Capture Modal** - Conversie kritiek

### 🟡 Medium Priority (User Experience)
5. **URL Input Field (hero)** - Landing page conversie
6. **Activity Log** - Real-time feedback
7. **Website Preview Card** - Visuele feedback
8. **Package Selection Cards** - Purchasing flow

### 🔵 Low Priority (Polish)
9. **Countdown Timer** - Marketing element
10. **Social Proof Indicators** - Trust building
11. **Trust Badges** - Credibility
12. **Glassmorphism Modal** - Visual polish

---

## 💡 Development Strategie

**Fase 1: Shadcn Foundation**
- Setup Shadcn-Svelte basis componenten
- Bouw standaard forms, buttons, cards
- Krijg basis functionaliteit werkend

**Fase 2: Core Custom Components**
- Score Circle voor immediate impact
- Live Scan Interface voor functionaliteit
- Radar Chart voor differentiatie

**Fase 3: Enhancement & Polish**
- Resterende custom components
- Animations en micro-interactions
- Performance optimizatie

**Voordelen van deze mix:**
- Snelle start met proven components
- Focus op unieke features die waarde toevoegen
- Consistent design system als basis
- Efficiënte development tijd
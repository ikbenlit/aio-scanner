# AIO-Scanner MVP - Complete Pagina Inventaris

## 🗺️ Core User Journey Pagina's

### **1. Landing Page** (`/`)
**Functie:** Eerste indruk + gratis scan conversie

#### **Layout Secties:**
- **Header/Menu Bar**
  - Logo: AIO-Scanner
  - Navigation: Home, Features, Prijzen, FAQ
  - CTA Button: "Gratis Scan" + "Login"

- **Hero Sectie**
  - H1: "Is jouw website AI-proof?" 
  - Subtitle + value proposition
  - **Grote URL input** + "Scan Nu" button
  - Trust indicators: "✓ Gratis ✓ 30 seconden ✓ GDPR"

- **Live Demo Embed**
  - Iframe met scan demo
  - "Zie het in actie" 

- **Features Sectie** 
  - 8 AI-modules uitgelegd
  - "Hoe het werkt" stappen
  - Voordelen van AI-optimalisatie

- **Social Proof**
  - "500+ bedrijven gebruiken AIO-Scanner" 
  - Testimonials/reviews
  - Bekende logo's

- **Pricing Teaser**
  - Simpele kaarten: Gratis vs Betaald
  - "Meer scans nodig?" CTA naar `/upgrade`

- **FAQ Sectie**
  - "Wat is AI-optimalisatie?"
  - "Hoe lang duurt een scan?"
  - "Is mijn data veilig?"

- **Footer**
  - Links: Privacy, Terms, Contact
  - Copyright + bedrijfsinfo

---

### **2. Live Scan Page** (`/scan/{scanId}`)
**Functie:** Real-time scanning experience + user engagement

#### **Layout Secties:**
- **Header (Simplified)**
  - Logo: AIO-Scanner
  - Scan ID/URL being scanned
  - NO cancel/stop option (MVP decision)

- **Main Scan Interface**
  - **Large Progress Circle** (0-100%)
  - **Current Status:** "Analyzing content structure..."
  - **Estimated Time:** "~15 seconds remaining"

- **Module Progress Grid**
  ```
  🤖 AI Content Analysis     ✅ Complete
  🔍 Technical SEO           ⏳ Analyzing...
  📝 Schema Markup           ⏸️ Waiting
  🌐 Cross-web Presence      ⏸️ Waiting
  🏆 Authority & Citations   ⏸️ Waiting
  🔄 Content Freshness       ⏸️ Waiting
  📱 Multimodal             ⏸️ Waiting
  📊 Monitoring Hooks        ⏸️ Waiting
  ```

- **Live Activity Log**
  ```
  ✓ robots.txt checked
  ✓ Sitemap.xml found
  ⏳ Checking structured data...
  ```

- **Website Preview**
  - Small screenshot/favicon
  - URL being scanned
  - "Scanning jouwbedrijf.nl"

#### **Error Handling Strategy:**
- **Graceful degradation** - altijd iets van waarde leveren
- **No hard failures** - friendly messages bij problemen
- **Mobile:** Simplified stack layout

---

### **3. Email Capture Modal** (overlay op scan page)
**Functie:** Maximum leverage conversie moment - email voor resultaten

#### **Modal Layout:**
- **Background Overlay**
  - Blur + dark overlay (75% opacity)
  - Glassmorphism modal centered
  - **NO close button** (email required to proceed)

- **Success Header**
  - ✅ **"Scan Voltooid!"** (achievement state)
  - "Ontdek wat AI-zoekmachines van jouw website vinden"

- **Website Preview Card**
  ```
  ┌─────────────────────────────────┐
  │ [Screenshot] │ jouwbedrijf.nl   │
  │ 📷 120x60px  │ ✅ AI-gescand    │
  └─────────────────────────────────┘
  ```

- **Results Teaser (Partial Reveal)**
  - **Score:** "78/100" (large, visible)
  - **Status:** "Goed - maar verbetering mogelijk"
  - **Top 2 findings:** 
    - ⚠️ "Schema markup ontbreekt"
    - 🔍 "Content structuur verbeteren" 
  - **Blurred section:** "+ 3 andere kritieke punten" (FOMO)

- **Email Form**
  - **"Email voor volledige resultaten:"**
  - Email input field
  - **CTA:** "Bekijk Mijn Resultaten" button

- **Trust Indicators**
  - ✓ "Geen spam - alleen je rapport"
  - ✓ "Direct in je inbox binnen 30 seconden" 
  - ✓ "GDPR-compliant & veilig"

#### **Email Validation:**
- **Real-time format check** tijdens typen
- **Submit validation:** Check of email al bestaat
- **No escape strategy:** Email = enige weg vooruit

---

### **4. Results Dashboard** (`/results/{scanId}`)
**Functie:** Het hart van value delivery - toon complete AI-analyse + upgrade nudges

#### **Layout Secties:**
- **Header Bar**
  - Website URL + scan timestamp 
  - **"Scan Opnieuw"** button (→ Landing page)
  - Breadcrumb: Home → Results

- **Main Grid (Desktop: 2-column)**

  **Left Panel - Score Showcase**
  - **Giant Score Circle:** "78/100" (animated count-up)
  - **Status Label:** "Goed" (color-coded: green/orange/red)
  - **Description:** "Sterke basis, maar verbetering mogelijk"
  - **Action Buttons:**
    - **Gratis User:** "📧 PDF rapport verstuurd naar je email"
    - **Paid User:** "📄 Download Uitgebreid PDF"
    - 📤 **"Deel Resultaten"** (social proof generator)

  **Right Panel - Radar Chart**
  - **8-module visualization** (interactive hover)
  - **Module labels** met scores per as
  - **Color coding** per module status
  - **Hover tooltip** toont module details

- **Bottom Section (Full Width)**

  **Quick Wins Section**
  - **"⚡ Top 5 Prioritaire Acties"**
  - **Expandable cards** met impact/effort scores
  - **#1 Schema markup, #2 Meta descriptions, etc.**
  - **Preview code snippets** (upgrade voor volledig)

  **Module Accordions**
  - **8 expandable sections** (AI Content, Technical SEO, etc.)
  - **Traffic light status** per module
  - **Findings + Recommendations** per module

  **Upgrade Prompts (Strategic)**
  - **"Unlock AI Implementation Guide"** banner
  - **"500+ bedrijven upgraden voor volledig rapport"**

#### **PDF Content Difference:**
- **Basis PDF (email):** Score + top 3 findings + branding  
- **Uitgebreid PDF (betaald):** Alle modules + code + implementatie guide

#### **20% Discount Banner (Nieuwe Users):**
```
┌─────────────────────────────────┐
│ 🎉 Alleen voor eerste scanners! │
│                                 │
│ 20% korting - vervalt over:     │
│ ⏰ 23:42:17                     │
│                                 │
│ Starter: €19,95 → €15,96       │
│ Professional: €49,95 → €39,96  │
│                                 │
│ [Claim €9,99 Korting Nu!]      │
└─────────────────────────────────┘
```

---

### **5. Package Selection** (`/upgrade`)
**Functie:** Pricing comparison + conversion naar betaling

#### **Layout Secties:**
- **Header**
  - **H1:** "Kies je pakket"
  - **Subtitle:** "Credits verlopen nooit. Betaal alleen voor wat je gebruikt."

- **Discount Banner (Conditional)**
  ```
  🎉 Speciale aanbieding! 20% korting voor eerste scanners
  ⏰ Vervalt over: 23:42:17
  ```

- **Package Cards (Side-by-side)**

  **Starter Pack**
  - **€19,95** ~~€15,96~~ (if discount active)
  - **"Populair" badge**
  - "Perfect voor kleine bedrijven"
  - **2 credits** 
  - ✓ Uitgebreide PDF ✓ Historie (30d)

  **Professional Pack**  
  - **€49,95** ~~€39,96~~ (if discount active)
  - "Voor bureaus & consultants"
  - **5 credits**
  - ✓ Uitgebreide PDF ✓ Historie (90d)

- **Email Section (Conditional)**
  ```
  Email: [________________] (if unknown user)
  □ Ik ga akkoord met voorwaarden
  ```

- **Social Proof**
  - "500+ bedrijven vertrouwen op AIO-Scanner"
  - Testimonials/reviews

- **FAQ Section**
  - "Verlopen credits?"
  - "Kan ik later upgraden?"

#### **Eerste Scanner Detection:**
```
IF scan_count = 0 OR history_scans.length = 0 
THEN show_discount = true
```

---

### **6. Payment Success** (`/checkout/success`)
**Functie:** Bevestiging + onboarding naar eerste scan als paid user

#### **Layout Secties:**
- **Success Hero**
  - **✅ Grote success icon**
  - **H1:** "Welkom bij AIO-Scanner!"**
  - **Subtitle:** "Je betaling is succesvol verwerkt"

- **Purchase Confirmation (Conditional)**
  **Nieuwe User (eerste scan):**
  ```
  ┌─────────────────────────────────┐
  │ 📦 Starter Pack aangekocht      │
  │ 💳 €15,96 (20% korting toegepast) │
  │ ⚡ 2 credits toegevoegd          │
  │ 📧 Factuur verstuurd naar email │
  └─────────────────────────────────┘
  ```

  **Returning User (credit bijkoop):**
  ```
  ┌─────────────────────────────────┐
  │ 📦 Starter Pack aangekocht      │
  │ 💳 €19,95 (reguliere prijs)     │
  │ ⚡ 2 credits toegevoegd          │
  └─────────────────────────────────┘
  ```

- **Bonus Scan Gift**
  ```
  🎁 Als dank voor je aankoop:
     GRATIS BONUS SCAN bovenop je 2 credits!

  ⚡ Jouw saldo: 3 scans beschikbaar
     (2 gekochte credits + 1 bonus scan)

  [Gebruik Je Bonus Scan Nu!] ← Tijdelijke toegang
  ```

- **Account Created Notice**
  ```
  📱 Account wordt aangemaakt op de achtergrond
  📧 Login instructies volgen per email
  
  [Start Je Eerste Scan] ← Tijdelijke session
  [Wacht op Email]       ← Alternative path
  ```

- **Social Sharing Prompt**
  ```
  💪 Deel je succes!
  "Ik optimaliseer mijn website voor AI-zoekmachines! 
  Test jouw site gratis op AIO-Scanner.nl 🚀"

  [LinkedIn] [WhatsApp] [Twitter]
  ```

#### **Tijdelijke Login Logica:**
- **Scope:** Alleen vanaf success page
- **Duration:** 1 uur of browser close
- **Access:** Dashboard + scan functionaliteit
- **Security:** Geen bookmark mogelijk

---

### **7. Payment Failed** (`/checkout/failed`)
**Functie:** Recovery van mislukte betalingen + user support

#### **Layout Secties:**
- **Error Header**
  - **❌ "Betaling niet voltooid"**
  - **Subtitle:** "Geen zorgen, er is niets van je rekening afgeschreven"

- **Failure Reason (Dynamic)**
  **Cancelled by User:**
  ```
  💭 Je hebt de betaling geannuleerd
     Geen probleem! Je kunt het altijd opnieuw proberen.
  ```

  **Payment Failed:**
  ```
  ⚠️ Betaling is niet doorgegaan
     Dit kan gebeuren bij onvoldoende saldo of technische problemen.
  ```

  **Technical Error:**
  ```
  🔧 Technische storing
     Er ging iets mis bij de verwerking. Probeer het over een paar minuten opnieuw.
  ```

- **Recovery Options**
  **Primary Actions:**
  ```
  [Probeer Opnieuw] ← Back to package selection (pre-filled)
  [Andere Betaalmethode] ← Direct naar Mollie
  ```

  **Alternative Paths:**
  ```
  [Terug naar Resultaten] ← If they had a scan ready
  [Contact Support] ← For persistent issues
  ```

- **Support Section**
  ```
  🆘 Hulp nodig?

  💬 Live chat: beschikbaar 9:00-17:00
  📧 Email: support@aio-scanner.nl  

  Veelgestelde vragen:
  • "Waarom werd mijn betaling geweigerd?"
  • "Welke betaalmethoden accepteren jullie?"
  • "Hoe lang duurt een terugboeking?"
  ```

- **Discount Preservation**
  ```
  ⏰ Je 20% korting vervalt over: 22:15:33
  [Probeer Opnieuw] ← Maintain urgency
  ```

#### **Recovery Strategy:**
- **No retry limits** - laat Mollie/bank limits bepalen
- **Data retention:** Package selection 24 uur onthouden
- **Rate limiting:** Max 1 payment attempt per minuut

---

### **8. User Dashboard** (`/dashboard`) - MVP Simplified
**Functie:** Command center voor paid users - focus op scan starten

#### **MVP Dashboard - Essential Only:**
```
👋 Welkom terug, Colin!

⚡ Credit Saldo: 3 scans (verlopen nooit)
[Koop Meer Credits]

🚀 [Nieuwe Scan Starten] ← Primary focus

📊 Laatste Scan:
jouwbedrijf.nl - 78/100 ✅ [Bekijk]

⚙️ [Account Instellingen]
```

#### **Empty State (New User):**
```
🎉 Account aangemaakt!
Je hebt 3 scans beschikbaar
(2 gekochte + 1 bonus)

[Start Je Eerste Scan]
```

#### **Low Credits Warning:**
```
⚠️ Laatste credit!
Na deze scan ben je door je credits heen.

[Koop Meer Credits] ← Proactive upsell
```

#### **MVP Scope Decisions:**
- **Usage analytics:** Skip for MVP
- **Detailed history:** Skip for MVP  
- **Advanced settings:** Skip for MVP
- **Focus:** Scan starten + credit management

---

### **9. Auth Page** (`/auth`) - Smart Login
**Functie:** Login met intelligent new user detection

#### **Initial State:**
```
┌─────────────────────────────────┐
│         AIO-Scanner Login       │
├─────────────────────────────────┤
│ Email: [________________]       │
│ Wachtwoord: [____________]      │
│                                 │
│ [Login]                         │
│                                 │
│ ─────────── of ──────────       │
│                                 │
│ Nog geen account?               │
│ [Start met eerste aankoop]      │
└─────────────────────────────────┘
```

#### **Smart Email Detection:**
**Email EXISTS:**
```
Email: colin@example.com ✓
Wachtwoord: [____________]  ← Focus hier
[Login]
```

**Email NOT EXISTS:**
```
Email: nieuw@example.com ⚠️
"Dit email heeft nog geen account"
[Maak account aan met eerste aankoop] ← Prominent CTA
```

#### **Account Upgrade Flow:**
```
Auth → "Geen account" → Package Selection → Payment → Account Creation
```

---

## 🔄 **Complete User Flows**

### **Flow A: Free Scan → Conversion**
```
Landing (/) → Scan (/scan/123) → Email Gate (modal) → Results (/results/123) → Upgrade (/upgrade) → Success (/checkout/success) → Dashboard (/dashboard)
```

### **Flow B: Direct Purchase**
```
Landing (/) → Upgrade (/upgrade) → Success (/checkout/success) → Dashboard (/dashboard)
```

### **Flow C: Returning User**
```
Auth (/auth) → Dashboard (/dashboard) → Scan (/scan/456) → Results (/results/456)
```

### **Flow D: Payment Recovery**
```
Upgrade (/upgrade) → Failed (/checkout/failed) → Upgrade (pre-filled) → Success (/checkout/success)
```

---

## 🎯 **Key Business Logic**

### **Credit System:**
- **Starter:** €19,95 = 2 credits (€15,96 with 20% first-time discount)
- **Professional:** €49,95 = 5 credits (€39,96 with 20% first-time discount)
- **Bonus:** +1 gratis scan bij elke aankoop
- **Expiry:** Credits verlopen nooit

### **Feature Differences:**
- **Gratis:** 1 scan + basis PDF (email)
- **Starter:** 2 credits + uitgebreide PDF + historie (30d)
- **Professional:** 5 credits + uitgebreide PDF + historie (90d)

### **Account Creation:**
- **Async:** Account creation op achtergrond na payment
- **Tijdelijke toegang:** 1-uur session vanaf success page
- **Email confirmation:** Login instructies per email

### **Payment Flow:**
- **2-step:** Package Selection → Mollie Hosted Payment
- **Email handling:** Pre-fill bekend email, vraag onbekend email
- **Recovery:** Data retention + discount preservation

---

**Status:** 🎉 Alle 8 MVP pagina's gedefinieerd!  
**Next Step:** Component mapping voor Shadcn vs Custom beslissingen
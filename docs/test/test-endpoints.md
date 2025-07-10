# Beginnersgids: Scans Uitvoeren en PDFs Maken

> **Voor beginners:** Stap-voor-stap uitleg om scans uit te voeren en PDFs te maken vanuit je browser

---

## 🚀 Snelstart - Je Eerste Scan

### Stap 1: Development Server Starten
1. Open je terminal/command prompt
2. Navigeer naar je project folder
3. Type: `npm run dev`
4. Wacht tot je ziet: `Local: http://localhost:5173/`

### Stap 2: Je Eerste Test in de Browser
1. Open je browser (Chrome, Firefox, Edge)
2. Ga naar: `http://localhost:5173/api/test/vertex`
3. Je krijgt dit te zien:
```json
{
  "success": true,
  "message": "Vertex AI working!"
}
```
✅ **Dit betekent:** Je systeem werkt!

### Stap 3: MVP Metrics Quick Test (30 seconden) ⭐ NIEUW
**Test of jouw enhanced findings werken:**
1. **URL:** `http://localhost:5173/api/test/business-tier?mode=full&url=https://example.com`
2. **Wacht 1-2 minuten** (AI processing + metrics berekening)
3. **Zoek in resultaat naar:** `"metrics"` velden in de JSON
4. **✅ Success:** Als je metrics objecten ziet met scores en benchmarks
5. **❌ Probleem:** Als geen metrics velden aanwezig zijn → zie Troubleshooting

---

## 📊 Verschillende Scan Types Uitvoeren

### 🟢 Basic Scan (Gratis Tier)
**Wat doet het:** Test de basis SEO modules (Technical SEO + Schema Markup)

1. **URL in browser:** `http://localhost:5173/api/test?url=https://example.com`
2. **Wacht 15-30 seconden** (scan loopt)
3. **Resultaat:** JSON met je scan resultaten

**Wat je ziet:**
```json
{
  "success": true,
  "type": "full_scan",
  "result": {
    "overallScore": 75,
    "moduleCount": 2,
    "completedModules": 2
  }
}
```

### 🔵 Business Scan (Met AI + Enhanced Metrics) ⭐ ENHANCED
**Wat doet het:** Business tier met AI-verbeteringen, meer modules EN nieuwe metrics intelligence

1. **URL in browser:** `http://localhost:5173/api/test/business-tier?mode=quick`
2. **Voor volledige scan:** `http://localhost:5173/api/test/business-tier?mode=full&url=https://example.com`
3. **Wacht 1-2 minuten** (AI processing + metrics berekening)

**Wat je ziet (Enhanced met Metrics):**
```json
{
  "status": "success",
  "scanResult": {
    "tier": "business", 
    "hasAIReport": true,
    "hasAIInsights": true,
    "moduleResults": [
      {
        "name": "AIContent",
        "findings": [
          {
            "title": "Conversational tone gedetecteerd",
            "description": "Goede balans tussen persoonlijke en professionele taal (score: 75)",
            "priority": "low",
            "category": "ai-content",
            "metrics": {
              "score": 75,
              "benchmark": "boven gemiddeld",
              "details": {
                "pronouns": 8,
                "questions": 3,
                "corporate": 2
              }
            }
          }
        ]
      },
      {
        "name": "AICitation", 
        "findings": [
          {
            "title": "Sterke Authoriteit Signalen",
            "description": "Uitstekende authoriteit met 2 media vermeldingen, 4 klant referenties, 3 awards/erkenningen",
            "priority": "low",
            "category": "authority",
            "metrics": {
              "score": 23,
              "benchmark": "sterk",
              "breakdown": {
                "media": 2,
                "clients": 4,
                "recognition": 3
              }
            }
          }
        ]
      }
    ]
  },
  "aiEnhancement": {
    "confidence": 0.85,
    "costTracking": {
      "aiCost": 0.12
    }
  }
}
```

#### 🎯 Business Tier Metrics Testing (Voor MVP validatie)
**Test verschillende content types om metrics te valideren:**

**Hoge Conversational Score (70-100):**
```
http://localhost:5173/api/test/business-tier?mode=full&url=https://blog.example.com
```
*Verwacht: Veel persoonlijke voornaamwoorden, vragen, weinig corporate taal*

**Lage Conversational Score (0-39):**
```
http://localhost:5173/api/test/business-tier?mode=full&url=https://corporate.example.com
```
*Verwacht: Formele taal, weinig directe aanspreking, veel corporate termen*

**Hoge Authority Score (20+):**
```
http://localhost:5173/api/test/business-tier?mode=full&url=https://agency.com/testimonials
```
*Verwacht: Client testimonials, awards, media mentions*

**Lage Authority Score (0-9):**
```
http://localhost:5173/api/test/business-tier?mode=full&url=https://newstartup.com
```
*Verwacht: Weinig externe validatie, geen awards/media*

### 🟡 Enterprise Scan (Volledig)
**Wat doet het:** Enterprise tier met multi-page analyse en strategische insights

1. **URL in browser:** `http://localhost:5173/api/test/enterprise-tier?mode=quick`
2. **Voor volledige scan:** `http://localhost:5173/api/test/enterprise-tier?mode=full&url=https://example.com`
3. **Wacht 2-5 minuten** (uitgebreide analyse)

---

## 🧪 MVP Enhanced Findings Validatie ⭐ NIEUW

> **Specifiek voor MVP Business Enhancement:** Test de nieuwe metrics functionaliteit

### 🎯 Test 1: Metrics Interface Validatie (5 minuten)
**Doel:** Verifieer dat metrics correct worden toegevoegd aan findings

#### Stappen:
1. **Test URL:** `http://localhost:5173/api/test/business-tier?mode=full&url=https://example.com`
2. **Zoek in JSON response naar:** `"metrics"` objecten
3. **Verifieer structuur:**
   ```json
   "metrics": {
     "score": 75,           // Numerieke score 0-100
     "benchmark": "...",    // "zwak", "gemiddeld", "boven gemiddeld", "sterk"
     "details": {...},      // Voor conversational: pronouns, questions, corporate
     "breakdown": {...}     // Voor authority: media, clients, recognition
   }
   ```

#### ✅ Success Criteria:
- AIContent findings bevatten conversational metrics
- AICitation findings bevatten authority metrics  
- Starter tier bevat GEEN metrics (gebruik `http://localhost:5173/api/test?url=https://example.com`)
- Scores zijn tussen 0-100
- Benchmarks zijn correct geclassificeerd

### 🎯 Test 2: Score Formule Verificatie (10 minuten)
**Doel:** Controleer of score berekeningen correct zijn

#### Conversational Score Test:
**Formule:** `(pronouns × 10) + (questions × 5) - (corporate × 2)`

```bash
# Test persoonlijke content (hoge score verwacht)
http://localhost:5173/api/test/business-tier?mode=full&url=https://personalblog.example.com

# Test corporate content (lage score verwacht)  
http://localhost:5173/api/test/business-tier?mode=full&url=https://corporate.example.com
```

#### Authority Score Test:
**Formule:** `(media × 3) + (clients × 2) + (recognition × 1)`

```bash
# Test testimonials page (hoge score verwacht)
http://localhost:5173/api/test/business-tier?mode=full&url=https://agency.com/testimonials

# Test startup about page (lage score verwacht)
http://localhost:5173/api/test/business-tier?mode=full&url=https://startup.com/about
```

### 🎯 Test 3: Benchmark Classificatie (5 minuten)
**Doel:** Verifieer dat benchmark labels correct zijn

#### Conversational Benchmarks:
- **70-100:** "boven gemiddeld"
- **40-69:** "gemiddeld" 
- **0-39:** "onder gemiddeld"

#### Authority Benchmarks:
- **20+:** "sterk"
- **10-19:** "gemiddeld"
- **0-9:** "zwak"

#### Test met Debug Mode:
```bash
# Zie exacte score berekeningen
http://localhost:5173/api/test/raw-data?url=https://example.com&tier=business&debug=true
```
*Check `test-output/debug-data-[timestamp].md` voor gedetailleerde breakdowns*

---

## 📄 PDFs Maken - Gemakkelijke Methode

### Methode 1: PDF met Mock Data (Snel & Simpel)
**Wanneer gebruiken:** Voor het testen van PDF layouts en styling

#### Starter PDF maken:
1. **URL:** `http://localhost:5173/api/test/pdf-generation?tier=starter&download=true`
2. **Klik Enter** → PDF download start automatisch
3. **Bestandsnaam:** `aio-scanner-starter-[id].pdf`

#### Business PDF maken:
1. **URL:** `http://localhost:5173/api/test/pdf-generation?tier=business&download=true`
2. **PDF met grafieken** wordt gedownload
3. **Grootte:** ~200-400 KB

#### Enterprise PDF maken:
1. **URL:** `http://localhost:5173/api/test/pdf-generation?tier=enterprise&download=true`
2. **Volledige PDF met KPI dashboard** wordt gedownload
3. **Grootte:** ~300-600 KB

### Methode 2: PDF met Echte Scan Data (Aanbevolen)
**Wanneer gebruiken:** Voor realistische PDFs met echte website data

#### Stap 1: Echte Scan Uitvoeren
1. **URL:** `http://localhost:5173/api/test/business-tier?mode=full&url=https://www.theguardian.com/international`
2. **Wacht tot scan compleet is** (1-2 minuten)
3. **Zoek in het resultaat naar:** `"scanId": "aac92063-4e5a-4a52-ac96-5394b5c093bf"`
4. **Kopieer dit scanId**

#### Stap 2: PDF Maken met Echte Data
1. **URL:** `http://localhost:5173/api/test/pdf-generation?download=true&scanId=4372a55d-4196-42a1-b423-1579580ed813`
2. **Vervang het scanId** met jouw gekopieerde ID
3. **PDF met echte data** wordt gedownload

> **💡 Pro Tip:** Bewaar je scanId! Je kunt hem steeds opnieuw gebruiken om PDFs te genereren terwijl je templates aanpast.

---

## 🔬 Raw Data Analysis - Voor Ontwikkelaars

### Wat is Raw Data Analysis?
**Wanneer gebruiken:** Om te zien wat de scanner ECHT produceert voordat AI interpretatie

### 🔍 Debug Mode - Allerruuwste Data + Metrics ⭐ ENHANCED
**Wat krijg je:** Complete HTML code, HTTP headers, DOM structuur + Metrics calculation breakdowns
1. **URL:** `http://localhost:5173/api/test/raw-data?url=https://gifsvoorinsta.nl&debug=true&tier=business`
2. **Resultaat:** Markdown bestand in `test-output/debug-data-[timestamp].md`
3. **Bevat:** 
   - Raw HTML string (exact wat fetch() teruggeeft)
   - HTTP response info (status, headers, server)
   - Content-Length en character encoding
   - Complete DOM tree structuur
   - **NIEUW:** Metrics calculation breakdowns:
     ```
     Conversational Score Debug:
     - Pronouns found: 8 (je, jij, wij, etc.)
     - Questions found: 3 (vraagmarkers)
     - Corporate terms: 2 (klanten, organisatie)
     - Formula: (8 × 10) + (3 × 5) - (2 × 2) = 91
     
     Authority Score Debug:
     - Media mentions: 2 (interview, artikel)
     - Client signals: 4 (klanten, samenwerking)
     - Recognition: 3 (award, winnaar, erkend)
     - Formula: (2 × 3) + (4 × 2) + (3 × 1) = 17
     ```

### 📊 Raw Mode - Pure Module Output + Metrics ⭐ ENHANCED
**Wat krijg je:** Module resultaten ZONDER AI interpretatie maar MET nieuwe metrics
1. **URL:** `http://localhost:5173/api/test/raw-data?url=https://gifsvoorinsta.nl&raw=true&tier=business`
2. **Resultaat:** Markdown bestand in `test-output/raw-data-[timestamp].md`
3. **Bevat:**
   - Pure JSON output van elke module
   - Exacte CSS selectors die matches vonden
   - Raw scores (bijv. 35/100)
   - Pattern matching resultaten
   - Finding objects met technicalDetails
   - **NIEUW:** Raw metrics calculations:
     ```json
     {
       "title": "Conversational tone gedetecteerd",
       "metrics": {
         "score": 75,
         "benchmark": "boven gemiddeld",
         "details": {
           "pronouns": 8,
           "questions": 3,
           "corporate": 2
         }
       }
     }
     ```

### 🎯 Standard Mode - AI Enhanced (Default)
**Wat krijg je:** Normale scan met AI verbetering (voor vergelijking)
1. **URL:** `http://localhost:5173/api/test/raw-data?url=https://gifsvoorinsta.nl&tier=business`
2. **Resultaat:** Markdown bestand in `test-output/scan-data-[timestamp].md`
3. **Bevat:**
   - AI-verbeterde analysis (alleen Business+ tiers)
   - Business recommendations
   - Implementation plans
   - **ENHANCED:** AI interpretatie van metrics data

### 🚀 Business Tier - Met AI Enhancement + Metrics ⭐ UPDATED
**Wat krijg je:** Business tier met AI-powered insights, meer modules EN nieuwe metrics intelligence

1. **Raw mode:** `http://localhost:5173/api/test/raw-data?url=https://gifsvoorinsta.nl&tier=business&raw=true`
2. **AI enhanced:** `http://localhost:5173/api/test/raw-data?url=https://gifsvoorinsta.nl&tier=business`
3. **Debug mode:** `http://localhost:5173/api/test/raw-data?url=https://gifsvoorinsta.nl&tier=business&debug=true`

**Vergelijking Basic vs Business (UPDATED):**
- **Basic tier raw:** `"metaTags: Ontbrekend"` (geen metrics)
- **Business tier raw:** `"metaTags: Ontbrekend", "metrics": {"score": 0, "benchmark": "zwak"}` (met metrics)  
- **Business tier AI:** `"Meta description optimization needed - Add compelling 150-160 character descriptions..." + AI interpretatie van metrics`

### Output Bestanden:
**Alle resultaten worden automatisch opgeslagen in:**
- `test-output/debug-data-[timestamp].md` (Debug mode - HTML + metrics breakdowns)
- `test-output/raw-data-[timestamp].md` (Raw mode - modules + pure metrics)  
- `test-output/scan-data-[timestamp].md` (Standard mode - AI enhanced + metrics intelligence)

**💡 Pro Tip:** Gebruik debug mode om metrics formule breakdowns te zien, raw mode om pure metrics te valideren, en vergelijk basic vs business tier om de enhancement in actie te zien!

---

## 🔧 PDF Template Aanpassen (Ontwikkelaars)

### Snelle Iteratie Workflow:
1. **Eenmalig:** Genereer een echte scan (zie Methode 2, Stap 1)
2. **Open:** `src/lib/pdf/starterTemplate.ts` (of business/enterprise)
3. **Pas aan:** HTML/CSS in het template
4. **Sla op** je wijzigingen
5. **Test:** Gebruik je opgeslagen scanId in browser URL
6. **Herhaal:** Stap 3-5 zo vaak je wilt

**Voorbeeld URLs voor iteratie:**
```
# Gebruik jouw eigen scanId hier:
http://localhost:5173/api/test/pdf-generation?download=true&scanId=JOUW_SCAN_ID

# Bijvoorbeeld:
http://localhost:5173/api/test/pdf-generation?download=true&scanId=35591b2a-afcc-4293-8714-69a9939d3d26
```

---

## 🛠️ Systeem Health Check

### Voordat je begint - Test deze URLs:

#### 1. Database Connectie
**URL:** `http://localhost:5173/api/test/payment`
**Verwacht:** `{"hasApiKey": true, "testMode": "true"}`

#### 2. AI Services
**URL:** `http://localhost:5173/api/test/vertex`
**Verwacht:** `{"success": true, "message": "Vertex AI working!"}`

#### 3. Email Systeem
**URL:** `http://localhost:5173/api/test/email?action=template`
**Verwacht:** Email template HTML wordt getoond

#### 4. Enhanced Findings Check ⭐ NIEUW
**URL:** `http://localhost:5173/api/test/business-tier?mode=quick`
**Verwacht:** Response bevat `"metrics"` objecten in findings
**Probleem als:** Geen metrics velden aanwezig → Check module updates

---

## ❌ Probleemoplossing

### "Cannot use relative URL" Error
**Probleem:** Modules kunnen de URL niet laden
**Oplossing:** Gebruik volledige URLs zoals `https://example.com` (niet `example.com`)

### "fetch failed" Error
**Probleem:** Supabase database is gepauzeerd
**Oplossing:** 
1. Ga naar je Supabase dashboard
2. Activeer je project
3. Probeer opnieuw

### JSON ziet er rommelig uit
**Oplossing:** 
1. Installeer een JSON Viewer browser extensie
2. Of kopieer de response naar jsonformatter.org

### Scan loopt vast
**Check in browser console (F12):**
1. Druk F12 voor Developer Tools
2. Ga naar Console tab
3. Zoek naar rode error berichten

### Metrics Ontbreken in Response ⭐ NIEUW
**Probleem:** `metrics` veld niet aanwezig in findings
**Mogelijke oorzaken:**
1. **Starter tier gebruikt:** Metrics zijn alleen beschikbaar in Business+ tier
   - ✅ **Test:** `http://localhost:5173/api/test/business-tier?mode=full&url=https://example.com`
   - ❌ **Fout:** `http://localhost:5173/api/test?url=https://example.com`

2. **Oude module code:** Check of AIContent/AICitation modules zijn geüpdatet
   ```bash
   # Verifieer dat metrics code aanwezig is
   grep -r "metrics" src/lib/scan/modules/AIContentModule.ts
   grep -r "metrics" src/lib/scan/modules/AICitationModule.ts
   ```

3. **Cache problemen:** Restart development server
   ```bash
   # Stop server (Ctrl+C) en restart
   npm run dev
   ```

**Debug stappen:**
```bash
# Uitgebreide debugging met alle details
http://localhost:5173/api/test/raw-data?url=https://example.com&tier=business&debug=true

# Check output file voor metrics breakdowns
cat test-output/debug-data-[newest-timestamp].md
```

### Verkeerde Metrics Scores ⭐ NIEUW
**Probleem:** Conversational/authority scores kloppen niet

**Debug stappen:**
1. **Check formules:**
   - **Conversational:** `(pronouns × 10) + (questions × 5) - (corporate × 2)`
   - **Authority:** `(media × 3) + (clients × 2) + (recognition × 1)`

2. **Gebruik debug mode** om raw tellingen te zien:
   ```bash
   http://localhost:5173/api/test/raw-data?url=https://example.com&tier=business&debug=true
   ```

3. **Test met bekende content:**
   ```bash
   # Hoge conversational score (persoonlijke blog)
   http://localhost:5173/api/test/business-tier?mode=full&url=https://blog.example.com
   
   # Lage conversational score (corporate site)
   http://localhost:5173/api/test/business-tier?mode=full&url=https://corporate.example.com
   ```

4. **Verifieer benchmark classificatie:**
   - Conversational: 70+ = "boven gemiddeld", 40-69 = "gemiddeld", 0-39 = "onder gemiddeld"
   - Authority: 20+ = "sterk", 10-19 = "gemiddeld", 0-9 = "zwak"

### Metrics Debugging Workflow ⭐ NIEUW
**Voor systematische troubleshooting:**

1. **Stap 1:** Test basis functionaliteit
   ```bash
   http://localhost:5173/api/test/vertex
   # Verwacht: {"success": true}
   ```

2. **Stap 2:** Test business tier zonder metrics focus
   ```bash
   http://localhost:5173/api/test/business-tier?mode=quick
   # Verwacht: Scan completeert zonder errors
   ```

3. **Stap 3:** Test metrics specifiek
   ```bash
   http://localhost:5173/api/test/business-tier?mode=full&url=https://example.com
   # Zoek naar: "metrics" objecten in response
   ```

4. **Stap 4:** Debug raw metrics
   ```bash
   http://localhost:5173/api/test/raw-data?url=https://example.com&tier=business&raw=true
   # Check: test-output/raw-data-[timestamp].md voor pure metrics
   ```

5. **Stap 5:** Volledige debug breakdown
   ```bash
   http://localhost:5173/api/test/raw-data?url=https://example.com&tier=business&debug=true
   # Check: test-output/debug-data-[timestamp].md voor formule details
   ```

---

## 📋 Handige Test URLs

### Betrouwbare Test Websites:
- ✅ `https://example.com` (altijd beschikbaar)
- ✅ `https://google.com` (snel)
- ✅ `https://www.theguardian.com/international` (content-rijk)
- ❌ Vermijd localhost URLs
- ❌ Vermijd niet-bestaande domeinen

### MVP Metrics Testing URLs ⭐ NIEUW:
```bash
# Verschillende content types voor metrics validatie:

# Hoge Conversational Score (persoonlijke content):
http://localhost:5173/api/test/business-tier?mode=full&url=https://blog.example.com
http://localhost:5173/api/test/business-tier?mode=full&url=https://personalblog.example.com

# Lage Conversational Score (corporate content):
http://localhost:5173/api/test/business-tier?mode=full&url=https://corporate.example.com
http://localhost:5173/api/test/business-tier?mode=full&url=https://enterprise.example.com

# Hoge Authority Score (veel externe validatie):
http://localhost:5173/api/test/business-tier?mode=full&url=https://agency.com/testimonials
http://localhost:5173/api/test/business-tier?mode=full&url=https://consultancy.com/about

# Lage Authority Score (startup/weinig validatie):
http://localhost:5173/api/test/business-tier?mode=full&url=https://startup.com/about
http://localhost:5173/api/test/business-tier?mode=full&url=https://newcompany.com
```

### Quick Test Overzicht:
```
# System Check:
http://localhost:5173/api/test/vertex
http://localhost:5173/api/test/payment
http://localhost:5173/api/test/email

# MVP Quick Check (30 seconden): ⭐ NIEUW
http://localhost:5173/api/test/business-tier?mode=full&url=https://example.com

# Basic Scans (geen metrics):
http://localhost:5173/api/test?url=https://example.com

# Business Scans (met metrics): ⭐ ENHANCED
http://localhost:5173/api/test/business-tier?mode=quick
http://localhost:5173/api/test/business-tier?mode=full&url=https://example.com

# Enterprise Scans:
http://localhost:5173/api/test/enterprise-tier?mode=quick

# Raw Data Analysis (met metrics debugging): ⭐ ENHANCED
http://localhost:5173/api/test/raw-data?url=https://example.com&tier=business
http://localhost:5173/api/test/raw-data?url=https://example.com&tier=business&raw=true
http://localhost:5173/api/test/raw-data?url=https://example.com&tier=business&debug=true

# PDFs (Mock Data):
http://localhost:5173/api/test/pdf-generation?tier=starter&download=true
http://localhost:5173/api/test/pdf-generation?tier=business&download=true
http://localhost:5173/api/test/pdf-generation?tier=enterprise&download=true
```

---

## 🎯 Wat betekenen de Resultaten?

### Scan Success Indicators:
- `"success": true` = Scan gelukt
- `"overallScore": 75` = SEO score van 75%
- `"hasAIReport": true` = AI analyse beschikbaar
- `"aiCost": 0.12` = AI kosten €0.12

### Enhanced Findings Success Indicators ⭐ NIEUW:
- `"metrics": {...}` aanwezig = Enhanced findings werken correct
- `"score": 75` = Conversational/authority score succesvol berekend (0-100)
- `"benchmark": "boven gemiddeld"` = Benchmark classificatie correct toegepast
- `"details": {...}` = Gedetailleerde breakdown beschikbaar (pronouns, questions, etc.)
- `"breakdown": {...}` = Authority scoring breakdown (media, clients, recognition)

### Metrics Score Interpretatie ⭐ NIEUW:

**Conversational Metrics:**
- **Score 70-100:** "boven gemiddeld" (persoonlijke toon, veel directe aanspreking, vragen)
- **Score 40-69:** "gemiddeld" (mix van formeel en persoonlijk, enkele vragen)
- **Score 0-39:** "onder gemiddeld" (zeer corporate, formeel, weinig directe aanspreking)

**Authority Metrics:**
- **Score 20+:** "sterk" (veel media mentions, awards, client testimonials)
- **Score 10-19:** "gemiddeld" (enkele externe references, beperkte validatie)
- **Score 0-9:** "zwak" (weinig/geen externe validatie, startup-niveau)

### Tier Comparison ⭐ NIEUW:
- **Starter Tier:** Findings ZONDER metrics objecten (normale verwachting)
- **Business Tier:** Findings MET metrics objecten (enhanced functionaliteit)
- **Enterprise Tier:** Findings met metrics + uitgebreide strategische context

### PDF Success Indicators:
- Browser start download = Success
- File grootte > 100KB = Bevat content
- PDF opent correct = Valid PDF

### Error Indicators:
- `"success": false` = Er ging iets mis
- `"error": "..."` = Specifieke foutmelding
- No download = PDF generatie gefaald
- **Missing metrics in Business tier** = Module update required ⭐ NIEUW

---

## 🚀 MVP Testing Quick Start ⭐ NIEUW

> **Snelste manier om enhanced findings te valideren**

### 30-Seconden MVP Validatie:
1. **Start server:** `npm run dev`
2. **MVP Test URL:** `http://localhost:5173/api/test/business-tier?mode=full&url=https://example.com`
3. **Zoek in JSON naar:** `"metrics"` objecten
4. **✅ Success:** Metrics zichtbaar met scores en benchmarks
5. **❌ Probleem:** Geen metrics → Check troubleshooting sectie

### 2-Minuten Metrics Debugging:
1. **Raw data test:** `http://localhost:5173/api/test/raw-data?url=https://example.com&tier=business&raw=true`
2. **Check output:** `test-output/raw-data-[newest-timestamp].md`
3. **Zoek naar:** Conversational score formules en authority breakdowns
4. **Vergelijk:** Met AI-enhanced versie om transformatie te valideren

### Complete MVP Validation Checklist (10 minuten):
- [ ] System health check passes
- [ ] Business tier scan completes
- [ ] Metrics objects present in findings
- [ ] Conversational scores calculated (0-100)
- [ ] Authority scores calculated (weighted formula)
- [ ] Benchmarks correctly classified
- [ ] Starter tier lacks metrics (correct behavior)
- [ ] Debug mode shows formula breakdowns
- [ ] No console errors during scans

---

**💡 Begin met de 30-seconden MVP validatie om snel je enhanced findings te testen, gebruik daarna de uitgebreide test URLs voor verschillende content types en scores!**

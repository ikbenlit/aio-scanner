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

### 🔵 Business Scan (Met AI)
**Wat doet het:** Business tier met AI-verbeteringen en meer modules

1. **URL in browser:** `http://localhost:5173/api/test/business-tier?mode=quick`
2. **Voor volledige scan:** `http://localhost:5173/api/test/business-tier?mode=full&url=https://example.com`
3. **Wacht 1-2 minuten** (AI processing)

**Wat je ziet:**
```json
{
  "status": "success",
  "scanResult": {
    "tier": "business", 
    "hasAIReport": true,
    "hasAIInsights": true
  },
  "aiEnhancement": {
    "confidence": 0.85,
    "costTracking": {
      "aiCost": 0.12
    }
  }
}
```

### 🟡 Enterprise Scan (Volledig)
**Wat doet het:** Enterprise tier met multi-page analyse en strategische insights

1. **URL in browser:** `http://localhost:5173/api/test/enterprise-tier?mode=quick`
2. **Voor volledige scan:** `http://localhost:5173/api/test/enterprise-tier?mode=full&url=https://example.com`
3. **Wacht 2-5 minuten** (uitgebreide analyse)

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
3. **Zoek in het resultaat naar:** `"scanId": "aac92063-4e5a-4a52-ac96-5394b5c093bf"` --> "scanResult":{"scanId":"4372a55d-4196-42a1-b423-1579580ed813"
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

### 🔍 Debug Mode - Allerruuwste Data
**Wat krijg je:** Complete HTML code, HTTP headers, DOM structuur
1. **URL:** `http://localhost:5173/api/test/raw-data?url=https://gifsvoorinsta.nl&debug=true`
2. **Resultaat:** Markdown bestand in `test-output/debug-data-[timestamp].md`
3. **Bevat:** 
   - Raw HTML string (exact wat fetch() teruggeeft)
   - HTTP response info (status, headers, server)
   - Content-Length en character encoding
   - Complete DOM tree structuur

### 📊 Raw Mode - Pure Module Output
**Wat krijg je:** Module resultaten ZONDER AI interpretatie
1. **URL:** `http://localhost:5173/api/test/raw-data?url=https://gifsvoorinsta.nl&raw=true`
2. **Resultaat:** Markdown bestand in `test-output/raw-data-[timestamp].md`
3. **Bevat:**
   - Pure JSON output van elke module
   - Exacte CSS selectors die matches vonden
   - Raw scores (bijv. 35/100)
   - Pattern matching resultaten
   - Finding objects met technicalDetails

### 🎯 Standard Mode - AI Enhanced (Default)
**Wat krijg je:** Normale scan met AI verbetering (voor vergelijking)
1. **URL:** `http://localhost:5173/api/test/raw-data?url=https://gifsvoorinsta.nl`
2. **Resultaat:** Markdown bestand in `test-output/scan-data-[timestamp].md`
3. **Bevat:**
   - AI-verbeterde analysis (alleen Business+ tiers)
   - Business recommendations
   - Implementation plans

### 🚀 Business Tier - Met AI Enhancement
**Wat krijg je:** Business tier met AI-powered insights en meer modules
1. **Raw mode:** `http://localhost:5173/api/test/raw-data?url=https://gifsvoorinsta.nl&tier=business&raw=true`
2. **AI enhanced:** `http://localhost:5173/api/test/raw-data?url=https://gifsvoorinsta.nl&tier=business`
3. **Debug mode:** `http://localhost:5173/api/test/raw-data?url=https://gifsvoorinsta.nl&tier=business&debug=true`

**Vergelijking Basic vs Business:**
- **Basic tier raw:** `"metaTags: Ontbrekend"`
- **Business tier AI:** `"Meta description optimization needed - Add compelling 150-160 character descriptions..."`

### Output Bestanden:
**Alle resultaten worden automatisch opgeslagen in:**
- `test-output/debug-data-[timestamp].md` (Debug mode - identiek voor alle tiers)
- `test-output/raw-data-[timestamp].md` (Raw mode - meer modules in Business+)  
- `test-output/scan-data-[timestamp].md` (Standard mode - AI enhanced voor Business+)

**💡 Pro Tip:** Gebruik debug mode om HTML parsing problemen te debuggen, raw mode om te zien wat modules echt detecteren, en vergelijk basic vs business tier om AI enhancement in actie te zien!

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
http://localhost:5173/api/test/pdf-generation?download=true&scanId=aac92063-4e5a-4a52-ac96-5394b5c093bf
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

---

## 📋 Handige Test URLs

### Betrouwbare Test Websites:
- ✅ `https://example.com` (altijd beschikbaar)
- ✅ `https://google.com` (snel)
- ✅ `https://www.theguardian.com/international` (content-rijk)
- ❌ Vermijd localhost URLs
- ❌ Vermijd niet-bestaande domeinen

### Quick Test Overzicht:
```
# System Check:
http://localhost:5173/api/test/vertex
http://localhost:5173/api/test/payment
http://localhost:5173/api/test/email

# Scans:
http://localhost:5173/api/test?url=https://example.com
http://localhost:5173/api/test/business-tier?mode=quick
http://localhost:5173/api/test/enterprise-tier?mode=quick

# Raw Data Analysis (Debug & Development):
http://localhost:5173/api/test/raw-data?url=https://example.com
http://localhost:5173/api/test/raw-data?url=https://example.com&raw=true
http://localhost:5173/api/test/raw-data?url=https://example.com&debug=true

# Business Tier Raw Data (met AI):
http://localhost:5173/api/test/raw-data?url=https://gifsvoorinsta.nl&tier=business
http://localhost:5173/api/test/raw-data?url=https://gifsvoorinsta.nl&tier=business&raw=true
http://localhost:5173/api/test/raw-data?url=https://gifsvoorinsta.nl&tier=business&debug=true

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

### PDF Success Indicators:
- Browser start download = Success
- File grootte > 100KB = Bevat content
- PDF opent correct = Valid PDF

### Error Indicators:
- `"success": false` = Er ging iets mis
- `"error": "..."` = Specifieke foutmelding
- No download = PDF generatie gefaald

---

**💡 Begin met de Quick Test URLs om te controleren of alles werkt, en werk je dan omhoog naar complexere scans en PDFs!**

# AIO Scanner - Raw Data Test Endpoint

Een veilige manier om de ruwe scandata te bekijken zonder de bestaande code te beïnvloeden.

## 🚀 Hoe te gebruiken

### 1. Start de development server
```bash
npm run dev
```

### 2. Open je browser en ga naar een van deze URL's:

#### Basic Scan (Gratis tier - 2 modules)
```
http://localhost:5173/api/test/raw-data?url=https://example.com&tier=basic
```

#### Starter Scan (€19.95 tier - 4 modules + AI rapport)
```
http://localhost:5173/api/test/raw-data?url=https://example.com&tier=starter
```

#### Business Scan (€49.95 tier - 6 modules + AI insights)
```
http://localhost:5173/api/test/raw-data?url=https://example.com&tier=business
```

#### Enterprise Scan (€149.95 tier - Alle features)
```
http://localhost:5173/api/test/raw-data?url=https://example.com&tier=enterprise
```

### 3. Aangepaste parameters

#### Eigen URL testen
```
http://localhost:5173/api/test/raw-data?url=https://mijneigenwebsite.nl&tier=business
```

#### Custom output bestandsnaam
```
http://localhost:5173/api/test/raw-data?url=https://example.com&tier=basic&output=mijn-test-scan.md
```

#### ALLEEN ruwe module data (zonder AI interpretatie)
```
http://localhost:5173/api/test/raw-data?url=https://example.com&tier=basic&raw=true
```

#### 🔬 DEBUG MODE - HTML/DOM/CSS data (pre-processing)
```
http://localhost:5173/api/test/raw-data?url=https://example.com&debug=true
```

#### Ruwe data van je eigen website
```
http://localhost:5173/api/test/raw-data?url=https://mijneigenwebsite.nl&tier=business&raw=true
```

#### Debug je eigen website (HTML/DOM structuur)
```
http://localhost:5173/api/test/raw-data?url=https://mijneigenwebsite.nl&debug=true
```

## 📊 Wat krijg je terug

### Browser Response
Een JSON response met:
- `success`: true/false
- `markdownContent`: De volledige markdown output
- `scanResults`: Overzicht van scores en counts
- `outputFile`: Naam van het gegenereerde bestand

### Drie Output Types

#### 🔍 Standaard Mode (default)
**Volledige analyse met AI interpretatie**
- Geformatteerde findings met uitleg
- AI-gegenereerd rapport en aanbevelingen
- Implementatie planning
- Ruwe module data als extra sectie

#### 🔬 Raw Mode (`?raw=true`)
**Puur module output zonder AI enhancement**
- ALLEEN de pure JSON output van elke module
- Geen AI interpretatie of formatting
- Scores en findings zoals modules ze origineel opleveren
- Perfect voor debugging en begrijpen wat modules doen

#### 🌐 Debug Mode (`?debug=true`) ← **NIEUW!**
**De allerruweeste data - HTML/DOM/CSS**
- Complete HTML code zoals fetch() het teruggeeft
- Plain text content via Cheerio extractie
- Alle CSS classes en IDs gevonden op de pagina
- DOM tree structuur (eerste 3 levels)
- Meta tags en JSON-LD structured data
- HTTP response informatie (status, headers)
- Pattern detection statistieken
- Precies wat modules als input krijgen

### Markdown Bestand (in test-output/ directory)
Een uitgebreid rapport met:

1. **📊 Scan Overzicht**
   - Overall score
   - Aantal modules uitgevoerd
   - Totaal aantal findings
   - Status en timing

2. **🔍 Gedetailleerde Module Resultaten**
   - Per module: naam, score, status
   - Alle findings met prioriteit en categorie
   - Technische details waar beschikbaar
   - Aanbevelingen en impact

3. **🤖 AI Analyse** (voor betaalde tiers)
   - AI-gegenereerde samenvatting
   - Implementatie plan
   - Geschatte tijdsinvestering

4. **💰 Kosten Tracking** (voor AI-tiers)
   - AI-kosten per scan
   - Performance metrics
   - Fallback usage

5. **🛠️ Raw JSON Data**
   - Complete ruwe data voor debugging
   - Alle interne datastructuren

## 📁 Output Locatie

Bestanden worden opgeslagen in:
```
/jouw-project/test-output/scan-raw-data-[timestamp].md
```

## 🔍 Voorbeeld Findings

Elke module levert findings op zoals:

```markdown
**1. FAQ Content: Ontbrekend**
*Prioriteit: high*
*Categorie: ai-content*

Website mist vraag-antwoord content die AI-assistenten kunnen citeren. 
Voeg een FAQ sectie toe met vragen zoals "Wat doet [bedrijf]?" of "Hoe werkt [service]?".

**💡 Aanbeveling:** Implementeer een FAQ sectie met 5-10 veelgestelde vragen
**📈 Impact:** Verhoogt kans op AI-citaties met 40%
```

## 🛡️ Veiligheid

- ✅ **Geen wijzigingen** aan bestaande code
- ✅ **Alleen development mode** - geen files in productie
- ✅ **Aparte test directory** - geen conflict met bestaande bestanden
- ✅ **Tijdelijke scan IDs** - geen database vervuiling
- ✅ **Test mode** - gebruikt dummy email/paymentId voor betaalde tiers (geen echte betalingen)

## 🎯 Verschillende Scan Tiers

| Tier | Modules | AI Features | Output |
|------|---------|-------------|---------|
| **Basic** | TechnicalSEO, SchemaMarkup | ❌ | Pattern analysis only |
| **Starter** | Basic + AIContent, AICitation | ✅ AI Report | Professional analysis |
| **Business** | Starter + Freshness, CrossWebFootprint | ✅ AI Insights + Narrative | Growth recommendations |
| **Enterprise** | Business + Multi-page, Benchmarks | ✅ Strategic roadmap | Complete strategy |

## 💡 Tips voor gebruik

1. **Start met Raw Mode** (`?raw=true`) om de pure module output te zien
2. **Vergelijk Raw vs Standaard** om te begrijpen hoe AI enhancement werkt
3. **Test je eigen website** met Business tier voor volledige insights
4. **Use Raw Mode voor debugging** - pure JSON zonder interpretatie
5. **Check technicalDetails** in beide modes voor verschillende levels van detail

### Workflow Suggestie:
1. **Eerste scan:** `?debug=true` om ruwe HTML/DOM data te zien
2. **Tweede scan:** `?raw=true` om pure module output te vergelijken
3. **Derde scan:** Standaard mode om AI enhancement te bekijken
4. **Eigen website:** Alle drie modes testen voor volledig inzicht

## 🔧 Test Mode Validatie

Voor betaalde tiers (starter, business, enterprise) gebruikt de test endpoint automatisch dummy waarden:
- **Email:** `test@rawdata.local`
- **PaymentId:** `test-payment-[timestamp]`

Dit omzeilt de normale betaalvalidatie zodat je de ruwe data kunt bekijken zonder echte betalingen.

## 🐛 Debugging

Als er iets misgaat:
1. Check de console logs in je terminal
2. Kijk naar de `error` field in de JSON response
3. Controleer of de URL toegankelijk is
4. Zorg dat je development server draait

## 🚀 Quick Reference

### Meest Gebruikte Commands:

**HTML/DOM/CSS debug data zien:**
```
http://localhost:5174/api/test/raw-data?url=https://example.com&debug=true
```

**Pure module data zien:**
```
http://localhost:5174/api/test/raw-data?url=https://example.com&raw=true
```

**Volledige analyse met AI:**
```
http://localhost:5174/api/test/raw-data?url=https://example.com&tier=business
```

**Je eigen site volledig debuggen:**
```
http://localhost:5174/api/test/raw-data?url=https://jouwsite.nl&debug=true
```

---

**Ready to explore?** Start met debug mode om te zien wat de scanner precies "ziet"! 
# Test API Endpoints Documentation

## 📑 Inhoudsopgave

1. [🚀 Quick Reference](#-quick-reference)
   - [Development Testing Checklist](#development-testing-checklist)
   - [Quick Test URLs](#quick-test-urls)

2. [📋 Test Endpoints Overview](#-test-endpoints-overview)
   - [System Integration Tests](#system-integration-tests)
   - [Component Tests](#component-tests)
   - [Service Tests](#service-tests)
   - [Production Tests](#production-tests)

3. [🔧 Test Execution Guide](#-test-execution-guide)
   - [Prerequisites](#prerequisites)
   - [Test Methods](#test-methods)
   - [Test Execution Flow](#test-execution-flow)

4. [🎯 Praktische Test Voorbeelden](#-praktische-test-voorbeelden)
   - [Scenario 1: System Health Check](#scenario-1-snelle-system-health-check-browser)
   - [Scenario 2: Business Tier Test](#scenario-2-business-tier-test-powershell)
   - [Scenario 3: PDF Pipeline Test](#scenario-3-pdf-pipeline-test-command-line)
   - [Scenario 4: Complete Development Workflow](#scenario-4-complete-development-workflow-mixed)
   - [Scenario 5: Snel PDF Templates Aanpassen](#scenario-5-snel-pdf-templates-aanpassen)

5. [🛠️ Test Command Troubleshooting](#️-test-command-troubleshooting)
   - [Browser Testing Issues](#browser-testing-issues)
   - [PowerShell Issues](#powershell-issues)
   - [Command Line Issues](#command-line-issues)
   - [Frontend Testing Issues](#frontend-testing-issues)

6. [📊 Expected Results Reference](#-expected-results-reference)
   - [Success Indicators](#success-indicators)
   - [Tier-Specific Results](#basic-scan-results)
   - [Error Response Format](#error-response-format)

7. [📑 Detailed Endpoint Documentation](#-detailed-endpoint-documentation)
   - [System Tests](#apitestmain-system-test)
   - [Tier Tests](#apitestbusiness-tierbusiness-tier-integration)
   - [Component Tests](#apitestcontent-extractorpattern-detection)
   - [Service Tests](#apitestemail-email-system)
   - [PDF Tests](#apitestpdf-generation-pdf-generation)
   - [Production Endpoints](#apipdfscaniidpdf-status)

8. [⚠️ Troubleshooting Guide](#️-troubleshooting-guide)
   - [Common Issues](#common-issues)
   - [Success Validation Checklist](#success-validation-checklist)

9. [📝 Best Practices](#-best-practices-voor-testing)
   - [Do's en Don'ts](#-dos)
   - [Efficient Testing Workflow](#-efficient-testing-workflow)

10. [🏭 Production Readiness](#-production-readiness)
    - [Database Migration Verification](#database-migration-verification)
    - [Fresh Production Scan Test](#fresh-production-scan-test)
    - [Complete User Journey](#complete-user-journey)

11. [📈 Performance Monitoring](#-performance-monitoring)
    - [AI Cost Tracking](#ai-cost-tracking)
    - [Scan Duration Benchmarks](#scan-duration-benchmarks)
    - [PDF Generation Performance](#pdf-generation-performance)

---

## 🚀 Quick Reference

### Development Testing Checklist
```bash
# 1. Basic System Health
GET /api/test/payment           # Database connection
GET /api/test/vertex            # AI services
GET /api/test/email?action=template  # Email system

# 2. Core Functionality  
GET /api/test?url=https://example.com                    # Basic scan
GET /api/test/business-tier?mode=quick                   # Business tier
GET /api/test/enterprise-tier?mode=quick                 # Enterprise tier
GET /api/test/llm-integration?mode=full                  # AI integration

# 3. PDF Pipeline (Aanbevolen Workflow)
# Stap 1: Genereer ECHTE data
GET /api/test/business-tier?mode=full&url=https://example.com # Noteer de scanId
# Stap 2: Download PDF met de ECHTE data
GET /api/test/pdf-generation?download=true&scanId=UW_ECHTE_SCAN_ID_HIER
```

### Quick Test URLs
```bash
# Basisformaat: http://localhost:5173/api/test/[endpoint]
# Aanbevolen URLs: https://example.com, https://google.com
# Vermijd: localhost URLs, niet-bestaande domeinen
```

---

## 📋 Test Endpoints Overview

### System Integration Tests
| Endpoint | Purpose | Quick Test |
|----------|---------|------------|
| `/api/test/` | Complete scan orchestration | `?url=https://example.com` |
| `/api/test/business-tier/` | Business tier AI integration | `?mode=quick` |
| `/api/test/enterprise-tier/` | Enterprise features validation | `?mode=quick` |
| `/api/test/llm-integration/` | AI pipeline end-to-end | `?mode=full` |

### Component Tests
| Endpoint | Purpose | Quick Test |
|----------|---------|------------|
| `/api/test/content-extractor/` | Pattern detection | No parameters |
| `/api/test/enhanced-extractor/` | Enhanced extraction | No parameters |
| `/api/test/vertex-client/` | AI client functionality | `?mode=insights` |
| `/api/test/vertex/` | Basic AI connectivity | No parameters |

### Service Tests
| Endpoint | Purpose | Quick Test |
|----------|---------|------------|
| `/api/test/email/` | Email template system | `?action=template` |
| `/api/test/payment/` | Payment integration | No parameters |
| `/api/test/pdf-generation/` | PDF generation | `?download=true&scanId=...` |
| `/api/test/pdf-flow/` | Complete PDF pipeline | `?tier=business&mock=true` |

### Production Tests
| Endpoint | Purpose | Quick Test |
|----------|---------|------------|
| `/api/pdf/[scanId]` | PDF status check | `?email=test@example.com` |
| `/api/pdf/[scanId]/download` | PDF download | `?email=test@example.com` |

---

## 🔧 Test Execution Guide

### Prerequisites
```bash
# 1. Start development server
npm run dev  # Available on http://localhost:5173

# 2. Verify Supabase active (not paused)
# 3. Use reliable test URLs (avoid localhost/non-existent domains)
```

### Test Methods

#### 🌐 Browser Testing (Aanbevolen)
**Voordeel:** Gemakkelijk, visueel, geen extra tools nodig

**Stap 1:** Open je browser (Chrome, Firefox, Edge)
**Stap 2:** Kopieer de test URL naar de adresbalk
**Stap 3:** Vervang `[endpoint]` met het gewenste test endpoint

```
# Basis formaat:
http://localhost:5173/api/test/[endpoint]

# Voorbeelden:
http://localhost:5173/api/test/business-tier?mode=quick
http://localhost:5173/api/test/vertex
http://localhost:5173/api/test/pdf-generation?tier=business&test=validate
```

**Resultaat:** JSON response wordt getoond in de browser

#### 💻 PowerShell Commands (Windows)
**Voordeel:** Scriptbaar, gemakkelijk te herhalen, output naar variabelen

**Basis commando:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5173/api/test/vertex" -Method GET
```

**Uitgebreide voorbeelden:**
```powershell
# Simple GET request
Invoke-RestMethod -Uri "http://localhost:5173/api/test/business-tier?mode=quick"

# GET request met output naar variabele
$result = Invoke-RestMethod -Uri "http://localhost:5173/api/test/vertex"
Write-Host "Success: $($result.success)"

# POST request met JSON body
$body = @{ test = "data" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5173/api/test/payment" -Method POST -Body $body -ContentType "application/json"

# Opslaan response naar bestand
Invoke-RestMethod -Uri "http://localhost:5173/api/test/business-tier" | ConvertTo-Json -Depth 10 | Out-File "test-result.json"

# Meerdere tests achter elkaar
@(
    "http://localhost:5173/api/test/vertex",
    "http://localhost:5173/api/test/payment", 
    "http://localhost:5173/api/test/business-tier?mode=quick"
) | ForEach-Object {
    Write-Host "Testing: $_"
    try {
        $result = Invoke-RestMethod -Uri $_
        Write-Host "✅ Success: $($result.success)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}
```

#### 🖥️ Command Prompt/Terminal (Alternative)
**Voordeel:** Universeel, werkt op alle platformen

**Windows Command Prompt:**
```cmd
curl "http://localhost:5173/api/test/vertex"
curl -X POST "http://localhost:5173/api/test/payment" -H "Content-Type: application/json" -d "{\"test\":\"data\"}"
```

**Linux/Mac Terminal:**
```bash
curl "http://localhost:5173/api/test/vertex"
curl -X POST "http://localhost:5173/api/test/payment" -H "Content-Type: application/json" -d '{"test":"data"}'
```

#### 🎯 Frontend Interface Testing
**Voordeel:** Test de complete user experience

**Stap 1:** Ga naar `http://localhost:5173`
**Stap 2:** Gebruik de website interface voor scans
**Stap 3:** Monitor browser console (F12) voor logs

```javascript
// Browser Console (F12 > Console tab)
// Monitor real-time logs tijdens frontend tests:
console.log("Watching for scan logs...");

// Handmatige API call vanuit browser console:
fetch('/api/test/vertex').then(r => r.json()).then(console.log);
```

### Test Execution Flow

#### 1. Basic System Health
```bash
# Test in this order:
GET /api/test/payment     # Database connection
GET /api/test/vertex      # AI services  
GET /api/test/email       # Email system
```

#### 2. Core Functionality
```bash
# Basic scan
GET /api/test?url=https://example.com

# Individual module
GET /api/test?url=https://example.com&module=TechnicalSEO

# AI integration
GET /api/test/llm-integration?mode=quick
```

#### 3. Tier-Specific Testing
```bash
# Business tier
GET /api/test/business-tier?mode=full&url=https://example.com

# Enterprise tier  
GET /api/test/enterprise-tier?mode=full&url=https://example.com
```

#### 4. PDF Pipeline Testing
```bash
# PDF generation with real data (recommended)
GET /api/test/pdf-generation?download=true&scanId=YOUR_REAL_SCAN_ID

# PDF generation with mock data
GET /api/test/pdf-generation?tier=business&download=true

# Complete PDF workflow with mock data
GET /api/test/pdf-flow?tier=business&mock=true
```

---

## 🎯 Praktische Test Voorbeelden

### Scenario 1: Snelle System Health Check (Browser)
**Doel:** Controleren of alle services draaien

```
1. Open browser en ga naar: http://localhost:5173/api/test/payment
   ✅ Verwacht: {"hasApiKey": true, "testMode": "true"}

2. Ga naar: http://localhost:5173/api/test/vertex  
   ✅ Verwacht: {"success": true, "message": "Vertex AI working!"}

3. Ga naar: http://localhost:5173/api/test/email?action=template
   ✅ Verwacht: Email template wordt getoond
```

### Scenario 2: Business Tier Test (PowerShell)
**Doel:** Test complete business tier functionaliteit

```powershell
# Stap 1: Quick validation
$quickTest = Invoke-RestMethod -Uri "http://localhost:5173/api/test/business-tier?mode=quick"
Write-Host "Quick test success: $($quickTest.status)"

# Stap 2: Full business scan
$fullTest = Invoke-RestMethod -Uri "http://localhost:5173/api/test/business-tier?mode=full&url=https://example.com"
Write-Host "Full test - AI Report: $($fullTest.scanResult.hasAIReport)"
Write-Host "AI Cost: €$($fullTest.aiEnhancement.costTracking.aiCost)"

# Stap 3: Opslaan resultaat
$fullTest | ConvertTo-Json -Depth 10 | Out-File "business-test-result.json"
Write-Host "✅ Results saved to business-test-result.json"
```

### Scenario 3: PDF Pipeline Test (Command Line)
**Doel:** Test complete PDF generatie workflow

```bash
# Windows Command Prompt:
# Genereer PDF met mock data
curl "http://localhost:5173/api/test/pdf-generation?tier=business&download=true"

# Linux/Mac Terminal:
curl "http://localhost:5173/api/test/pdf-generation?tier=business&download=true"
```

### Scenario 4: Complete Development Workflow (Mixed)
**Doel:** Volledige test van development naar production

```powershell
# 1. System health (PowerShell)
Write-Host "🔍 Testing system health..."
$services = @("payment", "vertex", "email")
foreach ($service in $services) {
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:5173/api/test/$service"
        Write-Host "✅ $service: OK" -ForegroundColor Green
    } catch {
        Write-Host "❌ $service: FAILED" -ForegroundColor Red
    }
}

# 2. Core functionality (Browser - open these URLs manually)
Write-Host "`n📊 Test these URLs in browser:"
Write-Host "http://localhost:5173/api/test?url=https://example.com"
Write-Host "http://localhost:5173/api/test/llm-integration?mode=full"

# 3. PDF workflow (PowerShell)
Write-Host "`n📄 Testing PDF workflow..."
$pdfTest = Invoke-RestMethod -Uri "http://localhost:5173/api/test/pdf-flow?tier=business&mock=true"
Write-Host "PDF Generation: $($pdfTest.pdfGeneration.status)"
Write-Host "File size: $($pdfTest.pdfGeneration.fileSizeHuman)"

# 4. Frontend test (Manual)
Write-Host "`n🖥️ Manual frontend test:"
Write-Host "1. Go to http://localhost:5173"
Write-Host "2. Test basic scan with 'example.com'"
Write-Host "3. Check browser console for logs"
```

### Scenario 5: Snel PDF Templates Aanpassen (Aanbevolen)
**Doel:** Efficiënt de PDF layout en content aanpassen zonder herhaaldelijk scans uit te voeren.

```powershell
# Stap 1: Voer eenmalig een volledige, echte scan uit om data te genereren
# (Gebruik de browser of PowerShell voor deze stap)
$result = Invoke-RestMethod -Uri "http://localhost:5173/api/test/business-tier?mode=full&url=https://www.theguardian.com/international"
$scanId = $result.scanResult.scanId
Write-Host "✅ Echte scan voltooid. Gebruik dit ID: $scanId"

# Stap 2: Open de PDF template in je code editor (bv. src/lib/pdf/narrativeGenerator.ts)

# Stap 3: Open deze URL in je BROWSER om de PDF te downloaden
# Vervang de ID met die uit Stap 1.
# http://localhost:5173/api/test/pdf-generation?download=true&scanId=$scanId

# Stap 4: Pas de HTML/CSS in narrativeGenerator.ts aan en sla op.

# Stap 5: Ververs de browser. De nieuwe PDF wordt direct gegenereerd met je wijzigingen.
# Herhaal stap 4 en 5 zo vaak als nodig. Geen nieuwe scans nodig!
```

---

## 🛠️ Test Command Troubleshooting

### Browser Testing Issues

**Probleem:** JSON wordt niet mooi weergegeven
```
Oplossing: Installeer JSON Viewer browser extensie
Of: Kopieer response naar jsonformatter.org
```

**Probleem:** CORS errors in browser console
```
Oplossing: Test endpoints werken alleen als SvelteKit dev server draait
Check: npm run dev moet actief zijn op port 5173
```

### PowerShell Issues

**Probleem:** `Invoke-RestMethod` commando niet gevonden
```
Oplossing: PowerShell versie < 3.0
Alternatief: Gebruik Invoke-WebRequest
```

**Probleem:** SSL/TLS errors
```powershell
# Tijdelijke oplossing voor localhost testing:
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
```

**Probleem:** JSON parsing errors
```powershell
# Expliciete JSON parsing:
$response = Invoke-RestMethod -Uri "http://localhost:5173/api/test/vertex"
$json = $response | ConvertTo-Json -Depth 10
Write-Host $json
```

### Command Line Issues

**Probleem:** `curl` niet gevonden in Windows
```
Oplossing 1: Gebruik PowerShell in plaats van Command Prompt
Oplossing 2: Installeer Git Bash of WSL
Oplossing 3: Download curl voor Windows
```

**Probleem:** JSON responses zijn onleesbaar
```bash
# Linux/Mac - pipe naar jq voor mooie formatting:
curl "http://localhost:5173/api/test/vertex" | jq '.'

# Windows - pipe naar PowerShell:
curl "http://localhost:5173/api/test/vertex" | powershell -Command "ConvertFrom-Json | ConvertTo-Json"
```

### Frontend Testing Issues

**Probleem:** Console logs verdwijnen snel
```
Oplossing: Browser Console (F12) > Console tab > Preserve log aanzetten
```

**Probleem:** Network errors tijdens scan
```
Oplossing: Browser Network tab (F12) > Check voor failed requests
Look for: 500 errors, timeout errors, CORS issues
```

### `/api/test/payment/` - Payment Integration

**Purpose:** Mollie payment configuration validation

**Parameters:** None for GET, any JSON for POST

**Test Variations:**
```bash
GET /api/test/payment                           # Environment check
POST /api/test/payment                          # Client instantiation
```

### `/api/test/pdf-generation/` - PDF Generation

**Purpose:** Isolated PDF generation testing per tier, using mock data or real scan data.

**Parameters:**
- `tier` (required if `scanId` not used): `starter`, `business`, `enterprise`
- `test` (optional): `generate`, `validate`, `performance`, `error-handling`. Wordt genegeerd als `download=true`.
- `download` (optional): `true` om de PDF direct te downloaden in plaats van een JSON response te krijgen.
- `scanId` (optional): Gebruik de ID van een voltooide scan om een PDF te genereren met **echte data** uit de database. Als deze parameter wordt gebruikt, wordt de `tier` parameter genegeerd en de tier uit de database gehaald.

**Test Variations:**
```bash
# Genereer PDF validatie met mock data (oude methode)
GET /api/test/pdf-generation?tier=business&test=validate

# Download een PDF met mock data
GET /api/test/pdf-generation?tier=business&download=true

# --- NIEUWE AANBEVOLEN WORKFLOW ---
# Genereer en download een PDF met ECHTE data van een specifieke scan
# Dit is ideaal voor het snel itereren op PDF template designs.
GET /api/test/pdf-generation?download=true&scanId=UW_ECHTE_SCAN_ID_HIER
```

**Expected Benchmarks:**
- **Starter:** 100-200KB, 1-3 seconds
- **Business:** 200-400KB, 2-5 seconds  
- **Enterprise:** 300-600KB, 3-7 seconds

---

## 📊 Expected Results Reference

### Success Indicators
```json
// All endpoints should return:
{
  "success": true,
  "status": "success", 
  // ... specific data
}
```

### Basic Scan Results
```json
{
  "success": true,
  "type": "full_scan",
  "result": {
    "overallScore": 75,
    "moduleCount": 4,
    "completedModules": 4,
    "moduleResults": [...]
  }
}
```

### Business Tier Results
```json
{
  "status": "success",
  "scanResult": {
    "tier": "business",
    "hasAIReport": true,
    "hasAIInsights": true,
    "hasNarrativeReport": true
  },
  "aiEnhancement": {
    "insightsGenerated": true,
    "confidence": 0.85
  }
}
```

### Enterprise Tier Results
```json
{
  "status": "success",
  "enterpriseFeatures": {
    "multiPageAnalysis": {"enabled": true},
    "competitiveContext": {"enabled": true},
    "strategicRoadmap": true
  }
}
```

### PDF Generation Results
```json
{
  "success": true,
  "tier": "business",
  "fileSize": 280000,
  "fileSizeHuman": "273.4 KB",
  "generationTime": "3200ms",
  "validation": {
    "isValidPDF": true,
    "hasContent": true
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": "Specific error message",
  "details": "Additional context",
  "fallback": "Available alternatives"
}
```

---

## 📑 Detailed Endpoint Documentation

### `/api/test/` - Main System Test

**Purpose:** Complete scan orchestration validation

**Parameters:**
- `url` (optional): Website URL (default: https://example.com)
- `module` (optional): Specific module to test

**Test Variations:**
```bash
GET /api/test                                    # Default test
GET /api/test?url=https://example.com            # Specific URL
GET /api/test?module=TechnicalSEO                # Single module
```

---

### `/api/test/business-tier/` - Business Tier Integration

**Purpose:** Phase 3.2 Business Tier with AI enhancement

**Parameters:**
- `mode` (optional): `quick` or `full` (default: full)
- `url` (optional): Test URL (default: https://gifsvoorinsta.nl)

**Test Variations:**
```bash
GET /api/test/business-tier?mode=quick           # Quick validation
GET /api/test/business-tier?mode=full&url=https://example.com  # Full scan
```

---

### `/api/test/enterprise-tier/` - Enterprise Features

**Purpose:** Phase 3.3 Enterprise Tier implementation

**Parameters:**
- `mode` (optional): `quick` or `full` (default: full)
- `url` (optional): Test URL

**Test Variations:**
```bash
GET /api/test/enterprise-tier?mode=quick         # Quick validation
GET /api/test/enterprise-tier?mode=full&url=https://example.com  # Full features
```

---

### `/api/test/content-extractor/` - Pattern Detection

**Purpose:** Phase 2.5 ContentExtractor capabilities

**Parameters:** None for GET, POST supports custom content

**Test Variations:**
```bash
GET /api/test/content-extractor                 # Predefined content test
POST /api/test/content-extractor                # Custom content (JSON body)
```

---

### `/api/test/enhanced-extractor/` - Enhanced Extraction

**Purpose:** Phase 3.1A Enhanced ContentExtractor features

**Parameters:** None

**Test Variations:**
```bash
GET /api/test/enhanced-extractor                # Full enhanced test
```

---

### `/api/test/llm-integration/` - AI Pipeline

**Purpose:** Phase 3.1 LLM Enhancement Service integration

**Parameters:**
- `mode` (optional): `quick` or `full` (default: full)

**Test Variations:**
```bash
GET /api/test/llm-integration?mode=quick        # Service instantiation
GET /api/test/llm-integration?mode=full         # Complete pipeline
```

---

### `/api/test/vertex-client/` - AI Client

**Purpose:** Phase 3.2A VertexAI Client implementation

**Parameters:**
- `mode` (optional): `full`, `insights`, or basic (default: full)

**Test Variations:**
```bash
GET /api/test/vertex-client?mode=insights       # AI insights only
GET /api/test/vertex-client?mode=full           # Full AI features
```

---

### `/api/test/vertex/` - Basic AI Connection

**Purpose:** Basic Vertex AI connectivity validation

**Parameters:** None

**Test Variations:**
```bash
GET /api/test/vertex                            # Simple connection test
```

---

### `/api/test/email/` - Email System

**Purpose:** Email template generation and delivery

**Parameters:**
- `action` (optional): `template` or `send` (default: template)
- `email` (required for send): Recipient email

**Test Variations:**
```bash
GET /api/test/email                             # Template generation
GET /api/test/email?action=send&email=test@example.com  # Send test email
```

---

### `/api/test/email/preview/` - Email Preview

**Purpose:** Visual email template and PDF preview

**Parameters:**
- `format` (optional): `html` or `pdf` (default: html)
- `email` (optional): Email for template

**Test Variations:**
```bash
GET /api/test/email/preview                     # HTML preview
GET /api/test/email/preview?format=pdf          # PDF download
```

---

### `/api/test/payment/` - Payment Integration

**Purpose:** Mollie payment configuration validation

**Parameters:** None for GET, any JSON for POST

**Test Variations:**
```bash
GET /api/test/payment                           # Environment check
POST /api/test/payment                          # Client instantiation
```

---

### `/api/test/pdf-generation/` - PDF Generation

**Purpose:** Isolated PDF generation testing per tier, using mock data or real scan data.

**Parameters:**
- `tier` (required if `scanId` not used): `starter`, `business`, `enterprise`
- `test` (optional): `generate`, `validate`, `performance`, `error-handling`. Wordt genegeerd als `download=true`.
- `download` (optional): `true` om de PDF direct te downloaden in plaats van een JSON response te krijgen.
- `scanId` (optional): Gebruik de ID van een voltooide scan om een PDF te genereren met **echte data** uit de database. Als deze parameter wordt gebruikt, wordt de `tier` parameter genegeerd en de tier uit de database gehaald.

**Test Variations:**
```bash
# Genereer PDF validatie met mock data (oude methode)
GET /api/test/pdf-generation?tier=business&test=validate

# Download een PDF met mock data
GET /api/test/pdf-generation?tier=business&download=true

# --- NIEUWE AANBEVOLEN WORKFLOW ---
# Genereer en download een PDF met ECHTE data van een specifieke scan
# Dit is ideaal voor het snel itereren op PDF template designs.
GET /api/test/pdf-generation?download=true&scanId=UW_ECHTE_SCAN_ID_HIER
```

**Expected Benchmarks:**
- **Starter:** 100-200KB, 1-3 seconds
- **Business:** 200-400KB, 2-5 seconds  
- **Enterprise:** 300-600KB, 3-7 seconds

---

### `/api/test/pdf-flow/` - Complete PDF Pipeline

**Purpose:** End-to-end PDF workflow testing

**Parameters:**
- `tier` (required): `starter`, `business`, `enterprise`
- `url` (optional): Website URL (default: https://example.com)
- `mock` (optional): `true` for mock data, `false` for real scan

**Test Variations:**
```bash
GET /api/test/pdf-flow?tier=business&mock=true              # Fast, reliable
GET /api/test/pdf-flow?tier=business&url=https://example.com # Real URL
GET /api/test/pdf-flow?tier=enterprise&mock=true            # Enterprise features
```

---

### `/api/pdf/[scanId]` - PDF Status

**Purpose:** Check PDF generation status and metadata

**Parameters:**
- `scanId` (required): UUID in URL path
- `email` (required): Email for access verification

**Test Variations:**
```bash
GET /api/pdf/12345-abcde-67890?email=test@example.com       # Status check
```

---

### `/api/pdf/[scanId]/download` - PDF Download

**Purpose:** Download generated PDF with authentication

**Parameters:**
- `scanId` (required): UUID in URL path  
- `email` (required): Email for access verification

**Test Variations:**
```bash
GET /api/pdf/12345-abcde-67890/download?email=test@example.com  # Direct download
```

---

## ⚠️ Troubleshooting Guide

### Common Issues

#### "Cannot use relative URL" errors
**Status:** ✅ **Resolved** - URL normalization implemented
**Check:** Look for `"URL normalized: [url] -> https://[url]"` in console

#### "fetch failed" errors  
**Cause:** Supabase project paused
**Solution:** Activate Supabase project via dashboard

#### Module errors in scan results
**Cause:** Modules cannot fetch URL
**Solution:** Use reliable test URLs (example.com)

#### AI enhancement fails
**Expected:** Graceful fallback to pattern-based analysis
**Check:** `costTracking.aiCost` and `error` fields in response

#### PDF generation fails
**Cause:** URL normalization issues in templates
**Check:** Console logs for "Invalid URL" errors

### Success Validation Checklist

#### ✅ Basic System Health
- [ ] Development server on port 5173
- [ ] Supabase database connection working
- [ ] Environment variables loaded correctly
- [ ] AI services (Vertex) reachable

#### ✅ URL Normalization Working
- [ ] `example.com` becomes `https://example.com`
- [ ] No "relative URL" errors in modules
- [ ] Console shows "URL normalized" messages

#### ✅ Tier Functionality
- [ ] Basic: TechnicalSEO + SchemaMarkup modules working
- [ ] Business: AI enhancement + LLM integration
- [ ] Enterprise: Multi-page + competitive analysis

#### ✅ Database Integration
- [ ] Scan records created successfully
- [ ] Results saved correctly
- [ ] User history maintained

#### ✅ Frontend Integration
- [ ] Landing page scans work
- [ ] Results page shows correct data
- [ ] Error handling works properly

---

## 🏭 Production Readiness

### Database Migration Verification
```sql
-- Check PDF columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'scans' AND column_name LIKE 'pdf_%';

-- Verify constraint allows new statuses
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'scans_pdf_generation_status_check';
```

### Fresh Production Scan Test
```bash
# 1. Create fresh scan via API
POST /api/scan/business
{"url": "https://example.com", "email": "test@example.com"}

# 2. Monitor PDF status progression
# Expected: "pending" → "generating" → "completed"

# 3. Verify PDF download
GET /api/pdf/[scanId]?email=test@example.com
```

### Complete User Journey
1. Go to `http://localhost:5173`
2. Select "Business Scan" tier
3. Enter test URL and email
4. Complete payment flow (test mode)
5. Monitor scan progress
6. Verify PDF download when ready

---

## 📈 Performance Monitoring

### AI Cost Tracking
- Monitor costs in VertexAI client tests
- Business tier: Stay under €0.15 per scan
- Enterprise tier: Stay under €0.25 per scan

### Scan Duration Benchmarks
- Basic scan: < 30 seconds
- Business scan: < 2 minutes  
- Enterprise scan: < 5 minutes

### PDF Generation Performance
- Starter: 1-3 seconds, 100-200KB
- Business: 2-5 seconds, 200-400KB
- Enterprise: 3-7 seconds, 300-600KB
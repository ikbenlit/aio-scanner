# Test API Endpoints Documentation

This document provides comprehensive documentation for all test endpoints in the AIO Scanner system. These endpoints are designed to validate functionality across different development phases and system components.

## Overview

The test endpoints are organized under `/api/test/` and serve different purposes:
- System integration testing
- Component validation
- Phase-specific feature testing
- Development debugging
- Production readiness verification

## Test Endpoints Reference

### 1. Main Test Endpoint - `/api/test/`

**Purpose:** Comprehensive scan orchestration testing and module validation

**How it works:**
- Tests the complete ScanOrchestrator system
- Can run full scans or test individual modules 
- Validates module availability and execution
- Provides detailed performance metrics

**How to execute:**
```bash
# Full scan test
GET /api/test?url=https://example.com

# Individual module test
GET /api/test?url=https://example.com&module=TechnicalSEO

# Test with default URL
GET /api/test

# POST test for JSON handling
POST /api/test
Content-Type: application/json
{"test": "data"}
```

**Parameters:**
- `url` (optional): Website URL to scan (default: https://example.com)
- `module` (optional): Specific module to test (TechnicalSEO, SchemaMarkup, etc.)

**Expected result:**
```json
{
  "success": true,
  "type": "full_scan" | "module_test",
  "url": "https://example.com",
  "duration": 2500,
  "result": {
    "overallScore": 75,
    "moduleCount": 4,
    "completedModules": 4,
    "totalFindings": 12,
    "totalRecommendations": 8,
    "moduleResults": [...]
  }
}
```

**Success/Failure indicators:**
- ✅ Success: `success: true`, modules execute without errors
- ❌ Failure: `success: false`, error details in response

---

### 2. Business Tier Test - `/api/test/business-tier/`

**Purpose:** Validates Phase 3.2 Business Tier integration with AI enhancement services

**How it works:**
- Tests ScanOrchestrator business tier execution
- Validates AI-enhanced report generation
- Tests cost tracking and fallback mechanisms
- Validates integration with LLMEnhancementService

**How to execute:**
```bash
# Quick validation test
GET /api/test/business-tier?mode=quick

# Full business tier scan
GET /api/test/business-tier?mode=full&url=https://gifsvoorinsta.nl

# Default test
GET /api/test/business-tier
```

**Parameters:**
- `mode` (optional): `quick` for instantiation test, `full` for complete scan (default: full)
- `url` (optional): Test URL (default: https://gifsvoorinsta.nl)

**Expected result:**
```json
{
  "status": "success",
  "phase": "3.2 Business Tier Integration Test",
  "scanResult": {
    "scanId": "test-business-1234567890",
    "tier": "business",
    "overallScore": 75,
    "hasAIReport": true,
    "hasAIInsights": true,
    "hasNarrativeReport": true
  },
  "aiEnhancement": {
    "insightsGenerated": true,
    "missedOpportunities": 3,
    "confidence": 0.85
  },
  "implementation": {
    "status": "COMPLETED",
    "readyForNextStep": "Phase 3.3 - Narrative PDF Enhancement"
  }
}
```

**Success/Failure indicators:**
- ✅ Success: `status: "success"`, AI enhancements working
- ❌ Failure: `status: "error"`, fallback to starter tier

---

### 3. Content Extractor Test - `/api/test/content-extractor/`

**Purpose:** Tests Phase 2.5 ContentExtractor pattern detection capabilities

**How it works:**
- Tests complex Dutch business content extraction
- Validates specific pattern detection (time signals, quality claims, authority markers)
- Verifies critical detection patterns from development plan
- Tests conversational content detection (FAQ patterns)

**How to execute:**
```bash
# Full extraction test with predefined content
GET /api/test/content-extractor

# Test specific pattern type
POST /api/test/content-extractor
Content-Type: application/json
{
  "text": "Wij zijn al 25 jaar actief...",
  "patternType": "time"
}
```

**Parameters (POST):**
- `text` (required): Text content to analyze
- `patternType` (required): `all`, `time`, `quality`, `authority`, `business`

**Expected result:**
```json
{
  "status": "success",
  "contentExtractorVersion": "2.5.1",
  "samples": {
    "timeSignals": {
      "count": 2,
      "detectedEenEeuwLang": true,
      "detectedSinds1924": true
    },
    "qualityClaims": {
      "count": 3,
      "detectedHeelErgGoed": true,
      "detected98Percent": true
    },
    "authorityMarkers": {
      "count": 2,
      "detectedSpecialist": true
    }
  },
  "criticalDetectionResults": {
    "eenEeuwLang": true,
    "sinds1924": true,
    "heelErgGoed": true,
    "percentage98": true
  },
  "readyForAiEnhancement": true
}
```

**Success/Failure indicators:**
- ✅ Success: All critical patterns detected, `readyForAiEnhancement: true`
- ❌ Failure: Missing critical patterns, extraction errors

---

### 4. Email Test - `/api/test/email/`

**Purpose:** Tests email template generation and delivery system

**How it works:**
- Tests email template generation with mock scan data
- Can generate and send actual emails for testing
- Tests integration with Resend email service
- Validates PDF report attachment functionality

**How to execute:**
```bash
# Generate email template (default)
GET /api/test/email

# Send test email with PDF report
GET /api/test/email?action=send&email=test@example.com

# Template generation only
GET /api/test/email?action=template
```

**Parameters:**
- `action` (optional): `template` (default) or `send`
- `email` (required for send): Recipient email address

**Expected result:**
```json
{
  "success": true,
  "action": "send",
  "message": "✅ Email met PDF rapport succesvol verstuurd!",
  "details": {
    "messageId": "msg_123...",
    "pdfGenerated": true,
    "emailSent": true
  },
  "testData": {
    "scanId": "test-123",
    "recipientEmail": "test@example.com",
    "score": 75
  }
}
```

**Success/Failure indicators:**
- ✅ Success: `success: true`, `emailSent: true`, messageId present
- ❌ Failure: `success: false`, error details provided

---

### 5. Email Preview Test - `/api/test/email/preview/`

**Purpose:** Visual preview of email templates and PDF generation

**How it works:**
- Generates HTML email template for visual inspection
- Can generate PDF version of email for download
- Uses mock scan data for consistent testing
- Returns actual HTML/PDF content, not JSON

**How to execute:**
```bash
# HTML email preview (default)
GET /api/test/email/preview

# PDF email report download
GET /api/test/email/preview?format=pdf

# Specify different email
GET /api/test/email/preview?email=custom@example.com
```

**Parameters:**
- `format` (optional): `html` (default) or `pdf`
- `email` (optional): Email address for template (default: test@example.com)

**Expected result:**
- HTML format: Returns rendered HTML email template
- PDF format: Returns PDF file download with proper headers

**Success/Failure indicators:**
- ✅ Success: HTML renders properly or PDF downloads
- ❌ Failure: HTTP 500 error with error message

---

### 6. Enhanced Extractor Test - `/api/test/enhanced-extractor/`

**Purpose:** Tests Phase 3.1A Enhanced ContentExtractor features

**How it works:**
- Tests enhanced content extraction capabilities
- Validates content quality assessment features
- Tests missed opportunity detection
- Tests AI optimization hints generation
- Validates backward compatibility with basic extractor

**How to execute:**
```bash
# Full enhanced extraction test
GET /api/test/enhanced-extractor
```

**Parameters:** None

**Expected result:**
```json
{
  "status": "success",
  "phase": "3.1A Enhanced Content Extraction",
  "basicSamples": {
    "timeSignals": 2,
    "qualityClaims": 3,
    "authorityMarkers": 2,
    "questionPatterns": 4
  },
  "enhancedFeatures": {
    "contentQuality": {
      "overallScore": 0.75,
      "temporalClaims": 2,
      "vagueStatements": 3,
      "unsupportedClaims": 1
    },
    "missedOpportunities": 4,
    "aiOptimizationHints": 6
  },
  "backwardCompatibility": {
    "status": "PASSED"
  },
  "implementation": {
    "phase": "3.1A",
    "status": "COMPLETED",
    "readyForIntegration": true
  }
}
```

**Success/Failure indicators:**
- ✅ Success: Enhanced features working, backward compatibility passed
- ❌ Failure: `status: "error"`, implementation status failed

---

### 7. Enterprise Tier Test - `/api/test/enterprise-tier/`

**Purpose:** Validates Phase 3.3 Enterprise Tier implementation

**How it works:**
- Tests enterprise-level scanning capabilities
- Validates multi-page content analysis
- Tests competitive context analysis
- Tests enhanced strategic narrative generation
- Validates enterprise AI report features

**How to execute:**
```bash
# Quick enterprise validation
GET /api/test/enterprise-tier?mode=quick

# Full enterprise tier scan
GET /api/test/enterprise-tier?mode=full&url=https://example.com

# Default test
GET /api/test/enterprise-tier
```

**Parameters:**
- `mode` (optional): `quick` or `full` (default: full)
- `url` (optional): Test URL (default: https://gifsvoorinsta.nl)

**Expected result:**
```json
{
  "status": "success",
  "phase": "3.3 Enterprise Tier Implementation Test",
  "scanResult": {
    "tier": "enterprise",
    "hasEnterpriseFeatures": true,
    "overallScore": 85
  },
  "enterpriseFeatures": {
    "multiPageAnalysis": {
      "enabled": true,
      "pagesAnalyzed": 5,
      "totalPages": 12
    },
    "competitiveContext": {
      "enabled": true,
      "industryCategory": "consultancy",
      "competitivePosition": "established"
    }
  }
}
```

**Success/Failure indicators:**
- ✅ Success: Enterprise features enabled and working
- ❌ Failure: `status: "error"`, enterprise features not available

---

### 8. LLM Integration Test - `/api/test/llm-integration/`

**Purpose:** Tests Phase 3.1 LLM Enhancement Service integration

**How it works:**
- Tests ContentExtractor → LLMEnhancementService → VertexAI pipeline
- Validates AI service instantiation and integration
- Tests enhanced content processing with AI
- Validates fallback mechanisms when AI fails

**How to execute:**
```bash
# Quick service instantiation test
GET /api/test/llm-integration?mode=quick

# Full LLM integration pipeline test
GET /api/test/llm-integration?mode=full

# Default test
GET /api/test/llm-integration
```

**Parameters:**
- `mode` (optional): `quick` or `full` (default: full)

**Expected result:**
```json
{
  "status": "success",
  "phase": "3.1 LLM Integration Test",
  "pipeline": [
    "✅ ContentExtractor - Enhanced pattern detection working",
    "✅ LLMEnhancementService - AI integration active",
    "✅ VertexAI Client - AI insights generation working",
    "✅ Fallback mechanism - Pattern-based analysis ready"
  ],
  "implementation": {
    "phase": "3.1",
    "status": "COMPLETED",
    "features": [
      "Enhanced ContentExtractor output connected to VertexAI",
      "LLMEnhancementService with real AI processing",
      "Cost monitoring and budget controls",
      "Graceful fallback to pattern-based analysis"
    ],
    "readyForNextStep": "Phase 3.2 - Business Tier Integration"
  }
}
```

**Success/Failure indicators:**
- ✅ Success: All pipeline components working, AI integration active
- ❌ Failure: Pipeline components failing, fallback should activate

---

### 9. Payment Test - `/api/test/payment/`

**Purpose:** Tests Mollie payment integration and environment configuration

**How it works:**
- Tests Mollie API client instantiation
- Validates environment variables and API keys
- Tests import functionality for payment processing
- Provides configuration diagnostics

**How to execute:**
```bash
# Environment and configuration test
GET /api/test/payment

# Payment client instantiation test
POST /api/test/payment
Content-Type: application/json
{"test": "payment"}
```

**Parameters (POST):**
- Any JSON body for testing client instantiation

**Expected result:**
```json
{
  "message": "Test endpoint working!",
  "env": {
    "hasApiKey": true,
    "testMode": "true",
    "apiKeyPrefix": "test_dHa..."
  }
}
```

**Success/Failure indicators:**
- ✅ Success: API key present, Mollie client instantiates successfully
- ❌ Failure: Missing API key, import failures

---

### 10. Vertex Client Test - `/api/test/vertex-client/`

**Purpose:** Tests Phase 3.2A VertexAI Client implementation

**How it works:**
- Tests VertexAI client with production configuration
- Validates AI insights generation with structured prompts
- Tests narrative report generation capabilities
- Tests cost monitoring and budget controls
- Validates response parsing and error handling

**How to execute:**
```bash
# Full VertexAI client test with insights and narrative
GET /api/test/vertex-client?mode=full

# Test only AI insights generation
GET /api/test/vertex-client?mode=insights

# Basic client test
GET /api/test/vertex-client
```

**Parameters:**
- `mode` (optional): `full`, `insights`, or basic (default: full)

**Expected result:**
```json
{
  "status": "success",
  "phase": "3.2A VertexAI Client Test",
  "enhancedContentSummary": {
    "timeSignals": 2,
    "qualityClaims": 3,
    "contentQualityScore": 0.75,
    "missedOpportunities": 4
  },
  "aiInsights": {
    "status": "success",
    "missedOpportunities": 3,
    "authorityEnhancements": 2,
    "confidence": 0.85
  },
  "narrativeReport": {
    "status": "success",
    "wordCount": 1250,
    "sectionsPresent": {
      "executiveSummary": true,
      "detailedAnalysis": true,
      "implementationRoadmap": true,
      "conclusionNextSteps": true
    }
  },
  "costTracking": {
    "currentCost": 0.15,
    "remainingBudget": 4.85
  },
  "implementation": {
    "phase": "3.2A",
    "status": "COMPLETED",
    "readyForIntegration": true
  }
}
```

**Success/Failure indicators:**
- ✅ Success: AI insights and narrative generation working, cost tracking active
- ❌ Failure: AI services failing, budget exceeded, authentication issues

---

### 11. Vertex Connection Test - `/api/test/vertex/`

**Purpose:** Basic Vertex AI connection and authentication testing

**How it works:**
- Tests fundamental Vertex AI connectivity
- Validates Google Cloud authentication
- Tests basic API communication
- Simple pass/fail validation

**How to execute:**
```bash
# Simple connection test
GET /api/test/vertex
```

**Parameters:** None

**Expected result:**
```json
{
  "success": true,
  "message": "Vertex AI working!"
}
```

**Success/Failure indicators:**
- ✅ Success: `success: true`, connection established
- ❌ Failure: `success: false`, authentication or connection errors

---

## Testing Strategy Overview

### Development Phases
The test endpoints are organized around development phases:

1. **Phase 2.5**: Content extraction and pattern detection
2. **Phase 3.1**: LLM integration and enhanced extraction 
3. **Phase 3.2**: Business tier with AI enhancement
3. **Phase 3.3**: Enterprise tier implementation

### Test Categories

**System Integration Tests:**
- `/api/test/` - Complete system validation
- `/api/test/business-tier/` - Business tier integration
- `/api/test/enterprise-tier/` - Enterprise tier validation

**Component Tests:**
- `/api/test/content-extractor/` - Pattern detection
- `/api/test/enhanced-extractor/` - Enhanced extraction
- `/api/test/vertex-client/` - AI client functionality

**Service Tests:**
- `/api/test/email/` - Email delivery system
- `/api/test/payment/` - Payment integration
- `/api/test/vertex/` - Basic AI connectivity

**Pipeline Tests:**
- `/api/test/llm-integration/` - End-to-end AI pipeline

### Common Testing Patterns

**Quick vs Full Tests:**
Many endpoints support `mode=quick` for basic validation and `mode=full` for comprehensive testing.

**Error Handling:**
All endpoints include structured error responses with:
- Error type classification
- Fallback mechanism status
- Implementation phase tracking

**Performance Tracking:**
Tests include duration measurements and cost tracking where applicable.

**Backward Compatibility:**
Enhanced features are tested for compatibility with existing implementations.

## Usage Guidelines

### Development Testing
1. Start with basic connectivity tests (`/api/test/vertex/`)
2. Test individual components (`/api/test/content-extractor/`)
3. Validate integrations (`/api/test/llm-integration/`)
4. Test complete tiers (`/api/test/business-tier/`)

### Production Readiness
1. Run full system tests (`/api/test/?url=production-site`)
2. Validate email delivery (`/api/test/email/?action=send`)
3. Test payment integration (`/api/test/payment/`)
4. Verify AI services (`/api/test/vertex-client/?mode=full`)

### Debugging Issues
1. Check environment configuration (`/api/test/payment/`)
2. Test individual modules (`/api/test/?module=TechnicalSEO`)
3. Validate AI connectivity (`/api/test/vertex/`)
4. Test fallback mechanisms (`/api/test/llm-integration/`)

### Performance Monitoring
- Monitor AI costs with VertexAI client tests
- Track scan duration across different tiers
- Validate fallback activation under load

## Security Considerations

- Test endpoints should not be exposed in production
- API keys and sensitive data are masked in responses
- Mock data is used for all testing scenarios
- No real payments are processed in test mode

## Troubleshooting Common Issues

**Authentication Errors:**
- Check `GOOGLE_APPLICATION_CREDENTIALS` environment variable
- Verify service account permissions
- Test with `/api/test/vertex/`

**AI Service Failures:**
- Budget exceeded: Check cost tracking in responses
- Service unavailable: Fallback mechanisms should activate
- Invalid responses: Check prompt formatting

**Email Delivery Issues:**
- Verify Resend API key configuration
- Check email template generation first
- Test with `/api/test/email/?action=template`

**Payment Integration:**
- Verify Mollie API key and test mode settings
- Check environment variable configuration
- Test with `/api/test/payment/`
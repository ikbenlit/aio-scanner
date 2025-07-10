import { json } from '@sveltejs/kit';
import { ScanOrchestrator } from '$lib/scan/ScanOrchestrator.js';
import type { RequestHandler } from '@sveltejs/kit';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as cheerio from 'cheerio';
import { normalizeUrl } from '$lib/utils.js';

export const GET: RequestHandler = async ({ url }) => {
  const testUrl = url.searchParams.get('url') || 'https://example.com';
  const tier = url.searchParams.get('tier') || 'basic';
  const rawOnly = url.searchParams.get('raw') === 'true'; // Nieuwe parameter voor alleen ruwe data
  const debugMode = url.searchParams.get('debug') === 'true'; // Nieuwe parameter voor HTML/DOM debug info
  const outputFile = url.searchParams.get('output') || `${debugMode ? 'debug' : rawOnly ? 'raw' : 'scan'}-data-${Date.now()}.md`;
  
  console.log(`🔍 Generating ${debugMode ? 'debug' : rawOnly ? 'raw-only' : 'full'} data report for: ${testUrl} (${tier} tier)`);
  console.log(`📁 Output file will be: ${outputFile}`);
  console.log(`🔧 Debug mode: ${debugMode}, Raw mode: ${rawOnly}`);
  
  try {
    const orchestrator = new ScanOrchestrator();
    
    // Voer scan uit op basis van tier
    const scanId = `raw-data-test-${Date.now()}`;
    
    // Voor test doeleinden: gebruik dummy email/paymentId voor betaalde tiers
    const testEmail = tier !== 'basic' ? 'test@rawdata.local' : undefined;
    const testPaymentId = tier !== 'basic' ? `test-payment-${Date.now()}` : undefined;
    
    const result = await orchestrator.executeTierScan(
      testUrl, 
      tier as any, 
      scanId,
      testEmail,
      testPaymentId
    );
    
    // Genereer markdown rapport
    let markdownContent: string;
    if (debugMode) {
      markdownContent = await generateDebugReport(testUrl, tier);
    } else if (rawOnly) {
      markdownContent = generateRawModuleReport(result, testUrl, tier);
    } else {
      markdownContent = generateMarkdownReport(result, testUrl, tier);
    }
    
    // Schrijf naar bestand (alleen in development)
    if (process.env.NODE_ENV === 'development') {
      const outputPath = join(process.cwd(), 'test-output', outputFile);
      
      // Zorg dat directory bestaat
      try {
        mkdirSync(join(process.cwd(), 'test-output'), { recursive: true });
      } catch (e) {
        // Directory bestaat al
      }
      
      writeFileSync(outputPath, markdownContent, 'utf8');
      console.log(`📄 Raw data report saved to: ${outputPath}`);
    }
    
    return json({
      success: true,
      message: `Raw data report gegenereerd voor ${testUrl}`,
      tier,
      outputFile,
      scanResults: {
        overallScore: result.overallScore,
        moduleCount: result.moduleResults.length,
        totalFindings: result.moduleResults.reduce((sum, m) => sum + m.findings.length, 0),
      },
      markdownContent, // Voor direct bekijken in browser
      downloadUrl: process.env.NODE_ENV === 'development' 
        ? `/test-output/${outputFile}` 
        : undefined
    });
    
  } catch (error) {
    console.error('❌ Raw data generation failed:', error);
    
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};

function generateMarkdownReport(result: any, testUrl: string, tier: string): string {
  const timestamp = new Date().toISOString();
  
  let markdown = `# AIO Scanner - Ruwe Data Analyse

**URL:** ${testUrl}  
**Tier:** ${tier}  
**Gegenereerd:** ${timestamp}  
**Overall Score:** ${result.overallScore}/100  

---

## 📊 Scan Overzicht

- **Aantal modules uitgevoerd:** ${result.moduleResults.length}
- **Totaal aantal findings:** ${result.moduleResults.reduce((sum: number, m: any) => sum + m.findings.length, 0)}
- **Status:** ${result.status}
- **Scan ID:** ${result.scanId}

---

## 🔍 Module Details

`;

  // Voeg elke module toe
  result.moduleResults.forEach((module: any, index: number) => {
    markdown += `### ${index + 1}. ${module.name}

**Score:** ${module.score}/100  
**Status:** ${module.status || 'completed'}  
**Aantal findings:** ${module.findings.length}

#### Findings:

`;

    if (module.findings.length === 0) {
      markdown += '*Geen findings gevonden voor deze module.*\n\n';
    } else {
      module.findings.forEach((finding: any, findingIndex: number) => {
        markdown += `**${findingIndex + 1}. ${finding.title}**  
*Prioriteit: ${finding.priority}*  
*Categorie: ${finding.category || 'algemeen'}*

${finding.description}

`;
        
        if (finding.recommendation) {
          markdown += `**💡 Aanbeveling:** ${finding.recommendation}\n\n`;
        }
        
        if (finding.technicalDetails) {
          markdown += `**🔧 Technische Details:**
\`\`\`json
${finding.technicalDetails}
\`\`\`

`;
        }
        
        if (finding.impact) {
          markdown += `**📈 Impact:** ${finding.impact}\n\n`;
        }
        
        markdown += '---\n\n';
      });
    }
  });

  // Voeg AI rapport toe als beschikbaar
  if (result.aiReport) {
    markdown += `## 🤖 AI Analyse Rapport

### Samenvatting
${result.aiReport.summary}

### Aanbevelingen
`;
    
    if (result.aiReport.recommendations && result.aiReport.recommendations.length > 0) {
      result.aiReport.recommendations.forEach((rec: any, index: number) => {
        markdown += `${index + 1}. **${rec.title}** - ${rec.description}\n`;
      });
    }
    
    if (result.aiReport.implementationPlan) {
      markdown += `
### Implementatie Plan
**Geschatte tijd:** ${result.aiReport.implementationPlan.estimatedTime}

**Stappen:**
`;
      result.aiReport.implementationPlan.steps.forEach((step: string, index: number) => {
        markdown += `${index + 1}. ${step}\n`;
      });
    }
  }

  // Voeg kostentracering toe als beschikbaar
  if (result.costTracking) {
    markdown += `
## 💰 Kosten Tracking

- **AI Kosten:** €${result.costTracking.aiCost}
- **Scan Duur:** ${result.costTracking.scanDuration}ms
- **Fallback gebruikt:** ${result.costTracking.fallbackUsed ? 'Ja' : 'Nee'}
`;
  }

  // Voeg ruwe module data toe (voor AI enhancement)
  markdown += `
## 🔬 Ruwe Module Data (Pre-AI Processing)

**Dit is de pure output van elke module VOORDAT AI interpretatie**

`;

  result.moduleResults.forEach((module: any, index: number) => {
    markdown += `### Module ${index + 1}: ${module.name}

\`\`\`json
${JSON.stringify(module, null, 2)}
\`\`\`

`;
  });

  // Voeg raw JSON toe voor debugging
  markdown += `
## 🛠️ Complete Raw JSON Data (voor debugging)

**Dit is de volledige output NA AI processing**

\`\`\`json
${JSON.stringify(result, null, 2)}
\`\`\`

---

*Gegenereerd door AIO Scanner Test Suite - ${timestamp}*
`;

  return markdown;
}

async function generateDebugReport(testUrl: string, tier: string): Promise<string> {
  const timestamp = new Date().toISOString();
  
  try {
    // Fetch raw HTML - exact zoals modules het doen
    const normalizedUrl = normalizeUrl(testUrl);
    const response = await fetch(normalizedUrl);
    const rawHtml = await response.text();
    
    // Parse met Cheerio - exact zoals modules het doen
    const $ = cheerio.load(rawHtml);
    const plainText = $.text();
    
    let markdown = `# AIO Scanner - Debug Mode (Pre-Processing Data)

**URL:** ${testUrl}  
**Tier:** ${tier}  
**Gegenereerd:** ${timestamp}  
**Type:** Raw HTML + DOM Debug Data

---

## 🌐 HTTP Response Info

- **Status:** ${response.status} ${response.statusText}
- **Content-Type:** ${response.headers.get('content-type')}
- **Content-Length:** ${rawHtml.length} characters
- **Server:** ${response.headers.get('server') || 'Unknown'}

---

## 📄 Raw HTML Code

**Dit is EXACT wat fetch() teruggeeft:**

\`\`\`html
${rawHtml}
\`\`\`

---

## 📝 Plain Text Content

**Dit is wat $.text() extraheert:**

\`\`\`text
${plainText}
\`\`\`

---

## 🏗️ DOM Structure Overview

**Gegenereerd via Cheerio parsing:**

`;

    // Analyze DOM structure
    const elementsFound = {
      headings: $('h1, h2, h3, h4, h5, h6').length,
      paragraphs: $('p').length,
      links: $('a').length,
      images: $('img').length,
      forms: $('form').length,
      scripts: $('script').length,
      metaTags: $('meta').length
    };

    markdown += `### Element Counts:
| Element Type | Count |
|--------------|-------|
| Headings (h1-h6) | ${elementsFound.headings} |
| Paragraphs | ${elementsFound.paragraphs} |
| Links | ${elementsFound.links} |
| Images | ${elementsFound.images} |
| Forms | ${elementsFound.forms} |
| Scripts | ${elementsFound.scripts} |
| Meta Tags | ${elementsFound.metaTags} |

### DOM Tree Structure:
\`\`\`
${generateDOMTree($)}
\`\`\`

---

## 🎯 CSS Selectors Found

**Alle classes en IDs die modules kunnen detecteren:**

### CSS Classes:
`;

    // Extract all CSS classes
    const allClasses = new Set<string>();
    $('[class]').each((_, element) => {
      const classes = $(element).attr('class')?.split(/\s+/) || [];
      classes.forEach(cls => cls && allClasses.add(cls));
    });

    if (allClasses.size > 0) {
      Array.from(allClasses).slice(0, 20).forEach(cls => {
        markdown += `- \`.${cls}\`\n`;
      });
      if (allClasses.size > 20) {
        markdown += `- ... en ${allClasses.size - 20} meer\n`;
      }
    } else {
      markdown += '*Geen CSS classes gevonden*\n';
    }

    markdown += `
### CSS IDs:
`;

    // Extract all IDs
    const allIds = new Set<string>();
    $('[id]').each((_, element) => {
      const id = $(element).attr('id');
      if (id) allIds.add(id);
    });

    if (allIds.size > 0) {
      Array.from(allIds).forEach(id => {
        markdown += `- \`#${id}\`\n`;
      });
    } else {
      markdown += '*Geen IDs gevonden*\n';
    }

    markdown += `
---

## 🔍 Meta Information Analysis

**Wat modules kunnen detecteren in <head>:**

`;

    // Analyze meta tags
    const metaInfo: string[] = [];
    $('meta').each((_, element) => {
      const name = $(element).attr('name');
      const property = $(element).attr('property');
      const content = $(element).attr('content');
      const httpEquiv = $(element).attr('http-equiv');
      
      if (name && content) {
        metaInfo.push(`**${name}:** "${content}"`);
      } else if (property && content) {
        metaInfo.push(`**${property}:** "${content}"`);
      } else if (httpEquiv && content) {
        metaInfo.push(`**http-equiv ${httpEquiv}:** "${content}"`);
      }
    });

    if (metaInfo.length > 0) {
      metaInfo.forEach(info => markdown += `- ${info}\n`);
    } else {
      markdown += '*Geen meta tags gevonden*\n';
    }

    // JSON-LD analysis
    markdown += `
### JSON-LD Structured Data:
`;

    const jsonLdScripts = $('script[type="application/ld+json"]');
    if (jsonLdScripts.length > 0) {
      jsonLdScripts.each((index, script) => {
        const content = $(script).html();
        markdown += `
**JSON-LD Script ${index + 1}:**
\`\`\`json
${content}
\`\`\`
`;
      });
    } else {
      markdown += '*Geen JSON-LD structured data gevonden*\n';
    }

    markdown += `
---

## 🔬 Pattern Detection Ready Data

**Data zoals modules het zien voor pattern matching:**

### Text Samples for Pattern Analysis:
- **Total text length:** ${plainText.length} characters
- **Word count:** ${plainText.split(/\s+/).length} words
- **Sentence count:** ${plainText.split(/[.!?]+/).length} sentences
- **Contains question marks:** ${plainText.includes('?') ? 'Yes' : 'No'}
- **Contains email pattern:** ${/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(plainText) ? 'Yes' : 'No'}
- **Contains phone pattern:** ${/\b\d{2,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/.test(plainText) ? 'Yes' : 'No'}

### Headings for Analysis:
`;

    $('h1, h2, h3, h4, h5, h6').each((index, heading) => {
      const tag = heading.tagName.toLowerCase();
      const text = $(heading).text().trim();
      markdown += `- **${tag.toUpperCase()}:** "${text}"\n`;
    });

    markdown += `
---

## 🚀 Ready for Module Processing

**Deze data wordt nu doorgestuurd naar de 6 modules:**
1. TechnicalSEO - analyseert meta tags, links, document structure
2. SchemaMarkup - zoekt naar JSON-LD en Open Graph tags  
3. AIContent - analyseert text patterns, FAQ content, conversational tone
4. AICitation - zoekt naar authority markers, author info, expertise signalen
5. Freshness - controleert datum informatie en content versheid
6. CrossWebFootprint - detecteert social media links en cross-platform presence

*Elk van deze modules krijgt exact deze data en begint pattern matching...*

---

*Debug Report - Gegenereerd door AIO Scanner Test Suite - ${timestamp}*
`;

    return markdown;
    
  } catch (error) {
    return `# Debug Report Error

**URL:** ${testUrl}
**Error:** ${error instanceof Error ? error.message : 'Unknown error'}
**Timestamp:** ${timestamp}

Het ophalen van debug data is mislukt. Check de URL en probeer opnieuw.
`;
  }
}

function generateDOMTree($: cheerio.CheerioAPI): string {
  let tree = '';
  
  // Simple DOM tree representation
  const addElement = (element: any, depth: number = 0) => {
    const indent = '  '.repeat(depth);
    const tagName = element.tagName || 'text';
    const id = $(element).attr('id') ? `#${$(element).attr('id')}` : '';
    const classes = $(element).attr('class') ? `.${$(element).attr('class')?.split(' ').join('.')}` : '';
    
    tree += `${indent}<${tagName}${id}${classes}>\n`;
    
    // Limit depth to avoid huge trees
    if (depth < 3) {
      $(element).children().each((_, child) => {
        addElement(child, depth + 1);
      });
    } else if ($(element).children().length > 0) {
      tree += `${indent}  ... (${$(element).children().length} child elements)\n`;
    }
  };
  
  // Start with body or html
  const body = $('body')[0];
  if (body) {
    addElement(body);
  } else {
    tree = 'DOM tree could not be generated';
  }
  
  return tree;
}

function generateRawModuleReport(result: any, testUrl: string, tier: string): string {
  const timestamp = new Date().toISOString();
  
  let markdown = `# AIO Scanner - Pure Module Output (Pre-AI)

**URL:** ${testUrl}  
**Tier:** ${tier}  
**Gegenereerd:** ${timestamp}  
**Type:** Ruwe module data ZONDER AI interpretatie

---

## 📋 Module Overzicht

- **Aantal modules:** ${result.moduleResults.length}
- **Totaal findings:** ${result.moduleResults.reduce((sum: number, m: any) => sum + m.findings.length, 0)}
- **Scan ID:** ${result.scanId}

---

## 🔬 Pure Module Outputs

**Deze data komt rechtstreeks uit de modules voordat AI enhancement:**

`;

  // Toon elke module in pure JSON formaat
  result.moduleResults.forEach((module: any, index: number) => {
    markdown += `### ${index + 1}. ${module.name}

**Raw Score:** ${module.score}/100

#### Pure JSON Output:
\`\`\`json
${JSON.stringify(module, null, 2)}
\`\`\`

---

`;
  });

  markdown += `
## 📊 Score Samenvatting

| Module | Score | Findings |
|--------|-------|----------|
`;

  result.moduleResults.forEach((module: any) => {
    markdown += `| ${module.name} | ${module.score}/100 | ${module.findings.length} |\n`;
  });

  markdown += `

## 🎯 Key Insights

**Overall Score:** ${result.overallScore}/100
**Module Gemiddelde:** ${Math.round(result.moduleResults.reduce((sum: number, m: any) => sum + m.score, 0) / result.moduleResults.length)}/100

**High Priority Findings:** ${result.moduleResults.reduce((sum: number, m: any) => sum + m.findings.filter((f: any) => f.priority === 'high').length, 0)}
**Medium Priority Findings:** ${result.moduleResults.reduce((sum: number, m: any) => sum + m.findings.filter((f: any) => f.priority === 'medium').length, 0)}
**Low Priority Findings:** ${result.moduleResults.reduce((sum: number, m: any) => sum + m.findings.filter((f: any) => f.priority === 'low').length, 0)}

---

*Ruwe Module Data - Gegenereerd door AIO Scanner Test Suite - ${timestamp}*
`;

  return markdown;
} 
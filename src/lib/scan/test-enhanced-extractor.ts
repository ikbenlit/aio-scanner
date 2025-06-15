/**
 * Test Phase 3.1A Enhanced ContentExtractor
 * Quick validation of new enhanced content extraction features
 */

import { ContentExtractor } from './ContentExtractor.js';

// Test HTML content with various patterns
const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Bedrijf - Marktleider sinds 1985</title>
</head>
<body>
    <h1>Welkom bij ons bedrijf</h1>
    <p>Wij zijn al 35 jaar actief in de markt en bieden de beste service aan onze vele klanten.</p>
    <p>Onze nieuwste technologie zorgt voor uitstekende resultaten. We hebben veel ervaring en zijn marktleider.</p>
    <p>95% van onze klanten is zeer tevreden en we garanderen resultaat.</p>
    <p>Lid van branchevereniging, ISO 9001 gecertificeerd.</p>
    <p>KvK: 12345678, BTW: NL123456789B01</p>
    <p>Hoe kunnen wij u helpen? Wat zijn uw wensen? Neem direct contact op!</p>
    <p>Telefoon: 020-1234567, email: info@testbedrijf.nl</p>
    <div>
        <h2>FAQ</h2>
        <p>Wat is onze specialiteit? Wij bieden verschillende oplossingen.</p>
        <p>Waarom kiezen voor ons? We hebben ruime ervaring en moderne aanpak.</p>
    </div>
</body>
</html>
`;

async function testEnhancedExtractor() {
    console.log('🧪 Testing Phase 3.1A Enhanced ContentExtractor\n');
    
    const extractor = new ContentExtractor();
    
    try {
        // Test enhanced content extraction
        console.log('📊 Extracting Enhanced Content...');
        const enhancedContent = extractor.extractEnhancedContent(testHTML);
        
        console.log('\n=== ENHANCED CONTENT RESULTS ===\n');
        
        // Basic samples (should still work)
        console.log('🔍 Basic Content Samples:');
        console.log(`- Time signals: ${enhancedContent.timeSignals.length}`);
        console.log(`- Quality claims: ${enhancedContent.qualityClaims.length}`);
        console.log(`- Authority markers: ${enhancedContent.authorityMarkers.length}`);
        console.log(`- Business signals: ${enhancedContent.businessSignals.length}`);
        console.log(`- Questions: ${enhancedContent.questionPatterns?.length || 0}`);
        
        // New Phase 3.1A features
        console.log('\n🎯 Content Quality Assessment:');
        const quality = enhancedContent.contentQualityAssessment;
        console.log(`- Overall Quality Score: ${quality.overallQualityScore}/100`);
        console.log(`- Temporal claims: ${quality.temporalClaims.length}`);
        console.log(`- Vague statements: ${quality.vagueStatements.length}`);
        console.log(`- Unsupported claims: ${quality.unsupportedClaims.length}`);
        
        // Show some examples
        if (quality.temporalClaims.length > 0) {
            console.log('\n⚠️  Temporal Claims Found:');
            quality.temporalClaims.forEach((claim, i) => {
                console.log(`  ${i + 1}. "${claim.text}" (${claim.claimType}, risk: ${claim.riskLevel})`);
                console.log(`     Suggestion: ${claim.suggestion}`);
            });
        }
        
        if (quality.vagueStatements.length > 0) {
            console.log('\n❓ Vague Statements Found:');
            quality.vagueStatements.forEach((statement, i) => {
                console.log(`  ${i + 1}. "${statement.text}" (${statement.vagueType})`);
                console.log(`     Suggestion: ${statement.suggestion}`);
            });
        }
        
        if (quality.unsupportedClaims.length > 0) {
            console.log('\n📋 Unsupported Claims Found:');
            quality.unsupportedClaims.forEach((claim, i) => {
                console.log(`  ${i + 1}. "${claim.text}" (${claim.claimType})`);
                console.log(`     Evidence needed: ${claim.evidenceNeeded}`);
            });
        }
        
        console.log('\n💡 Missed Opportunities:');
        enhancedContent.missedOpportunities.forEach((opp, i) => {
            console.log(`  ${i + 1}. ${opp.category.toUpperCase()}: ${opp.description}`);
            console.log(`     Impact: ${opp.impact}, Effort: ${opp.implementationEffort}`);
            console.log(`     Suggestion: ${opp.suggestion}`);
        });
        
        console.log('\n🤖 AI Optimization Hints:');
        enhancedContent.aiOptimizationHints.forEach((hint, i) => {
            console.log(`  ${i + 1}. ${hint.category.toUpperCase()} (Priority: ${hint.priority})`);
            console.log(`     AI Readiness Score: ${hint.aiReadinessScore}/100`);
            console.log(`     ${hint.description}`);
        });
        
        console.log('\n✅ Enhanced ContentExtractor test completed successfully!');
        console.log('\n📈 Phase 3.1A Implementation Status: READY FOR INTEGRATION');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testEnhancedExtractor();
}

export { testEnhancedExtractor };
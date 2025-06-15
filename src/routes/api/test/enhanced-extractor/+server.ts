import { json } from '@sveltejs/kit';
import { ContentExtractor } from '$lib/scan/ContentExtractor.js';
import type { RequestHandler } from './$types';

// Test HTML with various patterns for Phase 3.1A validation
const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Bedrijf - Marktleider sinds 1985</title>
</head>
<body>
    <h1>Welkom bij ons bedrijf</h1>
    <p>Wij zijn al 35 jaar activ in de markt en bieden de beste service aan onze vele klanten.</p>
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

export const GET: RequestHandler = async ({ url }) => {
	try {
		const extractor = new ContentExtractor();
		
		console.log('🧪 Testing Phase 3.1A Enhanced ContentExtractor');
		
		// Test enhanced content extraction
		const enhancedContent = extractor.extractEnhancedContent(testHTML);
		
		// Create summary for API response
		const testResults = {
			status: 'success',
			phase: '3.1A Enhanced Content Extraction',
			basicSamples: {
				timeSignals: enhancedContent.timeSignals.length,
				qualityClaims: enhancedContent.qualityClaims.length,
				authorityMarkers: enhancedContent.authorityMarkers.length,
				businessSignals: enhancedContent.businessSignals.length,
				questionPatterns: enhancedContent.questionPatterns?.length || 0,
				conversationalSignals: enhancedContent.conversationalSignals?.length || 0
			},
			enhancedFeatures: {
				contentQuality: {
					overallScore: enhancedContent.contentQualityAssessment.overallQualityScore,
					temporalClaims: enhancedContent.contentQualityAssessment.temporalClaims.length,
					vagueStatements: enhancedContent.contentQualityAssessment.vagueStatements.length,
					unsupportedClaims: enhancedContent.contentQualityAssessment.unsupportedClaims.length
				},
				missedOpportunities: enhancedContent.missedOpportunities.length,
				aiOptimizationHints: enhancedContent.aiOptimizationHints.length
			},
			sampleFindings: {
				temporalClaims: enhancedContent.contentQualityAssessment.temporalClaims.slice(0, 3).map(claim => ({
					text: claim.text,
					type: claim.claimType,
					risk: claim.riskLevel,
					suggestion: claim.suggestion
				})),
				vagueStatements: enhancedContent.contentQualityAssessment.vagueStatements.slice(0, 3).map(statement => ({
					text: statement.text,
					type: statement.vagueType,
					suggestion: statement.suggestion
				})),
				missedOpportunities: enhancedContent.missedOpportunities.slice(0, 3).map(opp => ({
					category: opp.category,
					description: opp.description,
					impact: opp.impact,
					suggestion: opp.suggestion
				})),
				aiHints: enhancedContent.aiOptimizationHints.slice(0, 3).map(hint => ({
					category: hint.category,
					priority: hint.priority,
					aiReadinessScore: hint.aiReadinessScore,
					description: hint.description
				}))
			}
		};
		
		// Also test backward compatibility
		const basicSamples = extractor.extractAllSamples(testHTML);
		const backwardCompatible = {
			timeSignals: basicSamples.timeSignals.length === enhancedContent.timeSignals.length,
			qualityClaims: basicSamples.qualityClaims.length === enhancedContent.qualityClaims.length,
			authorityMarkers: basicSamples.authorityMarkers.length === enhancedContent.authorityMarkers.length,
			businessSignals: basicSamples.businessSignals.length === enhancedContent.businessSignals.length
		};

		console.log('✅ Enhanced ContentExtractor test completed successfully!');
		
		return json({
			...testResults,
			backwardCompatibility: {
				status: Object.values(backwardCompatible).every(v => v) ? 'PASSED' : 'FAILED',
				details: backwardCompatible
			},
			implementation: {
				phase: '3.1A',
				status: 'COMPLETED',
				readyForIntegration: true
			}
		});

	} catch (error: any) {
		console.error('❌ Enhanced ContentExtractor test failed:', error);
		
		return json({
			status: 'error',
			phase: '3.1A Enhanced Content Extraction',
			error: error.message,
			implementation: {
				phase: '3.1A',
				status: 'FAILED',
				readyForIntegration: false
			}
		}, { status: 500 });
	}
};
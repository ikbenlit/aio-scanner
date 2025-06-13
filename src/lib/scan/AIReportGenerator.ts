// src/lib/scan/AIReportGenerator.ts
import type { EngineScanResult, AIReport, Finding } from '../types/scan';

export class AIReportGenerator {
    async generateReport(scanResult: EngineScanResult): Promise<AIReport> {
        // Genereer een AI-enhanced rapport op basis van scan resultaten
        const findings = scanResult.moduleResults.flatMap(module => module.findings);
        const highPriorityFindings = findings.filter(f => f.priority === 'high');

    return {
            summary: this.generateSummary(scanResult),
            recommendations: this.generateRecommendations(findings),
            implementationPlan: {
                steps: this.generateImplementationSteps(highPriorityFindings),
                estimatedTime: this.calculateEstimatedTime(highPriorityFindings)
            },
            estimatedImpact: this.calculateEstimatedImpact(findings)
        };
    }

    private generateSummary(scanResult: EngineScanResult): string {
        const score = scanResult.overallScore;
        const issues = scanResult.moduleResults
            .flatMap(m => m.findings)
            .filter(f => f.priority === 'high').length;

        if (score >= 80) {
            return `Je website scoort uitstekend (${score}/100) voor AI-zoekmachines. Met ${issues} kleine optimalisaties kun je de AI-citatie kans verder verhogen.`;
        } else if (score >= 60) {
            return `Je website heeft een goede basis (${score}/100) maar ${issues} gebieden kunnen geoptimaliseerd worden voor betere AI-zichtbaarheid.`;
    } else {
            return `Je website heeft significante verbetermogelijkheden (${score}/100). Focus op de ${issues} prioritaire aanbevelingen voor maximale impact.`;
        }
    }

    private generateRecommendations(findings: Finding[]): Finding[] {
        // Sorteer op prioriteit en voeg concrete aanbevelingen toe
        return findings
            .sort((a, b) => this.priorityToNumber(b.priority) - this.priorityToNumber(a.priority))
            .map(finding => ({
                ...finding,
                recommendation: this.generateRecommendation(finding)
            }))
            .slice(0, 8); // Top 8 aanbevelingen
    }

    private generateImplementationSteps(findings: Finding[]): string[] {
        return findings.map((finding, index) => {
            const stepNumber = index + 1;
            return `Stap ${stepNumber}: ${finding.title} - ${finding.recommendation || finding.description}`;
        });
    }

    private calculateEstimatedTime(findings: Finding[]): string {
        const totalMinutes = findings.length * 30; // Schat 30 minuten per high-priority finding
        if (totalMinutes < 60) {
            return `${totalMinutes} minuten`;
        }
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours} uur${minutes > 0 ? ` en ${minutes} minuten` : ''}`;
    }

    private calculateEstimatedImpact(findings: Finding[]): string {
        const highPriorityCount = findings.filter(f => f.priority === 'high').length;
        const mediumPriorityCount = findings.filter(f => f.priority === 'medium').length;

        if (highPriorityCount > 3) {
            return 'Zeer hoge impact verwacht (+40-60% AI zichtbaarheid)';
        } else if (highPriorityCount > 0) {
            return 'Significante impact verwacht (+20-40% AI zichtbaarheid)';
        } else if (mediumPriorityCount > 2) {
            return 'Gemiddelde impact verwacht (+10-20% AI zichtbaarheid)';
        } else {
            return 'Beperkte impact verwacht (+5-10% AI zichtbaarheid)';
        }
    }

    private generateRecommendation(finding: Finding): string {
        // Genereer concrete implementatie aanbevelingen op basis van finding type
        switch (finding.title.toLowerCase()) {
            case 'robots.txt optimalisatie nodig':
                return 'Voeg de volgende regels toe aan robots.txt:\nUser-agent: GPTBot\nAllow: /\nUser-agent: ChatGPT-User\nAllow: /';
            case 'schema markup ontbreekt':
                return 'Implementeer FAQ Schema markup voor je meest gestelde vragen. Gebruik de Schema.org specificatie.';
            default:
                return finding.description;
        }
    }

    private priorityToNumber(priority: 'high' | 'medium' | 'low'): number {
        switch (priority) {
            case 'high': return 3;
            case 'medium': return 2;
            case 'low': return 1;
        }
  }
}
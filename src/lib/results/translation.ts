// src/lib/results/translation.ts
// Translation engine: converts technical findings to business-friendly actions

import type { Finding } from '$lib/types/scan';

export interface BusinessAction {
  id: string;
  title: string;
  why: string;
  how: string;
  timeEstimate: string;
  impactPoints: string;
  difficulty: 'makkelijk' | 'gemiddeld' | 'uitdagend';
  priority: 'high' | 'medium' | 'low';
  category: string;
  expandedDetails?: {
    steps: string[];
    whyItWorks: string;
    examples?: string[];
  };
  originalFinding?: Finding;
}

/**
 * Central translation dictionary: maps technical findings to business actions
 * Based on analysis of scan modules and common finding patterns
 */
export const findingTranslations: Record<string, Omit<BusinessAction, 'id' | 'originalFinding'>> = {
  // Schema Markup Issues
  'missing_schema_organization': {
    title: 'Voeg bedrijfsgegevens toe',
    why: 'AI-assistenten kunnen dan jouw bedrijf beter herkennen en vermelden',
    how: 'Plaats KvK-nummer, adres en telefoonnummer duidelijk op je website',
    timeEstimate: '15 minuten',
    impactPoints: '+12 punten',
    difficulty: 'makkelijk',
    priority: 'high',
    category: 'business-info',
    expandedDetails: {
      steps: [
        'Ga naar je website footer',
        'Voeg toe: "KvK: [jouw nummer]"',
        'Voeg adres en telefoonnummer toe',
        'Plaats deze info ook op je contact pagina'
      ],
      whyItWorks: 'AI-assistenten controleren bedrijfsinfo om betrouwbaarheid te bepalen voor citaties. Officiële registratie verhoogt je autoriteit.',
      examples: ['KvK: 12345678', 'Adres: Hoofdstraat 1, 1000 AA Amsterdam', 'Tel: 020-1234567']
    }
  },

  'incomplete_schema_organization': {
    title: 'Completeer bedrijfsinformatie',
    why: 'Volledige informatie verhoogt je betrouwbaarheid voor AI-assistenten',
    how: 'Vul ontbrekende gegevens aan zoals openingstijden en services',
    timeEstimate: '20 minuten',
    impactPoints: '+8 punten',
    difficulty: 'makkelijk',
    priority: 'medium',
    category: 'business-info'
  },

  // FAQ Content
  'faq_content_missing': {
    title: 'Maak een FAQ sectie',
    why: 'AI-assistenten zoeken naar vraag-antwoord content om te citeren',
    how: 'Verzamel de 5 meest gestelde vragen en beantwoord ze kort',
    timeEstimate: '1 uur',
    impactPoints: '+15 punten',
    difficulty: 'gemiddeld',
    priority: 'high',
    category: 'ai-content',
    expandedDetails: {
      steps: [
        'Maak een nieuwe pagina of sectie: "Veelgestelde vragen"',
        'Denk aan 5 vragen die klanten vaak stellen',
        'Geef per vraag een kort, duidelijk antwoord (2-3 zinnen)',
        'Gebruik koppen zoals "Vraag:" en "Antwoord:" voor structuur'
      ],
      whyItWorks: 'AI-assistenten citeren graag gestructureerde Q&A content omdat het direct en relevant is voor gebruikersvragen.',
      examples: [
        'Vraag: Wat zijn jullie openingstijden?',
        'Vraag: Hoe kan ik contact opnemen?',
        'Vraag: Wat zijn de kosten?'
      ]
    }
  },

  'faq_content_limited': {
    title: 'Breid FAQ sectie uit',
    why: 'Meer vragen verhogen de kans op AI-citaties',
    how: 'Voeg nog 3-5 relevante vragen toe aan je bestaande FAQ',
    timeEstimate: '30 minuten',
    impactPoints: '+8 punten',
    difficulty: 'makkelijk',
    priority: 'medium',
    category: 'ai-content'
  },

  // Meta Descriptions
  'meta_description_missing': {
    title: 'Schrijf pagina-beschrijvingen',
    why: 'Voor betere weergave in AI-antwoorden en zoekmachines',
    how: 'Voeg aan elke pagina een korte beschrijving toe (max 150 tekens)',
    timeEstimate: '45 minuten',
    impactPoints: '+10 punten',
    difficulty: 'gemiddeld',
    priority: 'medium',
    category: 'metadata',
    expandedDetails: {
      steps: [
        'Ga naar elke belangrijke pagina van je website',
        'Schrijf een beschrijving van 120-150 tekens',
        'Gebruik actieve taal en vermeld je belangrijkste dienst',
        'Voeg deze toe in je CMS of website editor'
      ],
      whyItWorks: 'AI-assistenten gebruiken deze beschrijvingen om te begrijpen waar pagina\'s over gaan en om ze samen te vatten.',
      examples: [
        'Professionele webdesign services in Amsterdam. Moderne websites die converteren en opvallen.',
        'Boekhouding voor MKB ondernemers. Bespaar tijd met onze administratie service.'
      ]
    }
  },

  'meta_description_too_long': {
    title: 'Korte pagina-beschrijvingen',
    why: 'Voor betere weergave in AI-antwoorden',
    how: 'Houd beschrijvingen onder 150 tekens',
    timeEstimate: '30 minuten',
    impactPoints: '+6 punten',
    difficulty: 'makkelijk',
    priority: 'medium',
    category: 'metadata'
  },

  // Authority & Credibility
  'author_info_missing': {
    title: 'Voeg team informatie toe',
    why: 'AI-assistenten vertrouwen websites met herkenbare experts',
    how: 'Maak een "Over ons" sectie met foto\'s en expertise',
    timeEstimate: '45 minuten',
    impactPoints: '+12 punten',
    difficulty: 'gemiddeld',
    priority: 'high',
    category: 'authority',
    expandedDetails: {
      steps: [
        'Maak een "Over ons" of "Team" pagina',
        'Voeg foto\'s toe van jezelf of je team',
        'Vermeld relevante ervaring en expertise',
        'Plaats contactgegevens erbij'
      ],
      whyItWorks: 'AI-assistenten kijken naar de menselijke experts achter een website om de betrouwbaarheid te beoordelen.',
      examples: [
        'Jan de Vries, 15 jaar ervaring in webdesign',
        'Gecertificeerd Google Ads specialist',
        'Meer dan 200 websites gerealiseerd'
      ]
    }
  },

  'testimonials_missing': {
    title: 'Voeg klantbeoordelingen toe',
    why: 'Sociale bewijskracht verhoogt je autoriteit voor AI-assistenten',
    how: 'Plaats 3-5 klantbeoordelingen met naam en bedrijf',
    timeEstimate: '30 minuten',
    impactPoints: '+8 punten',
    difficulty: 'makkelijk',
    priority: 'medium',
    category: 'authority'
  },

  // Content Freshness
  'outdated_content': {
    title: 'Update je content',
    why: 'Recente content wordt vaker geciteerd door AI-assistenten',
    how: 'Voeg actuele datums toe en ververs oude informatie',
    timeEstimate: '1 uur',
    impactPoints: '+10 punten',
    difficulty: 'gemiddeld',
    priority: 'medium',
    category: 'freshness',
    expandedDetails: {
      steps: [
        'Ga door je belangrijkste pagina\'s',
        'Voeg "Laatst bijgewerkt" datums toe',
        'Update oude informatie naar huidige situatie',
        'Ververs voorbeelden en prijzen indien nodig'
      ],
      whyItWorks: 'AI-assistenten geven voorkeur aan recente, actuele informatie omdat dit betrouwbaarder is voor gebruikers.',
      examples: [
        'Laatst bijgewerkt: December 2024',
        'Actuele prijzen per 2024',
        'Nieuwste voorbeelden en referenties'
      ]
    }
  },

  'missing_dates': {
    title: 'Voeg datums toe aan content',
    why: 'AI-assistenten willen weten hoe recent je informatie is',
    how: 'Plaats "Gepubliceerd" of "Laatst bijgewerkt" datums',
    timeEstimate: '20 minuten',
    impactPoints: '+6 punten',
    difficulty: 'makkelijk',
    priority: 'medium',
    category: 'freshness'
  },

  // Cross-web Presence
  'linkedin_missing': {
    title: 'Koppel je LinkedIn profiel',
    why: 'Professionele profielen versterken je autoriteit',
    how: 'Plaats een link naar je LinkedIn profiel in je footer',
    timeEstimate: '10 minuten',
    impactPoints: '+5 punten',
    difficulty: 'makkelijk',
    priority: 'low',
    category: 'authority'
  },

  'social_media_missing': {
    title: 'Voeg sociale media links toe',
    why: 'Actieve sociale profielen tonen dat je bedrijf levendig is',
    how: 'Plaats links naar je actieve sociale media accounts',
    timeEstimate: '15 minuten',
    impactPoints: '+4 punten',
    difficulty: 'makkelijk',
    priority: 'low',
    category: 'authority'
  },

  // Technical SEO
  'robots_txt_missing': {
    title: 'Maak robots.txt bestand',
    why: 'Om AI-crawlers duidelijk te maken wat ze mogen indexeren',
    how: 'Upload een robots.txt bestand naar je website root',
    timeEstimate: '20 minuten',
    impactPoints: '+8 punten',
    difficulty: 'gemiddeld',
    priority: 'medium',
    category: 'technical'
  },

  'sitemap_missing': {
    title: 'Genereer een sitemap',
    why: 'Helpt AI-crawlers om alle pagina\'s te vinden',
    how: 'Maak een sitemap.xml en plaats deze in je website root',
    timeEstimate: '25 minuten',
    impactPoints: '+7 punten',
    difficulty: 'gemiddeld',
    priority: 'medium',
    category: 'technical'
  },

  // Conversational Content
  'conversational_tone_low': {
    title: 'Maak je teksten toegankelijker',
    why: 'Persoonlijke toon werkt beter voor AI-assistenten',
    how: 'Gebruik "je" in plaats van "u" en stel vragen aan lezers',
    timeEstimate: '1 uur',
    impactPoints: '+9 punten',
    difficulty: 'gemiddeld',
    priority: 'medium',
    category: 'ai-content'
  },

  // Contact Information
  'contact_info_incomplete': {
    title: 'Completeer contactgegevens',
    why: 'Volledige contactinfo verhoogt vertrouwen van AI-assistenten',
    how: 'Zorg dat telefoon, email en adres overal kloppen',
    timeEstimate: '15 minuten',
    impactPoints: '+6 punten',
    difficulty: 'makkelijk',
    priority: 'medium',
    category: 'business-info'
  }
};

/**
 * Identifies the appropriate translation key based on finding characteristics
 */
export function identifyTranslationKey(finding: Finding): string | null {
  const title = finding.title.toLowerCase();
  const description = finding.description.toLowerCase();
  const category = finding.category?.toLowerCase() || '';

  // Schema markup patterns
  if (category.includes('structured-data') || title.includes('schema') || title === 'missing_schema_organization') {
    if (title.includes('ontbrekend') || title.includes('geen') || title === 'missing_schema_organization') {
      return 'missing_schema_organization';
    }
    if (title.includes('onvolledig') || description.includes('ontbrekend')) {
      return 'incomplete_schema_organization';
    }
  }

  // FAQ content patterns
  if (category.includes('ai-content') && (title.includes('faq') || description.includes('faq'))) {
    if (title.includes('ontbrekend') || title.includes('geen')) {
      return 'faq_content_missing';
    }
    if (title.includes('beperkt') || title.includes('weinig')) {
      return 'faq_content_limited';
    }
  }

  // Meta description patterns
  if (category.includes('metadata') && title.includes('meta')) {
    if (title.includes('ontbrekend') || title.includes('missing')) {
      return 'meta_description_missing';
    }
    if (title.includes('lang') || title.includes('exceed')) {
      return 'meta_description_too_long';
    }
  }

  // Authority patterns
  if (category.includes('authority')) {
    if (title.includes('author') || title.includes('team')) {
      return 'author_info_missing';
    }
    if (title.includes('testimonial') || title.includes('beoordelingen')) {
      return 'testimonials_missing';
    }
  }

  // Freshness patterns
  if (category.includes('freshness')) {
    if (title.includes('outdated') || title.includes('verouderd')) {
      return 'outdated_content';
    }
    if (title.includes('date') || title.includes('datum')) {
      return 'missing_dates';
    }
  }

  // Cross-web patterns
  if (category.includes('cross-web')) {
    if (title.includes('linkedin')) {
      return 'linkedin_missing';
    }
    if (title.includes('social')) {
      return 'social_media_missing';
    }
  }

  // Technical patterns
  if (category.includes('technical') || category.includes('crawling')) {
    if (title.includes('robots')) {
      return 'robots_txt_missing';
    }
    if (title.includes('sitemap')) {
      return 'sitemap_missing';
    }
  }

  // Content patterns
  if (category.includes('ai-content')) {
    if (title.includes('conversational') || title.includes('toon')) {
      return 'conversational_tone_low';
    }
  }

  // Contact patterns
  if (category.includes('contactinfo') || category.includes('business')) {
    return 'contact_info_incomplete';
  }

  return null;
}

/**
 * Converts a technical finding to a business action
 */
export function translateFinding(finding: Finding): BusinessAction | null {
  const translationKey = identifyTranslationKey(finding);
  
  if (!translationKey || !findingTranslations[translationKey]) {
    return null;
  }

  const translation = findingTranslations[translationKey];
  
  return {
    id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...translation,
    originalFinding: finding
  };
}

/**
 * Converts a list of technical findings to business actions
 */
export function translateFindings(findings: Finding[]): BusinessAction[] {
  return findings
    .map(finding => translateFinding(finding))
    .filter((action): action is BusinessAction => action !== null);
}

/**
 * Get positive findings that should be highlighted
 */
export function getPositiveFindings(findings: Finding[]): string[] {
  const positivePatterns = [
    'uitstekend',
    'goed',
    'prima',
    'aanwezig',
    'gevonden',
    'consistent',
    'fresh',
    'optimaal'
  ];

  return findings
    .filter(finding => {
      const text = `${finding.title} ${finding.description}`.toLowerCase();
      return positivePatterns.some(pattern => text.includes(pattern)) && 
             finding.priority === 'low'; // Low priority often means "good"
    })
    .map(finding => {
      // Convert to business-friendly language
      const title = finding.title.replace(/:/g, '').toLowerCase();
      
      if (title.includes('robots') || title.includes('toegankelijk')) {
        return 'Website is technisch gezond';
      }
      if (title.includes('schema') || title.includes('gestructureerd')) {
        return 'Bedrijfsinformatie is goed leesbaar';
      }
      if (title.includes('faq') || title.includes('vraag')) {
        return 'FAQ sectie aanwezig';
      }
      if (title.includes('meta') || title.includes('beschrijving')) {
        return 'Pagina-beschrijvingen zijn goed';
      }
      if (title.includes('fresh') || title.includes('recent')) {
        return 'Content is up-to-date';
      }
      if (title.includes('contact') || title.includes('info')) {
        return 'Contact informatie is volledig';
      }
      
      return 'Goede site structuur gevonden';
    })
    .slice(0, 4); // Max 4 positive points
}
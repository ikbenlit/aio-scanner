/**
 * Website Context Analyzer - Adds semantic understanding to AI prompts
 */

export interface WebsiteContext {
  businessType: 'ecommerce' | 'blog' | 'service' | 'portfolio' | 'news' | 'entertainment' | 'education' | 'other';
  industry: string;
  targetAudience: string;
  language: string;
  contentStrategy: string;
  businessModel: string;
  competitiveContext: string;
}

export class WebsiteContextAnalyzer {
  
  /**
   * Analyze website context from enhanced content to provide AI with semantic understanding
   */
  static analyzeContext(enhancedContent: any, url: string): WebsiteContext {
    const title = enhancedContent.extractedText?.title || '';
    const description = enhancedContent.extractedText?.description || '';
    const content = enhancedContent.extractedText?.content || '';
    const domain = new URL(url).hostname;
    
    // Business type detection
    const businessType = this.detectBusinessType(title, description, content, domain);
    
    // Industry detection
    const industry = this.detectIndustry(title, description, content, domain);
    
    // Target audience
    const targetAudience = this.detectTargetAudience(content, domain);
    
    // Language detection
    const language = this.detectLanguage(content);
    
    return {
      businessType,
      industry,
      targetAudience,
      language,
      contentStrategy: this.analyzeContentStrategy(content, businessType),
      businessModel: this.analyzeBusinessModel(content, businessType),
      competitiveContext: this.analyzeCompetitiveContext(industry, businessType)
    };
  }
  
  private static detectBusinessType(title: string, description: string, content: string, domain: string): WebsiteContext['businessType'] {
    const text = `${title} ${description} ${content}`.toLowerCase();
    
    // E-commerce indicators
    if (text.includes('shop') || text.includes('kopen') || text.includes('winkel') || 
        text.includes('bestellen') || text.includes('product') || text.includes('prijs')) {
      return 'ecommerce';
    }
    
    // Service indicators
    if (text.includes('dienst') || text.includes('service') || text.includes('advies') || 
        text.includes('consultant') || text.includes('hulp')) {
      return 'service';
    }
    
    // Blog indicators
    if (text.includes('blog') || text.includes('artikel') || text.includes('tips') || 
        domain.includes('blog')) {
      return 'blog';
    }
    
    // Entertainment (like GIFs site)
    if (text.includes('gif') || text.includes('video') || text.includes('entertainment') || 
        text.includes('fun') || text.includes('download')) {
      return 'entertainment';
    }
    
    // Portfolio indicators
    if (text.includes('portfolio') || text.includes('werk') || text.includes('project')) {
      return 'portfolio';
    }
    
    return 'other';
  }
  
  private static detectIndustry(title: string, description: string, content: string, domain: string): string {
    const text = `${title} ${description} ${content}`.toLowerCase();
    
    // Define industry keywords
    const industries = {
      'Digital Marketing': ['marketing', 'seo', 'adverteren', 'campagne'],
      'Web Development': ['website', 'ontwikkeling', 'developer', 'code'],
      'Entertainment': ['gif', 'video', 'entertainment', 'media'],
      'E-commerce': ['webshop', 'verkoop', 'product', 'winkel'],
      'Healthcare': ['zorg', 'gezondheid', 'medisch', 'dokter'],
      'Finance': ['financieel', 'bank', 'verzekering', 'geld'],
      'Education': ['onderwijs', 'leren', 'cursus', 'training'],
      'Real Estate': ['vastgoed', 'huis', 'woning', 'makelaardij']
    };
    
    for (const [industry, keywords] of Object.entries(industries)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return industry;
      }
    }
    
    return 'General';
  }
  
  private static detectTargetAudience(content: string, domain: string): string {
    const text = content.toLowerCase();
    
    if (text.includes('zakelijk') || text.includes('bedrijf') || text.includes('b2b')) {
      return 'Business professionals';
    }
    
    if (text.includes('particulier') || text.includes('consumenten') || text.includes('thuis')) {
      return 'Consumers';
    }
    
    if (domain.includes('.nl') || text.includes('nederland') || text.includes('dutch')) {
      return 'Dutch market';
    }
    
    return 'General audience';
  }
  
  private static detectLanguage(content: string): string {
    const text = content.toLowerCase();
    
    const dutchWords = ['de', 'het', 'een', 'van', 'en', 'in', 'op', 'met', 'voor', 'aan'];
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of'];
    
    const dutchCount = dutchWords.filter(word => text.includes(` ${word} `)).length;
    const englishCount = englishWords.filter(word => text.includes(` ${word} `)).length;
    
    return dutchCount > englishCount ? 'Dutch' : 'English';
  }
  
  private static analyzeContentStrategy(content: string, businessType: string): string {
    const text = content.toLowerCase();
    
    if (businessType === 'entertainment') {
      return 'Visual content strategy focused on downloadable media';
    }
    
    if (text.includes('blog') || text.includes('artikel')) {
      return 'Content marketing through educational articles';
    }
    
    if (text.includes('product') || text.includes('service')) {
      return 'Product/service-focused content with commercial intent';
    }
    
    return 'Informational content strategy';
  }
  
  private static analyzeBusinessModel(content: string, businessType: string): string {
    const text = content.toLowerCase();
    
    if (businessType === 'ecommerce') {
      return 'Direct sales through online store';
    }
    
    if (businessType === 'service') {
      return 'Service-based revenue model';
    }
    
    if (businessType === 'entertainment') {
      return 'Content distribution (likely ad-supported or freemium)';
    }
    
    return 'Mixed revenue streams';
  }
  
  private static analyzeCompetitiveContext(industry: string, businessType: string): string {
    return `${industry} sector with ${businessType} business model - focus on differentiation through unique value propositions`;
  }
}
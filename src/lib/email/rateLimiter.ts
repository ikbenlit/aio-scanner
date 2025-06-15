// src/lib/email/rateLimiter.ts
export class EmailRateLimiter {
    private static requests = new Map<string, number[]>();
    
    static canSendEmail(email: string): boolean {
      const now = Date.now();
      const timeWindow = 3600000; // 1 uur
      const maxRequests = 5; // Max 5 emails per uur
      
      // Haal de bestaande requests op voor dit e-mailadres
      const requests = this.requests.get(email) || [];
      
      // Filter requests binnen het tijdvenster
      const recentRequests = requests.filter(timestamp => now - timestamp < timeWindow);
      
      // Update de requests map
      this.requests.set(email, recentRequests);
      
      // Check of we onder de limiet zitten
      if (recentRequests.length < maxRequests) {
        // Voeg de nieuwe request toe
        recentRequests.push(now);
        this.requests.set(email, recentRequests);
        return true;
      }
      
      return false;
    }
  }
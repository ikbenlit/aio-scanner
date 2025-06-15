// src/lib/types/email.ts
export interface EmailResult {
    success: boolean;
    id?: string;
    error?: any;
  }
  
  export interface ScanEmailData {
    scanId: string;
    url: string;
    score: number;
    findings: any[];
    recommendations: any[];
  }
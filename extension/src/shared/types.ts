export interface JobData {
  jobTitle: string;
  company: string;
  jobDescription: string;
  requirements?: string[];
  location?: string;
  sourceUrl: string;
  sourcePlatform?: "BrighterMonday" | "LinkedIn" | "Fuzu";
}

export interface SkillGap {
  skill: string;
  importance: number; // 1-5 or 0-10
}

export interface SalaryBenchmark {
  min: number;
  median: number;
  max: number;
  currency: string;
}

export interface CompanyRating {
  rating: number;
  reviews: number;
  source: string;
}

export interface AnalysisResult {
  matchScore: number; // 0 - 100
  skillGaps: SkillGap[];
  strengths: string[];
  summary: string;
  salaryBenchmark: SalaryBenchmark;
  companyRating: CompanyRating;
  error?: string;
  cached?: boolean;
}

export interface UserSettings {
  salaryCurrency: string; // e.g. "KES", "USD", "EUR", "GBP"
  notifyOnMatch: boolean;
  matchThreshold: number; // e.g. 75
  apiUrl?: string;
  apiKey?: string;
}

export interface SessionJobRecord {
  job: JobData;
  analysis?: AnalysisResult;
  timestamp: number;
  tabId?: number;
}

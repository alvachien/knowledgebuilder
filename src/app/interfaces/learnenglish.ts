export interface LearnEnglishWordFileItem {
  id?: number;
  enword: string;
  cnword: string;
}

export interface LearnEnglishSentFileItem {
  id?: string;
  ensent: string;
  enwords?: string[];
  cnsent: string;
  explaination?: string;
  extraInfo?: string[];
}

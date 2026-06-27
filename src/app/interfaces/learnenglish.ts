export interface LearnEnglishWordDataFile {
  name: string;
  file: string;
}

export interface LearnEnglishWordFileItem {
  id?: number;
  enword: string;
  cnword: string;
}

export interface LearnEnglishSentDataFile {
  name: string;
  file: string;
}

export interface LearnEnglishSentFileItem {
  id?: string;
  ensent: string;
  enwords?: string[];
  cnsent: string;
  explaination?: string;
  extraInfo?: string[];
}

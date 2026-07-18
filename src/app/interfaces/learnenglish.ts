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

// Per-word bilingual reference sentences (example sentences from dictionaries).
// Served by the StorageController at learnenglish/word_references/<word>.json.
export interface WordReference {
  ent_sent: string;
  chn_sent: string;
  source: string;
}

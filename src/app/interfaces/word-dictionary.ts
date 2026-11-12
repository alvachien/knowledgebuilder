/**
 * Client shapes for aclearningutil's GET /api/WordDictionary?word= endpoint
 * (the per-word dictionary entry stored in words.db). Field names mirror the
 * backend DTOs; camelCase on the wire is MVC's default serialization.
 */

/** One Chinese definition line of a word entry. */
export interface WordDefinition {
  /** Part-of-speech label ("n.", "v.", "adj.", ...); empty for sense lines
   *  without a label - the norm for phrase glosses. */
  partOfSpeech: string;
  /** The Chinese meaning text. */
  meaning: string;
}

/** One bilingual example sentence of a word entry. */
export interface WordExample {
  /** The English sentence. */
  source: string;
  /** Its Chinese translation. */
  translation: string;
}

/** The dictionary detail for one word; example lists are capped server-side. */
export interface WordDictionaryEntry {
  /** The canonical DB spelling the entry resolved to (equal to the requested
   *  word except for spelling variants, which resolve to their base word). */
  word: string;
  definitions: WordDefinition[];
  examples: WordExample[];
}

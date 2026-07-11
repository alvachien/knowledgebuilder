import type { SelectionModeEnum, RatingOperatorEnum } from "./ui-common";

// Letter in word
export interface VocabularyWordLetter {
  idx: number;
  visible: boolean;
  letter: string;    
}

// Exclude certain words
export enum VocabularyExcludedPartEnum {
  'word' = 1,
  'phase' = 2,
}

// Options of Vocaublary
export interface VocabularyOptionCore {
  excludePart?: VocabularyExcludedPartEnum;
  wordLeadingCharacter?: string[];
  countOfItems: number;
}

// Select options
export interface VocabularySelectOption {
  selectedSelectMode: SelectionModeEnum;
  importIDs?: string;
  countOfItems?: number;
  countOfOffset?: number;
  filterOnTag?: string;
  ratingOperator?: RatingOperatorEnum;
  ratingValue?: number;
}

// Printing vocabulary options
export interface VocabularyPrintOption extends VocabularyOptionCore {
  subTitle?: string;
  printEntryDate?: boolean;
  printExecDate?: boolean;
  printFirstLetter?: boolean;
  // When true, FillInTheBlank blanks render at a fixed uniform width (hides word length).
  uniformBlankLength?: boolean;
  // Width (in &nbsp; cells) of the uniform blank; floored to 10 by the converter.
  uniformBlankLengthSize?: number;
}

// Typing vocabulary options
export interface VocabularyTypingOption extends VocabularyOptionCore {
  disableVoice: boolean;
  hideExplain: boolean;
}

export interface VocabularyStudyOption extends VocabularyOptionCore {
  disableVoice: boolean;
  hideExplain: boolean;
}

export enum VocabularyTypingStatusEnum {
  'NotStarted' = 0,
  'InProgress' = 1,
  'Completed' = 2,
}

export interface VocabularyTypingStatus {
  status: VocabularyTypingStatusEnum;
  correctWordCount: number;
  incorrectWordCount: number;
  totalWordCount: number;
  startTime: Date;
  endTime: Date;
}

export interface VocabularyTypingQueue {
  enword: string;
  cnword: string;
  completed: boolean;    
}

export interface VocabularyTypingQueueResult {
  enword: string;
  correct: boolean;
}

export interface StudyQueueItem {
  enword: string;
  cnword: string;
  audiofile: string;
  rating: number;
  itemId?: number;
};

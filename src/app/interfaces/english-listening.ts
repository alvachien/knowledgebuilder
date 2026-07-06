import type { QuestionBankItemCombinedInterface } from './questionbank-base';

export interface EnglishListeningExerciseItem extends QuestionBankItemCombinedInterface {
  /** Marker for English listening exercise item */
  exerciseType?: 'listening';
}

// English listening section exercise,
export interface EnglishListeningExercise {
  title: string;
  item?: EnglishListeningExerciseItem;
  scripts?: string[];
  hints?: string[];
}

// English Listening section, consists of multiple exercises
export interface EnglishListeningSection {
  title: string;
  vocabulary?: string[];
  exercises?: EnglishListeningExercise[];
}

// English Listening lesson, consists of multiple sections
export interface EnglishListeningLesson {
  title: string;
  audioFile?: string;
  audioFolder?: string;
  sections: EnglishListeningSection[];
  supplementary?: string[];
}

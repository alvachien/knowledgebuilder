import { FormControl } from '@angular/forms';

import type {
  QuestionBankContentFormatKeys,
  QuestionBankItemAudioReference,
  QuestionBankItemOption,
  QuestionBankTypeKeys,
  ValidOptionKeys,
} from './questionbank';
import {
  QuestionBankContentFormatEnum,
  QuestionBankItemLevelEnum,
  QuestionBankTypeEnum,
  VALID_OPTION_KEYS,
} from './questionbank';
import type { SelectionModeEnum } from './ui-common';
import { hasChinese, replaceAtSymbols } from './ui-common';

export const getQuestionBankTypeDescription = (itemType: QuestionBankTypeEnum): string => {
  switch (itemType) {
    case QuestionBankTypeEnum.SingleChoice:
      return '单选题';
    case QuestionBankTypeEnum.MultipleChoice:
      return '多选题';
    case QuestionBankTypeEnum.FillInTheBlank:
      return '填空题';
    case QuestionBankTypeEnum.Dictation:
      return '默写';
    case QuestionBankTypeEnum.ShortAnswer:
      return '简答题';
    case QuestionBankTypeEnum.TrueFalse:
      return '判断题';
    case QuestionBankTypeEnum.Essay:
      return '作文';
    case QuestionBankTypeEnum.ReadingComprehension:
      return '阅读理解';
    case QuestionBankTypeEnum.ListeningComprehension:
      return '听力理解';
    case QuestionBankTypeEnum.Cloze:
      return '完形填空';
    default:
      return '类型错误';
  }
};

export const getAllQuestionBankTypes = (): Map<QuestionBankTypeEnum, string> => {
  const map = new Map<QuestionBankTypeEnum, string>();
  map.set(
    QuestionBankTypeEnum.SingleChoice,
    getQuestionBankTypeDescription(QuestionBankTypeEnum.SingleChoice)
  );
  map.set(
    QuestionBankTypeEnum.MultipleChoice,
    getQuestionBankTypeDescription(QuestionBankTypeEnum.MultipleChoice)
  );
  map.set(
    QuestionBankTypeEnum.FillInTheBlank,
    getQuestionBankTypeDescription(QuestionBankTypeEnum.FillInTheBlank)
  );
  map.set(
    QuestionBankTypeEnum.Dictation,
    getQuestionBankTypeDescription(QuestionBankTypeEnum.Dictation)
  );
  map.set(
    QuestionBankTypeEnum.ShortAnswer,
    getQuestionBankTypeDescription(QuestionBankTypeEnum.ShortAnswer)
  );
  map.set(
    QuestionBankTypeEnum.TrueFalse,
    getQuestionBankTypeDescription(QuestionBankTypeEnum.TrueFalse)
  );
  map.set(QuestionBankTypeEnum.Essay, getQuestionBankTypeDescription(QuestionBankTypeEnum.Essay));
  map.set(
    QuestionBankTypeEnum.ReadingComprehension,
    getQuestionBankTypeDescription(QuestionBankTypeEnum.ReadingComprehension)
  );
  map.set(
    QuestionBankTypeEnum.ListeningComprehension,
    getQuestionBankTypeDescription(QuestionBankTypeEnum.ListeningComprehension)
  );
  map.set(QuestionBankTypeEnum.Cloze, getQuestionBankTypeDescription(QuestionBankTypeEnum.Cloze));
  return map;
};

// Question bank item - base
export abstract class QuestionBankItemBase<T> {
  // ID - normally the UUID
  abstract id: string;
  // Order in the form
  abstract order: number;
  // Type
  abstract itemType: QuestionBankTypeEnum;
  // Audio reference
  audioReference?: QuestionBankItemAudioReference;
  // Answer (for single answer)
  abstract answer?: T;
  // Answers (for multiple answers, dictation, short answer)
  abstract answers?: T[];
  // Hint of answer
  hintofanswer?: T;
  // Images
  images?: string[];

  // Refer to another item
  // Most use case is, construct the reading comprehension questions.
  referToID?: string;

  // Items - only for Reading comprehension, Listening comprehension, Cloze
  items?: QuestionBankItemBase<T>[];

  // Tags
  tags?: string[];

  // Extra information - additional notes or metadata
  extraInfo?: string[];

  // Difficulty level (optional) - integer value
  difficulty?: number;

  // Suggested completion time in minutes (optional) - integer value
  suggestedCompletionTime?: number;

  // Get the form controls for the question. It will be used to create the form group.
  abstract getFormControls(): Record<string, FormControl>;
  // Has answer
  abstract hasAnswer(): boolean;
  // Get answer
  abstract getAnswers(): T[] | undefined;

  // Has hint of answer (checks own hint and sub-items)
  hasHintOfAnswer(): boolean {
    return !!this.hintofanswer;
  }

  // Get hint of answer items: { id, question, hint } for display
  getHintsOfAnswer(): Array<{ id: string; question: string; hint: string }> {
    if (this.hintofanswer) {
      return [{ id: this.id, question: '', hint: String(this.hintofanswer) }];
    }
    return [];
  }

  // Is the question support Latex format
  isLatexSupported(): boolean {
    return false; // Default is false
  }

  // Get the description of item type
  getItemTypeDescription(): string {
    return getQuestionBankTypeDescription(this.itemType);
  }

  // Record items
  reorderSubItems() {}
}

export interface QuestionBankItemFillInTheBlankParagraphPart {
  contentType: 'label' | 'input';
  // Label of input control, it will be used to create the form group.
  label?: string;
  // Input length, it will be used to control the length of the input
  inputlength?: number;
  // Key of input control, it will be used to create the form group.
  key?: string;
  // Postfix string - only for the dictation (add after each input).
  postfix?: string;
  // Value of input control, it is the expected answer
  answer?: string;
}

export interface QuestionBankItemFillInTheBlankParagraph {
  parts: QuestionBankItemFillInTheBlankParagraphPart[];
}

// Question bank item - Fill in the blank
export class QuestionBankItemFillInTheBlank extends QuestionBankItemBase<string> {
  // ID
  id: string;
  // Type
  itemType: QuestionBankTypeEnum = QuestionBankTypeEnum.FillInTheBlank;
  // Order in the form
  order: number;
  // Question with format and the answers are surrounded with character '@' in the question text.
  // Specially, the `\n` will split the question text into multiple lines.
  question: string;
  // Question text format. Default is Text.
  questionFormat?: QuestionBankContentFormatKeys;

  // Answer
  answer?: string;
  // Answers - required for Dictation
  answers?: string[];
  _countOfInputs = 0;

  override isLatexSupported(): boolean {
    return this.questionFormat === QuestionBankContentFormatEnum.WithLatex;
  }

  constructor(
    options: {
      id: string;
      order: number;
      question: string;
      questionFormat?: QuestionBankContentFormatKeys;
      answer?: string;
      answers?: string[];
      refToID?: string;
      tags?: string[];
    } = {
      id: '',
      order: 1,
      question: '',
      questionFormat: 'Text',
    }
  ) {
    super();
    this.id = options.id;
    this.order = options.order;
    this.question = options.question;
    this.tags = options.tags;
    this.questionFormat = options.questionFormat;
    this.answer = options.answer;
    this.answers = options.answers;
    this.referToID = options.refToID;
  }

  // Runtime info
  private _paragraphes: QuestionBankItemFillInTheBlankParagraph[] = [];
  get paragraphes(): QuestionBankItemFillInTheBlankParagraph[] {
    if (this._paragraphes.length === 0) {
      const sublines = this.question.split('\n');
      if (sublines.length === 1) {
        const graph: QuestionBankItemFillInTheBlankParagraph = { parts: [] };
        this._createQuestionFillInTheBlankLine(sublines[0], 0, graph);
        this._paragraphes.push(graph);
      } else {
        sublines.forEach((sstr, lindex) => {
          const graph: QuestionBankItemFillInTheBlankParagraph = { parts: [] };
          this._createQuestionFillInTheBlankLine(sstr, lindex, graph);
          this._paragraphes.push(graph);
        });
      }
    }

    return this._paragraphes;
  }

  override getFormControls() {
    const group: Record<string, FormControl> = {};
    this.paragraphes.forEach(graph => {
      graph.parts.forEach(part => {
        if (part.contentType === 'input') {
          group[part.key!] = new FormControl('');
        }
      });
    });

    return group;
  }

  private _createQuestionFillInTheBlankLine(
    strline: string,
    lindex: number,
    graph: QuestionBankItemFillInTheBlankParagraph
  ) {
    const subcontents = strline.split('@');
    const hasChineseInQuestion = hasChinese(strline);
    subcontents.forEach((scontr, idx) => {
      if (idx % 2 === 0) {
        graph.parts.push({ contentType: 'label', label: scontr });
      } else {
        if (scontr.length === 0) {
          console.error(`The ${idx}th input in line ${lindex} of question ${this.id} is empty.`);
        }
        graph.parts.push({
          contentType: 'input',
          inputlength: hasChineseInQuestion ? 2 * scontr.length : scontr.length,
          key: `${this.id}_${lindex}_${idx}`,
          answer: scontr,
        });
      }
    });
  }

  override getAnswers(): string[] | undefined {
    const answerList: string[] = [];
    this.paragraphes.forEach(graph => {
      graph.parts.forEach(part => {
        if (part.contentType === 'input' && part.answer) {
          answerList.push(part.answer);
        }
      });
    });
    return answerList;
  }

  override hasAnswer(): boolean {
    return doesQuestionBankItemHasAnswer(this);
  }
}

// Question bank item - Single choice
export class QuestionBankItemSingleChoice extends QuestionBankItemBase<string> {
  // ID
  id: string;
  // Type
  itemType: QuestionBankTypeEnum = QuestionBankTypeEnum.SingleChoice;
  // Order in the form
  order: number;
  // Question with format and the answers are surrounded with character '@' in the question text.
  // Specially, the `\n` will split the question text into multiple lines.
  question: string;
  // Question text format. Default is Text.
  questionFormat?: QuestionBankContentFormatKeys;
  // Options. Available for MultipleChoice and SingleChoice.
  options: QuestionBankItemOption;

  // Answer
  answer?: string;
  // Answers
  answers?: string[];

  override isLatexSupported(): boolean {
    if (this.questionFormat === QuestionBankContentFormatEnum.WithLatex) {
      return true;
    } else {
      return false;
    }
  }

  constructor(
    options: {
      id: string;
      order: number;
      question: string;
      questionFormat?: QuestionBankContentFormatKeys;
      options: QuestionBankItemOption;
      answer?: string;
      hintofanswer?: string;
      refToID?: string;
      tags?: string[];
    } = {
      id: '',
      order: 1,
      question: '',
      options: {},
      questionFormat: 'Text',
    }
  ) {
    super();
    this.id = options.id;
    this.order = options.order;
    this.question = options.question;
    this.tags = options.tags;
    this.questionFormat = options.questionFormat;
    this.options = options.options;
    this.answer = options.answer;
    this.hintofanswer = options.hintofanswer;
    this.referToID = options.refToID;
  }

  override getFormControls() {
    const group: Record<string, FormControl> = {};
    group[this.id] = new FormControl('');
    return group;
  }

  override hasAnswer(): boolean {
    return doesQuestionBankItemHasAnswer(this);
  }

  override getAnswers(): string[] | undefined {
    if (this.answer) {
      const rst = [this.answer];
      // if (this.hintofanswer) {
      // 	rst.push(this.hintofanswer);
      // }
      return rst;
    }
    return undefined;
  }
}

// Question bank item - Multiple choices
export class QuestionBankItemMultipleChoice extends QuestionBankItemBase<string> {
  // ID
  id: string;
  // Type
  itemType: QuestionBankTypeEnum = QuestionBankTypeEnum.MultipleChoice;
  // Order in the form
  order: number;
  // Question with format and the answers are surrounded with character '@' in the question text.
  // Specially, the `\n` will split the question text into multiple lines.
  question: string;
  // Question text format. Default is Text.
  questionFormat?: QuestionBankContentFormatKeys;
  // Options. Available for MultipleChoice and SingleChoice.
  options: QuestionBankItemOption;

  // Answer
  answer?: string;
  // Answers
  answers?: string[];

  override isLatexSupported(): boolean {
    if (this.questionFormat === QuestionBankContentFormatEnum.WithLatex) {
      return true;
    } else {
      return false;
    }
  }

  constructor(
    options: {
      id: string;
      order: number;
      question: string;
      questionFormat?: QuestionBankContentFormatKeys;
      options: QuestionBankItemOption;
      answers?: string[];
      hintofanswer?: string;
      refToID?: string;
      tags?: string[];
    } = {
      id: '',
      order: 1,
      question: '',
      options: {},
      questionFormat: 'Text',
    }
  ) {
    super();
    this.id = options.id;
    this.order = options.order;
    this.question = options.question;
    this.tags = options.tags;
    this.questionFormat = options.questionFormat;
    this.options = options.options;
    this.answers = options.answers;
    this.hintofanswer = options.hintofanswer;
    this.referToID = options.refToID;
  }

  override getFormControls() {
    const group: Record<string, FormControl> = {};
    (Object.keys(VALID_OPTION_KEYS) as ValidOptionKeys[]).forEach(key => {
      if (this.options && this.options[key] !== undefined) {
        // Check option exists
        group[`${this.id}-${key.toString()}`] = new FormControl();
      }
    });
    return group;
  }

  override hasAnswer(): boolean {
    return doesQuestionBankItemHasAnswer(this);
  }

  override getAnswers(): string[] | undefined {
    return this.answers;
  }
}

// Question bank item - Dictation
export class QuestionBankItemDictation extends QuestionBankItemBase<string> {
  // ID
  id: string;
  // Type
  itemType: QuestionBankTypeEnum = QuestionBankTypeEnum.Dictation;
  // Order in the form
  order: number;
  // Question will be the title.
  question: string;
  // Question level
  questionLevel: QuestionBankItemLevelEnum;

  // Answer
  answer?: string;
  // Answers
  answers?: string[];

  // Runtime info
  private _countOfInputs = 0;
  get countOfInputs(): number {
    return this._countOfInputs;
  }

  constructor(
    options: {
      id: string;
      order: number;
      question: string;
      questionLevel: QuestionBankItemLevelEnum;
      answers?: string[];
      tags?: string[];
    } = {
      id: '',
      order: 1,
      question: '',
      questionLevel: QuestionBankItemLevelEnum.Full,
    }
  ) {
    super();
    this.id = options.id;
    this.order = options.order;
    this.question = options.question;
    this.tags = options.tags;
    this.questionLevel = options.questionLevel;
    this.answers = options.answers;
  }

  // Runtime info
  private _paragraphes: QuestionBankItemFillInTheBlankParagraph[] = [];
  get paragraphes(): QuestionBankItemFillInTheBlankParagraph[] {
    if (this._paragraphes.length === 0) {
      this.answers?.forEach((answer, indx) => {
        const graph: QuestionBankItemFillInTheBlankParagraph = { parts: [] };
        this._createQuestionFillInTheBlankLine(answer, indx, graph);
        this._paragraphes.push(graph);
      });

      // After the initial setup, adjust the input based on the level
      if (this.questionLevel !== QuestionBankItemLevelEnum.Full) {
        this._adjustQueueByLevel();
      }
    }

    return this._paragraphes;
  }

  override getFormControls() {
    const group: Record<string, FormControl> = {};

    this.paragraphes.forEach(graph => {
      graph.parts.forEach(part => {
        if (part.contentType === 'input') {
          group[part.key!] = new FormControl('');
        }
      });
    });

    return group;
  }

  private _adjustQueueByLevel() {
    if (this.questionLevel === QuestionBankItemLevelEnum.Full) {
      return;
    }

    // Step 1: Calculate the total elements, and collect their coordinates [i, j]
    let totalElements = 0;
    const positions = []; // Stores the position  [i, j]
    for (let i = 0; i < this._paragraphes.length; i++) {
      for (let j = 0; j < this._paragraphes[i].parts.length; j++) {
        if (this._paragraphes[i].parts[j].contentType === 'input') {
          positions.push([i, j]);
          totalElements++;
        }
      }
    }

    // Step 2: Calculate the elements to be kept, rounding
    let percent = 0;
    if (this.questionLevel === QuestionBankItemLevelEnum.Easy) {
      percent = 20; // 20%
    } else if (this.questionLevel === QuestionBankItemLevelEnum.Medium) {
      percent = 50; // 50%
    } else if (this.questionLevel === QuestionBankItemLevelEnum.Hard) {
      percent = 80; // 100%
    }
    const keepCount = Math.round((totalElements * percent) / 100);

    // Step 3: Calculate the randomized positions (Use Fisher-Yates Algorithm)
    const shuffled = [...positions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selectedPositions = new Set(
      shuffled.slice(0, keepCount).map(pos => `${pos[0]},${pos[1]}`)
    );

    // Step 4: Prepare the output set
    this._countOfInputs = 0;
    for (let i = 0; i < this._paragraphes.length; i++) {
      for (let j = 0; j < this._paragraphes[i].parts.length; j++) {
        // Check current item is kept in selected positions
        if (this._paragraphes[i].parts[j].contentType === 'input') {
          if (!selectedPositions.has(`${i},${j}`)) {
            // If not in the selected positions, convert it to label
            this._paragraphes[i].parts[j].label = this._paragraphes[i].parts[j].answer;
            this._paragraphes[i].parts[j].contentType = 'label';
          } else {
            this._countOfInputs++;
          }
        }
      }
    }
  }

  private _createQuestionFillInTheBlankLine(
    strline: string,
    lindex: number,
    graph: QuestionBankItemFillInTheBlankParagraph
  ) {
    const hasChineseInQuestion = hasChinese(strline);
    let defaultSeparators = [];
    if (!hasChineseInQuestion) {
      defaultSeparators = [',', '.', '?'];
    } else {
      defaultSeparators = [
        '：“',
        '”。',
        '《',
        '》',
        ';',
        '“',
        '”',
        '，',
        '。',
        '！',
        '？',
        '、',
        '；',
      ];
    }

    // To support custom separators > not yet supported
    // const allSeparators = [...defaultSeparators, ...customSeparators]
    // 	.sort((a, b) => b.length - a.length); // 按长度降序排列

    // 创建正则表达式
    const escapedSeparators = defaultSeparators.map(sep =>
      sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const regex = new RegExp(`(${escapedSeparators.join('|')})`);

    strline
      .split(regex)
      .map(part => part.trim())
      .filter(part => part.length > 0)
      .forEach((part, itemidx) => {
        if (defaultSeparators.includes(part)) {
          graph.parts.push({ contentType: 'label', label: part });
        } else {
          graph.parts.push({
            contentType: 'input',
            inputlength: hasChineseInQuestion ? 2 * part.length : part.length,
            key: `${this.id}_${lindex}_${itemidx}`,
            answer: part,
          });
        }
      });
  }

  override getAnswers(): string[] | undefined {
    const answerList: string[] = [];
    this.paragraphes.forEach(graph => {
      graph.parts.forEach(part => {
        if (part.contentType === 'input' && part.answer) {
          answerList.push(part.answer);
        }
      });
    });
    return answerList;
  }

  override hasAnswer(): boolean {
    return doesQuestionBankItemHasAnswer(this);
  }
}

// Question bank item - Short answer
export class QuestionBankItemShortAnswer extends QuestionBankItemBase<string> {
  // ID
  id: string;
  // Type
  itemType: QuestionBankTypeEnum = QuestionBankTypeEnum.ShortAnswer;
  // Order in the form
  order: number;
  // Question will be the title.
  question: string;
  // Question text format. Default is Text.
  questionFormat?: QuestionBankContentFormatKeys;

  // Rows of answers
  rowsOfAnswers: number = 1;
  // Answer
  answer?: string;
  // Answers
  answers?: string[];

  override isLatexSupported(): boolean {
    return this.questionFormat === QuestionBankContentFormatEnum.WithLatex;
  }

  constructor(
    options: {
      id: string;
      order: number;
      question: string;
      questionFormat?: QuestionBankContentFormatKeys;
      answer?: string;
      answers?: string[];
      rowsOfAnswers?: number;
      refToID?: string;
      tags?: string[];
    } = {
      id: '',
      order: 1,
      question: '',
      questionFormat: 'Text',
      rowsOfAnswers: 1,
    }
  ) {
    super();
    this.id = options.id;
    this.order = options.order;
    this.question = options.question;
    this.tags = options.tags;
    this.questionFormat = options.questionFormat;
    this.answer = options.answer;
    this.answers = options.answers;
    this.rowsOfAnswers = options.rowsOfAnswers!;
    this.referToID = options.refToID;
  }

  override getFormControls() {
    const group: Record<string, FormControl> = {};
    group[this.id] = new FormControl('');
    return group;
  }

  override getAnswers(): string[] | undefined {
    if (this.answer) {
      return [this.answer];
    }
    return this.answers;
  }

  override hasAnswer(): boolean {
    return doesQuestionBankItemHasAnswer(this);
  }
}

// Question bank item - reading comprehension
export class QuestionBankItemReadingComprehension extends QuestionBankItemBase<string> {
  // ID
  id: string;
  // Type
  itemType: QuestionBankTypeEnum = QuestionBankTypeEnum.ReadingComprehension;
  // Order in the form
  order: number;
  // Question with format and the answers are surrounded with character '@' in the question text.
  // Specially, the `\n` will split the question text into multiple lines.
  question: string;
  // Question text format. Default is Text.
  questionFormat?: QuestionBankContentFormatKeys;
  answer?: string;
  answers?: string[];

  constructor(
    options: {
      id: string;
      order: number;
      question: string;
      tags?: string[];
      questionFormat?: QuestionBankContentFormatKeys;
      items?: QuestionBankItemCombinedInterface[];
    } = {
      id: '',
      order: 1,
      question: '',
      questionFormat: 'Text',
      items: [],
    }
  ) {
    super();
    this.id = options.id;
    this.order = options.order;
    this.question = options.question;
    this.tags = options.tags;
    this.questionFormat = options.questionFormat;
    if (options.items) {
      this.items = [];
      options.items.forEach((item, idx) => {
        const subitem = convertToQuestionBankItem(item);
        subitem.order = idx + 1;
        this.items!.push(subitem);
      });
    }
  }

  override getFormControls() {
    const totalgrp = {};
    if (this.items && this.items.length > 0) {
      this.items.forEach(qtn => {
        const grp = qtn.getFormControls();
        Object.assign(totalgrp, grp);
      });
    }

    return totalgrp;
  }

  override getAnswers(): string[] | undefined {
    if (this.items && this.items.length > 0) {
      return this.items
        .filter(item => item.hasAnswer())
        .map(item => `(${item.order}). ${item.getAnswers()?.join('；') || ''}`);
    }
    return undefined;
  }

  override hasAnswer(): boolean {
    return this.items && this.items.length > 0 ? this.items.some(item => item.hasAnswer()) : false;
  }

  override hasHintOfAnswer(): boolean {
    return this.items && this.items.length > 0 ? this.items.some(item => item.hasHintOfAnswer()) : false;
  }

  override getHintsOfAnswer(): Array<{ id: string; question: string; hint: string }> {
    if (!this.items) return [];
    return this.items
      .filter(item => item.hasHintOfAnswer())
      .flatMap(item => item.getHintsOfAnswer());
  }

  override reorderSubItems() {
    if (this.items && this.items.length > 0) {
      this.items.forEach((item, index) => {
        item.order = index + 1;
      });
    }
  }
}

// Question bank item - listening comprehension
export class QuestionBankItemListeningComprehension extends QuestionBankItemBase<string> {
  // ID
  id: string;
  // Type
  itemType: QuestionBankTypeEnum = QuestionBankTypeEnum.ListeningComprehension;
  // Order in the form
  order: number;
  // Question with format and the answers are surrounded with character '@' in the question text.
  // Specially, the `\n` will split the question text into multiple lines.
  question: string;
  // Question text format. Default is Text.
  questionFormat?: QuestionBankContentFormatKeys;
  answer?: string;
  answers?: string[];

  constructor(
    options: {
      id: string;
      order: number;
      question: string;
      tags?: string[];
      questionFormat?: QuestionBankContentFormatKeys;
      items?: QuestionBankItemCombinedInterface[];
    } = {
      id: '',
      order: 1,
      question: '',
      questionFormat: 'Text',
      items: [],
    }
  ) {
    super();
    this.id = options.id;
    this.order = options.order;
    this.question = options.question;
    this.tags = options.tags;
    this.questionFormat = options.questionFormat;
    if (options.items) {
      this.items = [];
      options.items.forEach((item, idx) => {
        const subitem = convertToQuestionBankItem(item);
        subitem.order = idx + 1;
        this.items!.push(subitem);
      });
    }
  }

  override getFormControls() {
    const totalgrp = {};
    if (this.items && this.items.length > 0) {
      this.items.forEach(qtn => {
        const grp = qtn.getFormControls();
        Object.assign(totalgrp, grp);
      });
    }

    return totalgrp;
  }

  override getAnswers(): string[] | undefined {
    if (this.items && this.items.length > 0) {
      return this.items
        .filter(item => item.hasAnswer())
        .map(item => `(${item.order}). ${item.getAnswers()?.join('；') || ''}`);
    }
    return undefined;
  }

  override hasAnswer(): boolean {
    return this.items && this.items.length > 0 ? this.items.some(item => item.hasAnswer()) : false;
  }

  override hasHintOfAnswer(): boolean {
    return this.items && this.items.length > 0 ? this.items.some(item => item.hasHintOfAnswer()) : false;
  }

  override getHintsOfAnswer(): Array<{ id: string; question: string; hint: string }> {
    if (!this.items) return [];
    return this.items
      .filter(item => item.hasHintOfAnswer())
      .flatMap(item => item.getHintsOfAnswer());
  }

  override reorderSubItems() {
    if (this.items && this.items.length > 0) {
      this.items.forEach((item, index) => {
        item.order = index + 1;
      });
    }
  }
}

// Question bank item - Cloze
export class QuestionBankItemCloze extends QuestionBankItemBase<string> {
  // ID
  id: string;
  // Type
  itemType: QuestionBankTypeEnum = QuestionBankTypeEnum.Cloze;
  // Order in the form
  order: number;
  // Question with format and the answers are surrounded with character '@' in the question text.
  // Specially, the `\n` will split the question text into multiple lines.
  question: string;
  // Question text format. Default is Text.
  questionFormat?: QuestionBankContentFormatKeys;
  answer?: string;
  answers?: string[];

  constructor(
    options: {
      id: string;
      order: number;
      question: string;
      tags?: string[];
      questionFormat?: QuestionBankContentFormatKeys;
      items?: QuestionBankItemCombinedInterface[];
    } = {
      id: '',
      order: 1,
      question: '',
      questionFormat: 'Text',
      items: [],
    }
  ) {
    super();
    this.id = options.id;
    this.order = options.order;
    this.question = options.question;
    this.tags = options.tags;
    this.questionFormat = options.questionFormat;
    if (options.items) {
      this.items = [];
      options.items.forEach((item, idx) => {
        const subitem = convertToQuestionBankItem(item);
        subitem.order = idx + 1;
        this.items!.push(subitem);
      });
    }
  }

  override getFormControls() {
    const totalgrp = {};
    if (this.items && this.items.length > 0) {
      this.items.forEach(qtn => {
        const grp = qtn.getFormControls();
        Object.assign(totalgrp, grp);
      });
    }

    return totalgrp;
  }

  override getAnswers(): string[] | undefined {
    if (this.items && this.items.length > 0) {
      return this.items
        .filter(item => item.hasAnswer())
        .map(item => `(${item.order}). ${item.getAnswers()?.join('；') || ''}`);
    }
    return undefined;
  }

  override hasAnswer(): boolean {
    return this.items && this.items.length > 0 ? this.items.some(item => item.hasAnswer()) : false;
  }

  override hasHintOfAnswer(): boolean {
    return this.items && this.items.length > 0 ? this.items.some(item => item.hasHintOfAnswer()) : false;
  }

  override getHintsOfAnswer(): Array<{ id: string; question: string; hint: string }> {
    if (!this.items) return [];
    return this.items
      .filter(item => item.hasHintOfAnswer())
      .flatMap(item => item.getHintsOfAnswer());
  }

  override reorderSubItems() {
    if (this.items && this.items.length > 0) {
      this.items.forEach((item, index) => {
        item.order = index + 1;
      });
    }
  }
}

// Question bank item - true false
export class QuestionBankItemTrueFalse extends QuestionBankItemBase<string> {
  // ID
  id: string;
  // Type
  itemType: QuestionBankTypeEnum = QuestionBankTypeEnum.TrueFalse;
  // Order in the form
  order: number;
  // Question with format and the answers are surrounded with character '@' in the question text.
  // Specially, the `\n` will split the question text into multiple lines.
  question: string;
  // Question text format. Default is Text.
  questionFormat?: QuestionBankContentFormatKeys;

  // Answer
  answer?: string;
  // Answers
  answers?: string[];

  override isLatexSupported(): boolean {
    return this.questionFormat === QuestionBankContentFormatEnum.WithLatex;
  }

  constructor(
    options: {
      id: string;
      order: number;
      question: string;
      questionFormat?: QuestionBankContentFormatKeys;
      answer?: boolean;
      tags?: string[];
      refToID?: string;
    } = {
      id: '',
      order: 1,
      question: '',
      questionFormat: 'Text',
    }
  ) {
    super();
    this.id = options.id;
    this.order = options.order;
    this.question = options.question;
    this.questionFormat = options.questionFormat;
    this.answer = options.answer ? '1' : '0';
    this.tags = options.tags;
    this.referToID = options.refToID;
  }

  override getFormControls() {
    const group: Record<string, FormControl> = {};
    group[this.id] = new FormControl(false);
    return group;
  }

  override getAnswers(): string[] | undefined {
    if (this.answer === '1') {
      return ['True'];
    } else if (this.answer === '0') {
      return ['False'];
    }

    return undefined;
  }

  override hasAnswer(): boolean {
    return doesQuestionBankItemHasAnswer(this);
  }
}

// Question bank item - Essay
export class QuestionBankItemEssay extends QuestionBankItemBase<string> {
  // ID
  id: string;
  // Type
  itemType: QuestionBankTypeEnum = QuestionBankTypeEnum.Essay;
  // Order in the form
  order: number;
  // Question will be the title.
  question: string;
  // Question text format. Default is Text.
  questionFormat?: QuestionBankContentFormatKeys;

  // Rows of answers
  rowsOfAnswers: number = 1;
  // Answer
  answer?: string;
  // Answers
  answers?: string[];

  override isLatexSupported(): boolean {
    return this.questionFormat === QuestionBankContentFormatEnum.WithLatex;
  }

  constructor(
    options: {
      id: string;
      order: number;
      question: string;
      tags?: string[];
      questionFormat?: QuestionBankContentFormatKeys;
      answers?: string[];
      rowsOfAnswers?: number;
      refToID?: string;
    } = {
      id: '',
      order: 1,
      question: '',
      questionFormat: 'Text',
      rowsOfAnswers: 80,
    }
  ) {
    super();
    this.id = options.id;
    this.order = options.order;
    this.question = options.question;
    this.questionFormat = options.questionFormat;
    this.answers = options.answers;
    this.tags = options.tags;
    this.rowsOfAnswers = options.rowsOfAnswers!;
    this.referToID = options.refToID;
  }

  override hasAnswer(): boolean {
    return doesQuestionBankItemHasAnswer(this);
  }

  override getFormControls() {
    const group: Record<string, FormControl> = {};
    group[this.id] = new FormControl('');
    return group;
  }

  override getAnswers(): string[] | undefined {
    if (this.answer) {
      return [this.answer];
    }
    return this.answers;
  }
}

export interface QuestionBankItemCombinedInterface {
  /** 题目唯一标识ID */
  id: string;
  /** 题目排序序号 */
  order?: number;
  /** 题目类型枚举值。有： TrueFalse, SingleChoice, MultipleChoice, Dictation, FillInTheBlank, ShortAnswer, Essay, ReadingComprehension, ListeningComprehension, Cloze */
  itemType: QuestionBankTypeEnum;
  /** 音频引用信息（可选），具体有：audioFile （文件路径）, startTime (开始的秒数，数字)，endTime (结束的秒数，数字)，audioScripts (音频脚本，字符串的列表) */
  audioReference?: QuestionBankItemAudioReference;
  /** 题目答案（单值，适用于填空题/判断题等）。 */
  answer?: string;
  /** 题目答案数组（适用于多选题/听写题等）。 */
  answers?: string[];
  /** Hint of answer */
  hintofanswer?: string;
  /** 题目标签数组（可选） */
  tags?: string[];
  /** 题目关联的图片URL列表（可选） */
  images?: string[];
  /** 引用的其他题目ID */
  referToID?: string;
  /** 题目文本内容（适用于填空题/选择题等） */
  question?: string;
  /** 题目内容格式：Text（普通文本）， WithLatex（包含Latex公式的文本） */
  questionFormat?: QuestionBankContentFormatKeys;
  /** 选择题选项配置（适用于单选/多选题），示例：{'A': 'test'}。 */
  options?: QuestionBankItemOption;
  /** 题目难度等级（适用于听写题等）：Easy, Medium, Hard */
  questionLevel?: QuestionBankItemLevelEnum;
  /** 答案输入框行数（适用于简答题/作文题） */
  rowsOfAnswers?: number;

  /** 子项目（适用于阅读理解/听力理解/完形填空） */
  items?: QuestionBankItemCombinedInterface[];

  /** Extra information - additional notes or metadata */
  extraInfo?: string[];

  /** Difficulty level (optional) - integer value */
  difficulty?: number;

  /** Suggested completion time in minutes (optional) - integer value */
  suggestedCompletionTime?: number;
}

// Conver QuestionBankItemCombinedInterface
export function convertToQuestionBankItem(
  item: QuestionBankItemCombinedInterface
): QuestionBankItemBase<string> {
  let baseItem: QuestionBankItemBase<string>;

  switch (item.itemType) {
    case QuestionBankTypeEnum.SingleChoice:
      baseItem = new QuestionBankItemSingleChoice({
        id: item.id,
        order: item.order || 1,
        question: item.question || '',
        questionFormat: item.questionFormat,
        options: item.options || {},
        answer: item.answer,
        hintofanswer: item.hintofanswer,
        tags: item.tags,
        refToID: item.referToID,
      });
      break;
    case QuestionBankTypeEnum.MultipleChoice:
      baseItem = new QuestionBankItemMultipleChoice({
        id: item.id,
        order: item.order || 1,
        question: item.question || '',
        questionFormat: item.questionFormat,
        options: item.options || {},
        answers: item.answers,
        hintofanswer: item.hintofanswer,
        refToID: item.referToID,
        tags: item.tags,
      });
      break;
    case QuestionBankTypeEnum.FillInTheBlank:
      baseItem = new QuestionBankItemFillInTheBlank({
        id: item.id,
        order: item.order || 1,
        question: item.question || '',
        questionFormat: item.questionFormat,
        answer: item.answer,
        answers: item.answers,
        refToID: item.referToID,
        tags: item.tags,
      });
      break;
    case QuestionBankTypeEnum.Dictation:
      baseItem = new QuestionBankItemDictation({
        id: item.id,
        order: item.order || 1,
        question: item.question || '',
        questionLevel: item.questionLevel || QuestionBankItemLevelEnum.Full,
        answers: item.answers,
        tags: item.tags,
      });
      break;
    case QuestionBankTypeEnum.ShortAnswer:
      baseItem = new QuestionBankItemShortAnswer({
        id: item.id,
        order: item.order || 1,
        question: item.question || '',
        questionFormat: item.questionFormat,
        rowsOfAnswers: item.rowsOfAnswers || 1,
        answer: item.answer,
        answers: item.answers,
        refToID: item.referToID,
        tags: item.tags,
      });
      break;
    case QuestionBankTypeEnum.Essay:
      baseItem = new QuestionBankItemEssay({
        id: item.id,
        order: item.order || 1,
        question: item.question || '',
        questionFormat: item.questionFormat,
        rowsOfAnswers: item.rowsOfAnswers || 20, // Default for Essay
        answers: item.answers,
        refToID: item.referToID,
        tags: item.tags,
      });
      break;
    case QuestionBankTypeEnum.ReadingComprehension:
      baseItem = new QuestionBankItemReadingComprehension({
        id: item.id,
        order: item.order || 1,
        question: item.question || '',
        questionFormat: item.questionFormat,
        tags: item.tags,
        items: item.items || [],
      });
      break;
    case QuestionBankTypeEnum.ListeningComprehension:
      baseItem = new QuestionBankItemListeningComprehension({
        id: item.id,
        order: item.order || 1,
        question: item.question || '',
        questionFormat: item.questionFormat,
        tags: item.tags,
        items: item.items || [],
      });
      break;
    case QuestionBankTypeEnum.Cloze:
      baseItem = new QuestionBankItemCloze({
        id: item.id,
        order: item.order || 1,
        question: item.question || '',
        questionFormat: item.questionFormat,
        tags: item.tags,
        items: item.items || [],
      });
      break;
    case QuestionBankTypeEnum.TrueFalse:
      baseItem = new QuestionBankItemTrueFalse({
        id: item.id,
        order: item.order || 1,
        question: item.question || '',
        questionFormat: item.questionFormat,
        answer: item.answer === '1', // Convert to boolean
        tags: item.tags,
        refToID: item.referToID,
      });
      break;
    default:
      throw new Error('Failed');
  }

  // Assign extended properties
  if (item.extraInfo) {
    baseItem.extraInfo = item.extraInfo;
  }
  if (item.hintofanswer) {
    baseItem.hintofanswer = item.hintofanswer;
  }
  if (item.difficulty !== undefined) {
    baseItem.difficulty = item.difficulty;
  }
  if (item.suggestedCompletionTime !== undefined) {
    baseItem.suggestedCompletionTime = item.suggestedCompletionTime;
  }

  return baseItem;
}

// Interface used for knowledge exercise list page
//   In that page, no need to convert the content to real exercise, but it need following UI fields
//		1. Display string of item type
//		2. Has answer -  Whether the item has answer
//   The conversion will be done after the selection
export interface KnowledgeExerciseFileContent extends QuestionBankItemCombinedInterface {
  itemTypeString?: string;
  hasAnswer?: boolean;
}

export interface KnowledgeExercisePrintOption {
  formTitle: string;
  printEntryDate: boolean;
  printScore: boolean;
  printAnswer: boolean;
  printHintOfAnswer: boolean;
  printID: boolean;
  hideLabelOfQuestionType: QuestionBankTypeKeys[];
  shuffleOptionsInSelection?: boolean;
  // When true, FillInTheBlank blanks render at a fixed uniform width that does not
  // reflect the answer content's length (vocabulary prints).
  uniformBlankLength?: boolean;
  // Width (in &nbsp; cells) of the uniform blank when `uniformBlankLength` is true.
  // Defaults to `DEFAULT_UNIFORM_BLANK_LENGTH` (30) and floored to `MIN_UNIFORM_BLANK_LENGTH` (10)
  // by the converter; raise it for long words.
  uniformBlankLengthSize?: number;
  // When true, the answer key renders each item's answer on its own line
  // (line break between items instead of an inline em-space). Used by Chinese
  // recite prints so multi-item answer keys are not run together on one line.
  answerLineBreakPerItem?: boolean;
}

export interface KnowledgeExerciseSelectOption {
  selectedSelectMode: SelectionModeEnum;
  importIDs?: string;
  countOfItems?: number;
  filterOnTag?: string;
}

// Check item has answer or not
// 1. Fill in the blank always has the answer
export const doesQuestionBankItemHasAnswer = (item: {
  itemType: QuestionBankTypeEnum;
  answer?: string;
  answers?: string[];
  items?: QuestionBankItemCombinedInterface[];
}): boolean => {
  if (item.itemType === QuestionBankTypeEnum.FillInTheBlank) {
    return true;
  }

  if (
    item.itemType === QuestionBankTypeEnum.ReadingComprehension ||
    item.itemType === QuestionBankTypeEnum.ListeningComprehension ||
    item.itemType === QuestionBankTypeEnum.Cloze
  ) {
    if (item.items && item.items.length > 0) {
      return item.items.some(innerItem => doesQuestionBankItemHasAnswer(innerItem));
    }
    return false;
  }

  return (item.answer && item.answer.trim() !== '') ||
    (item.answers && item.answers.length > 0 && item.answers.some(ans => ans.trim() !== ''))
    ? true
    : false;
};

export const shuffleQuestionBankItemOption = (
  options: QuestionBankItemOption
): {
  newoptions: QuestionBankItemOption;
  keyMapping: Record<string, string>;
} => {
  // 提取原始的keys和values
  const originalKeys = Object.keys(options);
  const originalValues = Object.values(options);

  // 随机打乱values数组
  const shuffledValues = [...originalValues];
  for (let i = shuffledValues.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledValues[i], shuffledValues[j]] = [shuffledValues[j], shuffledValues[i]];
  }

  // 创建新的options对象
  const newOptions: Record<string, string> = {};
  for (let i = 0; i < originalKeys.length; i++) {
    newOptions[originalKeys[i]] = shuffledValues[i];
  }

  // 创建映射表：原始key -> 新value对应的原始key
  const mapping: Record<string, string> = {};
  for (let i = 0; i < originalKeys.length; i++) {
    // 找到新value在原始values中的位置
    const originalValueIndex = originalValues.indexOf(shuffledValues[i]);
    const originalKey = originalKeys[originalValueIndex];
    mapping[originalKey] = originalKeys[i].toString();
  }

  return {
    newoptions: newOptions,
    keyMapping: mapping,
  };
};

export const convertQuestionBankItemToMarkdown = (
  item: QuestionBankItemBase<string>,
  hideLabelOfQuestionType?: QuestionBankTypeKeys[],
  printID = false,
  uniformBlankLength = false,
  uniformBlankLengthSize?: number
): string => {
  let rst = '';

  switch (item.itemType) {
    case QuestionBankTypeEnum.SingleChoice:
      rst = convertSingleChoiceToMarkdown(
        item as QuestionBankItemSingleChoice,
        undefined,
        hideLabelOfQuestionType,
        printID
      );
      break;
    case QuestionBankTypeEnum.FillInTheBlank:
      rst = convertFillInTheBlankToMarkdown(
        item as QuestionBankItemFillInTheBlank,
        undefined,
        hideLabelOfQuestionType,
        printID,
        uniformBlankLength,
        uniformBlankLengthSize
      );
      break;
    case QuestionBankTypeEnum.MultipleChoice:
      rst = convertMultipleChoiceToMarkdown(
        item as QuestionBankItemMultipleChoice,
        undefined,
        hideLabelOfQuestionType,
        printID
      );
      break;
    case QuestionBankTypeEnum.Dictation:
      rst = convertDictationToMarkdown(
        item as QuestionBankItemDictation,
        hideLabelOfQuestionType,
        printID
      );
      break;
    case QuestionBankTypeEnum.ShortAnswer:
      rst = convertShortAnswerToMarkdown(
        item as QuestionBankItemShortAnswer,
        undefined,
        hideLabelOfQuestionType,
        printID
      );
      break;
    case QuestionBankTypeEnum.TrueFalse:
      rst = convertTrueFalseToMarkdown(
        item as QuestionBankItemTrueFalse,
        undefined,
        hideLabelOfQuestionType,
        printID
      );
      break;
    case QuestionBankTypeEnum.Cloze:
      rst = convertComprehensionToMarkdown(
        item as QuestionBankItemCloze,
        hideLabelOfQuestionType,
        printID
      );
      break;
    case QuestionBankTypeEnum.ReadingComprehension:
      rst = convertComprehensionToMarkdown(
        item as QuestionBankItemReadingComprehension,
        hideLabelOfQuestionType,
        printID
      );
      break;
    case QuestionBankTypeEnum.ListeningComprehension:
      rst = convertComprehensionToMarkdown(
        item as QuestionBankItemListeningComprehension,
        hideLabelOfQuestionType,
        printID
      );
      break;
    default:
      break;
  }

  return rst;
};

export const convertQuestionBankItemAnswerToMarkdown = (
  item: QuestionBankItemBase<string>
): string => {
  let rst = '';
  switch (item.itemType) {
    case QuestionBankTypeEnum.SingleChoice:
      {
        const scitem = item as QuestionBankItemSingleChoice;
        rst = `*${scitem.order}*. ${scitem.getAnswers()?.join(', ') || ''}`;
      }
      break;
    case QuestionBankTypeEnum.MultipleChoice:
      {
        const mcitem = item as QuestionBankItemMultipleChoice;
        rst = `*${mcitem.order}*. ${mcitem.getAnswers()?.join(', ') || ''}`;
      }
      break;
    case QuestionBankTypeEnum.FillInTheBlank:
      {
        const fbitem = item as QuestionBankItemFillInTheBlank;
        rst = `*${fbitem.order}*. ${fbitem.getAnswers()?.join(', ') || ''}`;
      }
      break;
    case QuestionBankTypeEnum.Dictation:
      {
        const dtitem = item as QuestionBankItemDictation;
        rst = `*${dtitem.order}*. ${dtitem.getAnswers()?.join(', ') || ''}`;
      }
      break;
    case QuestionBankTypeEnum.ShortAnswer:
      {
        const saitem = item as QuestionBankItemShortAnswer;
        rst = `*${saitem.order}*. ${saitem.getAnswers()?.join(', ') || ''}`;
      }
      break;
    case QuestionBankTypeEnum.TrueFalse:
      {
        const tfitem = item as QuestionBankItemTrueFalse;
        rst = `*${tfitem.order}*. ${tfitem.getAnswers()?.join(', ') || ''}`;
      }
      break;
    case QuestionBankTypeEnum.Cloze:
      {
        rst = convertComprehensionAnswerToMarkdown(item as QuestionBankItemCloze, item.order);
      }
      break;
    case QuestionBankTypeEnum.ReadingComprehension:
      {
        rst = convertComprehensionAnswerToMarkdown(
          item as QuestionBankItemReadingComprehension,
          item.order
        );
      }
      break;
    case QuestionBankTypeEnum.ListeningComprehension:
      {
        rst = convertComprehensionAnswerToMarkdown(
          item as QuestionBankItemListeningComprehension,
          item.order
        );
      }
      break;
    default:
      break;
  }
  return rst;
};

export const convertSingleChoiceToMarkdown = (
  item: QuestionBankItemSingleChoice,
  parentOrder?: number,
  hideLabelOfQuestionType?: QuestionBankTypeKeys[],
  printID = false
): string => {
  let rst = `${parentOrder ? '&emsp;' : ''} **${parentOrder ? parentOrder + '.' + item.order : item.order}.** ${hideLabelOfQuestionType?.includes(item.itemType as QuestionBankTypeKeys) ? '' : '【' + item.getItemTypeDescription() + '】'}${printID ? '(*' + item.id + '*) ' : ' '}${item.question.replaceAll('_', '\\_')}\n`;
  const options = item.options || {};
  for (const opt of Object.keys(options)) {
    const val = options[opt as keyof typeof options] ?? '';
    rst += `${parentOrder ? '&emsp;' : ''}&emsp; *${opt}*. ${val} `;
  }
  return rst + '\n';
};

// Minimum width (in &nbsp; cells) for the user-configurable `uniformBlankLengthSize`.
// The converter floors any smaller value at this number so blanks never get too short.
export const MIN_UNIFORM_BLANK_LENGTH = 10;

// Default width (in &nbsp; cells) used for FillInTheBlank blanks when the print option
// requests a uniform blank that does not reveal the answer's length (vocabulary prints).
// Used when `uniformBlankLengthSize` is unset; the dialog also opens at this value.
export const DEFAULT_UNIFORM_BLANK_LENGTH = 30;

export const convertFillInTheBlankToMarkdown = (
  item: QuestionBankItemFillInTheBlank,
  parentOrder?: number,
  hideLabelOfQuestionType?: QuestionBankTypeKeys[],
  printID = false,
  uniformBlankLength = false,
  uniformBlankLengthSize?: number
): string => {
  // Floor the user-supplied size at the minimum; unset falls back to the default.
  const effectiveBlankLength = uniformBlankLength
    ? Math.max(MIN_UNIFORM_BLANK_LENGTH, uniformBlankLengthSize ?? DEFAULT_UNIFORM_BLANK_LENGTH)
    : undefined;
  return `${parentOrder ? '&emsp;' : ''} **${parentOrder ? parentOrder + '.' + item.order : item.order}.** ${hideLabelOfQuestionType?.includes(item.itemType as QuestionBankTypeKeys) ? '' : '【' + item.getItemTypeDescription() + '】'}${printID ? '(*' + item.id + '*) ' : ' '}${replaceAtSymbols(item.question.replaceAll('_', '\\_'), '<u>&nbsp;</u>', 1, effectiveBlankLength)}`;
};

export const convertMultipleChoiceToMarkdown = (
  item: QuestionBankItemMultipleChoice,
  parentOrder?: number,
  hideLabelOfQuestionType?: QuestionBankTypeKeys[],
  printID = false
): string => {
  let rst = `${parentOrder ? '&emsp;' : ''} **${parentOrder ? parentOrder + '.' + item.order : item.order}.** ${hideLabelOfQuestionType?.includes(item.itemType as QuestionBankTypeKeys) ? '' : '【' + item.getItemTypeDescription() + '】'}${printID ? '(*' + item.id + '*) ' : ' '}${item.question.replaceAll('_', '\\_')}\n`;
  const options = item.options || {};
  for (const opt of Object.keys(options)) {
    const val = options[opt as keyof typeof options] ?? '';
    rst += `${parentOrder ? '&emsp;' : ''}&emsp; *${opt}*. ${val} `;
  }
  return rst;
};

export const convertDictationToMarkdown = (
  item: QuestionBankItemDictation,
  hideLabelOfQuestionType?: QuestionBankTypeKeys[],
  printID = false
): string => {
  let rst = `${hideLabelOfQuestionType?.includes(item.itemType as QuestionBankTypeKeys) ? '' : '【' + item.getItemTypeDescription() + '】'} **${item.order}.** ${printID ? '(*' + item.id + '*) ' : ' '}${item.question}\n`;
  item.paragraphes.forEach((para, pidx) => {
    for (const part of para.parts) {
      if (part.contentType === 'label') {
        rst += `${part.label}`;
      } else {
        rst += `<ins>${'&emsp;'.repeat(2 * part.answer!.length)}</ins> ${part.postfix ? part.postfix : ''}`;
      }
    }
    if (pidx !== item.paragraphes.length - 1) {
      rst += `<br>`;
    }
  });
  return rst;
};

export const convertShortAnswerToMarkdown = (
  item: QuestionBankItemShortAnswer,
  parentOrder?: number,
  hideLabelOfQuestionType?: QuestionBankTypeKeys[],
  printID = false
): string => {
  let rst = `${parentOrder ? '&emsp;' : ''} **${parentOrder ? parentOrder + '.' + item.order : item.order}.** ${hideLabelOfQuestionType?.includes(item.itemType as QuestionBankTypeKeys) ? '' : '【' + item.getItemTypeDescription() + '】'}${printID ? '(*' + item.id + '*) ' : ' '}${item.question}\n`;
  for (let i = 0; i < item.rowsOfAnswers; i++) {
    rst += `${parentOrder ? '&emsp;' : ''}<ins>${'&emsp;'.repeat(50)}</ins>${i === item.rowsOfAnswers - 1 ? '' : '\n'}`;
  }
  return rst;
};

export const convertTrueFalseToMarkdown = (
  item: QuestionBankItemTrueFalse,
  parentOrder?: number,
  hideLabelOfQuestionType?: QuestionBankTypeKeys[],
  printID = false
): string => {
  const rst = `${parentOrder ? '&emsp;' : ''} **${parentOrder ? parentOrder + '.' + item.order : item.order}.** ${hideLabelOfQuestionType?.includes(item.itemType as QuestionBankTypeKeys) ? '' : '【' + item.getItemTypeDescription() + '】'}${printID ? '(*' + item.id + '*) ' : ' '}(&emsp;) ${item.question}`;
  return rst;
};

export const convertComprehensionToMarkdown = (
  item:
    | QuestionBankItemReadingComprehension
    | QuestionBankItemListeningComprehension
    | QuestionBankItemCloze,
  hideLabelOfQuestionType?: QuestionBankTypeKeys[],
  printID = false
): string => {
  let rst = `**${item.order}.** ${hideLabelOfQuestionType?.includes(item.itemType as QuestionBankTypeKeys) ? '' : '【' + item.getItemTypeDescription() + '】'}${printID ? '(*' + item.id + '*) ' : ' '}${item.question.replaceAll('_', '\\_')}\n`;
  item.items?.forEach((dtlitem, idx) => {
    switch (dtlitem.itemType) {
      case QuestionBankTypeEnum.FillInTheBlank:
        rst +=
          convertFillInTheBlankToMarkdown(
            dtlitem as QuestionBankItemFillInTheBlank,
            item.order,
            hideLabelOfQuestionType,
            printID
          ) + (idx === item.items!.length - 1 ? '' : '\n');
        break;
      case QuestionBankTypeEnum.ShortAnswer:
        rst +=
          convertShortAnswerToMarkdown(
            dtlitem as QuestionBankItemShortAnswer,
            item.order,
            hideLabelOfQuestionType,
            printID
          ) + (idx === item.items!.length - 1 ? '' : '\n');
        break;
      case QuestionBankTypeEnum.TrueFalse:
        rst +=
          convertTrueFalseToMarkdown(
            dtlitem as QuestionBankItemTrueFalse,
            item.order,
            hideLabelOfQuestionType,
            printID
          ) + (idx === item.items!.length - 1 ? '' : '\n');
        break;
      case QuestionBankTypeEnum.SingleChoice:
        rst +=
          convertSingleChoiceToMarkdown(
            dtlitem as QuestionBankItemSingleChoice,
            item.order,
            hideLabelOfQuestionType,
            printID
          ) + (idx === item.items!.length - 1 ? '' : '\n');
        break;
      case QuestionBankTypeEnum.MultipleChoice:
        rst +=
          convertMultipleChoiceToMarkdown(
            dtlitem as QuestionBankItemMultipleChoice,
            item.order,
            hideLabelOfQuestionType,
            printID
          ) + (idx === item.items!.length - 1 ? '' : '\n');
        break;
      default:
        break;
    }
  });
  return rst;
};

export const convertComprehensionAnswerToMarkdown = (
  item:
    | QuestionBankItemReadingComprehension
    | QuestionBankItemListeningComprehension
    | QuestionBankItemCloze,
  parentOrder?: number
): string => {
  let rst = '';
  item.items?.forEach((dtlitem, idx) => {
    switch (dtlitem.itemType) {
      case QuestionBankTypeEnum.FillInTheBlank:
        {
          const fbitem = dtlitem as QuestionBankItemFillInTheBlank;
          rst +=
            `*${parentOrder ? parentOrder + '.' : ''}${fbitem.order}*. ${fbitem.getAnswers()?.join(', ') || ''}` +
            (idx === item.items!.length - 1 ? '; ' : '&emsp;');
        }
        break;
      case QuestionBankTypeEnum.ShortAnswer:
        {
          const sitem = dtlitem as QuestionBankItemShortAnswer;
          rst +=
            `*${parentOrder ? parentOrder + '.' : ''}${sitem.order}*. ${sitem.getAnswers()?.join(', ') || ''}` +
            (idx === item.items!.length - 1 ? '; ' : '&emsp;');
        }
        break;
      case QuestionBankTypeEnum.TrueFalse:
        {
          const titem = dtlitem as QuestionBankItemTrueFalse;
          rst +=
            `*${parentOrder ? parentOrder + '.' : ''}${titem.order}*. ${titem.getAnswers()?.join(', ') || ''}` +
            (idx === item.items!.length - 1 ? '; ' : '&emsp;');
        }
        break;
      case QuestionBankTypeEnum.SingleChoice:
        {
          const scitem = dtlitem as QuestionBankItemSingleChoice;
          rst +=
            `*${parentOrder ? parentOrder + '.' : ''}${scitem.order}*. ${scitem.getAnswers()?.join(', ') || ''}` +
            (idx === item.items!.length - 1 ? '; ' : '&emsp;');
        }
        break;
      case QuestionBankTypeEnum.MultipleChoice:
        {
          const mcitem = dtlitem as QuestionBankItemMultipleChoice;
          rst +=
            `*${parentOrder ? parentOrder + '.' : ''}${mcitem.order}*. ${mcitem.getAnswers()?.join(', ') || ''}` +
            (idx === item.items!.length - 1 ? '; ' : '&emsp;');
        }
        break;
      default:
        break;
    }
  });
  return rst;
};

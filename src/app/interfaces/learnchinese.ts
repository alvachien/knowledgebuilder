//
// Data file.

import { QuestionBankItemLevelEnum, QuestionBankTypeEnum } from "./questionbank";
import type { KnowledgeExerciseFileContent } from "./questionbank-base";

export interface LearnChineseDataFile {
  name: string;
  version?: number;
  file: string;
  translationDisabled?: boolean;
}

export enum ChineseExerciseTypeEnum {
  ClassicalChinese = "Classical Chinese", // Classical Chinese，古文
  Composition = "Composition",       // Composition，写作
  Imitation = "Imitation",         // Imitation， 仿写
  FamousQuotation = "Famous Quotation",  // Famous quotation，名人名言
  Reading = "Reading",           // Reading，阅读
}

// Content
export interface LearnChineseFileItem {
  id?: number;
  //exectype: ChineseExerciseTypeEnum;
  subject: string;
  author?: string;
  contentlength?: number;
  source?: string;
  audio?: string;
  content?: string;
  content1?: string;
  content2?: string;
  content3?: string;
  content4?: string;
  content5?: string;
  content6?: string;
  content7?: string;
  content8?: string;
  content9?: string;
  content10?: string;
  content11?: string;
  content12?: string;
  content13?: string;
  content14?: string;
  content15?: string;
  content16?: string;
  content17?: string;
  content18?: string;
  content19?: string;
  content20?: string;
  content21?: string;
  content22?: string;
  content23?: string;
  content24?: string;
  content25?: string;
  content26?: string;
  content27?: string;
  content28?: string;
  content29?: string;
  content30?: string;
  content31?: string;
  content32?: string;
  content33?: string;
  content34?: string;
  content35?: string;
  content36?: string;
  content37?: string;
  content38?: string;
  content39?: string;
}

export const getChineseReciteItemDisplayContent = (cont: LearnChineseFileItem) => {
  if (cont.contentlength) {
    const arcontent = [];
    if (cont.contentlength >= 1) { arcontent.push(cont.content1 ?? ''); }
    if (cont.contentlength >= 2) { arcontent.push(cont.content2 ?? ''); }
    if (cont.contentlength >= 3) { arcontent.push(cont.content3 ?? ''); }
    if (cont.contentlength >= 4) { arcontent.push(cont.content4 ?? ''); }
    if (cont.contentlength >= 5) { arcontent.push(cont.content5 ?? ''); }
    if (cont.contentlength >= 6) { arcontent.push(cont.content6 ?? ''); }
    if (cont.contentlength >= 7) { arcontent.push(cont.content7 ?? ''); }
    if (cont.contentlength >= 8) { arcontent.push(cont.content8 ?? ''); }
    if (cont.contentlength >= 9) { arcontent.push(cont.content9 ?? ''); }
    if (cont.contentlength >= 10) { arcontent.push(cont.content10 ?? ''); }
    if (cont.contentlength >= 11) { arcontent.push(cont.content11 ?? ''); }
    if (cont.contentlength >= 12) { arcontent.push(cont.content12 ?? ''); }
    if (cont.contentlength >= 13) { arcontent.push(cont.content13 ?? ''); }
    if (cont.contentlength >= 14) { arcontent.push(cont.content14 ?? ''); }
    if (cont.contentlength >= 15) { arcontent.push(cont.content15 ?? ''); }
    if (cont.contentlength >= 16) { arcontent.push(cont.content16 ?? ''); }
    if (cont.contentlength >= 17) { arcontent.push(cont.content17 ?? ''); }
    if (cont.contentlength >= 18) { arcontent.push(cont.content18 ?? ''); }
    if (cont.contentlength >= 19) { arcontent.push(cont.content19 ?? ''); }
    if (cont.contentlength >= 20) { arcontent.push(cont.content20 ?? ''); }
    if (cont.contentlength >= 21) { arcontent.push(cont.content21 ?? ''); }
    if (cont.contentlength >= 22) { arcontent.push(cont.content22 ?? ''); }
    if (cont.contentlength >= 23) { arcontent.push(cont.content23 ?? ''); }
    if (cont.contentlength >= 24) { arcontent.push(cont.content24 ?? ''); }
    if (cont.contentlength >= 25) { arcontent.push(cont.content25 ?? ''); }
    if (cont.contentlength >= 26) { arcontent.push(cont.content26 ?? ''); }
    if (cont.contentlength >= 27) { arcontent.push(cont.content27 ?? ''); }
    if (cont.contentlength >= 28) { arcontent.push(cont.content28 ?? ''); }
    if (cont.contentlength >= 29) { arcontent.push(cont.content29 ?? ''); }
    if (cont.contentlength >= 30) { arcontent.push(cont.content30 ?? ''); }
    if (cont.contentlength >= 31) { arcontent.push(cont.content31 ?? ''); }
    if (cont.contentlength >= 32) { arcontent.push(cont.content32 ?? ''); }
    if (cont.contentlength >= 33) { arcontent.push(cont.content33 ?? ''); }
    if (cont.contentlength >= 34) { arcontent.push(cont.content34 ?? ''); }
    if (cont.contentlength >= 35) { arcontent.push(cont.content35 ?? ''); }
    if (cont.contentlength >= 36) { arcontent.push(cont.content36 ?? ''); }
    if (cont.contentlength >= 37) { arcontent.push(cont.content37 ?? ''); }
    if (cont.contentlength >= 38) { arcontent.push(cont.content38 ?? ''); }
    if (cont.contentlength >= 39) { arcontent.push(cont.content39 ?? ''); }
    
    return arcontent.join('\n');
  }
  return cont.content ?? '';
}

export const convertChineseReciteItemToKnowledge = (items: LearnChineseFileItem[], fileVersion = 1, level = QuestionBankItemLevelEnum.Full): KnowledgeExerciseFileContent[] => {
  const rtnqueue: KnowledgeExerciseFileContent[] = [];
  items.forEach((item, index) => {
    const nidx = index + 1;
    const qitem: KnowledgeExerciseFileContent = {
      id: nidx.toString(),
      order: nidx,
      itemType: fileVersion === 2 ? QuestionBankTypeEnum.FillInTheBlank : QuestionBankTypeEnum.Dictation,
      questionLevel: level,
    };

    // For version 2, it is fill in the blank
    // For version 1, it is dictation
    if (qitem.itemType === QuestionBankTypeEnum.FillInTheBlank) {      
      qitem.question = item.author ? `${item.subject}, ${item.author}. ` : `${item.subject}. `;
      qitem.question += item.content;
    } else if (qitem.itemType === QuestionBankTypeEnum.Dictation) {
      qitem.question = item.author ? `${item.subject}, ${item.author}` : `${item.subject}`;
      qitem.answers = [];
      if (item.contentlength && item.contentlength > 0) {
        if (item.contentlength >= 1 && item.content1) { qitem.answers.push(item.content1); }
        if (item.contentlength >= 2 && item.content2) { qitem.answers.push(item.content2); }
        if (item.contentlength >= 3 && item.content3) { qitem.answers.push(item.content3); }
        if (item.contentlength >= 4 && item.content4) { qitem.answers.push(item.content4); }
        if (item.contentlength >= 5 && item.content5) { qitem.answers.push(item.content5); }
        if (item.contentlength >= 6 && item.content6) { qitem.answers.push(item.content6); }
        if (item.contentlength >= 7 && item.content7) { qitem.answers.push(item.content7); }
        if (item.contentlength >= 8 && item.content8) { qitem.answers.push(item.content8); }
        if (item.contentlength >= 9 && item.content9) { qitem.answers.push(item.content9); }
        if (item.contentlength >= 10 && item.content10) { qitem.answers.push(item.content10); }
        if (item.contentlength >= 11 && item.content11) { qitem.answers.push(item.content11); }
        if (item.contentlength >= 12 && item.content12) { qitem.answers.push(item.content12); }
        if (item.contentlength >= 13 && item.content13) { qitem.answers.push(item.content13); }
        if (item.contentlength >= 14 && item.content14) { qitem.answers.push(item.content14); }
        if (item.contentlength >= 15 && item.content15) { qitem.answers.push(item.content15); }
        if (item.contentlength >= 16 && item.content16) { qitem.answers.push(item.content16); }
        if (item.contentlength >= 17 && item.content17) { qitem.answers.push(item.content17); }
        if (item.contentlength >= 18 && item.content18) { qitem.answers.push(item.content18); }
        if (item.contentlength >= 19 && item.content19) { qitem.answers.push(item.content19); }
        if (item.contentlength >= 20 && item.content20) { qitem.answers.push(item.content20); }
        if (item.contentlength >= 21 && item.content21) { qitem.answers.push(item.content21); }
        if (item.contentlength >= 22 && item.content22) { qitem.answers.push(item.content22); }
        if (item.contentlength >= 23 && item.content23) { qitem.answers.push(item.content23); }
        if (item.contentlength >= 24 && item.content24) { qitem.answers.push(item.content24); }
        if (item.contentlength >= 25 && item.content25) { qitem.answers.push(item.content25); }
        if (item.contentlength >= 26 && item.content26) { qitem.answers.push(item.content26); }
        if (item.contentlength >= 27 && item.content27) { qitem.answers.push(item.content27); }
        if (item.contentlength >= 28 && item.content28) { qitem.answers.push(item.content28); }
        if (item.contentlength >= 29 && item.content29) { qitem.answers.push(item.content29); }
        if (item.contentlength >= 30 && item.content30) { qitem.answers.push(item.content30); }
        if (item.contentlength >= 31 && item.content31) { qitem.answers.push(item.content31); }
        if (item.contentlength >= 32 && item.content32) { qitem.answers.push(item.content32); }
        if (item.contentlength >= 33 && item.content33) { qitem.answers.push(item.content33); }
        if (item.contentlength >= 34 && item.content34) { qitem.answers.push(item.content34); }
        if (item.contentlength >= 35 && item.content35) { qitem.answers.push(item.content35); }
        if (item.contentlength >= 36 && item.content36) { qitem.answers.push(item.content36); }
        if (item.contentlength >= 37 && item.content37) { qitem.answers.push(item.content37); }
        if (item.contentlength >= 38 && item.content38) { qitem.answers.push(item.content38); }
        if (item.contentlength >= 39 && item.content39) { qitem.answers.push(item.content39); }
      } else if (item.content) {
        qitem.question = item.author ? `${item.subject}, ${item.author}` : `${item.subject}`;
        qitem.answers.push(item.content);
      }
    }

    rtnqueue.push(qitem);
  });

  return rtnqueue;
}

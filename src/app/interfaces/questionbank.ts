// Question bank type
export enum QuestionBankTypeEnum {
    TrueFalse = 'TrueFalse',
    SingleChoice = 'SingleChoice',
    MultipleChoice = 'MultipleChoice',
    Dictation = 'Dictation',
    FillInTheBlank = 'FillInTheBlank',
    ShortAnswer = 'ShortAnswer',
    Essay = 'Essay',
    ReadingComprehension = 'ReadingComprehension',
    Cloze = 'Cloze',
    ListeningComprehension = 'ListeningComprehension'
}
export type QuestionBankTypeKeys = keyof typeof QuestionBankTypeEnum;

// Question bank content 
export enum QuestionBankContentFormatEnum {
    Text = 'Text',
    WithLatex = 'WithLatex',
    // Markdown = 'Markdown',
}
export type QuestionBankContentFormatKeys = keyof typeof QuestionBankContentFormatEnum;

// Option keys
export const VALID_OPTION_KEYS = {
    A: 'A',
    B: 'B',
    C: 'C',
    D: 'D',
    E: 'E',
    F: 'F',
    G: 'G',
    H: 'H',
    I: 'I',
    J: 'J',
    K: 'K',
    L: 'L',
    M: 'M',
    N: 'N',
    O: 'O',
    P: 'P',
    Q: 'Q',
    R: 'R',
    S: 'S',
    T: 'T',
    U: 'U',
    V: 'V',
    W: 'W',
    X: 'X',
    Y: 'Y',
    Z: 'Z',
    0: '0',
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
} as const;

export type ValidOptionKeys = keyof typeof VALID_OPTION_KEYS;

// Options
export type QuestionBankItemOption = Partial<Record<ValidOptionKeys, string>>;

// Level
export enum QuestionBankItemLevelEnum {
    Easy = 'Easy',
    Medium = 'Medium',
    Hard = 'Hard',
    Full = 'Full',
}
export type QuestionBankItemLevelEnumKeys = keyof typeof QuestionBankItemLevelEnum;

// Get All question bank level enum value
export const getAllQuestionBankLevelEnumValues = () => {
    return Object.values(QuestionBankItemLevelEnum);
}

export const getQuestionBankLevelName = (level: QuestionBankItemLevelEnum): string => {
    switch (level) {
        case QuestionBankItemLevelEnum.Easy:
            return '简单';
        case QuestionBankItemLevelEnum.Medium:
            return '中等';
        case QuestionBankItemLevelEnum.Hard:
            return '困难';
        case QuestionBankItemLevelEnum.Full:
            default:
            return '全部';
    }
}

export interface QuestionBankItemAudioReference {
    audioFile: string;
    startTime: number;
    endTime: number;
    audioScripts?: string;
}


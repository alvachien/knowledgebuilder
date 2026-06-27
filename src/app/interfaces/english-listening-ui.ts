export enum EnglishListeningStatusEnum {
    'LessonList' = 0,
    'SectionList' = 1,
    'SectionDetail' = 2,
    'InExercise' = 3,
    'Supplementary' = 5,
    'Completed' = 6,
    'Vocabulary' = 7,
}

export interface EnglishListeningUIStatus {
    status: EnglishListeningStatusEnum;
    startTime: Date;
    endTime: Date;
}

export enum EnglishListeningUIInputContentTypeEnum {
    'Label'     = 0,
    'Input'     = 1,
}

export interface EnglishListeningUIInputContentCell {
    content_type: EnglishListeningUIInputContentTypeEnum,
    content: string;
}

export interface EnglishListeningUIInputContent {
    cells: EnglishListeningUIInputContentCell[];
}

export interface EnglishListeningUICheckResult {
    expected: string;
    inputted: string;
}


export enum FormulaReciteFileTypeEnum {
    Math = 'math',
    Physics = 'physics',
    Chemistry = 'chemistry'
}

export interface FormulaReciteDataFile {
    name: string;
    file: string;
    version?: number;
    contenttype?: FormulaReciteFileTypeEnum;
}

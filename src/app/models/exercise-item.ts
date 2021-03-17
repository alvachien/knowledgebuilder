/* eslint-disable @typescript-eslint/naming-convention */
///
/// Exercise item
///

export enum ExerciseItemType {
    Question = 0,
    SingleChoice = 1,
    MultipleChoice = 2,
    ShortAnswer = 3,
    EssayQuestions = 4,
}

export const getExerciseItemTypeName = (reftype: ExerciseItemType): string => {
    let rtn = '';
    switch (reftype) {
        case ExerciseItemType.SingleChoice:
            rtn = 'ExerciseItemType.SingleChoice';
            break;

        case ExerciseItemType.MultipleChoice:
            rtn = 'ExerciseItemType.MultipleChoices';
            break;

        case ExerciseItemType.ShortAnswer:
            rtn = 'ExerciseItemType.ShortAnswer';
            break;

        case ExerciseItemType.ShortAnswer:
            rtn = 'ExerciseItemType.EssayQuestion';
            break;

        case ExerciseItemType.Question:
        default:
            rtn = 'ExerciseItemType.Question';
            break;
    }
    return rtn;
};

export const getExerciseItemTypeNames = (): any[] => {
    const rtn = [];

    for (const se in ExerciseItemType) {
      if (Number.isNaN(+se)) {
        // Do nothing
      } else {
        rtn.push({
          value: +se,
          i18nterm: getExerciseItemTypeName(+se),
          displaystring: '',
        });
      }
    }

    return rtn;
};

//
// Exercise Item
//
export class ExerciseItem {
    constructor() {
        this.ID = -1;
        this.Content = '';
        this.ItemType = ExerciseItemType.Question;
    }

    public ID: number;
    public Content: string;
    public ItemType: ExerciseItemType;
    private _knowledgeItemID?: number;
    private _createdAt?: Date;
    private _modifiedAt?: Date;
    private _tags: string[] = [];
    private _answer?: string;

    get KnowledgeItemID(): number | undefined { return this._knowledgeItemID; }
    set KnowledgeItemID(kid: number | undefined) { this._knowledgeItemID = kid; }
    get CreatedAt(): Date | undefined { return this._createdAt; }
    set CreatedAt(ca: Date | undefined) { this._createdAt = ca; }
    get ModifiedAt(): Date | undefined { return this._modifiedAt; }
    set ModifiedAt(ua: Date | undefined) { this._modifiedAt = ua; }
    get Tags(): string[] { return this._tags; }
    set Tags(tag: string[]) {
        this._tags = tag.slice();
    }
    get Answer(): string | undefined { return this._answer; }
    set Answer(awr: string | undefined) { this._answer = awr; }

    public parseData(val: any): void {
        if (val && val.ID) {
            this.ID = +val.ID;
        }
        if (val && val.KnowledgeItemID) {
            this.KnowledgeItemID = val.KnowledgeItemID;
        }
        if (val && val.ExerciseType) {
            if (isNaN(+val.ExerciseType)) {
                this.ItemType = ExerciseItemType[val.ExerciseType as keyof typeof ExerciseItemType];
            } else {
                this.ItemType = +val.ExerciseType;
            }
        }
        if (val && val.Content) {
            this.Content = val.Content;
        }
        if (val && val.CreatedAt) {
            this.CreatedAt = Date(val.CreatedAt);
        }
        if (val && val.ModifiedAt) {
            this.ModifiedAt = Date(val.ModifiedAt);
        }
        // Answer
        if (val && val.Answer) {
            this.Answer = val.Answer.Content;
        }
        // Tags
        if (val && val.Tags) {
            const tags: any[] = val.Tags as any[];
            this._tags = [];
            tags.forEach(tg => {
                this._tags.push(tg.TagTerm);
            });
        }
    }
    public generateString(isupdate?: boolean): string {
        const exobj: any = {
            Content: this.Content,
            ExerciseType: ExerciseItemType[this.ItemType],
        };
        if (isupdate) {
            exobj.ID = this.ID;
        }
        if (this.KnowledgeItemID) {
            exobj.KnowledgeItemID = this.KnowledgeItemID;
        }
        if (this.CreatedAt) {
            exobj.CreatedAt = this.CreatedAt.toISOString().slice(0, 10);
        }
        if (this.ModifiedAt) {
            exobj.ModifiedAt = this.ModifiedAt.toISOString().slice(0, 10);
        }
        if (this.Answer) {
            exobj.Answer = {
                Content: this.Answer
            };
        }
        if (this.Tags) {
            exobj.Tags = [];
            this.Tags.forEach(tg => {
                exobj.Tags.push({
                    TagTerm: tg
                });
            });
        }

        return JSON && JSON.stringify(exobj);
    }
}

/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
///
/// Exercise item
///

// eslint-disable-next-line no-shadow
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

    case ExerciseItemType.EssayQuestions:
      rtn = 'ExerciseItemType.EssayQuestion';
      break;

    case ExerciseItemType.Question:
    default:
      rtn = 'ExerciseItemType.Question';
      break;
  }
  return rtn;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  get KnowledgeItemID(): number | undefined {
    return this._knowledgeItemID;
  }
  set KnowledgeItemID(kid: number | undefined) {
    this._knowledgeItemID = kid;
  }
  get CreatedAt(): Date | undefined {
    return this._createdAt;
  }
  set CreatedAt(ca: Date | undefined) {
    this._createdAt = ca;
  }
  get ModifiedAt(): Date | undefined {
    return this._modifiedAt;
  }
  set ModifiedAt(ua: Date | undefined) {
    this._modifiedAt = ua;
  }
  get Tags(): string[] {
    return this._tags;
  }
  set Tags(tag: string[]) {
    this._tags = tag.slice();
  }
  get Answer(): string | undefined {
    return this._answer;
  }
  set Answer(awr: string | undefined) {
    this._answer = awr;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public parseData(val: any): void {
    if (val && val.ID) {
      this.ID = +val.ID;
    }
    if (val && val.KnowledgeItemID) {
      this.KnowledgeItemID = val.KnowledgeItemID;
    }
    if (val && val.ExerciseType) {
      if (isNaN(+val.ExerciseType)) {
        this.ItemType =
          ExerciseItemType[val.ExerciseType as keyof typeof ExerciseItemType];
      } else {
        this.ItemType = +val.ExerciseType;
      }
    }
    if (val && val.Content) {
      this.Content = val.Content;
    }
    if (val && val.CreatedAt) {
      this.CreatedAt = new Date(val.CreatedAt);
    }
    if (val && val.ModifiedAt) {
      this.ModifiedAt = new Date(val.ModifiedAt);
    }
    // Answer
    if (val && val.Answer) {
      this.Answer = val.Answer.Content;
    }
    // Tags
    if (val && val.Tags) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tags: any[] = val.Tags as any[];
      this._tags = [];
      tags.forEach((tg) => {
        this._tags.push(tg.TagTerm);
      });
    }
  }
  public generateString(isupdate?: boolean): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        Content: this.Answer,
      };
    }
    if (this.Tags) {
      exobj.Tags = [];
      this.Tags.forEach((tg) => {
        exobj.Tags.push({
          TagTerm: tg,
        });
      });
    }

    return JSON && JSON.stringify(exobj);
  }
}

export class ExerciseItemSearchResult {
  public ID = -1;
  public Content = '';
  public ItemType: ExerciseItemType = ExerciseItemType.Question;
  public Tags = '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public parseData(data: any): void {
    if (data && data.ID) {
      this.ID = data.ID;
    }
    if (data && data.Content) {
      this.Content = data.Content;
    }
    if (data && data.ExerciseType) {
      if (isNaN(+data.ExerciseType)) {
        this.ItemType =
          ExerciseItemType[data.ExerciseType as keyof typeof ExerciseItemType];
      } else {
        this.ItemType = +data.ExerciseType;
      }
    }
    if (data && data.Tags) {
      this.Tags = data.Tags;
    }
  }
}

export class ExerciseItemUserScore {
  constructor() {
    this.ID = -1;
    this.User = '';
    this.RefID = -1;
    this.Score = 0;
  }
  public ID: number;
  public User: string;
  public RefID: number;
  public TakenDate?: Date;
  public Score: number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public parseData(data: any): void {
    if (data && data.ID) {
      this.ID = data.ID;
    }
    if (data && data.User) {
      this.User = data.User;
    }
    if (data && data.RefID) {
      this.RefID = data.RefID;
    }
    if (data && data.Score) {
      this.Score = data.Score;
    }
    if (data && data.TakenDate) {
      this.TakenDate = new Date(data.TakenDate);
    }
  }
  public writeJSONString(isupdate?: boolean): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exobj: any = {
      User: this.User,
      RefID: this.RefID,
      Score: this.Score,
    };
    if (isupdate) {
      exobj.ID = this.ID;
    }
    return JSON && JSON.stringify(exobj);
  }
}

/// 
/// Exercise item
///

export enum ExerciseItemType {
    Question = 'Question',
    SingleChoice = 'SingleChoice',
    MultipleChoice = 'MultipleChoice',
    ShortAnswer = 'ShortAnswer',
    EssayQuestions = 'EssayQuestions',
}

export class ExerciseItem {
    private _id!: number;
    private _content!: string;
    private _itemType!: ExerciseItemType;
    private _knowledgeItemID?: number;
    private _createdAt?: Date;
    private _modifiedAt?: Date;
    private _tags: string[] = [];
    private _answer?: string;

    get ID(): number                    { return this._id;          }
    set ID(nid: number)                 { this._id  = nid;          }
    get Content(): string               { return this._content;     }
    set Content(ct: string)             { this._content = ct;       }
    get ItemType(): ExerciseItemType    { return this._itemType;    }
    set ItemType(it: ExerciseItemType)  { this._itemType = it;      }
    get KnowledgeItemID(): number | undefined { return this._knowledgeItemID;   }
    set KnowledgeItemID(kid: number | undefined) { this._knowledgeItemID = kid; }
    get CreatedAt(): Date | undefined   { return this._createdAt;   }
    set CreatedAt(ca: Date | undefined) { this._createdAt = ca;     }
    get ModifiedAt(): Date | undefined   { return this._modifiedAt;   }
    set ModifiedAt(ua: Date | undefined) { this._modifiedAt = ua;     }
    get Tags(): string[]                 { return this._tags;        }
    set Tags(tag: string[]) {
        this._tags = tag.slice();
    }
    get Answer(): string | undefined    { return this._answer;      }
    set Answer(awr: string | undefined) { this._answer = awr;       }

    public parseData(val: any): void {
        if (val && val.ID) {
            this.ID = +val.ID;
        }
        if (val && val.KnowledgeItemID) {
            this.KnowledgeItemID = val.KnowledgeItemID;
        }
        if (val && val.ExerciseType) {
            this.ItemType = val.ExerciseType;
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
            const tags: any[] = val.Tags as any[];
            this._tags = [];
            tags.forEach(tg => {
                this._tags.push(tg.TagTerm);
            });
        }
    }
    public generateString(iscreate?: boolean): string {
        const exobj: any = {
            Content: this.Content,
            ExerciseType: this.ItemType
        };
        if (this.KnowledgeItemID) {
            exobj.KnowledgeItemID = this.KnowledgeItemID;
        }
        if (this.CreatedAt) {
            exobj.CreatedAt = this.CreatedAt.toISOString();
        }
        if (this.ModifiedAt) {
            exobj.ModifiedAt = this.ModifiedAt.toISOString(); // .slice(0,10);;
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

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

export class ExerciseItem {
    private _id!: number;
    private _content!: string;
    private _itemType!: ExerciseItemType;
    private _knowledgeItemID?: number;

    get ID(): number                    { return this._id;          }
    set ID(nid: number)                 { this._id  = nid;          }
    get Content(): string               { return this._content;     }
    set Content(ct: string)             { this._content = ct;       }
    get ItemType(): ExerciseItemType    { return this._itemType;    }
    set ItemType(it: ExerciseItemType)  { this._itemType = it;      }
    get KnowledgeItemID(): number | undefined { return this._knowledgeItemID;   }
    set KnowledgeItemID(kid : number | undefined) { this._knowledgeItemID = kid; }
    // get CreatedAt()

    public parseData(val: any) {
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
        // if (val && val.CreatedAt) {            
        // }
    }
    public generateString(): string {
        let exobj: any = {
            Content: this.Content,
            ExerciseType: +this.ItemType
        };
        if (this.KnowledgeItemID) {
            exobj.KnowledgeItemID = this.KnowledgeItemID;
        }

        return JSON && JSON.stringify(exobj);
    }
}

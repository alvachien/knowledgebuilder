/// 
/// Knowledge item
///
export enum KnowledgeItemCategory {
    Concept     = 0,
    Formula     = 1,
}

export class KnowledgeItem {
    private _id!: number;
    private _content!: string;
    private _itemCtgy!: KnowledgeItemCategory;

    get ID(): number                            { return this._id;          }
    set ID(nid: number)                         { this._id  = nid;          }
    get Content(): string                       { return this._content;     }
    set Content(ct: string)                     { this._content = ct;       }
    get ItemCategory(): KnowledgeItemCategory   { return this._itemCtgy;    }
    set ItemCategory(ic: KnowledgeItemCategory) { this._itemCtgy = ic;      }
}

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
    private _tags: string[] = [];
    private _createdAt?: Date;
    private _modifiedAt?: Date;

    get ID(): number                            { return this._id;          }
    set ID(nid: number)                         { this._id  = nid;          }
    get Content(): string                       { return this._content;     }
    set Content(ct: string)                     { this._content = ct;       }
    get ItemCategory(): KnowledgeItemCategory   { return this._itemCtgy;    }
    set ItemCategory(ic: KnowledgeItemCategory) { this._itemCtgy = ic;      }
    get Tags(): string[]                        { return this._tags;        }
    set Tags(tag: string[]) { 
        this._tags = tag.slice();   
    }
    get CreatedAt(): Date | undefined   { return this._createdAt;   }
    set CreatedAt(ca: Date | undefined) { this._createdAt = ca;     }
    get ModifiedAt(): Date | undefined   { return this._modifiedAt;   }
    set ModifiedAt(ua: Date | undefined) { this._modifiedAt = ua;     } 

    public parseData(val: any) {
        if (val && val.ID) {
            this.ID = +val.ID;
        }
        if (val && val.ItemCategory) {
            this.ItemCategory = val.ItemCategory;
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
    }
    public generateString(): string {
        let exobj: any = {
            Content: this.Content,
            ItemCategory: this.ItemCategory
        };
        if (this.CreatedAt) {
            exobj.CreatedAt = this.CreatedAt.toISOString();
        }
        if (this.ModifiedAt) {
            exobj.ModifiedAt = this.ModifiedAt.toISOString(); // .slice(0,10);;
        }

        return JSON && JSON.stringify(exobj);
    }

}

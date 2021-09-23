/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import { TagReferenceType } from './tag';

///
/// User collection
///

export class UserCollection {
    constructor() {
        this.ID = -1;
        this.User = '';
        this.Name = '';
        this.Comment = undefined;
        this.Items = [];
    }

    public ID: number;
    public User: string;
    public Name: string;
    public Comment?: string;
    public Items: UserCollectionItem[];
    private _createdAt?: Date;
    private _modifiedAt?: Date;

    get CreatedAt(): Date | undefined { return this._createdAt; }
    set CreatedAt(ca: Date | undefined) { this._createdAt = ca; }
    get ModifiedAt(): Date | undefined { return this._modifiedAt; }
    set ModifiedAt(ua: Date | undefined) { this._modifiedAt = ua; }

    public parseData(data: any): void {
        if (data && data.ID) {
            this.ID = data.ID;
        }
        if (data && data.User) {
            this.User = data.User;
        }
        if (data && data.Name) {
            this.Name = data.Name;
        }
        if (data && data.Comment) {
            this.Comment = data.Comment;
        }
        if (data && data.CreatedAt) {
            this.CreatedAt = new Date(data.CreatedAt);
        }
        if (data && data.ModifiedAt) {
            this.ModifiedAt = new Date(data.ModifiedAt);
        }
        if (data && data.Items) {
            const items: any[] = data.Items as any[];
            this.Items = [];
            items.forEach(tg => {
                const item = new UserCollectionItem();
                item.parseData(tg);
                this.Items.push(item);
            });
        }
    }
    public writeJSONString(isupdate?: boolean): string {
        const coll: any = {
            User: this.User,
            Name: this.Name,
        };
        if (isupdate) {
            coll.ID = this.ID;
        }
        if (this.Comment && this.Comment.length > 0) {
            coll.Comment = this.Comment;
        }
        if (this.CreatedAt) {
            coll.CreatedAt = this.CreatedAt.toISOString().slice(0, 10);
        }
        if (this.ModifiedAt) {
            coll.ModifiedAt = this.ModifiedAt.toISOString().slice(0, 10);
        }
        if (this.Items && this.Items.length > 0) {
            coll.Items = [];
            this.Items.forEach(it => {
                coll.Items.push(it.writeJSONObject(isupdate));
            });
        }

        return JSON && JSON.stringify(coll);
    }
}

export class UserCollectionItem {
    constructor() {
        this.ID = -1;
        this.RefType = TagReferenceType.ExerciseItem;
        this.RefID = -1;
    }
    public ID: number;
    public RefType: TagReferenceType;
    public RefID: number;
    private _createdAt?: Date;

    get CreatedAt(): Date | undefined { return this._createdAt; }
    set CreatedAt(ca: Date | undefined) { this._createdAt = ca; }
    public parseData(data: any): void {
        if (data && data.ID) {
            this.ID = data.ID;
        }
        if (data && data.RefType) {
            if (isNaN(+data.RefType)) {
                this.RefType = TagReferenceType[data.RefType as keyof typeof TagReferenceType];
            } else {
                this.RefType = +data.RefType;
            }
        }
        if (data && data.RefID) {
            this.RefID = data.RefID;
        }
        if (data && data.CreatedAt) {
            this.CreatedAt = new Date(data.CreatedAt);
        }
    }
    public writeJSONObject(isupdate?: boolean): any {
        const item: any = {
            RefType: TagReferenceType[this.RefType],
            RefID: this.RefID,
        };
        if (isupdate) {
            item.ID = this.ID;
        }
        if (this.CreatedAt) {
            item.CreatedAt = this.CreatedAt.toISOString().slice(0, 10);
        }

        return item;
    }
    public writeJSONString(isupdate?: boolean): string {
        const item: any = {
            RefType: TagReferenceType[this.RefType],
            RefID: this.RefID,
        };
        if (isupdate) {
            item.ID = this.ID;
        }
        if (this.CreatedAt) {
            item.CreatedAt = this.CreatedAt.toISOString().slice(0, 10);
        }

        return JSON && JSON.stringify(item);
    }
}

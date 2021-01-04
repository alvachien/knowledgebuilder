
export enum TagReferenceType {
    KnowledgeItem = 1,
    ExerciseItem = 2,
}

export class Tag {
    public TagTerm?: string;
    public RefType?: TagReferenceType;
    public RefID?: number;

    public parseData(val: any): void {
        if (val && val.TagTerm) {
            this.TagTerm = val.TagTerm;
        }
        if (val && val.RefType) {
            this.RefType = val.RefType;
        }
        if (val && val.RefID) {
            this.RefID = val.RefID;
        }
    }
}

export class TagCount {
    public TagTerm?: string;
    public RefType?: TagReferenceType;
    public Count?: number;

    public parseData(val: any): void {
        if (val && val.Tag) {
            this.TagTerm = val.Tag;
        }
        if (val && val.RefType) {
            this.RefType = val.RefType;
        }
        if (val && val.Count) {
            this.Count = val.Count;
        }
    }
}

export class TagCountByRefType {
    public RefType?: TagReferenceType;
    public Count?: number;

    public parseData(val: any): void {
        if (val && val.RefType) {
            this.RefType = val.RefType;
        }
        if (val && val.Count) {
            this.Count = val.Count;
        }
    }
}


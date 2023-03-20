import { TagReferenceType } from './tag';

export class OverviewInfo {
  public RefType!: TagReferenceType;
  public Count!: number;

  public parseData(val: any): void {
    if (val && val.RefType) {
      if (isNaN(+val.RefType)) {
        this.RefType =
          TagReferenceType[val.RefType as keyof typeof TagReferenceType];
      } else {
        this.RefType = +val.RefType;
      }
    }
    if (val && val.Count) {
      this.Count = val.Count;
    }
  }
}

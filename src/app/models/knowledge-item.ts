///
/// Knowledge item
///

export enum KnowledgeItemCategory {
  Concept = 0,
  Formula = 1,
}

export const getKnowledgeItemCategoryName = (
  ctgy: KnowledgeItemCategory
): string => {
  let rtn = '';
  switch (ctgy) {
    case KnowledgeItemCategory.Formula:
      rtn = 'KnowledgeItemCategory.Formula';
      break;

    case KnowledgeItemCategory.Concept:
    default:
      rtn = 'KnowledgeItemCategory.Concept';
      break;
  }
  return rtn;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getKnowledgeItemCategoryNames = (): any[] => {
  const rtn = [];

  for (const se in KnowledgeItemCategory) {
    if (Number.isNaN(+se)) {
      // Do nothing
    } else {
      rtn.push({
        value: +se,
        i18nterm: getKnowledgeItemCategoryName(+se),
        displaystring: '',
      });
    }
  }

  return rtn;
};

export class KnowledgeItem {
  private _id!: number;
  private _content!: string;
  private _itemCtgy!: KnowledgeItemCategory;
  private _tags: string[] = [];
  private _createdAt?: Date;
  private _modifiedAt?: Date;
  private _title!: string;

  get ID(): number {
    return this._id;
  }
  set ID(nid: number) {
    this._id = nid;
  }
  get Title(): string {
    return this._title;
  }
  set Title(title: string) {
    this._title = title;
  }
  get Content(): string {
    return this._content;
  }
  set Content(ct: string) {
    this._content = ct;
  }
  get ItemCategory(): KnowledgeItemCategory {
    return this._itemCtgy;
  }
  set ItemCategory(ic: KnowledgeItemCategory) {
    this._itemCtgy = ic;
  }
  get Tags(): string[] {
    return this._tags;
  }
  set Tags(tag: string[]) {
    this._tags = tag.slice();
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public parseData(val: any) {
    if (val && val.ID) {
      this.ID = +val.ID;
    }
    if (val && val.Category) {
      if (isNaN(+val.Category)) {
        this.ItemCategory =
          KnowledgeItemCategory[
            val.Category as keyof typeof KnowledgeItemCategory
          ];
      } else {
        this.ItemCategory = +val.Category;
      }
    }
    if (val && val.Title) {
      this._title = val.Title;
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
      Content: this._content,
      Title: this._title,
      Category: KnowledgeItemCategory[this.ItemCategory],
    };
    if (isupdate) {
      exobj.ID = this.ID;
    }
    if (this.CreatedAt) {
      exobj.CreatedAt = this.CreatedAt.toISOString();
    }
    if (this.ModifiedAt) {
      exobj.ModifiedAt = this.ModifiedAt.toISOString(); // .slice(0,10);;
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

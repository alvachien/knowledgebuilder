import { KnowledgeCategoryEnum } from './common.model';

// Knowledge item
export class KnowledgeItem {
  public id: number;
  public category: KnowledgeCategoryEnum;
  public name: string;
  public content: string;
  public canGenerate?: boolean;

  constructor() {
    this.content = ''; // Empty string instead of null
    this.category = KnowledgeCategoryEnum.Concept;
  }

  public fromJsonFormat(jfmt: any): void {
    if (jfmt && jfmt.Id) {
      this.id = +jfmt.Id;
    }
    if (jfmt && jfmt.Category) {
      this.category = jfmt.Category;
    } else {
      this.category = KnowledgeCategoryEnum.Concept;
    }
    if (jfmt && jfmt.Name) {
      this.name = jfmt.Name;
    }
    if (jfmt && jfmt.Content) {
      this.content = jfmt.Content;
    }
    if (jfmt && jfmt.CanGenerate) {
      this.canGenerate = jfmt.CanGenerate;
    }
  }
  public toJsonFormat(): any {
    return JSON && JSON.stringify({
      Id: this.id,
      Category: this.category ? (+this.category) : undefined,
      Name: this.name,
      Content: this.content,
      CanGenerate: this.canGenerate,

      '@odata.type': 'MathLearnAPI.Models.Knowledge',
    });
  }
}

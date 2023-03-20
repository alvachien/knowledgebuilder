export class ExerciseItemAnswer {
  private _id!: number;
  private _content!: string;

  get ID(): number {
    return this._id;
  }
  set ID(nid: number) {
    this._id = nid;
  }
  get Content(): string {
    return this._content;
  }
  set Content(ncontent: string) {
    this._content = ncontent;
  }
}

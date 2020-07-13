import { IACMarkdownEditor } from './acmarkdown-editor-interface';

export class ACMarkdownEditorCounter {
  public element: HTMLElement;

  constructor(vditor: IACMarkdownEditor) {
    this.element = document.createElement('div');
    this.element.className = 'vditor-counter';

    this.render(0, vditor.options.counter);
  }

  public render(length: number, counter: number) {
    if (length > counter) {
      this.element.className = 'vditor-counter vditor-counter--error';
    } else {
      this.element.className = 'vditor-counter';
    }
    this.element.innerHTML = `${length}/${counter}`;
  }
}

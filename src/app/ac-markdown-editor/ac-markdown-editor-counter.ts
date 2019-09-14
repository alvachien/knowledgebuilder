import { IACMEditor } from './ac-markdown-editor-interfaces';

///
/// Counter
///
export class ACMEditorCounter {
  public element: HTMLElement;

  constructor(vditor: IACMEditor) {
    this.element = document.createElement('div');
    this.element.className = 'acme-counter';

    this.render(0, vditor.options.counter);

  }

  public render(length: number, counter: number) {
    if (length > counter) {
      this.element.className = 'acme-counter acme-counter--error';
    } else {
      this.element.className = 'acme-counter';
    }
    this.element.innerHTML = `${length}/${counter}`;
  }
}

import { IACMEditor } from './ac-markdown-editor-interfaces';
import { classPrefix } from './ac-markdown-editor-constants';

///
/// Counter
///
export class ACMEditorCounter {
  public element: HTMLElement;

  constructor(editor: IACMEditor) {
    this.element = document.createElement('div');
    this.element.className = `${classPrefix}-counter`;

    this.render(0, editor.options.counter);
  }

  public render(length: number, counter: number) {
    if (length > counter) {
      this.element.className = `${classPrefix}-counter ${classPrefix}-counter--error`;
    } else {
      this.element.className = `${classPrefix}-counter`;
    }
    this.element.innerHTML = `${length}/${counter}`;
  }
}

import { IACMEditor } from './ac-markdown-editor-interfaces';
import { classPrefix } from './ac-markdown-editor-constants';

// Tip
export class ACMEditorTip {
  public element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = classPrefix + '-tip';
  }

  public show(text: string, time: number = 6000) {
    this.element.className = `${classPrefix}-tip ${classPrefix}-tip--show`;

    if (time === 0) {
      this.element.innerHTML = `<div class='${classPrefix}-tip__content'>${text}
<div class='${classPrefix}-tip__close'>X</div></div>`;
      this.element.querySelector(`.${classPrefix}-tip__close`).addEventListener('click', () => {
        this.hide();
      });
      return;
    }

    this.element.innerHTML = `<div class='${classPrefix}-tip__content'>${text}</div>`;
    setTimeout(() => {
      this.hide();
    }, time);
  }

  public hide() {
    this.element.className = classPrefix + '-tip';
    this.element.innerHTML = '';
  }
}

// import resizeSVG from '../../assets/icons/resize.svg';
import { IACMEditor } from './ac-markdown-editor-interfaces';
import { classPrefix } from './ac-markdown-editor-constants';

// Resize
export class ACMEditorResize {
  public element: HTMLElement;

  constructor(editor: IACMEditor) {
    this.element = document.createElement('div');
    this.element.className = `${classPrefix}-resize ${classPrefix}-resize--${editor.options.resize.position}`;
    this.element.innerHTML = `<div><svg xmlns="http://www.w3.org/2000/svg" width="128" height="32" viewBox="0 0 128 32">
    <path d="M0 0h128v6.4h-128zM0 12.8h128v6.4h-128zM0 25.6h128v6.4h-128z"></path>
</svg></div>`;

    this.bindEvent(editor);
  }

  private bindEvent(editor: IACMEditor) {
    this.element.addEventListener('mousedown', (event: MouseEvent) => {

      const documentSelf = document;
      // const vditorElement = document.getElementById(vditor.id);
      const vditorElement = editor.host;
      const y = event.clientY;
      const height = vditorElement.offsetHeight;
      const minHeight = 63 + vditorElement.querySelector(`.${classPrefix}-toolbar`).clientHeight;
      documentSelf.ondragstart = () => false;

      if (window.captureEvents) {
        window.captureEvents();
      }

      this.element.className = this.element.className + ` ${classPrefix}-resize--selected`;

      documentSelf.onmousemove = (moveEvent: MouseEvent) => {
        if (editor.options.resize.position === 'top') {
          vditorElement.style.height = Math.max(minHeight, height + (y - moveEvent.clientY)) + 'px';
        } else {
          vditorElement.style.height = Math.max(minHeight, height + (moveEvent.clientY - y)) + 'px';
        }
        editor.editor.element.style.paddingBottom = editor.editor.element.parentElement.offsetHeight / 2 + 'px';
      };

      documentSelf.onmouseup = () => {
        if (editor.options.resize.after) {
          editor.options.resize.after(vditorElement.offsetHeight - height);
        }

        if (window.captureEvents) {
          window.captureEvents();
        }
        documentSelf.onmousemove = null;
        documentSelf.onmouseup = null;
        documentSelf.ondragstart = null;
        documentSelf.onselectstart = null;
        documentSelf.onselect = null;
        this.element.className = this.element.className.replace(/ acme-resize--selected/g, '');
      };
    });
  }
}

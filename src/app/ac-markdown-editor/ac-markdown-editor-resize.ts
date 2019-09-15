// import resizeSVG from '../../assets/icons/resize.svg';
import { IACMEditor } from './ac-markdown-editor-interfaces';

export class ACMEditorResize {
  public element: HTMLElement;

  constructor(vditor: IACMEditor) {
    this.element = document.createElement('div');
    this.element.className = `vditor-resize vditor-resize--${vditor.options.resize.position}`;
    this.element.innerHTML = `<div><svg xmlns="http://www.w3.org/2000/svg" width="128" height="32" viewBox="0 0 128 32">
    <path d="M0 0h128v6.4h-128zM0 12.8h128v6.4h-128zM0 25.6h128v6.4h-128z"></path>
</svg></div>`;

    this.bindEvent(vditor);
  }

  private bindEvent(vditor: IACMEditor) {
    this.element.addEventListener('mousedown', (event: MouseEvent) => {

      const documentSelf = document;
      // const vditorElement = document.getElementById(vditor.id);
      const vditorElement = vditor.host;
      const y = event.clientY;
      const height = vditorElement.offsetHeight;
      const minHeight = 63 + vditorElement.querySelector('.vditor-toolbar').clientHeight;
      documentSelf.ondragstart = () => false;

      if (window.captureEvents) {
        window.captureEvents();
      }

      this.element.className = this.element.className + ' vditor-resize--selected';

      documentSelf.onmousemove = (moveEvent: MouseEvent) => {
        if (vditor.options.resize.position === 'top') {
          vditorElement.style.height = Math.max(minHeight, height + (y - moveEvent.clientY)) + 'px';
        } else {
          vditorElement.style.height = Math.max(minHeight, height + (moveEvent.clientY - y)) + 'px';
        }
        vditor.editor.element.style.paddingBottom = vditor.editor.element.parentElement.offsetHeight / 2 + 'px';
      };

      documentSelf.onmouseup = () => {
        if (vditor.options.resize.after) {
          vditor.options.resize.after(vditorElement.offsetHeight - height);
        }

        if (window.captureEvents) {
          window.captureEvents();
        }
        documentSelf.onmousemove = null;
        documentSelf.onmouseup = null;
        documentSelf.ondragstart = null;
        documentSelf.onselectstart = null;
        documentSelf.onselect = null;
        this.element.className = this.element.className.replace(/ vditor-resize--selected/g, '');
      };
    });
  }
}

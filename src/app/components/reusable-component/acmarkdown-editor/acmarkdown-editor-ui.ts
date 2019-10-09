import { formatRender, html2md } from './acmarkdown-editor-util';
import { IACMarkdownEditor } from './acmarkdown-editor-interface';

export class ACMarkdownEditorUi {
  constructor(vditor: IACMarkdownEditor) {
    const vditorElement = document.getElementById(vditor.id);
    vditorElement.innerHTML = '';
    vditorElement.className = 'vditor' + (vditorElement.className ? ' ' + vditorElement.className : '');
    if (typeof vditor.options.height === 'number') {
      vditorElement.style.height = vditor.options.height + 'px';
    }
    if (typeof vditor.options.width === 'number') {
      vditorElement.style.width = vditor.options.width + 'px';
    } else {
      vditorElement.style.width = vditor.options.width;
    }

    const toolbarElement = document.createElement('div');
    toolbarElement.className = 'vditor-toolbar';
    Object.keys(vditor.toolbar.elements).forEach((key) => {
      toolbarElement.appendChild(vditor.toolbar.elements[key]);
    });

    vditorElement.appendChild(toolbarElement);

    const contentElement = document.createElement('div');
    contentElement.className = 'vditor-content';
    contentElement.appendChild(vditor.editor.element);

    if (vditor.preview) {
      contentElement.appendChild(vditor.preview.element);
    }

    if (vditor.options.counter > 0) {
      contentElement.appendChild(vditor.counter.element);
    }

    if (vditor.upload) {
      contentElement.appendChild(vditor.upload.element);
    }

    if (vditor.options.resize.enable) {
      contentElement.appendChild(vditor.resize.element);
    }

    contentElement.appendChild(vditor.tip.element);

    vditorElement.appendChild(contentElement);

    this.afterRender(vditor);
  }

  private async afterRender(vditor: IACMarkdownEditor) {
    let height: number = Math.max(vditor.editor.element.parentElement.offsetHeight, 20);
    if (height < 21 && typeof vditor.options.height === 'number') {
      height = vditor.options.height - 37;
    }
    vditor.editor.element.style.paddingBottom = height / 2 + 'px';

    const localValue = localStorage.getItem('vditor' + vditor.id);
    if (vditor.options.cache && localValue) {
      formatRender(vditor, localValue, undefined, false);
    } else {
      if (!vditor.originalInnerHTML.trim()) {
        return;
      }
      const mdValue = await html2md(vditor, vditor.originalInnerHTML);
      formatRender(vditor, mdValue, undefined, false);
    }
  }
}

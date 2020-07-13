import { formatRender, html2md } from './acmarkdown-editor-util';
import { IACMarkdownEditor } from './acmarkdown-editor-interface';

export class ACMarkdownEditorUi {
  private contentElement: HTMLElement;

  constructor(vditor: IACMarkdownEditor) {
    // const vditorElement = document.getElementById(vditor.id);
    const vditorElement = vditor.rootElement;
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

    this.contentElement = document.createElement('div');
    this.contentElement.className = 'vditor-content';

    // if (vditor.wysiwyg) {
    //     this.contentElement.appendChild(vditor.wysiwyg.element);
    // }

    if (vditor.editor) {
      this.contentElement.appendChild(vditor.editor.element);
    }

    if (vditor.preview) {
      this.contentElement.appendChild(vditor.preview.element);
    }

    // if (vditor.toolbar.elements.devtools) {
    //     this.contentElement.appendChild(vditor.devtools.element);
    // }

    if (vditor.options.counter > 0) {
      this.contentElement.appendChild(vditor.counter.element);
    }

    if (vditor.upload) {
      this.contentElement.appendChild(vditor.upload.element);
    }

    if (vditor.options.resize.enable) {
      this.contentElement.appendChild(vditor.resize.element);
    }

    if (vditor.hint) {
      this.contentElement.appendChild(vditor.hint.element);
    }

    this.contentElement.appendChild(vditor.tip.element);

    vditorElement.appendChild(this.contentElement);

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

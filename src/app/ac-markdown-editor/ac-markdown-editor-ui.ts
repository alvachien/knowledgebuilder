import { formatRender, html2md } from './ac-markdown-editor-util';
import { IACMEditor } from './ac-markdown-editor-interfaces';
import { classPrefix } from './ac-markdown-editor-constants';
import { renderDomByMd } from './ac-markdown-editor-wysiwyg';

// UI
export class ACMEditorUi {
  private contentElement: HTMLElement;

  constructor(editor: IACMEditor) {
    // const editorElement = document.getElementById(editor.id);
    const editorElement = editor.host;
    editorElement.innerHTML = '';
    editorElement.className = classPrefix + (editorElement.className ? ' ' + editorElement.className : '');
    if (typeof editor.options.height === 'number') {
      editorElement.style.height = editor.options.height + 'px';
    }
    if (typeof editor.options.width === 'number') {
      editorElement.style.width = editor.options.width + 'px';
    } else {
      editorElement.style.width = editor.options.width;
    }

    const toolbarElement = document.createElement('div');
    toolbarElement.className = `${classPrefix}-toolbar`;
    Object.keys(editor.toolbar.elements).forEach((key) => {
      toolbarElement.appendChild(editor.toolbar.elements[key]);
    });

    editorElement.appendChild(toolbarElement);

    this.contentElement = document.createElement('div');
    this.contentElement.className = `${classPrefix}-content`;

    if (editor.wysiwyg) {
      this.contentElement.appendChild(editor.wysiwyg.element);
    }

    if (editor.editor) {
      this.contentElement.appendChild(editor.editor.element);
    }

    if (editor.preview) {
      this.contentElement.appendChild(editor.preview.element);
    }

    if (editor.options.counter > 0) {
      this.contentElement.appendChild(editor.counter.element);
    }

    if (editor.upload) {
      this.contentElement.appendChild(editor.upload.element);
    }

    if (editor.options.resize.enable) {
      this.contentElement.appendChild(editor.resize.element);
    }

    this.contentElement.appendChild(editor.tip.element);

    editorElement.appendChild(this.contentElement);

    this.afterRender(editor);
  }

  private async afterRender(editor: IACMEditor) {
    let height: number = Math.max(editor.editor.element.parentElement.offsetHeight, 20);
    if (height < 21 && typeof editor.options.height === 'number') {
      height = editor.options.height - 37;
    }

    if (editor.editor) {
      editor.editor.element.style.paddingBottom = height / 2 + 'px';
    }

    if (editor.wysiwyg) {
        const padding = (editor.wysiwyg.element.parentElement.scrollWidth - editor.options.preview.maxWidth) / 2;
        editor.wysiwyg.element.style.padding = `10px ${Math.max(10, padding)}px ${height / 2}px`;
    }

    // set default value
    let initValue = localStorage.getItem(classPrefix + editor.id);
    if (!editor.options.cache || !initValue) {
        initValue = await html2md(editor, editor.originalInnerHTML);
    }
    if (!initValue) {
        return;
    }

    if (editor.options.mode.indexOf('wysiwyg') > -1) {
        renderDomByMd(editor, initValue);
    }

    if (editor.options.mode.indexOf('markdown') > -1) {
        formatRender(editor, initValue, undefined, false);
    }
  }
}

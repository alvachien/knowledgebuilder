import { formatRender, html2md } from './ac-markdown-editor-util';
import { IACMEditor } from './ac-markdown-editor-interfaces';
import { classPrefix } from './ac-markdown-editor-constants';

// UI
export class ACMEditorUi {
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

    const contentElement = document.createElement('div');
    contentElement.className = `${classPrefix}-content`;
    contentElement.appendChild(editor.editor.element);

    if (editor.preview) {
      contentElement.appendChild(editor.preview.element);
    }

    if (editor.options.counter > 0) {
      contentElement.appendChild(editor.counter.element);
    }

    if (editor.upload) {
      contentElement.appendChild(editor.upload.element);
    }

    if (editor.options.resize.enable) {
      contentElement.appendChild(editor.resize.element);
    }

    contentElement.appendChild(editor.tip.element);

    editorElement.appendChild(contentElement);

    this.afterRender(editor);
  }

  private async afterRender(editor: IACMEditor) {
    let height: number = Math.max(editor.editor.element.parentElement.offsetHeight, 20);
    if (height < 21 && typeof editor.options.height === 'number') {
      height = editor.options.height - 37;
    }
    editor.editor.element.style.paddingBottom = height / 2 + 'px';

    // const localValue = localStorage.getItem('editor' + editor.id);
    const localValue = localStorage.getItem('editor' + editor.host.id);
    if (editor.options.cache && localValue) {
      formatRender(editor, localValue, undefined, false);
    } else {
      if (!editor.originalInnerHTML.trim()) {
        return;
      }
      const mdValue = await html2md(editor, editor.originalInnerHTML);
      formatRender(editor, mdValue, undefined, false);
    }
  }
}

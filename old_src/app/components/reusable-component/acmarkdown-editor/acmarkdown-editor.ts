import { IACMarkdownEditor, IACMarkdownEditorOptions } from './acmarkdown-editor-interface';
import { ACMarkdownEditorCounter } from './acmarkdown-editor-counter';
import { ACMarkdownEditorControl } from './acmarkdown-editor-control';
import { ACMarkdownEditorResize } from './acmarkdown-editor-resize';
import { ACMarkdownEditorPreview } from './acmarkdown-editor-preview';
import { ACMarkdownEditorHint } from './acmarkdown-editor-hint';
import { ACMarkdownEditorUi } from './acmarkdown-editor-ui';
import {
  getText, getSelectText, setSelectionByPosition, html2md, selectIsEditor, insertText,
  formatRender, getCursorPosition
} from './acmarkdown-editor-util';
import { ACMarkdownEditorTip } from './acmarkdown-editor-tip';
import { ACMarkdownEditorUndo } from './acmarkdown-editor-undo';
import { ACMarkdownEditorUpload } from './acmarkdown-editor-upload';
import { ACMarkdownEditorOptions } from './acmarkdown-editor-options';
import { ACMarkdownEditorToolbar } from './acmarkdown-editor-toolbar';
import * as marked from 'marked';

export class ACMarkdownEditor {
  public vditor: IACMarkdownEditor;

  constructor(id: string, rootElement: HTMLElement, options?: IACMarkdownEditorOptions) {

    const getOptions = new ACMarkdownEditorOptions(options);
    const mergedOptions = getOptions.merge();

    const markedRender = new marked.Renderer();
    markedRender.paragraph = (text: any) => {
      const isTeXInline = /\$(.*)\$/g.test(text);
      const isTeXLine = /^\$\$(.*)\$\$$/.test(text);
      const isTeXAddClass = (isTeXLine) ? ' class="katex"' : '';

      if (!isTeXLine && isTeXInline) {
        text = text.replace(/(\$([^\$]*)\$)+/g, ($1, $2) => {
          return `<span class="katex">` + $2.replace(/\$/g, '') + `</span>`;
        });
      } else {
        text = (isTeXLine) ? text.replace(/\$/g, '') : text;
      }

      return '<p' + isTeXAddClass + '>' + text + '</p>\n';
    };
    mergedOptions.markedOption = {
      renderer: markedRender,
      gfm: true,
      tables: true,
      breaks: true,
      pedantic: false,
      smartLists: true,
      smartypants: true
    };

    this.vditor = {
      id,
      rootElement,
      currentMode: mergedOptions.mode.indexOf('wysiwyg') > -1 ? 'wysiwyg' : 'markdown',
      currentPreviewMode: mergedOptions.preview.mode,
      options: mergedOptions,
      originalInnerHTML: '',
      tip: new ACMarkdownEditorTip(),
      undo: undefined,
    };

    if (mergedOptions.counter > 0) {
      const counter = new ACMarkdownEditorCounter(this.vditor);
      this.vditor.counter = counter;
    }

    const editor = new ACMarkdownEditorControl(this.vditor);
    this.vditor.editor = editor;
    this.vditor.undo = new ACMarkdownEditorUndo();

    if (mergedOptions.resize.enable) {
      const resize = new ACMarkdownEditorResize(this.vditor);
      this.vditor.resize = resize;
    }

    if (mergedOptions.toolbar) {
      const toolbar: ACMarkdownEditorToolbar = new ACMarkdownEditorToolbar(this.vditor);
      this.vditor.toolbar = toolbar;
    }

    if (this.vditor.toolbar.elements.preview || this.vditor.toolbar.elements.both) {
      const preview = new ACMarkdownEditorPreview(this.vditor);
      this.vditor.preview = preview;
    }

    if (mergedOptions.upload.url || mergedOptions.upload.handler) {
      const upload = new ACMarkdownEditorUpload();
      this.vditor.upload = upload;
    }

    const ui = new ACMarkdownEditorUi(this.vditor);

    if (this.vditor.options.hint.at || this.vditor.toolbar.elements.emoji) {
      const hint = new ACMarkdownEditorHint();
      this.vditor.hint = hint;
    }
  }

  public getValue() {
    return getText(this.vditor.editor.element);
  }

  public focus() {
    this.vditor.editor.element.focus();
  }

  public blur() {
    this.vditor.editor.element.blur();
  }

  public disabled() {
    this.vditor.editor.element.setAttribute('contenteditable', 'false');
  }

  public enable() {
    this.vditor.editor.element.setAttribute('contenteditable', 'true');
  }

  public setSelection(start: number, end: number) {
    setSelectionByPosition(start, end, this.vditor.editor.element);
  }

  public getSelection() {
    let selectText = '';
    if (window.getSelection().rangeCount !== 0) {
      selectText = getSelectText(this.vditor.editor.element);
    }
    return selectText;
  }

  public renderPreview(value?: string) {
    this.vditor.preview.render(this.vditor, value);
  }

  public getCursorPosition() {
    return getCursorPosition(this.vditor.editor.element);
  }

  public isUploading() {
    return this.vditor.upload.isUploading;
  }

  public clearCache() {
    localStorage.removeItem('vditor' + this.vditor.id);
  }

  public disabledCache() {
    this.vditor.options.cache = false;
  }

  public enableCache() {
    this.vditor.options.cache = true;
  }

  public html2md(value: string) {
    return html2md(this.vditor, value);
  }

  public tip(text: string, time?: number) {
    this.vditor.tip.show(text, time);
  }

  public setPreviewMode(mode: string) {
    let toolbarItemClassName;
    switch (mode) {
      case 'both':
        if (!this.vditor.toolbar.elements.both) {
          return;
        }
        toolbarItemClassName = this.vditor.toolbar.elements.both.children[0].className;
        if (toolbarItemClassName.indexOf('vditor-menu--current') === -1) {
          this.vditor.preview.element.className = 'vditor-preview vditor-preview--both';
          this.vditor.toolbar.elements.both.children[0].className =
            `${toolbarItemClassName} vditor-menu--current`;
          if (!this.vditor.toolbar.elements.preview) {
            return;
          }
          this.vditor.toolbar.elements.preview.children[0].className =
            this.vditor.toolbar.elements.preview.children[0].className.replace(' vditor-menu--current', '');
        }
        break;
      case 'editor':
        if (!this.vditor.preview) {
          return;
        }
        if (this.vditor.preview.element.className !== 'vditor-preview vditor-preview--editor') {
          this.vditor.preview.element.className = 'vditor-preview vditor-preview--editor';
          if (this.vditor.toolbar.elements.preview) {
            this.vditor.toolbar.elements.preview.children[0].className =
              this.vditor.toolbar.elements.preview.children[0].className
                .replace(' vditor-menu--current', '');
          }
          if (this.vditor.toolbar.elements.both) {
            this.vditor.toolbar.elements.both.children[0].className =
              this.vditor.toolbar.elements.both.children[0].className
                .replace(' vditor-menu--current', '');
          }
        }
        break;
      case 'preview':
        if (!this.vditor.toolbar.elements.preview) {
          return;
        }
        toolbarItemClassName = this.vditor.toolbar.elements.preview.children[0].className;
        if (toolbarItemClassName.indexOf('vditor-menu--current') === -1) {
          this.vditor.preview.element.className = 'vditor-preview vditor-preview--preview';
          this.vditor.toolbar.elements.preview.children[0].className =
            `${toolbarItemClassName} vditor-menu--current`;
          if (!this.vditor.toolbar.elements.both) {
            return;
          }
          this.vditor.toolbar.elements.both.children[0].className =
            this.vditor.toolbar.elements.both.children[0].className.replace(' vditor-menu--current', '');
        }
        break;
      default:
        break;
    }
  }

  public deleteValue() {
    if (selectIsEditor(this.vditor.editor.element)) {
      if (window.getSelection().isCollapsed) {
        return;
      }
      insertText(this.vditor, '', '', true);
    }
  }

  public updateValue(value: string) {
    if (selectIsEditor(this.vditor.editor.element)) {
      insertText(this.vditor, value, '', true);
    }
  }

  public insertValue(value: string) {
    if (selectIsEditor(this.vditor.editor.element)) {
      insertText(this.vditor, value, '');
    }
  }

  public setValue(value: string) {
    formatRender(this.vditor, value, {
      end: value.length,
      start: value.length,
    });
    if (!value) {
      localStorage.removeItem('vditor' + this.vditor.id);
    }
  }
}

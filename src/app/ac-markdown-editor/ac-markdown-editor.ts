import { IACMEditor, IACMEOptions } from './ac-markdown-editor-interfaces';
import { ACMEditorCounter } from './ac-markdown-editor-counter';
import { formatRender, getSelectText, getText, html2md,
  insertText, setSelectionByPosition, getCursorPosition, } from './ac-markdown-editor-util';
import { ACMEditorControl } from './ac-markdown-editor-control';
import { ACMEditorHint } from './ac-markdown-editor-hint';
import { ACMEditorHotkey } from './ac-markdown-editor-hotkey';
import { abcRender, chartRender, codeRender, highlightRender, mathRender,
  mediaRender, previewRender, mermaidRender,
  loadLuteJs, md2htmlByPreview, md2htmlByEditor, } from './ac-markdown-editor-render';
import { ACMEditorPreview } from './ac-markdown-editor-preview';
import { ACMEditorResize } from './ac-markdown-editor-resize';
import { ACMEditorTip } from './ac-markdown-editor-tip';
import { ACMEditorToolbar } from './ac-markdown-editor-toolbar';
import { ACMEditorUi } from './ac-markdown-editor-ui';
import { ACMEditorUndo } from './ac-markdown-editor-undo';
import { ACMEditorUpload } from './ac-markdown-editor-upload';
import { ACMEditorOptions } from './ac-markdown-editor-options';
import { classPrefix } from './ac-markdown-editor-constants';

export class ACMEditor {

  public static codeRender = codeRender;
  public static highlightRender = highlightRender;
  public static mathRender = mathRender;
  public static mermaidRender = mermaidRender;
  public static chartRender = chartRender;
  public static abcRender = abcRender;
  public static mediaRender = mediaRender;
  public static md2html = md2htmlByPreview;
  public static preview = previewRender;
  public readonly version: string;
  public editor: IACMEditor;

  constructor(hostElement: HTMLElement, options?: IACMEOptions) {
    const getOptions = new ACMEditorOptions(options);
    const mergedOptions = getOptions.merge();

    this.editor = {
      // id,
      host: hostElement,
      lute: undefined,
      options: mergedOptions,
      // originalInnerHTML: document.getElementById(id).innerHTML,
      originalInnerHTML: hostElement.innerHTML,
      tip: new ACMEditorTip(),
      undo: undefined,
    };

    if (mergedOptions.counter > 0) {
      const counter = new ACMEditorCounter(this.editor);
      this.editor.counter = counter;
    }

    const editor = new ACMEditorControl(this.editor);
    this.editor.editor = editor;
    this.editor.undo = new ACMEditorUndo();

    if (mergedOptions.resize.enable) {
      const resize = new ACMEditorResize(this.editor);
      this.editor.resize = resize;
    }

    if (mergedOptions.toolbar) {
      const toolbar: ACMEditorToolbar = new ACMEditorToolbar(this.editor);
      this.editor.toolbar = toolbar;
    }

    loadLuteJs(this.editor).then(() => {
      if (this.editor.toolbar.elements.preview || this.editor.toolbar.elements.both) {
        const preview = new ACMEditorPreview(this.editor);
        this.editor.preview = preview;
      }

      if (mergedOptions.upload.url || mergedOptions.upload.handler) {
        const upload = new ACMEditorUpload();
        this.editor.upload = upload;
      }

      const ui = new ACMEditorUi(this.editor);

      if (this.editor.options.hint.at || this.editor.toolbar.elements.emoji) {
        const hint = new ACMEditorHint(this.editor);
        this.editor.hint = hint;
      }
      const hotkey = new ACMEditorHotkey(this.editor);
    });
  }

  public getValue() {
    return getText(this.editor.editor.element);
  }

  public focus() {
    this.editor.editor.element.focus();
  }

  public blur() {
    this.editor.editor.element.blur();
  }

  public disabled() {
    this.editor.editor.element.setAttribute('contenteditable', 'false');
  }

  public enable() {
    this.editor.editor.element.setAttribute('contenteditable', 'true');
  }

  public setSelection(start: number, end: number) {
    setSelectionByPosition(start, end, this.editor.editor.element);
  }

  public getSelection() {
    let selectText = '';
    if (window.getSelection().rangeCount !== 0) {
      selectText = getSelectText(this.editor.editor.element);
    }
    return selectText;
  }

  public renderPreview(value?: string) {
    this.editor.preview.render(this.editor, value);
  }

  public getCursorPosition() {
    return getCursorPosition(this.editor.editor.element);
  }

  public isUploading() {
    return this.editor.upload.isUploading;
  }

  public clearCache() {
    localStorage.removeItem('editor' + this.editor.host.id);
  }

  public disabledCache() {
    this.editor.options.cache = false;
  }

  public enableCache() {
    this.editor.options.cache = true;
  }

  public html2md(value: string) {
    return html2md(this.editor, value);
  }

  public getHTML() {
    return md2htmlByEditor(getText(this.editor.editor.element), this.editor);
  }

  public tip(text: string, time?: number) {
    this.editor.tip.show(text, time);
  }

  public setPreviewMode(mode: string) {
    let toolbarItemClassName;
    switch (mode) {
      case 'both':
        if (!this.editor.toolbar.elements.both) {
          return;
        }
        toolbarItemClassName = this.editor.toolbar.elements.both.children[0].className;
        if (toolbarItemClassName.indexOf(`${classPrefix}-menu--current`) === -1) {
          this.editor.preview.element.className = `${classPrefix}-preview ${classPrefix}-preview--both`;
          this.editor.toolbar.elements.both.children[0].className =
            `${toolbarItemClassName} ${classPrefix}-menu--current`;
          if (!this.editor.toolbar.elements.preview) {
            return;
          }
          this.editor.toolbar.elements.preview.children[0].className =
            this.editor.toolbar.elements.preview.children[0].className.replace(` ${classPrefix}-menu--current`, '');
        }
        break;
      case 'editor':
        if (!this.editor.preview) {
          return;
        }
        if (this.editor.preview.element.className !== `${classPrefix}-preview ${classPrefix}-preview--editor`) {
          this.editor.preview.element.className = `${classPrefix}-preview ${classPrefix}-preview--editor`;
          if (this.editor.toolbar.elements.preview) {
            this.editor.toolbar.elements.preview.children[0].className =
              this.editor.toolbar.elements.preview.children[0].className
                .replace(` ${classPrefix}-menu--current`, '');
          }
          if (this.editor.toolbar.elements.both) {
            this.editor.toolbar.elements.both.children[0].className =
              this.editor.toolbar.elements.both.children[0].className
                .replace(` ${classPrefix}-menu--current`, '');
          }
        }
        break;
      case 'preview':
        if (!this.editor.toolbar.elements.preview) {
          return;
        }
        toolbarItemClassName = this.editor.toolbar.elements.preview.children[0].className;
        if (toolbarItemClassName.indexOf(`${classPrefix}-menu--current`) === -1) {
          this.editor.preview.element.className = `${classPrefix}-preview ${classPrefix}-preview--preview`;
          this.editor.toolbar.elements.preview.children[0].className =
            `${toolbarItemClassName} ${classPrefix}-menu--current`;
          if (!this.editor.toolbar.elements.both) {
            return;
          }
          this.editor.toolbar.elements.both.children[0].className =
            this.editor.toolbar.elements.both.children[0].className.replace(` ${classPrefix}-menu--current`, '');
        }
        break;
      default:
        break;
    }
  }

  public deleteValue() {
    if (window.getSelection().isCollapsed) {
      return;
    }
    insertText(this.editor, '', '', true);
  }

  public updateValue(value: string) {
    insertText(this.editor, value, '', true);
  }

  public insertValue(value: string) {
    insertText(this.editor, value, '');
  }

  public setValue(value: string) {
    formatRender(this.editor, value, {
      end: value.length,
      start: value.length,
    });
    if (!value) {
      // localStorage.removeItem('editor' + this.editor.id);
      localStorage.removeItem('editor' + this.editor.host.id);
    }
  }
}


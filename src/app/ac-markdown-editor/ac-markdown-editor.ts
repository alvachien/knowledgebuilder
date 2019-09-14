import { IACMEditor, IACMEOptions } from './ac-markdown-editor-interfaces';
import { ACMEditorCounter } from './ac-markdown-editor-counter';
import { formatRender, getSelectText, getText, html2md,
  insertText, setSelectionByPosition, getCursorPosition, } from './ac-markdown-editor-util';
import { ACMEditorControl } from './ac-markdown-editor-control';
import { ACMEditorHint } from './ac-markdown-editor-hint';
import { ACMEditorHotkey } from './ac-markdown-editor-hotkey';
import { abcRender, chartRender, codeRender, highlightRender, mathRender,
  mediaRender, previewRender, mermaidRender,
  loadLuteJs, md2htmlByPreview, md2htmlByVditor, } from './ac-markdown-editor-render';
import { ACMEditorPreview } from './ac-markdown-editor-preview';
import { ACMEditorResize } from './ac-markdown-editor-resize';
import { ACMEditorTip } from './ac-markdown-editor-tip';
import { ACMEditorToolbar } from './ac-markdown-editor-toolbar';
import { ACMEditorUi } from './ac-markdown-editor-ui';
import { ACMEditorUndo } from './ac-markdown-editor-undo';
import { ACMEditorUpload } from './ac-markdown-editor-upload';
import { ACMEditorOptions } from './ac-markdown-editor-options';

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
  public vditor: IACMEditor;

  constructor(id: string, options?: IACMEOptions) {
    const getOptions = new ACMEditorOptions(options);
    const mergedOptions = getOptions.merge();

    this.vditor = {
      id,
      lute: undefined,
      options: mergedOptions,
      originalInnerHTML: document.getElementById(id).innerHTML,
      tip: new ACMEditorTip(),
      undo: undefined,
    };

    if (mergedOptions.counter > 0) {
      const counter = new ACMEditorCounter(this.vditor);
      this.vditor.counter = counter;
    }

    const editor = new ACMEditorControl(this.vditor);
    this.vditor.editor = editor;
    this.vditor.undo = new ACMEditorUndo();

    if (mergedOptions.resize.enable) {
      const resize = new ACMEditorResize(this.vditor);
      this.vditor.resize = resize;
    }

    if (mergedOptions.toolbar) {
      const toolbar: ACMEditorToolbar = new ACMEditorToolbar(this.vditor);
      this.vditor.toolbar = toolbar;
    }

    loadLuteJs(this.vditor).then(() => {
      if (this.vditor.toolbar.elements.preview || this.vditor.toolbar.elements.both) {
        const preview = new ACMEditorPreview(this.vditor);
        this.vditor.preview = preview;
      }

      if (mergedOptions.upload.url || mergedOptions.upload.handler) {
        const upload = new ACMEditorUpload();
        this.vditor.upload = upload;
      }

      const ui = new ACMEditorUi(this.vditor);

      if (this.vditor.options.hint.at || this.vditor.toolbar.elements.emoji) {
        const hint = new ACMEditorHint(this.vditor);
        this.vditor.hint = hint;
      }
      const hotkey = new ACMEditorHotkey(this.vditor);
    });
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

  public getHTML() {
    return md2htmlByVditor(getText(this.vditor.editor.element), this.vditor);
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
    if (window.getSelection().isCollapsed) {
      return;
    }
    insertText(this.vditor, '', '', true);
  }

  public updateValue(value: string) {
    insertText(this.vditor, value, '', true);
  }

  public insertValue(value: string) {
    insertText(this.vditor, value, '');
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


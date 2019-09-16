import { inputEvent, getText, getSelectText, html2md, insertText, } from './ac-markdown-editor-util';
import { uploadFiles } from './ac-markdown-editor-upload';
import { IACMEditor } from './ac-markdown-editor-interfaces';
import { classPrefix } from './ac-markdown-editor-constants';

///
/// Control
///
export class ACMEditorControl {
  public element: HTMLPreElement;
  public range: Range;

  constructor(editor: IACMEditor) {
    this.element = document.createElement('pre');
    this.element.className = classPrefix + '-textarea';
    this.element.setAttribute('placeholder', editor.options.placeholder);
    this.element.setAttribute('contenteditable', 'true');
    this.element.innerHTML = '<span><br><span style=\'display: none\'>\n</span></span>';
    this.bindEvent(editor);
  }

  private bindEvent(editor: IACMEditor) {
    this.element.addEventListener('input', () => {
      inputEvent(editor);
      // 选中多行后输入任意字符，br 后无 \n
      this.element.querySelectorAll('br').forEach((br) => {
        if (!br.nextElementSibling) {
          br.insertAdjacentHTML('afterend', '<span style=\'display: none\'>\n</span>');
        }
      });
    });

    this.element.addEventListener('focus', () => {
      if (editor.options.focus) {
        editor.options.focus(getText(this.element));
      }
      if (editor.toolbar.elements.emoji && editor.toolbar.elements.emoji.children[1]) {
        const emojiPanel = editor.toolbar.elements.emoji.children[1] as HTMLElement;
        emojiPanel.style.display = 'none';
      }
      if (editor.toolbar.elements.headings && editor.toolbar.elements.headings.children[1]) {
        const headingsPanel = editor.toolbar.elements.headings.children[1] as HTMLElement;
        headingsPanel.style.display = 'none';
      }
    });

    this.element.addEventListener('blur', () => {
      if (navigator.userAgent.indexOf('Firefox') === -1) {
        this.range = window.getSelection().getRangeAt(0).cloneRange();
      }
      if (editor.options.blur) {
        editor.options.blur(getText(this.element));
      }
    });

    if (editor.options.select) {
      this.element.addEventListener('mouseup', () => {
        this.range = window.getSelection().getRangeAt(0).cloneRange();
        const selectText = getSelectText(this.element);
        if (selectText === '') {
          return;
        }
        editor.options.select(selectText);
      });
    }

    this.element.addEventListener('scroll', () => {
      const classeditor = classPrefix + '-preview ' + classPrefix + '-preview-editor';
      const classpreview = classPrefix + '-preview ' + classPrefix + '-preview-editor';
      if (!editor.preview && (editor.preview.element.className === classeditor ||
        editor.preview.element.className === classpreview)) {
        return;
      }
      const textScrollTop = this.element.scrollTop;
      const textHeight = this.element.clientHeight;
      const textScrollHeight = this.element.scrollHeight - parseFloat(this.element.style.paddingBottom);
      const preview = editor.preview.element;
      if ((textScrollTop / textHeight > 0.5)) {
        preview.scrollTop = (textScrollTop + textHeight) *
          preview.scrollHeight / textScrollHeight - textHeight;
      } else {
        preview.scrollTop = textScrollTop *
          preview.scrollHeight / textScrollHeight;
      }
    });

    if (editor.options.upload.url || editor.options.upload.handler) {
      this.element.addEventListener('drop', (event: CustomEvent & { dataTransfer?: DataTransfer }) => {
        event.stopPropagation();
        event.preventDefault();

        const files = event.dataTransfer.items;
        if (files.length === 0) {
          return;
        }

        uploadFiles(editor, files);
      });
    }

    this.element.addEventListener('copy', async (event: ClipboardEvent) => {
      event.stopPropagation();
      event.preventDefault();
      event.clipboardData.setData('text/plain', getSelectText(this.element));
    });

    this.element.addEventListener('paste', async (event: ClipboardEvent) => {
      const textHTML = event.clipboardData.getData('text/html');
      const textPlain = event.clipboardData.getData('text/plain');
      event.stopPropagation();
      event.preventDefault();
      if (textHTML.trim() !== '') {
        if (textHTML.length < 106496) {
          if (textHTML.replace(/<(|\/)(html|body|meta)[^>]*?>/ig, '').trim() ===
            `<a href='${textPlain}'>${textPlain}</a>` ||
            textHTML.replace(/<(|\/)(html|body|meta)[^>]*?>/ig, '').trim() ===
            `<!--StartFragment--><a href='${textPlain}'>${textPlain}</a><!--EndFragment-->`) {
          } else {
            const mdValue = await html2md(editor, textHTML, textPlain);
            insertText(editor, mdValue, '', true);
            return;
          }
        }
      } else if (textPlain.trim() !== '' && event.clipboardData.files.length === 0) {
      } else if (event.clipboardData.files.length > 0) {
        // upload file
        if (!(editor.options.upload.url || editor.options.upload.handler)) {
          return;
        }
        // NOTE: not work in Safari.
        // maybe the browser considered local filesystem as the same domain as the pasted data
        uploadFiles(editor, event.clipboardData.files);
        return;
      }
      insertText(editor, textPlain, '', true);
    });
  }
}

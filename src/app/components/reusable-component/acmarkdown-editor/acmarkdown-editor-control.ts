import { inputEvent, getText, getSelectText, insertText, html2md } from './acmarkdown-editor-util';
import { IACMarkdownEditor } from './acmarkdown-editor-interface';
import { uploadFiles } from './acmarkdown-editor-upload';

export class ACMarkdownEditorControl {
  public element: HTMLPreElement;
  public range: Range;

  constructor(vditor: IACMarkdownEditor) {
    this.element = document.createElement('pre');
    this.element.className = 'vditor-textarea';
    this.element.setAttribute('placeholder', vditor.options.placeholder);
    this.element.setAttribute('contenteditable', 'true');
    this.element.innerHTML = '<span><br><span style="display: none">\n</span></span>';
    this.bindEvent(vditor);
  }

  private bindEvent(vditor: IACMarkdownEditor) {
    this.element.addEventListener('input', () => {
      inputEvent(vditor);
      // 选中多行后输入任意字符，br 后无 \n
      this.element.querySelectorAll('br').forEach((br) => {
        if (!br.nextElementSibling) {
          br.insertAdjacentHTML('afterend', '<span style="display: none">\n</span>');
        }
      });
    });

    this.element.addEventListener('focus', () => {
      if (vditor.options.focus) {
        vditor.options.focus(getText(this.element));
      }
      if (vditor.toolbar.elements.emoji && vditor.toolbar.elements.emoji.children[1]) {
        const emojiPanel = vditor.toolbar.elements.emoji.children[1] as HTMLElement;
        emojiPanel.style.display = 'none';
      }
      if (vditor.toolbar.elements.headings && vditor.toolbar.elements.headings.children[1]) {
        const headingsPanel = vditor.toolbar.elements.headings.children[1] as HTMLElement;
        headingsPanel.style.display = 'none';
      }
    });

    this.element.addEventListener('blur', () => {
      if (navigator.userAgent.indexOf('Firefox') === -1) {
        this.range = window.getSelection().getRangeAt(0).cloneRange();
      }
      if (vditor.options.blur) {
        vditor.options.blur(getText(this.element));
      }
    });

    if (vditor.options.select) {
      this.element.addEventListener('mouseup', () => {
        this.range = window.getSelection().getRangeAt(0).cloneRange();
        const selectText = getSelectText(this.element);
        if (selectText === '') {
          return;
        }
        vditor.options.select(selectText);
      });
    }

    this.element.addEventListener('scroll', () => {
      if (!vditor.preview && (vditor.preview.element.className === 'vditor-preview vditor-preview--editor' ||
        vditor.preview.element.className === 'vditor-preview vditor-preview--preview')) {
        return;
      }
      const textScrollTop = this.element.scrollTop;
      const textHeight = this.element.clientHeight;
      const textScrollHeight = this.element.scrollHeight - parseFloat(this.element.style.paddingBottom);
      const preview = vditor.preview.element;
      if ((textScrollTop / textHeight > 0.5)) {
        preview.scrollTop = (textScrollTop + textHeight) *
          preview.scrollHeight / textScrollHeight - textHeight;
      } else {
        preview.scrollTop = textScrollTop *
          preview.scrollHeight / textScrollHeight;
      }
    });

    if (vditor.options.upload.url || vditor.options.upload.handler) {
      this.element.addEventListener('drop', (event: CustomEvent & { dataTransfer?: DataTransfer }) => {
        event.stopPropagation();
        event.preventDefault();

        const files = event.dataTransfer.items;
        if (files.length === 0) {
          return;
        }

        uploadFiles(vditor, files);
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
          // https://github.com/b3log/vditor/issues/51
          if (textHTML.replace(/<(|\/)(html|body|meta)[^>]*?>/ig, '').trim() ===
            `<a href='${textPlain}'>${textPlain}</a>` ||
            textHTML.replace(/<(|\/)(html|body|meta)[^>]*?>/ig, '').trim() ===
            `<!--StartFragment--><a href='${textPlain}'>${textPlain}</a><!--EndFragment-->`) {
            // https://github.com/b3log/vditor/issues/37
          } else {
            const mdValue = await html2md(vditor, textHTML, textPlain);
            insertText(vditor, mdValue, '', true);
            return;
          }
        }
      } else if (textPlain.trim() !== '' && event.clipboardData.files.length === 0) {
        // https://github.com/b3log/vditor/issues/67
      } else if (event.clipboardData.files.length > 0) {
        // upload file
        if (!(vditor.options.upload.url || vditor.options.upload.handler)) {
          return;
        }
        // NOTE: not work in Safari.
        // maybe the browser considered local filesystem as the same domain as the pasted data
        uploadFiles(vditor, event.clipboardData.files);
        return;
      }
      insertText(vditor, textPlain, '', true);
    });
  }
}

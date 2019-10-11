import { IACMarkdownEditor } from './acmarkdown-editor-interface';
import { gfm } from './acmarkdown-editor-gfm';

export function code160to32(text: string): string {
  // 非打断空格转换为空格
  return text.replace(/\u00a0/g, ' ');
}

export function getText(element: HTMLPreElement): string {
  // last char must be a `\n`.
  return code160to32(`${element.textContent}\n`.replace(/\n\n$/, '\n'));
}

export function inputEvent(vditor: IACMarkdownEditor, addUndo: boolean = true) {
  if (vditor.options.counter > 0) {
    vditor.counter.render(getText(vditor.editor.element).length, vditor.options.counter);
  }
  if (typeof vditor.options.input === 'function') {
    vditor.options.input(getText(vditor.editor.element), vditor.preview && vditor.preview.element);
  }
  if (vditor.hint) {
    vditor.hint.render();
  }
  if (vditor.options.cache) {
    localStorage.setItem(`vditor${vditor.id}`, getText(vditor.editor.element));
  }
  if (vditor.preview) {
    vditor.preview.render(vditor);
  }
  if (addUndo) {
    vditor.undo.addToUndoStack(vditor);
  }
}

export function setSelectionFocus(range: Range) {
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

export function selectIsEditor(editor: HTMLPreElement, range?: Range) {
  let isEditor = false;
  if (!range) {
    if (window.getSelection().rangeCount === 0) {
      return isEditor;
    } else {
      range = window.getSelection().getRangeAt(0);
    }
  }
  let container = range.commonAncestorContainer;
  while (container) {
    if (editor.isEqualNode(container)) {
      isEditor = true;
      container = undefined;
    }
    if (container) {
      if (container.nodeName === 'BODY') {
        container = undefined;
      } else {
        container = container.parentElement;
      }
    }
  }
  return isEditor;
}

export function getSelectPosition(editorElement: HTMLPreElement, range?: Range) {
  const position = {
    end: 0,
    start: 0,
  };

  if (!range) {
    if (window.getSelection().rangeCount === 0) {
      return position;
    }
    range = window.getSelection().getRangeAt(0);
  }

  if (selectIsEditor(editorElement, range)) {
    const preSelectionRange = range.cloneRange();
    if (editorElement.childNodes[0] && editorElement.childNodes[0].childNodes[0]) {
      preSelectionRange.setStart(editorElement.childNodes[0].childNodes[0], 0);
    } else {
      preSelectionRange.selectNodeContents(editorElement);
    }
    if (range.startContainer.childNodes.length === 1 && range.startContainer.textContent.trim() === '') {
      preSelectionRange.setEnd(editorElement.childNodes[0].childNodes[0], 0);
    } else {
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
    }
    position.start = preSelectionRange.toString().length;
    position.end = position.start + range.toString().length;
  }
  return position;
}

export function setSelectionByPosition(start: number, end: number, editor: HTMLPreElement) {
  let charIndex = 0;
  let line = 0;
  let pNode = editor.childNodes[line];
  let foundStart = false;
  let stop = false;
  start = Math.max(0, start);
  end = Math.max(0, end);

  const range = editor.ownerDocument.createRange();
  range.setStart(pNode, 0);
  range.collapse(true);

  while (!stop && pNode) {
    const nextCharIndex = charIndex + pNode.textContent.length;
    if (!foundStart && start >= charIndex && start <= nextCharIndex) {
      if (start === 0) {
        range.setStart(pNode, 0);
      } else {
        if (pNode.childNodes[0].nodeType === 3) {
          range.setStart(pNode.childNodes[0], start - charIndex);
        } else if (pNode.nextSibling) {
          range.setStartBefore(pNode.nextSibling);
        } else {
          range.setStartAfter(pNode);
        }
      }
      foundStart = true;
      if (start === end) {
        stop = true;
        break;
      }
    }
    if (foundStart && end >= charIndex && end <= nextCharIndex) {
      if (end === 0) {
        range.setEnd(pNode, 0);
      } else {
        if (pNode.childNodes[0].nodeType === 3) {
          range.setEnd(pNode.childNodes[0], end - charIndex);
        } else if (pNode.nextSibling) {
          range.setEndBefore(pNode.nextSibling);
        } else {
          range.setEndAfter(pNode);
        }
      }
      stop = true;
    }
    charIndex = nextCharIndex;
    pNode = editor.childNodes[++line];
  }

  if (!stop && editor.childNodes[line - 1]) {
    range.setStartBefore(editor.childNodes[line - 1]);
  }

  setSelectionFocus(range);
  return range;
}

export function setSelectionByInlineText(text: string, childNodes: NodeListOf<ChildNode>) {
  let offset = 0;
  let startIndex = 0;
  Array.from(childNodes).some((node: HTMLElement, index: number) => {
    startIndex = node.textContent.indexOf(text);
    if (startIndex > -1 && childNodes[index].childNodes[0].nodeType === 3) {
      offset = index;
      return true;
    }
  });
  if (startIndex < 0) {
    return;
  }
  const range = document.createRange();
  range.setStart(childNodes[offset].childNodes[0], startIndex);
  range.setEnd(childNodes[offset].childNodes[0], startIndex + text.length);
  setSelectionFocus(range);
}
export function getSelectText(editor: HTMLPreElement, range?: Range) {
  if (!range) {
    if (window.getSelection().rangeCount === 0) {
      return '';
    } else {
      range = window.getSelection().getRangeAt(0);
    }
  }
  if (selectIsEditor(editor, range)) {
    return window.getSelection().toString();
  }
  return '';
}

export function formatRender(vditor: IACMarkdownEditor, content: string, position?: { start: number, end: number },
  addUndo: boolean = true) {

  const textList = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  let html = '';
  const newLine = '<span><br><span style="display: none">\n</span></span>';
  textList.forEach((text, index) => {
    if (index === textList.length - 1 && text === '') {
      return;
    }
    if (text) {
      html += `<span>${code160to32(text.replace(/&/g, '&amp;').replace(/</g, '&lt;'))}</span>${newLine}`;
    } else {
      html += newLine;
    }
  });

  // TODO: 使用虚拟 Dom
  vditor.editor.element.innerHTML = html || newLine;

  if (position) {
    setSelectionByPosition(position.start, position.end, vditor.editor.element);
  }

  inputEvent(vditor, addUndo);
}

export function insertText(vditor: IACMarkdownEditor, prefix: string, suffix: string, replace: boolean = false,
  toggle: boolean = false) {
  let range: Range = window.getSelection().getRangeAt(0);
  if (!selectIsEditor(vditor.editor.element)) {
    if (vditor.editor.range) {
      range = vditor.editor.range;
    } else {
      range = vditor.editor.element.ownerDocument.createRange();
      range.setStart(vditor.editor.element, 0);
      range.collapse(true);
    }
  }

  const position = getSelectPosition(vditor.editor.element, range);
  const content = getText(vditor.editor.element);

  // select none || select something and need replace
  if (range.collapsed || (!range.collapsed && replace)) {
    const text = prefix + suffix;
    formatRender(vditor, content.substring(0, position.start) + text + content.substring(position.end),
      {
        end: position.start + prefix.length,
        start: position.start + prefix.length,
      });
  } else {
    const selectText = content.substring(position.start, position.end);
    if (toggle && content.substring(position.start - prefix.length, position.start) === prefix
      && content.substring(position.end, position.end + suffix.length) === suffix) {
      formatRender(vditor, content.substring(0, position.start - prefix.length)
        + selectText + content.substring(position.end + suffix.length),
        {
          end: position.start - prefix.length + selectText.length,
          start: position.start - prefix.length,
        });
    } else {
      const text = prefix + selectText + suffix;
      formatRender(vditor, content.substring(0, position.start) + text + content.substring(position.end),
        {
          end: position.start + prefix.length + selectText.length,
          start: position.start + prefix.length,
        });
    }
  }
}

export async function html2md(vditor: IACMarkdownEditor, textHTML: string, textPlain?: string) {
  const { default: TurndownService } = await import(/* webpackChunkName: 'turndown' */ 'turndown');

  // process word
  const doc = new DOMParser().parseFromString(textHTML, 'text/html');
  if (doc.body) {
    textHTML = doc.body.innerHTML;
  }

  // no escape
  TurndownService.prototype.escape = (name: string) => {
    return name;
  };

  const turndownService = new TurndownService({
    blankReplacement: (blank: string) => {
      return blank;
    },
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    headingStyle: 'atx',
    hr: '---',
  });

  turndownService.addRule('vditorImage', {
    filter: 'img',
    replacement: (content: string, target: HTMLElement) => {
      const src = target.getAttribute('src');
      if (!src || src.indexOf('file://') === 0) {
        return '';
      }
      // 直接使用 API 或 setOriginal 时不需要对图片进行服务器上传，直接转换。
      // 目前使用 textPlain 判断是否来自 API 或 setOriginal
      if (vditor.options.upload.linkToImgUrl && textPlain) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', vditor.options.upload.linkToImgUrl);
        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            const responseJSON = JSON.parse(xhr.responseText);
            if (xhr.status === 200) {
              if (responseJSON.code !== 0) {
                alert(responseJSON.msg);
                return;
              }
              const original = responseJSON.data.originalURL;
              setSelectionByInlineText(original, vditor.editor.element.childNodes);
              insertText(vditor, responseJSON.data.url, '', true);
            } else {
              vditor.tip.show(responseJSON.msg);
            }
          }
        };
        xhr.send(JSON.stringify({ url: src }));
      }

      return `![${target.getAttribute('alt')}](${src})`;
    },
  });

  turndownService.use(gfm);

  const markdownStr = turndownService.turndown(textHTML);

  // process copy from IDE
  const tempElement = document.createElement('div');
  tempElement.innerHTML = textHTML;
  let isCode = false;
  if (tempElement.childElementCount === 1 &&
    (tempElement.lastElementChild as HTMLElement).style.fontFamily.indexOf('monospace') > -1) {
    // VS Code
    isCode = true;
  }
  const pres = tempElement.querySelectorAll('pre');
  if (tempElement.childElementCount === 1 && pres.length === 1 && pres[0].className !== 'vditor-textarea') {
    // IDE
    isCode = true;
  }

  if (isCode) {
    return '```\n' + (textPlain || textHTML) + '\n```';
  } else {
    return markdownStr;
  }
}
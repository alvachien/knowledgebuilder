import { IACMarkdownEditor, IACMarkdownEditorToolbarItem } from './acmarkdown-editor-interface';
import { gfm } from './acmarkdown-editor-gfm';
// import * as turndown from 'turndown';
declare var webkitAudioContext: {
  prototype: AudioContext
  new(contextOptions?: AudioContextOptions): AudioContext,
};

export function code160to32(text: string): string {
  // 非打断空格转换为空格
  return text.replace(/\u00a0/g, ' ');
}

export function getText(element: HTMLElement): string {
  // last char must be a `\n`.
  return code160to32(`${element.textContent}\n`.replace(/\n\n$/, '\n'));
}

function getContent(vditor: IACMarkdownEditor, editorElement: HTMLElement) {
  if (vditor.currentMode === 'wysiwyg') {
    return editorElement.textContent;
  } else {
    return getText(editorElement);
  }
}

export function inputEvent(vditor: IACMarkdownEditor, addUndo: boolean = true) {
  if (vditor.options.counter > 0) {
    vditor.counter.render(getText(vditor.editor.element).length, vditor.options.counter);
  }
  if (typeof vditor.options.input === 'function') {
    vditor.options.input(getText(vditor.editor.element), vditor.preview && vditor.preview.element);
  }
  if (vditor.hint) {
    vditor.hint.render(vditor);
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

export function focusEvent(vditor: IACMarkdownEditor, editorElement: HTMLElement) {
  editorElement.addEventListener('focus', () => {
    if (vditor.options.focus) {
      vditor.options.focus(getContent(vditor, editorElement));
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
}

export function copyEvent(editorElement: HTMLElement) {
  editorElement.addEventListener('copy', async (event: ClipboardEvent) => {
    event.stopPropagation();
    event.preventDefault();
    event.clipboardData.setData('text/plain', getSelectText(editorElement));
  });
}

export function scrollCenter(editorElement: HTMLElement) {
  const cursorTop = getCursorPosition(editorElement).top;
  const center = editorElement.clientHeight / 2;
  if (cursorTop > center) {
    editorElement.scrollTop = editorElement.scrollTop + (cursorTop - center);
  }
}

export function hotkeyEvent(vditor: IACMarkdownEditor, editorElement: HTMLElement) {
  const processKeymap = (hotkey: string, event: KeyboardEvent, action: () => void) => {
    const hotkeys = hotkey.split('-');
    const hasShift = hotkeys.length === 3 && (hotkeys[1] === 'shift' || hotkeys[1] === '⇧');
    const key = hasShift ? hotkeys[2] : hotkeys[1];
    if ((hotkeys[0] === 'ctrl' || hotkeys[0] === '⌘') && (event.metaKey || event.ctrlKey)
      && event.key.toLowerCase() === key.toLowerCase()) {
      if ((!hasShift && !event.shiftKey) || (hasShift && event.shiftKey)) {
        action();
        event.preventDefault();
        event.stopPropagation();
      }
    }
  };

  const hint = (event: KeyboardEvent, hintElement: HTMLElement) => {
    if (!hintElement) {
      return;
    }

    if (hintElement.querySelectorAll('li').length === 0 ||
      hintElement.style.display === 'none') {
      return;
    }

    const currentHintElement: HTMLElement = hintElement.querySelector('.vditor-hint--current');

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      event.stopPropagation();
      if (!currentHintElement.nextElementSibling) {
        hintElement.children[0].className = 'vditor-hint--current';
      } else {
        currentHintElement.nextElementSibling.className = 'vditor-hint--current';
      }
      currentHintElement.removeAttribute('class');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();
      if (!currentHintElement.previousElementSibling) {
        const length = hintElement.children.length;
        hintElement.children[length - 1].className = 'vditor-hint--current';
      } else {
        currentHintElement.previousElementSibling.className = 'vditor-hint--current';
      }
      currentHintElement.removeAttribute('class');
    } else if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      vditor.hint.fillEmoji(currentHintElement, vditor);
    }
  };

  editorElement.addEventListener('keydown', (event: KeyboardEvent) => {
    const hintElement = vditor.hint && vditor.hint.element;

    vditor.undo.recordFirstPosition(vditor);

    if ((event.metaKey || event.ctrlKey) && vditor.options.ctrlEnter && event.key === 'Enter') {
      vditor.options.ctrlEnter(getContent(vditor, editorElement));
      return;
    }

    if (event.key === 'Escape') {
      if (vditor.options.esc) {
        vditor.options.esc(getContent(vditor, editorElement));
      }
      if (hintElement && hintElement.style.display === 'block') {
        hintElement.style.display = 'none';
      }
      return;
    }

    // TODO: WYSIWYG
    if (vditor.currentMode === 'markdown') {
      if (vditor.options.tab && event.key === 'Tab') {
        event.preventDefault();
        event.stopPropagation();

        const position = getSelectPosition(editorElement);
        const text = getText(editorElement);
        const selectLinePosition = getCurrentLinePosition(position, text);
        const selectLineList = text.substring(selectLinePosition.start, selectLinePosition.end - 1).split('\n');

        if (event.shiftKey) {
          let shiftCount = 0;
          let startIsShift = false;
          const selectionShiftResult = selectLineList.map((value, index) => {
            let shiftLineValue = value;
            if (value.indexOf(vditor.options.tab) === 0) {
              if (index === 0) {
                startIsShift = true;
              }
              shiftCount++;
              shiftLineValue = value.replace(vditor.options.tab, '');
            }
            return shiftLineValue;
          }).join('\n');

          formatRender(vditor, text.substring(0, selectLinePosition.start) +
            selectionShiftResult + text.substring(selectLinePosition.end - 1),
            {
              end: position.end - shiftCount * vditor.options.tab.length,
              start: position.start - (startIsShift ? vditor.options.tab.length : 0),
            });
          return;
        }

        if (position.start === position.end) {
          insertText(vditor, vditor.options.tab, '');
          return;
        }
        const selectionResult = selectLineList.map((value) => {
          return vditor.options.tab + value;
        }).join('\n');
        formatRender(vditor, text.substring(0, selectLinePosition.start) + selectionResult +
          text.substring(selectLinePosition.end - 1),
          {
            end: position.end + selectLineList.length * vditor.options.tab.length,
            start: position.start + vditor.options.tab.length,
          });
        return;
      }

      if (!event.metaKey && !event.ctrlKey && !event.shiftKey && event.keyCode === 8) {
        const position = getSelectPosition(editorElement);
        if (position.start !== position.end) {
          insertText(vditor, '', '', true);
        } else {
          const text = getText(editorElement);
          // tslint:disable-next-line:max-line-length
          const emojiMatch = text.substring(0, position.start).match(/([\u{1F300}-\u{1F5FF}][\u{2000}-\u{206F}][\u{2700}-\u{27BF}]|([\u{1F900}-\u{1F9FF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F600}-\u{1F64F}])[\u{2000}-\u{206F}][\u{2600}-\u{26FF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F100}-\u{1F1FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F200}-\u{1F2FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F000}-\u{1F02F}]|[\u{FE00}-\u{FE0F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{0000}-\u{007F}][\u{20D0}-\u{20FF}]|[\u{0000}-\u{007F}][\u{FE00}-\u{FE0F}][\u{20D0}-\u{20FF}])$/u);
          const deleteChar = emojiMatch ? emojiMatch[0].length : 1;
          formatRender(vditor,
            text.substring(0, position.start - deleteChar) + text.substring(position.start),
            {
              end: position.start - deleteChar,
              start: position.start - deleteChar,
            });
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // editor actions
      if (vditor.options.keymap.deleteLine) {
        processKeymap(vditor.options.keymap.deleteLine, event, () => {
          const position = getSelectPosition(editorElement);
          const text = getText(editorElement);
          const linePosition = getCurrentLinePosition(position, text);
          const deletedText = text.substring(0, linePosition.start) + text.substring(linePosition.end);
          const startIndex = Math.min(deletedText.length, position.start);
          formatRender(vditor, deletedText, {
            end: startIndex,
            start: startIndex,
          });
        });
      }

      if (vditor.options.keymap.duplicate) {
        processKeymap(vditor.options.keymap.duplicate, event, () => {
          const position = getSelectPosition(editorElement);
          const text = getText(editorElement);
          let lineText = text.substring(position.start, position.end);
          if (position.start === position.end) {
            const linePosition = getCurrentLinePosition(position, text);
            lineText = text.substring(linePosition.start, linePosition.end);
            formatRender(vditor,
              text.substring(0, linePosition.end) + lineText + text.substring(linePosition.end),
              {
                end: position.end + lineText.length,
                start: position.start + lineText.length,
              });
          } else {
            formatRender(vditor,
              text.substring(0, position.end) + lineText + text.substring(position.end),
              {
                end: position.end + lineText.length,
                start: position.start + lineText.length,
              });
          }
        });
      }

      // toolbar action
      vditor.options.toolbar.forEach((menuItem: IACMarkdownEditorToolbarItem) => {
        if (!menuItem.hotkey) {
          return;
        }
        processKeymap(menuItem.hotkey, event, () => {
          (vditor.toolbar.elements[menuItem.name].children[0] as HTMLElement).click();
        });
      });
      if (!vditor.toolbar.elements.undo && (event.metaKey || event.ctrlKey) && event.key === 'z') {
        vditor.undo.undo(vditor);
        event.preventDefault();
      }
      if (!vditor.toolbar.elements.redo && (event.metaKey || event.ctrlKey) && event.key === 'y') {
        vditor.undo.redo(vditor);
        event.preventDefault();
      }
    }

    // hint: 上下选择
    if (vditor.options.hint.at || vditor.toolbar.elements.emoji) {
      hint(event, hintElement);
    }
  });
}

export function setSelectionFocus(range: Range) {
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

export function selectIsEditor(editor: HTMLElement, range?: Range) {
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

export function getSelectPosition(editorElement: HTMLElement, range?: Range) {
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
    if (range.startContainer.childNodes.length === 1 && range.startContainer.textContent.trim() === '' &&
      editorElement.childNodes[0].childNodes[0]) {
      preSelectionRange.setEnd(editorElement.childNodes[0].childNodes[0], 0);
    } else {
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
    }
    position.start = preSelectionRange.toString().length;
    position.end = position.start + range.toString().length;
  }
  return position;
}

export function setSelectionByPosition(start: number, end: number, editor: HTMLElement) {
  let charIndex = 0;
  let line = 0;
  let pNode = editor.childNodes[line];
  let foundStart = false;
  let stop = false;
  start = Math.max(0, start);
  end = Math.max(0, end);

  const range = editor.ownerDocument.createRange();
  range.setStart(pNode || editor, 0);
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

export function getSelectText(editor: HTMLElement, range?: Range) {
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

export function formatRender(
  vditor: IACMarkdownEditor,
  content: string, position?: { start: number, end: number },
  addUndo: boolean = true) {

  const textList = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  let html = '';
  const newLine = '<span><br><span style="display: none">\n</span></span>';

  let isEmpty = true;
  // let inMathBlock = false;
  // let mathBlockContext = '';

  textList.forEach((text, index) => {
    if (text !== '') {
      isEmpty = false;
    }

    if (index === textList.length - 1 && text === '') {
      // 空行行末尾不需要
      return;
    }

    // if (text) {
    //   if (inMathBlock) {
    //     if (text === '$$') {
    //       html += `<p class="katex">$$\n${mathBlockContext}\n$$</p>${newLine}`;
    //       mathBlockContext = '';
    //       inMathBlock = false;
    //     } else {
    //       mathBlockContext += `${text}\n`;
    //     }
    //   } else {
    //     if (text === '$$') {
    //       inMathBlock = true;
    //     } else {
    //       const isTeXInline     = /\$\$(.*)\$\$/g.test(text);
    //       // const isTeXLine       = /^\$\$(.*)\$\$$/.test(text);
    //       if (isTeXInline) {
    //         html += `<span class="katex">${code160to32(text.replace(/&/g, '&amp;').replace(/</g, '&lt;'))}</span>${newLine}`;
    //       } else {
    //         html += `<span>${code160to32(text.replace(/&/g, '&amp;').replace(/</g, '&lt;'))}</span>${newLine}`;
    //       }
    //     }
    //   }
    // } else {
    //   html += newLine;
    // }
    if (text) {
      html += `<span>${code160to32(text.replace(/&/g, '&amp;').replace(/</g, '&lt;'))}</span>${newLine}`;
    } else {
      html += newLine;
    }
  });
  // if (mathBlockContext) {
  //   html += `<p class="katex">$$\n${mathBlockContext}\n</p>${newLine}`;
  // }

  if (textList.length <= 2 && isEmpty) {
    // 当内容等于空或 \n 时把编辑器内部元素置空，显示 placeholder 文字
    vditor.editor.element.innerHTML = '';
  } else {
    // TODO: 使用虚拟 Dom
    vditor.editor.element.innerHTML = html || newLine;
  }

  if (position) {
    setSelectionByPosition(position.start, position.end, vditor.editor.element);
  }

  inputEvent(vditor, addUndo);
}

export function insertText(
  vditor: IACMarkdownEditor,
  prefix: string,
  suffix: string,
  replace: boolean = false,
  toggle: boolean = false) {
  let range: Range = window.getSelection().rangeCount === 0 ? undefined : window.getSelection().getRangeAt(0);
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
    const code = textPlain || textHTML;
    if (/\n/.test(code)) {
      return '```\n' + code + '\n```';
    } else {
      return '`' + code + '`';
    }
  } else {
    return markdownStr;
  }
}

export function getCursorPosition(editor: HTMLElement) {
  const parentRect = editor.parentElement.getBoundingClientRect();
  const range = window.getSelection().getRangeAt(0);
  const startNode = range.startContainer.childNodes[range.startOffset] as HTMLElement;
  let cursorRect;
  if (startNode) {
    if (startNode.nodeType === 3 && startNode.textContent === '') {
      cursorRect = startNode.nextElementSibling.getClientRects()[0];
    } else if (startNode.getClientRects) {
      cursorRect = startNode.getClientRects()[0];
    } else if (startNode.parentElement) {
      cursorRect = startNode.parentElement.getClientRects()[0];
    }
  } else {
    const startOffset = range.startOffset;
    // fix Safari
    if (isSafari()) {
      range.setStart(range.startContainer, startOffset - 1);
    }
    cursorRect = range.getBoundingClientRect();
    // fix Safari
    if (isSafari()) {
      range.setStart(range.startContainer, startOffset);
    }
  }
  return {
    left: cursorRect.left - parentRect.left,
    top: cursorRect.top - parentRect.top,
  };
}

export function getCurrentLinePosition(position: { start: number, end: number }, text: string) {

  // find start
  let start = position.start - 1;
  let findStart = false;
  while (!findStart && start > -1) {
    // 防止光标在末尾
    if (text.charAt(start) === '\n' && text.length !== start + 1) {
      start++;
      findStart = true;
    } else if (start === 0) {
      findStart = true;
    } else {
      start--;
    }
  }

  // find end
  let end = position.end;
  let findEnd = false;
  while (!findEnd && end <= text.length) {
    if (text.charAt(end) === '\n') {
      end++;
      findEnd = true;
    } else if (end === text.length) {
      findEnd = true;
    } else {
      end++;
    }
  }

  return {
    end: Math.min(end, text.length),
    start: Math.max(0, start),
  };
}

export class MediaRecorder {
  public SAMPLE_RATE = 5000;  // 44100 suggested by demos;
  public DEFAULT_SAMPLE_RATE: number;
  public isRecording = false;
  public readyFlag = false;
  public leftChannel: Float32List[] = [];
  public rightChannel: Float32List[] = [];
  public recordingLength = 0;
  // This needs to be public so the 'onaudioprocess' event handler can be defined externally.
  public recorder: ScriptProcessorNode;

  constructor(e: MediaStream) {
    let context;
    // creates the audio context
    if (typeof AudioContext !== 'undefined') {
      context = new AudioContext();
    } else if (webkitAudioContext) {
      context = new webkitAudioContext();
    } else {
      return;
    }

    this.DEFAULT_SAMPLE_RATE = context.sampleRate;

    // creates a gain node
    const volume = context.createGain();

    // creates an audio node from the microphone incoming stream
    const audioInput = context.createMediaStreamSource(e);

    // connect the stream to the gain node
    audioInput.connect(volume);

    /* From the spec: The size of the buffer controls how frequently the audioprocess event is
     dispatched and how many sample-frames need to be processed each call.
     Lower values for buffer size will result in a lower (better) latency.
     Higher values will be necessary to avoid audio breakup and glitches */
    this.recorder = context.createScriptProcessor(2048, 2, 1);

    // The onaudioprocess event needs to be defined externally, so make sure it is not set:
    this.recorder.onaudioprocess = null;

    // we connect the recorder
    volume.connect(this.recorder);
    this.recorder.connect(context.destination);
    this.readyFlag = true;
  }

  // Publicly accessible methods:
  public cloneChannelData(leftChannelData: Float32List, rightChannelData: Float32List) {
    this.leftChannel.push(new Float32Array(leftChannelData));
    this.rightChannel.push(new Float32Array(rightChannelData));
    this.recordingLength += 2048;
  }

  public startRecordingNewWavFile() {
    if (this.readyFlag) {
      this.isRecording = true;
      this.leftChannel.length = this.rightChannel.length = 0;
      this.recordingLength = 0;
    }
  }

  public stopRecording() {
    this.isRecording = false;
  }

  public buildWavFileBlob() {
    // we flat the left and right channels down
    const leftBuffer = this.mergeBuffers(this.leftChannel);
    const rightBuffer = this.mergeBuffers(this.rightChannel);

    // Interleave the left and right channels together:
    let interleaved: Float32Array = new Float32Array(leftBuffer.length);

    for (let i = 0; i < leftBuffer.length; ++i) {
      interleaved[i] = 0.5 * (leftBuffer[i] + rightBuffer[i]);
    }

    // Downsample the audio data if necessary:
    if (this.DEFAULT_SAMPLE_RATE > this.SAMPLE_RATE) {
      interleaved = this.downSampleBuffer(interleaved, this.SAMPLE_RATE);
    }

    const totalByteCount = (44 + interleaved.length * 2);
    const buffer = new ArrayBuffer(totalByteCount);
    const view = new DataView(buffer);

    // Build the RIFF chunk descriptor:
    this.writeUTFBytes(view, 0, 'RIFF');
    view.setUint32(4, totalByteCount, true);
    this.writeUTFBytes(view, 8, 'WAVE');

    // Build the FMT sub-chunk:
    this.writeUTFBytes(view, 12, 'fmt '); // subchunk1 ID is format
    view.setUint32(16, 16, true); // The sub-chunk size is 16.
    view.setUint16(20, 1, true); // The audio format is 1.
    view.setUint16(22, 1, true); // Number of interleaved channels.
    view.setUint32(24, this.SAMPLE_RATE, true); // Sample rate.
    view.setUint32(28, this.SAMPLE_RATE * 2, true); // Byte rate.
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample.

    // Build the data sub-chunk:
    const subChunk2ByteCount = interleaved.length * 2;
    this.writeUTFBytes(view, 36, 'data');
    view.setUint32(40, subChunk2ByteCount, true);

    // Write the PCM samples to the view:
    const lng = interleaved.length;
    let index = 44;
    const volume = 1;
    for (let j = 0; j < lng; j++) {
      view.setInt16(index, interleaved[j] * (0x7FFF * volume), true);
      index += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  private downSampleBuffer(buffer: Float32Array, rate: number) {
    if (rate === this.DEFAULT_SAMPLE_RATE) {
      return buffer;
    }

    if (rate > this.DEFAULT_SAMPLE_RATE) {
      // throw 'downsampling rate show be smaller than original sample rate';
      return buffer;
    }

    const sampleRateRatio = this.DEFAULT_SAMPLE_RATE / rate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;

    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0;
      let count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = accum / count;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  }

  private mergeBuffers(desiredChannelBuffer: Float32List[]) {
    const result = new Float32Array(this.recordingLength);
    let offset = 0;
    const lng = desiredChannelBuffer.length;
    for (let i = 0; i < lng; ++i) {
      const buffer = desiredChannelBuffer[i];
      result.set(buffer, offset);
      offset += buffer.length;
    }
    return result;
  }

  private writeUTFBytes(view: DataView, offset: number, value: string) {
    const lng = value.length;
    for (let i = 0; i < lng; i++) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  }
}

export function isSafari(): boolean {
  if (navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') === -1) {
     return true;
  } else {
     return false;
  }
}

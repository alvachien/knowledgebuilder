import { gfm } from './ac-markdown-editor-turndown-gfm';
import { IACMEditor, webkitAudioContext } from './ac-markdown-editor-interfaces';

// Add style
export function addStyle(url: string, id: string) {
  if (!document.getElementById(id)) {
    const styleElement = document.createElement('link');
    styleElement.id = id;
    styleElement.rel = 'stylesheet';
    styleElement.type = 'text/css';
    styleElement.href = url;
    document.getElementsByTagName('head')[0].appendChild(styleElement);
  }
}

export function code160to32(text: string) {
  // 非打断空格转换为空格
  return text.replace(/\u00a0/g, ' ');
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

export function getEventName() {
  if (navigator.userAgent.indexOf('iPhone') > -1) {
    return 'touchstart';
  } else {
    return 'click';
  }
}

export function getText(element: HTMLPreElement) {
  // last char must be a `\n`.
  return code160to32(`${element.textContent}\n`.replace(/\n\n$/, '\n'));
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

export function setSelectionFocus(range: Range) {
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
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

export function inputEvent(vditor: IACMEditor, addUndo: boolean = true) {
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

export function isSafari() {
  if (navigator.userAgent.indexOf('Safari') > -1
    && navigator.userAgent.indexOf('Chrome') === -1) {
    return true;
  } else {
    return false;
  }
}

export function openURL(url: string) {
  if (isSafari()) {
    window.location.href = url;
  } else {
    window.open(url);
  }
}

export function formatRender(vditor: IACMEditor, content: string, position?: { start: number, end: number },
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

// Insert text
export function insertText(vditor: IACMEditor, prefix: string, suffix: string, replace: boolean = false,
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

export function getCursorPosition(editor: HTMLPreElement) {
  const parentRect = editor.parentElement.getBoundingClientRect();
  const range = window.getSelection().getRangeAt(0);
  const startNode = range.startContainer.childNodes[range.startOffset] as HTMLElement;
  let cursorRect;
  if (startNode) {
      if (startNode.nodeType === 3 && startNode.textContent === '') {
          cursorRect = startNode.nextElementSibling.getClientRects()[0];
      } else if (startNode.getClientRects) {
          cursorRect = startNode.getClientRects()[0];
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

export async function html2md(vditor: IACMEditor, textHTML: string, textPlain?: string) {
  const {default: TurndownService} = await import(/* webpackChunkName: "turndown" */ 'turndown');

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
              xhr.send(JSON.stringify({url: src}));
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

// Media recorder
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
      // throw "downsampling rate show be smaller than original sample rate";
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


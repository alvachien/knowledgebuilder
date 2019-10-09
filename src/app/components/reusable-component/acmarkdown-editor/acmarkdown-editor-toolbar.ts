import { insertText } from './acmarkdown-editor-util';
import { IACMarkdownEditor, IACMarkdownEditorToolbarItem, IACMarkdownEditorHTMLInputEvent } from './acmarkdown-editor-interface';
import { i18n, boldSvg, bothSvg, checkSvg, codeSvg, emojiSvg, fullscreenSvg, contractSvg, headingsSvg, helpSvg, uploadSvg, undoSvg, tableSvg, strikeSvg, redoSvg, recordSvg, quoteSvg, previewSvg, orderedlistSvg, listSvg, linkSvg, lineSvg, italicSvg, inlinecodeSvg, infoSvg, } from './acmarkdown-editor-constant';

export abstract class ACMarkdownEditorToolbarItem {
  public element: HTMLElement;
  public tbItem: IACMarkdownEditorToolbarItem;
  public vditor: IACMarkdownEditor;

  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    this.tbItem = tbItem;
    this.vditor = vditor;

    this.element = document.createElement('div');
    const iconElement = document.createElement('div');
    iconElement.className = `vditor-tooltipped vditor-tooltipped__${tbItem.tipPosition}`;

    let hotkey = this.tbItem.hotkey ? ` <${this.tbItem.hotkey}>` : '';
    if (/Mac/.test(navigator.platform)) {
      hotkey = hotkey.replace('ctrl', '⌘');
    } else {
      hotkey = hotkey.replace('⌘', 'ctrl');
    }
    iconElement.setAttribute('aria-label',
      this.tbItem.tip ? this.tbItem.tip + hotkey : i18n[vditor.options.lang][this.tbItem.name] + hotkey);
    this.element.appendChild(iconElement);
  }

  public bindEvent(replace: boolean = false) {
    this.element.children[0].addEventListener('click', () => {
      insertText(this.vditor, this.tbItem.prefix || '', this.tbItem.suffix || '',
        replace, true);
    });
  }
}

export class ACMarkdownToolbarBold extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || boldSvg;

    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMarkdownToolbarBoth extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || bothSvg;
    if (vditor.options.preview.mode === 'both') {
      this.element.children[0].className =
        `vditor-tooltipped vditor-tooltipped__${tbItem.tipPosition} vditor-menu--current`;
    }
    this._bindEvent(vditor, tbItem);
  }

  public _bindEvent(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    this.element.children[0].addEventListener('click', function () {
      const vditorElement = document.getElementById(vditor.id);
      let className;
      if (vditor.preview.element.className === 'vditor-preview vditor-preview--both') {
        vditor.preview.element.className = 'vditor-preview vditor-preview--editor';
        className = `vditor-tooltipped vditor-tooltipped__${tbItem.tipPosition}`;
      } else {
        vditor.preview.element.className = 'vditor-preview vditor-preview--both';
        className = `vditor-tooltipped vditor-tooltipped__${tbItem.tipPosition} vditor-menu--current`;
        vditor.preview.render(vditor);
      }
      if (vditorElement.className.indexOf('vditor--fullscreen') > -1) {
        className = className.replace('__n', '__s');
      }
      this.className = className;

      if (vditor.toolbar.elements.preview &&
        vditor.toolbar.elements.preview.children[0].className.indexOf('vditor-menu--current') > -1) {
        vditor.toolbar.elements.preview.children[0].className =
          vditor.toolbar.elements.preview.children[0].className.replace(' vditor-menu--current', '');
      }
    });
  }
}

export class ACMarkdownToolbarBr {
  public element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'vditor-menu__br';
  }
}

export class ACMarkdownToolbarCheck extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || checkSvg;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMarkdownToolbarCode extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || codeSvg;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMarkdownToolbarCustom extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon;
    this.element.children[0].addEventListener('click', () => {
      tbItem.click();
    });
  }
}

export class ACMarkdownToolbarDivider {
  public element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'vditor-menu__divider';
  }
}

export class ACMarkdownToolbarEmoji extends ACMarkdownEditorToolbarItem {
  public element: HTMLElement;

  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || emojiSvg;

    const emojiPanelElement = document.createElement('div');
    emojiPanelElement.className = 'vditor-panel';

    let commonEmojiHTML = '';
    Object.keys(vditor.options.hint.emoji).forEach((key) => {
      const emojiValue = vditor.options.hint.emoji[key];
      if (emojiValue.indexOf('.') > -1) {
        commonEmojiHTML += `<span data-value=':${key}: ' data-key=':${key}:'><img
data-value=':${key}: ' data-key=':${key}:' src='${emojiValue}'/></span>`;
      } else {
        commonEmojiHTML += `<span data-value='${emojiValue} ' data-key='${key}'>${emojiValue}</span>`;
      }
    });

    const tailHTML = `<div class='vditor-emojis__tail'>
  <span class='vditor-emojis__tip'></span><span>${vditor.options.hint.emojiTail || ''}</span>
</div>`;

    emojiPanelElement.innerHTML = `<div class='vditor-emojis' style='max-height: ${
      vditor.options.height === 'auto' ? 'auto' : vditor.options.height as number - 80
      }px'>${commonEmojiHTML}</div>${tailHTML}`;

    this.element.appendChild(emojiPanelElement);

    this._bindEvent(emojiPanelElement, vditor);
  }

  public _bindEvent(emojiPanelElement: HTMLElement, vditor: IACMarkdownEditor) {
    this.element.children[0].addEventListener('click', () => {
      if (emojiPanelElement.style.display === 'block') {
        emojiPanelElement.style.display = 'none';
      } else {
        emojiPanelElement.style.display = 'block';
        if (vditor.toolbar.elements.headings) {
          const headingsPanel = vditor.toolbar.elements.headings.children[1] as HTMLElement;
          headingsPanel.style.display = 'none';
        }
      }

      if (vditor.hint) {
        vditor.hint.element.style.display = 'none';
      }
    });

    emojiPanelElement.querySelectorAll('.vditor-emojis span').forEach((element) => {
      element.addEventListener('click', (event: Event) => {
        insertText(vditor, (event.target as HTMLElement).getAttribute('data-value'),
          '', true);
        emojiPanelElement.style.display = 'none';
      });
      element.addEventListener('mouseover', (event: Event) => {
        emojiPanelElement.querySelector('.vditor-emojis__tip').innerHTML =
          (event.target as HTMLElement).getAttribute('data-key');
      });
    });
  }
}

export class ACMarkdownToolbarFullscreen extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || fullscreenSvg;
    this._bindEvent(vditor, tbItem);
  }

  public _bindEvent(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    this.element.children[0].addEventListener('click', function() {
      const vditorElement = document.getElementById(vditor.id);
      if (vditorElement.className.indexOf('vditor--fullscreen') > -1) {
        this.innerHTML = tbItem.icon || fullscreenSvg;
        vditorElement.className = vditorElement.className.replace(' vditor--fullscreen', '');
        Object.keys(vditor.toolbar.elements).forEach((key) => {
          const svgElement = vditor.toolbar.elements[key].firstChild as HTMLElement;
          if (svgElement) {
            svgElement.className = svgElement.className.replace('__s', '__n');
          }
        });
      } else {
        this.innerHTML = tbItem.icon || contractSvg;
        vditorElement.className = vditorElement.className + ' vditor--fullscreen';
        Object.keys(vditor.toolbar.elements).forEach((key) => {
          const svgElement = vditor.toolbar.elements[key].firstChild as HTMLElement;
          if (svgElement) {
            svgElement.className = svgElement.className.replace('__n', '__s');
          }
        });
      }
    });
  }
}

export class ACMarkdownToolbarHeadings extends ACMarkdownEditorToolbarItem {
  public element: HTMLElement;

  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || headingsSvg;

    const headingsPanelElement = document.createElement('div');
    headingsPanelElement.className = 'vditor-panel';
    headingsPanelElement.innerHTML = `<h1 data-value='# '>Heading 1</h1>
<h2 data-value='## '>Heading 2</h2>
<h3 data-value='### '>Heading 3</h3>
<h4 data-value='#### '>Heading 4</h4>
<h5 data-value='##### '>Heading 5</h5>
<h6 data-value='###### '>Heading 6</h6>`;

    this.element.appendChild(headingsPanelElement);

    this._bindEvent(headingsPanelElement, vditor);
  }

  public _bindEvent(headingsPanelElement: HTMLElement, vditor: IACMarkdownEditor) {
    this.element.children[0].addEventListener('click', () => {
      if (headingsPanelElement.style.display === 'block') {
        headingsPanelElement.style.display = 'none';
      } else {
        headingsPanelElement.style.display = 'block';
        if (vditor.toolbar.elements.emoji) {
          const panel = vditor.toolbar.elements.emoji.children[1] as HTMLElement;
          panel.style.display = 'none';
        }
      }
      if (vditor.hint) {
        vditor.hint.element.style.display = 'none';
      }
    });

    for (let i = 0; i < 6; i++) {
      headingsPanelElement.children.item(i).addEventListener('click', (event: Event) => {
        insertText(vditor, (event.target as HTMLElement).getAttribute('data-value'), '',
          false, true);
        headingsPanelElement.style.display = 'none';
      });
    }
  }
}

export class ACMarkdownToolbarHelp extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || helpSvg;
    this.bindEvent();
  }

  public bindEvent() {
    this.element.children[0].addEventListener('click', () => {
      window.open('https://hacpai.com/guide/markdown');
    });
  }
}

export class ACMarkdownToolbarInfo extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || infoSvg;
    this.bindEvent();
  }

  public bindEvent() {
    this.element.children[0].addEventListener('click', () => {
      window.open('https://github.com/b3log/vditor');
    });
  }
}

export class ACMarkdownToolbarInlineCode extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || inlinecodeSvg;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMarkdownToolbarItalic extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || italicSvg;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMarkdownToolbarLine extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || lineSvg;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMarkdownToolbarLink extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || linkSvg;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMarkdownToolbarList extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || listSvg;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMarkdownToolbarOrderedList extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || orderedlistSvg;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMarkdownToolbarPreview extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || previewSvg;
    if (vditor.options.preview.mode === 'preview') {
      this.element.children[0].className =
        `vditor-tooltipped vditor-tooltipped__${tbItem.tipPosition} vditor-menu--current`;
    }
    this._bindEvent(vditor, tbItem);
  }

  public _bindEvent(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    this.element.children[0].addEventListener('click', function () {
      const vditorElement = document.getElementById(vditor.id);
      let className;
      if (vditor.preview.element.className === 'vditor-preview vditor-preview--preview') {
        vditor.preview.element.className = 'vditor-preview vditor-preview--editor';
        className = `vditor-tooltipped vditor-tooltipped__${tbItem.tipPosition}`;
      } else {
        vditor.preview.element.className = 'vditor-preview vditor-preview--preview';
        className = `vditor-tooltipped vditor-tooltipped__${tbItem.tipPosition} vditor-menu--current`;
        vditor.preview.render(vditor);
      }
      if (vditorElement.className.indexOf('vditor--fullscreen') > -1) {
        className = className.replace('__n', '__s');
      }
      this.className = className;

      if (vditor.toolbar.elements.both &&
        vditor.toolbar.elements.both.children[0].className.indexOf('vditor-menu--current') > -1) {
        vditor.toolbar.elements.both.children[0].className =
          vditor.toolbar.elements.both.children[0].className.replace(' vditor-menu--current', '');
      }
    });
  }
}

export class ACMarkdownToolbarQuote extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || quoteSvg;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMarkdownToolbarRecord extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || recordSvg;

    this._bindEvent(vditor);
  }

  public _bindEvent(vditor: IACMarkdownEditor) {
    let mediaRecorder: MediaRecorder;
    this.element.children[0].addEventListener('click', () => {
      if (!mediaRecorder) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((mediaStream: MediaStream) => {
          mediaRecorder = new MediaRecorder(mediaStream);
          mediaRecorder.recorder.onaudioprocess = (e: AudioProcessingEvent) => {
            // Do nothing if not recording:
            if (!mediaRecorder.isRecording) {
              return;
            }

            // Copy the data from the input buffers;
            const left = e.inputBuffer.getChannelData(0);
            const right = e.inputBuffer.getChannelData(1);
            mediaRecorder.cloneChannelData(left, right);
          };
          mediaRecorder.startRecordingNewWavFile();
          vditor.tip.show(i18n[vditor.options.lang].recording);
          vditor.editor.element.setAttribute('contenteditable', 'false');
        }).catch((err: ErrorEvent) => {
          console.error('init media error:', err);
        });
        return;
      }

      if (mediaRecorder.isRecording) {
        mediaRecorder.stopRecording();
        vditor.tip.hide();
        const file: File = new File([mediaRecorder.buildWavFileBlob()],
          `record${(new Date()).getTime()}.wav`, { type: 'video/webm' });
        uploadFiles(vditor, [file]);
      } else {
        vditor.tip.show(i18n[vditor.options.lang].recording);
        vditor.editor.element.setAttribute('contenteditable', 'false');
        mediaRecorder.startRecordingNewWavFile();
      }
    });
  }
}

export class ACMarkdownToolbarRedo extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || redoSvg;
    this.element.children[0].className = this.element.children[0].className + ' vditor-menu--disabled';
    this.element.children[0].addEventListener('click', () => {
      this.vditor.undo.redo(vditor);
    });
  }
}

export class ACMarkdownToolbarStrike extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || strikeSvg;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMarkdownToolbarTable extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || tableSvg;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent(true);
  }
}

export class ACMarkdownToolbarUndo extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || undoSvg;
    this.element.children[0].className = this.element.children[0].className + ' vditor-menu--disabled';
    this.element.children[0].addEventListener('click', () => {
      vditor.undo.undo(vditor);
    });
  }
}


export class ACMarkdownToolbarUpload extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    let inputHTML = '<input multiple="multiple" type="file"></label>';
    if (vditor.options.upload.accept) {
      inputHTML = `<input multiple="multiple" type="file" accept="${vditor.options.upload.accept}"></label>`;
    }
    this.element.children[0].innerHTML = `<label>${(tbItem.icon || uploadSvg)}${inputHTML}</label>`;
    this._bindEvent(vditor);
  }

  public _bindEvent(vditor: IACMarkdownEditor) {
    this.element.querySelector('input').addEventListener('change', (event: IACMarkdownEditorHTMLInputEvent) => {
      if (event.target.files.length === 0) {
        return;
      }
      uploadFiles(vditor, event.target.files, event.target);
    });
  }
}

export class ACMarkdownEditorToolbar {
  public elements: { [key: string]: HTMLElement };

  constructor(vditor: IACMarkdownEditor) {
    const options = vditor.options;
    this.elements = {};

    options.toolbar.forEach((tbItem: IACMarkdownEditorToolbarItem, i: number) => {
      let menuItemObj;
      switch (tbItem.name) {
        case 'emoji':
          menuItemObj = new ACMarkdownToolbarEmoji(vditor, tbItem);
          break;
        case 'bold':
          menuItemObj = new ACMarkdownToolbarBold(vditor, tbItem);
          break;
        case 'headings':
          menuItemObj = new ACMarkdownToolbarHeadings(vditor, tbItem);
          break;
        case '|':
          menuItemObj = new ACMarkdownToolbarDivider();
          break;
        case 'br':
          menuItemObj = new ACMarkdownToolbarBr();
          break;
        case 'italic':
          menuItemObj = new ACMarkdownToolbarItalic(vditor, tbItem);
          break;
        case 'strike':
          menuItemObj = new ACMarkdownToolbarStrike(vditor, tbItem);
          break;
        case 'line':
          menuItemObj = new ACMarkdownToolbarLine(vditor, tbItem);
          break;
        case 'quote':
          menuItemObj = new ACMarkdownToolbarQuote(vditor, tbItem);
          break;
        case 'list':
          menuItemObj = new ACMarkdownToolbarList(vditor, tbItem);
          break;
        case 'ordered-list':
          menuItemObj = new ACMarkdownToolbarOrderedList(vditor, tbItem);
          break;
        case 'check':
          menuItemObj = new ACMarkdownToolbarCheck(vditor, tbItem);
          break;
        case 'undo':
          menuItemObj = new ACMarkdownToolbarUndo(vditor, tbItem);
          break;
        case 'redo':
          menuItemObj = new ACMarkdownToolbarRedo(vditor, tbItem);
          break;
        case 'code':
          menuItemObj = new ACMarkdownToolbarCode(vditor, tbItem);
          break;
        case 'inline-code':
          menuItemObj = new ACMarkdownToolbarInlineCode(vditor, tbItem);
          break;
        case 'link':
          menuItemObj = new ACMarkdownToolbarLink(vditor, tbItem);
          break;
        case 'help':
          menuItemObj = new ACMarkdownToolbarHelp(vditor, tbItem);
          break;
        case 'table':
          menuItemObj = new ACMarkdownToolbarTable(vditor, tbItem);
          break;
        case 'both':
          menuItemObj = new ACMarkdownToolbarBoth(vditor, tbItem);
          break;
        case 'preview':
          menuItemObj = new ACMarkdownToolbarPreview(vditor, tbItem);
          break;
        case 'fullscreen':
          menuItemObj = new ACMarkdownToolbarFullscreen(vditor, tbItem);
          break;
        case 'upload':
          menuItemObj = new ACMarkdownToolbarUpload(vditor, tbItem);
          break;
        case 'record':
          menuItemObj = new ACMarkdownToolbarRecord(vditor, tbItem);
          break;
        case 'info':
          menuItemObj = new ACMarkdownToolbarInfo(vditor, tbItem);
          break;
        default:
          menuItemObj = new ACMarkdownToolbarCustom(vditor, tbItem);
          break;
      }

      let key = tbItem.name;
      if (key === 'br' || key === '|') {
        key = key + i;
      }

      this.elements[key] = menuItemObj.element;
    });
  }
}


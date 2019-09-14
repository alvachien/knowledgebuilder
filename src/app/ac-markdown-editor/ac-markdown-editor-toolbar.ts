import {
  insertText, getEventName, getText, getSelectPosition, formatRender,
  openURL, MediaRecorder,
} from './ac-markdown-editor-util';
import { IACMEditor, IACMEToolbarItem, IACMEHTMLInputEvent, } from './ac-markdown-editor-interfaces';
import { uploadFiles } from './ac-markdown-editor-upload';
import { i18n } from './ac-markdown-editor-i18n';
import boldSVG from '../../assets/icons/bold.svg';
import bothSVG from '../../assets/icons/both.svg';
import checkSVG from '../../assets/icons/check.svg';
import codeSVG from '../../assets/icons/code.svg';
import emojiSVG from '../../assets/icons/emoji.svg';
import formatSVG from '../../assets/icons/format.svg';
import contractSVG from '../../assets/icons/contract.svg';
import fullscreenSVG from '../../assets/icons/fullscreen.svg';
import headingsSVG from '../../assets/icons/headings.svg';
import helpSVG from '../../assets/icons/help.svg';
import infoSVG from '../../assets/icons/info.svg';
import inlineCodeSVG from '../../assets/icons/inline-code.svg';
import italicSVG from '../../assets/icons/italic.svg';
import lineSVG from '../../assets/icons/line.svg';
import linkSVG from '../../assets/icons/link.svg';
import listSVG from '../../assets/icons/list.svg';
import orderedListVG from '../../assets/icons/ordered-list.svg';
import previewSVG from '../../assets/icons/preview.svg';
import quoteSVG from '../../assets/icons/quote.svg';
import recordSVG from '../../assets/icons/record.svg';
import redoSVG from '../../assets/icons/redo.svg';
import strikekSVG from '../../assets/icons/strike.svg';
import tableSVG from '../../assets/icons/table.svg';
import undoSVG from '../../assets/icons/undo.svg';
import uploadSVG from '../../assets/icons/upload.svg';

export class ACMEditorToolbarItem {
  public element: HTMLElement;
  public menuItem: IACMEToolbarItem;
  public vditor: IACMEditor;

  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    this.menuItem = menuItem;
    this.vditor = vditor;

    this.element = document.createElement('div');
    const iconElement = document.createElement('div');
    iconElement.className = `vditor-tooltipped vditor-tooltipped__${menuItem.tipPosition}`;

    let hotkey = this.menuItem.hotkey ? ` <${this.menuItem.hotkey}>` : '';
    if (/Mac/.test(navigator.platform)) {
      hotkey = hotkey.replace('ctrl', '⌘');
    } else {
      hotkey = hotkey.replace('⌘', 'ctrl');
    }
    iconElement.setAttribute('aria-label',
      this.menuItem.tip ? this.menuItem.tip + hotkey : i18n[vditor.options.lang][this.menuItem.name] + hotkey);
    this.element.appendChild(iconElement);
  }

  public bindEvent(replace: boolean = false) {
    this.element.children[0].addEventListener(getEventName(), (event) => {
      insertText(this.vditor, this.menuItem.prefix || '', this.menuItem.suffix || '',
        replace, true);
      event.preventDefault();
    });
  }
}

export class ACMEditorToolbarBold extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || boldSVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMEditorToolbarBoth extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || bothSVG;
    if (vditor.options.preview.mode === 'both') {
      this.element.children[0].className =
        `vditor-tooltipped vditor-tooltipped__${menuItem.tipPosition} vditor-menu--current`;
    }
    this._bindEvent(vditor, menuItem);
  }

  public _bindEvent(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    this.element.children[0].addEventListener(getEventName(), function() {
      const vditorElement = document.getElementById(vditor.id);
      let className;
      if (vditor.preview.element.className === 'vditor-preview vditor-preview--both') {
        vditor.preview.element.className = 'vditor-preview vditor-preview--editor';
        className = `vditor-tooltipped vditor-tooltipped__${menuItem.tipPosition}`;
      } else {
        vditor.preview.element.className = 'vditor-preview vditor-preview--both';
        className = `vditor-tooltipped vditor-tooltipped__${menuItem.tipPosition} vditor-menu--current`;
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

export class ACMEditorToolbarBr {
  public element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'vditor-menu__br';
  }
}

export class ACMEditorToolbarCheck extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || checkSVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMEditorToolbarCode extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || codeSVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMEditorToolbarCustom extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon;
    this.element.children[0].addEventListener(getEventName(), (event) => {
      menuItem.click();
      event.preventDefault();
    });
  }
}

export class ACMEditorToolbarDivider {
  public element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'vditor-menu__divider';
  }
}

export class ACMEditorToolbarEmoji extends ACMEditorToolbarItem {
  public element: HTMLElement;

  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || emojiSVG;

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

  public _bindEvent(emojiPanelElement: HTMLElement, vditor: IACMEditor) {
    this.element.children[0].addEventListener(getEventName(), (event) => {
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
      event.preventDefault();
    });

    emojiPanelElement.querySelectorAll('.vditor-emojis span').forEach((element) => {
      element.addEventListener(getEventName(), (event: Event) => {
        insertText(vditor, (event.target as HTMLElement).getAttribute('data-value'),
          '', true);
        emojiPanelElement.style.display = 'none';
        event.preventDefault();
      });
      element.addEventListener('mouseover', (event: Event) => {
        emojiPanelElement.querySelector('.vditor-emojis__tip').innerHTML =
          (event.target as HTMLElement).getAttribute('data-key');
      });
    });
  }
}

export class ACMEditorToolbarFormat extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || formatSVG;
    this.element.children[0].addEventListener(getEventName(), (event) => {
      const formatResult = vditor.lute.FormatStr('', getText(vditor.editor.element));
      formatRender(vditor, formatResult[0] || formatResult[1],
        getSelectPosition(vditor.editor.element, vditor.editor.range));
      event.preventDefault();
    });
  }
}

export class ACMEditorToolbarFullscreen extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || fullscreenSVG;
    this._bindEvent(vditor, menuItem);
  }

  public _bindEvent(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    this.element.children[0].addEventListener(getEventName(), function() {
      const vditorElement = document.getElementById(vditor.id);
      if (vditorElement.className.indexOf('vditor--fullscreen') > -1) {
        this.innerHTML = menuItem.icon || fullscreenSVG;
        vditorElement.className = vditorElement.className.replace(' vditor--fullscreen', '');
        Object.keys(vditor.toolbar.elements).forEach((key) => {
          const svgElement = vditor.toolbar.elements[key].firstChild as HTMLElement;
          if (svgElement) {
            svgElement.className = svgElement.className.replace('__s', '__n');
          }
        });
      } else {
        this.innerHTML = menuItem.icon || contractSVG;
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

export class ACMEditorToolbarHeadings extends ACMEditorToolbarItem {
  public element: HTMLElement;

  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || headingsSVG;

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

  public _bindEvent(headingsPanelElement: HTMLElement, vditor: IACMEditor) {
    this.element.children[0].addEventListener(getEventName(), (event) => {
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
      event.preventDefault();
    });

    for (let i = 0; i < 6; i++) {
      headingsPanelElement.children.item(i).addEventListener(getEventName(), (event: Event) => {
        insertText(vditor, (event.target as HTMLElement).getAttribute('data-value'), '',
          false, true);
        headingsPanelElement.style.display = 'none';
        event.preventDefault();
      });
    }
  }
}

export class ACMEditorToolbarHelp extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || helpSVG;
    this.bindEvent();
  }

  public bindEvent() {
    this.element.children[0].addEventListener(getEventName(), () => {
      // openURL('https://hacpai.com/guide/markdown');
    });
  }
}

export class ACMEditorToolbarInfo extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || infoSVG;
    this.bindEvent();
  }

  public bindEvent() {
    this.element.children[0].addEventListener(getEventName(), () => {
      // openURL('https://github.com/b3log/vditor');
    });
  }
}

export class ACMEditorToolbarInlineCode extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || inlineCodeSVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMEditorToolbarItalic extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || italicSVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMEditorToolbarLine extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || lineSVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMEditorToolbarLink extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || linkSVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMEditorToolbarList extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || listSVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMEditorToolbarOrderedList extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || orderedListVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMEditorToolbarPreview extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || previewSVG;
    if (vditor.options.preview.mode === 'preview') {
      this.element.children[0].className =
        `vditor-tooltipped vditor-tooltipped__${menuItem.tipPosition} vditor-menu--current`;
    }
    this._bindEvent(vditor, menuItem);
  }

  public _bindEvent(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    this.element.children[0].addEventListener(getEventName(), function() {
      const vditorElement = document.getElementById(vditor.id);
      let className;
      if (vditor.preview.element.className === 'vditor-preview vditor-preview--preview') {
        vditor.preview.element.className = 'vditor-preview vditor-preview--editor';
        className = `vditor-tooltipped vditor-tooltipped__${menuItem.tipPosition}`;
      } else {
        vditor.preview.element.className = 'vditor-preview vditor-preview--preview';
        className = `vditor-tooltipped vditor-tooltipped__${menuItem.tipPosition} vditor-menu--current`;
        vditor.preview.render(vditor);
        vditor.editor.element.blur();
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

export class ACMEditorToolbarQuote extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || quoteSVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMEditorToolbarRecord extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || recordSVG;

    this._bindEvent(vditor);
  }

  public _bindEvent(vditor: IACMEditor) {
    let mediaRecorder: MediaRecorder;
    this.element.children[0].addEventListener(getEventName(), (event) => {
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
        }).catch(() => {
          vditor.tip.show(i18n[vditor.options.lang]['record-tip']);
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
      event.preventDefault();
    });
  }
}

export class ACMEditorToolbarRedo extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || redoSVG;
    this.element.children[0].className = this.element.children[0].className + ' vditor-menu--disabled';
    this.element.children[0].addEventListener(getEventName(), (event) => {
      this.vditor.undo.redo(vditor);
      event.preventDefault();
    });
  }
}

export class ACMEditorToolbarStrike extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || strikekSVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMEditorToolbarTable extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || tableSVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent(true);
  }
}

export class ACMEditorToolbarUndo extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon || undoSVG;
    this.element.children[0].className = this.element.children[0].className + ' vditor-menu--disabled';
    this.element.children[0].addEventListener(getEventName(), (event) => {
      vditor.undo.undo(vditor);
      event.preventDefault();
    });
  }
}

export class ACMEditorToolbarUpload extends ACMEditorToolbarItem {
  constructor(vditor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(vditor, menuItem);
    let inputHTML = '<input multiple=\'multiple\' type=\'file\'></label>';
    if (vditor.options.upload.accept) {
      inputHTML = `<input multiple='multiple' type='file' accept='${vditor.options.upload.accept}'></label>`;
    }
    this.element.children[0].innerHTML = `<label>${(menuItem.icon || uploadSVG)}${inputHTML}</label>`;
    this._bindEvent(vditor);
  }

  public _bindEvent(vditor: IACMEditor) {
    this.element.querySelector('input').addEventListener('change', (event: IACMEHTMLInputEvent) => {
      if (event.target.files.length === 0) {
        return;
      }
      uploadFiles(vditor, event.target.files, event.target);
    });
  }
}

export class ACMEditorToolbar {
  public elements: { [key: string]: HTMLElement };

  constructor(vditor: IACMEditor) {
      const options = vditor.options;
      this.elements = {};

      options.toolbar.forEach((menuItem: IACMEToolbarItem, i: number) => {
          let menuItemObj;
          switch (menuItem.name) {
              case 'emoji':
                  menuItemObj = new ACMEditorToolbarEmoji(vditor, menuItem);
                  break;
              case 'bold':
                  menuItemObj = new ACMEditorToolbarBold(vditor, menuItem);
                  break;
              case 'headings':
                  menuItemObj = new ACMEditorToolbarHeadings(vditor, menuItem);
                  break;
              case '|':
                  menuItemObj = new ACMEditorToolbarDivider();
                  break;
              case 'br':
                  menuItemObj = new ACMEditorToolbarBr();
                  break;
              case 'italic':
                  menuItemObj = new ACMEditorToolbarItalic(vditor, menuItem);
                  break;
              case 'strike':
                  menuItemObj = new ACMEditorToolbarStrike(vditor, menuItem);
                  break;
              case 'line':
                  menuItemObj = new ACMEditorToolbarLine(vditor, menuItem);
                  break;
              case 'quote':
                  menuItemObj = new ACMEditorToolbarQuote(vditor, menuItem);
                  break;
              case 'list':
                  menuItemObj = new ACMEditorToolbarList(vditor, menuItem);
                  break;
              case 'ordered-list':
                  menuItemObj = new ACMEditorToolbarOrderedList(vditor, menuItem);
                  break;
              case 'check':
                  menuItemObj = new ACMEditorToolbarCheck(vditor, menuItem);
                  break;
              case 'undo':
                  menuItemObj = new ACMEditorToolbarUndo(vditor, menuItem);
                  break;
              case 'redo':
                  menuItemObj = new ACMEditorToolbarRedo(vditor, menuItem);
                  break;
              case 'code':
                  menuItemObj = new ACMEditorToolbarCode(vditor, menuItem);
                  break;
              case 'inline-code':
                  menuItemObj = new ACMEditorToolbarInlineCode(vditor, menuItem);
                  break;
              case 'link':
                  menuItemObj = new ACMEditorToolbarLink(vditor, menuItem);
                  break;
              case 'help':
                  menuItemObj = new ACMEditorToolbarHelp(vditor, menuItem);
                  break;
              case 'table':
                  menuItemObj = new ACMEditorToolbarTable(vditor, menuItem);
                  break;
              case 'both':
                  menuItemObj = new ACMEditorToolbarBoth(vditor, menuItem);
                  break;
              case 'preview':
                  menuItemObj = new ACMEditorToolbarPreview(vditor, menuItem);
                  break;
              case 'fullscreen':
                  menuItemObj = new ACMEditorToolbarFullscreen(vditor, menuItem);
                  break;
              case 'upload':
                  menuItemObj = new ACMEditorToolbarUpload(vditor, menuItem);
                  break;
              case 'record':
                  menuItemObj = new ACMEditorToolbarRecord(vditor, menuItem);
                  break;
              case 'info':
                  menuItemObj = new ACMEditorToolbarInfo(vditor, menuItem);
                  break;
              case 'format':
                  menuItemObj = new ACMEditorToolbarFormat(vditor, menuItem);
                  break;
              default:
                  menuItemObj = new ACMEditorToolbarCustom(vditor, menuItem);
                  break;
          }

          let key = menuItem.name;
          if (key === 'br' || key === '|') {
              key = key + i;
          }

          this.elements[key] = menuItemObj.element;
      });
  }
}

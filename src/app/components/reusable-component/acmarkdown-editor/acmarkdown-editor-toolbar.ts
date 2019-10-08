import { insertText } from './acmarkdown-editor-util';
import { IACMarkdownEditor, IACMarkdownEditorToolbarItem } from './acmarkdown-editor-interface';
import { i18n } from './acmarkdown-editor-constant';

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
    this.element.children[0].innerHTML = tbItem.icon ||
`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32px' height='32px'>
<path d='M22.996 15.023c1.339-1.591 2.147-3.643 2.147-5.88 0-5.041-4.102-9.143-9.143-9.143h-11.429v32h13.714c5.041 0 9.143-4.102 9.143-9.143 0-3.32-1.779-6.232-4.433-7.834zM11.429 4.571h3.625c1.999 0 3.625 2.051 3.625 4.571s-1.626 4.571-3.625 4.571h-3.625v-9.143zM17.107 27.429h-5.679v-9.143h5.679c2.087 0 3.786 2.051 3.786 4.571s-1.698 4.571-3.786 4.571z'></path>
</svg>`;

    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMarkdownToolbarBoth extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon ||
`<svg version='1.1' xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>
<path d='M11.429 6.095h-9.905c-0.842 0-1.524 0.682-1.524 1.524v1.524c0 0.841 0.682 1.524 1.524 1.524h9.905c0.841 0 1.524-0.682 1.524-1.524v-1.524c0-0.842-0.682-1.524-1.524-1.524zM11.429 13.714h-9.905c-0.842 0-1.524 0.682-1.524 1.524v1.524c0 0.841 0.682 1.524 1.524 1.524h9.905c0.841 0 1.524-0.682 1.524-1.524v-1.524c0-0.841-0.682-1.524-1.524-1.524zM11.429 21.333h-9.905c-0.842 0-1.524 0.682-1.524 1.524v1.524c0 0.841 0.682 1.524 1.524 1.524h9.905c0.841 0 1.524-0.682 1.524-1.524v-1.524c0-0.841-0.682-1.524-1.524-1.524zM30.476 6.095h-12.952c-0.841 0-1.524 0.682-1.524 1.524v16.762c0 0.841 0.682 1.524 1.524 1.524h12.952c0.841 0 1.524-0.682 1.524-1.524v-16.762c0-0.841-0.682-1.524-1.524-1.524z'></path>
</svg>`;
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
    this.element.children[0].innerHTML = tbItem.icon ||
`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
<path d="M27.094 19.485v6.12c0 3.059-2.483 5.542-5.542 5.542h-16.010c-3.059 0-5.542-2.483-5.542-5.542v-16.010c0-3.059 2.483-5.542 5.542-5.542h16.010c0.769 0 1.54 0.154 2.251 0.481 0.174 0.077 0.308 0.25 0.346 0.443 0.039 0.211-0.019 0.404-0.174 0.558l-0.943 0.943c-0.115 0.115-0.289 0.193-0.443 0.193-0.058 0-0.115-0.019-0.174-0.039-0.289-0.077-0.578-0.115-0.866-0.115h-16.010c-1.693 0-3.079 1.386-3.079 3.079v16.010c0 1.693 1.386 3.079 3.079 3.079h16.010c1.693 0 3.079-1.386 3.079-3.079v-4.888c0-0.154 0.058-0.308 0.174-0.424l1.232-1.232c0.135-0.135 0.289-0.193 0.443-0.193 0.077 0 0.154 0.019 0.231 0.058 0.231 0.096 0.385 0.308 0.385 0.558zM31.54 10.076l-15.664 15.664c-0.615 0.615-1.578 0.615-2.194 0l-8.275-8.275c-0.615-0.615-0.615-1.578 0-2.194l2.116-2.116c0.615-0.615 1.578-0.615 2.194 0l5.060 5.060 12.451-12.451c0.615-0.615 1.578-0.615 2.194 0l2.116 2.116c0.615 0.615 0.615 1.578 0 2.194z"></path>
</svg>`;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMarkdownToolbarCode extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon ||
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M21.053 21.895l2.526 2.526 8.421-8.421-8.421-8.421-2.526 2.526 5.895 5.895z"></path>
    <path d="M10.947 10.105l-2.526-2.526-8.421 8.421 8.421 8.421 2.526-2.526-5.895-5.895z"></path>
    <path d="M17.613 6.487l1.828 0.499-5.052 18.527-1.828-0.499 5.052-18.527z"></path>
    </svg>`;
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
    this.element.children[0].innerHTML = tbItem.icon ||
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32px" height="32px">
<path d="M16 24.789c-3.756 0-6.911-2.254-8.188-5.559h16.376c-1.277 3.305-4.432 5.559-8.188 5.559zM10.366 14.423c-1.352 0-2.404-1.052-2.404-2.404s1.052-2.404 2.404-2.404 2.404 1.052 2.404 2.404-1.052 2.404-2.404 2.404zM21.634 14.423c-1.352 0-2.404-1.052-2.404-2.404s1.052-2.404 2.404-2.404 2.404 1.052 2.404 2.404-1.052 2.404-2.404 2.404zM16 28.845c7.061 0 12.845-5.784 12.845-12.845s-5.784-12.845-12.845-12.845-12.845 5.784-12.845 12.845 5.784 12.845 12.845 12.845zM16 0c8.864 0 16 7.136 16 16s-7.136 16-16 16-16-7.136-16-16 7.136-16 16-16z"></path>
</svg>`;

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
    this.element.children[0].innerHTML = tbItem.icon ||
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32px" height="32px">
    <path d="M32 0v13l-5-5-6 6-3-3 6-6-5-5zM14 21l-6 6 5 5h-13v-13l5 5 6-6z"></path>
</svg>`;
    this._bindEvent(vditor, tbItem);
  }

  public _bindEvent(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    this.element.children[0].addEventListener('click', function() {
      const vditorElement = document.getElementById(vditor.id);
      if (vditorElement.className.indexOf('vditor--fullscreen') > -1) {
        this.innerHTML = tbItem.icon || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32px" height="32px">
        <path d="M32 0v13l-5-5-6 6-3-3 6-6-5-5zM14 21l-6 6 5 5h-13v-13l5 5 6-6z"></path>
    </svg>`;
        vditorElement.className = vditorElement.className.replace(' vditor--fullscreen', '');
        Object.keys(vditor.toolbar.elements).forEach((key) => {
          const svgElement = vditor.toolbar.elements[key].firstChild as HTMLElement;
          if (svgElement) {
            svgElement.className = svgElement.className.replace('__s', '__n');
          }
        });
      } else {
        this.innerHTML = tbItem.icon || contractSVG;
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
    this.element.children[0].innerHTML = tbItem.icon || headingsSVG;

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
    this.element.children[0].innerHTML = tbItem.icon || helpSVG;
    this.bindEvent();
  }

  public bindEvent() {
    this.element.children[0].addEventListener('click', () => {
      window.open('https://hacpai.com/guide/markdown');
    });
  }
}

export class Info extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || infoSVG;
    this.bindEvent();
  }

  public bindEvent() {
    this.element.children[0].addEventListener('click', () => {
      window.open('https://github.com/b3log/vditor');
    });
  }
}

export class InlineCode extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || inlineCodeSVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class Italic extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || italicSVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class Line extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || lineSVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class Link extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || linkSVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class List extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || listSVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class OrderedList extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || orderedListVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class Preview extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || previewSVG;
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

export class Quote extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || quoteSVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class Record extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || recordSVG;

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

export class Redo extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || redoSVG;
    this.element.children[0].className = this.element.children[0].className + ' vditor-menu--disabled';
    this.element.children[0].addEventListener('click', () => {
      this.vditor.undo.redo(vditor);
    });
  }
}

export class Strike extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || strikekSVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class Table extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || tableSVG;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent(true);
  }
}

export class Undo extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    this.element.children[0].innerHTML = tbItem.icon || undoSVG;
    this.element.children[0].className = this.element.children[0].className + ' vditor-menu--disabled';
    this.element.children[0].addEventListener('click', () => {
      vditor.undo.undo(vditor);
    });
  }
}


export class Upload extends ACMarkdownEditorToolbarItem {
  constructor(vditor: IACMarkdownEditor, tbItem: IACMarkdownEditorToolbarItem) {
    super(vditor, tbItem);
    let inputHTML = '<input multiple='multiple' type='file'></label>';
    if (vditor.options.upload.accept) {
      inputHTML = `<input multiple='multiple' type='file' accept='${vditor.options.upload.accept}'></label>`;
    }
    this.element.children[0].innerHTML = `<label>${(tbItem.icon || uploadSVG)}${inputHTML}</label>`;
    this._bindEvent(vditor);
  }

  public _bindEvent(vditor: IACMarkdownEditor) {
    this.element.querySelector('input').addEventListener('change', (event: IHTMLInputEvent) => {
      if (event.target.files.length === 0) {
        return;
      }
      uploadFiles(vditor, event.target.files, event.target);
    });
  }
}

export class Toolbar {
  public elements: { [key: string]: HTMLElement };

  constructor(vditor: IACMarkdownEditor) {
    const options = vditor.options;
    this.elements = {};

    options.toolbar.forEach((tbItem: IACMarkdownEditorToolbarItem, i: number) => {
      let menuItemObj;
      switch (tbItem.name) {
        case 'emoji':
          menuItemObj = new Emoji(vditor, tbItem);
          break;
        case 'bold':
          menuItemObj = new Bold(vditor, tbItem);
          break;
        case 'headings':
          menuItemObj = new Headings(vditor, tbItem);
          break;
        case '|':
          menuItemObj = new Divider();
          break;
        case 'br':
          menuItemObj = new Br();
          break;
        case 'italic':
          menuItemObj = new Italic(vditor, tbItem);
          break;
        case 'strike':
          menuItemObj = new Strike(vditor, tbItem);
          break;
        case 'line':
          menuItemObj = new Line(vditor, tbItem);
          break;
        case 'quote':
          menuItemObj = new Quote(vditor, tbItem);
          break;
        case 'list':
          menuItemObj = new List(vditor, tbItem);
          break;
        case 'ordered-list':
          menuItemObj = new OrderedList(vditor, tbItem);
          break;
        case 'check':
          menuItemObj = new Check(vditor, tbItem);
          break;
        case 'undo':
          menuItemObj = new Undo(vditor, tbItem);
          break;
        case 'redo':
          menuItemObj = new Redo(vditor, tbItem);
          break;
        case 'code':
          menuItemObj = new Code(vditor, tbItem);
          break;
        case 'inline-code':
          menuItemObj = new InlineCode(vditor, tbItem);
          break;
        case 'link':
          menuItemObj = new Link(vditor, tbItem);
          break;
        case 'help':
          menuItemObj = new Help(vditor, tbItem);
          break;
        case 'table':
          menuItemObj = new Table(vditor, tbItem);
          break;
        case 'both':
          menuItemObj = new Both(vditor, tbItem);
          break;
        case 'preview':
          menuItemObj = new Preview(vditor, tbItem);
          break;
        case 'fullscreen':
          menuItemObj = new Fullscreen(vditor, tbItem);
          break;
        case 'upload':
          menuItemObj = new Upload(vditor, tbItem);
          break;
        case 'record':
          menuItemObj = new Record(vditor, tbItem);
          break;
        case 'info':
          menuItemObj = new Info(vditor, tbItem);
          break;
        default:
          menuItemObj = new Custom(vditor, tbItem);
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


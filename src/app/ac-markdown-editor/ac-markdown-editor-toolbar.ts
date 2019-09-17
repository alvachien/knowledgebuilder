import { insertText, getEventName, getText, getSelectPosition, formatRender,
  openURL, MediaRecorder,
} from './ac-markdown-editor-util';
import { IACMEditor, IACMEToolbarItem, IACMEHTMLInputEvent, } from './ac-markdown-editor-interfaces';
import { uploadFiles } from './ac-markdown-editor-upload';
import { i18n } from './ac-markdown-editor-i18n';
import { classPrefix } from './ac-markdown-editor-constants';

// Toolbar item
export abstract class ACMEditorToolbarItem {
  public element: HTMLElement;
  public menuItem: IACMEToolbarItem;
  public editor: IACMEditor;

  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    this.menuItem = menuItem;
    this.editor = editor;

    this.element = document.createElement('div');
    const iconElement = document.createElement('div');
    iconElement.className = `${classPrefix}-tooltipped ${classPrefix}-tooltipped__${menuItem.tipPosition}`;

    let hotkey = this.menuItem.hotkey ? ` <${this.menuItem.hotkey}>` : '';
    if (/Mac/.test(navigator.platform)) {
      hotkey = hotkey.replace('ctrl', '⌘');
    } else {
      hotkey = hotkey.replace('⌘', 'ctrl');
    }
    iconElement.setAttribute('aria-label',
      this.menuItem.tip ? this.menuItem.tip + hotkey : i18n[editor.options.lang][this.menuItem.name] + hotkey);
    this.element.appendChild(iconElement);
  }

  public bindEvent(replace: boolean = false) {
    this.element.children[0].addEventListener(getEventName(), (event) => {
      insertText(this.editor, this.menuItem.prefix || '', this.menuItem.suffix || '',
        replace, true);
      event.preventDefault();
    });
  }
}

export class ACMEditorToolbarBold extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    if (menuItem.icon) {
      this.element.children[0].innerHTML = menuItem.icon;
    } else {
      this.element.children[0].innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32px" height="32px">
        <path d="M22.996 15.023c1.339-1.591 2.147-3.643 2.147-5.88 0-5.041-4.102-9.143-9.143-9.143h-11.429v32h13.714c5.041 0 9.143-4.102 9.143-9.143 0-3.32-1.779-6.232-4.433-7.834zM11.429 4.571h3.625c1.999 0 3.625 2.051 3.625 4.571s-1.626 4.571-3.625 4.571h-3.625v-9.143zM17.107 27.429h-5.679v-9.143h5.679c2.087 0 3.786 2.051 3.786 4.571s-1.698 4.571-3.786 4.571z"></path>
      </svg>`;
    }

    super.bindEvent();
  }
}

export class ACMEditorToolbarBoth extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    const hasWYSIWYG = editor.options.toolbar.find((item: IACMEToolbarItem) => {
      if (item.name === 'wysiwyg') {
          return true;
      }
    });
    if (editor.currentMode === 'wysiwyg' && hasWYSIWYG) {
      this.element.style.display = 'none';
    }
    this.element.children[0].innerHTML = menuItem.icon
      || `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <path d="M11.429 6.095h-9.905c-0.842 0-1.524 0.682-1.524 1.524v1.524c0 0.841 0.682 1.524 1.524 1.524h9.905c0.841 0 1.524-0.682 1.524-1.524v-1.524c0-0.842-0.682-1.524-1.524-1.524zM11.429 13.714h-9.905c-0.842 0-1.524 0.682-1.524 1.524v1.524c0 0.841 0.682 1.524 1.524 1.524h9.905c0.841 0 1.524-0.682 1.524-1.524v-1.524c0-0.841-0.682-1.524-1.524-1.524zM11.429 21.333h-9.905c-0.842 0-1.524 0.682-1.524 1.524v1.524c0 0.841 0.682 1.524 1.524 1.524h9.905c0.841 0 1.524-0.682 1.524-1.524v-1.524c0-0.841-0.682-1.524-1.524-1.524zM30.476 6.095h-12.952c-0.841 0-1.524 0.682-1.524 1.524v16.762c0 0.841 0.682 1.524 1.524 1.524h12.952c0.841 0 1.524-0.682 1.524-1.524v-16.762c0-0.841-0.682-1.524-1.524-1.524z"></path>
      </svg>`;
    if (editor.options.preview.mode === 'both') {
      this.element.children[0].className =
        `${classPrefix}-tooltipped ${classPrefix}-tooltipped__${menuItem.tipPosition} ${classPrefix}-menu--current`;
    }
    this._bindEvent(editor, menuItem);
  }

  public _bindEvent(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    this.element.children[0].addEventListener(getEventName(), function() {
      editor.editor.element.style.display = 'block';
      if (editor.currentPreviewMode === 'both') {
        editor.preview.element.style.display = 'none';
          this.className =  this.className.replace(` ${classPrefix}-menu--current`, "");
          editor.currentPreviewMode = 'editor';
      } else {
          this.className = this.className + ` ${classPrefix}-menu--current`;
          editor.preview.element.style.display = 'block';
          editor.preview.render(editor);
          editor.currentPreviewMode = 'both';
      }
      if (editor.toolbar.elements.preview &&
        editor.toolbar.elements.preview.children[0].className.indexOf(`${classPrefix}-menu--current`) > -1) {
          editor.toolbar.elements.preview.children[0].className =
          editor.toolbar.elements.preview.children[0].className.replace(` ${classPrefix}-menu--current`, '');
      }

      if (editor.devtools &&  editor.devtools.ASTChart && editor.devtools.element.style.display === 'block') {
        editor.devtools.ASTChart.resize();
      }
  });
}
}

export class ACMEditorToolbarBr {
  public element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = `${classPrefix}-menu__br`;
  }
}

export class ACMEditorToolbarCheck extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || checkSVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M27.094 19.485v6.12c0 3.059-2.483 5.542-5.542 5.542h-16.010c-3.059 0-5.542-2.483-5.542-5.542v-16.010c0-3.059 2.483-5.542 5.542-5.542h16.010c0.769 0 1.54 0.154 2.251 0.481 0.174 0.077 0.308 0.25 0.346 0.443 0.039 0.211-0.019 0.404-0.174 0.558l-0.943 0.943c-0.115 0.115-0.289 0.193-0.443 0.193-0.058 0-0.115-0.019-0.174-0.039-0.289-0.077-0.578-0.115-0.866-0.115h-16.010c-1.693 0-3.079 1.386-3.079 3.079v16.010c0 1.693 1.386 3.079 3.079 3.079h16.010c1.693 0 3.079-1.386 3.079-3.079v-4.888c0-0.154 0.058-0.308 0.174-0.424l1.232-1.232c0.135-0.135 0.289-0.193 0.443-0.193 0.077 0 0.154 0.019 0.231 0.058 0.231 0.096 0.385 0.308 0.385 0.558zM31.54 10.076l-15.664 15.664c-0.615 0.615-1.578 0.615-2.194 0l-8.275-8.275c-0.615-0.615-0.615-1.578 0-2.194l2.116-2.116c0.615-0.615 1.578-0.615 2.194 0l5.060 5.060 12.451-12.451c0.615-0.615 1.578-0.615 2.194 0l2.116 2.116c0.615 0.615 0.615 1.578 0 2.194z"></path>
</svg>`;
    super.bindEvent();
  }
}

export class ACMEditorToolbarCode extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || codeSVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M21.053 21.895l2.526 2.526 8.421-8.421-8.421-8.421-2.526 2.526 5.895 5.895z"></path>
    <path d="M10.947 10.105l-2.526-2.526-8.421 8.421 8.421 8.421 2.526-2.526-5.895-5.895z"></path>
    <path d="M17.613 6.487l1.828 0.499-5.052 18.527-1.828-0.499 5.052-18.527z"></path>
    </svg>`;
    super.bindEvent();
  }
}

export class ACMEditorToolbarCustom extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon;
    this.element.children[0].addEventListener(getEventName(), (event) => {
      menuItem.click();
      event.preventDefault();
    });
  }
}

export class ACMEditorToolbarDevtools extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
      super(editor, menuItem);
      this.element.children[0].innerHTML = menuItem.icon || bugSVG;

      this.element.addEventListener(getEventName(), async () => {
          if (this.element.children[0].className.indexOf("vditor-menu--current") > -1) {
              this.element.children[0].className =
                  this.element.children[0].className.replace(" vditor-menu--current", "");
              vditor.devtools.element.style.display = "none";
              if (vditor.wysiwyg) {
                  const padding =
                      (vditor.wysiwyg.element.parentElement.scrollWidth - vditor.options.preview.maxWidth) / 2;
                  vditor.wysiwyg.element.style.paddingLeft = `${Math.max(10, padding)}px`;
                  vditor.wysiwyg.element.style.paddingRight = `${Math.max(10, padding)}px`;
              }
          } else {
              this.element.children[0].className += " vditor-menu--current";
              vditor.devtools.element.style.display = "block";
              if (vditor.wysiwyg) {
                  const padding =
                      ((vditor.wysiwyg.element.parentElement.scrollWidth / 2) - vditor.options.preview.maxWidth) / 2;
                  vditor.wysiwyg.element.style.paddingLeft = `${Math.max(10, padding)}px`;
                  vditor.wysiwyg.element.style.paddingRight = `${Math.max(10, padding)}px`;
              }
              vditor.devtools.renderEchart(vditor);
          }
      });
  }
}

export class ACMEditorToolbarDivider {
  public element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = `${classPrefix}-menu__divider`;
  }
}

export class ACMEditorToolbarEmoji extends ACMEditorToolbarItem {
  public element: HTMLElement;

  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || emojiSVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32px" height="32px">
    <path d="M16 24.789c-3.756 0-6.911-2.254-8.188-5.559h16.376c-1.277 3.305-4.432 5.559-8.188 5.559zM10.366 14.423c-1.352 0-2.404-1.052-2.404-2.404s1.052-2.404 2.404-2.404 2.404 1.052 2.404 2.404-1.052 2.404-2.404 2.404zM21.634 14.423c-1.352 0-2.404-1.052-2.404-2.404s1.052-2.404 2.404-2.404 2.404 1.052 2.404 2.404-1.052 2.404-2.404 2.404zM16 28.845c7.061 0 12.845-5.784 12.845-12.845s-5.784-12.845-12.845-12.845-12.845 5.784-12.845 12.845 5.784 12.845 12.845 12.845zM16 0c8.864 0 16 7.136 16 16s-7.136 16-16 16-16-7.136-16-16 7.136-16 16-16z"></path>
</svg>`;

    const emojiPanelElement = document.createElement('div');
    emojiPanelElement.className = classPrefix + '-panel';

    let commonEmojiHTML = '';
    Object.keys(editor.options.hint.emoji).forEach((key) => {
      const emojiValue = editor.options.hint.emoji[key];
      if (emojiValue.indexOf('.') > -1) {
        commonEmojiHTML += `<span data-value=':${key}: ' data-key=':${key}:'><img
data-value=':${key}: ' data-key=':${key}:' src='${emojiValue}'/></span>`;
      } else {
        commonEmojiHTML += `<span data-value='${emojiValue} ' data-key='${key}'>${emojiValue}</span>`;
      }
    });

    const tailHTML = `<div class='${classPrefix}-emojis__tail'>
  <span class='${classPrefix}-emojis__tip'></span><span>${editor.options.hint.emojiTail || ''}</span>
</div>`;

    emojiPanelElement.innerHTML = `<div class='${classPrefix}-emojis' style='max-height: ${
      editor.options.height === 'auto' ? 'auto' : editor.options.height as number - 80
      }px'>${commonEmojiHTML}</div>${tailHTML}`;

    this.element.appendChild(emojiPanelElement);

    this._bindEvent(emojiPanelElement, editor);
  }

  public _bindEvent(emojiPanelElement: HTMLElement, editor: IACMEditor) {
    this.element.children[0].addEventListener(getEventName(), (event) => {
      if (emojiPanelElement.style.display === 'block') {
        emojiPanelElement.style.display = 'none';
      } else {
        emojiPanelElement.style.display = 'block';
        if (editor.toolbar.elements.headings) {
          const headingsPanel = editor.toolbar.elements.headings.children[1] as HTMLElement;
          headingsPanel.style.display = 'none';
        }
      }

      if (editor.hint) {
        editor.hint.element.style.display = 'none';
      }
      event.preventDefault();
    });

    emojiPanelElement.querySelectorAll(`.${classPrefix}-emojis span`).forEach((element) => {
      element.addEventListener(getEventName(), (event: Event) => {
        insertText(editor, (event.target as HTMLElement).getAttribute('data-value'),
          '', true);
        emojiPanelElement.style.display = 'none';
        event.preventDefault();
      });
      element.addEventListener('mouseover', (event: Event) => {
        emojiPanelElement.querySelector(`.${classPrefix}-emojis__tip`).innerHTML =
          (event.target as HTMLElement).getAttribute('data-key');
      });
    });
  }
}

export class ACMEditorToolbarFormat extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || formatSVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32px" height="32px">
    <path d="M14.25 17.75v-3.5h17.75v3.5h-17.75zM14.25 10.667v-3.583h17.75v3.583h-17.75zM0 0h32v3.583h-32v-3.583zM14.25 24.917v-3.583h17.75v3.583h-17.75zM0 8.917l7.083 7.083-7.083 7.083v-14.167zM0 32v-3.583h32v3.583h-32z"></path>
</svg>`;
    this.element.children[0].addEventListener(getEventName(), (event) => {
      const formatResult = editor.lute.FormatStr('', getText(editor.editor.element));
      formatRender(editor, formatResult[0] || formatResult[1],
        getSelectPosition(editor.editor.element, editor.editor.range));
      event.preventDefault();
    });
  }
}

export class ACMEditorToolbarFullscreen extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || fullscreenSVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32px" height="32px">
    <path d="M32 0v13l-5-5-6 6-3-3 6-6-5-5zM14 21l-6 6 5 5h-13v-13l5 5 6-6z"></path>
</svg>`;
    this._bindEvent(editor, menuItem);
  }

  public _bindEvent(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    this.element.children[0].addEventListener(getEventName(), function() {
      // const editorElement = document.getElementById(editor.id);
      const editorElement = editor.host;
      if (editorElement.className.indexOf(`${classPrefix}--fullscreen`) > -1) {
        this.innerHTML = menuItem.icon
        // || fullscreenSVG;
        || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32px" height="32px">
        <path d="M32 0v13l-5-5-6 6-3-3 6-6-5-5zM14 21l-6 6 5 5h-13v-13l5 5 6-6z"></path>
    </svg>`;
        editorElement.className = editorElement.className.replace(` ${classPrefix}--fullscreen`, '');
        Object.keys(editor.toolbar.elements).forEach((key) => {
          const svgElement = editor.toolbar.elements[key].firstChild as HTMLElement;
          if (svgElement) {
            svgElement.className = svgElement.className.replace('__s', '__n');
          }
        });
      } else {
        this.innerHTML = menuItem.icon
        // || contractSVG;
        || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32px" height="32px">
        <path d="M14 18v13l-5-5-6 6-3-3 6-6-5-5zM32 3l-6 6 5 5h-13v-13l5 5 6-6z"></path>
    </svg>`;
        editorElement.className = editorElement.className + ` ${classPrefix}--fullscreen`;
        Object.keys(editor.toolbar.elements).forEach((key) => {
          const svgElement = editor.toolbar.elements[key].firstChild as HTMLElement;
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

  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || headingsSVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M4.45 0h3.594c0.595 0 1.078 0.384 1.078 0.858v30.284c0 0.474-0.482 0.858-1.078 0.858h-3.594c-0.595 0-1.078-0.384-1.078-0.858v-30.284c-0-0.474 0.482-0.858 1.078-0.858zM23.888 0h3.673c0.59 0 1.068 0.384 1.068 0.858v30.284c0 0.474-0.478 0.858-1.068 0.858h-3.673c-0.59 0-1.068-0.384-1.068-0.858v-30.284c0-0.474 0.478-0.858 1.068-0.858z"></path>
    <path d="M25.069 14.167v3.667c0 0.589-0.384 1.065-0.858 1.065h-15.655c-0.474 0-0.858-0.477-0.858-1.065v-3.667c0-0.589 0.384-1.065 0.858-1.065h15.655c0.474 0 0.858 0.477 0.858 1.065z"></path>
</svg>`;

    const headingsPanelElement = document.createElement('div');
    headingsPanelElement.className = `${classPrefix}-panel`;
    headingsPanelElement.innerHTML = `<h1 data-value='# '>Heading 1</h1>
<h2 data-value='## '>Heading 2</h2>
<h3 data-value='### '>Heading 3</h3>
<h4 data-value='#### '>Heading 4</h4>
<h5 data-value='##### '>Heading 5</h5>
<h6 data-value='###### '>Heading 6</h6>`;

    this.element.appendChild(headingsPanelElement);

    this._bindEvent(headingsPanelElement, editor);
  }

  public _bindEvent(headingsPanelElement: HTMLElement, editor: IACMEditor) {
    this.element.children[0].addEventListener(getEventName(), (event) => {
      if (headingsPanelElement.style.display === 'block') {
        headingsPanelElement.style.display = 'none';
      } else {
        headingsPanelElement.style.display = 'block';
        if (editor.toolbar.elements.emoji) {
          const panel = editor.toolbar.elements.emoji.children[1] as HTMLElement;
          panel.style.display = 'none';
        }
      }
      if (editor.hint) {
        editor.hint.element.style.display = 'none';
      }
      event.preventDefault();
    });

    for (let i = 0; i < 6; i++) {
      headingsPanelElement.children.item(i).addEventListener(getEventName(), (event: Event) => {
        insertText(editor, (event.target as HTMLElement).getAttribute('data-value'), '',
          false, true);
        headingsPanelElement.style.display = 'none';
        event.preventDefault();
      });
    }
  }
}

export class ACMEditorToolbarHelp extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || helpSVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M19.652 25v6c0 0.55-0.45 1-1 1h-6c-0.55 0-1-0.45-1-1v-6c0-0.55 0.45-1 1-1h6c0.55 0 1 0.45 1 1zM27.552 10c0 4.75-3.225 6.575-5.6 7.9-1.475 0.85-2.4 2.575-2.4 3.3v0c0 0.55-0.425 1.2-1 1.2h-6c-0.55 0-0.9-0.85-0.9-1.4v-1.125c0-3.025 3-5.625 5.2-6.625 1.925-0.875 2.725-1.7 2.725-3.3 0-1.4-1.825-2.65-3.85-2.65-1.125 0-2.15 0.35-2.7 0.725-0.6 0.425-1.2 1.025-2.675 2.875-0.2 0.25-0.5 0.4-0.775 0.4-0.225 0-0.425-0.075-0.625-0.2l-4.1-3.125c-0.425-0.325-0.525-0.875-0.25-1.325 2.7-4.475 6.5-6.65 11.6-6.65 5.35 0 11.35 4.275 11.35 10z"></path>
    </svg>`;
    this.bindEvent();
  }

  public bindEvent() {
    this.element.children[0].addEventListener(getEventName(), () => {
      // openURL('https://hacpai.com/guide/markdown');
    });
  }
}

export class ACMEditorToolbarInfo extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || infoSVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M23.273 27.636v2.909c0 0.795-0.659 1.455-1.455 1.455h-11.636c-0.795 0-1.455-0.659-1.455-1.455v-2.909c0-0.795 0.659-1.455 1.455-1.455h1.455v-8.727h-1.455c-0.795 0-1.455-0.659-1.455-1.455v-2.909c0-0.795 0.659-1.455 1.455-1.455h8.727c0.795 0 1.455 0.659 1.455 1.455v13.091h1.455c0.795 0 1.455 0.659 1.455 1.455zM20.364 1.455v4.364c0 0.795-0.659 1.455-1.455 1.455h-5.818c-0.795 0-1.455-0.659-1.455-1.455v-4.364c0-0.795 0.659-1.455 1.455-1.455h5.818c0.795 0 1.455 0.659 1.455 1.455z"></path>
    </svg>`;
    this.bindEvent();
  }

  public bindEvent() {
    this.element.children[0].addEventListener(getEventName(), () => {
    });
  }
}

export class ACMEditorToolbarInlineCode extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || inlineCodeSVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M18.133 23.467l3.2 3.2 10.667-10.667-10.667-10.667-3.2 3.2 7.467 7.467z"></path>
    <path d="M13.867 8.533l-3.2-3.2-10.667 10.667 10.667 10.667 3.2-3.2-7.467-7.467z"></path>
    </svg>`;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMEditorToolbarItalic extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || italicSVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M29.714 0v2.286h-4.571l-11.429 27.429h4.571v2.286h-16v-2.286h4.571l11.429-27.429h-4.571v-2.286z"></path>
</svg>`;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMEditorToolbarLine extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || lineSVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M31.68 14.56h-31.36c-0.176 0-0.32 0.144-0.32 0.32v2.24c0 0.176 0.144 0.32 0.32 0.32h31.36c0.176 0 0.32-0.144 0.32-0.32v-2.24c0-0.176-0.144-0.32-0.32-0.32z"></path>
    </svg>`;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMEditorToolbarLink extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || linkSVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M29.187 2.933l-0.12-0.121c-2.813-2.812-7.415-2.812-10.228 0l-6.516 6.517c-2.812 2.812-2.812 7.415 0 10.227l0.12 0.12c0.234 0.234 0.482 0.446 0.739 0.641l2.386-2.386c-0.278-0.164-0.542-0.361-0.78-0.599l-0.121-0.121c-1.527-1.527-1.527-4.012 0-5.539l6.517-6.516c1.527-1.527 4.012-1.527 5.539 0l0.121 0.12c1.527 1.527 1.527 4.012 0 5.539l-2.948 2.948c0.512 1.264 0.754 2.611 0.733 3.955l4.559-4.559c2.812-2.812 2.812-7.415-0-10.227zM19.557 12.323c-0.234-0.234-0.482-0.446-0.739-0.641l-2.386 2.385c0.278 0.164 0.542 0.361 0.78 0.599l0.121 0.121c1.527 1.527 1.527 4.012 0 5.539l-6.517 6.517c-1.527 1.527-4.012 1.527-5.539 0l-0.121-0.121c-1.527-1.527-1.527-4.012 0-5.539l2.948-2.948c-0.512-1.264-0.754-2.611-0.733-3.955l-4.559 4.559c-2.812 2.812-2.812 7.415 0 10.228l0.12 0.12c2.813 2.812 7.415 2.812 10.228 0l6.516-6.517c2.812-2.812 2.812-7.415 0-10.228l-0.12-0.12z"></path>
</svg>`;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMEditorToolbarList extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || listSVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M12 2h20v4h-20v-4zM12 14h20v4h-20v-4zM12 26h20v4h-20v-4zM0 4c0 2.209 1.791 4 4 4s4-1.791 4-4c0-2.209-1.791-4-4-4s-4 1.791-4 4zM0 16c0 2.209 1.791 4 4 4s4-1.791 4-4c0-2.209-1.791-4-4-4s-4 1.791-4 4zM0 28c0 2.209 1.791 4 4 4s4-1.791 4-4c0-2.209-1.791-4-4-4s-4 1.791-4 4z"></path>
</svg>`;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMEditorToolbarOrderedList extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || orderedListVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M11 26h20v4h-20zM11 14h20v4h-20zM11 2h20v4h-20zM5 0v8h-2v-6h-2v-2zM3 16.438v1.563h4v2h-6v-4.563l4-1.875v-1.563h-4v-2h6v4.563zM7 22v10h-6v-2h4v-2h-4v-2h4v-2h-4v-2z"></path>
</svg>`;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMEditorToolbarPreview extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || previewSVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M0 16c3.037-5.864 9.058-9.802 16-9.802s12.963 3.938 15.953 9.703l0.047 0.1c-3.037 5.864-9.058 9.802-16 9.802s-12.963-3.938-15.953-9.703l-0.047-0.1zM16 22.531c3.607 0 6.531-2.924 6.531-6.531s-2.924-6.531-6.531-6.531v0c-3.607 0-6.531 2.924-6.531 6.531s2.924 6.531 6.531 6.531v0zM16 19.265c-1.804 0-3.265-1.461-3.265-3.265s1.461-3.265 3.265-3.265v0c1.804 0 3.265 1.461 3.265 3.265s-1.461 3.265-3.265 3.265v0z"></path>
    </svg>`;
    if (editor.options.preview.mode === 'preview') {
      this.element.children[0].className =
        `${classPrefix}-tooltipped ${classPrefix}-tooltipped__${menuItem.tipPosition} ${classPrefix}-menu--current`;
    }
    this._bindEvent(editor, menuItem);
  }

  public _bindEvent(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    this.element.children[0].addEventListener(getEventName(), function() {
      // const editorElement = document.getElementById(editor.id);
      const editorElement = editor.host;
      let className;
      if (editor.preview.element.className === `${classPrefix}-preview ${classPrefix}-preview--preview`) {
        editor.preview.element.className = `${classPrefix}-preview ${classPrefix}-preview--editor`;
        className = `${classPrefix}-tooltipped ${classPrefix}-tooltipped__${menuItem.tipPosition}`;
      } else {
        editor.preview.element.className = `${classPrefix}-preview ${classPrefix}-preview--preview`;
        className = `${classPrefix}-tooltipped ${classPrefix}-tooltipped__${menuItem.tipPosition} ${classPrefix}-menu--current`;
        editor.preview.render(editor);
        editor.editor.element.blur();
      }
      if (editorElement.className.indexOf(`${classPrefix}--fullscreen`) > -1) {
        className = className.replace('__n', '__s');
      }
      this.className = className;

      if (editor.toolbar.elements.both &&
        editor.toolbar.elements.both.children[0].className.indexOf(`${classPrefix}-menu--current`) > -1) {
          editor.toolbar.elements.both.children[0].className =
          editor.toolbar.elements.both.children[0].className.replace(` ${classPrefix}-menu--current`, '');
      }
    });
  }
}

export class ACMEditorToolbarQuote extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || quoteSVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M7.024 13.003c3.862 0 6.993 3.131 6.993 6.993s-3.131 6.993-6.993 6.993-6.993-3.131-6.993-6.993l-0.031-0.999c0-7.724 6.262-13.986 13.986-13.986v3.996c-2.668 0-5.177 1.039-7.064 2.926-0.363 0.363-0.695 0.75-0.994 1.156 0.357-0.056 0.723-0.086 1.096-0.086zM25.007 13.003c3.862 0 6.993 3.131 6.993 6.993s-3.131 6.993-6.993 6.993-6.993-3.131-6.993-6.993l-0.031-0.999c0-7.724 6.262-13.986 13.986-13.986v3.996c-2.668 0-5.177 1.039-7.064 2.926-0.363 0.363-0.695 0.75-0.994 1.156 0.357-0.056 0.723-0.086 1.096-0.086z"></path>
</svg>`;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMEditorToolbarRecord extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || recordSVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M4.571 16c0 6.312 5.117 11.429 11.429 11.429s11.429-5.117 11.429-11.429v0c0-6.312-5.117-11.429-11.429-11.429s-11.429 5.117-11.429 11.429v0z"></path>
    <path d="M16 30.857c-8.229 0-14.933-6.705-14.933-14.933s6.705-14.933 14.933-14.933 15.010 6.705 15.010 15.010c0 8.152-6.705 14.857-15.010 14.857zM16 0c-8.838 0-16 7.162-16 16s7.162 16 16 16 16-7.162 16-16-7.162-16-16-16z"></path>
    </svg>`;

    this._bindEvent(editor);
  }

  public _bindEvent(editor: IACMEditor) {
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
          editor.tip.show(i18n[editor.options.lang].recording);
          editor.editor.element.setAttribute('contenteditable', 'false');
        }).catch(() => {
          editor.tip.show(i18n[editor.options.lang]['record-tip']);
        });
        return;
      }

      if (mediaRecorder.isRecording) {
        mediaRecorder.stopRecording();
        editor.tip.hide();
        const file: File = new File([mediaRecorder.buildWavFileBlob()],
          `record${(new Date()).getTime()}.wav`, { type: 'video/webm' });
        uploadFiles(editor, [file]);
      } else {
        editor.tip.show(i18n[editor.options.lang].recording);
        editor.editor.element.setAttribute('contenteditable', 'false');
        mediaRecorder.startRecordingNewWavFile();
      }
      event.preventDefault();
    });
  }
}

export class ACMEditorToolbarRedo extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || redoSVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M19.583 9.75q-8.667 1.25-13.375 6.625t-6.208 12.958q6.417-9.083 19.583-9.083v7.25l12.417-12.417-12.417-12.417v7.083z"></path>
</svg>`;
    this.element.children[0].className = this.element.children[0].className + ` ${classPrefix}-menu--disabled`;
    this.element.children[0].addEventListener(getEventName(), (event) => {
      this.editor.undo.redo(editor);
      event.preventDefault();
    });
  }
}

export class ACMEditorToolbarStrike extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || strikekSVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M32 16v2h-7.328c0.86 1.203 1.328 2.584 1.328 4 0 2.215-1.146 4.345-3.143 5.843-1.855 1.391-4.29 2.157-6.857 2.157s-5.002-0.766-6.857-2.157c-1.998-1.498-3.143-3.628-3.143-5.843h4c0 2.168 2.748 4 6 4s6-1.832 6-4c0-2.168-2.748-4-6-4h-16v-2h9.36c-0.073-0.052-0.146-0.104-0.217-0.157-1.998-1.498-3.143-3.628-3.143-5.843s1.146-4.345 3.143-5.843c1.855-1.391 4.29-2.157 6.857-2.157s5.002 0.766 6.857 2.157c1.997 1.498 3.143 3.628 3.143 5.843h-4c0-2.168-2.748-4-6-4s-6 1.832-6 4c0 2.168 2.748 4 6 4 2.468 0 4.814 0.709 6.64 2h9.36z"></path>
    </svg>`;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent();
  }
}

export class ACMEditorToolbarTable extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || tableSVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M9.846 26.462v-3.692c0-0.346-0.269-0.615-0.615-0.615h-6.154c-0.346 0-0.615 0.269-0.615 0.615v3.692c0 0.346 0.269 0.615 0.615 0.615h6.154c0.346 0 0.615-0.269 0.615-0.615zM9.846 19.077v-3.692c0-0.346-0.269-0.615-0.615-0.615h-6.154c-0.346 0-0.615 0.269-0.615 0.615v3.692c0 0.346 0.269 0.615 0.615 0.615h6.154c0.346 0 0.615-0.269 0.615-0.615zM19.692 26.462v-3.692c0-0.346-0.269-0.615-0.615-0.615h-6.154c-0.346 0-0.615 0.269-0.615 0.615v3.692c0 0.346 0.269 0.615 0.615 0.615h6.154c0.346 0 0.615-0.269 0.615-0.615zM9.846 11.692v-3.692c0-0.346-0.269-0.615-0.615-0.615h-6.154c-0.346 0-0.615 0.269-0.615 0.615v3.692c0 0.346 0.269 0.615 0.615 0.615h6.154c0.346 0 0.615-0.269 0.615-0.615zM19.692 19.077v-3.692c0-0.346-0.269-0.615-0.615-0.615h-6.154c-0.346 0-0.615 0.269-0.615 0.615v3.692c0 0.346 0.269 0.615 0.615 0.615h6.154c0.346 0 0.615-0.269 0.615-0.615zM29.538 26.462v-3.692c0-0.346-0.269-0.615-0.615-0.615h-6.154c-0.346 0-0.615 0.269-0.615 0.615v3.692c0 0.346 0.269 0.615 0.615 0.615h6.154c0.346 0 0.615-0.269 0.615-0.615zM19.692 11.692v-3.692c0-0.346-0.269-0.615-0.615-0.615h-6.154c-0.346 0-0.615 0.269-0.615 0.615v3.692c0 0.346 0.269 0.615 0.615 0.615h6.154c0.346 0 0.615-0.269 0.615-0.615zM29.538 19.077v-3.692c0-0.346-0.269-0.615-0.615-0.615h-6.154c-0.346 0-0.615 0.269-0.615 0.615v3.692c0 0.346 0.269 0.615 0.615 0.615h6.154c0.346 0 0.615-0.269 0.615-0.615zM29.538 11.692v-3.692c0-0.346-0.269-0.615-0.615-0.615h-6.154c-0.346 0-0.615 0.269-0.615 0.615v3.692c0 0.346 0.269 0.615 0.615 0.615h6.154c0.346 0 0.615-0.269 0.615-0.615zM32 5.538v20.923c0 1.692-1.385 3.077-3.077 3.077h-25.846c-1.692 0-3.077-1.385-3.077-3.077v-20.923c0-1.692 1.385-3.077 3.077-3.077h25.846c1.692 0 3.077 1.385 3.077 3.077z"></path>
    </svg>`;
    this.bindEvent();
  }

  public bindEvent() {
    super.bindEvent(true);
  }
}

export class ACMEditorToolbarUndo extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    this.element.children[0].innerHTML = menuItem.icon
    // || undoSVG;
    || `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M12.417 9.75q8.667 1.25 13.375 6.625t6.208 12.958q-6.417-9.083-19.583-9.083v7.25l-12.417-12.417 12.417-12.417v7.083z"></path>
    </svg>`;
    this.element.children[0].className = this.element.children[0].className + ` ${classPrefix}-menu--disabled`;
    this.element.children[0].addEventListener(getEventName(), (event) => {
      editor.undo.undo(editor);
      event.preventDefault();
    });
  }
}

export class ACMEditorToolbarUpload extends ACMEditorToolbarItem {
  constructor(editor: IACMEditor, menuItem: IACMEToolbarItem) {
    super(editor, menuItem);
    let inputHTML = '<input multiple=\'multiple\' type=\'file\'></label>';
    if (editor.options.upload.accept) {
      inputHTML = `<input multiple='multiple' type='file' accept='${editor.options.upload.accept}'></label>`;
    }
    if (menuItem.icon) {
      this.element.children[0].innerHTML = `<label>${(menuItem.icon)}${inputHTML}</label>`;
    } else {

    }
    this.element.children[0].innerHTML = `<label><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M21.334 16.532q0-0.233-0.15-0.384l-5.867-5.867q-0.15-0.15-0.384-0.15t-0.384 0.15l-5.85 5.85q-0.167 0.2-0.167 0.399 0 0.233 0.15 0.384t0.384 0.15h3.733v5.867q0 0.217 0.159 0.375t0.375 0.159h3.2q0.217 0 0.375-0.159t0.159-0.375v-5.867h3.734q0.217 0 0.375-0.159t0.159-0.375zM32 21.332q0 2.65-1.875 4.525t-4.525 1.875h-18.133q-3.083 0-5.275-2.192t-2.192-5.275q0-2.166 1.167-4t3.134-2.75q-0.034-0.5-0.034-0.717 0-3.533 2.5-6.033t6.033-2.5q2.6 0 4.759 1.45t3.142 3.849q1.184-1.033 2.767-1.033 1.767 0 3.017 1.25t1.25 3.017q0 1.267-0.683 2.3 2.166 0.516 3.558 2.258t1.392 3.975z"></path>
</svg>${inputHTML}</label>`;
    this._bindEvent(editor);
  }

  public _bindEvent(editor: IACMEditor) {
    this.element.querySelector('input').addEventListener('change', (event: IACMEHTMLInputEvent) => {
      if (event.target.files.length === 0) {
        return;
      }
      uploadFiles(editor, event.target.files, event.target);
    });
  }
}

export class ACMEditorToolbar {
  public elements: { [key: string]: HTMLElement };

  constructor(editor: IACMEditor) {
      const options = editor.options;
      this.elements = {};

      options.toolbar.forEach((menuItem: IACMEToolbarItem, i: number) => {
          let menuItemObj;
          switch (menuItem.name) {
              case 'emoji':
                  menuItemObj = new ACMEditorToolbarEmoji(editor, menuItem);
                  break;
              case 'bold':
                  menuItemObj = new ACMEditorToolbarBold(editor, menuItem);
                  break;
              case 'headings':
                  menuItemObj = new ACMEditorToolbarHeadings(editor, menuItem);
                  break;
              case '|':
                  menuItemObj = new ACMEditorToolbarDivider();
                  break;
              case 'br':
                  menuItemObj = new ACMEditorToolbarBr();
                  break;
              case 'italic':
                  menuItemObj = new ACMEditorToolbarItalic(editor, menuItem);
                  break;
              case 'strike':
                  menuItemObj = new ACMEditorToolbarStrike(editor, menuItem);
                  break;
              case 'line':
                  menuItemObj = new ACMEditorToolbarLine(editor, menuItem);
                  break;
              case 'quote':
                  menuItemObj = new ACMEditorToolbarQuote(editor, menuItem);
                  break;
              case 'list':
                  menuItemObj = new ACMEditorToolbarList(editor, menuItem);
                  break;
              case 'ordered-list':
                  menuItemObj = new ACMEditorToolbarOrderedList(editor, menuItem);
                  break;
              case 'check':
                  menuItemObj = new ACMEditorToolbarCheck(editor, menuItem);
                  break;
              case 'undo':
                  menuItemObj = new ACMEditorToolbarUndo(editor, menuItem);
                  break;
              case 'redo':
                  menuItemObj = new ACMEditorToolbarRedo(editor, menuItem);
                  break;
              case 'code':
                  menuItemObj = new ACMEditorToolbarCode(editor, menuItem);
                  break;
              case 'inline-code':
                  menuItemObj = new ACMEditorToolbarInlineCode(editor, menuItem);
                  break;
              case 'link':
                  menuItemObj = new ACMEditorToolbarLink(editor, menuItem);
                  break;
              case 'help':
                  menuItemObj = new ACMEditorToolbarHelp(editor, menuItem);
                  break;
              case 'table':
                  menuItemObj = new ACMEditorToolbarTable(editor, menuItem);
                  break;
              case 'both':
                  menuItemObj = new ACMEditorToolbarBoth(editor, menuItem);
                  break;
              case 'preview':
                  menuItemObj = new ACMEditorToolbarPreview(editor, menuItem);
                  break;
              case 'fullscreen':
                  menuItemObj = new ACMEditorToolbarFullscreen(editor, menuItem);
                  break;
              case 'upload':
                  menuItemObj = new ACMEditorToolbarUpload(editor, menuItem);
                  break;
              case 'record':
                  menuItemObj = new ACMEditorToolbarRecord(editor, menuItem);
                  break;
              case 'info':
                  menuItemObj = new ACMEditorToolbarInfo(editor, menuItem);
                  break;
              case 'format':
                  menuItemObj = new ACMEditorToolbarFormat(editor, menuItem);
                  break;
              default:
                  menuItemObj = new ACMEditorToolbarCustom(editor, menuItem);
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

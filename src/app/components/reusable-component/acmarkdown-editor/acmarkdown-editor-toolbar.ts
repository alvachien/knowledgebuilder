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
  constructor(vditor: IACMarkdownEditor, menuItem: IACMarkdownEditorToolbarItem) {
      super(vditor, menuItem);
      this.element.children[0].innerHTML = menuItem.icon || boldSVG;
      this.bindEvent();
  }

  public bindEvent() {
      super.bindEvent();
  }
}

export class Both extends MenuItem {
  constructor(vditor: IVditor, menuItem: IMenuItem) {
      super(vditor, menuItem);
      this.element.children[0].innerHTML = menuItem.icon || bothSVG;
      if (vditor.options.preview.mode === "both") {
          this.element.children[0].className =
              `vditor-tooltipped vditor-tooltipped__${menuItem.tipPosition} vditor-menu--current`;
      }
      this._bindEvent(vditor, menuItem);
  }

  public _bindEvent(vditor: IVditor, menuItem: IMenuItem) {
      this.element.children[0].addEventListener("click", function() {
          const vditorElement = document.getElementById(vditor.id);
          let className;
          if (vditor.preview.element.className === "vditor-preview vditor-preview--both") {
              vditor.preview.element.className = "vditor-preview vditor-preview--editor";
              className = `vditor-tooltipped vditor-tooltipped__${menuItem.tipPosition}`;
          } else {
              vditor.preview.element.className = "vditor-preview vditor-preview--both";
              className = `vditor-tooltipped vditor-tooltipped__${menuItem.tipPosition} vditor-menu--current`;
              vditor.preview.render(vditor);
          }
          if (vditorElement.className.indexOf("vditor--fullscreen") > -1) {
              className = className.replace("__n", "__s");
          }
          this.className = className;

          if (vditor.toolbar.elements.preview &&
              vditor.toolbar.elements.preview.children[0].className.indexOf("vditor-menu--current") > -1) {
              vditor.toolbar.elements.preview.children[0].className =
                  vditor.toolbar.elements.preview.children[0].className.replace(" vditor-menu--current", "");
          }
      });
  }
}

export class Br {
  public element: HTMLElement;

  constructor() {
      this.element = document.createElement("div");
      this.element.className = "vditor-menu__br";
  }
}

export class Check extends MenuItem {
  constructor(vditor: IVditor, menuItem: IMenuItem) {
      super(vditor, menuItem);
      this.element.children[0].innerHTML = menuItem.icon || checkSVG;
      this.bindEvent();
  }

  public bindEvent() {
      super.bindEvent();
  }
}

export class Code extends MenuItem {
  constructor(vditor: IVditor, menuItem: IMenuItem) {
      super(vditor, menuItem);
      this.element.children[0].innerHTML = menuItem.icon || codeSVG;
      this.bindEvent();
  }

  public bindEvent() {
      super.bindEvent();
  }
}

export class Custom extends MenuItem {
  constructor(vditor: IVditor, menuItem: IMenuItem) {
      super(vditor, menuItem);
      this.element.children[0].innerHTML = menuItem.icon;
      this.element.children[0].addEventListener("click", () => {
          menuItem.click();
      });
  }
}

export class Divider {
  public element: HTMLElement;

  constructor() {
      this.element = document.createElement("div");
      this.element.className = "vditor-menu__divider";
  }
}

export class Emoji extends MenuItem {
  public element: HTMLElement;

  constructor(vditor: IVditor, menuItem: IMenuItem) {
      super(vditor, menuItem);
      this.element.children[0].innerHTML = menuItem.icon || emojiSVG;

      const emojiPanelElement = document.createElement("div");
      emojiPanelElement.className = "vditor-panel";

      let commonEmojiHTML = "";
      Object.keys(vditor.options.hint.emoji).forEach((key) => {
          const emojiValue = vditor.options.hint.emoji[key];
          if (emojiValue.indexOf(".") > -1) {
              commonEmojiHTML += `<span data-value=":${key}: " data-key=":${key}:"><img
data-value=":${key}: " data-key=":${key}:" src="${emojiValue}"/></span>`;
          } else {
              commonEmojiHTML += `<span data-value="${emojiValue} " data-key="${key}">${emojiValue}</span>`;
          }
      });

      const tailHTML = `<div class="vditor-emojis__tail">
  <span class="vditor-emojis__tip"></span><span>${vditor.options.hint.emojiTail || ""}</span>
</div>`;

      emojiPanelElement.innerHTML = `<div class="vditor-emojis" style="max-height: ${
          vditor.options.height === "auto" ? "auto" : vditor.options.height as number - 80
          }px">${commonEmojiHTML}</div>${tailHTML}`;

      this.element.appendChild(emojiPanelElement);

      this._bindEvent(emojiPanelElement, vditor);
  }

  public _bindEvent(emojiPanelElement: HTMLElement, vditor: IVditor) {
      this.element.children[0].addEventListener("click", () => {
          if (emojiPanelElement.style.display === "block") {
              emojiPanelElement.style.display = "none";
          } else {
              emojiPanelElement.style.display = "block";
              if (vditor.toolbar.elements.headings) {
                  const headingsPanel = vditor.toolbar.elements.headings.children[1] as HTMLElement;
                  headingsPanel.style.display = "none";
              }
          }

          if (vditor.hint) {
             vditor.hint.element.style.display = "none";
         }
      });

      emojiPanelElement.querySelectorAll(".vditor-emojis span").forEach((element) => {
          element.addEventListener("click", (event: Event) => {
              insertText(vditor, (event.target as HTMLElement).getAttribute("data-value"),
                  "", true);
              emojiPanelElement.style.display = "none";
          });
          element.addEventListener("mouseover", (event: Event) => {
              emojiPanelElement.querySelector(".vditor-emojis__tip").innerHTML =
                  (event.target as HTMLElement).getAttribute("data-key");
          });
      });
  }
}

export class Fullscreen extends MenuItem {
  constructor(vditor: IVditor, menuItem: IMenuItem) {
      super(vditor, menuItem);
      this.element.children[0].innerHTML = menuItem.icon || fullscreenSVG;
      this._bindEvent(vditor, menuItem);
  }

  public _bindEvent(vditor: IVditor, menuItem: IMenuItem) {
      this.element.children[0].addEventListener("click", function() {
          const vditorElement = document.getElementById(vditor.id);
          if (vditorElement.className.indexOf("vditor--fullscreen") > -1) {
              this.innerHTML = menuItem.icon || fullscreenSVG;
              vditorElement.className = vditorElement.className.replace(" vditor--fullscreen", "");
              Object.keys(vditor.toolbar.elements).forEach((key) => {
                  const svgElement  = vditor.toolbar.elements[key].firstChild as HTMLElement;
                  if (svgElement) {
                      svgElement.className = svgElement.className.replace("__s", "__n");
                  }
              });
          } else {
              this.innerHTML = menuItem.icon || contractSVG;
              vditorElement.className = vditorElement.className + " vditor--fullscreen";
              Object.keys(vditor.toolbar.elements).forEach((key) => {
                  const svgElement = vditor.toolbar.elements[key].firstChild as HTMLElement;
                  if (svgElement) {
                      svgElement.className = svgElement.className.replace("__n", "__s");
                  }
              });
          }
      });
  }
}

export class Headings extends MenuItem {
  public element: HTMLElement;

  constructor(vditor: IVditor, menuItem: IMenuItem) {
      super(vditor, menuItem);
      this.element.children[0].innerHTML = menuItem.icon || headingsSVG;

      const headingsPanelElement = document.createElement("div");
      headingsPanelElement.className = "vditor-panel";
      headingsPanelElement.innerHTML = `<h1 data-value="# ">Heading 1</h1>
<h2 data-value="## ">Heading 2</h2>
<h3 data-value="### ">Heading 3</h3>
<h4 data-value="#### ">Heading 4</h4>
<h5 data-value="##### ">Heading 5</h5>
<h6 data-value="###### ">Heading 6</h6>`;

      this.element.appendChild(headingsPanelElement);

      this._bindEvent(headingsPanelElement, vditor);
  }

  public _bindEvent(headingsPanelElement: HTMLElement, vditor: IVditor) {
      this.element.children[0].addEventListener("click", () => {
          if (headingsPanelElement.style.display === "block") {
              headingsPanelElement.style.display = "none";
          } else {
              headingsPanelElement.style.display = "block";
              if (vditor.toolbar.elements.emoji) {
                  const panel = vditor.toolbar.elements.emoji.children[1] as HTMLElement;
                  panel.style.display = "none";
              }
          }
          if (vditor.hint) {
              vditor.hint.element.style.display = "none";
          }
      });

      for (let i = 0; i < 6; i++) {
          headingsPanelElement.children.item(i).addEventListener("click", (event: Event) => {
              insertText(vditor, (event.target as HTMLElement).getAttribute("data-value"), "",
                  false, true);
              headingsPanelElement.style.display = "none";
          });
      }
  }
}

export class Help extends MenuItem {
  constructor(vditor: IVditor, menuItem: IMenuItem) {
      super(vditor, menuItem);
      this.element.children[0].innerHTML = menuItem.icon || helpSVG;
      this.bindEvent();
  }

  public bindEvent() {
      this.element.children[0].addEventListener("click", () => {
          window.open("https://hacpai.com/guide/markdown");
      });
  }
}


import { IACMEditor, IACMEOptions, IACMEMenuItem } from './ac-markdown-editor-interfaces';

export class ACMEditorOptions {
  public options: IACMEOptions;
  private defaultOptions: IACMEOptions = {
    cache: true,
    classes: {
      preview: '',
    },
    counter: 0,
    height: 'auto',
    hint: {
      delay: 200,
      emoji: {
        '+1': '👍',
        '-1': '👎',
        // tslint:disable-next-line:object-literal-key-quotes
        'cold_sweat': '😰',
        // tslint:disable-next-line:object-literal-key-quotes
        'heart': '❤️',
      },
    },
    keymap: {
      deleteLine: '⌘-Backspace',
      duplicate: '⌘-d',
    },
    lang: 'zh_CN',
    placeholder: '',
    preview: {
      delay: 1000,
      hljs: {
        enable: true,
        style: 'atom-one-light',
      },
      maxWidth: 768,
      mode: 'both',
    },
    resize: {
      enable: false,
      position: 'bottom',
    },
    toolbar: [{
      hotkey: '⌘-e',
      name: 'emoji',
      tipPosition: 'ne',
    }, {
      hotkey: '⌘-h',
      name: 'headings',
      tipPosition: 'ne',
    }, {
      hotkey: '⌘-b',
      name: 'bold',
      prefix: '**',
      suffix: '**',
      tipPosition: 'ne',
    }, {
      hotkey: '⌘-i',
      name: 'italic',
      prefix: '*',
      suffix: '*',
      tipPosition: 'ne',
    }, {
      hotkey: '⌘-s',
      name: 'strike',
      prefix: '~~',
      suffix: '~~',
      tipPosition: 'ne',
    }, {
      name: '|',
    }, {
      hotkey: '⌘-⇧-d',
      name: 'line',
      prefix: '---',
      tipPosition: 'n',
    }, {
      hotkey: '⌘-.',
      name: 'quote',
      prefix: '> ',
      tipPosition: 'n',
    }, {
      name: '|',
    }, {
      hotkey: '⌘-l',
      name: 'list',
      prefix: '* ',
      tipPosition: 'n',
    }, {
      hotkey: '⌘-o',
      name: 'ordered-list',
      prefix: '1. ',
      tipPosition: 'n',
    }, {
      hotkey: '⌘-j',
      name: 'check',
      prefix: '* [ ] ',
      tipPosition: 'n',
    }, {
      name: '|',
    }, {
      hotkey: '⌘-u',
      name: 'code',
      prefix: '```\n',
      suffix: '\n```',
      tipPosition: 'n',
    }, {
      hotkey: '⌘-g',
      name: 'inline-code',
      prefix: '`',
      suffix: '`',
      tipPosition: 'n',
    }, {
      name: '|',
    }, {
      hotkey: '⌘-z',
      name: 'undo',
      tipPosition: 'n',
    }, {
      hotkey: '⌘-y',
      name: 'redo',
      tipPosition: 'n',
    }, {
      name: '|',
    }, {
      name: 'upload',
      tipPosition: 'n',
    }, {
      hotkey: '⌘-k',
      name: 'link',
      prefix: '[',
      suffix: '](https://)',
      tipPosition: 'n',
    }, {
      hotkey: '⌘-m',
      name: 'table',
      prefix: '| col1',
      suffix: ' | col2 | col3 |\n| --- | --- | --- |\n|  |  |  |\n|  |  |  |',
      tipPosition: 'n',
    }, {
      name: 'record',
      tipPosition: 'n',
    }, {
      name: '|',
    }, {
      hotkey: '⌘-p',
      name: 'both',
      tipPosition: 'nw',
    }, {
      hotkey: '⌘-⇧-p',
      name: 'preview',
      tipPosition: 'nw',
    }, {
      hotkey: '⌘-⇧-f',
      name: 'format',
      tipPosition: 'nw',
    }, {
      name: '|',
    }, {
      hotkey: '⌘-\'',
      name: 'fullscreen',
      tipPosition: 'nw',
    }, {
      name: 'info',
      tipPosition: 'nw',
    }, {
      name: 'help',
      tipPosition: 'nw',
    }, {
      name: 'br',
    }],
    upload: {
      filename: (name: string) => name.replace(/\W/g, ''),
      linkToImgUrl: '',
      max: 10 * 1024 * 1024,
      url: '',
    },
    width: 'auto',
  };

  constructor(options: IACMEOptions) {
    this.options = options;
  }

  public merge(): IACMEOptions {
    const toolbar: IACMEMenuItem[] = [];
    if (this.options) {
      if (this.options.toolbar) {
        this.options.toolbar.forEach((menuItem: IACMEMenuItem) => {
          let currentMenuItem = menuItem;
          this.defaultOptions.toolbar.forEach((defaultMenuItem: IACMEMenuItem) => {
            if (typeof menuItem === 'string' && defaultMenuItem.name === menuItem) {
              currentMenuItem = defaultMenuItem;
            }
            if (typeof menuItem === 'object' && defaultMenuItem.name === menuItem.name) {
              currentMenuItem = Object.assign({}, defaultMenuItem, menuItem);
            }
          });
          toolbar.push(currentMenuItem);
        });
      }

      if (this.options.upload) {
        this.options.upload = Object.assign({}, this.defaultOptions.upload, this.options.upload);
      }

      if (this.options.classes) {
        this.options.classes = Object.assign({}, this.defaultOptions.classes, this.options.classes);
      }

      if (this.options.keymap) {
        this.options.keymap = Object.assign({}, this.defaultOptions.keymap, this.options.keymap);
      }

      if (this.options.preview) {
        if (this.options.preview.hljs) {
          this.options.preview.hljs =
            Object.assign({}, this.defaultOptions.preview.hljs, this.options.preview.hljs);
        } else {
          this.options.preview.hljs = Object.assign({}, this.defaultOptions.preview.hljs);
        }
        this.options.preview = Object.assign({}, this.defaultOptions.preview, this.options.preview);
      }

      if (this.options.hint) {
        this.options.hint = Object.assign({}, this.defaultOptions.hint, this.options.hint);
      }

      if (this.options.resize) {
        this.options.resize = Object.assign({}, this.defaultOptions.resize, this.options.resize);
      }
    }

    const mergedOptions = Object.assign({}, this.defaultOptions, this.options);

    if (toolbar.length > 0) {
      mergedOptions.toolbar = toolbar;
    }

    return mergedOptions;
  }
}

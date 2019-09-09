import { hasClass, addClass } from './markdown-editor-utility';

// Toolbar preset
export interface MarkdownEditorToolbarPreset {
  modeName: string;
  content: string[];
}

// Editor
export class MarkdownEditor {
  // public id: string;
  public title: string;
  public version: string;
  public classPrefix: string;
  public toolbarModes: MarkdownEditorToolbarPreset[];

  /// Options
  public mode: string;                  // gfm or markdown
  public name: string;                  // Form element name
  public value: string;                 // value for CodeMirror, if mode not gfm/markdown
  public theme: string;                 // theme, default empty
  public editorTheme: string;           // Editor theme
  public previewTheme: string;          // Preview area theme, default empty
  public markdown: string;              // Markdown source code
  public appendMarkdown: string;        // if in init textarea value not empty, append markdown to textarea
  public width: string;                 // Width
  public height: string;                // Height
  public path: string;                  // Dependents module file directory
  public pluginPath: string;            // If this empty, default use this.path + '../plugins/'
  public delay: number;                 // Delay parse markdown to html, Uint : ms
  public autoLoadModules: boolean;      // Automatic load dependent module files
  public watch: boolean;                // Watch
  public placeholder: string;           // Place holder
  public gotoLine: boolean;             // Goto line
  public codeFold: boolean;             // Fold the code
  public autoHeight: boolean;           // Automatic calculate the height
  public autoFocus: boolean;            // Auto set the focus
  public autoCloseTags: boolean;        // Auto close the tags
  public searchReplace: boolean;        // Search/Replace
  public syncScrolling: boolean;        // true | false | 'single', default true
  public readOnly: boolean;             // read only
  public tabSize: number;               // Tab size
  public indentUnit: number;            // Indent unit
  public lineNumbers: boolean;          // Show line number or not
  public lineWrapping: boolean;         // Wrap the line or not
  public autoCloseBrackets: boolean;    // Automatic close brackets
  public showTrailingSpace: boolean;    // Show tailing space
  public matchBrackets: boolean;        // Match brackets
  public indentWithTabs: boolean;       // Indent with tabs
  public styleSelectedText: boolean;    // Stylize the selected text
  public matchWordHighlight: boolean;   // Match word highlight: options: true, false, 'onselected'
  public styleActiveLine: boolean;      // Highlight the current line
  public dialogLockScreen: boolean;     // Dialog for lock screen
  public dialogShowMask: boolean;       // Dialog for show mask
  public dialogDraggable: boolean;      // Dialog for draggable
  public dialogMaskBgColor: string;     // Mask dialog background color
  public dialogMaskOpacity: number;     // Mask dialog opacity
  public fontSize: string;              // Font size
  public saveHTMLToTextarea: boolean;   // Save html to text area
  public disabledKeyMaps: any[] = [];   // Disabled key maps
  public imageUpload: boolean;          // Image upload
  public imageFormats: string[];        // Supported image formats
  public imageUploadURL: string;        // Image upload URL
  public crossDomainUpload: boolean;    // CORS for image upload
  public uploadCallbackURL: string;     // Callback URL for upload
  public toc: boolean;                  // Table of contents
  public tocm: boolean;                 // Using [TOCM], auto create ToC dropdown menu
  public tocTitle: string;              // for ToC dropdown menu btn
  public tocDropdown: boolean;          // TOC dropdown
  public tocContainer: string;          // TOC container
  public tocStartLevel: number;         // Said from H1 to create ToC
  public htmlDecode: boolean;           // Open the HTML tag identification
  public pageBreak: boolean;            // Enable parse page break [========]
  public atLink: boolean;               // for @link
  public emailLink: boolean;            // for email address auto link
  public taskList: boolean;             // Enable Github Flavored Markdown task lists
  public emoji: boolean;                // :emoji: , Support Github emoji, Twitter Emoji (Twemoji);
                                        // Support FontAwesome icon emoji :fa-xxx: > Using fontAwesome icon web fonts;
  public tex: boolean;                  // TeX(LaTeX), based on KaTeX
  public flowChart: boolean;            // flowChart.js only support IE9+
  public sequenceDiagram: false;        // sequenceDiagram.js only support IE9+
  public previewCodeHighlight: boolean; // Preview code highlight
  public toolbar: boolean;              // show/hide toolbar
  public toolbarAutoFixed: boolean;     // on window scroll auto fixed position
  public toolbarIcons: string;          // Toolbar icons
  public toolbarTitles: any = {};
  public toolbarHandlers: any = {
    ucwords: () => {},
    lowercase: () => {},
  };
  public toolbarCustomIcons: any = {               // using html tag create toolbar icon, unused default <a> tag.
    lowercase: '<a href=\'javascript:;\' title=\'Lowercase\' unselectable=\'on\'><i class=\'fa\' name=\'lowercase\' style=\'font-size:24px;margin-top: -10px;\'>a</i></a>',
    'ucwords': '<a href=\'javascript:;\' title=\'ucwords\' unselectable=\'on\'><i class=\'fa\' name=\'ucwords\' style=\'font-size:20px;margin-top: -3px;\'>Aa</i></a>'
  };
  public toolbarIconsClass: any = {
    undo             : 'fa-undo',
    redo             : 'fa-repeat',
    bold             : 'fa-bold',
    del              : 'fa-strikethrough',
    italic           : 'fa-italic',
    quote            : 'fa-quote-left',
    uppercase        : 'fa-font',
    h1               : this.classPrefix + 'bold',
    h2               : this.classPrefix + 'bold',
    h3               : this.classPrefix + 'bold',
    h4               : this.classPrefix + 'bold',
    h5               : this.classPrefix + 'bold',
    h6               : this.classPrefix + 'bold',
    'list-ul'        : 'fa-list-ul',
    'list-ol'        : 'fa-list-ol',
    hr               : 'fa-minus',
    link             : 'fa-link',
    'reference-link' : 'fa-anchor',
    image            : 'fa-picture-o',
    code             : 'fa-code',
    'preformatted-text' : 'fa-file-code-o',
    'code-block'     : 'fa-file-code-o',
    table            : 'fa-table',
    datetime         : 'fa-clock-o',
    emoji            : 'fa-smile-o',
    'html-entities'  : 'fa-copyright',
    pagebreak        : 'fa-newspaper-o',
    'goto-line'      : 'fa-terminal', // fa-crosshairs
    watch            : 'fa-eye-slash',
    unwatch          : 'fa-eye',
    preview          : 'fa-desktop',
    search           : 'fa-search',
    fullscreen       : 'fa-arrows-alt',
    clear            : 'fa-eraser',
    help             : 'fa-question-circle',
    info             : 'fa-info-circle'
  };
  public toolbarIconTexts: any = {};

  public onload: () => {};
  public onsize: () => {};
  public onchange: () => {};
  public onwatch: () => {};
  public onunwatch: () => {};
  public onpreviewing: () => {};
  public onpreviewed: () => {};
  public onfullscreen: () => {};
  public onfullscreenExit: () => {};
  public onscroll: () => {};
  public onpreviewscroll: () => {};

  public dialogZindex = 99999;
  public $katex: any    = null;
  public $marked: any   = null;
  public $CodeMirror: any  = null;
  public $prettyPrint: any = null;
  public classNames: any  = {
    tex : this.classPrefix + 'tex'
  };
  public state: any = {};

  constructor() {
    this.title = 'Markdown Editor';
    this.version = '0.1.0';
    this.classPrefix = 'editormd-';

    this.toolbarModes = [
      {
        modeName: 'full',
        content: [
          'undo', 'redo', '|',
          'bold', 'del', 'italic', 'quote', 'ucwords', 'uppercase', 'lowercase', '|',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', '|',
          'list-ul', 'list-ol', 'hr', '|',
          'link', 'reference-link', 'image', 'code', 'preformatted-text', 'code-block', 'table', 'datetime', 'emoji', 'html-entities', 'pagebreak', '|',
          'goto-line', 'watch', 'preview', 'fullscreen', 'clear', 'search', '|',
          'help', 'info'
        ],
      }, {
        modeName: 'simple',
        content: [
          'undo', 'redo', '|',
          'bold', 'del', 'italic', 'quote', 'uppercase', 'lowercase', '|',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', '|',
          'list-ul', 'list-ol', 'hr', '|',
          'watch', 'preview', 'fullscreen', '|',
          'help', 'info'
        ],
      }, {
        modeName: 'mini',
        content: [
          'undo', 'redo', '|',
          'watch', 'preview', '|',
          'help', 'info'
        ]
      },
    ];

    /// Options
    this.mode = 'gfm';  // gfm or markdown
    this.name = '';
    this.value = '';
    this.theme = '';
    this.editorTheme = 'default';
    this.previewTheme = '';
    this.markdown = '';
    this.appendMarkdown = '';
    this.width = '100%';
    this.height = '100%';
    this.path = './lib/';
    this.pluginPath = '';
    this.delay = 300;
    this.autoLoadModules = true;
    this.watch = true;
    this.placeholder = 'Markdown editor, by Alva Chien';
    this.gotoLine = true;
    this.codeFold = false;
    this.autoHeight = false;
    this.autoFocus = true;
    this.autoCloseTags = true;
    this.searchReplace = true;
    this.syncScrolling = true;
    this.readOnly = false;
    this.tabSize = 4;
    this.indentUnit = 4;
    this.lineNumbers = true;
    this.lineWrapping = true;
    this.autoCloseBrackets = true;
    this.showTrailingSpace = true;
    this.matchBrackets = true;
    this.indentWithTabs = true;
    this.styleSelectedText = true;
    this.matchWordHighlight = true;
    this.styleActiveLine = true;
    this.dialogLockScreen = true;
    this.dialogShowMask = true;
    this.dialogDraggable = true;
    this.dialogMaskBgColor = '#fff';
    this.dialogMaskOpacity = 0.1;
    this.fontSize = '13px';
    this.saveHTMLToTextarea = false;
    this.imageUpload = false;
    this.imageFormats = ['jpg', 'jpeg', 'gif', 'png', 'bmp', 'webp'];
    this.imageUploadURL = '';
    this.crossDomainUpload = false;
    this.uploadCallbackURL = '';
    this.toc = true;
    this.tocm = false;
    this.tocTitle = '';
    this.tocDropdown = false;
    this.tocContainer = '';
    this.tocStartLevel = 1;
    this.htmlDecode = false;
    this.pageBreak = true;
    this.atLink = true;
    this.emailLink = true;
    this.taskList = false;
    this.emoji = false;
    this.tex = false;
    this.flowChart = false;
    this.sequenceDiagram = false;
    this.previewCodeHighlight = true;
    this.toolbar = true;
    this.toolbarAutoFixed = true;
    this.toolbarIcons = 'full';

    this.state = {
      watching   : false,
      loaded     : false,
      preview    : false,
      fullscreen : false
    };
  }

  // Initialize the editor
  init(id: string) {
    this.classNames = {
      tex : this.classPrefix + 'tex',
      textarea : {
        html     : this.classPrefix + 'html-textarea',
        markdown : this.classPrefix + 'markdown-textarea',
      }
    };

    const editor: HTMLElement = document.getElementById(id);
    const pluginPath: string = (this.pluginPath === '') ? this.path + '../plugins/' : this.pluginPath;
    this.state.watching = (this.watch) ? true : false;

    if (!hasClass(editor, 'editormd')) {
      addClass(editor, 'editormd');
    }

    editor.style.width = (typeof this.width  === 'number') ? this.width  + 'px' : this.width;
    editor.style.height = (typeof this.height  === 'number') ? this.height  + 'px' : this.height;
    if (this.autoHeight) {
      editor.style.height = 'auto';
    }

    let markdownTextarea: HTMLTextAreaElement;
    if (editor.hasChildNodes) {
      markdownTextarea = editor.querySelector('textarea');
    }
    if (!markdownTextarea) {
      markdownTextarea = document.createElement('textarea');
      editor.appendChild(markdownTextarea);
    }

    addClass(markdownTextarea, this.classNames.textarea.markdown);
    if (this.placeholder) {
      markdownTextarea.setAttribute('placeholder', this.placeholder);
    }
    if (!markdownTextarea.getAttribute('name')) {
      markdownTextarea.setAttribute('name', (this.name !== '') ? this.name : (id + '-markdown-doc'));
    }

    if (this.readOnly) {
      const closeButton = document.createElement('a');
      closeButton.setAttribute('href', 'javascript:;');
      addClass(closeButton, 'fa fa-close' + this.classPrefix + 'preview-close-btn');
      editor.appendChild(closeButton);
    }
    if (this.saveHTMLToTextarea) {
      const sht = document.createElement('textarea');
      addClass(sht, this.classNames.textarea.html);
      sht.setAttribute('name', id + '-html-code');
      editor.appendChild(sht);
    }
    let nelem = document.createElement('div');
    addClass(nelem, this.classPrefix + 'preview');
    const contelem = document.createElement('div');
    addClass(contelem, this.classPrefix + 'preview-container');
    nelem.appendChild(contelem);
    editor.appendChild(nelem);
    nelem = document.createElement('div');
    addClass(nelem, this.classPrefix + 'container-mask');
    nelem.style.display = 'block';
    editor.appendChild(nelem);
    nelem = document.createElement('div');
    addClass(nelem, this.classPrefix + 'mask');
    editor.appendChild(nelem);

    addClass(editor, this.classPrefix + 'vertical');

    // TBD
    // if (settings.theme !== "")
    // {
    //     editor.addClass(classPrefix + "theme-" + settings.theme);
    // }

    this.mask          = editor.children("." + classPrefix + "mask");    
    this.containerMask = editor.children("." + classPrefix  + "container-mask");

    // TBD
    // if (settings.markdown !== "")
    // {
    //   markdownTextarea.val(settings.markdown);
    // }
    // if (settings.appendMarkdown !== "")
    // {
    //     markdownTextarea.val(markdownTextarea.val() + settings.appendMarkdown);
    // }

  this.htmlTextarea     = editor.children("." + classNames.textarea.html);            
  this.preview          = editor.children("." + classPrefix + "preview");
  this.previewContainer = this.preview.children("." + classPrefix + "preview-container");
  
  if (settings.previewTheme !== "") 
  {
      this.preview.addClass(classPrefix + "preview-theme-" + settings.previewTheme);
  }
  
  if (typeof define === "function" && define.amd)
  {
      if (typeof katex !== "undefined") 
      {
          editormd.$katex = katex;
      }
      
      if (settings.searchReplace && !settings.readOnly) 
      {
          editormd.loadCSS(settings.path + "codemirror/addon/dialog/dialog");
          editormd.loadCSS(settings.path + "codemirror/addon/search/matchesonscrollbar");
      }
  }
  
  if ((typeof define === "function" && define.amd) || !settings.autoLoadModules)
  {
      if (typeof CodeMirror !== "undefined") {
          editormd.$CodeMirror = CodeMirror;
      }
      
      if (typeof marked     !== "undefined") {
          editormd.$marked     = marked;
      }
      
      this.setCodeMirror().setToolbar().loadedDisplay();
  } 
  else 
  {
      this.loadQueues();
  }

  return this;    
  }
}


// Toolbar preset
export interface MarkdownEditorToolbarPreset {
  modeName: string;
  content: string[];
}

// Editor
export class MarkdownEditor {
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

  public default: any = {
    imageUpload          : false,
    imageFormats         : ['jpg', 'jpeg', 'gif', 'png', 'bmp', 'webp'],
    imageUploadURL       : '',
    crossDomainUpload    : false,
    uploadCallbackURL    : '',

    toc                  : true,           // Table of contents
    tocm                 : false,           // Using [TOCM], auto create ToC dropdown menu
    tocTitle             : '',             // for ToC dropdown menu btn
    tocDropdown          : false,
    tocContainer         : '',
    tocStartLevel        : 1,              // Said from H1 to create ToC
    htmlDecode           : false,          // Open the HTML tag identification
    pageBreak            : true,           // Enable parse page break [========]
    atLink               : true,           // for @link
    emailLink            : true,           // for email address auto link
    taskList             : false,          // Enable Github Flavored Markdown task lists
    emoji                : false,          // :emoji: , Support Github emoji, Twitter Emoji (Twemoji);
                                           // Support FontAwesome icon emoji :fa-xxx: > Using fontAwesome icon web fonts;
                                           // Support Editor.md logo icon emoji :editormd-logo: :editormd-logo-1x: > 1~8x;
    tex                  : false,          // TeX(LaTeX), based on KaTeX
    flowChart            : false,          // flowChart.js only support IE9+
    sequenceDiagram      : false,          // sequenceDiagram.js only support IE9+
    previewCodeHighlight : true,

    toolbar              : true,           // show/hide toolbar
    toolbarAutoFixed     : true,           // on window scroll auto fixed position
    toolbarIcons         : 'full',
    toolbarTitles        : {},
    toolbarHandlers      : {
      ucwords : function() {
        return this.toolbarHandlers.ucwords;
      },
      lowercase : function() {
        return this.toolbarHandlers.lowercase;
      }
    },
    toolbarCustomIcons   : {               // using html tag create toolbar icon, unused default <a> tag.
        lowercase        : '<a href=\'javascript:;\' title=\'Lowercase\' unselectable=\'on\'><i class=\'fa\' name=\'lowercase\' style=\'font-size:24px;margin-top: -10px;\'>a</i></a>',
        'ucwords'        : '<a href=\'javascript:;\' title=\'ucwords\' unselectable=\'on\'><i class=\'fa\' name=\'ucwords\' style=\'font-size:20px;margin-top: -3px;\'>Aa</i></a>'
    },
    toolbarIconsClass    : {
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
    },
    toolbarIconTexts     : {},

    lang : {
        name        : 'zh-cn',
        description : '开源在线Markdown编辑器<br/>Open source online Markdown editor.',
        tocTitle    : '目录',
        toolbar     : {
            undo             : '撤销（Ctrl+Z）',
            redo             : '重做（Ctrl+Y）',
            bold             : '粗体',
            del              : '删除线',
            italic           : '斜体',
            quote            : '引用',
            ucwords          : '将每个单词首字母转成大写',
            uppercase        : '将所选转换成大写',
            lowercase        : '将所选转换成小写',
            h1               : '标题1',
            h2               : '标题2',
            h3               : '标题3',
            h4               : '标题4',
            h5               : '标题5',
            h6               : '标题6',
            'list-ul'        : '无序列表',
            'list-ol'        : '有序列表',
            hr               : '横线',
            link             : '链接',
            'reference-link' : '引用链接',
            image            : '添加图片',
            code             : '行内代码',
            'preformatted-text' : '预格式文本 / 代码块（缩进风格）',
            'code-block'     : '代码块（多语言风格）',
            table            : '添加表格',
            datetime         : '日期时间',
            emoji            : 'Emoji表情',
            'html-entities'  : 'HTML实体字符',
            pagebreak        : '插入分页符',
            'goto-line'      : '跳转到行',
            watch            : '关闭实时预览',
            unwatch          : '开启实时预览',
            preview          : '全窗口预览HTML（按 Shift + ESC还原）',
            fullscreen       : '全屏（按ESC还原）',
            clear            : '清空',
            search           : '搜索',
            help             : '使用帮助',
            info             : '关于' + this.title
        },
        buttons : {
            enter  : '确定',
            cancel : '取消',
            close  : '关闭'
        },
        dialog : {
            link : {
                title    : '添加链接',
                url      : '链接地址',
                urlTitle : '链接标题',
                urlEmpty : '错误：请填写链接地址。'
            },
            referenceLink : {
                title    : '添加引用链接',
                name     : '引用名称',
                url      : '链接地址',
                urlId    : '链接ID',
                urlTitle : '链接标题',
                nameEmpty: '错误：引用链接的名称不能为空。',
                idEmpty  : '错误：请填写引用链接的ID。',
                urlEmpty : '错误：请填写引用链接的URL地址。'
            },
            image : {
                title    : '添加图片',
                url      : '图片地址',
                link     : '图片链接',
                alt      : '图片描述',
                uploadButton     : '本地上传',
                imageURLEmpty    : '错误：图片地址不能为空。',
                uploadFileEmpty  : '错误：上传的图片不能为空。',
                formatNotAllowed : '错误：只允许上传图片文件，允许上传的图片文件格式有：'
            },
            preformattedText : {
                title             : '添加预格式文本或代码块',
                emptyAlert        : '错误：请填写预格式文本或代码的内容。'
            },
            codeBlock : {
                title             : '添加代码块',
                selectLabel       : '代码语言：',
                selectDefaultText : '请选择代码语言',
                otherLanguage     : '其他语言',
                unselectedLanguageAlert : '错误：请选择代码所属的语言类型。',
                codeEmptyAlert    : '错误：请填写代码内容。'
            },
            htmlEntities : {
                title : 'HTML 实体字符'
            },
            help : {
                title : '使用帮助'
            }
        }
    }
  };

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
  }

  init() {
    // Perform the init
  }
}

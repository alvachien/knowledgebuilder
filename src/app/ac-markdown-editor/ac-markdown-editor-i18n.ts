import { IACMEditor, IACMEI18n } from './ac-markdown-editor-interfaces';

export const i18n: IACMEI18n = {
  en_US: {
    // tslint:disable-next-line:object-literal-key-quotes
    'bold': 'Blod',
    // tslint:disable-next-line:object-literal-key-quotes
    'both': 'editor & preview',
    // tslint:disable-next-line:object-literal-key-quotes
    'check': 'Task List',
    // tslint:disable-next-line:object-literal-key-quotes
    'code': 'Code Block',
    // tslint:disable-next-line:object-literal-key-quotes
    'copied': 'Copied',
    // tslint:disable-next-line:object-literal-key-quotes
    'copy': 'Copy',
    // tslint:disable-next-line:object-literal-key-quotes
    'emoji': 'Emoji',
    // tslint:disable-next-line:object-literal-key-quotes
    'fileTypeError': 'file type is error',
    // tslint:disable-next-line:object-literal-key-quotes
    'format': 'Format',
    // tslint:disable-next-line:object-literal-key-quotes
    'fullscreen': 'Fullscreen',
    // tslint:disable-next-line:object-literal-key-quotes
    'headings': 'Headings',
    // tslint:disable-next-line:object-literal-key-quotes
    'help': 'Help',
    // tslint:disable-next-line:object-literal-key-quotes
    'info': 'Info',
    // tslint:disable-next-line:object-literal-key-quotes
    'inline-code': 'Inline Code',
    // tslint:disable-next-line:object-literal-key-quotes
    'italic': 'Italic',
    // tslint:disable-next-line:object-literal-key-quotes
    'line': 'Line',
    // tslint:disable-next-line:object-literal-key-quotes
    'link': 'Link',
    // tslint:disable-next-line:object-literal-key-quotes
    'list': 'List',
    // tslint:disable-next-line:object-literal-key-quotes
    'nameEmpty': 'Name is empty',
    // tslint:disable-next-line:object-literal-key-quotes
    'ordered-list': 'Order List',
    // tslint:disable-next-line:object-literal-key-quotes
    'over': 'over',
    // tslint:disable-next-line:object-literal-key-quotes
    'performanceTip': 'Real-time preview requires ${x}ms, you can close it',
    // tslint:disable-next-line:object-literal-key-quotes
    'preview': 'Preview',
    // tslint:disable-next-line:object-literal-key-quotes
    'quote': 'Quote',
    // tslint:disable-next-line:object-literal-key-quotes
    'record': 'Start Record/End Record',
    // tslint:disable-next-line:object-literal-key-quotes
    'record-tip': 'The device does not support recording',
    // tslint:disable-next-line:object-literal-key-quotes
    'recording': 'recording...',
    // tslint:disable-next-line:object-literal-key-quotes
    'redo': 'Redo',
    // tslint:disable-next-line:object-literal-key-quotes
    'strike': 'Strike',
    // tslint:disable-next-line:object-literal-key-quotes
    'table': 'Table',
    // tslint:disable-next-line:object-literal-key-quotes
    'undo': 'Undo',
    // tslint:disable-next-line:object-literal-key-quotes
    'upload': 'Upload image or file',
    // tslint:disable-next-line:object-literal-key-quotes
    'uploading': 'uploading...',
  },
  zh_CN: {
    // tslint:disable-next-line:object-literal-key-quotes
    'bold': '粗体',
    // tslint:disable-next-line:object-literal-key-quotes
    'both': '编辑 & 预览',
    // tslint:disable-next-line:object-literal-key-quotes
    'check': '任务列表',
    // tslint:disable-next-line:object-literal-key-quotes
    'code': '代码块',
    // tslint:disable-next-line:object-literal-key-quotes
    'copied': '已复制',
    // tslint:disable-next-line:object-literal-key-quotes
    'copy': '复制',
    // tslint:disable-next-line:object-literal-key-quotes
    'emoji': '表情',
    // tslint:disable-next-line:object-literal-key-quotes
    'fileTypeError': '文件类型不允许上传',
    // tslint:disable-next-line:object-literal-key-quotes
    'format': '格式化',
    // tslint:disable-next-line:object-literal-key-quotes
    'fullscreen': '全屏',
    // tslint:disable-next-line:object-literal-key-quotes
    'headings': '标题',
    // tslint:disable-next-line:object-literal-key-quotes
    'help': '帮助',
    // tslint:disable-next-line:object-literal-key-quotes
    'info': '关于',
    // tslint:disable-next-line:object-literal-key-quotes
    'inline-code': '行内代码',
    // tslint:disable-next-line:object-literal-key-quotes
    'italic': '斜体',
    // tslint:disable-next-line:object-literal-key-quotes
    'line': '分隔线',
    // tslint:disable-next-line:object-literal-key-quotes
    'link': '链接',
    // tslint:disable-next-line:object-literal-key-quotes
    'list': '无序列表',
    // tslint:disable-next-line:object-literal-key-quotes
    'nameEmpty': '文件名不能为空',
    // tslint:disable-next-line:object-literal-key-quotes
    'ordered-list': '有序列表',
    // tslint:disable-next-line:object-literal-key-quotes
    'over': '超过',
    // tslint:disable-next-line:object-literal-key-quotes
    'performanceTip': '实时预览需 ${x}ms，可点击编辑 & 预览按钮进行关闭',
    // tslint:disable-next-line:object-literal-key-quotes
    'preview': '预览',
    // tslint:disable-next-line:object-literal-key-quotes
    'quote': '引用',
    // tslint:disable-next-line:object-literal-key-quotes
    'record': '开始录音/结束录音',
    // tslint:disable-next-line:object-literal-key-quotes
    'record-tip': '该设备不支持录音功能',
    // tslint:disable-next-line:object-literal-key-quotes
    'recording': '录音中...',
    // tslint:disable-next-line:object-literal-key-quotes
    'redo': '重做',
    // tslint:disable-next-line:object-literal-key-quotes
    'strike': '删除线',
    // tslint:disable-next-line:object-literal-key-quotes
    'table': '表格',
    // tslint:disable-next-line:object-literal-key-quotes
    'undo': '撤销',
    // tslint:disable-next-line:object-literal-key-quotes
    'upload': '上传图片或文件',
    // tslint:disable-next-line:object-literal-key-quotes
    'uploading': '上传中...',
  },
};

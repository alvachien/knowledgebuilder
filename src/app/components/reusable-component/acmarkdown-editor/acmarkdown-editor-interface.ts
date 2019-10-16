import { MarkedOptions } from 'marked';

export interface IACMarkdownEditorTurndown {
  addRule(key: string, rule: IACMarkdownEditorTurndownRule): IACMarkdownEditorTurndown;
}

export interface IACMarkdownEditorTurndownRule {
  filter: string | string[] | ((node: HTMLInputElement) => boolean);

  replacement(content: string, node?: HTMLElement): string;
}

export interface IACMarkdownEditorHTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

export interface IACMarkdownEditorI18nLang {
  en_US: string;
  zh_CN: string;
}

export interface IACMarkdownEditorI18n {
  en_US: { [key: string]: string };
  zh_CN: { [key: string]: string };
}

export interface IACMarkdownEditorClasses {
  preview?: string;
}

export interface IACMarkdownEditorUpload {
  url?: string;
  max?: number;
  linkToImgUrl?: string;
  token?: string;
  accept?: string;

  success?(editor: HTMLPreElement, msg: string): void;

  error?(msg: string): void;

  filename?(name: string): string;

  validate?(files: File[]): string | boolean;

  handler?(files: File[]): string | null;
}

export interface IACMarkdownEditorToolbarItem {
  name: string;
  icon?: string;
  tip?: string;
  hotkey?: string;
  suffix?: string;
  prefix?: string;
  tipPosition?: string;

  click?(): void;
}

export interface IACMarkdownEditorPreview {
  delay?: number;
  maxWidth?: number;
  mode?: string; // 'both' | 'preview' | 'editor'
  hljs?: {
    style?: string,
    enable?: boolean,
  };

  parse?(element: HTMLElement): void;
}

export interface IACMarkdownEditorHintData {
  html: string;
  value: string;
}

export interface IACMarkdownEditorHint {
  emojiTail?: string;
  delay?: number;
  emoji?: { [key: string]: string };
  emojiPath?: string;

  at?(value: string): IACMarkdownEditorHintData[];
}

export interface IACMarkdownEditorResize {
  position?: string;
  enable?: boolean;

  after?(height: number): void;
}

export interface IACMarkdownEditorPreviewOptions {
  hljsStyle?: string;
  enableHighlight?: boolean;
  customEmoji?: { [key: string]: string };
  lang?: (keyof IACMarkdownEditorI18nLang);
}

export interface IACMarkdownEditorOptions {
  typewriterMode?: boolean;
  keymap?: { [key: string]: string };
  height?: number | string;
  width?: number | string;
  placeholder?: string;
  lang?: (keyof IACMarkdownEditorI18nLang);
  toolbar?: Array<string | IACMarkdownEditorToolbarItem>;
  resize?: IACMarkdownEditorResize;
  counter?: number;
  cache?: boolean;
  mode?: 'wysiwyg-show' | 'markdown-show' | 'wysiwyg-only' | 'markdown-only';
  preview?: IACMarkdownEditorPreview;
  hint?: IACMarkdownEditorHint;
  upload?: IACMarkdownEditorUpload;
  classes?: IACMarkdownEditorClasses;
  markedOption?: MarkedOptions;

  tab?: string;

  input?(value: string, previewElement?: HTMLElement): void;

  focus?(value: string): void;

  blur?(value: string): void;

  esc?(value: string): void;

  ctrlEnter?(value: string): void;

  select?(value: string): void;
}

export interface IACMarkdownEditor {
  id: string;
  rootElement: HTMLElement;
  options: IACMarkdownEditorOptions;
  originalInnerHTML: string;
  // markdownIt?: markdownit;
  currentMode: 'markdown' | 'wysiwyg';
  currentPreviewMode?: string;
  toolbar?: {
    elements?: { [key: string]: HTMLElement },
  };
  preview?: {
    element: HTMLElement
    render(vditor: IACMarkdownEditor, value?: string): void,
  };
  editor?: {
    element: HTMLPreElement,
    range: Range,
  };
  counter?: {
    element: HTMLElement
    render(length: number, counter: number): void,
  };
  resize?: {
    element: HTMLElement,
  };
  hint?: {
    timeId: number
    element: HTMLUListElement
    fillEmoji(element: HTMLElement, vditor: IACMarkdownEditor): void
    render(vditor: IACMarkdownEditor): void,
  };
  tip: {
    element: HTMLElement
    show(text: string, time?: number): void
    hide(): void,
  };
  upload?: {
    element: HTMLElement
    isUploading: boolean,
  };
  undo: {
    redo(vditor: IACMarkdownEditor): void
    undo(vditor: IACMarkdownEditor): void
    addToUndoStack(vditor: IACMarkdownEditor): void,
    recordFirstPosition(vditor: IACMarkdownEditor): void,
  };
  wysiwyg?: {
    element: HTMLElement,
    setExpand(): void,
  };
}

import { IACMarkdownEditor } from './acmarkdown-editor-interface';
import { getText } from './acmarkdown-editor-util';
import { md2html2, mathRender, mermaidRender, codeRender, chartRender, abcRender,
  highlightRender, mediaRender } from './acmarkdown-editor-render';
import { i18n } from './acmarkdown-editor-constant';

export class ACMarkdownEditorPreview {
  public element: HTMLElement;

  constructor(vditor: IACMarkdownEditor) {
    this.element = document.createElement('div');
    this.element.className = `vditor-preview vditor-preview--${vditor.options.preview.mode}`;
    const previewElement = document.createElement('div');
    previewElement.className = vditor.options.classes.preview ? vditor.options.classes.preview : 'vditor-reset';
    previewElement.style.maxWidth = vditor.options.preview.maxWidth + 'px';
    this.element.appendChild(previewElement);
    this.render(vditor);
  }

  public render(vditor: IACMarkdownEditor, value?: string) {
    if (this.element.className === 'vditor-preview vditor-preview--editor') {
      if (this.element.getAttribute('data-type') === 'renderPerformance') {
        vditor.tip.hide();
      }
      return;
    }

    if (value) {
      this.element.children[0].innerHTML = value;
      return;
    }

    if (getText(vditor.editor.element).replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '') === '') {
      this.element.children[0].innerHTML = '';
      return;
    }

    // clearTimeout(this.mdTimeoutId);
    const renderStartTime = new Date().getTime();
    const markdownText = getText(vditor.editor.element);

    const html = md2html2(vditor, markdownText);
    this.element.children[0].innerHTML = html;
    this.afterRender(vditor, renderStartTime);
  }

  private afterRender(vditor: IACMarkdownEditor, startTime: number) {
    if (vditor.options.preview.parse) {
      vditor.options.preview.parse(this.element);
    }

    codeRender(vditor.preview.element.children[0] as HTMLElement, vditor.options.lang);
    highlightRender(vditor.options.preview.hljs.style, vditor.options.preview.hljs.enable,
        vditor.preview.element.children[0] as HTMLElement);
    mathRender(vditor.preview.element.children[0] as HTMLElement);
    mermaidRender(vditor.preview.element.children[0] as HTMLElement);
    chartRender(vditor.preview.element.children[0] as HTMLElement);
    abcRender(vditor.preview.element.children[0] as HTMLElement);
    mediaRender(vditor.preview.element.children[0] as HTMLElement);
  }
}

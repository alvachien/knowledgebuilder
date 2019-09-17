import { getText } from './ac-markdown-editor-util';
import { i18n } from './ac-markdown-editor-i18n';
import { abcRender, chartRender, codeRender, highlightRender, mathRender, md2htmlByEditor, mediaRender, mermaidRender } from './ac-markdown-editor-render';
import { IACMEditor } from './ac-markdown-editor-interfaces';
import { classPrefix } from './ac-markdown-editor-constants';

// Preview
export class ACMEditorPreview {
  public element: HTMLElement;
  private mdTimeoutId: number;

  constructor(editor: IACMEditor) {
    this.element = document.createElement('div');
    this.element.className = `${classPrefix}-preview ${classPrefix}-preview--${editor.options.preview.mode}`;
    const previewElement = document.createElement('div');
    previewElement.className = editor.options.classes.preview ? editor.options.classes.preview : classPrefix + '-reset';
    previewElement.style.maxWidth = editor.options.preview.maxWidth + 'px';
    this.element.appendChild(previewElement);
    this.render(editor);
  }

  public async render(editor: IACMEditor, value?: string) {
    if (this.element.className === `${classPrefix}-preview ${classPrefix}-preview--editor`) {
      if (this.element.getAttribute('data-type') === 'renderPerformance') {
        editor.tip.hide();
      }
      return;
    }

    if (value) {
      this.element.children[0].innerHTML = value;
      return;
    }

    if (getText(editor.editor.element).replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '') === '') {
      this.element.children[0].innerHTML = '';
      return;
    }

    clearTimeout(this.mdTimeoutId);
    const renderStartTime = new Date().getTime();
    if (editor.options.preview.url) {
      this.mdTimeoutId = window.setTimeout(async () => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', editor.options.preview.url);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
              const responseJSON = JSON.parse(xhr.responseText);
              if (responseJSON.code !== 0) {
                alert(responseJSON.msg);
                return;
              }
              this.element.children[0].innerHTML = responseJSON.data;
              this.afterRender(editor, renderStartTime);
            }
          }
        };

        xhr.send(JSON.stringify({
          markdownText: getText(editor.editor.element),
        }));
      }, editor.options.preview.delay);
    } else {
      const html = await md2htmlByEditor(getText(editor.editor.element), editor);
      this.element.children[0].innerHTML = html;
      this.afterRender(editor, renderStartTime);
    }
  }

  private afterRender(editor: IACMEditor, startTime: number) {
    if (editor.options.preview.parse) {
      editor.options.preview.parse(this.element);
    }
    const time = (new Date().getTime() - startTime);
    if ((new Date().getTime() - startTime) > 2000) {
      editor.tip.show(i18n[editor.options.lang].performanceTip.replace('${x}',
        time.toString()));
      editor.preview.element.setAttribute('data-type', 'renderPerformance');
    } else if (editor.preview.element.getAttribute('data-type') === 'renderPerformance') {
      editor.tip.hide();
      editor.preview.element.removeAttribute('data-type');
    }
    codeRender(editor.preview.element.children[0] as HTMLElement, editor.options.lang);
    highlightRender(editor.options.preview.hljs.style, editor.options.preview.hljs.enable,
      editor.preview.element.children[0] as HTMLElement);
    mathRender(editor.preview.element.children[0] as HTMLElement, editor.options.lang);
    mermaidRender(editor.preview.element.children[0] as HTMLElement);
    chartRender(editor.preview.element.children[0] as HTMLElement);
    abcRender(editor.preview.element.children[0] as HTMLElement);
    mediaRender(editor.preview.element.children[0] as HTMLElement);
  }
}

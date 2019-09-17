import { code160to32, addStyle } from './ac-markdown-editor-util';
import { i18n } from './ac-markdown-editor-i18n';
// import copySVG from '../../assets/icons/copy.svg';
import { IACMEditor, IACMEI18nLang, IACMEPreviewOptions, ILute } from './ac-markdown-editor-interfaces';
import { classPrefix } from './ac-markdown-editor-constants';
import * as abcjs from 'abcjs';
import * as echarts from 'echarts';
import * as highlightjs from 'highlight.js';
import * as katex from 'katex';
import * as katex_auto_render from 'katex/dist/contrib/auto-render';
import * as mermaid from 'mermaid';

// ABCjs
export async function abcRender(element: (HTMLElement | Document) = document) {
  const abcElements = element.querySelectorAll('.language-abc');
  if (abcElements.length > 0) {
    abcElements.forEach((e: HTMLDivElement) => {
      const divElement = document.createElement('div');
      e.parentNode.parentNode.replaceChild(divElement, e.parentNode);
      abcjs(divElement, e.textContent.trim(), {});
      divElement.style.overflowX = 'auto';
    });
  }
}

export async function chartRender(element: (HTMLElement | Document) = document) {
  const echartsElements = element.querySelectorAll('.language-echarts');
  if (echartsElements.length > 0) {
    echartsElements.forEach((e: HTMLDivElement) => {
      try {
        if (e.getAttribute('data-processed') === 'true') {
          return;
        }
        const option = JSON.parse(e.innerHTML.trim());
        echarts.init(e).setOption(option);
        e.setAttribute('data-processed', 'true');
      } catch (error) {
        e.className = 'hljs';
        e.innerHTML = `echarts render error: <br>${error}`;
      }
    });
  }
}

export function codeRender(element: HTMLElement, lang: (keyof IACMEI18nLang) = 'zh_CN') {
  element.querySelectorAll('pre > code').forEach((e: HTMLElement, index: number) => {
    if (e.className.indexOf('language-mermaid') > -1 || e.className.indexOf('language-echarts') > -1
      || e.className.indexOf('language-abc') > -1) {
      return;
    }

    if (e.style.maxHeight.indexOf('px') > -1) {
      return;
    }

    if (element.className.indexOf(`${classPrefix}-preview`) > -1 && index > 5) {
      return;
    }

    const divElement = document.createElement('div');
    divElement.className = `${classPrefix}-copy`;
    divElement.innerHTML = `<textarea>${code160to32(e.innerText)}</textarea><span aria-label='${i18n[lang].copy}'
onmouseover='this.setAttribute('aria-label', '${i18n[lang].copy}')'
class='${classPrefix}-tooltipped ${classPrefix}-tooltipped__w'
onclick='this.previousElementSibling.select();document.execCommand('copy');` +
      `this.setAttribute('aria-label', '${i18n[lang].copied}')'><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32px" height="32px">
      <path d="M28.681 11.159c-0.694-0.947-1.662-2.053-2.724-3.116s-2.169-2.030-3.116-2.724c-1.612-1.182-2.393-1.319-2.841-1.319h-11.5c-1.379 0-2.5 1.121-2.5 2.5v23c0 1.378 1.121 2.5 2.5 2.5h19c1.378 0 2.5-1.122 2.5-2.5v-15.5c0-0.448-0.137-1.23-1.319-2.841zM24.543 9.457c0.959 0.959 1.712 1.825 2.268 2.543h-4.811v-4.811c0.718 0.556 1.584 1.309 2.543 2.268v0zM28 29.5c0 0.271-0.229 0.5-0.5 0.5h-19c-0.271 0-0.5-0.229-0.5-0.5v-23c0-0.271 0.229-0.5 0.5-0.5 0 0 11.499-0 11.5 0v7c0 0.552 0.448 1 1 1h7v15.5zM18.841 1.319c-1.612-1.182-2.393-1.319-2.841-1.319h-11.5c-1.378 0-2.5 1.121-2.5 2.5v23c0 1.207 0.86 2.217 2 2.45v-25.45c0-0.271 0.229-0.5 0.5-0.5h15.215c-0.301-0.248-0.595-0.477-0.873-0.681z"></path>
  </svg></span>`;

    e.before(divElement);
    e.style.maxHeight = (window.outerHeight - 40) + 'px';
  });
}

export async function highlightRender(hljsStyle: string, enableHighlight: boolean, element: HTMLElement | Document = document) {
  if (!enableHighlight) {
    return;
  }

  const hljsThemes = ['a11y-dark', 'a11y-light', 'agate', 'an-old-hope', 'androidstudio', 'arduino-light', 'arta',
    'ascetic', 'atelier-cave-dark', 'atelier-cave-light', 'atelier-dune-dark', 'atelier-dune-light', 'school-book',
    'atelier-estuary-dark', 'atelier-estuary-light', 'atelier-forest-dark', 'atelier-forest-light', 'pojoaque',
    'atelier-heath-dark', 'atelier-heath-light', 'atelier-lakeside-dark', 'atelier-lakeside-light', 'zenburn',
    'atelier-plateau-dark', 'atelier-plateau-light', 'atelier-savanna-dark', 'atelier-savanna-light',
    'atelier-seaside-dark', 'atelier-seaside-light', 'atelier-sulphurpool-dark', 'atelier-sulphurpool-light',
    'atom-one-dark', 'atom-one-dark-reasonable', 'atom-one-light', 'brown-paper', 'brown-papersq', 'codepen-embed',
    'color-brewer', 'darcula', 'dark', 'darkula', 'default', 'docco', 'dracula', 'far', 'foundation', 'github',
    'github-gist', 'gml', 'googlecode', 'grayscale', 'gruvbox-dark', 'gruvbox-light', 'hopscotch', 'hybrid', 'idea',
    'ir-black', 'isbl-editor-dark', 'isbl-editor-light', 'kimbie.dark', 'kimbie.light', 'lightfair', 'magula',
    'mono-blue', 'monokai', 'monokai-sublime', 'nord', 'obsidian', 'ocean', 'paraiso-dark', 'paraiso-light',
    'pojoaque', 'purebasic', 'qtcreator_dark', 'qtcreator_light', 'railscasts', 'rainbow', 'routeros', 'tomorrow',
    'school-book', 'shades-of-purple', 'solarized-dark', 'solarized-light', 'sunburst', 'tomorrow-night',
    'tomorrow-night-blue', 'tomorrow-night-bright', 'tomorrow-night-eighties', 'vs', 'vs2015', 'xcode', 'xt256'];

  const codes = element.querySelectorAll(`.${classPrefix}-reset pre code`);
  if (codes.length === 0) {
    return;
  }

  if (hljsThemes.includes(hljsStyle)) {
    addStyle(`assets/styles/highlightjs/${hljsStyle}.css`, `${classPrefix}HljsStyle`);
  }


  element.querySelectorAll(`.${classPrefix}-reset pre code`).forEach((block) => {
    if (block.className.indexOf('language-mermaid') > -1 ||
      block.className.indexOf('language-abc') > -1 ||
      block.className.indexOf('language-echarts') > -1) {
      return;
    }

    highlightjs.highlightBlock(block);
  });
}

export async function mathRender(element: HTMLElement, lang: (keyof IACMEI18nLang) = 'zh_CN') {
  const text = code160to32(element.innerText);
  if (text.split('$').length > 2 || (text.split('\\(').length > 1 && text.split('\\)').length > 1)) {
      addStyle(`assets/styles/katex/katex.min.css`, 'editorKatexStyle');
      katex_auto_render.default(element, {
        delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '\\(', right: '\\)', display: false},
            {left: '$', right: '$', display: false},
        ],
      });
      element.querySelectorAll('.katex-html').forEach((e: HTMLElement, index: number) => {
        if (e.querySelector(`.${classPrefix}-copy`)) {
            return;
        }
        const copyHTML = `<div class='${classPrefix}-copy' style='position: absolute'>
          <textarea>${e.previousElementSibling.querySelector('annotation').textContent}</textarea>
          <span aria-label='${i18n[lang].copy}' style='top: 2px;right: -20px'
          onmouseover='this.setAttribute('aria-label', '${i18n[lang].copy}')' class='${classPrefix}-tooltipped ${classPrefix}-tooltipped__w'
          onclick='this.previousElementSibling.select();document.execCommand('copy');` +
            `this.setAttribute('aria-label', '${i18n[lang].copied}')'><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32px" height="32px">
            <path d="M28.681 11.159c-0.694-0.947-1.662-2.053-2.724-3.116s-2.169-2.030-3.116-2.724c-1.612-1.182-2.393-1.319-2.841-1.319h-11.5c-1.379 0-2.5 1.121-2.5 2.5v23c0 1.378 1.121 2.5 2.5 2.5h19c1.378 0 2.5-1.122 2.5-2.5v-15.5c0-0.448-0.137-1.23-1.319-2.841zM24.543 9.457c0.959 0.959 1.712 1.825 2.268 2.543h-4.811v-4.811c0.718 0.556 1.584 1.309 2.543 2.268v0zM28 29.5c0 0.271-0.229 0.5-0.5 0.5h-19c-0.271 0-0.5-0.229-0.5-0.5v-23c0-0.271 0.229-0.5 0.5-0.5 0 0 11.499-0 11.5 0v7c0 0.552 0.448 1 1 1h7v15.5zM18.841 1.319c-1.612-1.182-2.393-1.319-2.841-1.319h-11.5c-1.378 0-2.5 1.121-2.5 2.5v23c0 1.207 0.86 2.217 2 2.45v-25.45c0-0.271 0.229-0.5 0.5-0.5h15.215c-0.301-0.248-0.595-0.477-0.873-0.681z"></path>
        </svg></span></div>`;
        e.insertAdjacentHTML('beforeend', copyHTML);
    });
  }
}

export function loadLuteJs(editor?: IACMEditor) {
  const scriptElement = document.createElement('script');
  scriptElement.type = 'text/javascript';
  scriptElement.src = `assets/lib/lute.min.js`;
  document.getElementsByTagName('head')[0].appendChild(scriptElement);

  return new Promise((resolve) => {
      scriptElement.onload = () => {
          if (editor && !editor.lute) {
            editor.lute = Lute.New();
            editor.lute.PutEmojis(editor.options.hint.emoji);
            editor.lute.SetEmojiSite(editor.options.hint.emojiPath);
          }
          resolve();
      };
  });
}

declare const Lute: ILute;

export async function md2htmlByPreview(mdText: string, options?: IACMEPreviewOptions) {
  if (typeof Lute === 'undefined') {
      await loadLuteJs();
  }
  options = Object.assign({
      emojiSite: `assets/images/emoji`,
      emojis: {},
  }, options);

  const lute: ILute = Lute.New();
  lute.PutEmojis(options.customEmoji);
  lute.SetEmojiSite(options.emojiPath);
  const md = await lute.MarkdownStr('', mdText);

  return md[1] || md[0];
}

export async function md2htmlByEditor(mdText: string, editor: IACMEditor) {
  const md = await editor.lute.MarkdownStr('', mdText);
  return md[1] || md[0];
}

export function videoRender(element: HTMLElement, url: string) {
  element.insertAdjacentHTML('afterend', `<video controls='controls' src='${url}'></video>`);
  element.remove();
}

export function audioRender(element: HTMLElement, url: string) {
  element.insertAdjacentHTML('afterend', `<audio controls='controls' src='${url}'></audio>`);
  element.remove();
}

export function iframeRender(element: HTMLElement, url: string) {
  const youtubeMatch = url.match(/\/\/(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w|-]{11})(?:(?:[\?&]t=)(\S+))?$/);
  const youkuMatch = url.match(/\/\/v\.youku\.com\/v_show\/id_(\w+)=*\.html/);
  const qqMatch = url.match(/\/\/v\.qq\.com\/x\/cover\/.*\/([^\/]+)\.html\??.*/);
  const coubMatch = url.match(/(?:www\.|\/\/)coub\.com\/view\/(\w+)/);
  const facebookMatch = url.match(/(?:www\.|\/\/)facebook\.com\/([^\/]+)\/videos\/([0-9]+)/);
  const dailymotionMatch = url.match(/.+dailymotion.com\/(video|hub)\/(\w+)\?/);

  if (youtubeMatch && youtubeMatch[1].length === 11) {
      element.insertAdjacentHTML('afterend',
          `<iframe class='iframe__video' src='//www.youtube.com/embed/${youtubeMatch[1] +
          (youtubeMatch[2] ? '?start=' + youtubeMatch[2] : '')}'></iframe>`);
      element.remove();
  } else if (youkuMatch && youkuMatch[1]) {
      element.insertAdjacentHTML('afterend',
          `<iframe class='iframe__video' src='//player.youku.com/embed/${youkuMatch[1]}'></iframe>`);
      element.remove();
  } else if (qqMatch && qqMatch[1]) {
      element.insertAdjacentHTML('afterend',
          `<iframe class='iframe__video' src='https://v.qq.com/txp/iframe/player.html?vid=${qqMatch[1]}'></iframe>`);
      element.remove();
  } else if (coubMatch && coubMatch[1]) {
      element.insertAdjacentHTML('afterend',
          `<iframe class='iframe__video'
src='//coub.com/embed/${coubMatch[1]}?muted=false&autostart=false&originalSize=true&startWithHD=true'></iframe>`);
      element.remove();
  } else if (facebookMatch && facebookMatch[0]) {
      element.insertAdjacentHTML('afterend',
          `<iframe class='iframe__video'
src='https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(facebookMatch[0])}'></iframe>`);
      element.remove();
  } else if (dailymotionMatch && dailymotionMatch[2]) {
      element.insertAdjacentHTML('afterend',
          `<iframe class='iframe__video'
src='https://www.dailymotion.com/embed/video/${dailymotionMatch[2]}'></iframe>`);
      element.remove();
  }
}

export function mediaRender(element: HTMLElement) {
  element.querySelectorAll('a').forEach((aElement) => {
      const url = aElement.getAttribute('href');
      if (url.match(/^.+.(mp4|m4v|ogg|ogv|webm)$/)) {
          videoRender(aElement, url);
      } else if (url.match(/^.+.(mp3|wav)$/)) {
          audioRender(aElement, url);
      } else {
          iframeRender(aElement, url);
      }
  });
}

export async function mermaidRender(element: HTMLElement) {
  if (element.querySelectorAll('code.language-mermaid').length === 0) {
      return;
  }
  mermaid.default.init('.language-mermaid');
}

export async function previewRender(element: HTMLTextAreaElement, options?: IACMEPreviewOptions) {
  const defaultOption = {
      customEmoji: {},
      emojiPath: `./assets/images/emoji`,
      enableHighlight: true,
      hljsStyle: 'atom-one-light',
      lang: 'zh_CN',
  };
  options = Object.assign(defaultOption, options);
  const html =
      await md2htmlByPreview(element.textContent, options);
  const divElement = document.createElement('div');
  divElement.innerHTML = html;
  divElement.className = element.className;
  divElement.id = element.id;
  divElement.setAttribute('style', element.getAttribute('style'));
  divElement.style.display = 'block';
  element.after(divElement);
  element.remove();
  codeRender(divElement, options.lang);
  highlightRender(options.hljsStyle, options.enableHighlight, divElement);
  mathRender(divElement, options.lang);
  mermaidRender(divElement);
  chartRender(divElement);
  abcRender(divElement);
  mediaRender(divElement);
}

import { getText, code160to32 } from './acmarkdown-editor-util';
import { IACMarkdownEditor, IACMarkdownEditorI18nLang, IACMarkdownEditorPreviewOptions } from './acmarkdown-editor-interface';
import { i18n, copySvg } from './acmarkdown-editor-constant';
import * as marked from 'marked';
import * as highlightjs from 'highlight.js';
import * as katex from 'katex';
import * as katexAutoRender from 'katex/dist/contrib/auto-render';
import * as abcjs from 'abcjs';
import * as echarts from 'echarts';

export function abcRender(element: (HTMLElement | Document) = document) {
  const abcElements = element.querySelectorAll('.language-abc');
  if (abcElements.length > 0) {
    // const { default: abcjs } = await import(/* webpackChunkName: 'abcjs' */ 'abcjs/src/api/abc_tunebook_svg');
    abcElements.forEach((e: HTMLDivElement) => {
      const divElement = document.createElement('div');
      e.parentNode.parentNode.replaceChild(divElement, e.parentNode);
      abcjs.renderAbc(divElement, e.textContent.trim(), {});
      divElement.style.overflowX = 'auto';
    });
  }
}

export function chartRender(element: (HTMLElement | Document) = document) {
  const echartsElements = element.querySelectorAll('.language-echarts');
  if (echartsElements.length > 0) {
    // const echarts = await import(/* webpackChunkName: 'echarts' */ 'echarts');
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

export function codeRender(element: HTMLElement, lang: (keyof IACMarkdownEditorI18nLang) = 'zh_CN') {
  element.querySelectorAll('pre > code').forEach((e: HTMLElement, index: number) => {
    if (e.className.indexOf('language-mermaid') > -1 || e.className.indexOf('language-echarts') > -1
      || e.className.indexOf('language-abc') > -1) {
      return;
    }

    if (e.style.maxHeight.indexOf('px') > -1) {
      return;
    }

    // 避免预览区在渲染后由于代码块过多产生性能问题 https://github.com/b3log/vditor/issues/67
    if (element.className.indexOf('vditor-preview') > -1 && index > 5) {
      return;
    }

    const divElement = document.createElement('div');
    divElement.className = 'vditor-copy';
    divElement.innerHTML = `<textarea>${code160to32(e.innerText)}</textarea><span aria-label='${i18n[lang].copy}'
onmouseover='this.setAttribute('aria-label', '${i18n[lang].copy}')'
class='vditor-tooltipped vditor-tooltipped__w'
onclick='this.previousElementSibling.select();document.execCommand('copy');` +
      `this.setAttribute('aria-label', '${i18n[lang].copied}')'>${copySvg}</span>`;

    e.before(divElement);
    e.style.maxHeight = (window.outerHeight - 40) + 'px';
  });
}

export function highlightRender(
  hljsStyle: string,
  enableHighlight: boolean,
  element: HTMLElement | Document = document) {

  const hljsThemes = ['abap', 'algol', 'algol_nu', 'arduino', 'autumn', 'borland', 'bw', 'colorful', 'dracula',
    'emacs', 'friendly', 'fruity', 'github', 'igor', 'lovelace', 'manni', 'monokai', 'monokailight', 'murphy',
    'native', 'paraiso-dark', 'paraiso-light', 'pastie', 'perldoc', 'pygments', 'rainbow_dash', 'rrt',
    'solarized-dark', 'solarized-dark256', 'solarized-light', 'swapoff', 'tango', 'trac', 'vim', 'vs', 'xcode'];

  if (!hljsThemes.includes(hljsStyle)) {
    hljsStyle = 'github';
  }

  if (!enableHighlight) {
    return;
  }

  const codes = element.querySelectorAll('pre > code');
  if (codes.length === 0) {
    return;
  }

  element.querySelectorAll('pre > code').forEach((block) => {
    if (block.className.indexOf('language-mermaid') > -1 ||
      block.className.indexOf('language-abc') > -1 ||
      block.className.indexOf('language-echarts') > -1) {
      return;
    }
    highlightjs.highlightBlock(block);
  });
}

// export function emojiRender(text: string, customEmoji: { [key: string]: string }) {
//   const imgEmoji = ['b3log', 'chainbook', 'doge', 'hacpai', 'huaji', 'latke', 'pipe', 'solo',
//     'sym', 'vditor', 'octocat', 'wide', 'trollface', ...Object.keys(customEmoji)];
//   imgEmoji.map((emoji) => {
//     if (emoji in customEmoji) {
//       if (customEmoji[emoji].indexOf('//') > -1) {
//         text = text.replace(new RegExp(`:${emoji}:`, 'g'),
//           `<img alt='${emoji}' class='emoji' src='${customEmoji[emoji]}'
//  title='${emoji}'>`);
//       }
//     } else {
//       const suffix = emoji === 'huaji' ? 'gif' : 'png';
//       text = text.replace(new RegExp(`:${emoji}:`, 'g'),
//         `<img alt='${emoji}' class='emoji' src='${CDN_PATH}/vditor/dist/images/emoji/${emoji}.${suffix}'
//  title='${emoji}'>`);
//     }

//   });
//   return text;
// }

// export function taskRender(md: markdownit) {
//   md.core.ruler.after('inline', 'github-task-lists', (state) => {
//     state.tokens.forEach((token, index: number) => {
//       if (token.type === 'inline' &&
//         (token.content.indexOf('[ ] ') === 0 || token.content.toLocaleLowerCase().indexOf('[x] ') === 0) &&
//         state.tokens[index - 1].type === 'paragraph_open' &&
//         state.tokens[index - 2].type === 'list_item_open'
//       ) {
//         const checkbox = new state.Token('checkbox_input', 'input', 0);
//         checkbox.attrs = [['type', 'checkbox'], ['disabled', 'true']];
//         if (token.content.toLocaleLowerCase().indexOf('[x] ') === 0) {
//           checkbox.attrs.push(['checked', 'true']);
//         }

//         token.children[0].content = token.children[0].content.slice(3);
//         token.children.unshift(checkbox);

//         if (state.tokens[index - 2].attrIndex('class') < 0) {
//           state.tokens[index - 2].attrPush(['class', 'vditor-task']);
//         } else {
//           state.tokens[index - 2].attrs[index] = ['class', 'vditor-task'];
//         }
//       }
//     });
//   });
// }

// export function mathRender(element: HTMLElement, lang: (keyof IACMarkdownEditorI18nLang) = 'zh_CN') {
//   const text = code160to32(element.innerText);
//   if (text.split('$').length > 2 || (text.split('\\(').length > 1 && text.split('\\)').length > 1)) {
//     katexAutoRender.default(element, {
//       delimiters: [
//         { left: '$$', right: '$$', display: true },
//         { left: '\\(', right: '\\)', display: false },
//         { left: '$', right: '$', display: false },
//       ],
//     });

//     element.querySelectorAll('.katex').forEach((mathElement: HTMLElement) => {
//       mathElement.addEventListener('copy', function (event: ClipboardEvent) {
//         event.stopPropagation();
//         event.preventDefault();
//         event.clipboardData.setData('text/plain',
//           this.querySelector('annotation').textContent);
//         event.clipboardData.setData('text/html', this.innerHTML);
//       });
//     });
//   }
// }

export function mathRender2(element: HTMLElement) {
  // const mathElements = element.querySelectorAll('.katex');

  // if (mathElements.length === 0) {
  //   return;
  // }

  // mathElements.forEach((mathElement) => {
  //   const math = code160to32(mathElement.textContent);

  //   try {
  //     mathElement.innerHTML = katex.renderToString(math, {
  //       displayMode: mathElement.tagName === 'DIV',
  //       // output: 'html',
  //     });
  //   } catch (e) {
  //     mathElement.innerHTML = e.message;
  //     mathElement.className = 'vditor-math vditor--error';
  //   }

  //   mathElement.addEventListener('copy', (event: ClipboardEvent) => {
  //     event.stopPropagation();
  //     event.preventDefault();
  //     const vditorMathElement = (event.currentTarget as HTMLElement).closest('.vditor-math');
  //     event.clipboardData.setData('text/html', vditorMathElement.innerHTML);
  //     event.clipboardData.setData('text/plain',
  //       vditorMathElement.getAttribute('data-math'));
  //   });
  // });
  const chlds = element.getElementsByClassName('katex');
  const orgcount = chlds.length;
  for (let i = 0; i < orgcount; i++) {
    const chdelem = chlds.item(i);
    katex.render(chdelem.textContent, chdelem as HTMLElement, {
      throwOnError: false
    });
  }
}

export function mermaidRender(element: HTMLElement) {
  if (element.querySelectorAll('code.language-mermaid').length === 0) {
    return;
  }
  import(/* webpackChunkName: 'mermaid' */ 'mermaid').then((mermaid) => {
    mermaid.init({ noteMargin: 10 }, '.language-mermaid');
  });
}

// export async function previewRender(element: HTMLTextAreaElement, options?: IACMarkdownEditorPreviewOptions) {
//   const defaultOption = {
//     customEmoji: {},
//     enableHighlight: true,
//     hljsStyle: 'atom-one-light',
//     lang: 'zh_CN',
//   };
//   options = Object.assign(defaultOption, options);
//   const html =
//     await markdownItRender(element.textContent, options.hljsStyle, options.enableHighlight, options.customEmoji);
//   const divElement = document.createElement('div');
//   divElement.innerHTML = html;
//   divElement.className = element.className;
//   divElement.id = element.id;
//   divElement.setAttribute('style', element.getAttribute('style'));
//   divElement.style.display = 'block';
//   element.after(divElement);
//   element.remove();
//   mathRender(divElement, options.lang);
//   mermaidRender(divElement);
//   abcRender(divElement);
//   codeRender(divElement, options.lang);
//   chartRender(divElement);
// }

// function task(md: markdownit) {
//   md.core.ruler.after('inline', 'github-task-lists', (state) => {
//     state.tokens.forEach((token, index: number) => {
//       if (token.type === 'inline' &&
//         (token.content.indexOf('[ ] ') === 0 || token.content.toLocaleLowerCase().indexOf('[x] ') === 0) &&
//         state.tokens[index - 1].type === 'paragraph_open' &&
//         state.tokens[index - 2].type === 'list_item_open'
//       ) {
//         const checkbox = new state.Token('checkbox_input', 'input', 0);
//         checkbox.attrs = [['type', 'checkbox'], ['disabled', 'true']];
//         if (token.content.toLocaleLowerCase().indexOf('[x] ') === 0) {
//           checkbox.attrs.push(['checked', 'true']);
//         }

//         token.children[0].content = token.children[0].content.slice(3);
//         token.children.unshift(checkbox);

//         if (state.tokens[index - 2].attrIndex('class') < 0) {
//           state.tokens[index - 2].attrPush(['class', 'vditor-task']);
//         } else {
//           state.tokens[index - 2].attrs[index] = ['class', 'vditor-task'];
//         }
//       }
//     });
//   });
// }

// export function coreRender(hljsStyle: string, enableHighlight: boolean) {
//   // const hljsThemes = ['a11y-dark', 'a11y-light', 'agate', 'an-old-hope', 'androidstudio', 'arduino-light', 'arta',
//   //   'ascetic', 'atelier-cave-dark', 'atelier-cave-light', 'atelier-dune-dark', 'atelier-dune-light', 'school-book',
//   //   'atelier-estuary-dark', 'atelier-estuary-light', 'atelier-forest-dark', 'atelier-forest-light', 'pojoaque',
//   //   'atelier-heath-dark', 'atelier-heath-light', 'atelier-lakeside-dark', 'atelier-lakeside-light', 'zenburn',
//   //   'atelier-plateau-dark', 'atelier-plateau-light', 'atelier-savanna-dark', 'atelier-savanna-light',
//   //   'atelier-seaside-dark', 'atelier-seaside-light', 'atelier-sulphurpool-dark', 'atelier-sulphurpool-light',
//   //   'atom-one-dark', 'atom-one-dark-reasonable', 'atom-one-light', 'brown-paper', 'brown-papersq', 'codepen-embed',
//   //   'color-brewer', 'darcula', 'dark', 'darkula', 'default', 'docco', 'dracula', 'far', 'foundation', 'github',
//   //   'github-gist', 'gml', 'googlecode', 'grayscale', 'gruvbox-dark', 'gruvbox-light', 'hopscotch', 'hybrid', 'idea',
//   //   'ir-black', 'isbl-editor-dark', 'isbl-editor-light', 'kimbie.dark', 'kimbie.light', 'lightfair', 'magula',
//   //   'mono-blue', 'monokai', 'monokai-sublime', 'nord', 'obsidian', 'ocean', 'paraiso-dark', 'paraiso-light',
//   //   'pojoaque', 'purebasic', 'qtcreator_dark', 'qtcreator_light', 'railscasts', 'rainbow', 'routeros', 'tomorrow',
//   //   'school-book', 'shades-of-purple', 'solarized-dark', 'solarized-light', 'sunburst', 'tomorrow-night',
//   //   'tomorrow-night-blue', 'tomorrow-night-bright', 'tomorrow-night-eighties', 'vs', 'vs2015', 'xcode', 'xt256'];

//   // if (hljsThemes.includes(hljsStyle) && enableHighlight) {
//   //   // TBD!
//   //   // addStyle(`${CDN_PATH}/vditor/dist/js/highlight.js/styles/${hljsStyle}.css`,
//   //   //   'vditorHljsStyle');
//   // }

//   const options: markdownit.Options = {
//     breaks: true,
//     html: true,
//     linkify: true,
//   };

//   if (enableHighlight) {
//     // const hljs = await import(/* webpackChunkName: 'highlight.js' */ 'highlight.js');
//     options.highlight = (str: string, lang: string) => {
//       if (lang === 'mermaid' || lang === 'echarts' || lang === 'abc') {
//         return str;
//       }
//       if (lang && highlightjs.getLanguage(lang)) {
//         return `<pre><code class='language-${lang} hljs'>${highlightjs.highlight(lang, str, true).value}</code></pre>`;
//       }
//       return `<pre><code class='hljs'>${highlightjs.highlightAuto(str).value}</code></pre>`;
//     };
//   }
//   return markdownit(options).use(task);
// }

// export function coreRender2() {
//   const options: markdownit.Options = {
//     breaks: true,
//     html: true,
//     linkify: true,
//   };
//   return markdownit(options).use(task);
// }

// export function md2html(vditor: IACMarkdownEditor, enableHighlight: boolean): string {
//   if (typeof vditor.markdownIt !== 'undefined') {
//     // return vditor.markdownIt.render(emojiRender(getText(vditor.editor.element), vditor.options.hint.emoji));
//     return vditor.markdownIt.render(getText(vditor.editor.element));
//   } else {
//     vditor.markdownIt = coreRender2();
//     // return vditor.markdownIt.render(emojiRender(getText(vditor.editor.element), vditor.options.hint.emoji));
//     return vditor.markdownIt.render(getText(vditor.editor.element));
//   }
// }

// export function md2html2(vditor: IACMarkdownEditor, mdText: string, options?: IACMarkdownEditorPreviewOptions): string {
//   if (typeof vditor.markdownIt !== 'undefined') {
//     // return vditor.markdownIt.render(emojiRender(getText(vditor.editor.element), vditor.options.hint.emoji));
//     return vditor.markdownIt.render(mdText);
//   } else {
//     vditor.markdownIt = coreRender2();
//     // return vditor.markdownIt.render(emojiRender(getText(vditor.editor.element), vditor.options.hint.emoji));
//     return vditor.markdownIt.render(mdText);
//   }
// }

const videoRender = (element: HTMLElement, url: string) => {
  element.insertAdjacentHTML('afterend', `<video controls='controls' src='${url}'></video>`);
  element.remove();
};

const audioRender = (element: HTMLElement, url: string) => {
  element.insertAdjacentHTML('afterend', `<audio controls='controls' src='${url}'></audio>`);
  element.remove();
};

const iframeRender = (element: HTMLElement, url: string) => {
  // tslint:disable-next-line:max-line-length
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
};

export function mediaRender(element: HTMLElement) {
  if (!element) {
    return;
  }
  element.querySelectorAll('a').forEach((aElement) => {
    const url = aElement.getAttribute('href');
    if (!url) {
      return;
    }
    if (url.match(/^.+.(mp4|m4v|ogg|ogv|webm)$/)) {
      videoRender(aElement, url);
    } else if (url.match(/^.+.(mp3|wav)$/)) {
      audioRender(aElement, url);
    } else {
      iframeRender(aElement, url);
    }
  });
}

import { ChangeDetectionStrategy, Component, DestroyRef, inject, Input, type OnChanges, type SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { SafeHtml } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';
import type { MarkedExtension } from 'marked';
import DOMPurify from 'dompurify';
import { firstValueFrom } from 'rxjs';

import { KatexService } from '../../services/katex.service';
import { MarkedService } from '../../services/marked.service';

@Component({
  selector: 'app-markdown-content',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './markdown-content.component.html',
  styleUrls: ['./markdown-content.component.scss'],
})
export class MarkdownContentComponent implements OnChanges {
  @Input() markdown: string = '';
  @Input() enableMath: boolean = false;

  /**
   * Base URL for resolving relative image paths found in the markdown content.
   * When set, images with relative src (e.g., `./image.png`) are fetched via HttpClient
   * (which includes the auth Bearer token via the auth interceptor), converted to blob
   * URLs, and injected into the rendered HTML — so the browser can display them even
   * though the API endpoint requires authentication that `<img src="...">` cannot send.
   *
   * Example: `${apiUrl}/api/Storage/knowledge-exercises/`
   */
  @Input() imageBaseUrl?: string;

  renderedContent: SafeHtml = '';
  readonly sanitizer = inject(DomSanitizer);
  private readonly katexService = inject(KatexService);
  private readonly markedService = inject(MarkedService);
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  // Active blob URLs created for images — revoked on destroy or re-render to avoid leaks.
  private activeBlobUrls: string[] = [];

  constructor() {
    // Revoke all blob URLs when the component is destroyed
    this.destroyRef.onDestroy(() => {
      for (const url of this.activeBlobUrls) {
        URL.revokeObjectURL(url);
      }
      this.activeBlobUrls = [];
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['markdown'] || changes['enableMath']) {
      void this.renderMarkdown();
    }
  }

  private createKatexExtensions(): MarkedExtension {
    const { enableMath, katexService } = this;
    const katexExtension: MarkedExtension = {
      extensions: [
        {
          name: 'inlineKatex',
          level: 'inline',
          start(src: string) {
            return src.indexOf('$');
          },
          tokenizer(src: string) {
            if (!enableMath) {
              return undefined;
            }
            const match = src.match(/^\$+([^$\n]+?)\$+/);
            if (match) {
              return {
                type: 'inlineKatex',
                raw: match[0],
                text: match[1].trim(),
              };
            }
            return undefined;
          },
          renderer(token: unknown) {
            const typedToken = token as { text: string };
            if (!enableMath) {
              return `$${typedToken.text}$`;
            }
            try {
              const html = katexService.getKatexModule().renderToString(typedToken.text, {
                throwOnError: false,
                displayMode: false,
              });
              return html;
            } catch (error) {
              console.error('Error rendering inline KaTeX:', typedToken.text, error);
              return `<span style="color:red;">[Error rendering formula: ${typedToken.text}]</span>`;
            }
          },
        },
        {
          name: 'blockKatex',
          level: 'block',
          start(src: string) {
            return src.indexOf('$$');
          },
          tokenizer(src: string) {
            if (!enableMath) {
              return undefined;
            }
            const match = src.match(/^\$\$([\s\S]+?)\$\$/);
            if (match) {
              return {
                type: 'blockKatex',
                raw: match[0],
                text: match[1].trim(),
              };
            }
            return undefined;
          },
          renderer(token: unknown) {
            const typedToken = token as { text: string };
            if (!enableMath) {
              return `$$${typedToken.text}$$`;
            }
            try {
              const html = katexService.getKatexModule().renderToString(typedToken.text, {
                throwOnError: false,
                displayMode: true,
              });
              return `<p>${html}</p>`;
            } catch (error) {
              console.error('Error rendering block KaTeX:', typedToken.text, error);
              return `<p style="color:red;">[Error rendering block formula: ${typedToken.text}]</p>`;
            }
          },
        },
      ],
    };

    return katexExtension;
  }

  private async renderMarkdown(): Promise<void> {
    if (!this.markdown) {
      this.renderedContent = '';
      return;
    }

    // Revoke previously created blob URLs before re-rendering
    for (const url of this.activeBlobUrls) {
      URL.revokeObjectURL(url);
    }
    this.activeBlobUrls = [];

    let hasMath = false;
    if (this.enableMath) {
      // 简单预检查：查看 Markdown 是否包含 $ 或 $$
      hasMath = /\$\$[\s\S]*?\$\$|\$[^$]*?\$/.test(this.markdown);
    }

    try {
      let rawHtml: string;
      if (hasMath) {
        try {
          // 1. 加载 KaTeX 模块 (如果尚未加载)
          await this.katexService.loadKatex();

          // 2. 使用独立实例解析，避免污染全局 Marked 状态
          const katexExt = this.createKatexExtensions();
          rawHtml = this.markedService.parseWithExtensions(this.markdown, [katexExt]);
        } catch (loadError) {
          console.error('Error loading or setting up KaTeX:', loadError);
          // 如果加载失败，继续渲染，但不带数学公式
          rawHtml = this.markedService.parse(this.markdown);
        }
      } else {
        // 没有检测到数学公式或未启用
        rawHtml = this.markedService.parse(this.markdown);
      }

      // Resolve relative image URLs via authenticated HttpClient, producing blob URLs.
      // <img> tags cannot carry the Authorization header, so we fetch the images here
      // (where the auth interceptor adds the JWT) and inject them as blob: URLs.
      if (this.imageBaseUrl) {
        rawHtml = await this.resolveAuthenticatedImages(rawHtml);
      }

      // Sanitize the rendered HTML to prevent XSS (strip <script>, event handlers, etc.)
      // before bypassing Angular's built-in sanitization. This is necessary because
      // marked may produce HTML from user/API-supplied markdown that could contain
      // injected scripts or event handlers.
      const sanitizedHtml = DOMPurify.sanitize(rawHtml);
      this.renderedContent = this.sanitizer.bypassSecurityTrustHtml(sanitizedHtml);
    } catch (parseError) {
      console.error('Error parsing markdown:', parseError);
      this.renderedContent = this.sanitizer.bypassSecurityTrustHtml(
        '<p style="color: red;">Error rendering Markdown content.</p>'
      );
    }
  }

  /**
   * Replace relative image `src` attributes in rendered HTML with authenticated blob URLs.
   * Each image is fetched via `HttpClient` (so the auth interceptor attaches the JWT),
   * converted to a `File` (to preserve the filename extension for MIME detection), and
   * exposed through `URL.createObjectURL()` so the `<img>` tag can render it.
   */
  private async resolveAuthenticatedImages(html: string): Promise<string> {
    const imgRegex = /<img\s+[^>]*src="([^"]+)"[^>]*>/gi;
    const matches = [...html.matchAll(imgRegex)];
    if (matches.length === 0) {
      return html;
    }

    // Fetch all images in parallel
    const replacements = await Promise.all(
      matches.map(async (match) => {
        const relativeSrc = match[1];
        // Skip absolute URLs and data URIs — they don't need authentication
        if (/^(?:https?:|data:|blob:|\/\/)/i.test(relativeSrc)) {
          return { original: match[0], replacement: match[0] };
        }

        try {
          const absoluteUrl = new URL(relativeSrc, this.imageBaseUrl!).href;
          const blob = await firstValueFrom(this.http.get(absoluteUrl, { responseType: 'blob' }));
          if (!blob) {
            return { original: match[0], replacement: match[0] };
          }

          // Preserve the filename so the browser can infer the MIME type from the extension.
          // `URL.createObjectURL(new File(...))` produces a blob URL that the browser treats
          // as if it had the original file extension, enabling correct image decoding.
          const filename = relativeSrc.split('/').pop() ?? 'image.png';
          const file = new File([blob], filename, { type: blob.type });
          const blobUrl = URL.createObjectURL(file);
          this.activeBlobUrls.push(blobUrl);

          const replacement = match[0].replace(`src="${relativeSrc}"`, `src="${blobUrl}"`);
          return { original: match[0], replacement };
        } catch (err) {
          console.error(`Failed to load authenticated image: ${relativeSrc}`, err);
          return { original: match[0], replacement: match[0] };
        }
      })
    );

    let result = html;
    for (const { original, replacement } of replacements) {
      result = result.replace(original, replacement);
    }
    return result;
  }
}

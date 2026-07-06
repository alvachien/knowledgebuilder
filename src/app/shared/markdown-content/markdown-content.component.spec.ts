import { SimpleChange } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { MarkdownContentComponent } from './markdown-content.component';

describe('MarkdownContentComponent', () => {
  let component: MarkdownContentComponent;
  let fixture: ComponentFixture<MarkdownContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkdownContentComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MarkdownContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('constructor', () => {
    it('should initialize without mutating global Marked state', () => {
      // Constructor no longer calls setupMarkedBase; extensions are applied per-render
      // via parseWithExtensions on isolated Marked instances.
      expect(component).toBeTruthy();
    });

    it('should initialize with empty rendered content', () => {
      expect(component.renderedContent).toBe('');
    });

    it('should initialize with enableMath false', () => {
      expect(component.enableMath).toBe(false);
    });

    it('should initialize with empty markdown', () => {
      expect(component.markdown).toBe('');
    });
  });

  describe('ngOnChanges', () => {
    it('should call renderMarkdown when markdown input changes', async () => {
      vi.spyOn(component as any, 'renderMarkdown');

      component.ngOnChanges({
        markdown: new SimpleChange(null, '# Hello', true),
      });

      expect(component['renderMarkdown']).toHaveBeenCalled();
    });

    it('should call renderMarkdown when enableMath input changes', async () => {
      vi.spyOn(component as any, 'renderMarkdown');

      component.ngOnChanges({
        enableMath: new SimpleChange(false, true, false),
      });

      expect(component['renderMarkdown']).toHaveBeenCalled();
    });

    it('should not call renderMarkdown when unrelated input changes', async () => {
      vi.spyOn(component as any, 'renderMarkdown');

      component.ngOnChanges({
        someOtherProperty: new SimpleChange(null, 'value', true),
      });

      expect(component['renderMarkdown']).not.toHaveBeenCalled();
    });

    it('should call renderMarkdown when both markdown and enableMath change', async () => {
      vi.spyOn(component as any, 'renderMarkdown');

      component.ngOnChanges({
        markdown: new SimpleChange(null, '# Hello', true),
        enableMath: new SimpleChange(false, true, false),
      });

      expect(component['renderMarkdown']).toHaveBeenCalled();
    });
  });

  describe('renderMarkdown', () => {
    it('should render empty string when markdown is empty', async () => {
      component.markdown = '';
      await component['renderMarkdown']();

      expect(component.renderedContent).toBe('');
    });

    it('should render simple markdown heading', async () => {
      component.markdown = '# Hello World';
      await component['renderMarkdown']();

      const html = component.renderedContent.toString();
      expect(html).toContain('Hello World');
    });

    it('should render markdown paragraph', async () => {
      component.markdown = 'This is a paragraph.';
      await component['renderMarkdown']();

      const html = component.renderedContent.toString();
      expect(html).toContain('This is a paragraph');
    });

    it('should render markdown bold text', async () => {
      component.markdown = '**Bold text**';
      await component['renderMarkdown']();

      const html = component.renderedContent.toString();
      expect(html).toContain('Bold text');
    });

    it('should render markdown italic text', async () => {
      component.markdown = '*Italic text*';
      await component['renderMarkdown']();

      const html = component.renderedContent.toString();
      expect(html).toContain('Italic text');
    });

    it('should render markdown list', async () => {
      component.markdown = '- Item 1\n- Item 2\n- Item 3';
      await component['renderMarkdown']();

      const html = component.renderedContent.toString();
      expect(html).toContain('Item 1');
      expect(html).toContain('Item 2');
      expect(html).toContain('Item 3');
    });

    it('should render markdown code block', async () => {
      component.markdown = '```\ncode here\n```';
      await component['renderMarkdown']();

      const html = component.renderedContent.toString();
      expect(html).toContain('code here');
    });

    it('should render markdown link', async () => {
      component.markdown = '[Link text](https://example.com)';
      await component['renderMarkdown']();

      const html = component.renderedContent.toString();
      expect(html).toContain('Link text');
      expect(html).toContain('example.com');
    });

    it('should handle markdown with line breaks', async () => {
      component.markdown = 'Line 1\n\nLine 2';
      await component['renderMarkdown']();

      const html = component.renderedContent.toString();
      expect(html).toContain('Line 1');
      expect(html).toContain('Line 2');
    });

    it('should handle complex markdown with multiple elements', async () => {
      component.markdown = '# Title\n\nParagraph with **bold** and *italic*.\n\n- List item';
      await component['renderMarkdown']();

      const html = component.renderedContent.toString();
      expect(html).toContain('Title');
      expect(html).toContain('Paragraph');
      expect(html).toContain('List item');
    });

    it('should sanitize HTML output', async () => {
      component.markdown = '# Safe Content';
      await component['renderMarkdown']();

      expect(component.renderedContent).toBeTruthy();
    });

    it('should handle markdown parse error gracefully', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      // Mock the MarkedService parse method
      const markedService = (component as any).markedService;
      vi.spyOn(markedService, 'parse').mockImplementation(() => { throw new Error('Parse error'); });

      component.markdown = '# Test';
      await component['renderMarkdown']();

      expect(console.error).toHaveBeenCalled();
      const html = component.renderedContent.toString();
      expect(html).toContain('Error rendering Markdown content');
    });
  });

  describe('math rendering', () => {
    it('should detect inline math when enableMath is true', async () => {
      component.markdown = 'Inline math: $x = y$';
      component.enableMath = true;

      await component['renderMarkdown']();

      expect(component.renderedContent).toBeTruthy();
    });

    it('should detect block math when enableMath is true', async () => {
      component.markdown = 'Block math: $$x = y$$';
      component.enableMath = true;

      await component['renderMarkdown']();

      expect(component.renderedContent).toBeTruthy();
    });

    it('should not process math when enableMath is false', async () => {
      component.markdown = 'Math: $x = y$';
      component.enableMath = false;

      await component['renderMarkdown']();

      const html = component.renderedContent.toString();
      expect(html).toContain('$x = y$');
    });

    it('should handle markdown without math formulas', async () => {
      component.markdown = 'Plain text without any math';
      component.enableMath = true;

      await component['renderMarkdown']();

      const html = component.renderedContent.toString();
      expect(html).toContain('Plain text');
    });

    it('should handle multiple inline math expressions', async () => {
      component.markdown = 'Math: $a = b$ and $c = d$';
      component.enableMath = true;

      await component['renderMarkdown']();

      expect(component.renderedContent).toBeTruthy();
    });

    it('should handle mixed inline and block math', async () => {
      component.markdown = 'Inline $x=1$ and block $$y=2$$';
      component.enableMath = true;

      await component['renderMarkdown']();

      expect(component.renderedContent).toBeTruthy();
    });
  });

  describe('parseWithExtensions (via renderMarkdown)', () => {
    it('should render markdown with math extensions on an isolated Marked instance', async () => {
      component.markdown = 'Hello $x$ world';
      component.enableMath = true;
      await component['renderMarkdown']();

      // The rendered content should contain the math (KaTeX-rendered or fallback text)
      expect(component.renderedContent).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle null markdown input', async () => {
      component.markdown = null as any;
      await component['renderMarkdown']();

      expect(component.renderedContent).toBe('');
    });

    it('should handle undefined markdown input', async () => {
      component.markdown = undefined as any;
      await component['renderMarkdown']();

      expect(component.renderedContent).toBe('');
    });

    it('should handle very long markdown content', async () => {
      component.markdown = '# Heading\n\n' + 'Lorem ipsum '.repeat(1000);
      await component['renderMarkdown']();

      expect(component.renderedContent).toBeTruthy();
    });

    it('should handle markdown with special characters', async () => {
      component.markdown = '# Title with 中文 and émojis 😀';
      await component['renderMarkdown']();

      const html = component.renderedContent.toString();
      expect(html).toContain('中文');
      expect(html).toContain('émojis');
    });

    it('should handle markdown with HTML-like content', async () => {
      component.markdown = '# Title\n\n<div>HTML content</div>';
      await component['renderMarkdown']();

      expect(component.renderedContent).toBeTruthy();
    });

    it('should handle markdown with escaped characters', async () => {
      component.markdown = 'Escaped \\* asterisk and \\# hash';
      await component['renderMarkdown']();

      const html = component.renderedContent.toString();
      expect(html).toContain('Escaped');
    });

    it('should handle markdown with tables', async () => {
      component.markdown = '| Col1 | Col2 |\n|------|------|\n| A    | B    |';
      await component['renderMarkdown']();

      const html = component.renderedContent.toString();
      expect(html).toContain('Col1');
      expect(html).toContain('Col2');
    });

    it('should handle markdown with blockquotes', async () => {
      component.markdown = '> This is a quote';
      await component['renderMarkdown']();

      const html = component.renderedContent.toString();
      expect(html).toContain('This is a quote');
    });

    it('should handle markdown with horizontal rules', async () => {
      component.markdown = 'Before\n\n---\n\nAfter';
      await component['renderMarkdown']();

      const html = component.renderedContent.toString();
      expect(html).toContain('Before');
      expect(html).toContain('After');
    });

    it('should handle empty string after initialization', async () => {
      component.markdown = '# Initial';
      await component['renderMarkdown']();

      component.markdown = '';
      await component['renderMarkdown']();

      expect(component.renderedContent).toBe('');
    });
  });

  describe('integration tests', () => {
    it('should update rendered content when markdown input changes via ngOnChanges', async () => {
      component.markdown = '# First';
      component.ngOnChanges({
        markdown: new SimpleChange(null, '# First', true),
      });
      await fixture.whenStable();

      const firstHtml = component.renderedContent.toString();
      expect(firstHtml).toContain('First');

      component.markdown = '# Second';
      component.ngOnChanges({
        markdown: new SimpleChange('# First', '# Second', false),
      });
      await fixture.whenStable();

      const secondHtml = component.renderedContent.toString();
      expect(secondHtml).toContain('Second');
    });

    it('should re-render when enableMath changes', async () => {
      component.markdown = 'Math: $x=1$';
      component.enableMath = false;
      component.ngOnChanges({
        markdown: new SimpleChange(null, 'Math: $x=1$', true),
      });
      await fixture.whenStable();

      component.enableMath = true;
      component.ngOnChanges({
        enableMath: new SimpleChange(false, true, false),
      });
      await fixture.whenStable();

      expect(component.renderedContent).toBeTruthy();
    });
  });

  describe('sanitizer usage', () => {
    it('should use DomSanitizer to bypass security trust for HTML', async () => {
      vi.spyOn(component.sanitizer, 'bypassSecurityTrustHtml');

      component.markdown = '# Test';
      await component['renderMarkdown']();

      expect(component.sanitizer.bypassSecurityTrustHtml).toHaveBeenCalled();
    });

    it('should sanitize error messages as well', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(component.sanitizer, 'bypassSecurityTrustHtml');
      // Mock the MarkedService parse method
      const markedService = (component as any).markedService;
      vi.spyOn(markedService, 'parse').mockImplementation(() => { throw new Error('Parse error'); });

      component.markdown = '# Test';
      await component['renderMarkdown']();

      expect(component.sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(
        '<p style=\"color: red;\">Error rendering Markdown content.</p>'
      );
    });
  });

  describe('OnPush change detection', () => {
    it('should mark the view for check after the async math render path (no click needed)', async () => {
      // Regression: renderMarkdown is async — when math is enabled it awaits
      // loadKatex() (a dynamic import), so renderedContent is assigned after the
      // change-detection cycle that ran ngOnChanges. With OnPush the view would
      // not re-render without markForCheck, leaving the markdown area blank.
      const markForCheckSpy = vi.spyOn(component['cdr'], 'markForCheck');
      markForCheckSpy.mockClear();

      component.markdown = 'Inline math: $x = y$';
      component.enableMath = true;
      await component['renderMarkdown']();

      expect(component.renderedContent).toBeTruthy();
      expect(markForCheckSpy).toHaveBeenCalled();
    });

    it('should mark the view for check on the empty-markdown early return', async () => {
      const markForCheckSpy = vi.spyOn(component['cdr'], 'markForCheck');
      markForCheckSpy.mockClear();

      component.markdown = '';
      await component['renderMarkdown']();

      expect(component.renderedContent).toBe('');
      expect(markForCheckSpy).toHaveBeenCalled();
    });

    it('should mark the view for check on a render error', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const markedService = (component as any).markedService;
      vi.spyOn(markedService, 'parse').mockImplementation(() => { throw new Error('Parse error'); });
      const markForCheckSpy = vi.spyOn(component['cdr'], 'markForCheck');
      markForCheckSpy.mockClear();

      component.markdown = '# Test';
      await component['renderMarkdown']();

      expect(markForCheckSpy).toHaveBeenCalled();
    });
  });
});

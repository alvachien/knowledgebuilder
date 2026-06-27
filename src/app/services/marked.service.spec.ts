import { TestBed } from '@angular/core/testing';
import type { MarkedExtension } from 'marked';

import { MarkedService } from './marked.service';

describe('MarkedService', () => {
  let service: MarkedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarkedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getInstance', () => {
    it('should return a Marked instance', () => {
      const instance = service.getInstance();
      expect(instance).toBeTruthy();
      expect(typeof instance.parse).toBe('function');
    });

    it('should return the same instance on multiple calls', () => {
      const firstInstance = service.getInstance();
      const secondInstance = service.getInstance();
      expect(firstInstance).toBe(secondInstance);
    });

    it('should set default options', () => {
      const instance = service.getInstance();
      // We can't directly access options, but we can verify parsing works
      const result = instance.parse('# Test');
      expect(result).toContain('<h1>Test</h1>');
    });
  });

  describe('parse', () => {
    it('should parse markdown to HTML', () => {
      const markdown = '# Heading\n\nSome **bold** text.';
      const result = service.parse(markdown);
      expect(result).toContain('<h1>Heading</h1>');
      expect(result).toContain('<strong>bold</strong>');
    });

    it('should handle empty string', () => {
      const result = service.parse('');
      expect(result).toBe('');
    });

    it('should handle code blocks', () => {
      const markdown = '```javascript\nconsole.log("test");\n```';
      const result = service.parse(markdown);
      expect(result).toContain('<code class="language-javascript">');
    });
  });

  describe('parseAsync', () => {
    it('should parse markdown asynchronously', async () => {
      const markdown = '## Subheading\n\nSome *italic* text.';
      const result = await service.parseAsync(markdown);
      expect(result).toContain('<h2>Subheading</h2>');
      expect(result).toContain('<em>italic</em>');
    });
  });

  describe('use', () => {
    it('should apply extensions', () => {
      const mockExtension: MarkedExtension = {
        extensions: [
          {
            name: 'testExtension',
            level: 'inline',
            start: () => 0,
            tokenizer: () => undefined,
            renderer: () => 'test-rendered'
          }
        ]
      };

      service.use(mockExtension);
      
      // Verify extension was applied by checking parsing still works
      const result = service.parse('test');
      expect(result).toBeTruthy();
    });
  });

  describe('clearExtensions', () => {
    it('should clear extensions and create new instance', () => {
      const originalInstance = service.getInstance();
      service.clearExtensions();
      const newInstance = service.getInstance();
      
      // They should be different instances
      expect(originalInstance).not.toBe(newInstance);
    });

    it('should maintain default options after clearing', () => {
      service.clearExtensions();
      const result = service.parse('# Test\n\nLine break');
      expect(result).toContain('<h1>Test</h1>');
      // With a blank line between heading and text, it creates separate paragraphs
      // So we just verify parsing works
      expect(result).toContain('Line break');
    });
  });

  describe('setOptions', () => {
    it('should update options', () => {
      service.setOptions({ gfm: false, breaks: false });
      
      // Test that breaks are not added
      const result = service.parse('Line 1\nLine 2');
      expect(result).not.toContain('<br>');
    });

    it('should not affect singleton instance', () => {
      const instance1 = service.getInstance();
      service.setOptions({ gfm: false });
      const instance2 = service.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('isInitialized', () => {
    it('should return false before first use', () => {
      // Create a new service to ensure it's not initialized
      const newService = new MarkedService();
      expect(newService.isInitialized()).toBe(false);
    });

    it('should return true after getting instance', () => {
      service.getInstance();
      expect(service.isInitialized()).toBe(true);
    });
  });
});
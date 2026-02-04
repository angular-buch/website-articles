import { load } from 'js-yaml';
import { marked } from 'marked';
import hljs from 'highlight.js';

// Synchronous highlighting with highlight.js
marked.setOptions({
  highlight: code => hljs.highlightAuto(code).value
});

/**
 * ============================================================================
 * MODIFIED PARSER - Based on bouzuya/jekyll-markdown-parser
 * ============================================================================
 *
 * Original source: https://github.com/bouzuya/jekyll-markdown-parser
 * Repository archived on Jun 28, 2020 (read-only, no longer maintained)
 *
 * SECURITY NOTE:
 * --------------
 * This parser does NOT sanitize or escape HTML content. Raw HTML in markdown
 * is passed through intentionally. This is a FEATURE, not a bug.
 *
 * WE TRUST OUR OWN REPOSITORY 100%.
 *
 * All markdown content comes from our own Git repository. There is no
 * user-generated content. XSS is not a concern in this context.
 *
 * CHANGES FROM ORIGINAL:
 * -----------------------
 * 1. BUG FIX: Regex in separate() had typo `/^---s*$/` instead of `/^---\s*$/`.
 *    This bug exists in the original bouzuya source code (never fixed).
 *    The literal `s*` matches zero or more 's' characters, not whitespace.
 *    It worked accidentally because most files use `---\n` without trailing chars.
 *
 * 2. FEATURE: Added _imageRenderer() to transform relative image paths to
 *    absolute URLs using baseUrl (for CDN/deployment support).
 *
 * 3. FEATURE: Added _transformRelativeImagePaths() to handle raw HTML <img>
 *    tags that bypass the markdown renderer.
 *
 * 4. CHANGE: Converted from CommonJS module to ES6 class with constructor
 *    for baseUrl injection.
 * ============================================================================
 */
export class JekyllMarkdownParser {

  constructor(private baseUrl: string) {}

  /**
   * Check if a URL is absolute (should not be transformed).
   * Absolute URLs include: https://, http://, data:, //, assets/, /
   */
  private _isAbsoluteUrl(url: string): boolean {
    return url.startsWith('https://') || url.startsWith('http://') ||
           url.startsWith('data:') || url.startsWith('//') ||
           url.startsWith('assets/') || url.startsWith('/');
  }

  /**
   * Normalize a relative URL by stripping ./ prefix.
   */
  private _normalizeRelativeUrl(url: string): string {
    return url.startsWith('./') ? url.slice(2) : url;
  }

  /**
   * Custom image renderer that transforms relative URLs to absolute URLs.
   *
   * NOTE: marked already escapes special characters in alt/title text before
   * passing them to this renderer. We do NOT need to escape again.
   * - `"` is already `&quot;`
   * - `<` is already `&lt;`
   * - `&` is already `&amp;`
   */
  private _imageRenderer(href: string, title: string | null, text: string) {
    let src = href;

    if (!this._isAbsoluteUrl(href)) {
      src = this.baseUrl + this._normalizeRelativeUrl(href);
    }

    // text and title are already escaped by marked
    let out = `<img src="${src}" alt="${text}"`;
    if (title) {
      out += ` title="${title}"`;
    }
    out += '>';
    return out;
  }

  // Transform relative paths in raw HTML <img> tags to absolute URLs
  private _transformRelativeImagePaths(html: string): string {
    return html.replace(/<img([^>]*)\ssrc="([^"]+)"/g, (match, attrs, src) => {
      if (this._isAbsoluteUrl(src)) {
        return match;
      }
      return `<img${attrs} src="${this.baseUrl}${this._normalizeRelativeUrl(src)}"`;
    });
  }

  private getMarkdownRenderer() {
    const renderer = new marked.Renderer();
    renderer.image = this._imageRenderer.bind(this);
    return renderer;
  }

  private separate(jekyllMarkdown: string): {
    markdown: string;
    yaml: string;
  } {
    // BUG FIX: Original had '\s' which becomes literal 's' in string context.
    // Using '[ \\t]*' (space/tab only) instead of '\\s*' to avoid matching newlines,
    // which would change behavior when there's a blank line after the separator.
    const re = new RegExp('^---[ \\t]*$\\r?\\n', 'm');
    const m1 = jekyllMarkdown.match(re); // first separator

    if (m1 === null) {
      return { markdown: jekyllMarkdown, yaml: '' };
    }

    const s1 = jekyllMarkdown.substring((m1.index ?? 0) + m1[0].length);
    const m2 = s1.match(re); // second separator

    if (m2 === null) {
      return { markdown: jekyllMarkdown, yaml: '' };
    }

    const yaml = s1.substring(0, m2.index);
    const markdown = s1.substring((m2.index ?? 0) + m2[0].length);
    return { markdown, yaml };
  }

  private compileMarkdown(markdown: string): string {
    const renderer = this.getMarkdownRenderer();
    const html = marked(markdown, { renderer: renderer });
    return this._transformRelativeImagePaths(html);
  }

  private parseYaml(yaml: string): any {
    return load(yaml);
  }

  public parse(jekyllMarkdown: string): {
    html: string;
    yaml: string;
    parsedYaml: any;
    markdown: string;
  } {
    const { yaml, markdown } = this.separate(jekyllMarkdown);
    const parsedYaml = this.parseYaml(yaml);
    const html = this.compileMarkdown(markdown);

    return {
      html,
      markdown,
      parsedYaml,
      yaml
    };
  }
}

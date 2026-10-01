(function () {
  'use strict';

  function safeFilename(value, extension) {
    const base = String(value || 'Untitled Report')
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, ' ')
      .slice(0, 120) || 'Untitled Report';
    return `${base}.${String(extension || '').replace(/^\./, '')}`;
  }

  function downloadBlob(content, mimeType, filename) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function stripTags(value) {
    return String(value || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  function slugify(value) {
    const base = stripTags(value)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 70);
    return base || 'section';
  }

  function enrichHeadings(bodyHtml) {
    const used = new Map();
    const headings = [];
    const html = String(bodyHtml || '').replace(/<h([1-5])([^>]*)>([\s\S]*?)<\/h\1>/gi, (full, level, attrs, inner) => {
      const existing = String(attrs || '').match(/\sid=["']([^"']+)["']/i);
      let id = existing ? existing[1] : slugify(inner);
      const count = used.get(id) || 0;
      used.set(id, count + 1);
      if (count) id = `${id}-${count + 1}`;
      const label = stripTags(inner) || `Section ${headings.length + 1}`;
      headings.push({ id, label, level: Number(level) });
      if (existing) return full;
      return `<h${level}${attrs || ''} id="${id}">${inner}</h${level}>`;
    });
    return { html, headings };
  }

  function normalizeBookmarks(value) {
    if (!Array.isArray(value)) return [];
    return value.map(item => ({
      id: String(item && item.id || '').replace(/[^A-Za-z0-9:_-]/g, '').slice(0, 120),
      label: String(item && item.label || '').replace(/[<>]/g, '').trim().slice(0, 160)
    })).filter(item => item.id && item.label);
  }

  function buildNav(headings, bookmarks) {
    const headingLinks = headings.map(item => `<a class="toc-link level-${item.level}" href="#${item.id}" data-target="${item.id}">${escapeHtml(item.label)}</a>`).join('');
    const bookmarkLinks = bookmarks.map(item => `<a class="toc-link bookmark-link" href="#mdp-bookmark-${item.id}" data-target="mdp-bookmark-${item.id}"><span aria-hidden="true">◆</span>${escapeHtml(item.label)}</a>`).join('');
    return `<aside class="export-sidebar" aria-label="Document navigation">
      <div class="export-sidebar-title">Contents</div>
      <nav class="toc-list">${headingLinks || '<span class="toc-empty">No headings</span>'}</nav>
      ${bookmarkLinks ? `<div class="export-sidebar-subtitle">Bookmarks</div><nav class="toc-list bookmarks-list">${bookmarkLinks}</nav>` : ''}
    </aside>`;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function customCodeThemeCss(custom) {
    const c = custom && typeof custom === 'object' ? custom : {};
    const safe = (value, fallback) => /^#[0-9a-f]{6}$/i.test(String(value || '')) ? value : fallback;
    return `--code-theme-bg:${safe(c.background,'#1e1e1e')};--code-theme-fg:${safe(c.text,'#f4f4f4')};--code-theme-keyword:${safe(c.keyword,'#ff7ab2')};--code-theme-string:${safe(c.string,'#a8cc8c')};--code-theme-number:${safe(c.number,'#d2a8ff')};--code-theme-comment:${safe(c.comment,'#8b949e')};--code-theme-accent:${safe(c.accent,'#79c0ff')};`;
  }

  function codeThemeCss(theme, custom) {
    const presets = {
      'github-light': ['#f6f8fa','#24292f','#cf222e','#0a3069','#0550ae','#6e7781','#8250df'],
      'github-dark': ['#0d1117','#c9d1d9','#ff7b72','#a5d6ff','#79c0ff','#8b949e','#d2a8ff'],
      'monokai-pro': ['#2d2a2e','#fcfcfa','#ff6188','#ffd866','#ab9df2','#727072','#78dce8'],
      'dracula': ['#282a36','#f8f8f2','#ff79c6','#f1fa8c','#bd93f9','#6272a4','#8be9fd'],
      'gruvbox': ['#282828','#ebdbb2','#fb4934','#b8bb26','#d3869b','#928374','#83a598']
    };
    if (theme === 'custom') return customCodeThemeCss(custom);
    const p = presets[theme] || presets['github-light'];
    return `--code-theme-bg:${p[0]};--code-theme-fg:${p[1]};--code-theme-keyword:${p[2]};--code-theme-string:${p[3]};--code-theme-number:${p[4]};--code-theme-comment:${p[5]};--code-theme-accent:${p[6]};`;
  }

  function buildStandaloneHtml(options) {
    const {
      title, bodyHtml, previewFont, header, footer, pageNumbers,
      mathStyles, customCss, pageLayout, headerStyle, footerStyle,
      codeTheme, customCodeTheme, bookmarks
    } = options;
    const escape = window.MDPMarkdown.escapeHtml;
    const vars = Object.entries(window.MDPLayout.cssVars(pageLayout)).map(([k,v]) => `${k}:${v}`).join(';');
    const rule = window.MDPLayout.pageRule(pageLayout);
    const marginBoxes = window.MDPLayout.marginBoxRule(pageLayout, { header, footer, pageNumbers, headerStyle, footerStyle });
    const mathCss = String(mathStyles || '').replace(/<\/style/gi, '<\\/style');
    const custom = String(customCss || '').replace(/<\/style/gi, '<\\/style');
    const enriched = enrichHeadings(bodyHtml);
    const validBookmarks = normalizeBookmarks(bookmarks).filter(item => enriched.html.includes(`id="mdp-bookmark-${item.id}"`) || enriched.html.includes(`id='mdp-bookmark-${item.id}'`));
    const nav = buildNav(enriched.headings, validBookmarks);
    const codeVars = codeThemeCss(codeTheme || 'github-light', customCodeTheme);

    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title || 'Document')}</title>
<style>
:root{${vars};${codeVars}--ink:#252a2e;--muted:#68727a;--line:#d9dde0;--soft:#f5f6f7;--preview-font:${previewFont};color-scheme:light;scroll-behavior:smooth}
*{box-sizing:border-box}html,body{margin:0;padding:0}body{background:#e9ecef;color:var(--ink);font:16px/1.7 var(--preview-font);}
.export-sidebar{position:fixed;z-index:10;left:22px;top:22px;bottom:22px;width:244px;padding:18px 14px;border:1px solid #d7dce0;border-radius:14px;background:rgba(255,255,255,.96);box-shadow:0 12px 34px #00000015;overflow:auto;backdrop-filter:blur(8px)}
.export-sidebar-title{font:700 15px/1.2 Inter,system-ui,sans-serif;color:#252a2e;margin-bottom:12px}.export-sidebar-subtitle{font:700 10px/1.2 Inter,system-ui,sans-serif;color:#68727a;text-transform:uppercase;letter-spacing:.08em;margin:18px 0 8px}.toc-list{display:grid;gap:3px}.toc-link{display:block;padding:5px 7px;border-radius:6px;color:#46525a;text-decoration:none;font:12px/1.35 Inter,system-ui,sans-serif}.toc-link:hover,.toc-link.active{background:#eef2f1;color:#244531}.toc-link.level-2{padding-left:15px}.toc-link.level-3{padding-left:24px;font-size:11px}.toc-link.level-4,.toc-link.level-5{padding-left:32px;font-size:10.5px}.bookmark-link{display:flex;gap:6px;align-items:flex-start}.bookmark-link span{font-size:8px;margin-top:4px;color:#d85b3f}.toc-empty{font:11px Inter,sans-serif;color:#8b949a}
.document{width:min(297mm,calc(100vw - 330px));min-height:210mm;margin:32px 28px 48px 292px;padding:22mm 24mm;background:#fff;border:1px solid #dfe3e6;border-radius:3px;box-shadow:0 10px 34px #0001;overflow-wrap:anywhere;column-count:1;column-gap:8mm;}
.document h1:first-child{column-span:all}.document h1,.document h2,.document h3,.document h4,.document h5{break-after:avoid;line-height:1.3;scroll-margin-top:24px}.document h2{border-bottom:1px solid var(--line);padding-bottom:.3rem}
.document blockquote{padding:.3rem 1rem;border-left:3px solid #738b7b;break-inside:avoid}.document blockquote p{font:inherit;color:inherit;text-align:inherit;margin:0}.document p{margin:0 0 1rem}
.document a{color:#526b5a}.document table{width:var(--mdp-table-width,100%);border-collapse:collapse;margin:1.3rem auto;font-size:.9em;line-height:var(--mdp-table-line-height,1.5)}.document th,.document td{border:var(--mdp-table-border-width,1px) var(--mdp-table-border-style,solid) var(--mdp-table-border-color,#d9dde0);padding:var(--mdp-table-pad,.55rem .65rem);text-align:left;vertical-align:top}.document th{background:var(--mdp-table-header,#edf2f4)}.document tbody tr:nth-child(odd){background:var(--mdp-table-odd,transparent)}.document tbody tr:nth-child(even){background:var(--mdp-table-even,transparent)}
.document pre{padding:1rem;border:1px solid color-mix(in srgb,var(--code-theme-fg) 22%,transparent);border-radius:8px;background:var(--code-theme-bg);color:var(--code-theme-fg);overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;break-inside:auto}.document pre code{font:inherit;color:inherit}.document :not(pre)>code{padding:.1em .25em;border-radius:4px;background:#f1f3f5}.document .hljs{background:transparent;color:var(--code-theme-fg)}
.document .hljs-keyword,.document .hljs-selector-tag,.document .hljs-literal,.document .hljs-section,.document .hljs-link{color:var(--code-theme-keyword)}.document .hljs-string,.document .hljs-title,.document .hljs-name,.document .hljs-type,.document .hljs-attribute{color:var(--code-theme-string)}.document .hljs-number,.document .hljs-symbol,.document .hljs-bullet,.document .hljs-built_in{color:var(--code-theme-number)}.document .hljs-comment,.document .hljs-quote,.document .hljs-meta{color:var(--code-theme-comment)}.document .hljs-variable,.document .hljs-template-variable,.document .hljs-attr,.document .hljs-selector-id,.document .hljs-selector-class{color:var(--code-theme-accent)}
.document img{max-width:100%;height:auto;display:block;margin:1rem auto}.document .mdp-image-container img{display:inline-block}.document .page-break{break-after:page;page-break-after:always;height:0;column-span:all}.document .mdp-spacer{display:block;width:100%}.document hr{border:0;border-top:1px solid var(--line);margin:2rem 0}.document .mdp-bookmark-anchor{display:inline;scroll-margin-top:28px}.document .mdp-citation{text-decoration:none;font-weight:600}.document .mdp-citation-missing{color:#b42318!important;border-bottom:1px dotted #b42318}.document .mdp-bibliography{margin-top:2rem}.document .mdp-reference-list{display:grid;gap:.75rem;padding-left:1.4rem}.document .mdp-reference-list.numeric{list-style:none;counter-reset:mdp-ref;padding-left:0}.document .mdp-reference-list.numeric>li{counter-increment:mdp-ref;padding-left:2rem;position:relative}.document .mdp-reference-list.numeric>li::before{content:"[" counter(mdp-ref) "]";position:absolute;left:0;color:var(--muted)}.document .mdp-reference-list.author-year{list-style:none;padding-left:0}.document .mdp-reference-list.author-year li{padding-left:1.4rem;text-indent:-1.4rem}
.mdp-custom-text{box-sizing:border-box}${custom}${mathCss}
@media(max-width:1080px){.export-sidebar{position:sticky;top:0;left:auto;bottom:auto;width:auto;margin:12px;border-radius:10px;max-height:38vh}.document{width:calc(100% - 24px);margin:12px;padding:28px 32px}}
@media(max-width:560px){.document{padding:22px}.export-sidebar{max-height:45vh}}
@media print{
${rule}
${marginBoxes}
:root{--ink:#252a2e;--line:#d9dde0;--soft:#f5f6f7;color-scheme:light!important}html,body{background:#fff!important;color:#252a2e!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}.export-sidebar{display:none!important}
.document{margin:0!important;padding:0!important;width:auto!important;min-height:0!important;border:0!important;box-shadow:none!important;background:#fff!important;background-image:none!important;column-count:var(--mdp-print-columns);border-radius:0!important}
.document h1,.document h2,.document h3,.document h4,.document h5{break-after:avoid}.document blockquote{color:#252a2e!important}.document blockquote p{color:inherit!important}.document pre{break-inside:auto!important;page-break-inside:auto!important;overflow:visible!important;max-height:none!important;height:auto!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important;box-decoration-break:clone;-webkit-box-decoration-break:clone}.document pre code,.document pre .hljs{break-inside:auto!important;page-break-inside:auto!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important}.document img,.document blockquote{break-inside:avoid}.document table{break-inside:auto}.document tr{break-inside:avoid}.document .page-break{border:0!important;background:none!important;page-break-after:always;break-after:page;column-span:all}
}
</style></head>
<body>${nav}<main class="document">${enriched.html}</main>
<script>(function(){var links=[].slice.call(document.querySelectorAll('.toc-link[data-target]'));if(!('IntersectionObserver' in window))return;var map=new Map(links.map(function(a){return[a.dataset.target,a]}));var io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){a.classList.remove('active')});var a=map.get(e.target.id);if(a)a.classList.add('active')}})},{rootMargin:'-15% 0px -72% 0px'});map.forEach(function(_,id){var el=document.getElementById(id);if(el)io.observe(el)})})();<\/script></body></html>`;
  }

  window.MDPExport = { safeFilename, downloadBlob, buildStandaloneHtml, enrichHeadings };
})();

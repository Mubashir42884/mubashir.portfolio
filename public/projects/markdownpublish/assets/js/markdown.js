(function () {
  'use strict';

  const SETTINGS_RE = /^<!--\s*MDP-SETTINGS\s+([\s\S]*?)\s*-->\s*/;

  function getDefaultSettings() {
    return { header: '', footer: '', pageNumbers: false };
  }

  function parseDocumentSettings(markdown) {
    const match = String(markdown || '').match(SETTINGS_RE);
    if (!match) return getDefaultSettings();
    try {
      const parsed = JSON.parse(match[1]);
      return {
        header: typeof parsed.header === 'string' ? parsed.header : '',
        footer: typeof parsed.footer === 'string' ? parsed.footer : '',
        pageNumbers: Boolean(parsed.pageNumbers)
      };
    } catch (_) {
      return getDefaultSettings();
    }
  }

  function stripDocumentSettings(markdown) {
    return String(markdown || '').replace(SETTINGS_RE, '');
  }

  function applyDocumentSettings(markdown, settings) {
    const body = stripDocumentSettings(markdown).replace(/^\n+/, '');
    const normalized = {
      header: settings.header || '',
      footer: settings.footer || '',
      pageNumbers: Boolean(settings.pageNumbers)
    };
    const hasAny = normalized.header || normalized.footer || normalized.pageNumbers;
    return hasAny ? `<!-- MDP-SETTINGS ${JSON.stringify(normalized)} -->\n\n${body}` : body;
  }

  function renderMarkdown(markdown) {
    const clean = stripDocumentSettings(markdown);
    if (!clean.trim()) return '<div class="empty-state">Start writing in Markdown. Your formatted document will appear here.</div>';

    if (window.marked && typeof window.marked.setOptions === 'function') {
      window.marked.setOptions({
        gfm: true,
        tables: true,
        breaks: false,
        smartLists: true,
        smartypants: false,
        headerIds: true,
        mangle: false
      });
    }

    const parser = window.marked && (window.marked.parse || window.marked.marked || (typeof window.marked === 'function' ? window.marked : null));
    let html = parser ? parser(clean) : `<pre>${escapeHtml(clean)}</pre>`;
    // Marked preserves raw HTML, which lets the editor support page breaks and custom ordered-list types.
    html = html.replace(/<div class="page-break"><\/div>/g, '<div class="page-break" aria-label="Page break"></div>');
    return html;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.MDPMarkdown = {
    renderMarkdown,
    parseDocumentSettings,
    stripDocumentSettings,
    applyDocumentSettings,
    escapeHtml
  };
})();

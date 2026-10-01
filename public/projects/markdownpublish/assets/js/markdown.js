(function () {
  'use strict';

  const SETTINGS_RE = /^<!--\s*MDP-SETTINGS\s+([\s\S]*?)\s*-->\s*/;

  function normalizeBookmarks(value) {
    if (!Array.isArray(value)) return [];
    const seen = new Set();
    return value.map(item => {
      const source = item && typeof item === 'object' ? item : {};
      const id = String(source.id || '').replace(/[^A-Za-z0-9:_-]/g, '').slice(0, 120);
      const label = String(source.label || '').replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, 160);
      return { id, label };
    }).filter(item => item.id && item.label && !seen.has(item.id) && seen.add(item.id));
  }

  function getDefaultSettings() {
    return {
      header: '',
      footer: '',
      pageNumbers: false,
      layout: null,
      citationMode: 'numeric',
      citationStyle: 'apa',
      citationColor: '#526b5a',
      citations: [],
      bookmarks: []
    };
  }

  function normalizeSettings(parsed) {
    const defaults = getDefaultSettings();
    const refs = window.MDPReferences && typeof window.MDPReferences.normalizeSettings === 'function'
      ? window.MDPReferences.normalizeSettings(parsed || {})
      : { citationMode: 'numeric', citationStyle: 'apa', citationColor: '#526b5a', citations: Array.isArray(parsed && parsed.citations) ? parsed.citations : [] };
    return {
      header: typeof parsed.header === 'string' ? parsed.header : '',
      footer: typeof parsed.footer === 'string' ? parsed.footer : '',
      pageNumbers: Boolean(parsed.pageNumbers),
      layout: parsed.layout && typeof parsed.layout === 'object' ? parsed.layout : null,
      citationMode: refs.citationMode || defaults.citationMode,
      citationStyle: refs.citationStyle || defaults.citationStyle,
      citationColor: refs.citationColor || defaults.citationColor,
      citations: refs.citations || [],
      bookmarks: normalizeBookmarks(parsed.bookmarks)
    };
  }

  function parseDocumentSettings(markdown) {
    const match = String(markdown || '').match(SETTINGS_RE);
    if (!match) return getDefaultSettings();
    try {
      return normalizeSettings(JSON.parse(match[1]));
    } catch (_) {
      return getDefaultSettings();
    }
  }

  function stripDocumentSettings(markdown) {
    return String(markdown || '').replace(SETTINGS_RE, '');
  }

  function applyDocumentSettings(markdown, settings) {
    const body = stripDocumentSettings(markdown).replace(/^\n+/, '');
    const clean = normalizeSettings(settings || {});
    const normalized = {
      header: clean.header || '',
      footer: clean.footer || '',
      pageNumbers: Boolean(clean.pageNumbers),
      ...(clean.layout && typeof clean.layout === 'object' ? { layout: clean.layout } : {}),
      ...(clean.citations.length ? {
        citationMode: clean.citationMode,
        citationStyle: clean.citationStyle,
        citationColor: clean.citationColor,
        citations: clean.citations
      } : {}),
      ...(clean.bookmarks.length ? { bookmarks: clean.bookmarks } : {})
    };
    const hasAny = normalized.header || normalized.footer || normalized.pageNumbers || normalized.layout || clean.citations.length || clean.bookmarks.length;
    return hasAny ? `<!-- MDP-SETTINGS ${JSON.stringify(normalized)} -->\n\n${body}` : body;
  }

  function renderMarkdown(markdown) {
    const settings = parseDocumentSettings(markdown);
    let clean = stripDocumentSettings(markdown);
    if (!clean.trim()) return '<div class="empty-state">Start writing in Markdown. Your formatted document will appear here.</div>';

    if (window.MDPReferences && typeof window.MDPReferences.preprocessMarkdown === 'function') {
      clean = window.MDPReferences.preprocessMarkdown(clean, settings);
    }

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
    escapeHtml,
    getDefaultSettings
  };
})();

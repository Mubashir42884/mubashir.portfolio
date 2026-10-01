(function () {
  'use strict';

  const STORAGE_KEY = 'markdownpublish.document.v2';
  const LEGACY_STORAGE_KEY = 'markdownpublish.document.v1';
  const PREFS_KEY = 'markdownpublish.preferences.v2';
  const LEGACY_PREFS_KEY = 'markdownpublish.preferences.v1';
  const STYLES_KEY = 'markdownpublish.styles.v2';
  const ACTIVE_STYLE_KEY = 'markdownpublish.activeStyle.v2';

  const editor = document.getElementById('markdownEditor');
  const preview = document.getElementById('preview');
  const previewScroll = document.getElementById('previewScroll');
  const titleInput = document.getElementById('documentTitle');
  const saveState = document.getElementById('saveState');
  const wordCount = document.getElementById('wordCount');
  const charCount = document.getElementById('charCount');
  const readingTime = document.getElementById('readingTime');
  const lineCol = document.getElementById('lineCol');
  const toast = document.getElementById('toast');
  const themeLink = document.getElementById('hljsTheme');
  const faviconLink = document.getElementById('faviconLink');
  const themeColorMeta = document.getElementById('themeColorMeta');
  const autosaveIndicator = document.getElementById('autosaveIndicator');
  const activeStyleStatus = document.getElementById('activeStyleStatus');

  const sidebarDrawer = document.getElementById('sidebarDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const stylesList = document.getElementById('stylesList');
  const filesList = document.getElementById('filesList');
  const fileAccessNote = document.getElementById('fileAccessNote');

  const FONT_ALIASES = {
    'lemon milk': "'MDP Lemon Milk', 'LEMON MILK', 'Lemon Milk', Arial, sans-serif",
    'cmu serif': "'MDP CMU Serif', 'CMU Serif', 'Computer Modern', 'Latin Modern Roman', serif",
    'cmu sans serif': "'MDP CMU Sans', 'CMU Sans Serif', 'Computer Modern Sans', Arial, sans-serif",
    'cmu typewriter text': "'MDP CMU Typewriter', 'CMU Typewriter Text', 'Latin Modern Mono', monospace",
    'latin modern roman': "'MDP Latin Modern Roman', 'Latin Modern Roman', 'CMU Serif', serif",
    'latin modern mono': "'MDP Latin Modern Mono', 'Latin Modern Mono', 'CMU Typewriter Text', monospace",
    'quicksand': "'MDP Quicksand', Quicksand, 'Avenir Next', Arial, sans-serif",
    'jetbrains mono': "'MDP JetBrains Mono', 'JetBrains Mono', Consolas, monospace",
    'fira code': "'MDP Fira Code', 'Fira Code', Consolas, monospace",
    'source code pro': "'MDP Source Code Pro', 'Source Code Pro', Consolas, monospace",
    'cascadia code': "'Cascadia Code', 'Cascadia Mono', Consolas, monospace",
    'system mono': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    'system sans': 'Inter, ui-sans-serif, system-ui, sans-serif'
  };

  const DEFAULT_PREFS = {
    theme: 'light',
    editorTheme: 'github',
    editorFontName: 'System Mono',
    previewFontName: 'Georgia',
    editorWidth: '50%',
    autosave: true,
    rememberDocument: true,
    previewMode: 'html',
    tabSize: 2,
    imageWidth: 50,
    codeTheme: 'github-light',
    customCodeTheme: { background:'#1e1e1e', text:'#f4f4f4', keyword:'#ff7ab2', string:'#a8cc8c', number:'#d2a8ff', comment:'#8b949e', accent:'#79c0ff' },
    layout: { pageSize: 'A4', orientation: 'portrait', margins: 'normal', custom: [18, 18, 18, 18], columns: 1 }
  };

  // Legacy saved presets remain loadable; obsolete lineHeight / letterSpacing fields
  // are intentionally replaced by before/after paragraph spacing.
  const STYLE_TARGETS = [
    { key:'h1', label:'Heading H1', size:'2rem', color:'#252a2e', font:'', before:'0px', after:'18px' },
    { key:'h2', label:'Heading H2', size:'1.42rem', color:'#252a2e', font:'', before:'26px', after:'12px' },
    { key:'h3', label:'Heading H3', size:'1.12rem', color:'#252a2e', font:'', before:'20px', after:'10px' },
    { key:'h4', label:'Heading H4', size:'1rem', color:'#252a2e', font:'', before:'16px', after:'8px' },
    { key:'h5', label:'Heading H5', size:'.92rem', color:'#252a2e', font:'', before:'14px', after:'7px' },
    { key:'p', label:'Paragraph', size:'1rem', color:'#252a2e', font:'', before:'0px', after:'16px' },
    { key:'quote', label:'Quotation box', size:'1rem', color:'#5d6468', font:'', before:'18px', after:'18px', background:'#f2f5f1' },
    { key:'code', label:'Code box', size:'.88em', color:'#252a2e', font:'System Mono', before:'18px', after:'18px', background:'#f3f4f5' },
    { key:'header', label:'Page header', size:'9pt', color:'#666666', font:'', before:'0px', after:'0px' },
    { key:'footer', label:'Page footer', size:'9pt', color:'#666666', font:'', before:'0px', after:'0px' }
  ];

  const BUILTIN_STYLE = {
    id: 'builtin-default', name: 'Default Academic', builtin: true,
    targets: Object.fromEntries(STYLE_TARGETS.map(def => [def.key, {
      font: def.font, size: def.size, color: def.color, colorMode: 'auto',
      align: 'left', before: def.before, after: def.after,
      ...(def.background ? { background: def.background, backgroundMode: 'auto' } : {})
    }])),
    table: { density:'normal', width:100, borderEnabled:true, borderStyle:'solid', borderThickness:1, accent:'none' }
  };

  const starterMarkdown = `# Research Report Title

**Author:** Your Name  
**Course / Affiliation:** Department or Institution  
**Date:** ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}

## Abstract

Write a concise summary of the purpose, method, principal findings, and conclusion.

## 1. Introduction

Markdown keeps academic writing lightweight while still supporting structured headings, tables, code, links, images, and LaTeX.

A displayed equation can be written as:

$$
\\hat{y} = \\beta_0 + \\sum_{i=1}^{p} \\beta_i x_i
$$

## 2. Method

> Use block quotations for quoted or emphasized material.

| Variable | Description | Type |
| --- | --- | --- |
| $x_i$ | Predictor | Numeric |
| $y$ | Outcome | Numeric |

### 2.1 Reproducibility notes

\`\`\`python
import numpy as np

rng = np.random.default_rng(42)
print(rng.normal(size=5))
\`\`\`

## 3. Results

1. Report the main finding.
2. Include an effect size or uncertainty estimate when appropriate.
3. Reference figures and tables clearly.

## 4. Discussion

Explain what the results mean, relevant limitations, and implications.

---

## References

1. Add references using the citation style required by your course, journal, or discipline.
`;

  let prefs = loadPrefs();
  let activeStyle = cloneStyle(BUILTIN_STYLE);
  let activeStyleId = localStorage.getItem(ACTIVE_STYLE_KEY) || BUILTIN_STYLE.id;
  let renderTimer = null;
  let saveTimer = null;
  let toastTimer = null;
  let isDragging = false;
  let activeAssetUrls = [];
  let currentHistoryId = null;
  let renderSequence = 0;

  function cloneStyle(style) {
    return JSON.parse(JSON.stringify(style));
  }

  function loadPrefs() {
    let loaded = {};
    try { loaded = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null') || {}; } catch (_) {}
    if (!Object.keys(loaded).length) {
      try {
        const legacy = JSON.parse(localStorage.getItem(LEGACY_PREFS_KEY) || '{}');
        loaded = {
          theme: legacy.theme,
          editorTheme: legacy.editorTheme,
          editorWidth: legacy.editorWidth
        };
      } catch (_) {}
    }
    const result = Object.assign({}, DEFAULT_PREFS, loaded);
    result.layout = window.MDPLayout.normalize(result.layout);
    if (!['github-light','github-dark','monokai-pro','dracula','gruvbox','custom'].includes(result.codeTheme)) result.codeTheme = 'github-light';
    result.customCodeTheme = Object.assign({}, DEFAULT_PREFS.customCodeTheme, result.customCodeTheme || {});
    return result;
  }

  function persistPrefs(extra) {
    prefs = Object.assign({}, prefs, extra || {});
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    syncSettingsUi();
  }

  function sanitizeFontName(value, fallbackKind) {
    const raw = String(value || '').trim();
    if (!raw) return fallbackKind === 'mono' ? FONT_ALIASES['system mono'] : 'Georgia, "Times New Roman", serif';
    const alias = FONT_ALIASES[raw.toLowerCase()];
    if (alias) return alias;
    const safe = raw.replace(/[;{}<>]/g, '').trim();
    if (safe.includes(',')) return safe;
    const escaped = safe.replace(/'/g, "\\'");
    const fallback = fallbackKind === 'mono' ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' : 'Georgia, "Times New Roman", serif';
    return `'${escaped}', ${fallback}`;
  }

  function sanitizeCssLength(value, fallback) {
    const raw = String(value || '').trim();
    return /^(?:0|(?:[0-9]{1,3}(?:\.[0-9]{1,2})?|\.[0-9]{1,2})(?:px|rem|em|pt|%|mm|cm))$/.test(raw) ? raw : fallback;
  }

  function sanitizeLineHeight(value, fallback) {
    const raw = String(value || '').trim();
    return /^(normal|\d*\.?\d+)$/.test(raw) ? raw : fallback;
  }

  function sanitizeColor(value, fallback) {
    const raw = String(value || '').trim();
    return /^#[0-9a-f]{6}$/i.test(raw) ? raw : fallback;
  }

  function sanitizeAlign(value) {
    return ['left', 'center', 'right', 'justify'].includes(value) ? value : 'left';
  }

  function hexToRgba(hex, alpha) {
    const value = String(hex || '').replace('#','');
    if (!/^[0-9a-f]{6}$/i.test(value)) return `rgba(0,0,0,${alpha})`;
    const n = parseInt(value, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
  }

  function tablePalette(accent) {
    const colors = { steelblue:'#4682b4', coral:'#ff7f50', lightgreen:'#90ee90' };
    const base = colors[accent] || null;
    if (!base) return { header:'var(--surface-2)', odd:'transparent', even:'transparent', border:'var(--line)' };
    return {
      header: hexToRgba(base, .78),
      odd: hexToRgba(base, .40),
      even: hexToRgba(base, .60),
      border: base
    };
  }

  function codeThemePreset(theme) {
    const presets = {
      'github-light': { background:'#f6f8fa', text:'#24292f', keyword:'#cf222e', string:'#0a3069', number:'#0550ae', comment:'#6e7781', accent:'#8250df' },
      'github-dark': { background:'#0d1117', text:'#c9d1d9', keyword:'#ff7b72', string:'#a5d6ff', number:'#79c0ff', comment:'#8b949e', accent:'#d2a8ff' },
      'monokai-pro': { background:'#2d2a2e', text:'#fcfcfa', keyword:'#ff6188', string:'#ffd866', number:'#ab9df2', comment:'#727072', accent:'#78dce8' },
      'dracula': { background:'#282a36', text:'#f8f8f2', keyword:'#ff79c6', string:'#f1fa8c', number:'#bd93f9', comment:'#6272a4', accent:'#8be9fd' },
      'gruvbox': { background:'#282828', text:'#ebdbb2', keyword:'#fb4934', string:'#b8bb26', number:'#d3869b', comment:'#928374', accent:'#83a598' }
    };
    return presets[theme] || presets['github-light'];
  }

  function normalizeStyle(style) {
    const normalized = cloneStyle(BUILTIN_STYLE);
    normalized.id = style && style.id ? style.id : `style-${Date.now()}`;
    normalized.name = String(style && style.name ? style.name : 'Custom Style').trim().slice(0,80) || 'Custom Style';
    normalized.builtin = Boolean(style && style.builtin);
    STYLE_TARGETS.forEach(def => {
      const source = style && style.targets && style.targets[def.key] ? style.targets[def.key] : {};
      normalized.targets[def.key] = {
        font: String(source.font || def.font || '').trim().slice(0,120),
        size: sanitizeCssLength(source.size, def.size),
        color: sanitizeColor(source.color, def.color),
        colorMode: ['auto','custom'].includes(source.colorMode) ? source.colorMode : (style && style.builtin ? 'auto' : source.color ? 'custom' : 'auto'),
        align: sanitizeAlign(source.align),
        before: sanitizeCssLength(source.before, def.before),
        after: sanitizeCssLength(source.after, def.after),
        ...(def.background ? { background: sanitizeColor(source.background, def.background), backgroundMode: ['auto','custom'].includes(source.backgroundMode) ? source.backgroundMode : (style && style.builtin ? 'auto' : source.background ? 'custom' : 'auto') } : {})
      };
    });
    const table = style && style.table && typeof style.table === 'object' ? style.table : {};
    normalized.table = {
      density: ['compact','normal','wide'].includes(table.density) ? table.density : 'normal',
      width: [35,60,100].includes(Number(table.width)) ? Number(table.width) : 100,
      borderEnabled: table.borderEnabled !== false,
      borderStyle: ['solid','dashed','dotted'].includes(table.borderStyle) ? table.borderStyle : 'solid',
      borderThickness: [1,2,3].includes(Number(table.borderThickness)) ? Number(table.borderThickness) : 1,
      accent: ['none','steelblue','coral','lightgreen'].includes(table.accent) ? table.accent : 'none'
    };
    return normalized;
  }

  function getCustomStyles() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STYLES_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.map(normalizeStyle) : [];
    } catch (_) {
      return [];
    }
  }

  function saveCustomStyles(styles) {
    localStorage.setItem(STYLES_KEY, JSON.stringify(styles));
  }

  function findStyle(id) {
    if (!id || id === BUILTIN_STYLE.id) return cloneStyle(BUILTIN_STYLE);
    return getCustomStyles().find(style => style.id === id) || cloneStyle(BUILTIN_STYLE);
  }

  function applyStylePreset(style, options) {
    const clean = normalizeStyle(style || BUILTIN_STYLE);
    // Apply on BODY, not HTML: dark-mode tokens live on body; computing var(--ink)
    // on the root previously froze the light color and made dark text invisible.
    const scope = document.body;
    STYLE_TARGETS.forEach(def => {
      const t = clean.targets[def.key];
      scope.style.setProperty(`--mdp-${def.key}-font`, t.font ? sanitizeFontName(t.font, def.key === 'code' ? 'mono' : 'serif') : (def.key === 'code' ? 'var(--editor-font)' : 'var(--preview-font)'));
      scope.style.setProperty(`--mdp-${def.key}-size`, t.size);
      const autoColor = def.key === 'code' ? 'var(--code-theme-fg,var(--ink))' : (['quote','header','footer'].includes(def.key) ? 'var(--muted)' : 'var(--ink)');
      scope.style.setProperty(`--mdp-${def.key}-color`, t.colorMode === 'auto' ? autoColor : t.color);
      scope.style.setProperty(`--mdp-${def.key}-align`, t.align);
      scope.style.setProperty(`--mdp-${def.key}-before`, t.before);
      scope.style.setProperty(`--mdp-${def.key}-after`, t.after);
      if (def.background) {
        const autoBackground = def.key === 'quote' ? 'var(--accent-soft)' : 'var(--code-theme-bg,var(--surface-2))';
        scope.style.setProperty(`--mdp-${def.key}-bg`, t.backgroundMode === 'auto' ? autoBackground : t.background);
      }
    });
    const density = { compact:{ pad:'.32rem .44rem', line:'1.3', margin:'.85rem' }, normal:{ pad:'.55rem .65rem', line:'1.5', margin:'1.3rem' }, wide:{ pad:'.82rem .9rem', line:'1.75', margin:'1.7rem' } }[clean.table.density];
    const palette = tablePalette(clean.table.accent);
    scope.style.setProperty('--mdp-table-pad', density.pad);
    scope.style.setProperty('--mdp-table-line-height', density.line);
    scope.style.setProperty('--mdp-table-margin', density.margin);
    scope.style.setProperty('--mdp-table-width', `${clean.table.width}%`);
    scope.style.setProperty('--mdp-table-border-style', clean.table.borderEnabled ? clean.table.borderStyle : 'none');
    scope.style.setProperty('--mdp-table-border-width', clean.table.borderEnabled ? `${clean.table.borderThickness}px` : '0px');
    scope.style.setProperty('--mdp-table-border-color', palette.border);
    scope.style.setProperty('--mdp-table-header', palette.header);
    scope.style.setProperty('--mdp-table-odd', palette.odd);
    scope.style.setProperty('--mdp-table-even', palette.even);
    activeStyle = clean;
    if (!options || options.persist !== false) {
      activeStyleId = clean.id;
      localStorage.setItem(ACTIVE_STYLE_KEY, clean.id);
    }
    activeStyleStatus.textContent = options && options.unsaved ? `${clean.name} (unsaved)` : clean.name;
    renderStylesList();
    // Header/footer typography is part of the paged-media rule, so refresh it
    // whenever a style preset changes.
    if (editor && window.MDPLayout) {
      const settings = window.MDPMarkdown.parseDocumentSettings(editor.value || '');
      applyPageLayout(settings.layout || prefs.layout);
    }
  }

  function buildStyleCss(style) {
    const clean = normalizeStyle(style || BUILTIN_STYLE);
    const selectors = {h1:'h1',h2:'h2',h3:'h3',h4:'h4',h5:'h5',p:'p',quote:'blockquote',code:'pre, .document :not(pre) > code',header:'.print-header',footer:'.print-footer'};
    const targetCss = STYLE_TARGETS.map(def => {
      const t = clean.targets[def.key];
      const font = t.font ? sanitizeFontName(t.font, def.key === 'code' ? 'mono' : 'serif') : (def.key === 'code' ? sanitizeFontName(prefs.editorFontName, 'mono') : sanitizeFontName(prefs.previewFontName, 'serif'));
      const color = t.colorMode === 'auto' ? (def.key === 'code' ? 'var(--code-theme-fg,#252a2e)' : (['quote','header','footer'].includes(def.key) ? '#52606b' : '#252a2e')) : t.color;
      const autoBg = def.key === 'quote' ? '#f2f5f1' : 'var(--code-theme-bg,#f3f4f5)';
      const extra = def.background ? `background-color:${t.backgroundMode === 'auto' ? autoBg : t.background};` : '';
      const selector = def.key === 'header' || def.key === 'footer' ? selectors[def.key] : `.document ${selectors[def.key]}`;
      return `${selector}{font-family:${font};font-size:${t.size};color:${color};text-align:${t.align};margin-block-start:${t.before};margin-block-end:${t.after};${extra}}`;
    }).join('\n');
    const density = { compact:{ pad:'.32rem .44rem', line:'1.3', margin:'.85rem' }, normal:{ pad:'.55rem .65rem', line:'1.5', margin:'1.3rem' }, wide:{ pad:'.82rem .9rem', line:'1.75', margin:'1.7rem' } }[clean.table.density];
    const palette = tablePalette(clean.table.accent);
    const borderStyle = clean.table.borderEnabled ? clean.table.borderStyle : 'none';
    const borderWidth = clean.table.borderEnabled ? `${clean.table.borderThickness}px` : '0';
    const tableCss = `.document table{width:${clean.table.width}%;margin:${density.margin} auto;line-height:${density.line};}.document th,.document td{padding:${density.pad};border:${borderWidth} ${borderStyle} ${palette.border};}.document th{background:${palette.header};}.document tbody tr:nth-child(odd){background:${palette.odd};}.document tbody tr:nth-child(even){background:${palette.even};}`;
    return `${targetCss}\n${tableCss}\n.document blockquote p{font:inherit;color:inherit;text-align:inherit;margin:0;}\n.document pre code{font:inherit;color:inherit;}`;
  }

  function applyFontPreferences() {
    document.documentElement.style.setProperty('--editor-font', sanitizeFontName(prefs.editorFontName, 'mono'));
    document.documentElement.style.setProperty('--preview-font', sanitizeFontName(prefs.previewFontName, 'serif'));
    document.getElementById('editorFontInput').value = prefs.editorFontName;
    document.getElementById('previewFontInput').value = prefs.previewFontName;
  }

  function loadState() {
    document.body.dataset.theme = prefs.theme;
    document.body.dataset.editorTheme = prefs.editorTheme;
    document.getElementById('editorThemeSelect').value = prefs.editorTheme;
    document.getElementById('codeThemeSelect').value = prefs.codeTheme;
    document.getElementById('workspace').style.setProperty('--editor-width', prefs.editorWidth);
    applyFontPreferences();

    if (prefs.rememberDocument) {
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (_) {}
      if (!saved) {
        try { saved = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || 'null'); } catch (_) {}
      }
      if (saved && typeof saved.markdown === 'string') {
        editor.value = saved.markdown;
        titleInput.value = saved.title || 'Untitled Report';
      } else {
        editor.value = starterMarkdown;
      }
    } else {
      editor.value = starterMarkdown;
    }

    const documentLayout = window.MDPMarkdown.parseDocumentSettings(editor.value).layout;
    if (documentLayout) prefs.layout = window.MDPLayout.normalize(documentLayout);
    applyPageLayout(prefs.layout);
    activeStyle = findStyle(activeStyleId);
    activeStyleId = activeStyle.id;
    applyStylePreset(activeStyle);
    setPreviewMode(prefs.previewMode, false);
    updateThemeButton();
    updateHighlightTheme();
    syncSettingsUi();
    updateFileAccessNote();
  }

  function persistDocument() {
    if (!prefs.autosave) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      title: titleInput.value.trim() || 'Untitled Report',
      markdown: editor.value,
      updatedAt: new Date().toISOString()
    }));
    saveState.textContent = 'Saved locally';
  }

  function scheduleSave() {
    if (!prefs.autosave) {
      saveState.textContent = 'Autosave off';
      return;
    }
    saveState.textContent = 'Saving…';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persistDocument, 500);
  }

  function releaseAssetUrls() {
    activeAssetUrls.forEach(url => URL.revokeObjectURL(url));
    activeAssetUrls = [];
  }

  async function resolveCachedImages(container, portable) {
    const images = Array.from(container.querySelectorAll('img[data-mdp-asset]'));
    for (const image of images) {
      const id = image.dataset.mdpAsset;
      try {
        const asset = await window.MDPStorage.getAsset(id);
        if (!asset || !asset.blob) throw new Error('missing');
        if (portable) {
          image.src = await window.MDPStorage.assetToDataUrl(id);
        } else {
          const url = URL.createObjectURL(asset.blob);
          activeAssetUrls.push(url);
          image.src = url;
        }
      } catch (_) {
        const missing = document.createElement('div');
        missing.className = 'cached-image-missing';
        missing.textContent = `Cached image unavailable: ${id}`;
        image.replaceWith(missing);
      }
    }
  }

  function applyHighlighting(container) {
    if (!window.hljs) return;
    (container || preview).querySelectorAll('pre code').forEach(block => {
      try {
        if (typeof window.hljs.highlightElement === 'function') window.hljs.highlightElement(block);
        else if (typeof window.hljs.highlightBlock === 'function') window.hljs.highlightBlock(block);
      } catch (_) {}
    });
  }

  function typesetMath(container) {
    if (!(window.MathJax && window.MathJax.Hub)) return Promise.resolve();
    return new Promise(resolve => {
      try { window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, container], resolve); }
      catch (_) { resolve(); }
    });
  }

  async function render() {
    const sequence = ++renderSequence;
    const settings = window.MDPMarkdown.parseDocumentSettings(editor.value);
    releaseAssetUrls();
    preview.innerHTML = window.MDPMarkdown.renderMarkdown(editor.value);
    await resolveCachedImages(preview, false);
    if (sequence !== renderSequence) return;
    applyHighlighting(preview);
    applyPrintSettings(settings);
    await typesetMath(preview);
    updateStats();
    updateCursorStatus();
  }

  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => { render(); }, 90);
  }

  function applyPrintSettings(settings) {
    // Running headers, footers and page numbers are generated inside @page margin
    // boxes by applyPageLayout(). They are intentionally NOT fixed DOM elements:
    // fixed print overlays can cover the final lines of a page and can make
    // counter(page) render as 0 in Chromium.
    applyPageLayout(settings.layout || prefs.layout);
  }

  function updateStats() {
    const body = window.MDPMarkdown.stripDocumentSettings(editor.value);
    const normalized = body.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ').replace(/<[^>]+>/g, ' ');
    const words = (normalized.match(/\b[\p{L}\p{N}'’-]+\b/gu) || []).length;
    const chars = body.length;
    const minutes = words ? Math.max(1, Math.ceil(words / 220)) : 0;
    wordCount.textContent = `${words.toLocaleString()} ${words === 1 ? 'word' : 'words'}`;
    charCount.textContent = `${chars.toLocaleString()} ${chars === 1 ? 'character' : 'characters'}`;
    readingTime.textContent = `${minutes} min read`;
  }

  function updateCursorStatus() {
    const before = editor.value.slice(0, editor.selectionStart);
    const lines = before.split('\n');
    lineCol.textContent = `Ln ${lines.length}, Col ${lines[lines.length - 1].length + 1}`;
  }

  function showToast(message, duration) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), duration || 2600);
  }

  function insertText(before, after, placeholder) {
    const suffix = after || '';
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.slice(start, end);
    const middle = selected || placeholder || '';
    editor.setRangeText(`${before}${middle}${suffix}`, start, end, 'end');
    const newStart = start + before.length;
    const newEnd = newStart + middle.length;
    editor.focus();
    if (!selected && middle) editor.setSelectionRange(newStart, newEnd);
    handleEditorChange();
  }

  function prefixLines(prefix, ordered) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.slice(start, end) || 'List item';
    const lines = selected.split('\n');
    const out = lines.map((line, i) => `${ordered ? `${i + 1}.` : prefix} ${line.replace(/^\s*(?:[-*+] |\d+\. )/, '')}`).join('\n');
    editor.setRangeText(out, start, end, 'select');
    editor.focus();
    handleEditorChange();
  }

  function heading(level) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.slice(start, end) || 'Heading';
    const prefix = '#'.repeat(level) + ' ';
    const out = selected.split('\n').map(line => prefix + line.replace(/^#{1,6}\s+/, '')).join('\n');
    editor.setRangeText(out, start, end, 'select');
    editor.focus();
    handleEditorChange();
  }

  function customOrderedList(type) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.slice(start, end) || 'First item\nSecond item\nThird item';
    const items = selected.split('\n').filter(Boolean).map(line => `  <li>${window.MDPMarkdown.escapeHtml(line.replace(/^\s*(?:[-*+] |\d+\. )/, ''))}</li>`).join('\n');
    editor.setRangeText(`<ol type="${type}">\n${items}\n</ol>`, start, end, 'select');
    editor.focus();
    handleEditorChange();
  }

  function insertCodeBlock() {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.slice(start, end) || 'your code here';
    editor.setRangeText(`\n\`\`\`text\n${selected}\n\`\`\`\n`, start, end, 'select');
    editor.focus();
    handleEditorChange();
  }

  function handleToolAction(action) {
    switch (action) {
      case 'bold': insertText('**', '**', 'bold text'); break;
      case 'italic': insertText('*', '*', 'italic text'); break;
      case 'quote': prefixLines('>', false); break;
      case 'inlinecode': insertText('`', '`', 'text'); break;
      case 'bullets': prefixLines('-', false); break;
      case 'numbers': prefixLines('', true); break;
      case 'alpha': customOrderedList('a'); break;
      case 'roman': customOrderedList('i'); break;
      case 'h1': heading(1); break;
      case 'h2': heading(2); break;
      case 'h3': heading(3); break;
      case 'h4': heading(4); break;
      case 'h5': heading(5); break;
      case 'link': {
        const text = editor.value.slice(editor.selectionStart, editor.selectionEnd) || 'link text';
        const url = window.prompt('Link URL:', 'https://');
        if (url) insertText('[', `](${url})`, text);
        break;
      }
      case 'code': insertCodeBlock(); break;
      case 'hr': insertText('\n\n---\n\n'); break;
      case 'pagebreak': insertText('\n\n<div class="page-break"></div>\n\n'); break;
      case 'equation': openEquationDialog(); break;
      case 'table': document.getElementById('tableDialog').showModal(); break;
      case 'headerfooter': openHeaderFooterDialog(); break;
      case 'image': openImageDialog(); break;
      case 'spacing': document.getElementById('spacingDialog').showModal(); break;
      case 'styleStudio': openStyleStudio(activeStyleId === BUILTIN_STYLE.id ? null : activeStyleId); break;
      case 'customtext': openInlineStyleDialog(); break;
      case 'citation': openCitationManager(); break;
      case 'bookmark': openBookmarkManager(); break;
    }
  }

  function openEquationDialog() {
    document.getElementById('equationInput').value = editor.value.slice(editor.selectionStart, editor.selectionEnd) || 'E = mc^2';
    document.getElementById('equationDialog').showModal();
    setTimeout(() => document.getElementById('equationInput').focus(), 0);
  }

  function openHeaderFooterDialog() {
    const settings = window.MDPMarkdown.parseDocumentSettings(editor.value);
    document.getElementById('headerTextInput').value = settings.header;
    document.getElementById('footerTextInput').value = settings.footer;
    document.getElementById('pageNumbersInput').checked = settings.pageNumbers;
    document.getElementById('headerFooterDialog').showModal();
  }

  function openImageDialog() {
    document.getElementById('imageUrlInput').value = '';
    document.getElementById('imageAltInput').value = '';
    document.getElementById('imageDeviceInput').value = '';
    document.getElementById('imageWidthInput').value = prefs.imageWidth;
    document.querySelector('input[name="imageSource"][value="url"]').checked = true;
    updateImageSourceFields();
    document.getElementById('imageDialog').showModal();
  }

  function updateImageSourceFields() {
    const source = document.querySelector('input[name="imageSource"]:checked').value;
    document.getElementById('imageUrlFields').hidden = source !== 'url';
    document.getElementById('imageDeviceFields').hidden = source !== 'device';
  }

  function handleEditorChange() {
    scheduleRender();
    scheduleSave();
  }

  async function saveTextWithPicker(content, filename, mime, extension, successMessage) {
    try {
      const result = await window.MDPStorage.saveTextAs(content, filename, mime, extension);
      if (result.mode === 'download') {
        window.MDPExport.downloadBlob(content, `${mime};charset=utf-8`, filename);
        showToast(`${successMessage} Your browser does not support the Save As picker, so the file was downloaded.`);
      } else {
        showToast(successMessage);
      }
      return true;
    } catch (error) {
      if (error && error.name === 'AbortError') return false;
      showToast(`Could not save file: ${error.message || error}`);
      return false;
    }
  }

  async function saveMarkdown(markdown, title) {
    const text = typeof markdown === 'string' ? markdown : editor.value;
    const docTitle = title || titleInput.value;
    if (typeof markdown !== 'string') persistDocument();
    const filename = window.MDPExport.safeFilename(docTitle, 'md');
    const saved = await saveTextWithPicker(text, filename, 'text/markdown', '.md', 'Markdown saved.');
    if (saved && text.includes('data-mdp-asset=')) {
      showToast('Markdown saved. Cached image references remain linked to this browser; Export HTML for a portable image-embedded copy.', 5200);
    }
  }

  function getMathStyles() {
    const style = document.getElementById('MathJax_HTML-CSS_styles');
    return style ? style.textContent : '';
  }

  async function renderMarkdownForExport(markdown) {
    const holder = document.createElement('div');
    holder.className = 'preview-document export-render-holder';
    holder.style.position = 'fixed';
    holder.style.left = '-100000px';
    holder.style.top = '0';
    holder.style.width = '1120px';
    holder.style.pointerEvents = 'none';
    holder.innerHTML = window.MDPMarkdown.renderMarkdown(markdown);
    document.body.appendChild(holder);
    await resolveCachedImages(holder, true);
    applyHighlighting(holder);
    await typesetMath(holder);
    const html = holder.innerHTML;
    holder.remove();
    return html;
  }

  async function buildPortableHtml(markdown, title) {
    const settings = window.MDPMarkdown.parseDocumentSettings(markdown);
    const bodyHtml = await renderMarkdownForExport(markdown);
    return window.MDPExport.buildStandaloneHtml({
      title,
      bodyHtml,
      previewFont: sanitizeFontName(prefs.previewFontName, 'serif'),
      header: settings.header,
      footer: settings.footer,
      pageNumbers: settings.pageNumbers,
      mathStyles: getMathStyles(),
      customCss: buildStyleCss(activeStyle),
      pageLayout: window.MDPLayout.normalize(window.MDPMarkdown.parseDocumentSettings(markdown).layout || prefs.layout),
      headerStyle: pageChromeStyle('header'),
      footerStyle: pageChromeStyle('footer'),
      codeTheme: prefs.codeTheme,
      customCodeTheme: prefs.customCodeTheme,
      bookmarks: settings.bookmarks
    });
  }

  async function saveHtml(markdown, title, preparedHandle) {
    const source = typeof markdown === 'string' ? markdown : editor.value;
    const docTitle = title || titleInput.value;
    const filename = window.MDPExport.safeFilename(docTitle, 'html');
    let handle = preparedHandle || null;
    try {
      // Ask for the destination before asynchronous MathJax/image rendering so
      // Chromium's user-activation requirement for showSaveFilePicker is preserved.
      if (!handle && typeof window.showSaveFilePicker === 'function') {
        handle = await window.MDPStorage.createSaveHandle(filename, 'text/html', '.html');
      }
      const html = await buildPortableHtml(source, docTitle);
      if (handle) {
        await window.MDPStorage.writeTextToHandle(handle, html, 'text/html');
        showToast('Standalone HTML saved.');
      } else {
        window.MDPExport.downloadBlob(html, 'text/html;charset=utf-8', filename);
        showToast('Standalone HTML downloaded. This browser does not support the Save As picker.');
      }
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      showToast(`Could not export HTML: ${error.message || error}`);
    }
  }

  async function copyHtml() {
    try {
      const html = await renderMarkdownForExport(editor.value);
      await navigator.clipboard.writeText(html);
      showToast('Rendered HTML copied.');
    } catch (_) {
      showToast('Clipboard access was not available.');
    }
  }

  function toggleTheme() {
    const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  function setTheme(theme) {
    document.body.dataset.theme = theme === 'dark' ? 'dark' : 'light';
    persistPrefs({ theme: document.body.dataset.theme });
    updateThemeButton();
    updateHighlightTheme();
  }

  function updateThemeButton() {
    const isDark = document.body.dataset.theme === 'dark';
    document.getElementById('themeToggleBtn').textContent = isDark ? '☀' : '☾';
    if (faviconLink) faviconLink.href = isDark ? 'assets/images/markdownpublish-icon-dark.svg' : 'assets/images/favicon.svg';
    if (themeColorMeta) themeColorMeta.content = isDark ? '#1C1714' : '#F97316';
  }

  function applyCustomCodeThemeVars() {
    const custom = Object.assign({}, DEFAULT_PREFS.customCodeTheme, prefs.customCodeTheme || {});
    const map = {
      background:'--custom-code-bg', text:'--custom-code-fg', keyword:'--custom-code-keyword',
      string:'--custom-code-string', number:'--custom-code-number', comment:'--custom-code-comment', accent:'--custom-code-accent'
    };
    Object.entries(map).forEach(([key, variable]) => document.body.style.setProperty(variable, sanitizeColor(custom[key], DEFAULT_PREFS.customCodeTheme[key])));
  }

  function updateHighlightTheme() {
    const configured = ['github-light','github-dark','monokai-pro','dracula','gruvbox','custom'].includes(prefs.codeTheme) ? prefs.codeTheme : 'github-light';
    const customBg = sanitizeColor((prefs.customCodeTheme || {}).background, DEFAULT_PREFS.customCodeTheme.background).slice(1);
    const rgb = parseInt(customBg, 16);
    const customLuma = (((rgb >> 16) & 255) * 0.2126 + ((rgb >> 8) & 255) * 0.7152 + (rgb & 255) * 0.0722) / 255;
    const isDark = ['github-dark','monokai-pro','dracula','gruvbox'].includes(configured) || (configured === 'custom' && customLuma < 0.58);
    themeLink.href = isDark ? 'vendor/highlight/atom-one-dark.min.css' : 'vendor/highlight/atom-one-light.min.css';
    document.body.dataset.codeTheme = configured;
    document.getElementById('codeThemeSelect').value = configured;
    const settingsCodeTheme = document.getElementById('settingsCodeTheme');
    if (settingsCodeTheme) settingsCodeTheme.value = configured;
    applyCustomCodeThemeVars();
    // Re-apply styles so auto code foreground/background follow the selected theme.
    if (activeStyle && activeStyle.targets) applyStylePreset(activeStyle, { persist:false });
  }

  function setPreviewMode(mode, persist) {
    const pdf = mode === 'pdf';
    previewScroll.classList.toggle('pdf-mode', pdf);
    document.getElementById('htmlModeBtn').classList.toggle('active', !pdf);
    document.getElementById('pdfModeBtn').classList.toggle('active', pdf);
    if (persist !== false) persistPrefs({ previewMode: pdf ? 'pdf' : 'html' });
  }

  function newDocument() {
    const hasMeaningfulContent = window.MDPMarkdown.stripDocumentSettings(editor.value).trim().length > 0;
    if (hasMeaningfulContent && !window.confirm('Start a new document? Your current draft may already be autosaved locally.')) return;
    titleInput.value = 'Untitled Report';
    editor.value = '# Untitled Report\n\nStart writing here.\n';
    currentHistoryId = null;
    handleEditorChange();
    editor.focus();
  }

  async function applyOpenedFile(text, name, historyId) {
    editor.value = String(text || '');
    titleInput.value = String(name || 'Untitled').replace(/\.(md|markdown|txt)$/i, '') || 'Untitled Report';
    currentHistoryId = historyId || null;
    const docLayout = window.MDPMarkdown.parseDocumentSettings(editor.value).layout;
    if (docLayout) { prefs.layout = window.MDPLayout.normalize(docLayout); persistPrefs({layout:prefs.layout}); }
    applyPageLayout(prefs.layout);
    handleEditorChange();
    await renderFilesList();
  }

  async function openFileSmart() {
    if (window.MDPStorage.supportsFileSystemAccess()) {
      try {
        const result = await window.MDPStorage.pickMarkdownFile();
        if (!result) return;
        await applyOpenedFile(result.text, result.file.name, result.entry.id);
        showToast(`Opened ${result.file.name}`);
        return;
      } catch (error) {
        if (error && error.name === 'AbortError') return;
        showToast(`Could not open file: ${error.message || error}`);
        return;
      }
    }
    document.getElementById('openFileInput').click();
  }

  function openMarkdownFallback(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const entry = await window.MDPStorage.upsertFileHistory({
        name: file.name,
        lastModified: file.lastModified,
        lastOpened: new Date().toISOString(),
        handle: null,
        hasPersistentHandle: false
      });
      await applyOpenedFile(String(reader.result || ''), file.name, entry.id);
      showToast(`Opened ${file.name}. This browser did not expose a persistent file handle.`);
    };
    reader.onerror = () => showToast('Could not read that file.');
    reader.readAsText(file);
  }

  async function openHistoryFile(id) {
    try {
      const result = await window.MDPStorage.readHistoryFile(id);
      await applyOpenedFile(result.text, result.file.name, id);
      closeSidebar();
      showToast(`Opened ${result.file.name}`);
    } catch (error) {
      showToast(error.message || 'The file is deleted/moved/renamed from the local path.', 4200);
    }
  }

  function insertTable() {
    const cols = Math.max(1, Math.min(12, Number(document.getElementById('tableCols').value) || 3));
    const rows = Math.max(1, Math.min(30, Number(document.getElementById('tableRows').value) || 4));
    const header = `| ${Array.from({ length: cols }, (_, i) => `Column ${i + 1}`).join(' | ')} |`;
    const divider = `| ${Array.from({ length: cols }, () => '---').join(' | ')} |`;
    const row = `| ${Array.from({ length: cols }, () => ' ').join(' | ')} |`;
    insertText(`\n${header}\n${divider}\n${Array.from({ length: rows }, () => row).join('\n')}\n`);
  }

  function insertEquation() {
    const value = document.getElementById('equationInput').value.trim() || 'E = mc^2';
    const display = document.getElementById('displayEquation').checked;
    insertText(display ? `\n\n$$\n${value}\n$$\n\n` : `$${value}$`);
  }

  function saveHeaderFooterSettings() {
    const settings = window.MDPMarkdown.parseDocumentSettings(editor.value);
    settings.header = document.getElementById('headerTextInput').value.trim();
    settings.footer = document.getElementById('footerTextInput').value.trim();
    settings.pageNumbers = document.getElementById('pageNumbersInput').checked;
    settings.layout = settings.layout || prefs.layout;
    const oldStart = editor.selectionStart;
    editor.value = window.MDPMarkdown.applyDocumentSettings(editor.value, settings);
    editor.setSelectionRange(Math.min(oldStart, editor.value.length), Math.min(oldStart, editor.value.length));
    handleEditorChange();
    showToast('Print header/footer settings applied.');
  }

  async function insertImage() {
    const source = document.querySelector('input[name="imageSource"]:checked').value;
    const width = Math.max(10, Math.min(100, Number(document.getElementById('imageWidthInput').value) || prefs.imageWidth));
    const altRaw = document.getElementById('imageAltInput').value.trim() || 'Image';
    const alt = window.MDPMarkdown.escapeHtml(altRaw);
    let src = '';
    let assetAttr = '';

    if (source === 'url') {
      const url = document.getElementById('imageUrlInput').value.trim();
      if (!url) { showToast('Enter an image URL.'); return false; }
      try {
        const parsed = new URL(url, window.location.href);
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Only HTTP/HTTPS image URLs are supported.');
        src = window.MDPMarkdown.escapeHtml(parsed.href);
      } catch (error) {
        showToast(error.message || 'Enter a valid image URL.');
        return false;
      }
    } else {
      const file = document.getElementById('imageDeviceInput').files[0];
      if (!file) { showToast('Choose an image file from your device.'); return false; }
      try {
        const asset = await window.MDPStorage.cacheImage(file);
        src = `mdp-asset://${asset.id}`;
        assetAttr = ` data-mdp-asset="${asset.id}"`;
      } catch (error) {
        showToast(error.message || 'Could not cache the image.');
        return false;
      }
    }

    const html = `\n<div class="mdp-image-container" style="text-align:center;"><img src="${src}"${assetAttr} alt="${alt}" style="width:${width}%;max-width:100%;height:auto;display:inline-block;"></div>\n`;
    insertText(html);
    showToast(source === 'device' ? 'Image cached locally and inserted with a short asset reference.' : 'Image URL inserted.');
    return true;
  }

  function insertSpacing() {
    const value = Math.max(1, Math.min(500, Number(document.getElementById('spacingValue').value) || 24));
    const unit = ['px', 'rem', 'em', 'mm'].includes(document.getElementById('spacingUnit').value) ? document.getElementById('spacingUnit').value : 'px';
    insertText(`\n<div class="mdp-spacer" style="height:${value}${unit};" aria-hidden="true"></div>\n`);
  }

  function buildStyleStudio() {
    const container = document.getElementById('styleStudioFields');
    container.innerHTML = STYLE_TARGETS.map(def => `
      <section class="style-target-card" data-style-target="${def.key}">
        <h3>${def.label}</h3>
        <div class="style-controls-grid">
          <label>Font<input type="text" data-field="font" list="fontSuggestions" placeholder="Inherit preview font"></label>
          <label>Size<input type="text" data-field="size" placeholder="${def.size}"></label>
          <label>Text color<input type="color" data-field="color"></label>
          <label class="check-row">Auto text color<input type="checkbox" data-field="autoColor"></label>
          <label>Alignment<select data-field="align"><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option><option value="justify">Justify</option></select></label>
          <label>Space before<input type="text" data-field="before" placeholder="${def.before}" title="Space before this element, e.g. 12px"></label>
          <label>Space after<input type="text" data-field="after" placeholder="${def.after}" title="Space after this element, e.g. 12px"></label>
          ${def.background ? '<label>Box color<input type="color" data-field="background"></label><label class="check-row">Auto box color<input type="checkbox" data-field="autoBackground"></label>' : ''}
        </div>
      </section>`).join('');
  }

  function populateStyleStudio(style, editingId) {
    const clean = normalizeStyle(style || activeStyle || BUILTIN_STYLE);
    document.getElementById('styleNameInput').value = clean.builtin ? '' : clean.name;
    document.getElementById('styleEditingId').value = editingId || '';
    STYLE_TARGETS.forEach(def => {
      const card = document.querySelector(`[data-style-target="${def.key}"]`);
      const t = clean.targets[def.key];
      for (const field of ['font','size','color','align','before','after']) card.querySelector(`[data-field="${field}"]`).value = t[field];
      card.querySelector('[data-field="autoColor"]').checked = t.colorMode === 'auto';
      card.querySelector('[data-field="color"]').disabled = t.colorMode === 'auto';
      if (def.background) {
        card.querySelector('[data-field="background"]').value = t.background;
        card.querySelector('[data-field="autoBackground"]').checked = t.backgroundMode === 'auto';
        card.querySelector('[data-field="background"]').disabled = t.backgroundMode === 'auto';
      }
    });
    document.getElementById('tableDensity').value = clean.table.density;
    document.getElementById('tableWidth').value = String(clean.table.width);
    document.getElementById('tableBorderEnabled').checked = clean.table.borderEnabled;
    document.getElementById('tableBorderStyle').value = clean.table.borderStyle;
    document.getElementById('tableBorderThickness').value = String(clean.table.borderThickness);
    document.getElementById('tableAccent').value = clean.table.accent;
    const scroll = document.getElementById('styleStudioScroll');
    if (scroll) scroll.scrollTop = 0;
  }

  function collectStyleStudio() {
    const editingId = document.getElementById('styleEditingId').value;
    const style = {
      id: editingId || `style-${Date.now()}-${Math.random().toString(16).slice(2,8)}`,
      name: document.getElementById('styleNameInput').value.trim() || 'Custom Style',
      builtin: false,
      targets: {},
      table: {
        density: document.getElementById('tableDensity').value,
        width: Number(document.getElementById('tableWidth').value),
        borderEnabled: document.getElementById('tableBorderEnabled').checked,
        borderStyle: document.getElementById('tableBorderStyle').value,
        borderThickness: Number(document.getElementById('tableBorderThickness').value),
        accent: document.getElementById('tableAccent').value
      }
    };
    STYLE_TARGETS.forEach(def => {
      const card = document.querySelector(`[data-style-target="${def.key}"]`);
      const t = {};
      for (const field of ['font','size','color','align','before','after']) t[field] = card.querySelector(`[data-field="${field}"]`).value;
      t.colorMode = card.querySelector('[data-field="autoColor"]').checked ? 'auto' : 'custom';
      if (def.background) { t.background = card.querySelector('[data-field="background"]').value; t.backgroundMode = card.querySelector('[data-field="autoBackground"]').checked ? 'auto' : 'custom'; }
      style.targets[def.key] = t;
    });
    return normalizeStyle(style);
  }

  function openStyleStudio(styleId) {
    const style = styleId ? findStyle(styleId) : activeStyle;
    populateStyleStudio(style, styleId || '');
    document.getElementById('styleStudioDialog').showModal();
  }

  function applyStyleFromStudio() {
    const style = collectStyleStudio();
    applyStylePreset(style, { persist: false, unsaved: true });
    document.getElementById('styleStudioDialog').close();
    showToast('Style applied for this session. Save it to reuse later.');
  }

  function saveStyleFromStudio() {
    const style = collectStyleStudio();
    const styles = getCustomStyles();
    const index = styles.findIndex(item => item.id === style.id);
    if (index >= 0) styles[index] = style;
    else styles.push(style);
    saveCustomStyles(styles);
    applyStylePreset(style);
    document.getElementById('styleStudioDialog').close();
    showToast(`Style “${style.name}” saved.`);
  }

  function renderStylesList() {
    const styles = [BUILTIN_STYLE].concat(getCustomStyles());
    stylesList.innerHTML = styles.map(style => {
      const active = activeStyleId === style.id;
      const menu = style.builtin ? '' : `
        <details class="overflow-menu">
          <summary aria-label="Style options">⋮</summary>
          <div class="overflow-menu-pop">
            <button type="button" data-style-action="edit" data-style-id="${style.id}">Edit</button>
            <button type="button" class="danger-text" data-style-action="delete" data-style-id="${style.id}">Delete</button>
          </div>
        </details>`;
      return `<div class="sidebar-item ${active ? 'active' : ''}">
        <button class="sidebar-item-main" type="button" data-style-apply="${style.id}">
          <span class="sidebar-item-title">${window.MDPMarkdown.escapeHtml(style.name)}</span>
          <span class="sidebar-item-meta">${style.builtin ? 'Built-in baseline' : 'Custom reusable style'}${active ? ' · Active' : ''}</span>
        </button>${menu}</div>`;
    }).join('');
  }

  async function renderFilesList() {
    let files = [];
    try { files = await window.MDPStorage.listFileHistory(); } catch (_) {}
    if (!files.length) {
      filesList.innerHTML = '<div class="browser-note">No Markdown files have been opened yet.</div>';
      return;
    }
    filesList.innerHTML = files.map(file => {
      const opened = currentHistoryId === file.id;
      const meta = file.hasPersistentHandle ? `Secure file handle · ${formatDate(file.lastOpened)}` : `Name only · ${formatDate(file.lastOpened)}`;
      return `<div class="sidebar-item ${opened ? 'active' : ''}">
        <button class="sidebar-item-main" type="button" data-file-open="${file.id}">
          <span class="sidebar-item-title">${window.MDPMarkdown.escapeHtml(file.name)}</span>
          <span class="sidebar-item-meta">${meta}</span>
        </button>
        <details class="overflow-menu">
          <summary aria-label="File options">⋮</summary>
          <div class="overflow-menu-pop">
            <button type="button" data-file-action="md" data-file-id="${file.id}" data-file-name="${window.MDPMarkdown.escapeHtml(file.name)}">Export .md</button>
            <button type="button" data-file-action="html" data-file-id="${file.id}" data-file-name="${window.MDPMarkdown.escapeHtml(file.name)}">Export HTML</button>
            <button type="button" data-file-action="pdf" data-file-id="${file.id}" data-file-name="${window.MDPMarkdown.escapeHtml(file.name)}">Export PDF</button>
            <button type="button" class="danger-text" data-file-action="remove" data-file-id="${file.id}" data-file-name="${window.MDPMarkdown.escapeHtml(file.name)}">Remove from list</button>
          </div>
        </details>
      </div>`;
    }).join('');
  }

  function formatDate(value) {
    if (!value) return 'Unknown date';
    try { return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); }
    catch (_) { return value; }
  }

  async function handleFileMenuAction(action, id, knownName) {
    if (action === 'remove') {
      await window.MDPStorage.removeFileHistory(id);
      if (currentHistoryId === id) currentHistoryId = null;
      await renderFilesList();
      showToast('File removed from history.');
      return;
    }

    const initialTitle = String(knownName || 'Document.md').replace(/\.(md|markdown|txt)$/i, '') || 'Document';
    let preparedHandle = null;
    if ((action === 'md' || action === 'html') && typeof window.showSaveFilePicker === 'function') {
      const ext = action === 'md' ? '.md' : '.html';
      const mime = action === 'md' ? 'text/markdown' : 'text/html';
      const filename = window.MDPExport.safeFilename(initialTitle, action === 'md' ? 'md' : 'html');
      try {
        // This must be the first asynchronous browser API invoked from the menu click.
        preparedHandle = await window.MDPStorage.createSaveHandle(filename, mime, ext);
      } catch (error) {
        if (error && error.name === 'AbortError') return;
        preparedHandle = null;
      }
    }

    let result;
    try { result = await window.MDPStorage.readHistoryFile(id); }
    catch (error) { showToast(error.message || 'The file is deleted/moved/renamed from the local path.', 4200); return; }

    const title = result.file.name.replace(/\.(md|markdown|txt)$/i, '') || initialTitle;
    if (action === 'md') {
      const filename = window.MDPExport.safeFilename(title, 'md');
      if (preparedHandle) {
        await window.MDPStorage.writeTextToHandle(preparedHandle, result.text, 'text/markdown');
        showToast('Markdown saved.');
      } else {
        window.MDPExport.downloadBlob(result.text, 'text/markdown;charset=utf-8', filename);
        showToast('Markdown downloaded.');
      }
    }
    if (action === 'html') await saveHtml(result.text, title, preparedHandle);
    if (action === 'pdf') {
      await applyOpenedFile(result.text, result.file.name, id);
      closeSidebar();
      await render();
      showToast('File opened for printing. Choose “Save as PDF” in the print dialog.');
      setTimeout(() => window.print(), 50);
    }
  }

  function openSidebar(panel) {
    sidebarDrawer.classList.add('open');
    sidebarDrawer.setAttribute('aria-hidden', 'false');
    drawerBackdrop.hidden = false;
    showSidebarPanel(panel || 'styles');
  }

  function closeSidebar() {
    sidebarDrawer.classList.remove('open');
    sidebarDrawer.setAttribute('aria-hidden', 'true');
    drawerBackdrop.hidden = true;
  }

  function showSidebarPanel(panel) {
    document.querySelectorAll('.drawer-panel').forEach(el => {
      const active = el.dataset.panel === panel;
      el.hidden = !active;
      el.classList.toggle('active', active);
    });
    document.querySelectorAll('.drawer-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.sidebarPanel === panel));
    document.getElementById('sidebarSettingsBtn').classList.toggle('active', panel === 'settings');
    if (panel === 'files') renderFilesList();
  }

  function updateFileAccessNote() {
    fileAccessNote.textContent = window.MDPStorage.supportsFileSystemAccess()
      ? 'Your browser supports persistent file handles. For privacy, browsers do not expose the full local filesystem path; MarkDownPublish stores the granted handle instead.'
      : 'This browser does not support persistent file handles. File names can be listed, but reopening/exporting a history item requires opening the file again. Edge or Chrome on localhost/HTTPS provides the fullest support.';
  }

  function syncSettingsUi() {
    document.getElementById('settingsTheme').value = prefs.theme;
    document.getElementById('settingsEditorTheme').value = prefs.editorTheme;
    document.getElementById('settingsCodeTheme').value = prefs.codeTheme;
    document.getElementById('settingsPreviewMode').value = prefs.previewMode;
    document.getElementById('settingsTabSize').value = prefs.tabSize;
    document.getElementById('settingsImageWidth').value = prefs.imageWidth;
    document.getElementById('settingsAutosave').checked = prefs.autosave;
    document.getElementById('settingsRememberDocument').checked = prefs.rememberDocument;
    autosaveIndicator.textContent = prefs.autosave ? 'Autosave on' : 'Autosave off';
    saveState.textContent = prefs.autosave ? saveState.textContent : 'Autosave off';
  }

  async function resetAppData() {
    if (!window.confirm('Reset MarkDownPublish local data? This removes cached images, file history, custom styles, preferences, and the autosaved draft from this browser.')) return;
    [STORAGE_KEY, LEGACY_STORAGE_KEY, PREFS_KEY, LEGACY_PREFS_KEY, STYLES_KEY, ACTIVE_STYLE_KEY].forEach(key => localStorage.removeItem(key));
    await window.MDPStorage.clearAppDatabase();
    window.location.reload();
  }

  function updateDocumentSettings(mutator) {
    const settings = window.MDPMarkdown.parseDocumentSettings(editor.value);
    const next = typeof mutator === 'function' ? mutator(settings) || settings : Object.assign(settings, mutator || {});
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const oldPrefix = editor.value.length - window.MDPMarkdown.stripDocumentSettings(editor.value).length;
    editor.value = window.MDPMarkdown.applyDocumentSettings(editor.value, next);
    const newPrefix = editor.value.length - window.MDPMarkdown.stripDocumentSettings(editor.value).length;
    const delta = newPrefix - oldPrefix;
    editor.setSelectionRange(Math.max(0, Math.min(editor.value.length, start + delta)), Math.max(0, Math.min(editor.value.length, end + delta)));
    if (storedSelection) storedSelection = [storedSelection[0] + delta, storedSelection[1] + delta];
    handleEditorChange();
    return next;
  }

  // ---------- Code themes ----------
  function openCustomCodeThemeDialog() {
    const custom = Object.assign({}, DEFAULT_PREFS.customCodeTheme, prefs.customCodeTheme || {});
    const ids = { background:'codeThemeBackground', text:'codeThemeText', keyword:'codeThemeKeyword', string:'codeThemeString', number:'codeThemeNumber', comment:'codeThemeComment', accent:'codeThemeAccent' };
    Object.entries(ids).forEach(([key,id]) => { document.getElementById(id).value = sanitizeColor(custom[key], DEFAULT_PREFS.customCodeTheme[key]); });
    document.getElementById('codeThemeDialog').showModal();
  }

  function saveCustomCodeTheme() {
    const custom = {
      background: document.getElementById('codeThemeBackground').value,
      text: document.getElementById('codeThemeText').value,
      keyword: document.getElementById('codeThemeKeyword').value,
      string: document.getElementById('codeThemeString').value,
      number: document.getElementById('codeThemeNumber').value,
      comment: document.getElementById('codeThemeComment').value,
      accent: document.getElementById('codeThemeAccent').value
    };
    persistPrefs({ codeTheme:'custom', customCodeTheme:custom });
    updateHighlightTheme();
    document.getElementById('codeThemeDialog').close();
    scheduleRender();
    showToast('Custom code theme applied.');
  }

  function setCodeTheme(theme) {
    const value = ['github-light','github-dark','monokai-pro','dracula','gruvbox','custom'].includes(theme) ? theme : 'github-light';
    persistPrefs({ codeTheme:value });
    updateHighlightTheme();
    scheduleRender();
    if (value === 'custom') openCustomCodeThemeDialog();
  }

  // ---------- Bookmarks ----------
  function bookmarkId() {
    return `bm-${Date.now()}-${Math.random().toString(16).slice(2,8)}`;
  }

  function selectionLabel() {
    const [start,end] = storedSelection || [editor.selectionStart, editor.selectionEnd];
    const selected = editor.value.slice(start,end).replace(/<[^>]+>/g,' ').replace(/[#*_>`~\[\]]/g,' ').replace(/\s+/g,' ').trim();
    if (selected) return selected.slice(0,90);
    const lineStart = editor.value.lastIndexOf('\n', start - 1) + 1;
    const lineEndRaw = editor.value.indexOf('\n', start);
    const lineEnd = lineEndRaw < 0 ? editor.value.length : lineEndRaw;
    return editor.value.slice(lineStart,lineEnd).replace(/^\s*#{1,6}\s*/, '').replace(/<[^>]+>/g,' ').trim().slice(0,90) || 'Bookmark';
  }

  function renderBookmarkList() {
    const settings = window.MDPMarkdown.parseDocumentSettings(editor.value);
    const list = document.getElementById('bookmarkList');
    if (!settings.bookmarks.length) {
      list.innerHTML = '<div class="browser-note">No bookmarks yet. Select text or place the cursor at a section, then add a bookmark.</div>';
      return;
    }
    list.innerHTML = settings.bookmarks.map(item => `
      <div class="manager-item" data-bookmark-id="${item.id}">
        <div class="manager-item-main"><input class="bookmark-label-input" data-bookmark-label="${item.id}" type="text" value="${window.MDPMarkdown.escapeHtml(item.label)}" /></div>
        <div class="manager-item-actions">
          <button type="button" data-bookmark-action="save" data-id="${item.id}">Save</button>
          <button type="button" data-bookmark-action="go" data-id="${item.id}">Go</button>
          <button type="button" class="danger-text" data-bookmark-action="delete" data-id="${item.id}">Delete</button>
        </div>
      </div>`).join('');
  }

  function openBookmarkManager() {
    rememberSelection();
    document.getElementById('bookmarkNameInput').value = selectionLabel();
    renderBookmarkList();
    document.getElementById('bookmarkDialog').showModal();
  }

  function addBookmarkAtSelection() {
    const label = document.getElementById('bookmarkNameInput').value.trim() || selectionLabel();
    const [start,end] = storedSelection || [editor.selectionStart, editor.selectionEnd];
    const id = bookmarkId();
    const anchor = `<span id="mdp-bookmark-${id}" data-mdp-bookmark="${id}" class="mdp-bookmark-anchor"></span>`;
    editor.setRangeText(anchor, start, start, 'end');
    storedSelection = [start + anchor.length, end + anchor.length];
    updateDocumentSettings(settings => {
      settings.bookmarks = (settings.bookmarks || []).concat([{ id, label:label.slice(0,160) }]);
      return settings;
    });
    renderBookmarkList();
    document.getElementById('bookmarkNameInput').value = '';
    showToast(`Bookmark “${label}” added.`);
  }

  function renameBookmark(id) {
    const input = document.querySelector(`[data-bookmark-label="${id}"]`);
    const label = input ? input.value.trim().slice(0,160) : '';
    if (!label) { showToast('Bookmark name cannot be empty.'); return; }
    updateDocumentSettings(settings => {
      settings.bookmarks = (settings.bookmarks || []).map(item => item.id === id ? { ...item, label } : item);
      return settings;
    });
    renderBookmarkList();
    showToast('Bookmark renamed.');
  }

  function deleteBookmark(id) {
    if (!window.confirm('Delete this bookmark?')) return;
    const body = window.MDPMarkdown.stripDocumentSettings(editor.value);
    const anchorRe = new RegExp(`<span\\s+id=["']mdp-bookmark-${id}["'][^>]*><\\/span>`, 'gi');
    const cleanedBody = body.replace(anchorRe, '');
    const settings = window.MDPMarkdown.parseDocumentSettings(editor.value);
    settings.bookmarks = (settings.bookmarks || []).filter(item => item.id !== id);
    editor.value = window.MDPMarkdown.applyDocumentSettings(cleanedBody, settings);
    handleEditorChange();
    renderBookmarkList();
    showToast('Bookmark deleted.');
  }

  async function goToBookmark(id) {
    document.getElementById('bookmarkDialog').close();
    await render();
    const target = preview.querySelector(`#mdp-bookmark-${CSS.escape(id)}`);
    if (target) target.scrollIntoView({ behavior:'smooth', block:'center' });
    else showToast('Bookmark anchor was not found in the current document.');
  }

  // ---------- Citation manager ----------
  function clearCitationForm() {
    document.getElementById('citationEditingKey').value = '';
    document.getElementById('citationKey').value = '';
    document.getElementById('citationType').value = 'journal';
    document.getElementById('citationEntryStyle').value = 'inherit';
    document.getElementById('citationTitle').value = '';
    document.getElementById('citationAuthors').value = '';
    document.getElementById('citationYear').value = '';
    document.getElementById('citationVolume').value = '';
    document.getElementById('citationPages').value = '';
    document.getElementById('citationVenue').value = '';
    document.getElementById('citationDoi').value = '';
    document.getElementById('saveCitationBtn').textContent = 'Add citation';
  }

  function renderCitationList() {
    const settings = window.MDPMarkdown.parseDocumentSettings(editor.value);
    const list = document.getElementById('citationList');
    if (!settings.citations.length) {
      list.innerHTML = '<div class="browser-note">No citations saved in this document yet.</div>';
      return;
    }
    list.innerHTML = settings.citations.map(c => `
      <div class="manager-item" data-citation-key="${window.MDPMarkdown.escapeHtml(c.key)}">
        <div class="manager-item-main"><div class="manager-item-title">@${window.MDPMarkdown.escapeHtml(c.key)} — ${window.MDPMarkdown.escapeHtml(c.title || 'Untitled')}</div><div class="manager-item-meta">${window.MDPMarkdown.escapeHtml(c.authors || 'Unknown author')} · ${window.MDPMarkdown.escapeHtml(c.year || 'n.d.')} · ${window.MDPMarkdown.escapeHtml(c.type)}</div></div>
        <div class="manager-item-actions"><button type="button" data-citation-action="insert" data-key="${c.key}">Insert</button><button type="button" data-citation-action="edit" data-key="${c.key}">Edit</button><button type="button" class="danger-text" data-citation-action="delete" data-key="${c.key}">Delete</button></div>
      </div>`).join('');
  }

  function openCitationManager() {
    rememberSelection();
    const settings = window.MDPMarkdown.parseDocumentSettings(editor.value);
    document.getElementById('citationMode').value = settings.citationMode;
    document.getElementById('citationGlobalStyle').value = settings.citationStyle;
    document.getElementById('citationColor').value = settings.citationColor;
    clearCitationForm();
    renderCitationList();
    document.getElementById('citationDialog').showModal();
  }

  function applyCitationSettings(showMessage) {
    updateDocumentSettings(settings => {
      settings.citationMode = document.getElementById('citationMode').value;
      settings.citationStyle = document.getElementById('citationGlobalStyle').value;
      settings.citationColor = document.getElementById('citationColor').value;
      return settings;
    });
    if (showMessage !== false) showToast('Citation settings applied.');
  }

  function collectCitationForm() {
    return window.MDPReferences.normalizeCitation({
      key: document.getElementById('citationKey').value.trim().replace(/^@/, ''),
      type: document.getElementById('citationType').value,
      style: document.getElementById('citationEntryStyle').value,
      title: document.getElementById('citationTitle').value,
      authors: document.getElementById('citationAuthors').value,
      year: document.getElementById('citationYear').value,
      volume: document.getElementById('citationVolume').value,
      pages: document.getElementById('citationPages').value,
      venue: document.getElementById('citationVenue').value,
      doi: document.getElementById('citationDoi').value
    });
  }

  function saveCitationEntry() {
    const entry = collectCitationForm();
    if (!window.MDPReferences.KEY_RE.test(entry.key)) { showToast('Citation key may contain letters, numbers, colon, underscore, and hyphen only.'); return; }
    if (!entry.title) { showToast('Add a title for the citation.'); return; }
    const editingKey = document.getElementById('citationEditingKey').value;
    const settings = window.MDPMarkdown.parseDocumentSettings(editor.value);
    if (settings.citations.some(c => c.key === entry.key && c.key !== editingKey)) { showToast(`Citation key @${entry.key} already exists.`); return; }
    let body = window.MDPMarkdown.stripDocumentSettings(editor.value);
    if (editingKey && editingKey !== entry.key) {
      const escaped = editingKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      body = body.replace(new RegExp(`@${escaped}(?=[,;\\]\\s])`, 'g'), `@${entry.key}`);
    }
    const citations = settings.citations.filter(c => c.key !== editingKey && c.key !== entry.key).concat([entry]);
    settings.citations = citations;
    settings.citationMode = document.getElementById('citationMode').value;
    settings.citationStyle = document.getElementById('citationGlobalStyle').value;
    settings.citationColor = document.getElementById('citationColor').value;
    const oldPrefix = editor.value.length - window.MDPMarkdown.stripDocumentSettings(editor.value).length;
    editor.value = window.MDPMarkdown.applyDocumentSettings(body, settings);
    const newPrefix = editor.value.length - window.MDPMarkdown.stripDocumentSettings(editor.value).length;
    if (storedSelection) { const delta = newPrefix - oldPrefix; storedSelection = [storedSelection[0] + delta, storedSelection[1] + delta]; }
    handleEditorChange();
    clearCitationForm();
    renderCitationList();
    showToast(`Citation @${entry.key} saved.`);
  }

  function editCitation(key) {
    const citation = window.MDPMarkdown.parseDocumentSettings(editor.value).citations.find(c => c.key === key);
    if (!citation) return;
    document.getElementById('citationEditingKey').value = citation.key;
    document.getElementById('citationKey').value = citation.key;
    document.getElementById('citationType').value = citation.type;
    document.getElementById('citationEntryStyle').value = citation.style || 'inherit';
    document.getElementById('citationTitle').value = citation.title;
    document.getElementById('citationAuthors').value = citation.authors;
    document.getElementById('citationYear').value = citation.year;
    document.getElementById('citationVolume').value = citation.volume;
    document.getElementById('citationPages').value = citation.pages;
    document.getElementById('citationVenue').value = citation.venue || '';
    document.getElementById('citationDoi').value = citation.doi;
    document.getElementById('saveCitationBtn').textContent = 'Update citation';
    document.getElementById('citationKey').scrollIntoView({ behavior:'smooth', block:'center' });
  }

  function deleteCitation(key) {
    if (!window.confirm(`Delete citation @${key}? Existing [@${key}] markers will remain and be shown as missing until replaced.`)) return;
    updateDocumentSettings(settings => { settings.citations = settings.citations.filter(c => c.key !== key); return settings; });
    renderCitationList();
    clearCitationForm();
    showToast(`Citation @${key} deleted.`);
  }

  function insertAtStoredSelection(text) {
    const [start,end] = storedSelection || [editor.selectionStart, editor.selectionEnd];
    editor.setRangeText(text, start, end, 'end');
    storedSelection = null;
    editor.focus();
    handleEditorChange();
  }

  function insertCitationMarker(key) {
    document.getElementById('citationDialog').close();
    insertAtStoredSelection(`[@${key}]`);
  }

  function insertBibliographyMarker() {
    document.getElementById('citationDialog').close();
    insertAtStoredSelection('\n\n[@bibliography]\n\n');
    showToast('Bibliography marker inserted.');
  }

  function importBibtex() {
    const parsed = window.MDPReferences.parseBibtex(document.getElementById('bibtexInput').value);
    if (!parsed.length) { showToast('No valid BibTeX entries were found.'); return; }
    const settings = window.MDPMarkdown.parseDocumentSettings(editor.value);
    const existing = new Set(settings.citations.map(c => c.key));
    const additions = parsed.filter(c => !existing.has(c.key));
    if (!additions.length) { showToast('All imported BibTeX keys already exist in this document.'); return; }
    settings.citations = settings.citations.concat(additions);
    settings.citationMode = document.getElementById('citationMode').value;
    settings.citationStyle = document.getElementById('citationGlobalStyle').value;
    settings.citationColor = document.getElementById('citationColor').value;
    const oldPrefix = editor.value.length - window.MDPMarkdown.stripDocumentSettings(editor.value).length;
    editor.value = window.MDPMarkdown.applyDocumentSettings(editor.value, settings);
    const newPrefix = editor.value.length - window.MDPMarkdown.stripDocumentSettings(editor.value).length;
    if (storedSelection) { const delta = newPrefix - oldPrefix; storedSelection = [storedSelection[0] + delta, storedSelection[1] + delta]; }
    handleEditorChange();
    renderCitationList();
    document.getElementById('bibtexInput').value = '';
    showToast(`${additions.length} BibTeX citation${additions.length === 1 ? '' : 's'} imported.`);
  }

  // Toolbar actions
  // A span is intentionally an inline format; when alignment is requested it becomes
  // a full-width block, because text-align cannot align arbitrary inline runs.
  let storedSelection = null;
  function rememberSelection() { storedSelection = [editor.selectionStart, editor.selectionEnd]; }
  function wrapSelectedWithStyle(style, placeholder) {
    const [start, end] = storedSelection || [editor.selectionStart, editor.selectionEnd];
    const selected = editor.value.slice(start,end) || placeholder || 'text';
    const escaped = window.MDPMarkdown.escapeHtml(selected).replace(/\n/g, '<br>');
    const markup = `<span class="mdp-custom-text" style="${style}">${escaped}</span>`;
    editor.setRangeText(markup, start, end, 'end');
    storedSelection = null;
    editor.focus();
    handleEditorChange();
  }
  function openInlineStyleDialog() {
    rememberSelection();
    document.getElementById('inlineSizeInput').value = '14pt';
    document.getElementById('inlineFontInput').value = '';
    document.getElementById('inlineColorInput').value = '#252a2e';
    document.getElementById('inlineUseThemeColor').checked = true;
    document.getElementById('inlineColorInput').disabled = true;
    document.getElementById('inlineAlignInput').value = 'inherit';
    document.getElementById('inlineStyleDialog').showModal();
  }
  function applyInlineStyle() {
    const fontRaw = document.getElementById('inlineFontInput').value.trim();
    const size = sanitizeCssLength(document.getElementById('inlineSizeInput').value, '14pt');
    const color = sanitizeColor(document.getElementById('inlineColorInput').value, '#252a2e');
    const align = document.getElementById('inlineAlignInput').value;
    const font = fontRaw ? `font-family:${sanitizeFontName(fontRaw, 'serif')};` : '';
    const aligned = align !== 'inherit' && ['left','center','right','justify'].includes(align);
    const useThemeColor = document.getElementById('inlineUseThemeColor').checked;
    const style = `${font}font-size:${size};${useThemeColor ? '' : `color:${color};`}${aligned ? `display:block;width:100%;text-align:${align};` : ''}`;
    wrapSelectedWithStyle(style, 'selected text');
    document.getElementById('inlineStyleDialog').close();
  }
  function applySelectionSize(event) {
    const value = event.target.value;
    if (!value) return;
    if (value === 'custom') { openInlineStyleDialog(); }
    else {
      rememberSelection();
      wrapSelectedWithStyle(`font-size:${sanitizeCssLength(value, '12pt')};`, 'text');
    }
    event.target.value = '';
  }

  function pageChromeStyle(key) {
    const clean = normalizeStyle(activeStyle || BUILTIN_STYLE);
    const target = clean.targets[key];
    return {
      fontFamily: target.font
        ? sanitizeFontName(target.font, 'serif')
        : sanitizeFontName(prefs.previewFontName, 'serif'),
      fontSize: target.size,
      color: target.colorMode === 'auto' ? '#52606b' : target.color,
      align: ['left','center','right'].includes(target.align) ? target.align : 'left'
    };
  }

  function applyPageLayout(raw) {
    const value = window.MDPLayout.normalize(raw);
    const vars = window.MDPLayout.cssVars(value);
    Object.entries(vars).forEach(([key, val]) => document.body.style.setProperty(key, val));

    const settings = window.MDPMarkdown.parseDocumentSettings(editor.value || '');
    const pageRule = window.MDPLayout.pageRule(value);
    const marginBoxes = window.MDPLayout.marginBoxRule(value, {
      header: settings.header,
      footer: settings.footer,
      pageNumbers: settings.pageNumbers,
      headerStyle: pageChromeStyle('header'),
      footerStyle: pageChromeStyle('footer')
    });
    document.getElementById('printPageStyle').textContent = `${pageRule}${marginBoxes ? `\n${marginBoxes}` : ''}`;

    prefs.layout = value;
    const summary = `${value.pageSize} ${value.orientation} · ${value.margins} margins · ${value.columns} column${value.columns === 2 ? 's' : ''}`;
    document.getElementById('openLayoutBtn').title = `Page layout: ${summary}`;
    return value;
  }
  function openLayoutDialog() {
    const value = window.MDPLayout.normalize(prefs.layout);
    document.getElementById('layoutPaper').value = value.pageSize;
    document.getElementById('layoutOrientation').value = value.orientation;
    document.getElementById('layoutMargins').value = value.margins;
    document.getElementById('layoutColumns').value = String(value.columns);
    ['Top','Right','Bottom','Left'].forEach((key,i) => { document.getElementById(`layoutMargin${key}`).value = String(value.custom[i]); });
    document.getElementById('customMarginsFields').hidden = value.margins !== 'custom';
    document.getElementById('layoutDialog').showModal();
  }
  function applyLayoutFromDialog() {
    const layout = applyPageLayout({
      pageSize: document.getElementById('layoutPaper').value,
      orientation: document.getElementById('layoutOrientation').value,
      margins: document.getElementById('layoutMargins').value,
      columns: Number(document.getElementById('layoutColumns').value),
      custom: ['Top','Right','Bottom','Left'].map(key => Number(document.getElementById(`layoutMargin${key}`).value))
    });
    persistPrefs({ layout });
    // Persist the per-document layout in Markdown metadata so moving the .md
    // to a new browser retains its intended paper settings.
    const settings = window.MDPMarkdown.parseDocumentSettings(editor.value);
    const start = editor.selectionStart;
    const previousPrefix = editor.value.length - window.MDPMarkdown.stripDocumentSettings(editor.value).length;
    editor.value = window.MDPMarkdown.applyDocumentSettings(editor.value, { ...settings, layout });
    const nextPrefix = editor.value.length - window.MDPMarkdown.stripDocumentSettings(editor.value).length;
    const cursor = Math.max(0, Math.min(editor.value.length, start + nextPrefix - previousPrefix));
    editor.setSelectionRange(cursor, cursor);
    handleEditorChange();
    document.getElementById('layoutDialog').close();
    showToast('Page layout applied to PDF preview and saved in document metadata.');
  }

  document.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => handleToolAction(btn.dataset.action)));

  // Editor events
  editor.addEventListener('input', handleEditorChange);
  editor.addEventListener('click', updateCursorStatus);
  editor.addEventListener('keyup', updateCursorStatus);
  titleInput.addEventListener('input', scheduleSave);

  document.getElementById('saveMdBtn').addEventListener('click', () => saveMarkdown());
  document.getElementById('exportHtmlBtn').addEventListener('click', () => saveHtml());
  document.getElementById('previewSaveHtmlBtn').addEventListener('click', () => saveHtml());
  document.getElementById('copyHtmlBtn').addEventListener('click', copyHtml);
  document.getElementById('printPdfBtn').addEventListener('click', () => window.print());
  document.getElementById('previewPrintBtn').addEventListener('click', () => window.print());
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
  document.getElementById('openLayoutBtn').addEventListener('click', openLayoutDialog);
  document.getElementById('applyLayoutBtn').addEventListener('click', applyLayoutFromDialog);
  document.getElementById('layoutMargins').addEventListener('change', event => { document.getElementById('customMarginsFields').hidden = event.target.value !== 'custom'; });
  document.getElementById('selectionFontSize').addEventListener('change', applySelectionSize);
  document.getElementById('applyInlineStyleBtn').addEventListener('click', applyInlineStyle);
  document.getElementById('inlineUseThemeColor').addEventListener('change', e => { document.getElementById('inlineColorInput').disabled = e.target.checked; });
  document.getElementById('styleStudioFields').addEventListener('change', e => { const card = e.target.closest('[data-style-target]'); if (!card) return; if (e.target.dataset.field === 'autoColor') card.querySelector('[data-field="color"]').disabled = e.target.checked; if (e.target.dataset.field === 'autoBackground') card.querySelector('[data-field="background"]').disabled = e.target.checked; });
  document.getElementById('newDocBtn').addEventListener('click', newDocument);
  document.getElementById('openFileBtn').addEventListener('click', openFileSmart);
  document.getElementById('openFileInput').addEventListener('change', event => {
    openMarkdownFallback(event.target.files[0]);
    event.target.value = '';
  });
  document.getElementById('htmlModeBtn').addEventListener('click', () => setPreviewMode('html'));
  document.getElementById('pdfModeBtn').addEventListener('click', () => setPreviewMode('pdf'));

  // Dialogs
  document.getElementById('insertTableBtn').addEventListener('click', insertTable);
  document.getElementById('insertEquationBtn').addEventListener('click', insertEquation);
  document.getElementById('saveHeaderFooterBtn').addEventListener('click', saveHeaderFooterSettings);
  document.getElementById('insertImageBtn').addEventListener('click', event => {
    event.preventDefault();
    insertImage().then(inserted => { if (inserted) document.getElementById('imageDialog').close(); });
  });
  document.getElementById('insertSpacingBtn').addEventListener('click', insertSpacing);
  document.querySelectorAll('input[name="imageSource"]').forEach(input => input.addEventListener('change', updateImageSourceFields));

  buildStyleStudio();
  document.getElementById('applyStyleBtn').addEventListener('click', applyStyleFromStudio);
  document.getElementById('saveStyleBtn').addEventListener('click', saveStyleFromStudio);

  // Font inputs
  function updateEditorFont() {
    const name = document.getElementById('editorFontInput').value.trim() || 'System Mono';
    persistPrefs({ editorFontName: name });
    applyFontPreferences();
    if (!activeStyle.targets.code.font) applyStylePreset(activeStyle, { persist: false });
  }
  function updatePreviewFont() {
    const name = document.getElementById('previewFontInput').value.trim() || 'Georgia';
    persistPrefs({ previewFontName: name });
    applyFontPreferences();
    applyStylePreset(activeStyle, { persist: false });
  }
  document.getElementById('editorFontInput').addEventListener('change', updateEditorFont);
  document.getElementById('previewFontInput').addEventListener('change', updatePreviewFont);
  document.getElementById('editorFontInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); updateEditorFont(); editor.focus(); } });
  document.getElementById('previewFontInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); updatePreviewFont(); editor.focus(); } });
  document.getElementById('editorThemeSelect').addEventListener('change', event => {
    document.body.dataset.editorTheme = event.target.value;
    persistPrefs({ editorTheme: event.target.value });
    document.getElementById('settingsEditorTheme').value = event.target.value;
  });
  document.getElementById('codeThemeSelect').addEventListener('change', event => setCodeTheme(event.target.value));
  document.getElementById('customCodeThemeBtn').addEventListener('click', openCustomCodeThemeDialog);
  document.getElementById('saveCustomCodeThemeBtn').addEventListener('click', saveCustomCodeTheme);

  // Citation manager
  document.getElementById('applyCitationSettingsBtn').addEventListener('click', () => applyCitationSettings(true));
  document.getElementById('insertBibliographyBtn').addEventListener('click', insertBibliographyMarker);
  document.getElementById('saveCitationBtn').addEventListener('click', saveCitationEntry);
  document.getElementById('clearCitationFormBtn').addEventListener('click', clearCitationForm);
  document.getElementById('importBibtexBtn').addEventListener('click', importBibtex);
  document.getElementById('citationList').addEventListener('click', event => {
    const button = event.target.closest('[data-citation-action]');
    if (!button) return;
    const key = button.dataset.key;
    if (button.dataset.citationAction === 'insert') insertCitationMarker(key);
    if (button.dataset.citationAction === 'edit') editCitation(key);
    if (button.dataset.citationAction === 'delete') deleteCitation(key);
  });

  // Bookmark manager
  document.getElementById('addBookmarkBtn').addEventListener('click', addBookmarkAtSelection);
  document.getElementById('bookmarkList').addEventListener('click', event => {
    const button = event.target.closest('[data-bookmark-action]');
    if (!button) return;
    const id = button.dataset.id;
    if (button.dataset.bookmarkAction === 'save') renameBookmark(id);
    if (button.dataset.bookmarkAction === 'go') goToBookmark(id);
    if (button.dataset.bookmarkAction === 'delete') deleteBookmark(id);
  });

  // Sidebar
  document.getElementById('openSidebarBtn').addEventListener('click', () => openSidebar('styles'));
  document.getElementById('closeSidebarBtn').addEventListener('click', closeSidebar);
  drawerBackdrop.addEventListener('click', closeSidebar);
  document.querySelectorAll('.drawer-tab').forEach(tab => tab.addEventListener('click', () => showSidebarPanel(tab.dataset.sidebarPanel)));
  document.getElementById('sidebarSettingsBtn').addEventListener('click', () => showSidebarPanel('settings'));
  document.getElementById('sidebarOpenFileBtn').addEventListener('click', openFileSmart);
  document.getElementById('newStyleBtn').addEventListener('click', () => openStyleStudio(null));

  stylesList.addEventListener('click', event => {
    const applyButton = event.target.closest('[data-style-apply]');
    if (applyButton) {
      const style = findStyle(applyButton.dataset.styleApply);
      applyStylePreset(style);
      showToast(`Applied style “${style.name}”.`);
      return;
    }
    const actionButton = event.target.closest('[data-style-action]');
    if (!actionButton) return;
    const id = actionButton.dataset.styleId;
    if (actionButton.dataset.styleAction === 'edit') openStyleStudio(id);
    if (actionButton.dataset.styleAction === 'delete') {
      const style = findStyle(id);
      if (!window.confirm(`Delete style “${style.name}”?`)) return;
      const styles = getCustomStyles().filter(item => item.id !== id);
      saveCustomStyles(styles);
      if (activeStyleId === id) applyStylePreset(BUILTIN_STYLE);
      renderStylesList();
      showToast('Style deleted.');
    }
  });

  filesList.addEventListener('click', event => {
    const openButton = event.target.closest('[data-file-open]');
    if (openButton) { openHistoryFile(openButton.dataset.fileOpen); return; }
    const actionButton = event.target.closest('[data-file-action]');
    if (actionButton) handleFileMenuAction(actionButton.dataset.fileAction, actionButton.dataset.fileId, actionButton.dataset.fileName);
  });

  // Settings
  document.getElementById('settingsTheme').addEventListener('change', event => setTheme(event.target.value));
  document.getElementById('settingsEditorTheme').addEventListener('change', event => {
    document.body.dataset.editorTheme = event.target.value;
    document.getElementById('editorThemeSelect').value = event.target.value;
    persistPrefs({ editorTheme: event.target.value });
  });
  document.getElementById('settingsCodeTheme').addEventListener('change', event => setCodeTheme(event.target.value));
  document.getElementById('settingsPreviewMode').addEventListener('change', event => setPreviewMode(event.target.value));
  document.getElementById('settingsTabSize').addEventListener('change', event => persistPrefs({ tabSize: Math.max(1, Math.min(8, Number(event.target.value) || 2)) }));
  document.getElementById('settingsImageWidth').addEventListener('change', event => persistPrefs({ imageWidth: Math.max(10, Math.min(100, Number(event.target.value) || 50)) }));
  document.getElementById('settingsAutosave').addEventListener('change', event => {
    persistPrefs({ autosave: event.target.checked });
    if (prefs.autosave) persistDocument();
  });
  document.getElementById('settingsRememberDocument').addEventListener('change', event => persistPrefs({ rememberDocument: event.target.checked }));
  document.getElementById('resetAppDataBtn').addEventListener('click', resetAppData);

  // Native editing shortcuts + custom editor shortcuts
  const nativeEditorShortcutKeys = new Set(['a', 'c', 'v', 'x', 'y', 'z']);
  editor.addEventListener('keydown', event => {
    const primary = (event.ctrlKey || event.metaKey) && !event.altKey;
    const key = event.key.toLowerCase();
    if (primary && nativeEditorShortcutKeys.has(key)) {
      event.stopPropagation();
      return;
    }
    if (primary && key === 'b') {
      event.preventDefault(); event.stopPropagation(); handleToolAction('bold'); return;
    }
    if (primary && key === 'i') {
      event.preventDefault(); event.stopPropagation(); handleToolAction('italic'); return;
    }
    if (!primary && !event.altKey && event.key === 'Tab') {
      event.preventDefault(); event.stopPropagation();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const spaces = ' '.repeat(Math.max(1, Math.min(8, prefs.tabSize || 2)));
      editor.setRangeText(spaces, start, end, 'end');
      handleEditorChange();
    }
  });

  document.addEventListener('keydown', event => {
    const primary = (event.ctrlKey || event.metaKey) && !event.altKey;
    if (primary && event.key.toLowerCase() === 's') {
      event.preventDefault();
      saveMarkdown();
    }
    if (event.key === 'Escape' && sidebarDrawer.classList.contains('open')) closeSidebar();
  });

  // Resizable panes
  const splitter = document.getElementById('splitter');
  const workspace = document.getElementById('workspace');
  splitter.addEventListener('pointerdown', event => {
    isDragging = true;
    splitter.classList.add('dragging');
    splitter.setPointerCapture(event.pointerId);
  });
  splitter.addEventListener('pointermove', event => {
    if (!isDragging || window.innerWidth <= 760) return;
    const rect = workspace.getBoundingClientRect();
    const pct = Math.max(25, Math.min(75, ((event.clientX - rect.left) / rect.width) * 100));
    const value = `${pct.toFixed(1)}%`;
    workspace.style.setProperty('--editor-width', value);
    persistPrefs({ editorWidth: value });
  });
  function stopDragging() { isDragging = false; splitter.classList.remove('dragging'); }
  splitter.addEventListener('pointerup', stopDragging);
  splitter.addEventListener('pointercancel', stopDragging);

  window.addEventListener('beforeunload', () => { if (prefs.autosave) persistDocument(); releaseAssetUrls(); });

  document.getElementById('copyrightYear').textContent = String(new Date().getFullYear());
  loadState();
  renderStylesList();
  renderFilesList();
  render();
})();

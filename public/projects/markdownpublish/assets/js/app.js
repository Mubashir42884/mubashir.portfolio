(function () {
  'use strict';

  const STORAGE_KEY = 'markdownpublish.document.v1';
  const PREFS_KEY = 'markdownpublish.preferences.v1';

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

  let renderTimer = null;
  let saveTimer = null;
  let toastTimer = null;
  let lastRawHtml = '';
  let isDragging = false;

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && typeof saved.markdown === 'string') {
        editor.value = saved.markdown;
        titleInput.value = saved.title || 'Untitled Report';
      } else {
        editor.value = starterMarkdown;
      }
    } catch (_) {
      editor.value = starterMarkdown;
    }

    try {
      const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
      document.body.dataset.theme = prefs.theme || 'light';
      document.body.dataset.editorTheme = prefs.editorTheme || 'github';
      if (prefs.editorFont) document.documentElement.style.setProperty('--editor-font', prefs.editorFont);
      if (prefs.previewFont) document.documentElement.style.setProperty('--preview-font', prefs.previewFont);
      if (prefs.editorFont) document.getElementById('editorFontSelect').value = prefs.editorFont;
      if (prefs.previewFont) document.getElementById('previewFontSelect').value = prefs.previewFont;
      if (prefs.editorTheme) document.getElementById('editorThemeSelect').value = prefs.editorTheme;
      if (prefs.editorWidth) document.getElementById('workspace').style.setProperty('--editor-width', prefs.editorWidth);
    } catch (_) {}
    updateThemeButton();
    updateHighlightTheme();
  }

  function persistDocument() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      title: titleInput.value.trim() || 'Untitled Report',
      markdown: editor.value,
      updatedAt: new Date().toISOString()
    }));
    saveState.textContent = 'Saved locally';
  }

  function scheduleSave() {
    saveState.textContent = 'Saving…';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persistDocument, 500);
  }

  function persistPrefs(extra) {
    let current = {};
    try { current = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'); } catch (_) {}
    localStorage.setItem(PREFS_KEY, JSON.stringify(Object.assign(current, extra)));
  }

  function render() {
    const settings = window.MDPMarkdown.parseDocumentSettings(editor.value);
    lastRawHtml = window.MDPMarkdown.renderMarkdown(editor.value);
    preview.innerHTML = lastRawHtml;
    applyHighlighting();
    applyPrintSettings(settings);
    queueMathTypeset();
    updateStats();
    updateCursorStatus();
  }

  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 90);
  }

  function applyHighlighting() {
    if (!window.hljs) return;
    preview.querySelectorAll('pre code').forEach((block) => {
      try {
        if (typeof window.hljs.highlightElement === 'function') window.hljs.highlightElement(block);
        else if (typeof window.hljs.highlightBlock === 'function') window.hljs.highlightBlock(block);
      } catch (_) {}
    });
  }

  function queueMathTypeset() {
    if (window.MathJax && window.MathJax.Hub) {
      window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, preview]);
    }
  }

  function applyPrintSettings(settings) {
    document.getElementById('printHeader').textContent = settings.header || '';
    document.getElementById('printFooterText').textContent = settings.footer || '';
    const page = document.getElementById('printPageNumber');
    page.dataset.label = settings.pageNumbers ? 'Page' : '';
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
    const pos = editor.selectionStart;
    const before = editor.value.slice(0, pos);
    const lines = before.split('\n');
    lineCol.textContent = `Ln ${lines.length}, Col ${lines[lines.length - 1].length + 1}`;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function insertText(before, after = '', placeholder = '') {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.slice(start, end);
    const middle = selected || placeholder;
    editor.setRangeText(`${before}${middle}${after}`, start, end, 'end');
    const newStart = start + before.length;
    const newEnd = newStart + middle.length;
    editor.focus();
    if (!selected && middle) editor.setSelectionRange(newStart, newEnd);
    handleEditorChange();
  }

  function prefixLines(prefix, ordered = false) {
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
    const html = `<ol type="${type}">\n${items}\n</ol>`;
    editor.setRangeText(html, start, end, 'select');
    editor.focus();
    handleEditorChange();
  }

  function insertCodeBlock() {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.slice(start, end) || 'your code here';
    const block = `\n\`\`\`text\n${selected}\n\`\`\`\n`;
    editor.setRangeText(block, start, end, 'select');
    editor.focus();
    handleEditorChange();
  }

  function handleToolAction(action) {
    switch (action) {
      case 'bold': insertText('**', '**', 'bold text'); break;
      case 'italic': insertText('*', '*', 'italic text'); break;
      case 'quote': prefixLines('>'); break;
      case 'bullets': prefixLines('-'); break;
      case 'numbers': prefixLines('', true); break;
      case 'alpha': customOrderedList('a'); break;
      case 'roman': customOrderedList('i'); break;
      case 'h1': heading(1); break;
      case 'h2': heading(2); break;
      case 'h3': heading(3); break;
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
    }
  }

  function openEquationDialog() {
    const selected = editor.value.slice(editor.selectionStart, editor.selectionEnd);
    document.getElementById('equationInput').value = selected || 'E = mc^2';
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

  function handleEditorChange() {
    scheduleRender();
    scheduleSave();
  }

  function saveMarkdown() {
    persistDocument();
    window.MDPExport.downloadBlob(editor.value, 'text/markdown;charset=utf-8', window.MDPExport.safeFilename(titleInput.value, 'md'));
    showToast('Markdown file downloaded.');
  }

  function getMathStyles() {
    const style = document.getElementById('MathJax_HTML-CSS_styles');
    return style ? style.textContent : '';
  }

  function saveHtml() {
    const settings = window.MDPMarkdown.parseDocumentSettings(editor.value);
    const html = window.MDPExport.buildStandaloneHtml({
      title: titleInput.value,
      bodyHtml: preview.innerHTML,
      previewFont: getComputedStyle(document.documentElement).getPropertyValue('--preview-font').trim(),
      header: settings.header,
      footer: settings.footer,
      pageNumbers: settings.pageNumbers,
      mathStyles: getMathStyles()
    });
    window.MDPExport.downloadBlob(html, 'text/html;charset=utf-8', window.MDPExport.safeFilename(titleInput.value, 'html'));
    showToast('HTML file downloaded.');
  }

  async function copyHtml() {
    try {
      await navigator.clipboard.writeText(preview.innerHTML);
      showToast('Rendered HTML copied.');
    } catch (_) {
      const area = document.createElement('textarea');
      area.value = preview.innerHTML;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
      showToast('Rendered HTML copied.');
    }
  }

  function toggleTheme() {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    persistPrefs({ theme: document.body.dataset.theme });
    updateThemeButton();
    updateHighlightTheme();
  }

  function updateThemeButton() {
    document.getElementById('themeToggleBtn').textContent = document.body.dataset.theme === 'dark' ? '☀' : '☾';
  }

  function updateHighlightTheme() {
    const isDark = document.body.dataset.theme === 'dark' || document.body.dataset.editorTheme === 'midnight';
    themeLink.href = isDark ? 'vendor/highlight/atom-one-dark.min.css' : 'vendor/highlight/atom-one-light.min.css';
  }

  function setPreviewMode(mode) {
    const pdf = mode === 'pdf';
    previewScroll.classList.toggle('pdf-mode', pdf);
    document.getElementById('htmlModeBtn').classList.toggle('active', !pdf);
    document.getElementById('pdfModeBtn').classList.toggle('active', pdf);
  }

  function newDocument() {
    const hasMeaningfulContent = window.MDPMarkdown.stripDocumentSettings(editor.value).trim().length > 0;
    if (hasMeaningfulContent && !window.confirm('Start a new document? Your current draft is already autosaved locally.')) return;
    titleInput.value = 'Untitled Report';
    editor.value = '# Untitled Report\n\nStart writing here.\n';
    handleEditorChange();
    editor.focus();
  }

  function openMarkdownFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      editor.value = String(reader.result || '');
      titleInput.value = file.name.replace(/\.(md|markdown|txt)$/i, '') || 'Untitled Report';
      handleEditorChange();
      showToast(`Opened ${file.name}`);
    };
    reader.onerror = () => showToast('Could not read that file.');
    reader.readAsText(file);
  }

  function insertImageFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Please choose an image file.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const alt = file.name.replace(/\.[^.]+$/, '') || 'image';
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const markdown = `![${alt}](${String(reader.result || '')})`;
      editor.setRangeText(markdown, start, end, 'end');
      editor.focus();
      handleEditorChange();
      showToast('Image embedded as a data URL.');
    };
    reader.readAsDataURL(file);
  }

  function insertTable() {
    const cols = Math.max(1, Math.min(12, Number(document.getElementById('tableCols').value) || 3));
    const rows = Math.max(1, Math.min(30, Number(document.getElementById('tableRows').value) || 4));
    const header = `| ${Array.from({ length: cols }, (_, i) => `Column ${i + 1}`).join(' | ')} |`;
    const divider = `| ${Array.from({ length: cols }, () => '---').join(' | ')} |`;
    const row = `| ${Array.from({ length: cols }, () => ' ').join(' | ')} |`;
    const table = `\n${header}\n${divider}\n${Array.from({ length: rows }, () => row).join('\n')}\n`;
    insertText(table);
  }

  function insertEquation() {
    const value = document.getElementById('equationInput').value.trim() || 'E = mc^2';
    const display = document.getElementById('displayEquation').checked;
    insertText(display ? `\n\n$$\n${value}\n$$\n\n` : `$${value}$`);
  }

  function saveHeaderFooterSettings() {
    const settings = {
      header: document.getElementById('headerTextInput').value.trim(),
      footer: document.getElementById('footerTextInput').value.trim(),
      pageNumbers: document.getElementById('pageNumbersInput').checked
    };
    const oldStart = editor.selectionStart;
    editor.value = window.MDPMarkdown.applyDocumentSettings(editor.value, settings);
    editor.setSelectionRange(Math.min(oldStart, editor.value.length), Math.min(oldStart, editor.value.length));
    handleEditorChange();
    showToast('Print header/footer settings applied.');
  }

  // Toolbar
  document.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => handleToolAction(btn.dataset.action)));

  // Main document events
  editor.addEventListener('input', handleEditorChange);
  editor.addEventListener('click', updateCursorStatus);
  editor.addEventListener('keyup', updateCursorStatus);
  titleInput.addEventListener('input', scheduleSave);
  document.getElementById('saveMdBtn').addEventListener('click', saveMarkdown);
  document.getElementById('exportHtmlBtn').addEventListener('click', saveHtml);
  document.getElementById('previewSaveHtmlBtn').addEventListener('click', saveHtml);
  document.getElementById('copyHtmlBtn').addEventListener('click', copyHtml);
  document.getElementById('printPdfBtn').addEventListener('click', () => window.print());
  document.getElementById('previewPrintBtn').addEventListener('click', () => window.print());
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
  document.getElementById('newDocBtn').addEventListener('click', newDocument);
  document.getElementById('openFileInput').addEventListener('change', (e) => { openMarkdownFile(e.target.files[0]); e.target.value = ''; });
  document.getElementById('imageInput').addEventListener('change', (e) => { insertImageFile(e.target.files[0]); e.target.value = ''; });
  document.getElementById('htmlModeBtn').addEventListener('click', () => setPreviewMode('html'));
  document.getElementById('pdfModeBtn').addEventListener('click', () => setPreviewMode('pdf'));

  // Dialog actions
  document.getElementById('insertTableBtn').addEventListener('click', insertTable);
  document.getElementById('insertEquationBtn').addEventListener('click', insertEquation);
  document.getElementById('saveHeaderFooterBtn').addEventListener('click', saveHeaderFooterSettings);

  // Preferences
  document.getElementById('editorFontSelect').addEventListener('change', (e) => {
    document.documentElement.style.setProperty('--editor-font', e.target.value);
    persistPrefs({ editorFont: e.target.value });
  });
  document.getElementById('previewFontSelect').addEventListener('change', (e) => {
    document.documentElement.style.setProperty('--preview-font', e.target.value);
    persistPrefs({ previewFont: e.target.value });
  });
  document.getElementById('editorThemeSelect').addEventListener('change', (e) => {
    document.body.dataset.editorTheme = e.target.value;
    persistPrefs({ editorTheme: e.target.value });
    updateHighlightTheme();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const meta = e.ctrlKey || e.metaKey;
    if (meta && e.key.toLowerCase() === 's') { e.preventDefault(); saveMarkdown(); }
    if (document.activeElement === editor && meta && e.key.toLowerCase() === 'b') { e.preventDefault(); handleToolAction('bold'); }
    if (document.activeElement === editor && meta && e.key.toLowerCase() === 'i') { e.preventDefault(); handleToolAction('italic'); }
    if (document.activeElement === editor && e.key === 'Tab') {
      e.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.setRangeText('  ', start, end, 'end');
      handleEditorChange();
    }
  });

  // Resizable split panes
  const splitter = document.getElementById('splitter');
  const workspace = document.getElementById('workspace');
  splitter.addEventListener('pointerdown', (e) => {
    isDragging = true;
    splitter.classList.add('dragging');
    splitter.setPointerCapture(e.pointerId);
  });
  splitter.addEventListener('pointermove', (e) => {
    if (!isDragging || window.innerWidth <= 760) return;
    const rect = workspace.getBoundingClientRect();
    const pct = Math.max(25, Math.min(75, ((e.clientX - rect.left) / rect.width) * 100));
    const value = `${pct.toFixed(1)}%`;
    workspace.style.setProperty('--editor-width', value);
    persistPrefs({ editorWidth: value });
  });
  splitter.addEventListener('pointerup', () => { isDragging = false; splitter.classList.remove('dragging'); });
  splitter.addEventListener('pointercancel', () => { isDragging = false; splitter.classList.remove('dragging'); });

  window.addEventListener('beforeunload', persistDocument);

  loadState();
  render();
})();

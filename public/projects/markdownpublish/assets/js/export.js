(function () {
  'use strict';

  function safeFilename(name, ext) {
    const base = String(name || 'document')
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, ' ')
      .slice(0, 100) || 'document';
    return `${base}.${ext}`;
  }

  function downloadBlob(content, type, filename) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function buildStandaloneHtml(options) {
    const { title, bodyHtml, previewFont, header, footer, pageNumbers, mathStyles } = options;
    const escapedTitle = window.MDPMarkdown.escapeHtml(title || 'Document');
    const escapedHeader = window.MDPMarkdown.escapeHtml(header || '');
    const escapedFooter = window.MDPMarkdown.escapeHtml(footer || '');
    const pageLabel = pageNumbers ? 'Page' : '';

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapedTitle}</title>
<style>
:root{--ink:#22272b;--muted:#687078;--line:#d9dde0;--paper:#fff;--soft:#f6f7f7;}
*{box-sizing:border-box}body{margin:0;background:#f1f2f2;color:var(--ink);font-family:${previewFont};line-height:1.7}.document{width:min(900px,calc(100% - 32px));margin:32px auto;padding:54px 64px 72px;background:var(--paper);box-shadow:0 10px 34px rgba(0,0,0,.08)}h1,h2,h3{font-family:Inter,Arial,sans-serif;line-height:1.2;page-break-after:avoid}h1{font-size:2rem}h2{margin-top:2rem;border-bottom:1px solid var(--line);padding-bottom:.3rem}a{color:#526b5a}blockquote{margin:1.2rem 0;padding:.15rem 1rem;border-left:3px solid #738b7b;background:#edf2ee;color:#555}table{width:100%;border-collapse:collapse;margin:1.3rem 0}th,td{border:1px solid var(--line);padding:.55rem .65rem;text-align:left;vertical-align:top}th{background:var(--soft)}pre{padding:1rem;border:1px solid var(--line);border-radius:8px;background:var(--soft);overflow:auto}code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}img{max-width:100%;height:auto;display:block;margin:1rem auto}.page-break{height:0;page-break-after:always;break-after:page}hr{border:0;border-top:1px solid var(--line);margin:2rem 0}.running-header,.running-footer{display:none}
${mathStyles || ''}
@media print{@page{size:A4;margin:24mm 20mm 24mm}body{background:#fff}.document{width:auto;margin:0;padding:0;box-shadow:none;font-size:11pt}.print-header,.print-footer{display:block;position:fixed;left:0;right:0;color:#666;font:8.5pt Arial,sans-serif}.print-header{top:-13mm}.print-footer{bottom:-14mm;display:flex;justify-content:space-between}.page-number:after{content:attr(data-label) " " counter(page)}img,table,pre,blockquote{break-inside:avoid;page-break-inside:avoid}}
</style>
</head>
<body>
<div class="print-header">${escapedHeader}</div>
<div class="print-footer"><span>${escapedFooter}</span><span class="page-number" data-label="${pageLabel}"></span></div>
<main class="document">${bodyHtml}</main>
</body>
</html>`;
  }

  window.MDPExport = { safeFilename, downloadBlob, buildStandaloneHtml };
})();

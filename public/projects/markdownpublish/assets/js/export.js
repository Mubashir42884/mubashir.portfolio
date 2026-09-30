(function () {
  'use strict';

  function safeFilename(name, ext) {
    const base = String(name || 'document').trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').slice(0,100) || 'document';
    return `${base}.${ext}`;
  }

  function downloadBlob(content, type, filename) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function buildStandaloneHtml(options) {
    const {
      title, bodyHtml, previewFont, header, footer, pageNumbers,
      mathStyles, customCss, pageLayout, headerStyle, footerStyle, codeTheme
    } = options;
    const escape = window.MDPMarkdown.escapeHtml;
    const layout = window.MDPLayout.metrics(pageLayout);
    const vars = Object.entries(window.MDPLayout.cssVars(pageLayout)).map(([k,v])=>`${k}:${v}`).join(';');
    const rule = window.MDPLayout.pageRule(pageLayout);
    const marginBoxes = window.MDPLayout.marginBoxRule(pageLayout, {
      header,
      footer,
      pageNumbers,
      headerStyle,
      footerStyle
    });
    const mathCss = String(mathStyles || '').replace(/<\/style/gi, '<\\/style');
    const custom = String(customCss || '').replace(/<\/style/gi, '<\\/style');
    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title || 'Document')}</title>
<style>
:root{${vars};--ink:#252a2e;--line:#d9dde0;--soft:#f5f6f7;--preview-font:${previewFont};color-scheme:light;}
*{box-sizing:border-box}html,body{margin:0;padding:0}body{background:#eceeef;color:var(--ink);font:16px/1.7 var(--preview-font);}
.document{width:min(var(--mdp-paper-width),calc(100% - 24px));min-height:var(--mdp-paper-height);margin:24px auto;padding:var(--mdp-margin-top) var(--mdp-margin-right) var(--mdp-margin-bottom) var(--mdp-margin-left);background:#fff;box-shadow:0 10px 34px #0001;overflow-wrap:anywhere;column-count:var(--mdp-print-columns);column-gap:8mm;}
.document h1:first-child{column-span:all}.document h1,.document h2,.document h3,.document h4,.document h5{break-after:avoid;line-height:1.3}.document h2{border-bottom:1px solid var(--line);padding-bottom:.3rem}
.document blockquote{padding:.3rem 1rem;border-left:3px solid #738b7b;break-inside:avoid}.document blockquote p{font:inherit;color:inherit;text-align:inherit;margin:0}.document p{margin:0 0 1rem}
.document a{color:#526b5a}.document table{width:100%;border-collapse:collapse;margin:1.3rem 0;font-size:.9em}.document th,.document td{border:1px solid var(--line);padding:.55rem .65rem;text-align:left;vertical-align:top}.document th{background:var(--soft)}
.document pre{padding:1rem;border:1px solid var(--line);border-radius:8px;background:var(--soft);overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;break-inside:avoid}.document pre code{font:inherit;color:inherit}.document :not(pre)>code{padding:.1em .25em;border-radius:4px;background:var(--soft)}
.document img{max-width:100%;height:auto;display:block;margin:1rem auto}.document .mdp-image-container img{display:inline-block}.document .page-break{break-after:page;page-break-after:always;height:0;column-span:all}.document .mdp-spacer{display:block;width:100%}.document hr{border:0;border-top:1px solid var(--line);margin:2rem 0}
.print-header,.print-footer{display:none;font:9pt Arial,sans-serif;color:#555}.mdp-custom-text{box-sizing:border-box}
${codeTheme === 'dark' ? '.document pre{background:#1c252d;color:#eaf0f2}' : codeTheme === 'warm' ? '.document pre{background:#fff3e5;color:#342c25}' : ''}
${custom}
${mathCss}
@media(max-width:560px){.document{width:100%;margin:0;min-height:0;column-count:1;padding:22px;}}
@media print{
${rule}
${marginBoxes}
:root{--ink:#252a2e;--line:#d9dde0;--soft:#f5f6f7;color-scheme:light!important}html,body{background:#fff!important;color:#252a2e!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.document{margin:0!important;padding:0!important;width:auto!important;min-height:0!important;border:0!important;box-shadow:none!important;background:#fff!important;background-image:none!important;column-count:var(--mdp-print-columns)}
.document h1,.document h2,.document h3,.document h4,.document h5{break-after:avoid}.document blockquote{background:#f5f5f5!important;color:#252a2e!important}.document blockquote p{color:inherit!important}
.document pre,.document :not(pre)>code,.document th{background:#f5f5f5!important;color:#252a2e!important}.document pre .hljs,.document pre .hljs *{color:#252a2e!important;background:transparent!important}
.document img,.document table,.document pre,.document blockquote{break-inside:avoid}.document .page-break{border:0!important;background:none!important;page-break-after:always;break-after:page;column-span:all}
.print-header,.print-footer{display:none!important}
}
</style></head>
<body><main class="document">${bodyHtml}</main></body></html>`;
  }

  window.MDPExport = { safeFilename, downloadBlob, buildStandaloneHtml };
})();

/* Regression checks for v2.1 page layout, HTML export, and print styling. */
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname, '..');
const ctx = { window: {}, console };
ctx.window.window = ctx.window;
vm.createContext(ctx);
for (const source of [
  'vendor/marked/marked.js',
  'assets/js/markdown.js',
  'assets/js/layout.js',
  'assets/js/export.js'
]) vm.runInContext(fs.readFileSync(path.join(root, source), 'utf8'), ctx);

const { MDPLayout: layout, MDPExport: exporter, MDPMarkdown: markdown } = ctx.window;
const requested = { pageSize: 'A3', orientation: 'landscape', margins: 'custom', custom: [10,12,15,14], columns: 2 };
const metrics = layout.metrics(requested);
const metadata = markdown.applyDocumentSettings('# Report\n\nBody text', {header:'Course',footer:'Student',pageNumbers:true,layout:requested});
const parsed = markdown.parseDocumentSettings(metadata);
const html = exporter.buildStandaloneHtml({
  title: 'Research & Results', bodyHtml: '<h1>Report</h1><p><span class="mdp-custom-text" style="font-size:18pt">Sample</span></p>',
  previewFont: 'Georgia, serif', header:'Course', footer:'Student', pageNumbers:true,
  mathStyles:'', customCss: '.document h1{color:#ca5b20}', pageLayout:requested, codeTheme:'auto'
});
const style = fs.readFileSync(path.join(root,'assets/css/styles.css'),'utf8');
const index = fs.readFileSync(path.join(root,'index.html'),'utf8');
const checks = [
  ['A3 landscape dimensions', metrics.width === 420 && metrics.height === 297],
  ['custom margins order', JSON.stringify(Array.from(metrics.margin)) === '[10,12,15,14]'],
  ['two-column layout', metrics.columns === 2 && layout.cssVars(requested)['--mdp-print-columns'] === '2'],
  ['fallback invalid size', layout.normalize({pageSize:'Other'}).pageSize === 'A4'],
  ['layout metadata round trip', parsed.layout.pageSize === 'A3' && parsed.layout.columns === 2],
  ['dynamic page rule', /@page \{ size: A3 landscape; margin: 10mm 12mm 15mm 14mm; \}/.test(layout.pageRule(requested))],
  ['standalone HTML includes page rules', html.includes('@page { size: A3 landscape; margin: 10mm 12mm 15mm 14mm; }')],
  ['standalone HTML retains two columns', html.includes('--mdp-print-columns:2')],
  ['standalone HTML retains selected-text formatting', html.includes('font-size:18pt')],
  ['standalone HTML retains custom heading color', html.includes('#ca5b20')],
  ['standalone HTML forces white print paper', html.includes('background:#fff!important;background-image:none!important')],
  ['toolbar includes size and custom formatting', index.includes('id="selectionFontSize"') && index.includes('data-action="customtext"')],
  ['toolbar has H1–H3 + custom only', !index.includes('data-action="h4"') && !index.includes('data-action="h5"') && index.includes('data-action="styleStudio"')],
  ['toolbar includes layout', index.includes('id="openLayoutBtn"') && index.includes('id="layoutPaper"')],
  ['print CSS removes backgrounds and shadows', /@media print[\s\S]*background-image: none !important/.test(style) && /box-shadow: none !important/.test(style)],
  ['laptop layout remains split', /@media \(min-width: 600px\) and \(max-width: 760px\)/.test(style) && /grid-template-columns: minmax\(0,var\(--editor-width,50%\)\) 6px minmax\(0,1fr\)/.test(style)]
];
let failed=0;
for (const [name,ok] of checks){ console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if(!ok) failed++; }
console.log(`\n${checks.length - failed}/${checks.length} layout/export checks passed.`);
if(failed) process.exit(1);

/* MarkDownPublish v2.2.0 feature/regression checks. */
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname, '..');
const ctx = { window: {}, console };
ctx.window.window = ctx.window;
ctx.globalThis = ctx.window;
vm.createContext(ctx);
for (const source of [
  'vendor/marked/marked.js',
  'assets/js/references.js',
  'assets/js/markdown.js',
  'assets/js/layout.js',
  'assets/js/export.js'
]) vm.runInContext(fs.readFileSync(path.join(root, source), 'utf8'), ctx);

const { MDPMarkdown: md, MDPReferences: refs, MDPExport: exp } = ctx.window;
const settings = {
  citationMode: 'numeric', citationStyle: 'apa', citationColor: '#526b5a',
  citations: [
    { key:'smith2000', type:'journal', style:'inherit', title:'A Study', authors:'Smith, Jane; Doe, John', year:'2000', venue:'Journal of Tests', volume:'4', pages:'1-9', doi:'10.1000/test' }
  ],
  bookmarks: [{ id:'bm-one', label:'Important section' }]
};
const source = md.applyDocumentSettings('# Report\n\nText [@smith2000].\n\n<span id="mdp-bookmark-bm-one" data-mdp-bookmark="bm-one" class="mdp-bookmark-anchor"></span>## Methods\n\n[@bibliography]', settings);
const parsed = md.parseDocumentSettings(source);
const rendered = md.renderMarkdown(source);
const authorYearSource = md.applyDocumentSettings('Text [@smith2000].', { ...settings, citationMode:'author-year' });
const renderedAuthorYear = md.renderMarkdown(authorYearSource);
const bib = refs.parseBibtex('@article{doe2024, title={Privacy Study}, author={Doe, Jane and Roe, John}, year={2024}, journal={Test Journal}, volume={2}, pages={10--20}, doi={10.1/demo}}');
const html = exp.buildStandaloneHtml({
  title:'Demo', bodyHtml:rendered, previewFont:'Georgia, serif', header:'', footer:'', pageNumbers:false,
  mathStyles:'', customCss:'', pageLayout:{pageSize:'A4',orientation:'portrait',margins:'normal',custom:[18,18,18,18],columns:1},
  headerStyle:{}, footerStyle:{}, codeTheme:'dracula', customCodeTheme:{}, bookmarks:settings.bookmarks
});
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets/css/styles.css'), 'utf8');

const checks = [
  ['citation metadata round trip', parsed.citations.length === 1 && parsed.citations[0].key === 'smith2000'],
  ['bookmark metadata round trip', parsed.bookmarks.length === 1 && parsed.bookmarks[0].label === 'Important section'],
  ['numeric citation render', rendered.includes('class="mdp-citation"') && rendered.includes('[1]')],
  ['bibliography render', rendered.includes('mdp-bibliography') && rendered.includes('A Study')],
  ['author-year citation render', renderedAuthorYear.includes('(Smith &amp; Doe, 2000)')],
  ['BibTeX import parser', bib.length === 1 && bib[0].key === 'doe2024' && bib[0].venue === 'Test Journal'],
  ['export HTML uses A3-like screen width', html.includes('width:min(297mm,calc(100vw - 330px))')],
  ['export HTML has floating contents sidebar', html.includes('class="export-sidebar"') && html.includes('class="toc-link')],
  ['export HTML includes bookmarks', html.includes('Important section') && html.includes('#mdp-bookmark-bm-one')],
  ['export HTML includes code theme variables', html.includes('--code-theme-bg:#282a36') && html.includes('--code-theme-keyword:#ff79c6')],
  ['citation manager UI exists', index.includes('id="citationDialog"') && index.includes('id="bibtexInput"')],
  ['code theme selector UI exists', index.includes('id="codeThemeSelect"') && index.includes('Monokai Pro') && index.includes('Dracula') && index.includes('Gruvbox')],
  ['bookmark manager UI exists', index.includes('id="bookmarkDialog"') && index.includes('id="addBookmarkBtn"')],
  ['style studio has scroll container', index.includes('id="styleStudioScroll"') && css.includes('.style-studio-scroll { flex:1 1 auto; min-height:0; overflow-y:auto;')],
  ['table styling UI exists', index.includes('id="tableDensity"') && index.includes('id="tableBorderStyle"') && index.includes('id="tableAccent"')],
  ['table CSS supports row palette', css.includes('--mdp-table-odd') && css.includes('tbody tr:nth-child(even)')],
  ['print code remains fragmentable', /@media print[\s\S]*\.preview-document pre \{[\s\S]*break-inside:\s*auto\s*!important/.test(css)]
];
let failed = 0;
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failed++; }
console.log(`\n${checks.length - failed}/${checks.length} v2.2 checks passed.`);
if (failed) process.exit(1);

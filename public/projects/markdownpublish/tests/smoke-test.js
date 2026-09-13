const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.resolve(__dirname, '..');
const ctx = { window: {}, console };
ctx.window.window = ctx.window;
ctx.globalThis = ctx.window;
vm.createContext(ctx);

vm.runInContext(fs.readFileSync(path.join(root, 'vendor/marked/marked.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'assets/js/markdown.js'), 'utf8'), ctx);

const api = ctx.window.MDPMarkdown;
const sample = `<!-- MDP-SETTINGS {"header":"Research Methods","footer":"Student","pageNumbers":true} -->

# Report

| Metric | Value |
| --- | --- |
| Accuracy | 0.94 |

<div class="page-break"></div>`;

const settings = api.parseDocumentSettings(sample);
const html = api.renderMarkdown(sample);

const checks = [
  ['settings header', settings.header === 'Research Methods'],
  ['settings footer', settings.footer === 'Student'],
  ['settings pageNumbers', settings.pageNumbers === true],
  ['heading render', /<h1[^>]*>Report<\/h1>/.test(html)],
  ['table render', /<table>/.test(html) && /Accuracy/.test(html)],
  ['page break preservation', /class="page-break"/.test(html)],
  ['metadata stripped from output', !/MDP-SETTINGS/.test(html)]
];

let failed = false;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed = true;
}

if (failed) process.exit(1);
console.log(`\n${checks.length} smoke checks passed.`);

# MarkDownPublish v2.1.1 print fix

Extract the contents of this archive into the root of your existing MarkDownPublish v2.1 project and allow matching files to be replaced.

This patch fixes the PDF/print footer overlap and stray `0` page-number artifact. It does not clear or replace browser localStorage, IndexedDB, cached images, saved styles, or file-history handles.

Changed runtime files:
- `index.html`
- `assets/css/styles.css`
- `assets/js/app.js`
- `assets/js/export.js`
- `assets/js/layout.js`

Documentation/test files:
- `UPDATE_NOTES.md`
- `tests/layout-export-test.js`

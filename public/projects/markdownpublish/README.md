# MarkDownPublish

MarkDownPublish is a local-first, minimal academic Markdown writing app with a live HTML/PDF-style preview, LaTeX rendering, syntax highlighting, structured writing tools, and export controls.

## Features

- Split Markdown editor + live rendered preview
- GitHub-flavored Markdown tables and lists
- Bold, italic, quotations, H1/H2/H3, links, images, code blocks
- Inline and display LaTeX with bundled MathJax
- Bullet, numbered, alphabetic, and Roman numeral lists
- Horizontal rules and explicit page breaks
- Print/PDF header, footer, and page-number label metadata
- HTML view and A4-like PDF preview mode
- Download `.md`, export HTML, copy rendered HTML, browser Print / Save as PDF
- Editor and preview font controls
- Light/dark application modes
- GitHub, Jupyter, and Midnight editor themes
- Word/character counts, reading-time estimate, line/column indicator
- Local autosave with `localStorage`
- Open existing Markdown and embed local images as data URLs
- Resizable editor/preview split
- Responsive layout

## Run locally

### Easiest method

Open `index.html` in a modern browser. The app has its main rendering libraries bundled locally, so normal Markdown, code highlighting, and MathJax do not require a CDN.

### Recommended local server

Some browsers apply stricter rules to `file://` pages. If you have Python installed, run:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

Windows users can also double-click `run-local.bat`. macOS/Linux users can run `./run-local.sh`.

## Smoke test

If Node.js is installed, you can verify the bundled Markdown renderer with:

```bash
node tests/smoke-test.js
```

## Deploy to Vercel

This project is static. Import the repository into Vercel and deploy with no build command. The included `vercel.json` serves the project directly.

## Project structure

```text
markdownpublish/
├─ index.html
├─ README.md
├─ LICENSE
├─ vercel.json
├─ run-local.bat
├─ run-local.sh
├─ assets/
│  ├─ css/
│  │  └─ styles.css
│  └─ js/
│     ├─ app.js
│     ├─ export.js
│     └─ markdown.js
└─ vendor/
   ├─ marked/
   ├─ highlight/
   └─ mathjax/
```

## PDF export note

`Print / PDF` opens the browser print dialog; choose **Save as PDF**. For browser-native page numbering, you can additionally enable the browser's own “Headers and footers” print option. MarkDownPublish also stores a page-number label preference with the document and places it in the print footer.

## Document settings metadata

Header/footer settings are saved at the top of the Markdown as a compact HTML comment, for example:

```html
<!-- MDP-SETTINGS {"header":"Course · Report","footer":"Author","pageNumbers":true} -->
```

Ordinary Markdown renderers will ignore this comment.

## Notes on exported HTML

The exported HTML contains the currently rendered document and embedded styling. Images inserted through the app are stored as data URLs, making them portable. Math is exported from the rendered preview.


## Third-party libraries

See `THIRD_PARTY_NOTICES.md` for bundled-library licenses and notices.

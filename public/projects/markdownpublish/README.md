# MarkDownPublish

MarkDownPublish is a local-first academic Markdown writing workspace with live HTML/PDF-style preview, LaTeX, reusable document styles, citations, bookmarks, configurable code/table themes, cached local images, file history, and portable HTML/PDF export.

## Current version

**v2.2.0 — 2026-10-01**

## Major features

- Split Markdown editor + live rendered preview
- GitHub-flavored Markdown tables and lists
- Bold, italic, quotations, inline code, fenced code blocks, H1–H3 toolbar, links, equations, images, rules, page breaks, and custom vertical spacing
- Inline and display LaTeX with bundled MathJax
- Bullet, numbered, alphabetic, and Roman numeral lists
- Print/PDF header, footer, and page-number metadata
- Configurable A2/A3/A4/Letter PDF layout, portrait/landscape, margins, and 1–2 columns
- **Save as `.md`**, standalone HTML export, rendered HTML copy, and browser Print / Save as PDF
- Free-form editor and preview font inputs using fonts installed on the current device
- Document Style Studio with reusable styles for H1–H5, paragraph, quotation, code, running header/footer, and tables
- Workspace sidebar with custom styles, file history, and settings
- Browser-local image cache that keeps large base64 data out of the Markdown source
- Persistent file handles in supported Chromium browsers
- Light/dark application modes and GitHub/Jupyter/Midnight editor themes
- **Code themes:** GitHub Light, GitHub Dark, Monokai Pro, Dracula, Gruvbox, and a custom color editor
- **Citation Manager** with numeric or author-year in-text citations, APA/IEEE/ACM/Harvard bibliography formatting, manual entry, BibTeX import, DOI links, and `[@bibliography]`
- **Bookmarks** stored with the document and surfaced in exported HTML navigation
- Standalone HTML export with a wide A3-like reading canvas and a floating clickable table of contents
- Table appearance presets for compact/normal/wide spacing, 35/60/100% width, border style/thickness, and steelblue/coral/lightgreen row palettes
- Word/character counts, reading-time estimate, line/column indicator
- Configurable autosave, tab width, preview mode, and default image width
- Side-by-side editor/preview at widths ≥600px, with an intentional stacked phone layout below 600px
- Inline font-size menu and custom selected-text font/size/color/alignment formatter
- Clean white PDF print stylesheet with fragmentable long code blocks

## Run locally

Use a local web server so browser storage and File System Access features work correctly:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

Windows users can double-click `run-local.bat`. macOS/Linux users can run `./run-local.sh`.

Opening `index.html` directly may work for basic editing, but `file://` pages can lose advanced file-picker capabilities depending on the browser.

## Citations

Open **Cite** in the Content toolbar.

1. Add citations manually or import BibTeX.
2. Type `[@key]` anywhere in Markdown to cite it.
3. Put `[@bibliography]` where the reference list should appear.
4. Keys are case-sensitive.

Example:

```markdown
Privacy guarantees are often analyzed formally [@smith2000].

[@bibliography]
```

The Citation Manager supports:

- numeric display such as `[1]` / `[1, 2]`
- author-year display such as `(Smith, 2000)`
- APA, IEEE, ACM, and Harvard bibliography formatting
- per-entry style override
- title, authors, year, venue/publisher, volume, pages, DOI, and reference type
- BibTeX import

The citation database is stored inside the document's `MDP-SETTINGS` metadata so citations travel with the `.md` file.

## Bookmarks and exported HTML navigation

Use the bookmark icon in **Content** to add a bookmark at the current Markdown selection/cursor. Bookmarks can be renamed, navigated to, or deleted.

Standalone HTML export automatically creates a floating navigation sidebar containing:

- all H1–H5 headings
- custom document bookmarks

The HTML reading canvas is intentionally wider than A4/Letter and uses an A3-like maximum width on large screens. The sidebar collapses into a top navigation block on narrower screens. It is hidden when printing.

## Code themes

The top control bar contains **Code theme** beside **Editor theme**. Available presets:

- GitHub Light
- GitHub Dark
- Monokai Pro
- Dracula
- Gruvbox
- Custom

The circular custom-theme button opens controls for code background, default text, keyword, string/title, number/symbol, comment/meta, and accent/variable colors. The selected code theme is used in preview, standalone HTML, and print/PDF output.

## Table styling

Open **Custom** in the Heading group to launch Document Style Studio. In addition to H1–H5, paragraph, quote, code, and running header/footer controls, v2.2 includes table styling:

- Compact / Normal / Wide cell and line spacing
- Table width: 35%, 60%, or 100%
- Border on/off
- Straight, dashed, or dotted border
- 1 px, 2 px, or 3 px border thickness
- Steel blue, coral, light green, or no accent palette

The requested 35/60/100% values are implemented as **table width**, not border thickness, because percentage-based border thickness is not valid CSS. Border thickness is therefore exposed separately in pixels.

## Local images

Device-uploaded images are stored in browser-local IndexedDB and inserted into Markdown using a short reference such as:

```html
<div class="mdp-image-container" style="text-align:center;">
  <img src="mdp-asset://img-..." data-mdp-asset="img-..." alt="Figure" style="width:50%;max-width:100%;height:auto;display:inline-block;">
</div>
```

Standalone HTML export converts those cached images to embedded data URLs so the HTML remains portable.

## Fonts

The editor and preview font controls are editable text inputs. Type any locally installed font name, for example Lemon Milk, CMU Serif, Quicksand, Latin Modern Roman, JetBrains Mono, Fira Code, Georgia, or Times New Roman.

MarkDownPublish does not bundle font binaries. If a requested font is missing, a safe fallback is used. Standalone HTML does not embed proprietary local fonts, so documents can reflow on another device.

## File history and browser support

The fullest file workflow is available in current Chromium-based browsers such as Edge and Chrome because MarkDownPublish uses the File System Access API when available.

For privacy, browsers do **not** expose raw local filesystem paths. MarkDownPublish stores granted `FileSystemFileHandle` objects in IndexedDB. If a file has been moved/deleted/renamed, access revoked, or the browser does not support persistent handles, reopening it from history may fail.

## Save / export behavior

On browsers with the File System Access API:

- **Save as .md** opens a native Save As picker.
- **Export HTML** opens a native Save As picker.
- `Ctrl/Cmd + S` starts the Markdown Save As workflow.

Other browsers fall back to normal downloads.

PDF output is browser-native: choose **Layout**, then **Print / PDF** → **Save as PDF**. Browser print settings can still override paper size, orientation, or margins. Long code blocks are allowed to split across printed pages so they do not create large blank areas.

## Tests

If Node.js is installed:

```bash
node tests/smoke-test.js
node tests/layout-export-test.js
node tests/v22-test.js
```

## Project structure

```text
MarkDownPublish/
├─ index.html
├─ README.md
├─ UPDATE_NOTES.md
├─ INSTALL_UPDATE.md
├─ VERSION
├─ LICENSE
├─ THIRD_PARTY_NOTICES.md
├─ vercel.json
├─ run-local.bat
├─ run-local.sh
├─ assets/
│  ├─ css/
│  │  ├─ fonts.css
│  │  └─ styles.css
│  ├─ js/
│  │  ├─ app.js
│  │  ├─ export.js
│  │  ├─ layout.js
│  │  ├─ markdown.js
│  │  ├─ references.js
│  │  └─ storage.js
│  └─ images/
├─ tests/
│  ├─ smoke-test.js
│  ├─ layout-export-test.js
│  └─ v22-test.js
└─ vendor/
   ├─ marked/
   ├─ highlight/
   └─ mathjax/
```

## Deployment

The project remains static and Vercel-friendly. No build step or new runtime package is required. Serve over HTTPS for the best File System Access behavior.

## Third-party libraries

See `THIRD_PARTY_NOTICES.md` for bundled-library licenses and notices.

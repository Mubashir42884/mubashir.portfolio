# MarkDownPublish

MarkDownPublish is a local-first academic Markdown writing workspace with live HTML/PDF-style preview, LaTeX rendering, reusable document styles, cached local images, file history, and portable export.

## Major features

- Split Markdown editor + live rendered preview
- GitHub-flavored Markdown tables and lists
- Bold, italic, quotations, inline code, fenced code blocks, H1–H5, links, equations, images, horizontal rules, page breaks, and custom vertical spacing
- Inline and display LaTeX with bundled MathJax
- Bullet, numbered, alphabetic, and Roman numeral lists
- Print/PDF header, footer, and page-number metadata
- HTML view and A4-like PDF preview mode
- **Save as `.md`**, standalone HTML export, rendered HTML copy, and browser Print / Save as PDF
- Free-form editor and preview font inputs using fonts installed on the current device
- Document Style Studio with reusable style presets for H1–H5, paragraph, quotation, and code
- Per-style font, size, color, alignment, line-height, and character-spacing controls
- Workspace sidebar with custom styles, file history, and settings
- Browser-local image cache that keeps large base64 data out of the Markdown source
- Persistent file handles in supported Chromium browsers
- Red → orange → yellow MarkDownPublish branding with light/dark icons
- Light/dark application modes and GitHub/Jupyter/Midnight editor themes
- Word/character counts, reading-time estimate, line/column indicator
- Configurable autosave, tab width, preview mode, and default image width
- Resizable editor/preview split and responsive layout

## Run locally

### Recommended

Use a local web server so browser storage and File System Access features work correctly:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

Windows users can double-click `run-local.bat`. macOS/Linux users can run `./run-local.sh`.

Opening `index.html` directly may still work for basic editing, but `file://` pages can lose advanced file-picker capabilities depending on the browser.

## Browser support

The core editor works in modern browsers. The fullest file workflow is available in current Chromium-based browsers such as Edge and Chrome because MarkDownPublish uses the File System Access API when available.

For privacy, browsers do **not** expose a raw local filesystem path to ordinary web pages. MarkDownPublish therefore stores a granted secure file handle in IndexedDB. If the browser does not support that API, the file can still be opened, but a history item cannot silently reopen the original file later.

## Local images

Device-uploaded images are stored in a browser-local IndexedDB cache and inserted into Markdown using a short HTML reference similar to:

```html
<div class="mdp-image-container" style="text-align:center;">
  <img src="mdp-asset://img-..." data-mdp-asset="img-..." alt="Figure" style="width:50%;max-width:100%;height:auto;display:inline-block;">
</div>
```

This avoids inserting a huge base64 line into the Markdown source.

The cached image is local to the current browser profile. **Export HTML** converts cached assets to embedded data URLs so the resulting standalone HTML remains portable.

## Fonts

The editor and preview font controls are editable text inputs. Type the name of any font installed on your device, for example:

- Lemon Milk
- CMU Serif
- CMU Sans Serif
- CMU Typewriter Text
- Quicksand
- Latin Modern Roman
- JetBrains Mono
- Fira Code
- Georgia
- Times New Roman

MarkDownPublish does not bundle font binaries. If the requested font is unavailable, the app uses a safe serif, sans-serif, or monospace fallback.

## Custom styles

Open the gear icon in the **Heading** toolbar group to launch Document Style Studio. A style can define H1–H5, paragraph, quotation, and code typography independently. Saved styles appear in the sidebar under **Styles** and can be applied, edited, or deleted.

## File history

Use the burger button at the left of the toolbar and open **Files**. Files opened with a persistent browser file handle can be reopened and exported from their three-dot menu. If a remembered file is no longer accessible, MarkDownPublish reports that it was deleted/moved/renamed from the local path.

## Save / export behavior

On browsers with the File System Access API:

- **Save as .md** opens a native Save As picker.
- **Export HTML** opens a native Save As picker.
- `Ctrl/Cmd + S` opens the Markdown Save As workflow.

On unsupported browsers, these actions fall back to a standard download.

PDF output is browser-native: choose **Print / PDF**, then choose **Save as PDF** in the print dialog.

## Smoke test

If Node.js is installed:

```bash
node tests/smoke-test.js
```

## Project structure

```text
MarkDownPublish/
├─ index.html
├─ README.md
├─ UPDATE_NOTES.md
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
│  │  ├─ markdown.js
│  │  └─ storage.js
│  └─ images/
│     ├─ favicon.svg
│     ├─ markdownpublish-icon.svg
│     ├─ markdownpublish-icon-dark.svg
│     ├─ markdownpublish-logo.svg
│     └─ markdownpublish-logo-dark.svg
├─ tests/
└─ vendor/
   ├─ marked/
   ├─ highlight/
   └─ mathjax/
```

## Deployment

The project remains static and Vercel-friendly. No build step is required. Serve the repository over HTTPS for the best File System Access behavior.

## Third-party libraries

See `THIRD_PARTY_NOTICES.md` for bundled-library licenses and notices.

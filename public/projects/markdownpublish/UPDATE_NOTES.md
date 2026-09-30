# MarkDownPublish Update Notes

## 2.1.1 — Print footer overlap hotfix (2026-09-30)

### Fixed

- Fixed a PDF/print pagination bug where an opaque white running-footer layer could cover the final lines of page content.
- Removed the fixed-position DOM header/footer overlay from the print pipeline. Running headers and footers now use CSS paged-media `@page` margin boxes where the browser supports them.
- Fixed the stray `0` page-number artifact caused by evaluating `counter(page)` inside a normal DOM pseudo-element. Page numbering is now generated only inside the page margin context.
- Removed duplicate/conflicting print CSS that allowed the older overlay implementation to remain active after the v2.1 print redesign.
- Added a safety rule: if the selected top or bottom margin is too small to contain running text, the corresponding header/footer/page number is omitted rather than allowed to overlap or clip the document.
- Standalone HTML export now uses the same non-overlapping paged-media header/footer implementation as the in-app Print/PDF workflow.

### Compatibility note

Custom running headers, footers, and page numbers depend on CSS paged-media margin-box support in the browser's print engine. On browsers without that support, MarkDownPublish intentionally omits those running elements instead of falling back to a fixed overlay that could hide document content. The document body and PDF pagination remain printable.

---

## Version 2.1.0 — 2026-09-27

This release addresses print artifacts, unreadable dark-mode previews, selection-specific formatting, page-layout controls, compact toolbars, and laptop responsiveness. Version 2.0 user data and document metadata remain supported.

### Fixed

- **Clean white PDF output:** The print stylesheet now removes preview-pane shadows, editor chrome, theme backgrounds, borders, filters, and decorative page-break overlays. Printing in dark mode forces white paper and print-readable default foregrounds.
- **Dark-mode text contrast:** Built-in/automatic style colors now resolve inside the body theme scope; headings, paragraphs, list items, quotes, and code no longer retain dark foregrounds when the preview background switches to dark.
- **Responsive split editor:** Markdown and preview stay side by side at laptop/tablet widths of **600 px and up**, with adjustable pane widths where space permits. Phone-sized screens below 600 px stack intentionally.
- **Toolbar scrolling:** Groups wrap within available space and use compact icon buttons instead of a horizontal toolbar scrollbar.

### Added

- **Selection-specific text size** menu (9–32 pt) in Format; size changes wrap only the current selection in an editable `<span class="mdp-custom-text">` tag in Markdown.
- **Custom selected-text formatter** (Aa✦): optional installed font, size, explicit color or theme-aware inherited color, plus alignment. Alignment other than “Inherit” makes the selected span a full-width block.
- **Page / PDF Layout dialog** with A2, A3, A4, and Letter; portrait or landscape; none, minimum, normal, wide, and custom margins in millimeters; and one or two columns.
- **Per-document page-layout metadata:** Layout choices are stored in the existing `MDP-SETTINGS` comment so they travel with the Markdown file. Existing files without layout metadata use your browser preference.
- **More focused Document Style Studio:** H1–H5, paragraphs, quotes, code boxes, and running header/footer independently support font, size, color, alignment, and *space before / space after*. Quotes and code boxes also support background colors; code has automatic/light/dark/warm presets. Styles can use theme-aware automatic colors or explicit custom colors.
- **Compact toolbar icons:** Table grid, image paperclip, chain link, code window, three-dash rule, torn page for page break, and H/F for header/footer. Heading toolbar now shows H1, H2, H3, and Custom; H4/H5 remain available in Style Studio and manually via Markdown.
- `assets/js/layout.js` consolidates page-size, orientation, margins, and column defaults for preview and export.
- `tests/layout-export-test.js` adds layout, export, toolbar, and print-style regression checks.

### Important print and browser limitations

- Print / PDF still uses the browser's print engine. It is **not** a pixel-perfect pagination system: page breaks around tall tables, large equations, images, two-column content, and running headers can vary among browsers. The browser print dialog may override the selected paper size, orientation, or margins; select “Save as PDF” and verify its paper settings before saving.
- PDF preview simulates paper width and columns but does not calculate every printed page boundary. For exact pagination, use the browser Print Preview.
- Fonts typed by users must be installed on the device; export does not embed proprietary local font binaries. A different device may use fallback fonts and change wrapping.
- Explicit **custom** light text colors or very dark box backgrounds are printed as requested and may have poor contrast on white PDF paper. The new **Auto text color** and **Auto box color** options are theme-aware and use print-safe defaults.
- Browser file handles, IndexedDB image cache, and Save As dialog capability still depend on browser support and permissions. For the fullest workflow, use a current Chrome/Edge release on HTTPS or localhost. The project has no new runtime library dependency.

### Migration

Copy the update overlay into your existing project and allow matching source files to be replaced. Do **not** delete your browser's local storage/IndexedDB if you want to preserve existing saved styles, autosaved drafts, file-history handles, or image cache. Old `.md` files remain compatible.

---

## Version 2.0.0 — 2026-09-19

This release is a major workspace update focused on custom academic styling, local-first file workflows, cleaner image insertion, and more deliberate document controls.

### Added

- **Free-form local font inputs** for both the Markdown editor and preview. Users can type any font family installed on their device instead of choosing only from a fixed list.
- Font suggestions remain available through a browser datalist for common academic, display, serif, sans-serif, and coding fonts such as Lemon Milk, CMU Serif, Quicksand, Latin Modern, JetBrains Mono, and Fira Code.
- **Image source chooser** with two workflows:
  - URL image insertion.
  - Device upload into a persistent browser-local IndexedDB image cache.
- Device images now use short `mdp-asset://…` references in the Markdown instead of inserting very large base64 data-URL lines.
- URL and cached images are inserted as centered HTML `<img>` content with a configurable width; the default is 50%.
- Standalone HTML export converts cached local images into embedded data URLs so the exported HTML remains portable.
- **Document Style Studio** opened from the gear icon in the Heading group.
- Reusable style presets can customize H1, H2, H3, H4, H5, paragraph, quotation, and code appearance.
- Per-style controls include font, font size, color, alignment, line height, and character/letter spacing.
- Custom styles can be saved under a user-defined name, applied later, edited, or deleted.
- H4 and H5 toolbar buttons.
- **Inline code** toolbar action labeled `</>` that wraps selected text with backticks.
- **Custom vertical-space** tool in the Extra group with configurable value and unit (`px`, `rem`, `em`, or `mm`).
- **Workspace sidebar** opened from a new burger button at the far left of the control bar.
- Sidebar **Styles** section for reusable custom styles with per-style three-dot edit/delete actions.
- Sidebar **Files** section for recently opened Markdown files.
- File history uses persistent File System Access handles when supported by the browser.
- File-history three-dot menu supports Export `.md`, Export HTML, Print/PDF, and Remove from history.
- Sidebar **Settings** panel at the bottom above the MarkDownPublish copyright line.
- Settings for theme, editor theme, default preview mode, tab width, default inserted image width, autosave, and startup document restoration.
- Local app-data reset control for clearing cached images, file history, custom styles, preferences, and the autosaved draft.
- `assets/js/storage.js` for IndexedDB assets, file-history handles, and File System Access helpers.

### Changed

- **Save .md** is now **Save as .md**. On browsers supporting the File System Access API, the browser presents a native Save As picker so the destination can be chosen explicitly.
- **Export HTML** now uses the native Save As picker where supported.
- Browsers without the File System Access API fall back to the standard browser download behavior.
- `Ctrl/Cmd + S` now invokes the Save As Markdown workflow.
- Existing native editor shortcuts remain browser-controlled: Cut, Copy, Paste, Undo, Redo, and Select All.
- Tab indentation now follows the configurable tab-width setting.
- HTML export now carries the active custom document style and cached image content.
- The preview style system now covers H1–H5, paragraph text, quotation blocks, and code rather than only a single preview font.
- Image insertion no longer creates massive base64 lines in the Markdown source.
- The previous fixed font dropdowns have been replaced by editable font-family inputs.

### Browser and security notes

- A normal web page cannot read or store a raw Windows/macOS/Linux filesystem path. For privacy, supported Chromium browsers expose a **FileSystemFileHandle** instead. MarkDownPublish stores that granted handle in IndexedDB and uses it to reopen the file later.
- If a remembered file cannot be accessed because it was deleted, moved, renamed, permission was revoked, or the browser does not support persistent handles, MarkDownPublish reports: **“The file is deleted/moved/renamed from the local path.”**
- Device-uploaded images cannot be silently copied into the MarkDownPublish project directory by browser JavaScript. Version 2.0 therefore uses a persistent browser-local IndexedDB cache and short `mdp-asset://…` references.
- Cached-image Markdown is intended to be reopened in the same browser profile. Use **Export HTML** when a self-contained portable copy is required.
- File System Access APIs work best in current Chromium-based browsers such as Edge and Chrome when the app is served from `localhost` or HTTPS. Opening the app directly through `file://` can disable some advanced file features.
- Print/PDF continues to use the browser print dialog. Choose **Save as PDF** to select the PDF destination.

### Compatibility

- Existing Markdown documents remain compatible.
- Existing `MDP-SETTINGS` header/footer metadata remains supported.
- Existing local font aliases in `assets/css/fonts.css` remain available.
- Existing light/dark themes, GitHub/Jupyter/Midnight editor themes, LaTeX rendering, tables, page breaks, autosave, and live preview remain available.

---

## Version 1.2.0 — 2026-09

### Added

- Red → orange → yellow MarkDownPublish branding.
- Light and dark logo icons and SVG favicon.
- Local-only font aliases for Lemon Milk, CMU Serif/Sans/Typewriter, Quicksand, Latin Modern, JetBrains Mono, Fira Code, Source Code Pro, and related system fonts.
- Expanded editor and preview font menus.

### Changed

- Preview font selection was extended to headings and table headings.
- Standalone HTML export carried the selected preview font into headings.

---

## Version 1.1.1 — 2026-09

### Fixed

- Preserved native `Ctrl/Cmd` editing shortcuts for Cut, Copy, Paste, Undo, Redo, and Select All while retaining MarkDownPublish shortcuts for Bold, Italic, Save, and Tab indentation.

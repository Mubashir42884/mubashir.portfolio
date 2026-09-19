# MarkDownPublish — Update Notes

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

# MarkDownPublish v2.2.0 — Install / Update

This archive contains the **complete MarkDownPublish v2.2.0 project**.

## Update an existing project

1. Commit or back up any source-code changes you made manually.
2. Extract the v2.2.0 ZIP directly into the existing MarkDownPublish project root (the folder containing `index.html`).
3. Allow matching project files to be replaced.
4. Do **not** delete browser localStorage/IndexedDB if you want to keep autosaved drafts, custom styles, cached images, and file-history handles.
5. Hard-refresh after updating: `Ctrl+Shift+R` on Windows/Linux or `Cmd+Shift+R` on macOS.

No npm installation or build step is required.

## Run locally

- Windows: `run-local.bat`
- macOS/Linux: `./run-local.sh`
- Or: `python -m http.server 8080`

Then visit `http://localhost:8080`.

## Optional tests

```bash
node tests/smoke-test.js
node tests/layout-export-test.js
node tests/v22-test.js
```

## Important compatibility notes

- v2.2.0 continues to read existing v2.x `MDP-SETTINGS` metadata and browser preferences.
- Citations and bookmarks are added to `MDP-SETTINGS` metadata only when used.
- Existing custom styles are normalized into the v2.2 schema; table settings use safe defaults when older presets do not contain them.
- File System Access features work best in current Chrome/Edge on HTTPS or localhost.
- PDF output still relies on the browser print engine; verify paper size/margins in Print Preview before saving.

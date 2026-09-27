# MarkDownPublish v2.1 — Install the update

**Recommended for existing projects:** extract `MarkDownPublish-v2.1-update.zip` **inside the existing project root**, next to `index.html`. Allow replacement of matching files. This is an overlay: it does not delete existing files, saved browser data, cached images, or vendor folders.

If you want a fully self-contained archive instead, `MarkDownPublish-v2.1-complete.zip` contains the entire updated project with its bundled libraries. Extract that into an empty directory for a fresh copy, or into your existing project directory to update files in place.

**Before updating:** commit existing changes or back up `index.html`, `assets/css/styles.css`, and `assets/js/app.js` if you edited them manually. The overlay replaces these files; it cannot automatically merge local code customizations. If you already have v2.0, no data migration or npm installation is required.

**After extracting:** hard-refresh the browser (`Ctrl+Shift+R` / `Cmd+Shift+R`) to reload the changed JavaScript and CSS. Browser localStorage and IndexedDB assets persist if you use the same site origin and browser profile. Do not click “Reset local app data” unless you intend to erase locally saved data.

**Run locally:** `run-local.bat` on Windows or `./run-local.sh` on macOS/Linux, or run `python -m http.server 8080` and visit `http://localhost:8080`.

**Smoke tests (optional, Node.js):** `node tests/smoke-test.js` and `node tests/layout-export-test.js`.

**Browser limitation:** File System Access save dialogs work on supported Chromium browsers over HTTPS or localhost. PDF output relies on browser Print / Save as PDF. The selected page setup can be overridden by the print dialog; verify paper size/orientation/margins there.

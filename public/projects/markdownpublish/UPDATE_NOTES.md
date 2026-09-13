# MarkDownPublish — Latest Update

This build incorporates the latest branding and font-selection requests.

## Added

- New red → orange → yellow gradient MarkDownPublish branding.
- Light and dark square logo icons in the application header.
- SVG favicon shown in the browser tab; the favicon follows the app's light/dark theme.
- Full light/dark wordmark SVG files for README, documentation, or future landing pages.
- `assets/css/fonts.css` with local-only aliases. No font binaries are bundled.
- Expanded Editor Font and Preview Font menus with local academic, display, serif, sans-serif, and coding fonts.
- CMU Serif, CMU Sans Serif, CMU Typewriter, Lemon Milk, Quicksand, Latin Modern, JetBrains Mono, Fira Code, Source Code Pro, Cascadia Code, and common system fonts.
- Preview font now applies consistently to headings and table headings as well as body text.
- Standalone HTML export carries the selected preview font into headings too.

## Local font behavior

Local choices rely on fonts already installed on the computer. If a selected font is unavailable, its configured fallback stack is used automatically. This keeps the app portable and avoids shipping font files.

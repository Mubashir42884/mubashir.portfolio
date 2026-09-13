# MarkDownPublish Gradient Logo Pack

This pack is designed to be copied directly into the MarkDownPublish static web app.

## Included assets

```text
assets/images/
├── markdownpublish-logo.svg
├── markdownpublish-logo-dark.svg
├── markdownpublish-icon.svg
├── markdownpublish-icon-dark.svg
└── favicon.svg
```

Accent gradient:

- Red: `#EF4444`
- Orange: `#F97316`
- Yellow: `#FACC15`

---

## 1. Copy the files

Place the `assets/images/` folder in the root of MarkDownPublish.

Expected structure:

```text
MarkDownPublish/
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── images/
│       ├── markdownpublish-logo.svg
│       ├── markdownpublish-logo-dark.svg
│       ├── markdownpublish-icon.svg
│       ├── markdownpublish-icon-dark.svg
│       └── favicon.svg
└── vendor/
```

For the portfolio-hosted version:

```text
mubashir.portfolio/
└── public/
    └── projects/
        └── markdownpublish/
            ├── index.html
            ├── assets/
            │   ├── css/
            │   ├── js/
            │   └── images/
            │       ├── markdownpublish-logo.svg
            │       ├── markdownpublish-logo-dark.svg
            │       ├── markdownpublish-icon.svg
            │       ├── markdownpublish-icon-dark.svg
            │       └── favicon.svg
            └── vendor/
```

---

## 2. Browser-tab favicon

Inside `index.html`, put this inside `<head>`:

```html
<link rel="icon" type="image/svg+xml" href="assets/images/favicon.svg">
```

Recommended nearby metadata:

```html
<title>MarkDownPublish</title>
<meta name="theme-color" content="#F97316">
<link rel="icon" type="image/svg+xml" href="assets/images/favicon.svg">
```

---

## 3. Full logo in the app header

Use this inside the top navigation/header:

```html
<a class="app-brand" href="#" aria-label="MarkDownPublish home">
  <img
    src="assets/images/markdownpublish-logo.svg"
    alt="MarkDownPublish"
    class="brand-logo logo-light"
  >
  <img
    src="assets/images/markdownpublish-logo-dark.svg"
    alt="MarkDownPublish"
    class="brand-logo logo-dark"
  >
</a>
```

Add this to your CSS:

```css
.app-brand {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}

.brand-logo {
  display: block;
  width: 190px;
  max-width: 42vw;
  height: auto;
}

.logo-dark {
  display: none;
}

.logo-light {
  display: block;
}

/* Use whichever dark selector your app already uses. */
body.dark .logo-light,
html.dark .logo-light,
[data-theme="dark"] .logo-light {
  display: none;
}

body.dark .logo-dark,
html.dark .logo-dark,
[data-theme="dark"] .logo-dark {
  display: block;
}
```

If your app uses a different dark-mode selector, replace the selector accordingly.

---

## 4. Compact header option

For a toolbar-heavy editor, this version takes less space:

```html
<a class="compact-brand" href="#" aria-label="MarkDownPublish home">
  <img
    src="assets/images/markdownpublish-icon.svg"
    alt=""
    class="compact-brand-icon icon-light"
  >
  <img
    src="assets/images/markdownpublish-icon-dark.svg"
    alt=""
    class="compact-brand-icon icon-dark"
  >
  <span class="compact-brand-name">MarkDownPublish</span>
</a>
```

CSS:

```css
.compact-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: inherit;
  text-decoration: none;
  flex-shrink: 0;
}

.compact-brand-icon {
  width: 38px;
  height: 38px;
}

.compact-brand-name {
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  font-size: 1.05rem;
  font-weight: 750;
  letter-spacing: -0.02em;
}

.icon-dark {
  display: none;
}

body.dark .icon-light,
html.dark .icon-light,
[data-theme="dark"] .icon-light {
  display: none;
}

body.dark .icon-dark,
html.dark .icon-dark,
[data-theme="dark"] .icon-dark {
  display: block;
}
```

---

## 5. Suggested header skeleton

```html
<header class="topbar">
  <div class="topbar-left">
    <!-- Paste either the full-logo or compact-logo block here. -->
  </div>

  <div class="topbar-actions">
    <button type="button">Save MD</button>
    <button type="button">Export HTML</button>
    <button type="button">Print / PDF</button>
    <button type="button" aria-label="Toggle theme">Theme</button>
  </div>
</header>
```

---

## 6. Recommended choice

Use:

- `favicon.svg` for the browser tab.
- `markdownpublish-icon.svg` + the text `MarkDownPublish` in the editor toolbar if space is tight.
- `markdownpublish-logo.svg` for README, landing page, portfolio cards, and documentation.
- The `*-dark.svg` assets whenever the editor is in dark mode.

No PNG conversion is required. Modern browsers render SVG favicons and `<img>` SVG assets directly.

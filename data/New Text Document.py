from pathlib import Path

out = Path("/mnt/data/markdownpublish-logo")
out.mkdir(parents=True, exist_ok=True)

logo_svg = '''<svg width="512" height="160" viewBox="0 0 512 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <title>MarkDownPublish Logo</title>
  <desc>Minimal MarkDownPublish logo with an M-shaped markdown mark and publish arrow.</desc>

  <rect x="8" y="8" width="144" height="144" rx="32" fill="#F2EEFF"/>
  <rect x="9" y="9" width="142" height="142" rx="31" stroke="#7B6CF6" stroke-width="2"/>

  <!-- Markdown-inspired M -->
  <path d="M40 48V108" stroke="#42379A" stroke-width="12" stroke-linecap="round"/>
  <path d="M40 50L63 78L86 50V108" stroke="#42379A" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Publish / export arrow -->
  <path d="M104 57V101" stroke="#7B6CF6" stroke-width="10" stroke-linecap="round"/>
  <path d="M89 72L104 57L119 72" stroke="#7B6CF6" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M87 109H121" stroke="#7B6CF6" stroke-width="10" stroke-linecap="round"/>

  <!-- Wordmark -->
  <text x="178" y="79"
        font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="42" font-weight="700" fill="#26233A">MarkDown</text>
  <text x="178" y="121"
        font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="42" font-weight="500" fill="#7B6CF6">Publish</text>
</svg>
'''

icon_svg = '''<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <title>MarkDownPublish Icon</title>
  <rect x="4" y="4" width="120" height="120" rx="28" fill="#F2EEFF"/>
  <rect x="5" y="5" width="118" height="118" rx="27" stroke="#7B6CF6" stroke-width="2"/>

  <path d="M27 37V91" stroke="#42379A" stroke-width="10" stroke-linecap="round"/>
  <path d="M27 39L46 62L65 39V91" stroke="#42379A" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>

  <path d="M84 45V80" stroke="#7B6CF6" stroke-width="9" stroke-linecap="round"/>
  <path d="M72 57L84 45L96 57" stroke="#7B6CF6" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M70 88H98" stroke="#7B6CF6" stroke-width="9" stroke-linecap="round"/>
</svg>
'''

dark_logo_svg = logo_svg.replace("#F2EEFF", "#171524").replace("#26233A", "#F4F1FF").replace("#42379A", "#D7D0FF")
dark_icon_svg = icon_svg.replace("#F2EEFF", "#171524").replace("#42379A", "#D7D0FF")

(out / "markdownpublish-logo.svg").write_text(logo_svg, encoding="utf-8")
(out / "markdownpublish-icon.svg").write_text(icon_svg, encoding="utf-8")
(out / "markdownpublish-logo-dark.svg").write_text(dark_logo_svg, encoding="utf-8")
(out / "markdownpublish-icon-dark.svg").write_text(dark_icon_svg, encoding="utf-8")

print(f"Created files in {out}")

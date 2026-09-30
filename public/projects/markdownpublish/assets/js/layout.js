/* Shared, dependency-free page layout normalization for preview and HTML export. */
(function () {
  'use strict';
  const SIZES = Object.freeze({ A2: [420, 594], A3: [297, 420], A4: [210, 297], Letter: [215.9, 279.4] });
  const MARGINS = Object.freeze({ none: 0, minimum: 6, normal: 18, wide: 28 });
  const DEFAULT = Object.freeze({ pageSize: 'A4', orientation: 'portrait', margins: 'normal', custom: [18, 18, 18, 18], columns: 1 });
  function normalize(source) {
    const raw = source && typeof source === 'object' ? source : {};
    const pageSize = Object.hasOwn(SIZES, raw.pageSize) ? raw.pageSize : DEFAULT.pageSize;
    const orientation = raw.orientation === 'landscape' ? 'landscape' : 'portrait';
    const margins = Object.hasOwn(MARGINS, raw.margins) || raw.margins === 'custom' ? raw.margins : DEFAULT.margins;
    const custom = Array.from({ length: 4 }, (_, i) => {
      const n = Number(Array.isArray(raw.custom) ? raw.custom[i] : DEFAULT.custom[i]);
      return Number.isFinite(n) ? Math.max(0, Math.min(70, n)) : DEFAULT.custom[i];
    });
    return { pageSize, orientation, margins, custom, columns: Number(raw.columns) === 2 ? 2 : 1 };
  }
  function metrics(raw) {
    const value = normalize(raw);
    const [w, h] = SIZES[value.pageSize];
    const dimensions = value.orientation === 'landscape' ? [h, w] : [w, h];
    const margin = value.margins === 'custom' ? value.custom : Array(4).fill(MARGINS[value.margins]);
    return { ...value, width: dimensions[0], height: dimensions[1], margin };
  }
  function pageRule(raw) {
    const value = metrics(raw);
    const four = value.margin.map(n => `${n}mm`).join(' ');
    return `@page { size: ${value.pageSize} ${value.orientation}; margin: ${four}; }`;
  }
  function cssVars(raw) {
    const value = metrics(raw);
    return {
      '--mdp-paper-width': `${value.width}mm`,
      '--mdp-paper-height': `${value.height}mm`,
      '--mdp-margin-top': `${value.margin[0]}mm`,
      '--mdp-margin-right': `${value.margin[1]}mm`,
      '--mdp-margin-bottom': `${value.margin[2]}mm`,
      '--mdp-margin-left': `${value.margin[3]}mm`,
      '--mdp-print-columns': String(value.columns)
    };
  }

  // Running headers/footers belong in the page margin, not in fixed DOM overlays.
  // Browsers that support CSS paged-media margin boxes will render these safely.
  // Browsers that do not support them simply omit the running chrome rather than
  // covering document text.
  function cssString(value) {
    return `"${String(value || '')
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\r?\n/g, '\\A ')}"`;
  }

  function safeStyle(style, fallback) {
    const raw = style && typeof style === 'object' ? style : {};
    const align = ['left','center','right'].includes(raw.align) ? raw.align : fallback.align;
    const fontFamily = String(raw.fontFamily || fallback.fontFamily).replace(/[{}<>;]/g, '').trim() || fallback.fontFamily;
    const fontSize = /^(?:[0-9]{1,3}(?:\.[0-9]{1,2})?|\.[0-9]{1,2})(?:px|rem|em|pt|mm|cm)$/.test(String(raw.fontSize || '').trim())
      ? String(raw.fontSize).trim() : fallback.fontSize;
    const color = /^#[0-9a-f]{6}$/i.test(String(raw.color || '').trim()) ? String(raw.color).trim() : fallback.color;
    return { align, fontFamily, fontSize, color };
  }

  function marginBoxRule(raw, options) {
    const value = metrics(raw);
    const opts = options && typeof options === 'object' ? options : {};
    const header = String(opts.header || '').trim();
    const footer = String(opts.footer || '').trim();
    const pageNumbers = Boolean(opts.pageNumbers);
    const headerStyle = safeStyle(opts.headerStyle, { align:'left', fontFamily:'Arial, sans-serif', fontSize:'9pt', color:'#555555' });
    const footerStyle = safeStyle(opts.footerStyle, { align:'left', fontFamily:'Arial, sans-serif', fontSize:'9pt', color:'#555555' });

    // Very small/zero margins cannot safely hold running content. Omitting it is
    // preferable to clipping or painting over the document body.
    const headerAllowed = value.margin[0] >= 8;
    const footerAllowed = value.margin[2] >= 8;
    const rules = [];
    const boxFor = (edge, align) => `@${edge}-${align === 'center' ? 'center' : align === 'right' ? 'right' : 'left'}`;
    const declarations = style => `font-family:${style.fontFamily};font-size:${style.fontSize};color:${style.color};`;

    if (header && headerAllowed) {
      rules.push(`${boxFor('top', headerStyle.align)} { content: ${cssString(header)}; ${declarations(headerStyle)} }`);
    }

    let footerBox = null;
    if (footer && footerAllowed) {
      footerBox = boxFor('bottom', footerStyle.align);
      rules.push(`${footerBox} { content: ${cssString(footer)}; ${declarations(footerStyle)} }`);
    }

    if (pageNumbers && footerAllowed) {
      // Keep the page number away from a right-aligned footer.
      const pageBox = footerBox === '@bottom-right' ? '@bottom-left' : '@bottom-right';
      rules.push(`${pageBox} { content: "Page " counter(page); font-family:Arial,sans-serif;font-size:9pt;color:#555555; }`);
    }

    return rules.length ? `@page {\n  ${rules.join('\n  ')}\n}` : '';
  }

  window.MDPLayout = { DEFAULT, normalize, metrics, pageRule, cssVars, marginBoxRule };
})();

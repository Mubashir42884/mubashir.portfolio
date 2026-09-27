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
  window.MDPLayout = { DEFAULT, normalize, metrics, pageRule, cssVars };
})();

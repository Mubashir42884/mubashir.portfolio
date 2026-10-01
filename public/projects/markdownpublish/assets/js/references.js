(function () {
  'use strict';

  const KEY_RE = /^[A-Za-z0-9:_-]+$/;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function cleanText(value, max) {
    return String(value == null ? '' : value).replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, max || 1000);
  }

  function normalizeCitation(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const key = cleanText(source.key, 120).replace(/^@/, '');
    return {
      key,
      type: ['journal','book','conference','web','thesis','report','other'].includes(source.type) ? source.type : 'journal',
      style: ['inherit','apa','ieee','acm','harvard'].includes(source.style) ? source.style : 'inherit',
      title: cleanText(source.title, 500),
      authors: cleanText(source.authors, 600),
      year: cleanText(source.year, 20),
      venue: cleanText(source.venue, 500),
      volume: cleanText(source.volume, 80),
      pages: cleanText(source.pages, 80),
      doi: cleanText(source.doi, 300).replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
    };
  }

  function normalizeSettings(settings) {
    const source = settings && typeof settings === 'object' ? settings : {};
    return {
      citationMode: source.citationMode === 'author-year' ? 'author-year' : 'numeric',
      citationStyle: ['apa','ieee','acm','harvard'].includes(source.citationStyle) ? source.citationStyle : 'apa',
      citationColor: /^#[0-9a-f]{6}$/i.test(String(source.citationColor || '')) ? source.citationColor : '#526b5a',
      citations: Array.isArray(source.citations) ? source.citations.map(normalizeCitation).filter(item => KEY_RE.test(item.key)) : []
    };
  }

  function parseAuthors(value) {
    return cleanText(value, 600).split(/\s*;\s*/).map(v => v.trim()).filter(Boolean);
  }

  function displayAuthor(author) {
    const text = String(author || '').trim();
    if (!text) return '';
    const parts = text.split(',').map(v => v.trim());
    if (parts.length >= 2) return `${parts[1]} ${parts[0]}`.trim();
    return text;
  }

  function surname(author) {
    const text = String(author || '').trim();
    if (!text) return 'Unknown';
    if (text.includes(',')) return text.split(',')[0].trim() || 'Unknown';
    const parts = text.split(/\s+/);
    return parts[parts.length - 1] || 'Unknown';
  }

  function authorYearLabel(citation) {
    const authors = parseAuthors(citation.authors);
    let name = authors.length ? surname(authors[0]) : 'Unknown';
    if (authors.length === 2) name = `${surname(authors[0])} & ${surname(authors[1])}`;
    if (authors.length > 2) name = `${surname(authors[0])} et al.`;
    return `${name}, ${citation.year || 'n.d.'}`;
  }

  function authorsText(citation) {
    const authors = parseAuthors(citation.authors).map(displayAuthor);
    if (!authors.length) return 'Unknown author';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
    return `${authors.slice(0, -1).join(', ')}, and ${authors[authors.length - 1]}`;
  }

  function doiHtml(doi) {
    const clean = cleanText(doi, 300);
    if (!clean) return '';
    const href = `https://doi.org/${encodeURI(clean).replace(/%2F/gi, '/')}`;
    return ` <a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">https://doi.org/${escapeHtml(clean)}</a>`;
  }

  function formatReference(citation, styleName, number) {
    const c = normalizeCitation(citation);
    const style = c.style !== 'inherit' ? c.style : (['apa','ieee','acm','harvard'].includes(styleName) ? styleName : 'apa');
    const authors = escapeHtml(authorsText(c));
    const title = escapeHtml(c.title || 'Untitled');
    const year = escapeHtml(c.year || 'n.d.');
    const venue = escapeHtml(c.venue || '');
    const volume = escapeHtml(c.volume || '');
    const pages = escapeHtml(c.pages || '');
    const doi = doiHtml(c.doi);
    const venueBit = venue ? `<em>${venue}</em>` : '';
    const volumeBit = volume ? `${venueBit ? ', ' : ''}vol. ${volume}` : '';
    const pagesBit = pages ? `${venueBit || volume ? ', ' : ''}pp. ${pages}` : '';

    if (style === 'ieee') {
      return `${authors}, “${title},” ${venueBit}${volumeBit}${pagesBit}${venueBit || volume || pages ? ', ' : ''}${year}.${doi}`;
    }
    if (style === 'acm') {
      return `${authors}. ${year}. ${title}.${venueBit ? ` ${venueBit}.` : ''}${volume ? ` Vol. ${volume}.` : ''}${pages ? ` ${pages}.` : ''}${doi}`;
    }
    if (style === 'harvard') {
      return `${authors} (${year}) ‘${title}’.${venueBit ? ` ${venueBit}` : ''}${volume ? `, ${volume}` : ''}${pages ? `, pp. ${pages}` : ''}.${doi}`;
    }
    return `${authors} (${year}). ${title}.${venueBit ? ` ${venueBit}` : ''}${volume ? `, ${volume}` : ''}${pages ? `, ${pages}` : ''}.${doi}`;
  }

  function citationMatches(text) {
    const matches = [];
    const re = /\[((?:\s*@[A-Za-z0-9:_-]+\s*[,;]?\s*)+)\]/g;
    let match;
    while ((match = re.exec(text))) {
      const keys = Array.from(match[1].matchAll(/@([A-Za-z0-9:_-]+)/g)).map(m => m[1]);
      if (keys.length) matches.push({ raw: match[0], index: match.index, keys });
    }
    return matches;
  }

  function splitProtected(source) {
    return String(source || '').split(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/g);
  }

  function preprocessMarkdown(markdown, documentSettings) {
    const settings = normalizeSettings(documentSettings);
    if (!settings.citations.length && !String(markdown || '').includes('[@bibliography]')) return String(markdown || '');
    const citationMap = new Map(settings.citations.map(item => [item.key, item]));
    const pieces = splitProtected(markdown);
    const usedKeys = [];
    const seen = new Set();

    pieces.forEach(piece => {
      if (/^(?:```|~~~|`)/.test(piece)) return;
      citationMatches(piece).forEach(match => match.keys.forEach(key => {
        if (citationMap.has(key) && !seen.has(key)) {
          seen.add(key);
          usedKeys.push(key);
        }
      }));
    });

    const numbers = new Map(usedKeys.map((key, index) => [key, index + 1]));
    const allOrdered = usedKeys.concat(settings.citations.map(c => c.key).filter(key => !seen.has(key)));

    function bibliographyHtml() {
      if (!settings.citations.length) return '<section class="mdp-bibliography"><h2>References</h2><p class="mdp-reference-missing">No citations have been added.</p></section>';
      const entries = allOrdered.map((key, index) => {
        const citation = citationMap.get(key);
        const number = settings.citationMode === 'numeric' ? (numbers.get(key) || index + 1) : null;
        return `<li id="ref-${escapeHtml(key)}" data-citation-key="${escapeHtml(key)}">${formatReference(citation, settings.citationStyle, number)}</li>`;
      }).join('');
      return `<section class="mdp-bibliography" aria-label="References"><h2>References</h2><ol class="mdp-reference-list ${settings.citationMode === 'numeric' ? 'numeric' : 'author-year'}">${entries}</ol></section>`;
    }

    return pieces.map(piece => {
      if (/^(?:```|~~~|`)/.test(piece)) return piece;
      let out = piece.replace(/\[\s*@bibliography\s*\]/gi, bibliographyHtml());
      out = out.replace(/\[((?:\s*@[A-Za-z0-9:_-]+\s*[,;]?\s*)+)\]/g, (full, inner) => {
        const keys = Array.from(inner.matchAll(/@([A-Za-z0-9:_-]+)/g)).map(m => m[1]);
        if (!keys.length) return full;
        const missing = keys.filter(key => !citationMap.has(key));
        if (missing.length) {
          return `<span class="mdp-citation mdp-citation-missing" title="Missing citation: ${escapeHtml(missing.join(', '))}">${escapeHtml(full)}</span>`;
        }
        const label = settings.citationMode === 'numeric'
          ? `[${keys.map(key => numbers.get(key) || (usedKeys.push(key), usedKeys.length)).join(', ')}]`
          : `(${keys.map(key => authorYearLabel(citationMap.get(key))).join('; ')})`;
        const href = keys.length === 1 ? ` href="#ref-${escapeHtml(keys[0])}"` : '';
        return `<a class="mdp-citation"${href} style="color:${settings.citationColor};">${escapeHtml(label)}</a>`;
      });
      return out;
    }).join('');
  }

  function stripBibValue(value) {
    let text = String(value || '').trim();
    while ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('"') && text.endsWith('"'))) text = text.slice(1, -1).trim();
    return text.replace(/[{}]/g, '').trim();
  }

  function parseBibtex(input) {
    const source = String(input || '');
    const entries = [];
    let i = 0;
    while (i < source.length) {
      const at = source.indexOf('@', i);
      if (at < 0) break;
      const header = source.slice(at).match(/^@([A-Za-z]+)\s*\{\s*([^,\s]+)\s*,/);
      if (!header) { i = at + 1; continue; }
      const typeRaw = header[1].toLowerCase();
      const key = header[2].trim();
      const bodyStart = at + header[0].length;
      let depth = 1;
      let pos = bodyStart;
      let quote = false;
      while (pos < source.length && depth > 0) {
        const ch = source[pos];
        if (ch === '"' && source[pos - 1] !== '\\') quote = !quote;
        if (!quote) {
          if (ch === '{') depth++;
          if (ch === '}') depth--;
        }
        pos++;
      }
      const body = source.slice(bodyStart, Math.max(bodyStart, pos - 1));
      const fields = {};
      let current = '';
      let fieldDepth = 0;
      let fieldQuote = false;
      const chunks = [];
      for (let p = 0; p < body.length; p++) {
        const ch = body[p];
        if (ch === '"' && body[p - 1] !== '\\') fieldQuote = !fieldQuote;
        if (!fieldQuote) {
          if (ch === '{') fieldDepth++;
          if (ch === '}') fieldDepth--;
        }
        if (ch === ',' && fieldDepth === 0 && !fieldQuote) { chunks.push(current); current = ''; }
        else current += ch;
      }
      if (current.trim()) chunks.push(current);
      chunks.forEach(chunk => {
        const eq = chunk.indexOf('=');
        if (eq < 0) return;
        const name = chunk.slice(0, eq).trim().toLowerCase();
        fields[name] = stripBibValue(chunk.slice(eq + 1));
      });
      const type = typeRaw.includes('book') && typeRaw !== 'inbook' ? 'book'
        : typeRaw.includes('conference') || typeRaw === 'inproceedings' || typeRaw === 'proceedings' ? 'conference'
        : typeRaw.includes('thesis') ? 'thesis'
        : typeRaw === 'techreport' ? 'report'
        : typeRaw === 'misc' || typeRaw === 'online' ? 'web'
        : typeRaw === 'article' ? 'journal' : 'other';
      entries.push(normalizeCitation({
        key,
        type,
        style: 'inherit',
        title: fields.title || '',
        authors: (fields.author || '').split(/\s+and\s+/i).join('; '),
        year: fields.year || '',
        venue: fields.journal || fields.booktitle || fields.publisher || fields.institution || fields.school || '',
        volume: fields.volume || fields.number || '',
        pages: fields.pages || '',
        doi: fields.doi || ''
      }));
      i = pos;
    }
    return entries.filter(item => KEY_RE.test(item.key));
  }

  window.MDPReferences = {
    KEY_RE,
    normalizeCitation,
    normalizeSettings,
    preprocessMarkdown,
    parseBibtex,
    formatReference,
    authorYearLabel
  };
})();

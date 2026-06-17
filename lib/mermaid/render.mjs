/**
 * Async post-processor that replaces `.marp-mermaid` placeholders (emitted by
 * plugin.mjs) with inline, brand-themed SVG.
 *
 * Rendering happens at build time in a headless browser via
 * @mermaid-js/mermaid-cli, so the resulting SVG is static: it looks identical
 * in every Marp export (PDF / PNG / PPTX / HTML) with no CDN, no client-side
 * script, and no VS Code "insecure content" prompts.
 */
import crypto from 'node:crypto';

import { renderMermaid } from '@mermaid-js/mermaid-cli';
import { JSDOM } from 'jsdom';
import puppeteer from 'puppeteer';

/** Woodmark brand styling applied to every diagram (light theme). */
const MERMAID_CONFIG_LIGHT = {
  theme: 'base',
  themeVariables: {
    // Node fills / borders / text.
    primaryColor: '#e7f3e8', // --wm-tint
    primaryBorderColor: '#009b3e', // --wm-green
    primaryTextColor: '#204232', // --wm-ink
    secondaryColor: '#d6ebd9',
    secondaryBorderColor: '#009b3e',
    secondaryTextColor: '#204232',
    tertiaryColor: '#ffffff',
    tertiaryBorderColor: '#009a9d', // --wm-teal
    tertiaryTextColor: '#204232',
    // Edges / labels.
    lineColor: '#009b3e',
    edgeLabelBackground: '#ffffff',
    clusterBkg: '#ffffff',
    clusterBorder: '#009b3e',
    // Typography.
    fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
    fontSize: '18px',
  },
};

/** Dark-theme variant — used when the deck sets `<!-- class: dark -->`.
 *  Same fixed palette, remapped: ink/mid node fills, white text, green accents
 *  and lighter lines so edges read on the dark slide. */
const MERMAID_CONFIG_DARK = {
  theme: 'base',
  themeVariables: {
    // Node fills / borders / text.
    primaryColor: '#204232', // --wm-ink
    primaryBorderColor: '#009b3e', // --wm-green
    primaryTextColor: '#ffffff',
    secondaryColor: '#2d5c47', // --wm-mid
    secondaryBorderColor: '#009b3e',
    secondaryTextColor: '#ffffff',
    tertiaryColor: '#2d5c47',
    tertiaryBorderColor: '#009a9d', // --wm-teal
    tertiaryTextColor: '#ffffff',
    // Edges / labels.
    lineColor: '#7fbf9a',
    textColor: '#ffffff',
    edgeLabelBackground: '#204232',
    clusterBkg: '#204232',
    clusterBorder: '#009b3e',
    // Typography.
    fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
    fontSize: '18px',
  },
};

const mermaidConfig = (dark) =>
  dark ? MERMAID_CONFIG_DARK : MERMAID_CONFIG_LIGHT;


// Cache rendered SVGs across render() calls (keyed by definition + options) so
// repeated or identical diagrams are only rasterised once. The browser itself
// is NOT cached: it is launched and closed within each render() call so the
// Marp CLI process can exit cleanly instead of hanging on an open browser.
const svgCache = new Map();

/** Parse a `key=value key2=value2` option string into an object. */
function parseOpts(optsStr) {
  const opts = {};
  for (const match of (optsStr || '').matchAll(/([\w-]+)=([^\s]+)/g)) {
    opts[match[1]] = match[2];
  }
  return opts;
}

/** Render a single Mermaid definition to an SVG string (cached). */
async function renderOne(browser, base64Src, optsStr, dark) {
  const definition = Buffer.from(base64Src, 'base64').toString('utf8');
  const cacheKey = crypto
    .createHash('sha1')
    .update(`${dark ? 'dark' : 'light'}|${definition}|${optsStr}`)
    .digest('hex');

  if (svgCache.has(cacheKey)) return svgCache.get(cacheKey);

  const { data } = await renderMermaid(browser, definition, 'svg', {
    backgroundColor: 'transparent',
    mermaidConfig: mermaidConfig(dark),
  });

  const svg = typeof data === 'string' ? data : Buffer.from(data).toString('utf8');
  const result = { svg, opts: parseOpts(optsStr) };
  svgCache.set(cacheKey, result);
  return result;
}

/** Coerce a width/height option ("900" or "80%") into a CSS length. */
function toCssLength(value) {
  return /^\d+$/.test(value) ? `${value}px` : value;
}

/**
 * Replace every `.marp-mermaid` placeholder in the rendered slide HTML with an
 * inline themed SVG. Returns the transformed HTML.
 *
 * @param {string} html  Rendered slide HTML containing placeholders.
 * @param {object} [options]
 * @param {boolean} [options.dark]  Render diagrams with the dark palette.
 */
export async function renderMermaidPlaceholders(html, { dark = false } = {}) {
  if (!html || !html.includes('marp-mermaid')) return html;

  const dom = new JSDOM(`<!DOCTYPE html><body>${html}</body>`);
  const { document } = dom.window;
  const nodes = [...document.querySelectorAll('.marp-mermaid')];
  if (nodes.length === 0) return html;

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const node of nodes) {
      const src = node.getAttribute('data-src');
      const optsStr = node.getAttribute('data-opts') || '';
      const { svg, opts } = await renderOne(browser, src, optsStr, dark);

      const wrapper = document.createElement('div');
      wrapper.className = 'marp-mermaid';
      wrapper.style.textAlign = opts.align || 'center';
      wrapper.innerHTML = svg;

      const svgEl = wrapper.querySelector('svg');
      if (svgEl) {
        svgEl.removeAttribute('height');
        svgEl.style.height = 'auto';
        svgEl.style.display = 'inline-block';
        svgEl.style.maxWidth = '100%';
        if (opts.w) svgEl.style.width = toCssLength(opts.w);
        if (opts.h) svgEl.style.maxHeight = toCssLength(opts.h);
      }

      node.replaceWith(wrapper);
    }
  } finally {
    await browser.close();
  }

  return document.body.innerHTML;
}

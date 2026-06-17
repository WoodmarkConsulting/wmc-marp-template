/**
 * Marp CLI configuration for the Woodmark slide template.
 *
 * Provides a custom engine that renders ```mermaid fenced blocks to inline,
 * themed SVG at build time. Run from the repository root, e.g.:
 *
 *   npm run build -- decks/layout-test-light.md -o dist/layout-test-light.pdf
 *   # or directly:
 *   npx marp --config marp.config.mjs decks/layout-test-light.md -o out.pdf
 *
 * Note: this custom engine only runs during CLI export. The VS Code Marp
 * preview cannot load custom engines, so ```mermaid blocks appear as plain
 * code there. The exported deck is the source of truth for diagrams.
 */
import { Marp } from '@marp-team/marp-core';
import puppeteer from 'puppeteer';

import marpMermaidPlugin from './lib/mermaid/plugin.mjs';
import { renderMermaidPlaceholders } from './lib/mermaid/render.mjs';

// marp-cli's browser finder only looks for system-installed browsers (chrome,
// edge, firefox) and does not discover the Chromium that `npm install`
// downloads via Puppeteer. When CHROME_PATH isn't already set, point it at
// Puppeteer's bundled browser so exports work out of the box.
if (!process.env.CHROME_PATH) {
  try {
    const bundled = puppeteer.executablePath();
    if (bundled) process.env.CHROME_PATH = bundled;
  } catch {
    // Fall back to marp-cli's own detection if Puppeteer can't resolve a path.
  }
}

/** Marp engine with build-time Mermaid rendering. */
class MermaidMarp extends Marp {
  constructor(opts) {
    super(opts);
    this.use(marpMermaidPlugin);
  }

  // marp-cli awaits engine.render(), so an async override is supported.
  async render(markdown) {
    const result = super.render(markdown);
    result.html = await renderMermaidPlaceholders(result.html, {
      dark: deckIsDark(markdown),
    });
    return result;
  }
}

/**
 * Detect whether a deck opts into the dark theme so Mermaid diagrams match the
 * slides. Mirrors the CSS switch: the deck selects `theme: woodmark-dark` in its
 * front-matter (the supported whole-deck switch). A `dark` class directive
 * (global `class:` or per-slide `_class:`) is also honoured for completeness.
 */
function deckIsDark(markdown) {
  if (/^\s*theme:\s*woodmark-dark\s*$/m.test(markdown)) return true;
  const directive = /_?class:\s*([A-Za-z0-9_\- ]+)/g;
  for (const [, value] of markdown.matchAll(directive)) {
    if (/(^|\s)dark(\s|$)/.test(value.trim())) return true;
  }
  return false;
}

export default {
  engine: MermaidMarp,
  themeSet: ['./themes/woodmark-light.css', './themes/woodmark-dark.css'],
  html: true,
  allowLocalFiles: true,
};

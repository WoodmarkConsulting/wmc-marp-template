/**
 * Marp CLI configuration for the Woodmark slide template.
 *
 * Provides a custom engine that renders ```mermaid fenced blocks to inline,
 * themed SVG at build time. Run from the repository root, e.g.:
 *
 *   npm run build -- decks/layout-test.md -o dist/layout-test.pdf
 *   # or directly:
 *   npx marp --config marp.config.mjs decks/layout-test.md -o out.pdf
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
    result.html = await renderMermaidPlaceholders(result.html);
    return result;
  }
}

export default {
  engine: MermaidMarp,
  themeSet: ['./themes/woodmark.css'],
  html: true,
  allowLocalFiles: true,
};

# AGENTS.md

Woodmark Consulting corporate **Marp** slide template: a branded theme plus
build-time **Mermaid** rendering. Authors write Markdown decks; the CLI exports
on-brand PDF / PPTX / PNG / HTML. There is no application server or test suite —
the "build" is exporting decks.

See [README.md](README.md) for full authoring docs (layouts, helper classes,
brand tokens, troubleshooting). Avoid duplicating it; link to it instead.

## Architecture

The custom Marp engine lives in [marp.config.mjs](marp.config.mjs) and wires two
pieces together:

- [lib/mermaid/plugin.mjs](lib/mermaid/plugin.mjs) — a synchronous markdown-it
  plugin that turns ` ```mermaid ` fences into `.marp-mermaid` placeholder
  `<div>`s (the source is base64-encoded, fence options preserved).
- [lib/mermaid/render.mjs](lib/mermaid/render.mjs) — an async post-processor
  (`render()` override) that replaces those placeholders with inline,
  Woodmark-themed SVG via a headless Chromium. Diagram palette = `MERMAID_CONFIG`.

The placeholder split exists because markdown-it is synchronous but Mermaid
rendering needs an async browser step.

The visual brand is entirely in [themes/woodmark.css](themes/woodmark.css)
(extends Marpit's `default`). Slide layouts are CSS classes applied per slide.

## Build & export commands

All exports MUST go through the config so the theme and Mermaid engine load:
`marp --config marp.config.mjs`. Bare `marp` skips Mermaid rendering.

| Command | Purpose |
| --- | --- |
| `npm install` | Install tooling; downloads Chromium via Puppeteer |
| `npm run build -- decks/<deck>.md -o decks/rendered/<out>.pdf` | Export one deck (pass marp flags after `--`) |
| `npm run build:rendered` | PDF+HTML for both starter and layout-test to `decks/rendered/` |
| `npm run server` | Start the local preview server at `http://localhost:8080/` |
| `npm run watch` | Rebuild `decks/` on change |

Output goes to `decks/rendered/` (git-ignored) — never commit generated files.

## Conventions

- **ESM only**: package is `"type": "module"`; use `import`, `.mjs`.
- **Authoring a deck**: copy [decks/starter.md](decks/starter.md). Set a layout
  with a slide-local directive after the `---` separator, e.g.
  `<!-- _class: banner -->`. The full layout/helper-class catalog is in
  [README.md](README.md) and demonstrated in
  [decks/layout-test.md](decks/layout-test.md) — keep that deck in sync when
  adding or changing a layout.
- **Brand colors**: reference the `--wm-*` CSS variables in
  [themes/woodmark.css](themes/woodmark.css). The same hex values are mirrored
  in `MERMAID_CONFIG` ([lib/mermaid/render.mjs](lib/mermaid/render.mjs)) — change
  both together so diagrams and slides stay consistent.
- **Mermaid in preview**: the custom engine runs only during CLI export. In the
  VS Code Marp preview, ` ```mermaid ` blocks show as plain code. The exported
  deck is the source of truth — validate diagram changes by exporting, not by
  preview.

## Pitfalls

- Export needs Chromium. If "Could not find a browser", set `CHROME_PATH` to an
  existing Chrome (see [README.md](README.md) Troubleshooting).
- An interrupted build can leave a stray headless browser; `pkill -f chrome`.
- Fonts (Roboto Slab / Source Sans) load from Google Fonts — first export needs
  network access.

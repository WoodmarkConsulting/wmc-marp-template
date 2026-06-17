# Woodmark Marp Template

A self-contained [Marp](https://marp.app/) slide template that reproduces the
corporate **Woodmark Consulting** PowerPoint look — brand colours, Roboto Slab /
Source Sans fonts, the green *“Passion for data”* corner marker, sloped header
bands, the dark-green footer band, and slanted divider lines.

It also ships **build-time [Mermaid](https://mermaid.js.org/) rendering**: write
diagrams as plain ` ```mermaid ` code fences and they are exported as static,
on-brand SVG — identical in PDF, PPTX, PNG and HTML, with no CDN, no client-side
script, and no “insecure content” prompts.

---

## Contents

- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Authoring a deck](#authoring-a-deck)
- [Slide layouts](#slide-layouts)
- [Dark theme](#dark-theme)
- [Inline helper classes](#inline-helper-classes)
- [Mermaid diagrams](#mermaid-diagrams)
- [Exporting](#exporting)
- [VS Code live preview](#vs-code-live-preview)
- [Brand reference](#brand-reference)
- [Project structure](#project-structure)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** ≥ 18
- A **Chromium-based browser** for export (PDF / PPTX / PNG) and for Mermaid
  rendering. `npm install` downloads one automatically via Puppeteer; to use an
  existing browser instead, set `CHROME_PATH` (see [Troubleshooting](#troubleshooting)).
- *(Optional)* the [Marp for VS Code](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode)
  extension for live preview.

---

## Quick start

```bash
git clone <this-repo> wmc-marp-template
cd wmc-marp-template
npm install

# Render all decks to PDF+HTML:
npm run build:rendered             # -> decks/rendered/{starter-light,starter-dark,…}.{pdf,html}

# Build any deck:
npm run build -- decks/starter-light.md -o decks/rendered/starter-light.pdf
```

Generated output goes to `decks/rendered/` and is git-ignored.

---

## Authoring a deck

Copy [`decks/starter-light.md`](decks/starter-light.md) for light or
[`decks/starter-dark.md`](decks/starter-dark.md) for dark, and edit. The
front-matter wires up the theme:

```yaml
---
marp: true
theme: woodmark-light   # or woodmark-dark
paginate: true
header: 'My Presentation'
footer: '<span class="foot-date">01.01.2026</span>My Presentation · Internal · © Woodmark Consulting GmbH'
---
```

- `header` renders as the small uppercase **eyebrow label** (top-left).
- `footer` renders inside the **dark-green footer band**. The leading
  `<span class="foot-date">…</span>` is spaced away from the rest by the theme.
- `paginate: true` shows page numbers. Disable per slide with
  `<!-- _paginate: false -->`.
- The *“Passion for data”* marker is added to **every** slide automatically.

Separate slides with `---`. Set a layout on a slide with a local class directive
placed right after the separator:

```markdown
---

<!-- _class: banner -->

## My slide title
```

---

## Slide layouts

| Class         | Description                                                                |
| ------------- | -------------------------------------------------------------------------- |
| *(none)*      | Plain “title + content” slide on a white background.                       |
| `banner-subtitle` | Sloped green band + divider line + corner waves — **with subtitle** (line sits lower). |
| `banner`      | Same band + corner waves, no subtitle slot — title-focused.                |
| `sidebar`     | Title in a left light-green panel; content on the right.                   |
| `steps`       | Like `sidebar`, but list items get numbered circle markers on the divider. |
| `columns`     | Body text flows into **two balanced columns**.                             |
| `statement`   | Centered “big statement” slide (large title, minimal content).             |
| `lead`        | Title / closing slide — centered; used for the cover and “Questions?”.     |

The header band (`banner*`) and the two-column body (`columns`) are independent
modifiers and can be combined:

|                   | Plain        | With subtitle (`banner-subtitle`) | Title only (`banner`) |
| ----------------- | ------------ | --------------------------------- | --------------------- |
| **Single column** | *(no class)* | `banner-subtitle`                 | `banner`              |
| **Two columns**   | `columns`    | `columns banner-subtitle`         | `columns banner`      |

**Two-column notes**

- The heading (`#`/`##`/`###`) automatically spans **both** columns.
- Columns auto-balance. Force where the second column starts with a manual
  break: `<div class="col-break"></div>`.

See [`decks/layout-test-light.md`](decks/layout-test-light.md) for a slide of every layout
and content type.

### Dark theme

The template ships in two colour schemes built from the **same brand palette**:
`woodmark-light` (the default) and `woodmark-dark`. Pick one in the
front-matter; switch a whole deck to dark with:

```yaml
---
marp: true
theme: woodmark-dark   # <- darkens every slide, all layouts included
paginate: true
---
```

- `woodmark-dark` imports `woodmark-light` and only **re-maps** the brand
  tokens: a mid-green slide field, ink panels, white text and white titles; the
  green accents (divider lines, step circles, list markers) are unchanged.
- It darkens **every** slide, including layout slides (`banner`, `sidebar`,
  `steps`, …) — unlike a per-slide class, the theme can't be overridden by a
  slide's `<!-- _class: … -->`.
- **Mermaid diagrams follow automatically** — the build reads the
  `theme: woodmark-dark` front-matter and renders diagrams with the matching
  palette.

See [`decks/layout-test-dark.md`](decks/layout-test-dark.md) for a dark reference deck.

### Layout examples

| Layout | Light | Dark |
|--------|-------|------|
| `lead` (cover)           | <img src="assets/screenshots/light/cover.png" width="360" alt="Cover slide (light)">          | <img src="assets/screenshots/dark/cover.png" width="360" alt="Cover slide (dark)"> |
| `banner`                 | <img src="assets/screenshots/light/banner.png" width="360" alt="Banner slide (light)">        | <img src="assets/screenshots/dark/banner.png" width="360" alt="Banner slide (dark)"> |
| `banner-subtitle`        | <img src="assets/screenshots/light/banner-subtitle.png" width="360" alt="Banner subtitle (light)"> | <img src="assets/screenshots/dark/banner-subtitle.png" width="360" alt="Banner subtitle (dark)"> |
| `steps`                  | <img src="assets/screenshots/light/steps.png" width="360" alt="Steps slide (light)">          | <img src="assets/screenshots/dark/steps.png" width="360" alt="Steps slide (dark)"> |
| Default (no class)       | <img src="assets/screenshots/light/default-content.png" width="360" alt="Default slide (light)"> | <img src="assets/screenshots/dark/default-content.png" width="360" alt="Default slide (dark)"> |
| Mermaid diagram          | <img src="assets/screenshots/light/mermaid.png" width="360" alt="Mermaid slide (light)">      | <img src="assets/screenshots/dark/mermaid.png" width="360" alt="Mermaid slide (dark)"> |
| `statement`              | <img src="assets/screenshots/light/statement.png" width="360" alt="Statement slide (light)">  | <img src="assets/screenshots/dark/statement.png" width="360" alt="Statement slide (dark)"> |

Screenshots are auto-generated from
[`decks/starter-light.md`](decks/starter-light.md) and
[`decks/starter-dark.md`](decks/starter-dark.md) by `npm run build:screenshots`.

---

## Inline helper classes

Wrap inline text in a `<span>` to apply an accent:

| Class    | Effect                                    |
| -------- | ----------------------------------------- |
| `.small` | Smaller text (0.8×) — captions, sources   |
| `.muted` | Mid-green, de-emphasised text             |
| `.note`  | Orange, bold — recommendations / notes    |
| `.warn`  | Red, bold — warnings / “do not”           |

```markdown
<span class="note">Recommendation:</span> defer this to a later stage.
<span class="small">Source: internal benchmark, Q2.</span>
```

---

## Mermaid diagrams

Write diagrams as normal fenced code blocks. They are rendered to themed SVG at
**build time** (export only):

````markdown
```mermaid w=900
graph LR;
  A[Source] --> B[Processor];
  B --> C[(Store)];
```
````

Options can follow `mermaid` on the fence line:

| Option     | Example          | Effect                                          |
| ---------- | ---------------- | ----------------------------------------------- |
| `w=`       | `w=900`          | SVG width in px (or a `%`), capped at 100%.      |
| `h=`       | `h=400`          | Max SVG height in px (or a `%`).                 |
| `align=`   | `align=left`     | Horizontal alignment (`left` / `center` / `right`). |

Diagrams inherit the Woodmark palette (tinted node fills, green borders and
edges, racing-green text); the dark theme uses a matching variant. Adjust the
palettes in [`lib/mermaid/render.mjs`](lib/mermaid/render.mjs)
(`MERMAID_CONFIG_LIGHT` / `MERMAID_CONFIG_DARK`).

> **Preview caveat:** the custom rendering engine only runs during CLI export.
> In the VS Code Marp preview, ` ```mermaid ` blocks show as plain code. The
> exported deck is the source of truth for diagrams.

---

## Exporting

All builds go through `marp --config marp.config.mjs`, which loads the theme and
the Mermaid engine:

```bash
# PDF (default)
npx marp --config marp.config.mjs decks/starter-light.md -o decks/rendered/starter-light.pdf

# PowerPoint
npx marp --config marp.config.mjs decks/starter-light.md -o decks/rendered/starter-light.pptx

# PNG images (one per slide)
npx marp --config marp.config.mjs decks/starter-light.md --images png -o decks/rendered/starter-light.png

# Self-contained HTML
npx marp --config marp.config.mjs decks/starter-light.md -o decks/rendered/starter-light.html
```

Or use the npm scripts:

| Script                    | Output                          |
| ------------------------- | ------------------------------- |
| `npm run build -- <deck>` | Generic build (pass marp flags) |
| `npm run build:rendered`  | PDF+HTML for all starter and layout-test decks |
| `npm run build:pdf`       | PDF output (pass output after `--`) |
| `npm run server`          | Start Marp preview server at `http://localhost:8080/` |
| `npm run watch`           | Rebuild `decks/` on change      |

---

### Security about local files

Because of [the security reason](https://github.com/marp-team/marp-cli/pull/10#user-content-security), conversion that uses the browser cannot use local files by default.

This project sets `allowLocalFiles: true` in [`marp.config.mjs`](marp.config.mjs) so that the theme and Mermaid-rendered SVGs resolve correctly. We recommend only using this template with **trusted** Markdown sources.

If you were to run bare `marp` without the config, local file access would be blocked and Marp would output incomplete results with a warning. To enable it manually, pass `--allow-local-files`:

```bash
marp --pdf --allow-local-files slide-deck.md
```

---

### Preview Server Command (`npm run server`)

For a highly interactive authoring experience, you can run:

```bash
npm run server
```

This starts a local Marp development server watching the `decks/` folder and serving it at `http://localhost:8080/`.

* **Live Reloading:** When you make changes to your Markdown deck and save, the browser automatically refreshes and displays the updated page instantly.
* **VS Code Integration:** You can open `http://localhost:8080/` directly in the VS Code built-in browser (via the *Browser: Open Integrated Browser* command or similar) to view your slides in real-time side-by-side with your Markdown editor.
* **Navigation:** Click on any slide deck listed in the server browser to preview it. You can append `?pdf` or `?pptx` to the URL to inspect layout outputs directly!

---

## VS Code live preview

The themes are registered for the Marp extension in
[`.vscode/settings.json`](.vscode/settings.json):

```jsonc
{ "markdown.marp.themes": ["./themes/woodmark-light.css", "./themes/woodmark-dark.css"] }
```

Install **Marp for VS Code**, open a deck (one with `marp: true`), and the
preview tracks your edits. Layouts and helper classes render faithfully; only
Mermaid blocks differ (plain code in preview, SVG on export).

---

## Brand reference

| Token            | Value     | Usage                                  |
| ---------------- | --------- | -------------------------------------- |
| Woodmark green   | `#009B3E` | headings, marker, links, accents       |
| Racing green ink | `#204232` | body text, footer band                 |
| Light green tint | `#E7F3E8` | header band, code blocks, zebra rows    |
| Accent teal      | `#009A9D` | hyperlinks                             |
| Accent orange    | `#E46C0A` | `.note` callouts                       |
| Accent red       | `#93140A` | `.warn` callouts                       |
| Headings font    | Roboto Slab     | loaded from Google Fonts         |
| Body font        | Source Sans     | loaded from Google Fonts         |

In **dark mode** (`theme: woodmark-dark`) the same tokens are re-mapped by role
rather than replaced: the slide field becomes mid-green `#2D5C47`, panels/bands
become ink `#204232`, text and titles become white, and the green/teal/orange/red
accents are unchanged. The theme styles everything through semantic role
variables (`--page-bg`, `--text`, `--heading`, `--panel`, …) so the two schemes
stay in sync; the dark file only overrides those tokens and the
colour-baked layout backgrounds. See
[`themes/woodmark-dark.css`](themes/woodmark-dark.css).

All decoration (marker, bands, slanted lines) is drawn with inline SVG / CSS —
the theme has **no external image dependencies** and is fully self-contained.

---

## Project structure

```
wmc-marp-template/
├── marp.config.mjs          # Marp CLI config + custom Mermaid engine
├── package.json             # Tooling + build scripts
├── .pre-commit-config.yaml  # Pre-commit: rebuilds rendered decks
├── .editorconfig
├── .gitignore
├── AGENTS.md                # Agent instructions for this repo
├── LICENSE
├── README.md
├── themes/
│   ├── woodmark-light.css   # The Woodmark Marp/Marpit theme (light, default)
│   └── woodmark-dark.css    # Dark variant — imports & re-maps woodmark-light
├── lib/mermaid/
│   ├── plugin.mjs           # markdown-it plugin: ```mermaid -> placeholder
│   └── render.mjs           # build-time placeholder -> themed SVG
├── decks/
│   ├── starter-light.md     # Minimal starting point (light) — copy this
│   ├── starter-dark.md      # Minimal starting point (dark) — copy this
│   ├── layout-test-light.md # Reference: every layout and content type (light)
│   ├── layout-test-dark.md  # Reference: the dark colour scheme
│   └── rendered/            # Generated output (git-ignored)
└── .vscode/
    └── settings.json        # Registers the theme for live preview
```

---

## Troubleshooting

**“Could not find a browser” / export fails.** Marp and the Mermaid renderer
need Chromium. `npm install` downloads one via Puppeteer, and
[`marp.config.mjs`](marp.config.mjs) points `CHROME_PATH` at it automatically.
To reuse a different browser instead, set `CHROME_PATH` yourself — it takes
precedence:

```bash
CHROME_PATH=/path/to/chrome npm run build:rendered
```

The same variable is read in [`.vscode/settings.json`](.vscode/settings.json)
via `markdown.marp.browserPath` for the preview.

**A Mermaid block shows as plain code in the export.** Make sure you build
through the config (`marp --config marp.config.mjs …`), not bare `marp`.

**Build appears to hang.** The Mermaid renderer launches and closes a headless
browser per export; if a build is interrupted, a stray browser process can
linger — `pkill -f chrome` clears it.

**Fonts look wrong offline.** Roboto Slab / Source Sans load from Google Fonts;
exports need network access for first-time font fetch.

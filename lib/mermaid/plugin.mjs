/**
 * markdown-it plugin: turn ```mermaid fenced code blocks into placeholder
 * elements that the async post-processor (mermaid-render.mjs) later replaces
 * with inline, Woodmark-themed SVG.
 *
 * The fence info string may carry options, e.g.:
 *   ```mermaid w=900 align=center
 * Supported options are parsed downstream (see mermaid-render.mjs).
 *
 * Why a placeholder instead of rendering here: markdown-it is synchronous,
 * but rendering Mermaid requires an async (headless browser) step. So we emit
 * a marker now and resolve it in the engine's async render() override.
 */
export default function marpMermaidPlugin(md) {
    const defaultFence = md.renderer.rules.fence?.bind(md.renderer.rules);

    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const info = (token.info || '').trim();
        const [lang, ...rest] = info.split(/\s+/);

        if (lang === 'mermaid') {
            const opts = rest.join(' ');
            const src = Buffer.from(token.content, 'utf8').toString('base64');
            return (
                `<div class="marp-mermaid" data-src="${src}"` +
                ` data-opts="${md.utils.escapeHtml(opts)}"></div>\n`
            );
        }

        if (defaultFence) return defaultFence(tokens, idx, options, env, self);
        return self.renderToken(tokens, idx, options);
    };
}

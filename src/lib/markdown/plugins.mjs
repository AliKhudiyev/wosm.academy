// Sätteri hast plugins used for every Markdown file (see astro.config.mjs).

const TODO = 'TODO(owner)';

/**
 * Wraps owner placeholders written in Markdown ("TODO(owner): …") in
 * <mark class="todo"> so they stand out on the page until they are filled in.
 * @type {import('satteri').HastPluginDefinition}
 */
export const todoMarker = {
  name: 'wosm-todo-marker',
  text(node, ctx) {
    const index = node.value.indexOf(TODO);
    if (index === -1) return;
    const parent = ctx.parent(node);
    if (parent && parent.type === 'element' && parent.tagName === 'mark') return;

    /** @type {any[]} */
    const replacement = [];
    if (index > 0) replacement.push({ type: 'text', value: node.value.slice(0, index) });
    replacement.push({
      type: 'element',
      tagName: 'mark',
      properties: { className: ['todo'] },
      children: [{ type: 'text', value: node.value.slice(index) }],
    });
    ctx.replaceNode(node, replacement);
  },
};

/**
 * Adds rel="noopener" to links that leave wosm.academy. The ↗ indicator is
 * added in CSS (see .prose rules in src/styles/base.css).
 * @type {import('satteri').HastPluginDefinition}
 */
export const externalLinks = {
  name: 'wosm-external-links',
  element: {
    filter: ['a'],
    visit(node, ctx) {
      const href = String(node.properties?.href ?? '');
      if (!/^https?:\/\//.test(href) || /^https?:\/\/wosm\.academy(\/|$)/.test(href)) return;
      ctx.setProperty(node, 'rel', ['noopener']);
    },
  },
};

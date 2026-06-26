import { createMarkdownProcessor } from '@astrojs/markdown-remark';

type Processor = Awaited<ReturnType<typeof createMarkdownProcessor>>;

// Reuse a single processor across renders (and across the build) instead of
// rebuilding the unified pipeline for every field.
let processor: Promise<Processor> | null = null;

function getProcessor(): Promise<Processor> {
  if (!processor) processor = createMarkdownProcessor({});
  return processor;
}

/**
 * Render a Markdown string (e.g. a portfolio `summary`/`description` authored
 * in src/data/*.md frontmatter) to a trusted HTML string for use with
 * `set:html`. Returns '' for empty/undefined input.
 *
 * Authoring notes: blank lines separate paragraphs; a list needs a blank line
 * before it and each item starts with `- `. Inline `**bold**`, `*italic*`,
 * `[text](href)` and `` `code` `` all work.
 */
export async function renderMarkdown(input?: string | null): Promise<string> {
  if (!input) return '';
  const { code } = await (await getProcessor()).render(input);
  return code;
}

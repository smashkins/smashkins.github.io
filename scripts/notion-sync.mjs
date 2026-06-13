#!/usr/bin/env node
// @ts-check
//
// Notion -> repo sync.
//
// Materializes every Published row of a Notion "Blog Posts" data source as a
// Markdown file under src/content/blog/<lang>/<slug>.md, downloading the page
// cover and every inline image into public/assets/blog/<slug>/. Posts removed
// from the published set (or unpublished) are pruned, together with their image
// directory when no remaining language still references the slug.
//
// Notion is the source of truth for synced posts only: files WITHOUT a
// `notionId` frontmatter line (hand-written posts) are never touched.
//
// Usage:
//   NOTION_TOKEN=... NOTION_DATA_SOURCE_ID=... node scripts/notion-sync.mjs [--dry-run]
//
// Env:
//   NOTION_TOKEN            internal integration token (ntn_...)        required
//   NOTION_DATA_SOURCE_ID   data source id of the Blog Posts database   required
//
// Exit code is non-zero on any error. On failure nothing is partially deleted:
// the full published set is collected before any prune runs.

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { stringify as yamlStringify } from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(REPO_ROOT, 'src', 'content', 'blog');
const ASSETS_DIR = path.join(REPO_ROOT, 'public', 'assets', 'blog');

const LANGS = ['en', 'it'];
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const NUMERIC_RE = /^[0-9]+$/;
// Read the synced-marker from the first frontmatter block only.
const NOTION_ID_RE = /^notionId:\s*(.+?)\s*$/m;

const DRY_RUN = process.argv.includes('--dry-run');

/** @param {string} msg */
function fail(msg) {
  throw new Error(msg);
}

/** Read required env, failing loudly. @returns {{ token: string, dataSourceId: string }} */
function readConfig() {
  const token = process.env.NOTION_TOKEN;
  const dataSourceId = process.env.NOTION_DATA_SOURCE_ID;
  if (!token) fail('NOTION_TOKEN is not set');
  if (!dataSourceId) fail('NOTION_DATA_SOURCE_ID is not set');
  return { token, dataSourceId };
}

// ---------------------------------------------------------------------------
// Notion queries
// ---------------------------------------------------------------------------

/**
 * Page through the data source, returning every Published page.
 * Uses the client v5 surface: notion.dataSources.query({ data_source_id, ... }).
 * @param {Client} notion
 * @param {string} dataSourceId
 * @returns {Promise<any[]>}
 */
async function queryPublishedPages(notion, dataSourceId) {
  const pages = [];
  let cursor = undefined;
  do {
    let res;
    try {
      res = await notion.dataSources.query({
        data_source_id: dataSourceId,
        filter: { property: 'Published', checkbox: { equals: true } },
        page_size: 100,
        start_cursor: cursor,
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      fail(`Notion dataSources.query failed: ${detail}`);
    }
    for (const result of res.results) {
      if (result.object === 'page' && 'properties' in result) pages.push(result);
    }
    cursor = res.has_more ? res.next_cursor ?? undefined : undefined;
  } while (cursor);
  return pages;
}

// ---------------------------------------------------------------------------
// Property extraction & validation
// ---------------------------------------------------------------------------

/** @param {any[] | undefined} rich */
function richTextToPlain(rich) {
  if (!Array.isArray(rich)) return '';
  return rich.map((t) => t.plain_text ?? '').join('').trim();
}

/** Notion page cover -> external URL (or undefined). @param {any} page */
function coverUrl(page) {
  const cover = page.cover;
  if (!cover) return undefined;
  if (cover.type === 'external') return cover.external?.url;
  if (cover.type === 'file') return cover.file?.url;
  return undefined;
}

/** Notion page URL for error messages. @param {any} page */
function pageUrl(page) {
  return page.url ?? `https://www.notion.so/${String(page.id).replace(/-/g, '')}`;
}

/**
 * @typedef {Object} PostMeta
 * @property {string} id          notion page id
 * @property {string} url         notion page url (for errors)
 * @property {string} title
 * @property {string} slug
 * @property {'en'|'it'} lang
 * @property {string} excerpt
 * @property {string} publishDate YYYY-MM-DD
 * @property {string|undefined} updateDate YYYY-MM-DD
 * @property {string[]} tags
 * @property {string|undefined} cover external URL of the page cover
 */

/**
 * Validate + extract the frontmatter-relevant properties of a Published page.
 * Any missing required field or malformed value is a hard error naming the page.
 * @param {any} page
 * @returns {PostMeta}
 */
function extractProps(page) {
  const props = page.properties ?? {};
  const url = pageUrl(page);
  /** @param {string} field @param {string} why */
  const bad = (field, why) => fail(`Notion page ${url}: ${field} ${why}`);

  const title = richTextToPlain(props.Name?.title);
  if (!title) bad('Name', 'is required (empty title)');

  const slug = richTextToPlain(props.Slug?.rich_text);
  if (!slug) bad('Slug', 'is required');
  if (!SLUG_RE.test(slug)) bad('Slug', `"${slug}" is not kebab-case (^[a-z0-9]+(-[a-z0-9]+)*$)`);
  if (NUMERIC_RE.test(slug)) bad('Slug', `"${slug}" is numeric-only (collides with pagination routes)`);

  const lang = props.Lang?.select?.name;
  if (!lang) bad('Lang', 'is required');
  if (!LANGS.includes(lang)) bad('Lang', `"${lang}" is not one of ${LANGS.join(', ')}`);

  const excerpt = richTextToPlain(props.Excerpt?.rich_text);
  if (!excerpt) bad('Excerpt', 'is required');

  const publishDate = props.PublishDate?.date?.start;
  if (!publishDate) bad('PublishDate', 'is required');
  const publish = toDateOnly(publishDate, url, 'PublishDate');

  const updateRaw = props.UpdateDate?.date?.start;
  const update = updateRaw ? toDateOnly(updateRaw, url, 'UpdateDate') : undefined;

  const tags = Array.isArray(props.Tags?.multi_select)
    ? props.Tags.multi_select.map((t) => t.name).filter(Boolean)
    : [];

  return {
    id: page.id,
    url,
    title,
    slug,
    lang,
    excerpt,
    publishDate: publish,
    updateDate: update,
    tags,
    cover: coverUrl(page),
  };
}

/**
 * Normalize a Notion date (may be date-only or an ISO datetime) to YYYY-MM-DD.
 * @param {string} raw @param {string} url @param {string} field
 */
function toDateOnly(raw, url, field) {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(raw);
  if (!match) fail(`Notion page ${url}: ${field} "${raw}" is not a valid date`);
  return match[1];
}

/**
 * Reject duplicate (slug, lang) pairs across the published set.
 * @param {PostMeta[]} posts
 */
function assertNoDuplicates(posts) {
  const seen = new Map();
  for (const post of posts) {
    const key = `${post.lang}/${post.slug}`;
    const prev = seen.get(key);
    if (prev) {
      fail(
        `Duplicate (slug, lang) "${key}" in published rows: ${prev} and ${post.url}`,
      );
    }
    seen.set(key, post.url);
  }
}

// ---------------------------------------------------------------------------
// Image download
// ---------------------------------------------------------------------------

/**
 * Download an image (Notion S3 signed or external URL) into the slug's asset
 * dir. Hash is over the URL pathname only (stable across re-signed URLs), so
 * re-runs produce the same filename and skip existing files. Returns the public
 * `/assets/...` reference.
 * @param {string} rawUrl
 * @param {string} slug
 * @returns {Promise<string>}
 */
async function downloadImage(rawUrl, slug) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    fail(`Invalid image URL "${rawUrl}" (slug ${slug})`);
  }
  const pathname = parsed.pathname;
  const hash = createHash('sha256').update(pathname).digest('hex').slice(0, 12);
  let ext = path.extname(pathname).toLowerCase();
  if (!/^\.[a-z0-9]{2,5}$/.test(ext)) ext = '';
  const name = `${hash}${ext}`;
  const publicRef = `/assets/blog/${slug}/${name}`;
  const destDir = path.join(ASSETS_DIR, slug);
  const destFile = path.join(destDir, name);

  if (existsSync(destFile)) return publicRef;

  if (DRY_RUN) {
    console.log(`  [dry-run] would download image -> ${publicRef}`);
    return publicRef;
  }

  let res;
  try {
    res = await fetch(rawUrl);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    fail(`Download failed for ${rawUrl}: ${detail}`);
  }
  if (!res.ok) fail(`Download failed for ${rawUrl}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(destDir, { recursive: true });
  await writeFile(destFile, buf);
  console.log(`  downloaded image -> ${publicRef}`);
  return publicRef;
}

// ---------------------------------------------------------------------------
// Markdown conversion
// ---------------------------------------------------------------------------

/**
 * Build a NotionToMarkdown converter whose image transformer downloads each
 * image locally and emits a Markdown image with the local path.
 * @param {Client} notion
 * @param {string} slug
 */
function makeConverter(notion, slug) {
  const n2m = new NotionToMarkdown({ notionClient: notion });
  n2m.setCustomTransformer('image', async (block) => {
    // block.image: { type: 'external'|'file', external?{url}, file?{url}, caption[] }
    const image = /** @type {any} */ (block).image;
    if (!image) return false; // fall back to default handling
    const url = image.type === 'external' ? image.external?.url : image.file?.url;
    if (!url) return false;
    const caption = Array.isArray(image.caption)
      ? image.caption.map((c) => c.plain_text ?? '').join('').trim()
      : '';
    const localRef = await downloadImage(url, slug);
    const alt = caption || 'image';
    return `![${alt}](${localRef})`;
  });
  return n2m;
}

/**
 * Convert a page's blocks to a Markdown body string.
 * @param {Client} notion @param {PostMeta} post
 * @returns {Promise<string>}
 */
async function convertBody(notion, post) {
  const n2m = makeConverter(notion, post.slug);
  let blocks;
  try {
    blocks = await n2m.pageToMarkdown(post.id);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    fail(`Converting page ${post.url} to markdown failed: ${detail}`);
  }
  const md = n2m.toMarkdownString(blocks);
  return md.parent ?? '';
}

// ---------------------------------------------------------------------------
// Frontmatter & file assembly
// ---------------------------------------------------------------------------

/**
 * Build the YAML frontmatter block with a fixed key order. Dates are emitted as
 * plain YYYY-MM-DD strings (no quoting, no timestamps) so output is deterministic.
 * @param {PostMeta} post @param {string|undefined} image public ref for cover
 * @returns {string}
 */
function buildFrontmatter(post, image) {
  /** @type {Record<string, unknown>} */
  const fm = {};
  fm.title = post.title;
  fm.excerpt = post.excerpt;
  fm.publishDate = post.publishDate;
  if (post.updateDate) fm.updateDate = post.updateDate;
  fm.tags = post.tags;
  if (image) fm.image = image;
  fm.lang = post.lang;
  fm.notionId = post.id;

  const body = yamlStringify(fm, { lineWidth: 0 }).trimEnd();
  return `---\n${body}\n---\n`;
}

/**
 * Normalize a Markdown body: trim trailing whitespace per line, collapse to a
 * single trailing newline.
 * @param {string} body
 */
function normalizeBody(body) {
  const lines = body.replace(/\r\n/g, '\n').split('\n').map((l) => l.replace(/[ \t]+$/, ''));
  return lines.join('\n').replace(/\n+$/, '') + '\n';
}

/**
 * Assemble the full file content: frontmatter, blank line, normalized body.
 * @param {PostMeta} post @param {string|undefined} image @param {string} body
 */
function assembleFile(post, image, body) {
  const fm = buildFrontmatter(post, image);
  const normalized = normalizeBody(body).replace(/^\n+/, '');
  return `${fm}\n${normalized}`;
}

/**
 * Write a file only when its content differs from what's on disk.
 * @param {string} filePath @param {string} content
 * @returns {Promise<'created'|'updated'|'unchanged'>}
 */
async function writeIfChanged(filePath, content) {
  let existing = null;
  if (existsSync(filePath)) existing = await readFile(filePath, 'utf8');
  if (existing === content) return 'unchanged';
  const action = existing === null ? 'created' : 'updated';
  if (DRY_RUN) {
    console.log(`  [dry-run] would ${action}: ${path.relative(REPO_ROOT, filePath)}`);
    return action;
  }
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content);
  console.log(`  ${action}: ${path.relative(REPO_ROOT, filePath)}`);
  return action;
}

// ---------------------------------------------------------------------------
// Orphan pruning
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} LocalPost
 * @property {string} file     absolute path
 * @property {string} lang
 * @property {string} slug
 * @property {string} notionId
 */

/**
 * Scan src/content/blog for synced files (those carrying a notionId line).
 * Files without a notionId are hand-written and ignored entirely.
 * @returns {Promise<LocalPost[]>}
 */
async function scanLocalSyncedPosts() {
  /** @type {LocalPost[]} */
  const found = [];
  for (const lang of LANGS) {
    const dir = path.join(BLOG_DIR, lang);
    if (!existsSync(dir)) continue;
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
      const file = path.join(dir, entry.name);
      const content = await readFile(file, 'utf8');
      const fmEnd = content.indexOf('\n---', 3);
      const frontmatter = fmEnd === -1 ? content : content.slice(0, fmEnd);
      const match = NOTION_ID_RE.exec(frontmatter);
      if (!match) continue; // hand-written post -> never touch
      found.push({ file, lang, slug: entry.name.replace(/\.md$/, ''), notionId: match[1] });
    }
  }
  return found;
}

/**
 * Delete synced files whose notionId is not in the published set, plus their
 * image dir when no remaining synced file references the same slug.
 * @param {PostMeta[]} published
 * @returns {Promise<void>}
 */
async function pruneOrphans(published) {
  const publishedIds = new Set(published.map((p) => p.id));
  const local = await scanLocalSyncedPosts();

  const orphans = local.filter((p) => !publishedIds.has(p.notionId));
  if (orphans.length === 0) return;

  // Slugs still referenced after the orphan files are gone.
  const orphanFiles = new Set(orphans.map((o) => o.file));
  const survivingSlugs = new Set(
    local.filter((p) => !orphanFiles.has(p.file)).map((p) => p.slug),
  );

  for (const orphan of orphans) {
    const rel = path.relative(REPO_ROOT, orphan.file);
    if (DRY_RUN) {
      console.log(`  [dry-run] would delete orphan: ${rel}`);
    } else {
      await rm(orphan.file, { force: true });
      console.log(`  deleted orphan: ${rel}`);
    }
  }

  // Delete image dirs only for slugs no surviving file references.
  const orphanSlugs = new Set(orphans.map((o) => o.slug));
  for (const slug of orphanSlugs) {
    if (survivingSlugs.has(slug)) continue;
    const imageDir = path.join(ASSETS_DIR, slug);
    if (!existsSync(imageDir)) continue;
    const relDir = path.relative(REPO_ROOT, imageDir);
    if (DRY_RUN) {
      console.log(`  [dry-run] would delete image dir: ${relDir}`);
    } else {
      await rm(imageDir, { recursive: true, force: true });
      console.log(`  deleted image dir: ${relDir}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (DRY_RUN) console.log('notion-sync: dry run (no files written or deleted)');

  const { token, dataSourceId } = readConfig();
  const notion = new Client({ auth: token });

  // 1. Collect the full published set BEFORE any mutation, so a failure here
  //    never leaves a partial prune behind.
  const pages = await queryPublishedPages(notion, dataSourceId);
  const posts = pages.map(extractProps);
  assertNoDuplicates(posts);
  console.log(`Published rows: ${posts.length}`);

  // 2. Materialize each post.
  let created = 0;
  let updated = 0;
  let unchanged = 0;
  for (const post of posts) {
    console.log(`- ${post.lang}/${post.slug} (${post.title})`);
    const image = post.cover ? await downloadImage(post.cover, post.slug) : undefined;
    const body = await convertBody(notion, post);
    const content = assembleFile(post, image, body);
    const filePath = path.join(BLOG_DIR, post.lang, `${post.slug}.md`);
    const action = await writeIfChanged(filePath, content);
    if (action === 'created') created++;
    else if (action === 'updated') updated++;
    else unchanged++;
  }

  // 3. Prune anything no longer published (only after the set is fully built).
  await pruneOrphans(posts);

  console.log(
    `Done. created=${created} updated=${updated} unchanged=${unchanged}${DRY_RUN ? ' (dry run)' : ''}`,
  );
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`notion-sync: ${msg}`);
  process.exit(1);
});

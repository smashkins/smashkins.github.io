import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { localizedHref, type Locale } from '~/i18n';

export type BlogEntry = CollectionEntry<'blog'>;

/**
 * All published posts for a locale, sorted newest first. Posts are keyed by
 * their id prefix (`en/...`, `it/...`) rather than the `lang` field so the
 * folder layout is the single source of truth.
 */
export async function getPosts(locale: Locale): Promise<BlogEntry[]> {
  const entries = await getCollection(
    'blog',
    ({ id, data }) => id.startsWith(`${locale}/`) && data.draft !== true
  );
  return entries.sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
  );
}

/** The slug of an entry: its id with the leading locale segment removed. */
export function slugOf(entry: BlogEntry): string {
  return entry.id.replace(/^(en|it)\//, '');
}

/** Normalize a tag into a URL-safe slug. */
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Pick up to `max` related posts by tag overlap. Higher tag overlap ranks
 * higher; the original post is excluded.
 */
export function getRelatedPosts(
  entry: BlogEntry,
  all: BlogEntry[],
  max = 3
): BlogEntry[] {
  const originalTags = new Set(entry.data.tags.map((tag) => tagSlug(tag)));

  const scored = all
    .filter((p) => p.id !== entry.id)
    .map((post) => {
      let score = 0;
      for (const tag of post.data.tags) {
        if (originalTags.has(tagSlug(tag))) score += 1;
      }
      return { post, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, max).map((s) => s.post);
}

/** Deterministic, monochrome cover fallback for posts without an `image`. */
export interface CoverPlaceholder {
  angle: number;
  monogram: string;
}

/**
 * Derive a stable gradient angle + monogram from a post title, so an imageless
 * card always renders the same (and subtly distinct) placeholder cover.
 */
export function coverPlaceholder(title: string): CoverPlaceholder {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return { angle: h % 360, monogram: (title.trim()[0] ?? '·').toUpperCase() };
}

/** One post as it appears in the client-side search index. */
export interface SearchRecord {
  title: string;
  excerpt: string;
  tags: { label: string; href: string }[];
  href: string;
  dateISO: string;
  dateLabel: string;
  image?: string;
  coverAngle: number;
  coverMonogram: string;
}

/**
 * Build the flat, JSON-serialisable search index for a locale. Mirrors what
 * `PostCard` / `PostMeta` render so the client can rebuild cards from JSON
 * without re-deriving hrefs or date formats.
 */
export async function buildSearchIndex(locale: Locale): Promise<SearchRecord[]> {
  const posts = await getPosts(locale);
  const dateLocale = locale === 'it' ? 'it-IT' : 'en-GB';

  return posts.map((entry) => {
    const { angle, monogram } = coverPlaceholder(entry.data.title);
    return {
      title: entry.data.title,
      excerpt: entry.data.excerpt,
      tags: entry.data.tags.slice(0, 3).map((tag) => ({
        label: tag,
        href: localizedHref(`/blog/tags/${tagSlug(tag)}/`, locale),
      })),
      href: localizedHref(`/blog/${slugOf(entry)}/`, locale),
      dateISO: entry.data.publishDate.toISOString(),
      dateLabel: entry.data.publishDate
        .toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })
        .toUpperCase(),
      image: entry.data.image,
      coverAngle: angle,
      coverMonogram: monogram,
    };
  });
}

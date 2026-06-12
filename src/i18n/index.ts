import type { AstroGlobal } from 'astro';
import { ui, DEFAULT_LOCALE, type Locale } from './ui';

export { ui, DEFAULT_LOCALE, LOCALES, localeName } from './ui';
export type { Locale } from './ui';

/**
 * Resolve the current request's locale from the Astro context. Falls back
 * to the default locale (English) when running outside a routed context
 * (e.g. during build-time content queries with no Astro global).
 */
export function getLocale(astro?: AstroGlobal | { currentLocale?: string }): Locale {
  const raw = astro?.currentLocale;
  if (raw === 'it') return 'it';
  return DEFAULT_LOCALE;
}

/**
 * Look up the translation bundle for a locale.
 */
export function t(locale: Locale): (typeof ui)[Locale] {
  return ui[locale] ?? ui[DEFAULT_LOCALE];
}

/**
 * Prepend the locale segment to an internal href, unless it's the default
 * locale (English, served at the root) or the href is an absolute URL or
 * a mail/tel/hash link.
 */
export function localizedHref(href: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return href;
  if (/^(?:https?:|mailto:|tel:|#)/.test(href)) return href;
  if (!href.startsWith('/')) return href;
  // /blog/foo  ->  /it/blog/foo
  return `/${locale}${href}`;
}

/**
 * Given the current URL pathname, compute the equivalent path in the
 * target locale. Used by the language switcher: clicking IT on
 * `/blog/foo` should take you to `/it/blog/foo`, and clicking EN on
 * `/it/blog` should take you to `/blog`.
 */
export function switchLocalePath(pathname: string, target: Locale): string {
  // Strip leading "/it" if present.
  const stripped = pathname.replace(/^\/it(\/|$)/, '/');
  const canonical = stripped === '' ? '/' : stripped;
  if (target === DEFAULT_LOCALE) return canonical;
  return canonical === '/' ? `/${target}` : `/${target}${canonical}`;
}

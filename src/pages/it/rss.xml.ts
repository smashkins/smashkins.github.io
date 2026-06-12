import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, slugOf } from '~/utils/blog';
import { t } from '~/i18n';

export async function GET(context: APIContext) {
  const posts = await getPosts('it');
  const strings = t('it');

  return rss({
    title: `MONOIDX — ${strings.blog.title}`,
    description: strings.blog.subtitle,
    site: context.site!,
    items: posts.map((entry) => ({
      title: entry.data.title,
      description: entry.data.excerpt,
      pubDate: entry.data.publishDate,
      link: `/it/blog/${slugOf(entry)}/`,
    })),
  });
}

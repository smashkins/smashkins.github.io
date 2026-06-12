import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: ['**/*.md', '**/*.mdx'], base: 'src/content/blog' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    publishDate: z.coerce.date(),
    updateDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(), // path under /assets/blog/
    draft: z.boolean().default(false),
    lang: z.enum(['en', 'it']).default('en'),
  }),
});

export const collections = { blog };

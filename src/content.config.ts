import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    demo: z.boolean().default(false),
    minutes: z.number().positive().default(3),
    color: z.enum(['sage', 'lavender', 'peach', 'sand']).default('sage'),
    icon: z.string().default('file'),
  }),
});

export const collections = { blog };

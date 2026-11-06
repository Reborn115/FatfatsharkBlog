import { getCollection } from 'astro:content';

export async function getPosts() {
  return (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function formatDate(date: Date, short = false) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: short ? '2-digit' : 'long',
    day: 'numeric',
  }).format(date);
}

export function postUrl(id: string) {
  return `/blog/${id.split('/').map(encodeURIComponent).join('/')}/`;
}

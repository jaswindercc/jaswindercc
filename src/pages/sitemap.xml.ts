import { getCollection } from 'astro:content';

export async function GET() {
  const posts = await getCollection('blog');

  const urls = [
    {
      loc: 'https://jaswinder.cc/',
      lastmod: new Date().toISOString(),
    },
    ...posts.map((post) => ({
      loc: `https://jaswinder.cc/blog/${post.id.replace(/\.mdx?$/, '')}/`,
      lastmod: post.data.date.toISOString(),
    })),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
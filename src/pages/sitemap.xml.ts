import { getCollection } from 'astro:content';

export async function GET() {
  const posts = await getCollection('blog');
  const sortedPosts = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  const siteUrl = 'https://jaswinder.cc';

  const urls = [
    {
      loc: `${siteUrl}/`,
      lastmod: new Date().toISOString(),
    },
    {
      loc: `${siteUrl}/blog/`,
      lastmod: new Date().toISOString(),
    },
    ...sortedPosts.map((post) => ({
      loc: `${siteUrl}/blog/${post.id.replace(/\.mdx?$/, '')}/`,
      lastmod: post.data.date.toISOString(),
    })),
  ];

  const totalPages = Math.ceil(sortedPosts.length / 6);
  for (let i = 2; i <= totalPages; i++) {
    urls.push({
      loc: `${siteUrl}/blog/${i}/`,
      lastmod: new Date().toISOString(),
    });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (url) => `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n  </url>`
    )
    .join('\n')}\n</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
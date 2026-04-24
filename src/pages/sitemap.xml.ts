import { getCollection } from 'astro:content';

export async function GET() {
  const posts = await getCollection('blog');
  const sortedPosts = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const urls = [
    {
      loc: 'https://jaswinder.cc/',
      lastmod: new Date().toISOString(),
    },
    {
      loc: 'https://jaswinder.cc/blog/',
      lastmod: new Date().toISOString(),
    },
    ...sortedPosts.map((post) => ({
      loc: `https://jaswinder.cc/blog/${post.id.replace(/\.mdx?$/, '')}/`,
      lastmod: post.data.date.toISOString(),
    })),
  ];

  // Add paginated blog pages
  const totalPages = Math.ceil(sortedPosts.length / 6);
  for (let i = 2; i <= totalPages; i++) {
    urls.push({
      loc: `https://jaswinder.cc/blog/${i}/`,
      lastmod: new Date().toISOString(),
    });
  }

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
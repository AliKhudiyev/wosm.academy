import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../config/site';
import { getPosts, postUrl } from '../lib/content';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: `${site.name} Journal`,
    description: 'News, announcements and essays from WoSM Academy (Wisdom of Starving Minds).',
    site: context.site ?? site.url,
    trailingSlash: true,
    customData: '<language>en-gb</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary,
      link: postUrl(post),
      categories: post.data.tags,
    })),
  });
}

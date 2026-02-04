import { copy, remove, mkdirp, writeJson } from 'fs-extra';

import { BlogEntryFull } from './blog.types';
import { copyEntriesToDist, getEntryList } from './base.utils';
import { makeLightBlogList } from './blog.utils';

/** CONFIG */
const MARKDOWN_BASE_URL = 'https://website-articles.angular-buch.com/';
const DIST_FOLDER = './dist';
const BLOG_POSTS_FOLDER = '../blog';

async function build(): Promise<void> {
  // empty dist folder (for local builds)
  await remove(DIST_FOLDER);
  await mkdirp(DIST_FOLDER);

  // copy static index.html
  await copy('../index.html', DIST_FOLDER + '/index.html');

  // generate light blog list
  const entryList = await getEntryList<BlogEntryFull>(BLOG_POSTS_FOLDER, MARKDOWN_BASE_URL);
  const blogListLight = makeLightBlogList(entryList);
  await writeJson(DIST_FOLDER + '/bloglist.json', blogListLight);

  // replace README with entry.json for all blog posts
  await copyEntriesToDist(entryList, BLOG_POSTS_FOLDER, DIST_FOLDER);
}

build().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});

import { mkdirp, writeJson } from 'fs-extra';

import { BlogEntryFull } from './blog.types';
import { copyEntriesToDist, getEntryList } from './base.utils';
import { makeLightBlogList } from './blog.utils';
import { MARKDOWN_BASE_URL, DIST_FOLDER, BLOG_POSTS_FOLDER } from '../config';

async function build(): Promise<void> {
  const blogDist = DIST_FOLDER + '/blog';
  await mkdirp(blogDist);

  const entryList = await getEntryList<BlogEntryFull>(BLOG_POSTS_FOLDER, MARKDOWN_BASE_URL + 'blog/');
  const blogListLight = makeLightBlogList(entryList);
  await writeJson(blogDist + '/bloglist.json', blogListLight);
  await copyEntriesToDist(entryList, BLOG_POSTS_FOLDER, blogDist);
}

build().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});

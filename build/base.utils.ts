import * as emoji from 'node-emoji'
import sizeOf from 'image-size';
import { readdir, readFile } from 'fs/promises';
import { copy, remove, writeJson, mkdirp } from 'fs-extra';

import { JekyllMarkdownParser } from './jekyll-markdown-parser';
import { EntryBase } from './base.types';

/** Read all subdirectory names from a base path (excluding those starting with _) */
export async function readFolders(basePath: string): Promise<string[]> {
  const folderContents = await readdir(basePath, { withFileTypes: true });
  return folderContents
    .filter(dirent => dirent.isDirectory())
    .filter(dirent => !dirent.name.startsWith('_'))
    .map(dirent => dirent.name);
}

/** Read a markdown file from disk */
export async function readMarkdownFile(filePath: string): Promise<string> {
  return readFile(filePath, 'utf8');
}

/** Get width and height of an image */
export function getImageDimensions(imagePath: string): { width: number | undefined; height: number | undefined } {
  const { width, height } = sizeOf(imagePath);
  return { width, height };
}

/** Copy folder entries to dist, remove source file, and write entry.json */
export async function copyEntriesToDist<T extends { slug: string }>(
  entries: T[],
  sourceFolder: string,
  distFolder: string
): Promise<void> {
  await Promise.all(entries.map(async (entry) => {
    try {
      const entryDistFolder = `${distFolder}/${entry.slug}`;

      await mkdirp(entryDistFolder);
      await copy(`${sourceFolder}/${entry.slug}`, entryDistFolder);
      await remove(`${entryDistFolder}/README.md`);

      const entryJsonPath = `${entryDistFolder}/entry.json`;
      await writeJson(entryJsonPath, entry);
      console.log('Generated post file:', entryJsonPath);
    } catch (error: any) {
      console.error(`Failed to process ${entry.slug}:`, error.message);
    }
  }));
}

/** Simple way to sort things: create a sort key that can be easily sorted */
function getSortKey(entry: EntryBase): string {
  // js-yaml parses unquoted dates (e.g., `published: 2024-01-15`) as Date objects.
  // The unary + converts Date to timestamp (number), which sorts correctly.
  // Note: If the date were a string, +string would return NaN, but our YAML
  // files use unquoted dates, so this works correctly.
  return (entry.meta.sticky ? 'Z' : 'A') + '---' + (+entry.meta.published) + '---' + entry.slug;
}


/** Convert markdown README to full blog post object */
export function markdownToEntry<T extends EntryBase>(
  markdown: string,
  folder: string,
  baseUrl: string,
  blogPostsFolder: string
): T {
  const parser = new JekyllMarkdownParser(baseUrl + folder + '/');
  const parsedJekyllMarkdown = parser.parse(markdown);

  const meta = parsedJekyllMarkdown.parsedYaml || {};

  if (meta.header) {
    const url = meta.header;
    const relativePath = blogPostsFolder + '/' + folder + '/' + meta.header;
    const { width, height } = getImageDimensions(relativePath);
    meta.header = { url, width, height };
  }

  return {
    slug: folder,
    html: emoji.emojify(parsedJekyllMarkdown.html),
    meta
  } as T;
}

/** Read metadata and contents for all entries as list */
export async function getEntryList<T extends EntryBase>(entriesFolder: string, markdownBaseUrl: string): Promise<T[]> {
  const entryDirs = await readFolders(entriesFolder);
  const entries: T[] = [];

  for (const entryDir of entryDirs) {
    const readmePath = `${entriesFolder}/${entryDir}/README.md`;
    const readme = await readMarkdownFile(readmePath);
    const entry = markdownToEntry<T>(readme, entryDir, markdownBaseUrl, entriesFolder);
    entries.push(entry);
  }

  return entries.sort((a, b) => getSortKey(b).localeCompare(getSortKey(a)));
}

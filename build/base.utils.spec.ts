import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readMarkdownFile, getEntryList, markdownToEntry } from './base.utils';
import { EntryBase } from './base.types';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('base.utils', () => {

  describe('readMarkdownFile', () => {
    it('should throw error for non-existent file', async () => {
      await expect(readMarkdownFile('/non/existent/path/README.md'))
        .rejects
        .toThrow();
    });
  });

  describe('getEntryList - Error Handling', () => {
    const testDir = '/tmp/test-blog-entries-' + Date.now();

    beforeEach(async () => {
      // Create test directory structure
      await fs.mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
      // Cleanup
      await fs.rm(testDir, { recursive: true, force: true });
    });

    it('should throw error when README.md is missing in entry folder', async () => {
      // Create folder without README.md
      await fs.mkdir(path.join(testDir, 'broken-entry'), { recursive: true });

      await expect(getEntryList<EntryBase>(testDir, 'https://example.com/'))
        .rejects
        .toThrow();
    });

    it('should throw error when folder contains invalid markdown', async () => {
      // Create folder with README.md that has invalid YAML
      const entryDir = path.join(testDir, 'invalid-yaml-entry');
      await fs.mkdir(entryDir, { recursive: true });
      await fs.writeFile(
        path.join(entryDir, 'README.md'),
        '---\ninvalid: yaml: syntax: here\n---\nContent'
      );

      await expect(getEntryList<EntryBase>(testDir, 'https://example.com/'))
        .rejects
        .toThrow();
    });

    it('should process valid entries without error', async () => {
      // Create valid entry
      const entryDir = path.join(testDir, 'valid-entry');
      await fs.mkdir(entryDir, { recursive: true });
      await fs.writeFile(
        path.join(entryDir, 'README.md'),
        '---\ntitle: Test\npublished: 2024-01-01\n---\n\n# Hello'
      );

      const result = await getEntryList<EntryBase>(testDir, 'https://example.com/');

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('valid-entry');
    });

    it('should abort on first error, not continue with other entries', async () => {
      // Create two entries: first broken, second valid
      const brokenDir = path.join(testDir, 'aaa-broken'); // sorts first alphabetically
      const validDir = path.join(testDir, 'zzz-valid');

      await fs.mkdir(brokenDir, { recursive: true });
      await fs.mkdir(validDir, { recursive: true });

      // No README.md in broken dir
      await fs.writeFile(
        path.join(validDir, 'README.md'),
        '---\ntitle: Valid\npublished: 2024-01-01\n---\nContent'
      );

      // Should throw, not return partial results
      await expect(getEntryList<EntryBase>(testDir, 'https://example.com/'))
        .rejects
        .toThrow();
    });
  });

  describe('markdownToEntry - Error Handling', () => {
    it('should throw when header image does not exist', () => {
      const markdown = '---\ntitle: Test\npublished: 2024-01-01\nheader: non-existent.jpg\n---\nContent';

      expect(() => markdownToEntry<EntryBase>(
        markdown,
        'test-entry',
        'https://example.com/',
        '/non/existent/path'
      )).toThrow();
    });
  });
});

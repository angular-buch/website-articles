import { EntryBase, EntryMetaBase } from "./base.types";

export interface BlogEntryMeta extends EntryMetaBase {
  isUpdatePost?: boolean;
  author: string;
  author2?: string;
  mail: string;
  mail2?: string;
  language: string;
  header: {
    url: string;
    width: number;
    height: number;
  };
}

export interface BlogEntry extends EntryBase {
  meta: BlogEntryMeta;
}

export interface BlogEntryFullMeta extends BlogEntryMeta {
  bio?: string;
  bio2?: string;
  lastModified?: string;
  keywords?: string[];
  'darken-header': boolean;
  sticky?: boolean;
}

export interface BlogEntryFull extends BlogEntry {
  meta: BlogEntryFullMeta;
}

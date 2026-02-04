export interface EntryMetaBase {
  title: string;
  published: string;
  lastModified?: string;
  hidden?: boolean;
  sticky?: boolean;
}

export interface EntryBase {
  slug: string;
  html: string;
  meta: EntryMetaBase;
}

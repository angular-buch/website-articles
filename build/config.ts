export interface BuildConfig {
  markdownBaseUrl: string;
  distFolder: string;
  blogPostsFolder: string;
}

export const buildConfig: BuildConfig = {
  markdownBaseUrl: 'https://website-articles.angular-buch.com/',
  distFolder: './dist',
  blogPostsFolder: '../blog'
};

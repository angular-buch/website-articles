# website-articles

Blog posts and supplementary material for [angular-buch.com](https://angular-buch.com).
Pull requests are welcome!

## Post Frontmatter

| Property       | Description                                                                                 |
|----------------|---------------------------------------------------------------------------------------------|
| `hidden`       | Hide post in list                                                                           |
| `sticky`       | Stick post to the top of the list                                                           |
| `isUpdatePost` | Include post in separate "Updates" page. For "Angular X ist da!" posts and related stuff.   |

## Build

```bash
cd build && npm install
MARKDOWN_BASE_URL=https://website-articles.angular-buch.com/ npm run build
```

The `build/` folder is a [git subtree](https://github.com/angular-schule/website-articles-build) shared with [angular-schule/website-articles](https://github.com/angular-schule/website-articles).

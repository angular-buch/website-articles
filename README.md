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
git submodule update --init
cd build && npm install && npm run build
```

The `build/` folder is a [git submodule](https://github.com/angular-schule/website-articles-build) shared with [angular-schule/website-articles](https://github.com/angular-schule/website-articles).

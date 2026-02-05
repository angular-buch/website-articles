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

**Frischer Clone:**
```bash
git clone --recurse-submodules git@github.com:angular-buch/website-articles.git
cd website-articles/build && npm install && npm run build
```

**Bestehendes Repo:**
```bash
git submodule update --init
cd build && npm install && npm run build
```

The `build/` folder is a [git submodule](https://github.com/angular-schule/website-articles-build) shared with [angular-schule/website-articles](https://github.com/angular-schule/website-articles).

## Lokale Entwicklung

Für lokale Entwicklung mit der Website müssen beide Repos nebeneinander liegen:

```
parent-folder/
├── angular-buch-website/    ← Website
└── website-articles/        ← Dieses Repo
```

Dann in `angular-buch-website`:
```bash
npm run start:local
```

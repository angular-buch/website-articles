# website-articles

This repo contains blog posts and supplementary material.
Pull requests are welcome!

## Post Frontmatter

| Property       | Description                                                                                 |
|----------------|---------------------------------------------------------------------------------------------|
| `hidden`       | Hide post in list                                                                           |
| `sticky`       | Stick post to the top of the list                                                           |
| `isUpdatePost` | Include post in separate "Updates" page. For "Angular X ist da!" posts and related stuff.   |

## Build System

The build system processes Markdown entries into JSON for the website.

### Syncing between Repos

The `build/` folder is **identical** between:
- `angular-buch/website-articles` (Buch)
- `angular-schule/website-articles` (Schule)

**Manually adjusted per repo:**
- `build/package.json` – different build scripts
- `config.ts` – different `MARKDOWN_BASE_URL`

### Build Scripts

| Script           | Description                                            |
|------------------|--------------------------------------------------------|
| `build:init`     | Clears `dist/`                                         |
| `build:blog`     | Builds blog entries → `dist/blog/`                     |
| `build:material` | Builds material entries → `dist/material/` (Buch only) |

### Differences Buch vs. Schule

|                     | Buch                                         | Schule                                      |
|---------------------|----------------------------------------------|---------------------------------------------|
| `MARKDOWN_BASE_URL` | `https://website-articles.angular-buch.com/` | `https://website-articles.angular.schule/`  |
| `build` script      | `init + blog + material`                     | `init + blog`                               |
| `material/` folder  | exists                                       | does not exist                              |

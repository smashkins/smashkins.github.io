# MONOIDX — landing + bilingual blog

A lean **Astro** project that builds the **https://monoidx.dev** site: the
scroll-driven "MONOIDX — Sequence" landing page (GSAP + canvas frame sequence)
as the homepage, plus a MONOIDX-styled **bilingual blog** at `/blog` (EN) and
`/it/blog` (IT).

GitHub Actions runs `npm run build` on every push to `main` and publishes the
generated **`dist/`** folder to GitHub Pages. The custom domain (`CNAME`) and
`.nojekyll` live in **`public/`** and ride into `dist/` on every build.

---

## Project structure

```
astro.config.mjs        site, i18n (en default + it), mdx(), sitemap(), reading-time
src/
  content.config.ts     blog collection schema (see "Add a blog post")
  content/blog/
    en/<slug>.md         English posts
    it/<slug>.md         Italian posts (share the slug with their EN sibling)
  i18n/                  ui strings + helpers (getLocale, t, localizedHref, ...)
  layouts/              BaseLayout, BlogLayout
  components/           BlogNav, PostCard, Pagination, PostMeta, PostTOC, RelatedPosts
  styles/blog.css       blog styling, built on the landing's /styles.css tokens
  pages/
    index.astro         ported landing (1:1 with the old static page)
    404.astro
    rss.xml.ts          EN feed       (it/rss.xml.ts → IT feed)
    blog/[...page].astro    blog index + pagination
    blog/[slug].astro
    blog/tags/[tag]/[...page].astro
    it/blog/...         IT mirrors (locale = 'it')
public/                 passed through to dist/ unchanged (no fingerprinting):
  CNAME                 monoidx.dev — keeps the custom domain attached
  .nojekyll             serve files as-is (no Jekyll; allows `_`-prefixed paths)
  MONOIDX.html          classic page, stays reachable at /MONOIDX.html
  Rosanero-app/         e.g. /Rosanero-app/Concepts/rosanero-community-concept.html
  styles.css, scroll.css, scroll.js, app.js
  assets/               images, incl. assets/frames/f00..f59.jpg (canvas sequence)
```

Anything in `public/` is copied verbatim into `dist/` — the canvas frames in
particular **must** stay there so Astro never renames/fingerprints them
(`scroll.js` builds their URLs by string).

---

## Run locally

```bash
npm install      # install dependencies (package-lock.json is committed)
npm run dev      # local dev server (injects the Astro toolbar)
npm run build    # production build → dist/
npm run preview  # serve the built dist/ (use this for parity checks, not dev)
npm run check    # astro check (type/diagnostics)
```

---

## Add a blog post

Posts are Markdown under `src/content/blog/<locale>/`. **A translation pair
shares the same `<slug>`** (`en/<slug>.md` + `it/<slug>.md`) — the language
switcher keys on the slug to find the sibling, and falls back to the other
locale's blog index when no sibling exists.

Frontmatter (schema: `src/content.config.ts`):

```yaml
---
title: Building the MONOIDX Landing and Blog   # required
excerpt: One-sentence summary for cards & SEO. # required
publishDate: 2026-06-12                         # required (YYYY-MM-DD)
updateDate: 2026-06-13                           # optional
tags: [astro, engineering, monoidx]             # optional (default [])
image: /assets/blog/cover.jpg                    # optional
draft: false                                     # optional (default false)
lang: en                                          # en | it (default en)
---
```

Reading time is computed automatically; the table of contents is generated
from the post's `h2`/`h3` headings.

---

## Deployment

The site deploys via **GitHub Actions** (Pages Source = GitHub Actions):
**"Deploy site (Astro) to GitHub Pages"** (`.github/workflows/deploy-site.yml`)
runs on every push to `main` — `npm ci`, `npm run build`, publish `dist/` —
and can also be run manually from the Actions tab (`workflow_dispatch`).

### Verify

```bash
# Landing live:
curl -s https://monoidx.dev/ | grep -o "<title>[^<]*</title>"
# → <title>MONOIDX — Sequence</title>

# Blog, classic page and Rosanero passthrough resolve:
curl -s -o /dev/null -w "%{http_code}\n" https://monoidx.dev/blog/
curl -s -o /dev/null -w "%{http_code}\n" https://monoidx.dev/MONOIDX.html
curl -s -o /dev/null -w "%{http_code}\n" https://monoidx.dev/Rosanero-app/Concepts/rosanero-community-concept.html
```

---

## Gotchas

**1. Don't rename `deploy-site.yml` to `deploy.yml`.**
GitHub keys a workflow's state by file path; `.github/workflows/deploy.yml`
carries a `disabled_manually` registration from a now-deleted legacy workflow.
Reusing that path would silently suppress the deploy (pushes trigger nothing —
no run, no error).

**2. `CNAME` must be in `public/`.**
The build only attaches `monoidx.dev` if `public/CNAME` (containing
`monoidx.dev`) is copied into `dist/`. Remove it and the custom domain detaches
and must be re-entered in **Settings → Pages**.

**3. `.nojekyll`.**
`public/.nojekyll` rides into `dist/` and disables Jekyll, so any file/folder
is served as-is (notably anything starting with `_`, which Astro emits).

**4. Verify against the build, not dev.**
`npm run dev` injects the Astro toolbar and serves differently; check parity
and routes with `npm run preview` (the built `dist/`) or the live curl checks
above.

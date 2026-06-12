# MONOIDX landing + bilingual blog (`landing` branch)

A lean **Astro** project that builds the **https://monoidx.dev** site: the
scroll-driven "MONOIDX — Sequence" landing page (GSAP + canvas frame sequence)
as the homepage, plus a MONOIDX-styled **bilingual blog** at `/blog` (EN) and
`/it/blog` (IT).

This branch is an **orphan branch** — it has no shared history with `main`
(an independent AstroWind-based site in a different visual style). The two are
separate sites for the **same** Pages domain; only one may publish at a time
(see **Deployment**).

> **No longer "served verbatim."** This branch used to be plain static files
> served directly by Pages. It is now an Astro project: GitHub Actions runs
> `npm run build` and publishes the generated **`dist/`** folder. The custom
> domain (`CNAME`) and `.nojekyll` now live in **`public/`** and ride into
> `dist/` on every build.

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

**Both site variants now deploy via GitHub Actions** to the **single** Pages
site for this repo. There are two deploy workflows, one per branch:

| Branch    | Workflow name                              | File                          |
|-----------|--------------------------------------------|-------------------------------|
| `main`    | **Deploy to GitHub Pages**                 | `.github/workflows/deploy.yml` (on `main`) |
| `landing` | **Deploy landing (Astro) to GitHub Pages** | `.github/workflows/deploy-landing.yml` (on `landing`) |

The two files **must have different paths**: GitHub keys a workflow's
identity — including its enabled/disabled state — by file path, repo-wide
across branches. When both branches used `deploy.yml`, disabling `main`'s
workflow also silently suppressed `landing`'s (pushes triggered nothing,
no run, no error). Hence the distinct `deploy-landing.yml` name.

Each builds Astro and publishes `dist/` to Pages. **Exactly one of these
workflows may be enabled at a time** — see Gotcha 1.

### One-time setup

1. **Settings → Pages → Build and deployment → Source → GitHub Actions.**
   (Both branches publish via Actions now; there is no "Deploy from a branch"
   step anymore.)
2. **Disable the other branch's workflow while this one is live.**
   To make `landing` the live site, disable `main`'s **"Deploy to GitHub
   Pages"**: Repo → **Actions** → that workflow → **···** → **Disable
   workflow**. (Reverse to switch back to `main`.)

### Publish / switch

- Push to `landing` (or **Actions → "Deploy landing (Astro) to GitHub Pages"
  → Run workflow**) to build and publish this branch.
- To go back to `main`: re-enable **"Deploy to GitHub Pages"**, disable this
  branch's workflow, and push to `main` (or run it manually).

### Verify

```bash
# Landing live:
curl -s https://monoidx.dev/ | grep -o "<title>[^<]*</title>"
# → <title>MONOIDX — Sequence</title>

# Classic page and Rosanero passthrough still resolve:
curl -s -o /dev/null -w "%{http_code}\n" https://monoidx.dev/MONOIDX.html
curl -s -o /dev/null -w "%{http_code}\n" https://monoidx.dev/Rosanero-app/Concepts/rosanero-community-concept.html

# When main is the live site instead:
curl -s https://monoidx.dev/ | grep -o "<title>[^<]*</title>"
# → <title>Vincenzo Stira — Senior iOS & Mobile Platform Engineer</title>
```

---

## Gotchas

**1. Workflow fight — only one deploy workflow may run.**
Both branches' workflows run `actions/deploy-pages` and each publishes to the
same Pages site. Whichever pushes last wins, so a stray push to the *other*
branch silently overwrites the live site. Keep the inactive branch's workflow
**disabled** (one-time setup, step 2) while the other is live.

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

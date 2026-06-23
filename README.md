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

**Notion is now the primary way to publish** (see "Publishing from Notion"
below) — write in the Notion **Blog Posts** database, check **Published**, and
an hourly Action materializes the post and deploys. Hand-written Markdown still
works exactly as before and is never touched by the sync.

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

## Publishing from Notion

The blog can be authored in a Notion **Blog Posts** database. The flow is fully
hands-off:

```
Notion DB row  ──(check Published)──►  hourly sync Action  ──►  commit Markdown  ──►  deploy
```

`scripts/notion-sync.mjs` (`npm run sync`) queries the database, writes
`src/content/blog/<lang>/<slug>.md` with frontmatter that satisfies
`src/content.config.ts`, downloads the cover + inline images into
`public/assets/blog/<slug>/` (Notion's S3 URLs expire, so they are never
hotlinked), and prunes posts that are no longer published.

### Published checkbox semantics

| Published | Effect of next sync |
|---|---|
| checked (`true`) | row is materialized / updated as Markdown |
| unchecked or row deleted | the corresponding file **is deleted** (Notion is the source of truth) |

Only rows with **Published = true** sync; unchecking a row removes its file and
any orphaned images on the next run.

### EN / IT pairs

A translation pair is **two rows sharing the same `Slug`**, one with `Lang = en`
and one with `Lang = it`. The slug must be kebab-case (and not numeric-only — it
would collide with pagination routes). Each row maps to `en/<slug>.md` or
`it/<slug>.md` respectively, matching the hand-written convention above.

### Hand-written posts are protected

Synced files carry a `notionId` key in their frontmatter. **Files without
`notionId` (e.g. `building-monoidx.md`) are never modified or deleted** by the
sync — hand-written and Notion-authored posts coexist safely.

### Secrets

Two repository **Actions secrets** drive the sync:

| Secret | Value |
|---|---|
| `NOTION_TOKEN` | internal integration token (`ntn_…`) |
| `NOTION_DATA_SOURCE_ID` | id of the Blog Posts data source |

### One-time setup

1. Create an **internal** integration at
   [notion.so/my-integrations](https://www.notion.so/my-integrations) (read
   content capability) and copy its `ntn_…` token.
2. Connect it to the **Blog Posts** database: open the database → **•••** →
   **Connections** → add the integration.
3. Fetch the data source id (the API needs the data source, not the database id):

   ```bash
   curl -s https://api.notion.com/v1/databases/<DB_ID> \
     -H "Authorization: Bearer $NOTION_TOKEN" \
     -H "Notion-Version: 2025-09-03"
   ```

   Take `data_sources[0].id` from the response.
4. Add both as repository secrets: **Settings → Secrets and variables →
   Actions** → `NOTION_TOKEN` and `NOTION_DATA_SOURCE_ID`.

### Publishing manually

The cron runs at `:23` past every hour. To publish immediately, go to
**Actions → "Sync blog from Notion" → Run workflow**.

### Running locally

```bash
NOTION_TOKEN=… NOTION_DATA_SOURCE_ID=… npm run sync            # write changes
NOTION_TOKEN=… NOTION_DATA_SOURCE_ID=… npm run sync -- --dry-run  # preview only
```

### Webhook upgrade path

The sync is a scheduled Action by design — Notion webhooks POST without a custom
auth header and GitHub `repository_dispatch` requires one, so a webhook needs a
relay. To get instant (sub-hour) publishing later: stand up a **Cloudflare
Worker** that validates Notion's webhook signature and calls
`POST /repos/…/dispatches`, then add a `repository_dispatch` trigger to
`.github/workflows/notion-sync.yml`.

---

## Add a portfolio project

The **Portfolio** section on the landing page (and each project's detail HUD) is
driven entirely by **`src/data/portfolio.md`** — a single editable Markdown file
(YAML frontmatter), the same pattern as `src/data/resume.md`. The layout is
fixed; only this file's content changes. **The order of `projects` in the file
is the order shown on the page.**

Clicking a project card opens a centered, translucent **detail HUD** (fade in /
fade out) showing that project's platform, title, date, description, optional
spec rows, images and links.

### Frontmatter

```yaml
---
eyebrow: "Section 05 — Portfolio"   # optional — section eyebrow label
title: "Selected Work"              # optional — section heading
intro: "One-line section lede."      # optional — paragraph under the heading

projects:
  - slug: "project-one"            # required — unique, kebab-case; ties card → HUD + image folder
    platform: "iOS · SwiftUI"      # required — card tag + HUD eyebrow
    title: "Project One"           # required
    date: "2024"                   # optional — shown top-right in the HUD
    summary: "Shown on the card."  # required — one line on the grid card
    description: "Longer write-up shown in the HUD."   # optional — paragraph
    specs:                          # optional — label/value rows in the HUD
      - label: "Platform"
        value: "iOS 17 · iPadOS"
      - label: "Stack"
        value: "Swift · SwiftUI · Core Data"
    images:                         # optional — absolute paths (see below)
      - "/assets/portfolio/project-one/01.jpg"
    videos:                         # optional — mp4 files (see below)
      - src: "/assets/portfolio/project-one/demo.mp4"
        poster: "/assets/portfolio/project-one/demo-poster.jpg"   # optional
    links:                          # optional — external links (open in a new tab)
      - label: "App Store"
        href: "https://…"
---
```

| Field | Required | Notes |
|---|---|---|
| `slug` | yes | unique, kebab-case; also the image sub-folder name |
| `platform` | yes | card tag and HUD eyebrow (e.g. `iOS · SwiftUI`) |
| `title` | yes | project name |
| `summary` | yes | one line shown on the grid card |
| `date` | no | shown top-right in the HUD |
| `description` | no | paragraph shown in the HUD |
| `specs` | no | list of `{ label, value }` rows (monoidx readout style) |
| `images` | no | list of absolute image paths (see below) |
| `videos` | no | list of mp4s — each a path string **or** `{ src, poster }` (poster optional) |
| `links` | no | list of `{ label, href }`; open in a new tab |

Keep every value **in quotes** (as in the file) so YAML never chokes on
characters like `:`, `&`, `·` or `#`.

### Images

Drop project images under **`public/assets/portfolio/<slug>/`** and reference
them with an **absolute path**, e.g. `/assets/portfolio/project-one/01.jpg`.
Like the blog and canvas-frame assets, anything in `public/` is copied into
`dist/` verbatim (never fingerprinted), so the string paths keep working. Images
are lazy-loaded and stack vertically in the HUD.

### Videos

`videos` work the same way — drop **`.mp4`** files under
`public/assets/portfolio/<slug>/` and list them under `videos` (a plain path
string, or `{ src, poster }` to set a poster frame). They render after the
images in the HUD, **autoplay muted and loop** when the project opens (with
controls so the visitor can pause/unmute), and pause when the HUD closes. Under
"reduce motion" they don't autoplay.

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

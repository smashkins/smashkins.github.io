# MONOIDX landing page (`landing` branch)

Standalone static site (plain HTML/CSS/JS) served by **GitHub Pages** at
**https://monoidx.dev**.

This branch is an **orphan branch** — it has no shared history with `main`
(the Astro site). The two are independent: `main` builds the full Astro
portfolio/blog via GitHub Actions; this branch serves these static files
directly.

```
index.html     ← entry point (must be named index.html, served at /)
styles.css
app.js
assets/        ← images referenced by the page
CNAME          ← monoidx.dev (keeps the custom domain attached to this branch)
.nojekyll      ← serve files as-is (no Jekyll processing)
```

---

## How GitHub Pages serves this repo

There is **one** Pages site per repo, with **one** source at a time:

- **`main`** → Source = **GitHub Actions** (`.github/workflows/deploy.yml`
  builds Astro and publishes `dist/`).
- **`landing`** → Source = **Deploy from a branch** → `landing` / `(root)`
  (these static files served verbatim).

The custom domain `monoidx.dev` follows whichever source is active, as long
as that source contains a `CNAME` file with `monoidx.dev` (both branches do).

---

## Switch: Astro (`main`)  →  static landing (`landing`)

1. **Disable the Astro deploy workflow** (critical — see Gotcha 1).
   Repo → **Actions** → **"Deploy to GitHub Pages"** → **···** → **Disable workflow**.

2. **Point Pages at this branch.**
   **Settings → Pages → Build and deployment → Source** → **Deploy from a branch**
   → Branch: **`landing`**, Folder: **`/ (root)`** → **Save**.

3. **If the site doesn't change within ~2 min, force a build** (see Gotcha 2):
   push any commit to `landing` —
   ```bash
   git fetch origin landing
   git worktree add /tmp/landing landing
   cd /tmp/landing
   git commit --allow-empty -m "ci: trigger Pages build"
   git push origin landing
   cd - && git worktree remove /tmp/landing
   ```
   Watch **Actions → "pages build and deployment"**; live in ~20–60 s.

4. **Verify:**
   ```bash
   curl -s https://monoidx.dev/ | grep -o "<title>[^<]*</title>"
   # → <title>MONOIDX — Apple Platform Engineer</title>
   ```

---

## Switch back: static landing (`landing`)  →  Astro (`main`)

1. **Re-enable the Astro workflow.**
   Repo → **Actions** → **"Deploy to GitHub Pages"** → **···** → **Enable workflow**.

2. **Point Pages at GitHub Actions.**
   **Settings → Pages → Source** → **GitHub Actions** → **Save**.

3. **Trigger a build:** push to `main`, or **Actions → "Deploy to GitHub Pages"
   → Run workflow**.

4. **Verify:**
   ```bash
   curl -s https://monoidx.dev/ | grep -o "<title>[^<]*</title>"
   # → <title>Vincenzo Stira — Senior iOS & Mobile Platform Engineer</title>
   ```

---

## Gotchas (both were hit during setup)

**1. The Astro workflow reclaims Pages.**
`deploy.yml` runs `actions/deploy-pages` on every push to `main`, and that
action resets the Pages source back to **GitHub Actions** — silently
restoring the Astro site even if you switched to this branch. Always
**disable the workflow** while `landing` is the live source (step 1 above).

**2. "Save" is greyed out → no new build → stale site.**
If Source is already set to `landing`/`(root)`, GitHub won't let you
re-save an unchanged setting, so it never triggers a build — and Pages keeps
serving the **previous** deployment (the old Astro artifact) until a new
branch build replaces it. A **push to `landing`** (step 3 above) forces that
build. Re-selecting a different branch and switching back also works.

**3. `index.html` is required at root.**
GitHub Pages serves `index.html` at `/`. The original file was
`MONOIDX.html`; it must be named `index.html` here.

**4. Keep the `CNAME` file.**
Without `CNAME` (containing `monoidx.dev`) in the served folder, switching
sources can drop the custom domain and you'd have to re-enter it in
**Settings → Pages**.

**5. `.nojekyll`** disables Jekyll so any file/folder is served as-is
(notably anything starting with `_`).

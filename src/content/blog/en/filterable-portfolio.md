---
title: Building a Filterable Portfolio for the MONOIDX Landing
excerpt: A data-driven portfolio with type filtering and pagination, a résumé HUD that links into it — and two scroll-related bugs (a pinned-scroll cancellation and a classic-script function collision) that were more instructive than the features.
publishDate: 2026-06-23
tags:
  - astro
  - engineering
  - monoidx
image: /assets/blog/filterable-portfolio/4ee80bb2911d.jpg
lang: en
notionId: 388a9c08-e476-81da-b731-edf4cffc7ee7
---

The MONOIDX landing just got its biggest content update since the Astro port: a real **Portfolio** section, a **résumé HUD** that reads like a CV, and the connective tissue between them. None of it is hardcoded - the whole thing is driven by two Markdown files. This post walks through what shipped, the data model behind it, and two bugs that turned out to be more interesting than the features.


(The same commit also retired the legacy `MONOIDX.html` "classic" page and all references to it - the Astro build is now the only landing.)


## A portfolio you edit in Markdown


The Portfolio section ("Selected Work") and every project's detail panel are generated from a single file, `src/data/portfolio.md` - YAML frontmatter, the same pattern the résumé already used. The order of `projects` in the file is the order on the page. Each project is a card; clicking it opens a centered, translucent **detail HUD** with the platform, title, date, description, spec rows, images/videos and links.


```yaml
projects:
  - slug: "project-eolo"
    context: "employed"
    platform: "iOS · UIKit/SwiftUI"
    title: "Project: Eolo"
    date: "2023"
    summary: "Short description shown on the card."
    description: "Longer write-up shown in the HUD."
    specs:
      - label: "Stack"
        value: "Swift · SPM · XCFramework"
    links:
      - label: "Documentation"
        href: "https://example.com"
```


The `slug` ties three things together: the grid card, the modal panel (`data-project="slug"`), and the image folder under `public/assets/portfolio/<slug>/`. Add a project by appending an entry; nothing else has to change.


## Filtering by project type


I have four kinds of work - employer projects, freelance client work, indie products, and experiments - but they don't form a clean list. "Experimental" cuts across the others: an R&D prototype might be built at an employer _or_ for a freelance client. A single `type` enum would force every project into one bucket and lie about the overlap.


So the model has **two orthogonal axes**:

- `context`: one of `employed`, `freelance`, `indie` - every project has exactly one.
- `experimental: true` - an optional, cross-cutting flag.

The filter pills are derived from the data at build time, so a pill only appears if it has projects behind it:


```javascript
const PF_CONTEXT_ORDER = ['employed', 'freelance', 'indie'];
const pfContexts = PF_CONTEXT_ORDER.filter(c => pfProjects.some(p => p.context === c));
const pfHasExperimental = pfProjects.some(p => p.experimental);
```


The pills are single-select (All / Employed / Freelance / Indie / Experimental), and the match rule reads straight off the card's data attributes:


```javascript
const matches = (card) =>
  filter === "all"          ? true :
  filter === "experimental" ? card.dataset.experimental === "true" :
                              card.dataset.context === filter;
```


Picking _Experimental_ shows every experiment regardless of context; picking _Freelance_ shows freelance work including the experiments done there. That's the honest behaviour the two-axis model buys.


## Pagination that cooperates with the filter


Six projects per page. The wrinkle: filtering changes the visible set, so the page count is dynamic. One function owns the whole pipeline - **filter → recompute pages → render the current slice → rebuild the pager** - and it re-runs on every pill or arrow click:


```javascript
function pfRender(){
  const shown = cards.filter(matches);
  const pageCount = Math.max(1, Math.ceil(shown.length / SIZE));
  if (page > pageCount) page = pageCount;
  const onPage = new Set(shown.slice((page - 1) * SIZE, page * SIZE));

  cards.forEach(card => {
    const on = onPage.has(card);
    card.hidden = !on;
    if (on) gsap.set(card, { autoAlpha: 1, y: 0 });  // un-strand from the entrance state
  });
  // rebuild the number buttons, toggle pager visibility, disable arrows at bounds…
}
```


That `gsap.set` matters. Cards animate in with a GSAP `from()` tween (autoAlpha 0 → 1) when they scroll into view. A card revealed by paging or filtering never crosses that scroll trigger, so without forcing it visible it would stay stranded at opacity 0. (GSAP and I were not done fighting - see below.)


One small CSS gotcha lived here too: the pager carried the `hidden` attribute when there was a single page, but `.pf-pager { display:flex }` overrode the attribute's `display:none`. The empty pager - just the arrows - stayed on screen. Fix: `.pf-pager[hidden]{ display:none }`.


## Linking a résumé note to a project


The résumé HUD lists jobs, each with bullet notes. A note can deep-link to a portfolio project with an inline token, Markdown-link style:


```yaml
notes:
  - "More technical details are [here](project:project-one)"
```


At build time a small parser splits each note on `[label](project:slug)` and renders the matched segment as a button carrying `data-project-link="slug"`; a delegated click handler opens that project's HUD _on top of_ the open drawer (the modal sits at a higher z-index). Slugs that don't resolve fall back to plain text, so a typo degrades gracefully instead of producing a dead link.


## Résumé content, restructured


Smaller changes that add up to a real CV:

- Job entries take either a `notes:` list (rendered as bullets) or a single `note:` string.
- Any meta row can carry an optional `note:`, rendered small and left-aligned under its value.
- "Core Skills" is grouped by category (Languages, iOS Frameworks, Architecture, Tooling & CI/CD) and rendered as a dot-separated list per group.
- A `metaAfter:` block lets specific rows (e.g. "Status") sit _after_ the skills block instead of above it.

## Bug one: the navigation that wouldn't scroll


With all that in place, the navigation broke. Clicking the rail's **Expertise**, or the **Portfolio** link, scrolled a few hundred pixels and stopped - nowhere near the target. Every link into or past the pinned opening sequence undershot to roughly the same spot.


The landing pins a `#stage` element through the entire opening sequence with GSAP ScrollTrigger. The root cause:


> ⚠️ Native `scrollTo({ behavior: "smooth" })` is silently **cancelled a few hundred pixels in** when ScrollTrigger is pinning - the browser's smooth animation and the pin fight, and the scroll dies mid-flight. The global `html { scroll-behavior: smooth }` made it worse by re-smoothing every programmatic scroll.


The fix is to stop using the browser's smooth scroll and drive the scroll position myself on GSAP's ticker, which ScrollTrigger cooperates with:


```javascript
function smoothScrollTo(y){
  const max = document.documentElement.scrollHeight - window.innerHeight;
  y = Math.max(0, Math.min(Math.round(y), max));
  if (reduce){ window.scrollTo({ top: y }); return; }
  const o = { y: window.scrollY };
  gsap.to(o, {
    y, duration: 0.9, ease: "power2.inOut",
    onUpdate(){ window.scrollTo({ top: o.y, behavior: "auto" }); },
  });
}
```


Two supporting details. First, disable the CSS smooth-scroll on the landing only so it can't re-smooth each frame: `html:has(body.scroll-edition){ scroll-behavior:auto }`. Second, expose this scroller on `window` so the shared "back to top" button prefers it on the landing, while blog pages - which have no pin - keep plain native smooth scroll.


## Bug two: the résumé panel that silently died


Then the résumé drawer stopped opening. No console error, no movement - every trigger (the button, the slider knob, the `#resume` deep link) dead. GSAP itself was fine; a probe tween ticked to completion. The panel just never moved.


The culprit was a name collision. `scroll.js` is loaded as a **classic** (non-module) script, because it hands GSAP globals across `<script>` tags:


```html
<script is:inline src="/scroll.js"></script>
```


In a sloppy-mode classic script, a `function` declaration inside a block is hoisted to the enclosing function scope. My new pagination code defined a `function render(){…}` inside its `if (pfGrid) { … }` block - the **same name** as the résumé panel's own global `render()`. When the pagination block executed at startup, its `render` overwrote the global one. From then on, every `render()` call in the panel logic - including the one inside `snapTo()` - ran the _portfolio filter_ instead of repositioning the drawer.


> 🩹 The fix was a single rename: the pagination function became `pfRender()`. A `type="module"` script would have block-scoped the declaration and surfaced the shadowing immediately - but this file is intentionally classic, so the discipline is just: keep top-level and block function names unique.


## Takeaways

- **Content is data.** The layout is fixed; the Markdown frontmatter is the API. Adding a project or a job is an edit, not a deploy of new code.
- **Model the domain honestly.** Two orthogonal axes (`context` + `experimental`) beat one lossy enum the moment a project belongs to more than one bucket.
- **When a library owns the scroll, let it own programmatic scrolling too.** Pinning and native smooth scroll don't mix; drive the position on the library's ticker.
- **Know your script's scope rules.** In a classic script, a stray block-level `function` name is a global - and it will happily clobber another one with no warning.

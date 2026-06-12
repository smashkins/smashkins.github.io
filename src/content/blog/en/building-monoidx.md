---
title: Building the MONOIDX Landing and Blog
excerpt: How the MONOIDX site went from a single scroll-driven HTML page to a lean Astro project with a bilingual blog — without losing the canvas sequence or the design language.
publishDate: 2026-06-12
tags: [astro, engineering, monoidx]
lang: en
---

The MONOIDX landing started life as one file: a scroll-driven page that scrubs through a sixty-frame canvas sequence as you move down the document. It worked, but it was a dead end. Adding a blog, a second language, or proper SEO meant either bolting hand-written HTML onto a static page forever, or moving to a build that could generate routes for me. I chose the second path, and the constraint was simple: the landing had to come through visually and behaviorally identical.

## Keeping the scroll sequence intact

The sequence is the heart of the page, so it was the part I refused to touch. The canvas is driven by GSAP and ScrollTrigger loaded from a CDN, plus a `scroll.js` that reads globals and dereferences a long list of element ids on startup. Any reordering of the scripts, or any missing id, crashes it before the first frame paints.

### The is:inline rule

The single most important detail in the Astro port was forcing the three scripts to stay inline and in order — GSAP, then ScrollTrigger, then `scroll.js`. Astro will happily bundle and reorder module scripts, which would break the global handoff.

```js
// Frames are addressed by string, never imported — so they must
// live in public/ and never be fingerprinted by the bundler.
const FRAME = (i) => `/assets/frames/f${String(i).padStart(2, "0")}.jpg`;

ScrollTrigger.create({
  trigger: "#scrolly",
  scrub: true,
  onUpdate: (self) => {
    const i = Math.round(self.progress * 59);
    drawFrame(FRAME(i));
  },
});
```

Because the frames are referenced as plain strings, they have to stay in `public/` so the build never renames them. That one rule kept all sixty frames resolving after the move.

## Porting to Astro

The body markup moved into `src/pages/index.astro` almost verbatim, wrapped in a `BaseLayout` that replicates the original `<head>` — fonts, the root-relative stylesheet, and the SEO meta. The only intentional markup change was the nav: the links now point at the blog and a classic fallback page.

> The goal was never to redesign. It was to make the existing page generatable, so everything new could share its skeleton.

What Astro buys here is not the landing — it is everything around it: content collections, pagination, RSS, a sitemap, and per-locale routing, all generated at build time into a fully static `dist/`.

## The blog and the design tokens

The blog had to read as the same product as the landing, so it builds entirely on the landing's design tokens:

- `--display` and `--mono` for the type pairing
- `--line` and `--line-2` for hairline borders
- `--ease` for every transition
- the `.eyebrow` and `.wrap` idioms reused verbatim

Post rows borrow the landing's `philo-row` hover — a small padding shift on hover, a hairline border between rows, monospaced metadata on the left. Tags become hairline chips, the table of contents becomes a sticky aside on desktop and a `<details>` block on mobile, and the whole thing stays bilingual through a tiny [i18n helper](https://docs.astro.build/en/guides/internationalization/) that prefixes Italian routes with `/it`.

The result is one codebase, one visual language, and a blog that feels like it was always part of the unit.

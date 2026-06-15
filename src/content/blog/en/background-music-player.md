---
title: Adding a Background Music Player to a Static Astro Site
excerpt: How a minimal play/stop/volume player streams a YouTube playlist's audio on loop — using the IFrame API, a hidden iframe, and view transitions to keep the music playing across page navigation.
publishDate: 2026-06-15
tags:
  - astro
  - engineering
  - monoidx
lang: en
notionId: 37fa9c08-e476-816d-9cc5-db22620e324d
---

A minimal background-music player now lives in the MONOIDX topbar: a play button, a stop button, and a volume slider that stream a YouTube playlist's audio on loop. This post covers what it took to make that work on a static, multi-page Astro site, the obvious parts, and the two that weren't.


## The constraints


There is no official "audio-only" YouTube API. The sanctioned way to play a playlist on a third-party page is the **IFrame Player API**, which plays _video_. To get audio only, you load the player into a hidden iframe and never show it.

> Browsers also block autoplay-with-sound until the user interacts with the page. So "start automatically" can't mean "on load", it means "the moment the visitor does anything."

## Embedding the player


The player is created on a 1×1, visually-hidden mount. Crucially the iframe is **not** `display:none` - some browsers suspend playback for fully-hidden media - so it is pushed off-screen instead:


```css
.bg-player__frame {
  position: absolute;
  width: 1px;
  height: 1px;
  left: -9999px;
  opacity: 0;
  pointer-events: none;
}
```


The playlist loops through the IFrame API's own playlist looping:


```javascript
new YT.Player('bg-player-yt', {
  playerVars: {
    listType: 'playlist',
    list: 'PLDQmiNJl6F54',
    loop: 1,
    controls: 0,
    playsinline: 1,
    origin: location.origin,
  },
  events: { onReady, onStateChange },
});
```


### Auto-start, the honest way


Instead of a (blocked) load-time autoplay, the player arms a one-time listener on the first `click`, `scroll`, `keydown` or `touchstart`, starts playback, and removes itself. On the scroll-driven landing page, the first scroll is enough.


### Play, stop, and a volume that remembers


Play calls `playVideo()`, Stop calls `pauseVideo()` so Play resumes cleanly, and the slider calls `setVolume()`. The chosen level is written to `localStorage` and restored on the next load, so the site remembers how loud you like it.


## The hard part: surviving navigation


The site is a classic multi-page app, every link is a full page load. A player in the topbar would restart on every click, which defeats the whole idea of _background_ music.


The fix is Astro's view transitions. Adding `<ClientRouter />` turns in-site navigations into client-side DOM swaps instead of reloads, and marking the player wrapper with `transition:persist` tells Astro to carry that exact DOM node, iframe and all, across the swap:


```javascript
<div id="bg-player" transition:persist="bg-player"> ... </div>
```


Because the iframe is never destroyed, the audio never stops.


### Keeping the GSAP landing out of it


The landing page is a scroll-driven GSAP sequence wired up with inline scripts that run once on load. View transitions don't re-run inline scripts, so routing the landing through the client router would break its animation. The answer was to scope `<ClientRouter />` to the **blog layout only**. Blog-to-blog navigation is a smooth client swap with continuous audio; crossing into the landing is a normal full load, and the landing behaves exactly as before.


One consequence of turning on view transitions: any script that wires up the DOM has to re-run after each swap. The table-of-contents scroll-spy and the back-to-top button were moved onto the `astro:page-load` event and now tear down on `astro:before-swap`, so they don't leak listeners across navigations.


## A mobile menu that doesn't care about navigation


On phones the nav links collapse behind a hamburger, while the player controls stay in the bar. Rather than bind a handler to a button that gets swapped out on every navigation, the toggle is a single **document-level delegated listener**, bound once:


```javascript
document.addEventListener('click', (e) => {
  const toggle = e.target.closest('[data-nav-toggle]');
  if (toggle) {
    // open/close the menu this button controls
  }
});
```


The `document` survives view transitions, so the handler never needs rebinding, it just finds whichever nav is on the page at click time.


## What it adds up to


A few small pieces, a hidden YouTube iframe, two buttons, a slider, a hamburger, plus one architectural decision, scoped view transitions, that keeps the music playing while you read. The minimal surface hides the part that actually mattered: making a static site behave, just a little, like an app. The [first post](https://monoidx.dev/blog/building-monoidx/) covers how the rest of the site is put together.

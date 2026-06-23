// @ts-nocheck
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

/* ===================== MONOIDX — scroll sequence (GSAP + ScrollTrigger) ===================== */
/* iOS-safe: scrubs a preloaded image sequence on a <canvas> instead of a <video>. */
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const landingWindow = window as typeof window & {
  __mxLandingCleanup?: () => void;
  __mxSmoothScrollTo?: (y: number) => void;
};

function initLanding() {
  if (!document.getElementById("seqCanvas")) {
    landingWindow.__mxLandingCleanup?.();
    return;
  }

  landingWindow.__mxLandingCleanup?.();

  const cleanupTasks: Array<() => void> = [];
  let cleanedUp = false;

  function addCleanup(task: () => void) {
    cleanupTasks.push(task);
  }

  function on(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean,
  ) {
    target.addEventListener(type, listener, options);
    addCleanup(() => target.removeEventListener(type, listener, options));
  }

  function cleanupLanding() {
    if (cleanedUp) return;
    cleanedUp = true;
    cleanupTasks.splice(0).reverse().forEach((task) => task());
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    gsap.globalTimeline.clear();
    document.body.classList.remove("resume-open");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    if (landingWindow.__mxSmoothScrollTo === smoothScrollTo) delete landingWindow.__mxSmoothScrollTo;
    if (landingWindow.__mxLandingCleanup === cleanupLanding) delete landingWindow.__mxLandingCleanup;
  }

  landingWindow.__mxLandingCleanup = cleanupLanding;
  on(document, "astro:before-swap", cleanupLanding, { once: true });

const LABELS = ["Unit", "Identity", "Expertise", "Philosophy", "Operational"];
const BOUNDS = [0.15, 0.37, 0.59, 0.81];   // progress thresholds → active section
const FRAME_COUNT = 60;                     // assets/frames/f00.jpg … f59.jpg

const $  = (s) => document.querySelector(s);
const $$ = (s) => Array.prototype.slice.call(document.querySelectorAll(s));

const veil      = $("#veil");
const canvas    = $("#seqCanvas");
const ctx       = canvas.getContext("2d");
const videoWrap = $("#videoWrap");
const railSegs  = $$("#rail .seg");
const idxBig    = $("#idxBig");
const idxLabel  = $("#idxLabel");
const seqEl     = $("#seq");
const angleEl   = $("#angle");
const scrubFill = $("#scrubFill");
const reticle   = $("#reticle");
const ghost     = $("#ghost");

railSegs.forEach((seg, i) => { seg.querySelector("span").textContent = LABELS[i]; });
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- dialog focus helpers ---------- */
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");
let activeDialog = null;
let lastFocusedBeforeDialog = null;

function visibleFocusable(root){
  if (!root) return [];
  return $$(FOCUSABLE).filter((el) => root.contains(el) && el.offsetParent !== null);
}
function focusDialog(root, preferred){
  const target = preferred || visibleFocusable(root)[0] || root;
  if (!target.hasAttribute("tabindex") && target === root) target.setAttribute("tabindex", "-1");
  requestAnimationFrame(() => target.focus({ preventScroll: true }));
}
function activateFocusTrap(root, preferred){
  if (activeDialog === root) return;
  lastFocusedBeforeDialog = document.activeElement;
  activeDialog = root;
  focusDialog(root, preferred);
}
function releaseFocusTrap(restore = true){
  const restoreTo = lastFocusedBeforeDialog;
  activeDialog = null;
  lastFocusedBeforeDialog = null;
  if (restore && restoreTo && typeof restoreTo.focus === "function") {
    requestAnimationFrame(() => {
      try { restoreTo.focus({ preventScroll: true }); } catch (_) {}
    });
  }
}
on(document, "keydown", (e) => {
  if (!activeDialog || e.key !== "Tab") return;
  const nodes = visibleFocusable(activeDialog);
  if (nodes.length === 0) {
    e.preventDefault();
    focusDialog(activeDialog);
    return;
  }
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});
function setBodySiblingsInert(dialog, inert){
  Array.from(document.body.children).forEach((child) => {
    if (child === dialog || child.contains(dialog) || child.tagName === "SCRIPT") return;
    if (inert) {
      child.setAttribute("inert", "");
      child.setAttribute("aria-hidden", "true");
    } else {
      child.removeAttribute("inert");
      child.removeAttribute("aria-hidden");
    }
  });
}

/* ---------- frame sequence ---------- */
const frames = new Array(FRAME_COUNT);
let curFrame = -1;
let loaded = 0;

function sizeCanvas(){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = videoWrap.clientWidth || window.innerWidth;
  const h = videoWrap.clientHeight || window.innerHeight;
  canvas.width  = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
}

function drawFrame(i){
  const img = frames[i];
  if (!img || !img.complete || !img.naturalWidth) return;
  const cw = canvas.width, ch = canvas.height;
  const ir = img.naturalWidth / img.naturalHeight, cr = cw / ch;
  let dw, dh;
  if (ir > cr){ dh = ch; dw = ch * ir; } else { dw = cw; dh = cw / ir; }
  const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);
  curFrame = i;
}

function preload(){
  for (let i = 0; i < FRAME_COUNT; i++){
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      loaded++;
      if (i === 0) { sizeCanvas(); drawFrame(0); revealStage(); }
      // keep the visible frame fresh as assets stream in
      if (i === Math.max(0, curFrame)) drawFrame(i);
      if (loaded === FRAME_COUNT) ScrollTrigger.refresh();
    };
    img.src = "assets/frames/f" + String(i).padStart(2, "0") + ".jpg";
    frames[i] = img;
  }
}

let revealed = false;
function revealStage(){
  if (revealed) return; revealed = true;
  requestAnimationFrame(() => veil.classList.add("gone"));
  setTimeout(() => { veil.style.display = "none"; }, 1000);
}
// hard fallback so the veil never sticks even if a frame stalls
setTimeout(revealStage, 2500);

sizeCanvas();
preload();

/* ============ build the choreography ============ */
const T = 100;
const tl = gsap.timeline({
  defaults: { ease: "none" },
  scrollTrigger: {
    trigger: "#scrolly",
    start: "top top",
    end: "bottom bottom",
    scrub: reduce ? false : 0.6,
    pin: "#stage",
    anticipatePin: 1,
  }
});

// 1) drive the frame index across the whole sequence (in lockstep with the timeline)
const fp = { f: 0 };
tl.to(fp, {
  f: FRAME_COUNT - 1, duration: T,
  onUpdate(){ const i = Math.round(fp.f); if (i !== curFrame) drawFrame(i); }
}, 0);

// initial act states
gsap.set("#act0", { autoAlpha: 1, y: 0 });
["#act1", "#act2", "#act3", "#act4"].forEach(id => gsap.set(id, { autoAlpha: 0, y: 48 }));
gsap.set(".chip",  { autoAlpha: 0, y: 26 });
gsap.set(".tenet", { autoAlpha: 0, y: 22 });
gsap.set("#manifest .mrow", { autoAlpha: 0, y: 20 });

const IN  = { autoAlpha: 1, y: 0, duration: 7, ease: "power2.out" };
const OUT = { autoAlpha: 0, y: -34, duration: 6, ease: "power2.in" };

tl.to("#cue",  { autoAlpha: 0, duration: 4 }, 4);
tl.to("#act0", { autoAlpha: 0, y: -40, duration: 6, ease: "power2.in" }, 10);

tl.to("#act1", IN, 18);
tl.to("#act1", OUT, 34);

tl.to("#act2", IN, 40);
tl.to(".chip", { autoAlpha: 1, y: 0, duration: 5, stagger: 0.7, ease: "power2.out" }, 41.5);
tl.to(".chip", { autoAlpha: 0, y: -18, duration: 4, stagger: 0.3, ease: "power2.in" }, 55);
tl.to("#act2", OUT, 56);

tl.to("#act3", IN, 62);
tl.to(".tenet", { autoAlpha: 1, y: 0, duration: 5, stagger: 0.8, ease: "power2.out" }, 63.5);
tl.to(".tenet", { autoAlpha: 0, y: -16, duration: 4, stagger: 0.25, ease: "power2.in" }, 77);
tl.to("#act3", OUT, 78);

tl.to("#act4", IN, 84);
tl.to("#manifest .mrow", { autoAlpha: 1, y: 0, duration: 5, stagger: 0.9, ease: "power2.out" }, 85.5);

/* ============ STATE / HUD / PARALLAX ============ */
const vlines = $$("#bgField .vline");
let lastIdx = -1;
let currentIdx = 0;   // exposed for the horizontal resume drawer (Expertise === 2)

/* ===== professional experience drawer — state + helpers =====
   (declared before the ScrollTrigger below, whose onUpdate calls onSectionChange) */
/* While the Expertise section (idx===2) is active, horizontal scroll / swipe
   scrubs a translucent resume drawer in from the right. Capturing the gesture
   (preventDefault) freezes window.scrollY, so the pinned canvas/HUD stays put. */
const drawer = $("#resumeDrawer");   // centering container
const panel  = $("#rdPanel");        // the card that slides
const rdInner = panel ? panel.querySelector(".rd-inner") : null;  // scrollable content
const act2Body = $("#act2Body");     // disciplines content (slides out left)
const expCue = $("#expCue");
const rdClose = $("#rdClose");
const stageIndexEl = $(".stage-index");
const sliderTrack  = $("#expSliderTrack");
const sliderFill   = $("#expSliderFill");
const sliderKnob   = $("#expSliderKnob");

const EXP_IDX = 2;
const THRESHOLD = 600;        // px of horizontal travel for a full open
const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;

let panelProgress = 0;        // 0 closed … 1 open
let acc = 0;                  // accumulated horizontal travel (px)
let snapTween = null;
let resumeHashSet = false;    // whether we put #resume in the URL (so we only clear our own)
let resumeDeepLinkActive = false;  // settling a #resume deep link — keep it anchored, don't auto-close
const setPanelX = panel    ? gsap.quickSetter(panel, "x", "px")    : null;
const setPanelO = panel    ? gsap.quickSetter(panel, "opacity")    : null;
const setBodyX  = act2Body ? gsap.quickSetter(act2Body, "x", "px") : null;
const setBodyO  = act2Body ? gsap.quickSetter(act2Body, "opacity") : null;
let resumeTrapOpen = false;

function render(){
  if (!panel) return;
  const vw = window.innerWidth;
  // resume panel slides in from the right and settles centered
  setPanelX((1 - panelProgress) * vw);
  setPanelO(panelProgress);
  // disciplines slide out to the left and fade as the panel arrives
  if (setBodyX){ setBodyX(-panelProgress * vw * 0.6); setBodyO(1 - panelProgress); }
  // keep the drag slider in sync
  if (sliderKnob && sliderTrack){
    sliderKnob.style.transform = `translateX(${panelProgress * sliderTrack.clientWidth}px)`;
    sliderKnob.setAttribute("aria-valuenow", Math.round(panelProgress * 100));
    if (sliderFill) sliderFill.style.width = (panelProgress * 100) + "%";
  }
}
function applyState(){
  if (!drawer) return;
  const open = panelProgress > 0.001;
  const trapOpen = panelProgress > 0.5;
  if (panel) panel.style.pointerEvents = open ? "auto" : "none";
  drawer.setAttribute("aria-hidden", open ? "false" : "true");
  drawer.setAttribute("aria-modal", trapOpen ? "true" : "false");
  if (expCue) expCue.setAttribute("aria-expanded", open ? "true" : "false");
  document.body.classList.toggle("resume-open", open);  // fade the nav out of the way
  if (trapOpen !== resumeTrapOpen) {
    resumeTrapOpen = trapOpen;
    if (trapOpen) activateFocusTrap(drawer, rdClose);
    else if (activeDialog === drawer) releaseFocusTrap(false);
  }

  // reflect a shareable #resume hash once the panel is effectively open.
  // Only clear a hash we set ourselves, so a deep-linked #resume survives the
  // initial (closed) applyState() call until the deep-link handler opens it.
  const shareOpen = panelProgress > 0.5;
  if (shareOpen) {
    if (location.hash !== "#resume") history.replaceState(null, "", "#resume");
    resumeHashSet = true;
  } else if (resumeHashSet && location.hash === "#resume") {
    history.replaceState(null, "", location.pathname + location.search);
    resumeHashSet = false;
  }
}
function snapTo(target){
  if (snapTween){ snapTween.kill(); snapTween = null; }
  if (reduce){
    panelProgress = target; acc = target * THRESHOLD; render(); applyState();
    return;
  }
  const proxy = { v: panelProgress };
  snapTween = gsap.to(proxy, {
    v: target, duration: 0.42, ease: "power3.out",
    onUpdate(){ panelProgress = proxy.v; acc = panelProgress * THRESHOLD; render(); applyState(); },
    onComplete(){ snapTween = null; panelProgress = target; acc = target * THRESHOLD; render(); applyState(); }
  });
}
function onSectionChange(idx){
  if (resumeDeepLinkActive) return;   // a late refresh can blip idx while we settle a deep link
  // safety net: if we ever leave Expertise while open, close instantly
  if (idx !== EXP_IDX && panelProgress > 0){
    if (snapTween){ snapTween.kill(); snapTween = null; }
    panelProgress = 0; acc = 0; render(); applyState();
  }
}

ScrollTrigger.create({
  trigger: "#scrolly",
  start: "top top",
  end: "bottom bottom",
  scrub: true,
  onUpdate(self){
    const p = self.progress;
    scrubFill.style.width = (p * 100).toFixed(2) + "%";

    const ang = Math.round(p * 360) % 360;
    angleEl.textContent = String(ang).padStart(3, "0") + "°";

    let idx = 0;
    for (let i = 0; i < BOUNDS.length; i++) if (p >= BOUNDS[i]) idx = i + 1;
    if (idx !== lastIdx){
      lastIdx = idx;
      currentIdx = idx;
      railSegs.forEach((s, i) => s.classList.toggle("active", i === idx));
      idxBig.textContent  = String(idx).padStart(2, "0");
      idxLabel.textContent = LABELS[idx].toUpperCase();
      seqEl.textContent = String(idx).padStart(2, "0") + " / 05";
      if (stageIndexEl) stageIndexEl.classList.toggle("idx-expertise", idx === EXP_IDX);
      if (typeof onSectionChange === "function") onSectionChange(idx);
      render();   // reposition the slider knob once it becomes visible
    }
    $("#scrimLeft").style.opacity = idx >= 1 ? 1 : 0.35;

    // transforming graphics
    reticle.style.transform = `translate(-50%,-50%) rotate(${(p * 220).toFixed(1)}deg) scale(${(0.8 + Math.sin(p * Math.PI) * 0.5).toFixed(3)})`;
    reticle.style.opacity = (Math.sin(p * Math.PI) * 0.32).toFixed(3);
    const bs = 40 + p * 34;
    $$("#hud .br").forEach(b => { b.style.width = bs + "px"; b.style.height = bs + "px"; });

    // parallax
    videoWrap.style.transform = `scale(${(1.1 - p * 0.1).toFixed(3)}) translateY(${(p * -3).toFixed(2)}%)`;
    vlines.forEach(v => {
      const d = parseFloat(v.dataset.depth || "0.2");
      v.style.transform = `translateY(${(p * d * -160).toFixed(1)}px)`;
    });
    if (ghost){
      ghost.style.transform = `translate(-50%,-50%) translateY(${(p * -120).toFixed(0)}px) scale(${(1 + p * 0.25).toFixed(3)})`;
      ghost.style.opacity = (0.6 - p * 0.4).toFixed(2);
    }
  }
});

/* gsap-driven smooth scroll. Native scrollTo({behavior:"smooth"}) is silently
   cancelled a few hundred px in by ScrollTrigger's pinning of #stage, so the
   page never reaches the target. We drive window.scroll ourselves on the gsap
   ticker instead, which ScrollTrigger cooperates with. */
let scrollTween = null;
const setScroll = (v) => window.scrollTo({ top: v, left: 0, behavior: "auto" });
function smoothScrollTo(y){
  // clamp to the real scrollable range so the tween can't overshoot/undershoot
  const max = document.documentElement.scrollHeight - window.innerHeight;
  y = Math.max(0, Math.min(Math.round(y), max));
  if (scrollTween){ scrollTween.kill(); scrollTween = null; }
  if (reduce){ setScroll(y); return; }
  const o = { y: window.scrollY };
  scrollTween = gsap.to(o, {
    y, duration: 0.9, ease: "power2.inOut", overwrite: true,
    onUpdate(){ setScroll(o.y); },
    onComplete(){ scrollTween = null; }
  });
}
// Exposed so shared components (e.g. ToTop) can scroll reliably on this page
// instead of native smooth scroll, which ScrollTrigger pinning cancels.
landingWindow.__mxSmoothScrollTo = smoothScrollTo;

/* ============ clickable rail — jump to each section ============ */
const stMain = tl.scrollTrigger;
const TARGET_P = [0.05, 0.26, 0.48, 0.70, 0.93];
railSegs.forEach((seg, i) => {
  seg.setAttribute("role", "button");
  seg.setAttribute("tabindex", "0");
  const go = () => {
    const y = stMain.start + TARGET_P[i] * (stMain.end - stMain.start);
    smoothScrollTo(y);
  };
  seg.addEventListener("click", go);
  seg.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
  });
});

/* ============ OUTRO parallax + reveal ============ */
const outroBg = $(".outro-bg");
if (outroBg){
  gsap.to(outroBg, {
    yPercent: -22, ease: "none",
    scrollTrigger: { trigger: ".outro", start: "top bottom", end: "bottom top", scrub: true }
  });
}
$$(".anim-up").forEach(el => {
  // fromTo (not from): pin the end state explicitly to autoAlpha:1 / y:0. A bare
  // gsap.from() captures the element's CURRENT values as the destination — and
  // initLanding runs twice on a landing visit (the module's own call, then
  // astro:page-load), so on the second pass the element is still sitting in the
  // first pass's from-state (opacity:0). from() would then animate 0 → 0 and
  // strand the heading invisible (the cards escape only because pfRender
  // force-sets them). An explicit destination is immune to that leftover state.
  gsap.fromTo(el,
    { autoAlpha: 0, y: 40 },
    {
      autoAlpha: 1, y: 0, duration: 1, ease: "power2.out", overwrite: "auto",
      scrollTrigger: { trigger: el, start: "top 85%" }
    }
  );
});
if (ghost) ghost.textContent = "MX";

/* nav scrolled state */
const nav = $("#nav");
on(window, "scroll", () => {
  nav?.classList.toggle("scrolled", window.scrollY > 40);
}, { passive: true });

/* keep canvas crisp + layout correct on resize / orientation change */
let rT = null;
on(window, "resize", () => {
  clearTimeout(rT);
  rT = setTimeout(() => {
    sizeCanvas();
    drawFrame(Math.max(0, curFrame));
    ScrollTrigger.refresh();
    render();   // recompute resume panel / disciplines offsets for new viewport width
  }, 150);
}, { passive: true });

on(window, "load", () => ScrollTrigger.refresh());

/* ============ professional experience drawer — gesture listeners ============ */
if (drawer){
  if (panel) gsap.set(panel, { x: window.innerWidth, opacity: 0 });
  if (act2Body) gsap.set(act2Body, { x: 0, opacity: 1 });
  render(); applyState();

  /* ---- wheel (trackpad) ---- */
  function normDelta(d, mode){
    if (mode === 1) return d * 16;                 // lines
    if (mode === 2) return d * window.innerWidth;  // pages
    return d;                                       // pixels
  }
  let wheelSettle = null;
  on(window, "wheel", (e) => {
    if (reduce) return;
    if (document.querySelector(".pf-modal.is-open")) return;  // project modal scrolls natively
    const open = panelProgress > 0 || snapTween;
    if (currentIdx !== EXP_IDX && !open) return;
    const horiz = Math.abs(e.deltaX) > Math.abs(e.deltaY);

    if (!horiz){                                    // vertical gesture
      if (!open) return;                            // closed → normal page scroll
      if (rdInner && rdInner.contains(e.target)) return;  // open → scroll panel content natively
      e.preventDefault();                           // open but over backdrop → keep background frozen
      return;
    }

    // horizontal gesture → scrub the panel open / closed
    e.preventDefault();
    if (snapTween){ snapTween.kill(); snapTween = null; }  // reversal cancels snap

    acc = Math.max(0, Math.min(THRESHOLD, acc + normDelta(e.deltaX, e.deltaMode)));
    panelProgress = clamp01(acc / THRESHOLD);
    render(); applyState();

    clearTimeout(wheelSettle);
    wheelSettle = setTimeout(() => snapTo(panelProgress > 0.5 ? 1 : 0), 120);
  }, { passive: false });

  /* ---- touch ---- */
  let tx = 0, ty = 0, tAxis = null, tBase = 0;
  on(window, "touchstart", (e) => {
    if (reduce) return;
    if (currentIdx !== EXP_IDX && panelProgress === 0) return;
    const t = e.touches[0]; tx = t.clientX; ty = t.clientY; tAxis = null; tBase = acc;
    if (snapTween){ snapTween.kill(); snapTween = null; }
  }, { passive: true });
  on(window, "touchmove", (e) => {
    if (reduce) return;
    if (document.querySelector(".pf-modal.is-open")) return;  // project modal scrolls natively
    if (currentIdx !== EXP_IDX && panelProgress === 0) return;
    const t = e.touches[0];
    const dx = t.clientX - tx, dy = t.clientY - ty;
    if (tAxis === null){
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 8) tAxis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      else return;
    }
    if (tAxis === "y"){
      if (panelProgress > 0 && !(rdInner && rdInner.contains(e.target))) e.preventDefault(); // freeze bg over backdrop
      return;                                         // inside panel → native content scroll; closed → page scroll
    }
    e.preventDefault();                              // swipe left (dx<0) opens
    acc = Math.max(0, Math.min(THRESHOLD, tBase - dx));
    panelProgress = clamp01(acc / THRESHOLD);
    render(); applyState();
  }, { passive: false });
  on(window, "touchend", () => {
    if (tAxis === "x") snapTo(panelProgress > 0.5 ? 1 : 0);
    tAxis = null;
  }, { passive: true });

  /* ---- click / keyboard fallback ---- */
  if (expCue)  expCue.addEventListener("click", () => snapTo(1));
  if (rdClose) rdClose.addEventListener("click", () => snapTo(0));
  on(window, "keydown", (e) => {
    if (e.key === "Escape" && panelProgress > 0) snapTo(0);
  });

  /* ---- drag slider (bottom-left) ---- */
  if (sliderKnob && sliderTrack){
    let dragging = false;
    const setFromX = (clientX) => {
      const r = sliderTrack.getBoundingClientRect();
      if (snapTween){ snapTween.kill(); snapTween = null; }
      panelProgress = clamp01((clientX - r.left) / r.width);
      acc = panelProgress * THRESHOLD;
      render(); applyState();
    };
    sliderKnob.addEventListener("pointerdown", (e) => {
      dragging = true; e.preventDefault();
      try { sliderKnob.setPointerCapture(e.pointerId); } catch (_) {}
    });
    sliderKnob.addEventListener("pointermove", (e) => { if (dragging) setFromX(e.clientX); });
    const endDrag = (e) => {
      if (!dragging) return; dragging = false;
      try { sliderKnob.releasePointerCapture(e.pointerId); } catch (_) {}
      snapTo(panelProgress > 0.5 ? 1 : 0);
    };
    sliderKnob.addEventListener("pointerup", endDrag);
    sliderKnob.addEventListener("pointercancel", endDrag);
    sliderTrack.addEventListener("pointerdown", (e) => {
      if (e.target === sliderKnob) return;
      setFromX(e.clientX);
      snapTo(panelProgress > 0.5 ? 1 : 0);
    });
    sliderKnob.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowUp")   { e.preventDefault(); snapTo(1); }
      if (e.key === "ArrowLeft"  || e.key === "ArrowDown") { e.preventDefault(); snapTo(0); }
    });
  }
}

/* ============ smooth in-page anchor scrolling (#portfolio, #contact, …) ============ */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (!id || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (typeof snapTo === "function" && panelProgress > 0) snapTo(0);  // close the résumé first
    const y = target.getBoundingClientRect().top + window.scrollY;
    smoothScrollTo(y);
  });
});

/* ============ brand wordmark → reset to top of the site ============ */
const brandHome = $("#brandHome");
if (brandHome){
  function goHome(){
    if (typeof snapTo === "function" && panelProgress > 0) snapTo(0);  // close the résumé first
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    smoothScrollTo(0);
  }
  brandHome.addEventListener("click", goHome);
  brandHome.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goHome(); }
  });
}

/* ============ Selected Work — filter (by type) + pagination (6 per page) ============ */
const pfGrid = $("#pfGrid");
if (pfGrid){
  const SIZE    = parseInt(pfGrid.dataset.pageSize, 10) || 6;
  const cards   = $$(".pf-card");
  const pager   = $("#pfPager");
  const nums    = pager ? pager.querySelector(".pf-pager-nums") : null;
  const prevBtn = pager ? pager.querySelector("[data-pf-prev]") : null;
  const nextBtn = pager ? pager.querySelector("[data-pf-next]") : null;
  const pills   = $$("#pfFilter [data-filter]");
  let filter = "all";
  let page = 1;

  const matches = (card) =>
    filter === "all" ? true :
    filter === "experimental" ? card.dataset.experimental === "true" :
    card.dataset.context === filter;

  // NOTE: keep this distinct from the résumé panel's render() for readability.
  function pfRender(){
    const shown = cards.filter(matches);
    const pageCount = Math.max(1, Math.ceil(shown.length / SIZE));
    if (page > pageCount) page = pageCount;
    const start = (page - 1) * SIZE;
    const onPage = new Set(shown.slice(start, start + SIZE));

    cards.forEach(card => {
      const on = onPage.has(card);
      card.hidden = !on;
      // cards revealed by filtering/paging: override the gsap.from "from" state
      // (autoAlpha:0) so they aren't stranded invisible. Instant — not an entrance.
      if (on) gsap.set(card, { autoAlpha: 1, y: 0 });
    });

    if (pager){
      pager.hidden = pageCount <= 1;
      nums.textContent = "";
      if (pageCount > 1){
        for (let i = 1; i <= pageCount; i++){
          const b = document.createElement("button");
          b.type = "button";
          b.className = "pf-pager-num" + (i === page ? " is-active" : "");
          b.textContent = String(i).padStart(2, "0");
          b.setAttribute("aria-label", "Page " + i);
          if (i === page) b.setAttribute("aria-current", "true");
          b.addEventListener("click", () => { page = i; pfRender(); });
          nums.appendChild(b);
        }
        prevBtn.disabled = page === 1;
        nextBtn.disabled = page === pageCount;
      }
    }
    ScrollTrigger.refresh();
  }

  pills.forEach(pill => pill.addEventListener("click", () => {
    filter = pill.dataset.filter;
    page = 1;
    pills.forEach(p => {
      const active = p === pill;
      p.classList.toggle("is-active", active);
      p.setAttribute("aria-pressed", active ? "true" : "false");
    });
    pfRender();
  }));

  if (prevBtn) prevBtn.addEventListener("click", () => { if (page > 1){ page--; pfRender(); } });
  if (nextBtn) nextBtn.addEventListener("click", () => { page++; pfRender(); });

  pfRender();
}

/* ============ portfolio project detail HUD (fade in / out) ============ */
const pfModal = $("#pfModal");
if (pfModal){
  const pfPanels = Array.prototype.slice.call(pfModal.querySelectorAll(".pf-modal-panel"));
  let pfLastFocused = null;

  function pfOpen(slug){
    const panel = pfModal.querySelector('.pf-modal-panel[data-project="' + slug + '"]');
    if (!panel) return;
    pfLastFocused = document.activeElement;
    pfPanels.forEach(p => p.classList.toggle("is-active", p === panel));
    pfModal.classList.add("is-open");
    pfModal.setAttribute("aria-hidden", "false");
    const title = panel.querySelector(".pf-modal-title");
    if (title && title.id) pfModal.setAttribute("aria-labelledby", title.id);
    setBodySiblingsInert(pfModal, true);
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";          // lock background scroll
    panel.querySelector(".pf-modal-inner").scrollTop = 0;
    if (!reduce) panel.querySelectorAll("video").forEach(v => { v.play().catch(() => {}); }); // muted autoplay
    const closeBtn = panel.querySelector(".pf-modal-close");
    activateFocusTrap(pfModal, closeBtn);
  }
  function pfClose(){
    if (!pfModal.classList.contains("is-open")) return;
    pfModal.classList.remove("is-open");
    pfModal.setAttribute("aria-hidden", "true");
    pfModal.removeAttribute("aria-labelledby");
    pfModal.querySelectorAll("video").forEach(v => { v.pause(); });  // stop playback when hidden
    setBodySiblingsInert(pfModal, false);
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    releaseFocusTrap(false);
    if (pfLastFocused){ try { pfLastFocused.focus({ preventScroll: true }); } catch (_) {} }
  }

  $$(".pf-card").forEach(card => {
    card.addEventListener("click", () => { pfLastFocused = card; pfOpen(card.dataset.project); });
  });
  // résumé note → portfolio project deep link (opens the detail HUD on top of the drawer)
  $$("[data-project-link]").forEach(link => {
    link.addEventListener("click", () => { pfLastFocused = link; pfOpen(link.dataset.projectLink); });
  });
  pfModal.querySelectorAll(".pf-modal-close").forEach(b => b.addEventListener("click", pfClose));
  pfModal.addEventListener("click", (e) => { if (e.target === pfModal) pfClose(); });  // backdrop
  on(window, "keydown", (e) => {
    if (e.key === "Escape" && pfModal.classList.contains("is-open")) pfClose();
  });
}

/* ============ shareable #resume deep link ============ */
/* Visiting /#resume (or navigating to the hash) lands on the Expertise section
   with the résumé panel open. The hash is kept in sync by applyState().
   On a cold (uncached) load the frame images finish loading AFTER first paint
   and fire a late ScrollTrigger.refresh() that shifts the active section — so we
   stay anchored across refreshes for a short settle window and suppress the
   auto-close during it (see onSectionChange + the refresh listener below). */
// The pinned timeline trigger is only trustworthy once it has been measured at
// the top of the page (on a cold load the frame images settle layout late and
// ScrollTrigger reports a bogus pin range until then). We do NOT call refresh()
// ourselves while scrolled — that corrupts the pin offset — we just wait for a
// sane measurement, then jump to Expertise once.
function stPinSane(){
  const st = tl.scrollTrigger;
  return st && Math.abs(st.start) < 5 && (st.end - st.start) > window.innerHeight * 2;
}
function openResumeDeepLink(){
  if (!drawer || resumeDeepLinkActive) return;   // idempotent: ignore re-entry while a deep-link is settling
  resumeDeepLinkActive = true;
  window.scrollTo(0, 0);                                  // clean state for ScrollTrigger to measure
  if (panelProgress < 1 && !snapTween){ currentIdx = EXP_IDX; snapTo(1); }   // open the panel right away
  let tries = 0;
  const settle = () => {
    if (stPinSane()){
      const st = tl.scrollTrigger;
      window.scrollTo({ top: st.start + TARGET_P[EXP_IDX] * (st.end - st.start), behavior: "auto" });
      currentIdx = EXP_IDX;
      if (panelProgress < 1 && !snapTween) snapTo(1);
      setTimeout(() => { resumeDeepLinkActive = false; }, 500);   // hold the anchor briefly, then release
      return;
    }
    if (++tries > 60) { resumeDeepLinkActive = false; return; }   // give up after ~9s
    setTimeout(settle, 150);
  };
  setTimeout(settle, 150);
}
function maybeOpenResumeFromHash(){
  if (location.hash === "#resume") openResumeDeepLink();
}
on(window, "load", () => { setTimeout(maybeOpenResumeFromHash, 200); });
on(window, "hashchange", maybeOpenResumeFromHash);
// Nav "Resume" links point at /#resume. On the landing that is a same-page hash
// change, which the ClientRouter applies via history state without firing a
// `hashchange` event — so wire the click straight to the panel instead.
$$('a[href$="#resume"]').forEach((a) => {
  on(a, "click", (e) => {
    if (a.pathname !== location.pathname) return;   // off-page link → let it navigate
    e.preventDefault();
    if (location.hash !== "#resume") history.replaceState(null, "", "#resume");
    openResumeDeepLink();
  });
});
// Arriving on the landing via a client-side swap (e.g. from the blog) can land
// with #resume already in the URL, where neither `load` nor `hashchange` fires.
if (location.hash === "#resume") setTimeout(maybeOpenResumeFromHash, 200);
}

document.addEventListener("astro:page-load", initLanding);
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLanding, { once: true });
} else {
  initLanding();
}

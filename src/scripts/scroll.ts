import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { queryAll as $$, queryOne as $ } from "./landing/dom";
import { createFocusTrap, setBodySiblingsInert } from "./landing/focus-trap";
import { initPageBehaviors } from "./landing/page-behaviors";
import { initPortfolio } from "./landing/portfolio";
import { initResumeDrawer } from "./landing/resume-drawer";

/* ===================== MONOIDX — scroll sequence (GSAP + ScrollTrigger) ===================== */
/* iOS-safe: scrubs a preloaded image sequence on a <canvas> instead of a <video>. */
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const landingWindow = window as typeof window & {
  __mxLandingCleanup?: () => void;
  __mxSmoothScrollTo?: (y: number) => void;
};

function initLanding(): void {
  if (!document.getElementById("seqCanvas")) {
    landingWindow.__mxLandingCleanup?.();
    return;
  }

  landingWindow.__mxLandingCleanup?.();

  const cleanupTasks: Array<() => void> = [];
  let cleanedUp = false;
  let currentSmoothScrollTo: ((y: number) => void) | null = null;

  function addCleanup(task: () => void): void {
    cleanupTasks.push(task);
  }

  function on(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean,
  ): void {
    target.addEventListener(type, listener, options);
    addCleanup(() => target.removeEventListener(type, listener, options));
  }

  function cleanupLanding(): void {
    if (cleanedUp) return;
    cleanedUp = true;
    cleanupTasks.splice(0).reverse().forEach((task) => task());
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    gsap.globalTimeline.clear();
    document.body.classList.remove("resume-open");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    if (currentSmoothScrollTo && landingWindow.__mxSmoothScrollTo === currentSmoothScrollTo) delete landingWindow.__mxSmoothScrollTo;
    if (landingWindow.__mxLandingCleanup === cleanupLanding) delete landingWindow.__mxLandingCleanup;
  }

  landingWindow.__mxLandingCleanup = cleanupLanding;
  on(document, "astro:before-swap", cleanupLanding, { once: true });

const LABELS = ["Unit", "Identity", "Expertise", "Philosophy", "Operational"];
const BOUNDS = [0.15, 0.37, 0.59, 0.81];   // progress thresholds → active section
const FRAME_COUNT = 60;                     // assets/frames/f00.jpg … f59.jpg

const veil      = $<HTMLElement>("#veil");
const canvas    = $<HTMLCanvasElement>("#seqCanvas");
const ctx       = canvas?.getContext("2d") ?? null;
const videoWrap = $<HTMLElement>("#videoWrap");
const railSegs  = $$<HTMLElement>("#rail .seg");
const idxBig    = $<HTMLElement>("#idxBig");
const idxLabel  = $<HTMLElement>("#idxLabel");
const seqEl     = $<HTMLElement>("#seq");
const angleEl   = $<HTMLElement>("#angle");
const scrubFill = $<HTMLElement>("#scrubFill");
const reticle   = $<HTMLElement>("#reticle");
const ghost     = $<HTMLElement>("#ghost");
const scrimLeft = $<HTMLElement>("#scrimLeft");

if (!veil || !canvas || !ctx || !videoWrap || !idxBig || !idxLabel || !seqEl || !angleEl || !scrubFill || !reticle || !scrimLeft) {
  return;
}
const veilEl = veil;
const canvasEl = canvas;
const ctx2d = ctx;
const videoWrapEl = videoWrap;
const idxBigEl = idxBig;
const idxLabelEl = idxLabel;
const seqTextEl = seqEl;
const angleTextEl = angleEl;
const scrubFillEl = scrubFill;
const reticleEl = reticle;
const scrimLeftEl = scrimLeft;

railSegs.forEach((seg, i) => {
  const label = LABELS[i];
  const labelEl = seg.querySelector<HTMLElement>("span");
  if (label && labelEl) labelEl.textContent = label;
});
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const { activateFocusTrap, isActiveDialog, releaseFocusTrap } = createFocusTrap(on);

/* ---------- frame sequence ---------- */
const frames: Array<HTMLImageElement | undefined> = new Array(FRAME_COUNT);
let curFrame = -1;
let loaded = 0;

function sizeCanvas(): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = videoWrapEl.clientWidth || window.innerWidth;
  const h = videoWrapEl.clientHeight || window.innerHeight;
  canvasEl.width  = Math.round(w * dpr);
  canvasEl.height = Math.round(h * dpr);
  canvasEl.style.width = w + "px";
  canvasEl.style.height = h + "px";
}

function drawFrame(i: number): void {
  const img = frames[i];
  if (!img || !img.complete || !img.naturalWidth) return;
  const cw = canvasEl.width, ch = canvasEl.height;
  const ir = img.naturalWidth / img.naturalHeight, cr = cw / ch;
  let dw: number, dh: number;
  if (ir > cr){ dh = ch; dw = ch * ir; } else { dw = cw; dh = cw / ir; }
  const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
  ctx2d.clearRect(0, 0, cw, ch);
  ctx2d.drawImage(img, dx, dy, dw, dh);
  curFrame = i;
}

function preload(): void {
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
function revealStage(): void {
  if (revealed) return; revealed = true;
  requestAnimationFrame(() => veilEl.classList.add("gone"));
  setTimeout(() => { veilEl.style.display = "none"; }, 1000);
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
const vlines = $$<HTMLElement>("#bgField .vline");
const hudBrackets = $$<HTMLElement>("#hud .br");
let lastIdx = -1;
const TARGET_P = [0.05, 0.26, 0.48, 0.70, 0.93];
const resumeDrawer = initResumeDrawer({
  $,
  $$,
  gsap: gsap as unknown as Parameters<typeof initResumeDrawer>[0]["gsap"],
  reduce,
  on,
  timeline: tl,
  targetProgress: TARGET_P,
  activateFocusTrap,
  isActiveDialog,
  releaseFocusTrap,
});

ScrollTrigger.create({
  trigger: "#scrolly",
  start: "top top",
  end: "bottom bottom",
  scrub: true,
  onUpdate(self: ScrollTrigger){
    const p = self.progress;
    scrubFillEl.style.width = (p * 100).toFixed(2) + "%";

    const ang = Math.round(p * 360) % 360;
    angleTextEl.textContent = String(ang).padStart(3, "0") + "°";

    let idx = 0;
    for (let i = 0; i < BOUNDS.length; i++) if (p >= BOUNDS[i]) idx = i + 1;
    if (idx !== lastIdx){
      lastIdx = idx;
      railSegs.forEach((s, i) => s.classList.toggle("active", i === idx));
      const activeLabel = LABELS[idx] ?? "";
      idxBigEl.textContent  = String(idx).padStart(2, "0");
      idxLabelEl.textContent = activeLabel.toUpperCase();
      seqTextEl.textContent = String(idx).padStart(2, "0") + " / 05";
      resumeDrawer.onSectionChange(idx);
      resumeDrawer.render();   // reposition the slider knob once it becomes visible
    }
    scrimLeftEl.style.opacity = idx >= 1 ? "1" : "0.35";

    // transforming graphics
    reticleEl.style.transform = `translate(-50%,-50%) rotate(${(p * 220).toFixed(1)}deg) scale(${(0.8 + Math.sin(p * Math.PI) * 0.5).toFixed(3)})`;
    reticleEl.style.opacity = (Math.sin(p * Math.PI) * 0.32).toFixed(3);
    const bs = 40 + p * 34;
    hudBrackets.forEach(b => { b.style.width = bs + "px"; b.style.height = bs + "px"; });

    // parallax
    videoWrapEl.style.transform = `scale(${(1.1 - p * 0.1).toFixed(3)}) translateY(${(p * -3).toFixed(2)}%)`;
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

const pageBehaviors = initPageBehaviors({
  $,
  $$,
  gsap,
  timeline: tl,
  reduce,
  on,
  railSegs,
  targetProgress: TARGET_P,
  closeResume: resumeDrawer.closeIfOpen,
});
// Exposed so shared components (e.g. ToTop) can scroll reliably on this page
// instead of native smooth scroll, which ScrollTrigger pinning cancels.
currentSmoothScrollTo = pageBehaviors.smoothScrollTo;
landingWindow.__mxSmoothScrollTo = pageBehaviors.smoothScrollTo;
if (ghost) ghost.textContent = "MX";

/* keep canvas crisp + layout correct on resize / orientation change */
let rT: ReturnType<typeof setTimeout> | null = null;
on(window, "resize", () => {
  if (rT !== null) clearTimeout(rT);
  rT = setTimeout(() => {
    sizeCanvas();
    drawFrame(Math.max(0, curFrame));
    ScrollTrigger.refresh();
    resumeDrawer.render();   // recompute resume panel / disciplines offsets for new viewport width
  }, 150);
}, { passive: true });

on(window, "load", () => ScrollTrigger.refresh());

initPortfolio({
  $,
  $$,
  gsap,
  ScrollTrigger,
  reduce,
  on,
  setBodySiblingsInert,
  activateFocusTrap,
  releaseFocusTrap,
});
}

document.addEventListener("astro:page-load", initLanding);
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLanding, { once: true });
} else {
  initLanding();
}

/* ===================== MONOIDX — scroll sequence (GSAP + ScrollTrigger) ===================== */
/* iOS-safe: scrubs a preloaded image sequence on a <canvas> instead of a <video>. */
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

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
      railSegs.forEach((s, i) => s.classList.toggle("active", i === idx));
      idxBig.textContent  = String(idx).padStart(2, "0");
      idxLabel.textContent = LABELS[idx].toUpperCase();
      seqEl.textContent = String(idx).padStart(2, "0") + " / 05";
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

/* ============ clickable rail — jump to each section ============ */
const stMain = tl.scrollTrigger;
const TARGET_P = [0.05, 0.26, 0.48, 0.70, 0.93];
railSegs.forEach((seg, i) => {
  seg.setAttribute("role", "button");
  seg.setAttribute("tabindex", "0");
  const go = () => {
    const y = stMain.start + TARGET_P[i] * (stMain.end - stMain.start);
    window.scrollTo({ top: y, behavior: "smooth" });
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
  gsap.from(el, {
    autoAlpha: 0, y: 40, duration: 1, ease: "power2.out",
    scrollTrigger: { trigger: el, start: "top 85%" }
  });
});
if (ghost) ghost.textContent = "MX";

/* nav scrolled state */
const nav = $("#nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 40);
}, { passive: true });

/* keep canvas crisp + layout correct on resize / orientation change */
let rT = null;
window.addEventListener("resize", () => {
  clearTimeout(rT);
  rT = setTimeout(() => {
    sizeCanvas();
    drawFrame(Math.max(0, curFrame));
    ScrollTrigger.refresh();
  }, 150);
}, { passive: true });

window.addEventListener("load", () => ScrollTrigger.refresh());

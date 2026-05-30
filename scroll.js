/* ===================== MONOIDX — scroll sequence (GSAP + ScrollTrigger) ===================== */
gsap.registerPlugin(ScrollTrigger);

const LABELS = ["Unit", "Identity", "Expertise", "Philosophy", "Operational"];
// progress thresholds where the active section advances
const BOUNDS = [0.15, 0.37, 0.59, 0.81];

const $  = (s) => document.querySelector(s);
const $$ = (s) => Array.prototype.slice.call(document.querySelectorAll(s));

const video   = $("#seqVideo");
const veil    = $("#veil");
const stage   = $("#stage");
const railSegs = $$("#rail .seg");
const idxBig  = $("#idxBig");
const idxLabel= $("#idxLabel");
const seqEl   = $("#seq");
const angleEl = $("#angle");
const scrubFill = $("#scrubFill");
const reticle = $("#reticle");
const videoWrap = $("#videoWrap");
const ghost   = $("#ghost");
const cue     = $("#cue");

// label the rail from the single source of truth
railSegs.forEach((seg, i) => { seg.querySelector("span").textContent = LABELS[i]; });

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- wait for the video, then build ---------- */
function whenReady(cb){
  if (video.readyState >= 1 && video.duration) return cb();
  video.addEventListener("loadedmetadata", cb, { once:true });
  // safety: build anyway after a beat using a sane fallback duration
  setTimeout(() => { if (video.readyState < 1) cb(); }, 4000);
}

whenReady(() => {
  const DUR = (video.duration && isFinite(video.duration)) ? video.duration : 8;
  try { video.pause(); video.currentTime = 0; } catch(e){}

  // reveal stage (+ hard fallback so the veil can never get stuck)
  requestAnimationFrame(() => veil.classList.add("gone"));
  setTimeout(() => { veil.style.display = "none"; }, 1000);

  const T = 100; // timeline length in arbitrary units

  /* ============ MASTER TIMELINE (pins the stage, scrubs everything) ============ */
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

  // 1) scrub the video across the whole sequence (the rotation)
  tl.fromTo(video, { currentTime: 0 }, { currentTime: DUR, duration: T }, 0);

  // initial states
  gsap.set("#act0", { autoAlpha: 1, y: 0 });
  ["#act1", "#act2", "#act3", "#act4"].forEach(id => gsap.set(id, { autoAlpha: 0, y: 48 }));
  gsap.set(".chip",  { autoAlpha: 0, y: 26 });
  gsap.set(".tenet", { autoAlpha: 0, y: 22 });
  gsap.set("#manifest .mrow", { autoAlpha: 0, y: 20 });

  const IN  = { autoAlpha: 1, y: 0, duration: 7, ease: "power2.out" };
  const OUT = { autoAlpha: 0, y: -34, duration: 6, ease: "power2.in" };

  // 2) ACT 0 — hero: fades out early
  tl.to("#cue",  { autoAlpha: 0, duration: 4 }, 4);
  tl.to("#act0", { autoAlpha: 0, y: -40, duration: 6, ease: "power2.in" }, 10);

  // 3) ACT 1 — identity
  tl.to("#act1", IN, 18);
  tl.to("#act1", OUT, 34);

  // 4) ACT 2 — expertise (chips stagger)
  tl.to("#act2", IN, 40);
  tl.to(".chip", { autoAlpha: 1, y: 0, duration: 5, stagger: 0.7, ease: "power2.out" }, 41.5);
  tl.to(".chip", { autoAlpha: 0, y: -18, duration: 4, stagger: 0.3, ease: "power2.in" }, 55);
  tl.to("#act2", OUT, 56);

  // 5) ACT 3 — philosophy (tenets stagger)
  tl.to("#act3", IN, 62);
  tl.to(".tenet", { autoAlpha: 1, y: 0, duration: 5, stagger: 0.8, ease: "power2.out" }, 63.5);
  tl.to(".tenet", { autoAlpha: 0, y: -16, duration: 4, stagger: 0.25, ease: "power2.in" }, 77);
  tl.to("#act3", OUT, 78);

  // 6) ACT 4 — operational (manifest assembles, stays)
  tl.to("#act4", IN, 84);
  tl.to("#manifest .mrow", { autoAlpha: 1, y: 0, duration: 5, stagger: 0.9, ease: "power2.out" }, 85.5);

  /* ============ STATE / HUD / PARALLAX (non-pinning, runs during the pin) ============ */
  const vlines = $$("#bgField .vline");
  let lastIdx = -1;

  ScrollTrigger.create({
    trigger: "#scrolly",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate(self){
      const p = self.progress;

      // top scrub bar
      scrubFill.style.width = (p * 100).toFixed(2) + "%";

      // rotation telemetry (video covers a full 360 turntable)
      const ang = Math.round((p * 360)) % 360;
      angleEl.textContent = String(ang).padStart(3, "0") + "°";

      // active section
      let idx = 0;
      for (let i = 0; i < BOUNDS.length; i++) if (p >= BOUNDS[i]) idx = i + 1;
      if (idx !== lastIdx){
        lastIdx = idx;
        railSegs.forEach((s, i) => s.classList.toggle("active", i === idx));
        idxBig.textContent  = String(idx).padStart(2, "0");
        idxLabel.textContent = LABELS[idx].toUpperCase();
        seqEl.textContent = String(idx).padStart(2, "0") + " / 05";
      }

      // left scrim only when text-heavy acts are up (idx >= 1)
      $("#scrimLeft").style.opacity = idx >= 1 ? 1 : 0.35;

      // --- graphic transforms ---
      // reticle: rotates + scales with scroll, brightest mid-sequence
      const rot = p * 220;
      const sc  = 0.8 + Math.sin(p * Math.PI) * 0.5;
      reticle.style.transform = `translate(-50%,-50%) rotate(${rot}deg) scale(${sc})`;
      reticle.style.opacity = (Math.sin(p * Math.PI) * 0.32).toFixed(3);

      // corner brackets expand outward as the sequence advances
      const bs = 40 + p * 34;
      $$("#hud .br").forEach(b => { b.style.width = bs + "px"; b.style.height = bs + "px"; });

      // --- parallax (elements counter-move while the stage is pinned) ---
      // video: slow scale + drift
      videoWrap.style.transform = `scale(${(1.1 - p * 0.1).toFixed(3)}) translateY(${(p * -3).toFixed(2)}%)`;
      // backdrop vertical guide-lines drift at varied depths
      vlines.forEach(v => {
        const d = parseFloat(v.dataset.depth || "0.2");
        v.style.transform = `translateY(${(p * d * -160).toFixed(1)}px)`;
      });
      // ghost wordmark parallax + grow
      ghost.style.transform = `translate(-50%,-50%) translateY(${(p * -120).toFixed(0)}px) scale(${(1 + p * 0.25).toFixed(3)})`;
      ghost.style.opacity = (0.6 - p * 0.4).toFixed(2);
    }
  });

  /* ============ clickable rail — jump to each section of the sequence ============ */
  const stMain = tl.scrollTrigger;          // the pinning trigger (gives scroll px range)
  const TARGET_P = [0.05, 0.26, 0.48, 0.70, 0.93]; // progress at which each act reads cleanly
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

  // ghost wordmark text swap for the backdrop
  if (ghost) ghost.textContent = "MX";

  // nav scrolled state
  const nav = $("#nav");
  ScrollTrigger.create({
    start: 40, end: 99999,
    onUpdate: () => {},
    onToggle: () => {}
  });
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });

  // settle layout once everything (incl. video box) is sized
  ScrollTrigger.refresh();
  window.addEventListener("load", () => ScrollTrigger.refresh());
});

type QueryOne = <T extends Element = Element>(selector: string) => T | null;
type QueryAll = <T extends Element = Element>(selector: string) => T[];
type AddManagedListener = (
  target: EventTarget,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | boolean,
) => void;

interface PageBehaviorsOptions {
  $: QueryOne;
  $$: QueryAll;
  gsap: GSAP;
  timeline: GSAPTimeline;
  reduce: boolean;
  on: AddManagedListener;
  railSegs: HTMLElement[];
  targetProgress: number[];
  closeResume: () => void;
}

interface PageBehaviors {
  smoothScrollTo: (y: number) => void;
}

export function initPageBehaviors({
  $,
  $$,
  gsap,
  timeline,
  reduce,
  on,
  railSegs,
  targetProgress,
  closeResume,
}: PageBehaviorsOptions): PageBehaviors {
  /* gsap-driven smooth scroll. Native scrollTo({behavior:"smooth"}) is silently
     cancelled a few hundred px in by ScrollTrigger's pinning of #stage, so the
     page never reaches the target. We drive window.scroll ourselves on the gsap
     ticker instead, which ScrollTrigger cooperates with. */
  let scrollTween: GSAPTween | null = null;
  const setScroll = (v: number) => window.scrollTo({ top: v, left: 0, behavior: "auto" });
  function smoothScrollTo(y: number){
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

  /* ============ clickable rail — jump to each section ============ */
  const stMain = timeline.scrollTrigger;
  railSegs.forEach((seg, i) => {
    seg.setAttribute("role", "button");
    seg.setAttribute("tabindex", "0");
    const go = () => {
      if (!stMain) return;
      const y = stMain.start + targetProgress[i] * (stMain.end - stMain.start);
      smoothScrollTo(y);
    };
    on(seg, "click", go);
    on(seg, "keydown", (event) => {
      const e = event as KeyboardEvent;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
    });
  });

  /* ============ OUTRO parallax + reveal ============ */
  const outroBg = $<HTMLElement>(".outro-bg");
  if (outroBg){
    gsap.to(outroBg, {
      yPercent: -22, ease: "none",
      scrollTrigger: { trigger: ".outro", start: "top bottom", end: "bottom top", scrub: true }
    });
  }
  $$<HTMLElement>(".anim-up").forEach(el => {
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

  /* nav scrolled state */
  const nav = $<HTMLElement>("#nav");
  on(window, "scroll", () => {
    nav?.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });

  /* ============ smooth in-page anchor scrolling (#portfolio, #contact, …) ============ */
  $$<HTMLAnchorElement>('a[href^="#"]').forEach(a => {
    on(a, "click", (event) => {
      const e = event as MouseEvent;
      const id = a.getAttribute("href");
      if (!id || id.length < 2) return;
      const target = document.querySelector<HTMLElement>(id);
      if (!target) return;
      e.preventDefault();
      closeResume();  // close the résumé first
      const y = target.getBoundingClientRect().top + window.scrollY;
      smoothScrollTo(y);
    });
  });

  /* ============ brand wordmark → reset to top of the site ============ */
  const brandHome = $<HTMLElement>("#brandHome");
  if (brandHome){
    function goHome(){
      closeResume();  // close the résumé first
      if (location.hash) history.replaceState(null, "", location.pathname + location.search);
      smoothScrollTo(0);
    }
    on(brandHome, "click", goHome);
    on(brandHome, "keydown", (event) => {
      const e = event as KeyboardEvent;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goHome(); }
    });
  }

  return { smoothScrollTo };
}

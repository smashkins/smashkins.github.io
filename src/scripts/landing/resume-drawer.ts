// @ts-nocheck

const EXP_IDX = 2;
const THRESHOLD = 600;        // px of horizontal travel for a full open
const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;

export function initResumeDrawer({
  $,
  $$,
  gsap,
  reduce,
  on,
  timeline,
  targetProgress,
  activateFocusTrap,
  isActiveDialog,
  releaseFocusTrap,
}) {
  /* ===== professional experience drawer — state + helpers =====
     While the Expertise section (idx===2) is active, horizontal scroll / swipe
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

  let currentIdx = 0;
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
      else if (isActiveDialog(drawer)) releaseFocusTrap(false);
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
    currentIdx = idx;
    if (stageIndexEl) stageIndexEl.classList.toggle("idx-expertise", idx === EXP_IDX);
    if (resumeDeepLinkActive) return;   // a late refresh can blip idx while we settle a deep link
    // safety net: if we ever leave Expertise while open, close instantly
    if (idx !== EXP_IDX && panelProgress > 0){
      if (snapTween){ snapTween.kill(); snapTween = null; }
      panelProgress = 0; acc = 0; render(); applyState();
    }
  }
  function closeIfOpen(){
    if (panelProgress > 0) snapTo(0);
  }

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
    const st = timeline.scrollTrigger;
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
        const st = timeline.scrollTrigger;
        window.scrollTo({ top: st.start + targetProgress[EXP_IDX] * (st.end - st.start), behavior: "auto" });
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

  return {
    closeIfOpen,
    expertiseIndex: EXP_IDX,
    onSectionChange,
    render,
  };
}

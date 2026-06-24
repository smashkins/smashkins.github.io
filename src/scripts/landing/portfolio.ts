// @ts-nocheck

export function initPortfolio({
  $,
  $$,
  gsap,
  ScrollTrigger,
  reduce,
  on,
  setBodySiblingsInert,
  activateFocusTrap,
  releaseFocusTrap,
}) {
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
}

type QueryOne = <T extends Element = Element>(selector: string) => T | null;
type QueryAll = <T extends Element = Element>(selector: string) => T[];

type ManagedEventListener = (
  target: EventTarget,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | boolean,
) => void;

type GsapSetVars = {
  autoAlpha?: number;
  y?: number;
};

type GsapSet = {
  set(target: Element | string, vars: GsapSetVars): void;
};

type ScrollTriggerRefresh = {
  refresh(): void;
};

type FocusTrapActivator = (root: HTMLElement, preferred?: HTMLElement | null) => void;
type FocusTrapReleaser = (restore?: boolean) => void;
type BodySiblingsInertSetter = (dialog: HTMLElement, inert: boolean) => void;

type PortfolioGrid = HTMLElement & {
  dataset: DOMStringMap & {
    pageSize?: string;
  };
};

type PortfolioCard = HTMLElement & {
  dataset: DOMStringMap & {
    context?: string;
    experimental?: string;
    project?: string;
  };
};

type FilterPill = HTMLElement & {
  dataset: DOMStringMap & {
    filter?: string;
  };
};

type ProjectLink = HTMLElement & {
  dataset: DOMStringMap & {
    projectLink?: string;
  };
};

type PagerButton = HTMLButtonElement;
type PagerNums = HTMLElement;
type PortfolioModal = HTMLElement;
type PortfolioModalPanel = HTMLElement;
type PortfolioModalInner = HTMLElement;
type PortfolioModalTitle = HTMLElement;
type PortfolioModalClose = HTMLElement;
type PortfolioVideo = HTMLVideoElement;

type InitPortfolioParams = {
  $: QueryOne;
  $$: QueryAll;
  gsap: GsapSet;
  ScrollTrigger: ScrollTriggerRefresh;
  reduce: boolean;
  on: ManagedEventListener;
  setBodySiblingsInert: BodySiblingsInertSetter;
  activateFocusTrap: FocusTrapActivator;
  releaseFocusTrap: FocusTrapReleaser;
};

const getActiveHTMLElement = () =>
  document.activeElement instanceof HTMLElement ? document.activeElement : null;

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
}: InitPortfolioParams) {
  /* ============ Selected Work — filter (by type) + pagination (6 per page) ============ */
  const pfGrid = $<PortfolioGrid>("#pfGrid");
  if (pfGrid){
    const SIZE    = parseInt(pfGrid.dataset.pageSize ?? "", 10) || 6;
    const cards   = $$<PortfolioCard>(".pf-card");
    const pager   = $<HTMLElement>("#pfPager");
    const nums    = pager ? pager.querySelector<PagerNums>(".pf-pager-nums") : null;
    const prevBtn = pager ? pager.querySelector<PagerButton>("[data-pf-prev]") : null;
    const nextBtn = pager ? pager.querySelector<PagerButton>("[data-pf-next]") : null;
    const pills   = $$<FilterPill>("#pfFilter [data-filter]");
    let filter: string | undefined = "all";
    let page = 1;

    const matches = (card: PortfolioCard) =>
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
        nums!.textContent = "";
        if (pageCount > 1){
          for (let i = 1; i <= pageCount; i++){
            const b = document.createElement("button");
            b.type = "button";
            b.className = "pf-pager-num" + (i === page ? " is-active" : "");
            b.textContent = String(i).padStart(2, "0");
            b.setAttribute("aria-label", "Page " + i);
            if (i === page) b.setAttribute("aria-current", "true");
            b.addEventListener("click", () => { page = i; pfRender(); });
            nums!.appendChild(b);
          }
          prevBtn!.disabled = page === 1;
          nextBtn!.disabled = page === pageCount;
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
  const pfModal = $<PortfolioModal>("#pfModal");
  if (pfModal){
    const modal = pfModal;
    const pfPanels = Array.from(modal.querySelectorAll<PortfolioModalPanel>(".pf-modal-panel"));
    let pfLastFocused: HTMLElement | null = null;

    function pfOpen(slug: string | undefined){
      const panel = modal.querySelector('.pf-modal-panel[data-project="' + slug + '"]');
      if (!panel) return;
      pfLastFocused = getActiveHTMLElement();
      pfPanels.forEach(p => p.classList.toggle("is-active", p === panel));
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      const title = panel.querySelector<PortfolioModalTitle>(".pf-modal-title");
      if (title && title.id) modal.setAttribute("aria-labelledby", title.id);
      setBodySiblingsInert(modal, true);
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";          // lock background scroll
      panel.querySelector<PortfolioModalInner>(".pf-modal-inner")!.scrollTop = 0;
      if (!reduce) panel.querySelectorAll<PortfolioVideo>("video").forEach(v => { v.play().catch(() => {}); }); // muted autoplay
      const closeBtn = panel.querySelector<PortfolioModalClose>(".pf-modal-close");
      activateFocusTrap(modal, closeBtn);
    }
    function pfClose(){
      if (!modal.classList.contains("is-open")) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      modal.removeAttribute("aria-labelledby");
      modal.querySelectorAll<PortfolioVideo>("video").forEach(v => { v.pause(); });  // stop playback when hidden
      setBodySiblingsInert(modal, false);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      releaseFocusTrap(false);
      if (pfLastFocused){ try { pfLastFocused.focus({ preventScroll: true }); } catch (_) {} }
    }

    $$<PortfolioCard>(".pf-card").forEach(card => {
      card.addEventListener("click", () => { pfLastFocused = card; pfOpen(card.dataset.project); });
    });
    // résumé note → portfolio project deep link (opens the detail HUD on top of the drawer)
    $$<ProjectLink>("[data-project-link]").forEach(link => {
      link.addEventListener("click", () => { pfLastFocused = link; pfOpen(link.dataset.projectLink); });
    });
    modal.querySelectorAll<PortfolioModalClose>(".pf-modal-close").forEach(b => b.addEventListener("click", pfClose));
    modal.addEventListener("click", (e) => { if (e.target === modal) pfClose(); });  // backdrop
    on(window, "keydown", (e) => {
      if (e instanceof KeyboardEvent && e.key === "Escape" && modal.classList.contains("is-open")) pfClose();
    });
  }
}

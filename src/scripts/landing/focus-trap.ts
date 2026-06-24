export type AddManagedListener = (
  target: EventTarget,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | boolean,
) => void;

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  "[tabindex]:not([tabindex='-1'])",
].join(',');

export function createFocusTrap(on: AddManagedListener) {
  let activeDialog: HTMLElement | null = null;
  let lastFocusedBeforeDialog: Element | null = null;

  const visibleFocusable = (root: HTMLElement | null): HTMLElement[] => {
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null,
    );
  };

  const focusDialog = (root: HTMLElement, preferred?: HTMLElement | null) => {
    const target = preferred ?? visibleFocusable(root)[0] ?? root;
    if (!target.hasAttribute('tabindex') && target === root) target.setAttribute('tabindex', '-1');
    requestAnimationFrame(() => target.focus({ preventScroll: true }));
  };

  const activateFocusTrap = (root: HTMLElement, preferred?: HTMLElement | null) => {
    if (activeDialog === root) return;
    lastFocusedBeforeDialog = document.activeElement;
    activeDialog = root;
    focusDialog(root, preferred);
  };

  const releaseFocusTrap = (restore = true) => {
    const restoreTo = lastFocusedBeforeDialog;
    activeDialog = null;
    lastFocusedBeforeDialog = null;
    if (restore && restoreTo instanceof HTMLElement) {
      requestAnimationFrame(() => {
        try {
          restoreTo.focus({ preventScroll: true });
        } catch {
          // Element may have been removed during a page transition.
        }
      });
    }
  };

  on(document, 'keydown', (event) => {
    const e = event as KeyboardEvent;
    if (!activeDialog || e.key !== 'Tab') return;
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

  return {
    activateFocusTrap,
    isActiveDialog: (root: HTMLElement | null) => activeDialog === root,
    releaseFocusTrap,
  };
}

export function setBodySiblingsInert(dialog: HTMLElement, inert: boolean) {
  Array.from(document.body.children).forEach((child) => {
    if (child === dialog || child.contains(dialog) || child.tagName === 'SCRIPT') return;
    if (inert) {
      child.setAttribute('inert', '');
      child.setAttribute('aria-hidden', 'true');
    } else {
      child.removeAttribute('inert');
      child.removeAttribute('aria-hidden');
    }
  });
}

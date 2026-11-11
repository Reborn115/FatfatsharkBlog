const panel = document.querySelector<HTMLElement>('#home-panel');
const scrollArea = document.querySelector<HTMLElement>('.home-panel-scroll');
const desktop = matchMedia('(min-width: 941px)');

if (panel && scrollArea) {
  const body = document.body;
  const main = document.querySelector<HTMLElement>('#main-content');
  let open = false;
  let wheelTotal = 0;
  let gestureUsed = false;
  let gestureStartedInScrollingContent = false;
  let wheelTimer: ReturnType<typeof setTimeout> | undefined;

  function setOpen(value: boolean, focusContent = false) {
    if (!desktop.matches) return;
    open = value;
    body.classList.toggle('home-panel-open', open);
    panel!.inert = !open;
    if (open && focusContent) main?.focus({ preventScroll: true });
    if (!open && panel!.contains(document.activeElement)) document.querySelector<HTMLAnchorElement>('.wordmark')?.focus({ preventScroll: true });
  }

  function updateDesktop() {
    body.classList.toggle('home-panel-mode', desktop.matches);
    body.classList.remove('home-panel-open');
    open = false;
    panel!.inert = desktop.matches;
    scrollArea!.scrollTop = 0;
    wheelTotal = 0;
    gestureUsed = false;
    gestureStartedInScrollingContent = false;
    clearTimeout(wheelTimer);
    wheelTimer = undefined;
  }

  updateDesktop();
  desktop.addEventListener('change', updateDesktop);
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    body.classList.add('home-panel-reset');
    updateDesktop();
    panel.getBoundingClientRect();
    requestAnimationFrame(() => body.classList.remove('home-panel-reset'));
  });
  document.querySelector('.skip-link')?.addEventListener('click', event => {
    if (!desktop.matches) return;
    event.preventDefault();
    setOpen(true, true);
  });
  window.addEventListener('hashchange', () => {
    if (location.hash && panel.contains(document.getElementById(location.hash.slice(1)))) setOpen(true);
  });

  // A wheel gesture changes panel state once; scrolling inside a long panel remains native.
  window.addEventListener('wheel', event => {
    if (!desktop.matches || event.ctrlKey || document.querySelector('dialog[open]') || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const inside = scrollArea.contains(event.target as Node);
    if (wheelTimer === undefined) gestureStartedInScrollingContent = open && inside && scrollArea.scrollTop > 1;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
      wheelTotal = 0;
      gestureUsed = false;
      gestureStartedInScrollingContent = false;
      wheelTimer = undefined;
    }, 200);
    if (gestureUsed) { event.preventDefault(); return; }
    if (gestureStartedInScrollingContent || (open && inside && (event.deltaY > 0 || scrollArea.scrollTop > 1))) return;
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    wheelTotal = Math.sign(delta) === Math.sign(wheelTotal) ? wheelTotal + delta : delta;
    if ((!open && wheelTotal > 32) || (open && wheelTotal < -32)) {
      setOpen(!open);
      gestureUsed = true;
    }
  }, { passive: false });

  document.addEventListener('keydown', event => {
    if (!desktop.matches || document.querySelector('dialog[open]') || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target as HTMLElement;
    if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (!open && (event.key === 'ArrowDown' || event.key === 'PageDown' || (event.key === ' ' && !target.closest('button, a')))) {
      event.preventDefault(); setOpen(true, true);
    } else if (open && (event.key === 'Escape' || ((event.key === 'ArrowUp' || event.key === 'PageUp') && scrollArea.scrollTop <= 1))) {
      event.preventDefault(); setOpen(false);
    }
  });

  document.querySelector('[data-layout-toggle]')?.addEventListener('click', () => {
    setOpen(true);
    scrollArea.scrollTop = 0;
  });
  document.querySelector('[data-scroll-top]')?.addEventListener('click', () => {
    if (desktop.matches) scrollArea.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
}

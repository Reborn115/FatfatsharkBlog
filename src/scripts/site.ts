import './home-panel';

const root = document.documentElement;

function updateThemeButtons() {
  const dark = root.dataset.theme === 'dark';
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach(button => {
    button.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到深色模式');
  });
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(root).getPropertyValue('--bg').trim());
}

updateThemeButtons();
const layoutButton = document.querySelector<HTMLButtonElement>('[data-layout-toggle]');
layoutButton?.addEventListener('click', () => {
  const expanded = document.body.classList.toggle('expanded-home');
  layoutButton.setAttribute('aria-label', expanded ? '切换为壁纸视图' : '切换为完整卡片视图');
  const label = layoutButton.querySelector('span');
  if (label) label.textContent = expanded ? '壁纸视图' : '卡片视图';
});
document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach(button => {
  button.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = theme;
    try { localStorage.setItem('garden-theme', theme); } catch {}
    updateThemeButtons();
  });
});

const search = document.querySelector<HTMLDialogElement>('#search-dialog');
const searchInput = document.querySelector<HTMLInputElement>('#search-input');
const searchEntries = [...document.querySelectorAll<HTMLElement>('[data-search-entry]')];
const searchEmpty = document.querySelector<HTMLElement>('.search-empty');
const searchCaption = document.querySelector<HTMLElement>('.search-caption');
function filterSearch() {
  const query = searchInput?.value.trim().toLowerCase() || '';
  let count = 0;
  searchEntries.forEach(entry => {
    const visible = (entry.dataset.searchText || '').includes(query);
    entry.hidden = !visible;
    if (visible) count++;
  });
  if (searchEmpty) searchEmpty.hidden = count !== 0;
  if (searchCaption) searchCaption.textContent = query ? `${count} 篇相关文章` : '所有文章';
}
function openSearch() {
  if (!search || search.open) return;
  search.showModal();
  if (searchInput) { searchInput.value = ''; filterSearch(); searchInput.focus(); }
}
document.querySelectorAll('[data-search-open]').forEach(button => button.addEventListener('click', openSearch));
document.querySelector('[data-search-close]')?.addEventListener('click', () => search?.close());
search?.addEventListener('click', event => {
  if (event.target !== search) return;
  const bounds = search.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) search.close();
});
searchInput?.addEventListener('input', filterSearch);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && search?.open) {
    event.preventDefault();
    search.close();
    return;
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault(); openSearch();
  }
});

let toastTimer: ReturnType<typeof setTimeout>;
function toast(message: string) {
  const element = document.querySelector<HTMLElement>('#toast');
  if (!element) return;
  clearTimeout(toastTimer);
  element.textContent = message;
  element.classList.add('visible');
  toastTimer = setTimeout(() => element.classList.remove('visible'), 2500);
}

document.querySelectorAll('[data-scroll-top]').forEach(button => button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })));

function clock() {
  const now = new Date();
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
  const date = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: 'long', day: 'numeric', weekday: 'long' }).format(now);
  document.querySelectorAll<HTMLElement>('[data-clock]').forEach(element => element.textContent = time);
  document.querySelectorAll<HTMLElement>('[data-clock-date]').forEach(element => element.textContent = date);
}
clock();
if (document.querySelector('[data-clock]')) window.setInterval(clock, 30000);

const filterGroups = document.querySelectorAll<HTMLElement>('[data-filter-group]');
filterGroups.forEach(group => {
  const buttons = [...group.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const target = group.dataset.filterGroup || '';
  const cards = [...document.querySelectorAll<HTMLElement>(`[data-filter-item="${target}"]`)];
  const empty = document.querySelector<HTMLElement>(`[data-filter-empty="${target}"]`);
  const filter = (value: string) => {
    buttons.forEach(button => {
      const selected = button.dataset.filter === value;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    let count = 0;
    cards.forEach(card => {
      const categories = (card.dataset.categories || '').split('|');
      const visible = value === 'all' || categories.includes(value);
      card.hidden = !visible;
      if (visible) count++;
    });
    if (empty) empty.hidden = count > 0;
    const url = new URL(location.href);
    if (value === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', value);
    history.replaceState(null, '', url);
  };
  buttons.forEach(button => button.addEventListener('click', () => filter(button.dataset.filter || 'all')));
  const initial = new URLSearchParams(location.search).get('category');
  if (initial && (buttons.some(button => button.dataset.filter === initial) || cards.some(card => (card.dataset.categories || '').split('|').includes(initial)))) {
    if (!buttons.some(button => button.dataset.filter === initial)) {
      const tagButton = document.createElement('button');
      tagButton.type = 'button';
      tagButton.className = 'filter-button';
      tagButton.dataset.filter = initial;
      tagButton.textContent = `# ${initial}`;
      tagButton.addEventListener('click', () => filter(initial));
      buttons.push(tagButton);
      group.append(tagButton);
    }
    filter(initial);
  }
});

document.querySelectorAll<HTMLButtonElement>('[data-copy-code]').forEach(button => {
  button.addEventListener('click', async () => {
    const code = button.closest('.code-wrapper')?.querySelector('code')?.textContent;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = '已复制';
      setTimeout(() => button.textContent = '复制', 1800);
    } catch { toast('暂时无法复制，请选中代码后复制。'); }
  });
});

document.querySelector<HTMLButtonElement>('[data-share]')?.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(location.href); toast('文章链接已复制'); }
  catch { toast('请从地址栏复制文章链接。'); }
});

const tocLinks = [...document.querySelectorAll<HTMLAnchorElement>('.toc a')];
if (tocLinks.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (!visible.length) return;
    const id = visible[0].target.id;
    tocLinks.forEach(link => link.classList.toggle('active', decodeURIComponent(link.hash.slice(1)) === id));
  }, { rootMargin: '-12% 0px -65% 0px', threshold: 0 });
  tocLinks.forEach(link => {
    const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (heading) observer.observe(heading);
  });
}

const readingProgress = document.querySelector<HTMLElement>('#reading-progress');
if (readingProgress) {
  const updateProgress = () => {
    const article = document.querySelector<HTMLElement>('.article-body');
    if (!article) return;
    const start = article.offsetTop;
    const available = Math.max(1, article.offsetHeight - innerHeight * 0.5);
    const progress = Math.min(1, Math.max(0, (scrollY - start + innerHeight * 0.25) / available));
    readingProgress.style.transform = `scaleX(${progress})`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

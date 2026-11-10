// Personalize the site here. These are starter copy and public resource links.
export const site = {
  name: 'fatfatshark',
  title: '肥肥鲨的游泳池',
  description: '记录代码、生活，以及那些值得留下的小事。',
  tagline: '写代码，也记录生活。',
  motto: '循此苦旅，以达天际',
  icon: '/images/sharkpool.jpeg',
  avatar: '/images/fatfatshark.jpeg',
  wallpaper: '/images/bandream.jpeg',
  wallpaperPosition: 'center', // Desktop crop: center, center top, or e.g. 70% center.
  wallpaperMobilePosition: '83% top', // Mobile crop: adjust the first percentage to move the focus.
  bio: '一个慢慢生长的个人空间。\n收藏灵感，记录折腾，让想法有迹可循。',
  timezone: 'Asia/Shanghai',
  email: '', // Add an email address to enable the contact link.
  github: 'https://github.com/',
  started: '2026',
};

export const interests = [
  { label: 'Web 开发', icon: 'code' },
  { label: '开源与工具', icon: 'terminal' },
  { label: '设计与体验', icon: 'sparkles' },
  { label: '生活与阅读', icon: 'book' },
];

export const reading = {
  title: '悉达多',
  author: '赫尔曼 · 黑塞',
  note: '沿着自己的河流，寻找答案。',
  cover: '/images/book-cover.svg',
  url: 'https://zh.wikipedia.org/wiki/悉达多_(小说)',
};

export const albums = [
  { title: 'Chill & Focus', subtitle: '给专注留一点背景音', cover: '/images/album-orbit.svg', tag: 'AMBIENT' },
  { title: 'A Slow Afternoon', subtitle: '适合慢一点的下午', cover: '/images/album-sunset.svg', tag: 'INSTRUMENTAL' },
  { title: 'After the Rain', subtitle: '雨停了，故事还在继续', cover: '/images/album-rain.svg', tag: 'LO-FI' },
];

export const projects = [
  {
    title: '这个数字花园',
    subtitle: '给想法找一个安静的住处',
    description: '用卡片收藏生活，用文章记录思考。一个轻盈、可持续更新的个人空间。',
    icon: 'flower',
    color: 'sage',
    tags: ['Astro', 'TypeScript', 'CSS'],
    href: '/about/',
  },
  {
    title: '工具与灵感',
    subtitle: '一些让日常变简单的东西',
    description: '喜欢的开发工具、阅读材料与设计灵感，收在一起，随时回来看看。',
    icon: 'layers',
    color: 'lavender',
    tags: ['TOOLS', 'DESIGN'],
    href: '/library/?category=bookmarks',
  },
];

export const bookmarks = [
  { name: 'Astro', description: '为内容而生的 Web 框架', href: 'https://astro.build/', icon: 'rocket', color: 'peach', category: '开发' },
  { name: 'MDN Web Docs', description: '把 Web 的基础知识弄明白', href: 'https://developer.mozilla.org/zh-CN/', icon: 'code', color: 'sage', category: '开发' },
  { name: 'GitHub', description: '代码、开源与新的可能', href: 'https://github.com/', icon: 'github', color: 'lavender', category: '开源' },
  { name: 'A List Apart', description: '关于设计、内容和 Web 的思考', href: 'https://alistapart.com/', icon: 'pen', color: 'sand', category: '设计' },
];

export const bookshelf = [
  { ...reading, type: '小说', status: '想读' },
  { title: '设计中的设计', author: '原研哉', note: '从日常里重新发现设计。', cover: '/images/book-design.svg', url: 'https://zh.wikipedia.org/wiki/原研哉', type: '设计', status: '想读' },
  { title: '小王子', author: '安托万 · 德 · 圣埃克苏佩里', note: '重要的东西，用眼睛是看不见的。', cover: '/images/book-prince.svg', url: 'https://zh.wikipedia.org/wiki/小王子', type: '小说', status: '想读' },
];

// ============================================================
//  鈴木あかり オフィシャルサイト — main.js
// ============================================================

// ---------- ヘッダー: スクロールで影 ----------
const header = document.getElementById('site-header');

const onScroll = () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- ハンバーガーメニュー (SP) ----------
const navToggle = document.getElementById('navToggle');
const globalNav = document.getElementById('global-nav');

navToggle.addEventListener('click', () => {
  const isOpen = globalNav.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// ナビリンクをクリックしたらメニューを閉じる
globalNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    globalNav.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-label', 'メニューを開く');
    document.body.style.overflow = '';
  });
});

// ---------- スムーズスクロール ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = header.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ---------- コンサートフィルター ----------
const filterBtns = document.querySelectorAll('.filter-btn');
const concertCards = document.querySelectorAll('.concert-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    concertCards.forEach(card => {
      const match = filter === 'all' || card.dataset.type === filter;
      card.classList.toggle('hidden', !match);
    });
  });
});

// ---------- スクロールアニメーション (Intersection Observer) ----------
const animateTargets = document.querySelectorAll(
  '.news-item, .concert-card, .disc-card, .media-card, .profile-body p, .profile-awards li'
);

const io = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
);

animateTargets.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.6s ease ${(i % 6) * 0.07}s, transform 0.6s ease ${(i % 6) * 0.07}s`;
  io.observe(el);
});

// visible クラスが付いたら表示
const style = document.createElement('style');
style.textContent = '.visible { opacity: 1 !important; transform: none !important; }';
document.head.appendChild(style);

// ---------- アクティブナビ（スクロール連動） ----------
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('#global-nav a[href^="#"]');

const navObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle(
            'nav-active',
            link.getAttribute('href') === '#' + entry.target.id
          );
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach(sec => navObserver.observe(sec));

// nav-active スタイル
const navStyle = document.createElement('style');
navStyle.textContent = '#global-nav a.nav-active { color: var(--gold); }';
document.head.appendChild(navStyle);
// profile
document.getElementById('profile-img').src =
  import.meta.env.BASE_URL + 'images/profile.jpg'
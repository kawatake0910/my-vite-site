// =============================================
// 山田太郎 オフィシャルサイト - main.js
// =============================================

// ---- アクセスカウンター ----
function initCounter() {
  const counterEl = document.getElementById('counter');
  if (!counterEl) return;

  let count = parseInt(localStorage.getItem('visit_count') || '0', 10);
  count += 1;
  localStorage.setItem('visit_count', String(count));

  // 6桁ゼロ埋め表示
  counterEl.textContent = String(count).padStart(6, '0');
}

// ---- 掲示板 ----
const BBS_KEY = 'yamada_bbs_posts';
const MAX_POSTS = 20;

function loadPosts() {
  try {
    return JSON.parse(localStorage.getItem(BBS_KEY) || '[]');
  } catch {
    return [];
  }
}

function savePosts(posts) {
  localStorage.setItem(BBS_KEY, JSON.stringify(posts.slice(0, MAX_POSTS)));
}

function formatDate(iso) {
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function renderPosts() {
  const container = document.getElementById('bbs-posts');
  if (!container) return;

  const posts = loadPosts();

  if (posts.length === 0) {
    container.innerHTML = '<p style="color:#999;font-size:12px;">まだ書き込みはありません。最初のコメントをどうぞ！</p>';
    return;
  }

  container.innerHTML = posts.map(p => `
    <div class="bbs-entry">
      <div class="bbs-meta">
        <span class="bbs-name">${escapeHtml(p.name)}</span> さん &nbsp;|&nbsp; ${formatDate(p.date)}
      </div>
      <div class="bbs-text">${escapeHtml(p.message)}</div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function initBBS() {
  renderPosts();

  const submitBtn = document.getElementById('bbs-submit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', () => {
    const nameEl = document.getElementById('bbs-name');
    const msgEl  = document.getElementById('bbs-msg');

    const name    = (nameEl.value.trim() || '名無しさん').slice(0, 20);
    const message = msgEl.value.trim().slice(0, 200);

    if (!message) {
      alert('メッセージを入力してください。');
      return;
    }

    const posts = loadPosts();
    posts.unshift({ name, message, date: new Date().toISOString() });
    savePosts(posts);

    nameEl.value = '';
    msgEl.value  = '';

    renderPosts();
  });
}

// ---- スムーズスクロール（ナビリンク） ----
function initNavLinks() {
  document.querySelectorAll('nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ---- 初期化 ----
document.addEventListener('DOMContentLoaded', () => {
  initCounter();
  initBBS();
  initNavLinks();
});
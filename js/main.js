/**
 * main.js — data.json を読み込んで作品カードを生成
 *
 * - サブ画像クリック/タップでメイン画像切り替え
 * - 作品インデックス表示（No.01 …）
 */
(function () {
  'use strict';

  function esc(str) {
    if (str == null || str === '') return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function linkify(str) {
    return str.replace(
      /(https?:\/\/[^\s&<>"]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
  }

  function toHtml(str, withLink) {
    if (!str) return '';
    const escaped = esc(str)
      .replace(/\\n/g, '\n')
      .replace(/\n/g, '<br>');
    return withLink ? linkify(escaped) : escaped;
  }

  function formatDuration(sec) {
    if (!sec || isNaN(sec)) return '';
    const m = Math.floor(sec / 60);
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function renderWork(w, idx) {
    const allImages = [
      w.keyvisual,
      w.subvisual01, w.subvisual02, w.subvisual03, w.subvisual04,
    ].filter(Boolean);

    const firstSrc = allImages.length > 0 ? `img/${esc(allImages[0])}` : null;
    const mainContent = firstSrc
      ? `<img src="${firstSrc}" alt="${esc(w.title)}" class="dome-main-img" loading="lazy">`
      : `<div class="dome-no-image">NO IMAGE</div>`;

    const thumbsHtml = allImages.length > 0
      ? `<div class="work-thumbs" role="list" aria-label="画像一覧">
          ${allImages.map((f, i) => `
            <button
              class="work-thumb${i === 0 ? ' is-active' : ''}"
              data-src="img/${esc(f)}"
              data-alt="${i === 0 ? esc(w.title) : ''}"
              aria-label="画像 ${i + 1}"
              type="button"
            ><img src="img/${esc(f)}" alt="" loading="lazy"></button>
          `).join('')}
        </div>`
      : '';

    const indexStr    = String(idx + 1).padStart(2, '0');
    const deptHtml    = w.department  ? `<span class="work-dept">${esc(w.department)}</span>`  : '';
    const seminarHtml = w.seminar     ? `<span class="work-seminar">${esc(w.seminar)}</span>`  : '';
    const durHtml     = w.videoduration
      ? `<span class="work-duration" title="上映時間">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
            <path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          ${formatDuration(w.videoduration)}
        </span>` : '';
    const creditsHtml = w.othercredits
      ? `<p class="work-credits">${toHtml(w.othercredits, true)}</p>` : '';
    const webHtml     = w.website
      ? `<a class="work-website" href="${esc(w.website)}" target="_blank" rel="noopener noreferrer">${esc(w.website)}</a>`
      : '';

    return `
      <article class="work-card" id="work-${indexStr}">
        <div class="work-visual">
          <div class="dome-image">${mainContent}</div>
          ${thumbsHtml}
        </div>
        <div class="work-info">
          <p class="work-index">No.${indexStr}</p>
          <div class="work-meta">
            <span class="badge badge-musabi">${esc(w.school)}</span>
            ${deptHtml}
            ${seminarHtml}
            ${durHtml}
          </div>
          <h3 class="work-title">${esc(w.title)}</h3>
          <p class="work-author">${esc(w.name)}</p>
          <p class="work-desc">${toHtml(w.description)}</p>
          ${creditsHtml}
          ${webHtml}
        </div>
      </article>
    `;
  }

  function bindThumbSwap(container) {
    container.addEventListener('click', function (e) {
      const thumb = e.target.closest('.work-thumb');
      if (!thumb) return;

      const card    = thumb.closest('.work-card');
      const mainImg = card.querySelector('.dome-main-img');

      if (mainImg) {
        mainImg.src = thumb.dataset.src;
        mainImg.alt = thumb.dataset.alt || '';
      }

      card.querySelectorAll('.work-thumb').forEach(function (t) {
        t.classList.toggle('is-active', t === thumb);
      });

      document.dispatchEvent(new CustomEvent('dome:setTexture', {
        detail: { src: thumb.dataset.src }
      }));
    });
  }

  fetch('./js/data.json')
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (works) {
      var container = document.getElementById('works-container');
      if (!container) return;
      container.innerHTML = works.map(renderWork).join('');
      bindThumbSwap(container);

      /* ── ハッシュURLで特定作品にスクロール ── */
      function scrollToHash() {
        var hash = window.location.hash;
        if (!hash || !/^#work-\d+$/.test(hash)) return;
        var target = document.querySelector(hash);
        if (!target) return;
        var navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
        var top = target.getBoundingClientRect().top + window.pageYOffset - navH - 24;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
      /* レイアウト確定後に実行 */
      requestAnimationFrame(function () { setTimeout(scrollToHash, 50); });
      window.addEventListener('hashchange', scrollToHash);
    })
    .catch(function (err) {
      var container = document.getElementById('works-container');
      if (container) {
        container.innerHTML =
          '<p class="loading">作品データの読み込みに失敗しました。</p>';
      }
      console.error('data.json の読み込みエラー:', err);
    });

  /* ── ハンバーガーメニュー ── */
  var toggle = document.getElementById('nav-toggle');
  var menu   = document.getElementById('nav-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
    });

    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'メニューを開く');
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'メニューを開く');
        toggle.focus();
      }
    });
  }

})();

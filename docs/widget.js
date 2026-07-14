/**
 * Trusty embeddable reviews widget.
 * Paste with a #trusty-reviews mount + this script (see Settings → Website widget).
 * Fetches widget-data.json and caches in localStorage for 24 hours.
 */
(function () {
  'use strict';

  var CACHE_KEY = 'trusty_widget_cache_v1';
  var CACHE_TTL_MS = 24 * 60 * 60 * 1000;
  var ROTATE_MS = 5000;

  var script =
    document.currentScript ||
    document.querySelector('script[data-trusty-widget]');
  if (!script) return;

  var theme = (script.getAttribute('data-theme') || 'light').toLowerCase();
  if (theme !== 'dark') theme = 'light';

  var max = parseInt(script.getAttribute('data-max') || '4', 10);
  if (isNaN(max) || max < 3) max = 3;
  if (max > 5) max = 5;

  var base = script.src
    ? script.src.replace(/\/[^/]*$/, '/')
    : 'https://www.trustydirect.com/';
  var dataUrl = script.getAttribute('data-src') || base + 'widget-data.json';

  var mount =
    document.getElementById('trusty-reviews') ||
    (function () {
      var el = document.createElement('div');
      el.id = 'trusty-reviews';
      script.parentNode.insertBefore(el, script);
      return el;
    })();

  var palettes = {
    light: {
      bg: '#fafafa',
      border: '#e8e8ea',
      text: '#1a1a1c',
      muted: '#6b6c70',
      star: '#c9891a',
      accent: '#0d9488',
      soft: '#f0f0f2',
    },
    dark: {
      bg: '#131417',
      border: '#232529',
      text: '#f4f4f3',
      muted: '#9a9ba0',
      star: '#f0a53e',
      accent: '#2dd4bf',
      soft: '#1a1c20',
    },
  };
  var c = palettes[theme];

  function injectStyles() {
    if (document.getElementById('trusty-widget-styles')) return;
    var style = document.createElement('style');
    style.id = 'trusty-widget-styles';
    style.textContent =
      '#trusty-reviews{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;box-sizing:border-box;}' +
      '#trusty-reviews *,#trusty-reviews *::before,#trusty-reviews *::after{box-sizing:border-box;}' +
      '#trusty-reviews .tw-card{max-width:360px;padding:1.1rem 1.2rem 1rem;border-radius:12px;border:1px solid ' +
      c.border +
      ';background:' +
      c.bg +
      ';color:' +
      c.text +
      ';}' +
      '#trusty-reviews .tw-name{font-size:0.95rem;font-weight:650;letter-spacing:-0.02em;margin:0 0 0.35rem;}' +
      '#trusty-reviews .tw-rating{display:flex;align-items:center;gap:0.4rem;margin-bottom:0.9rem;}' +
      '#trusty-reviews .tw-stars{color:' +
      c.star +
      ';letter-spacing:0.05em;font-size:0.85rem;}' +
      '#trusty-reviews .tw-avg{font-size:0.85rem;font-weight:600;}' +
      '#trusty-reviews .tw-count{font-size:0.78rem;color:' +
      c.muted +
      ';}' +
      '#trusty-reviews .tw-quote{min-height:4.6em;margin:0;font-size:0.9rem;line-height:1.45;color:' +
      c.text +
      ';}' +
      '#trusty-reviews .tw-author{margin:0.65rem 0 0;font-size:0.8rem;color:' +
      c.muted +
      ';}' +
      '#trusty-reviews .tw-dots{display:flex;gap:0.35rem;margin-top:0.85rem;}' +
      '#trusty-reviews .tw-dot{width:6px;height:6px;border-radius:50%;background:' +
      c.soft +
      ';border:0;padding:0;cursor:pointer;}' +
      '#trusty-reviews .tw-dot[aria-current="true"]{background:' +
      c.accent +
      ';}' +
      '#trusty-reviews .tw-foot{margin-top:0.75rem;font-size:0.68rem;color:' +
      c.muted +
      ';opacity:0.75;}' +
      '#trusty-reviews .tw-foot a{color:inherit;text-decoration:none;}' +
      '#trusty-reviews .tw-err{font-size:0.85rem;color:' +
      c.muted +
      ';padding:0.5rem 0;}';
    document.head.appendChild(style);
  }

  function stars(n) {
    var full = Math.round(Number(n) || 0);
    var out = '';
    for (var i = 0; i < 5; i++) out += i < full ? '★' : '☆';
    return out;
  }

  function firstName(name) {
    if (!name) return 'Guest';
    return String(name).trim().split(/\s+/)[0];
  }

  function pickReviews(list, limit) {
    return (list || [])
      .slice()
      .sort(function (a, b) {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return new Date(b.date) - new Date(a.date);
      })
      .slice(0, limit);
  }

  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.at || !parsed.data) return null;
      if (Date.now() - parsed.at > CACHE_TTL_MS) return null;
      return parsed.data;
    } catch (e) {
      return null;
    }
  }

  function writeCache(data) {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ at: Date.now(), data: data })
      );
    } catch (e) {
      /* ignore quota */
    }
  }

  function loadData() {
    var cached = readCache();
    if (cached) return Promise.resolve(cached);
    return fetch(dataUrl, { credentials: 'omit' })
      .then(function (res) {
        if (!res.ok) throw new Error('fetch failed');
        return res.json();
      })
      .then(function (data) {
        writeCache(data);
        return data;
      });
  }

  function render(data) {
    injectStyles();
    var reviews = pickReviews(data.reviews, max);
    if (!reviews.length) {
      mount.innerHTML =
        '<div class="tw-card"><p class="tw-err">No reviews to show yet.</p></div>';
      return;
    }

    var index = 0;
    var timer = null;

    function paint() {
      var r = reviews[index];
      var dots = reviews
        .map(function (_, i) {
          return (
            '<button type="button" class="tw-dot" data-i="' +
            i +
            '" aria-label="Review ' +
            (i + 1) +
            '"' +
            (i === index ? ' aria-current="true"' : '') +
            '></button>'
          );
        })
        .join('');

      mount.innerHTML =
        '<div class="tw-card" role="region" aria-label="Customer reviews">' +
        '<div class="tw-name">' +
        escapeHtml(data.name || 'Our business') +
        '</div>' +
        '<div class="tw-rating">' +
        '<span class="tw-stars" aria-hidden="true">' +
        stars(data.averageRating) +
        '</span>' +
        '<span class="tw-avg">' +
        (Number(data.averageRating) || 0).toFixed(1) +
        '</span>' +
        '<span class="tw-count">· ' +
        (data.totalReviews || reviews.length) +
        ' reviews</span>' +
        '</div>' +
        '<p class="tw-quote">“' +
        escapeHtml(r.text) +
        '”</p>' +
        '<p class="tw-author">— ' +
        escapeHtml(firstName(r.authorName)) +
        '</p>' +
        '<div class="tw-dots">' +
        dots +
        '</div>' +
        '<div class="tw-foot"><a href="https://www.trustydirect.com/" target="_blank" rel="noopener">Powered by Trusty</a></div>' +
        '</div>';

      var buttons = mount.querySelectorAll('.tw-dot');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', onDot);
      }
    }

    function onDot(e) {
      var i = parseInt(e.currentTarget.getAttribute('data-i'), 10);
      if (isNaN(i)) return;
      index = i;
      paint();
      restart();
    }

    function tick() {
      index = (index + 1) % reviews.length;
      paint();
    }

    function restart() {
      if (timer) clearInterval(timer);
      if (reviews.length > 1) timer = setInterval(tick, ROTATE_MS);
    }

    paint();
    restart();
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  loadData()
    .then(render)
    .catch(function () {
      injectStyles();
      mount.innerHTML =
        '<div class="tw-card"><p class="tw-err">Reviews unavailable right now.</p></div>';
    });
})();

(() => {
  const root = document.documentElement;

  // theme toggle (light by default, remembered per browser)
  const tb = document.querySelector('.theme');
  if (tb) tb.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // nav dropdowns
  const dds = Array.from(document.querySelectorAll('.dd'));
  const closeAll = except => dds.forEach(d => {
    if (d !== except) { d.removeAttribute('data-open'); d.querySelector('button').setAttribute('aria-expanded', 'false'); }
  });
  dds.forEach(d => {
    const b = d.querySelector('button');
    b.addEventListener('click', e => {
      e.stopPropagation();
      const open = !d.hasAttribute('data-open');
      closeAll(d);
      if (open) d.setAttribute('data-open', ''); else d.removeAttribute('data-open');
      b.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.dd')) closeAll(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    document.querySelectorAll('video[autoplay]').forEach(v => { v.removeAttribute('autoplay'); v.pause(); v.controls = true; });
  }

  // project search
  const q = document.getElementById('q');
  if (q) {
    const items = Array.from(document.querySelectorAll('#grid > li'));
    const empty = document.getElementById('empty');
    q.addEventListener('input', () => {
      const words = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      let shown = 0;
      items.forEach(li => {
        const ok = words.every(w => li.dataset.q.includes(w));
        li.hidden = !ok; if (ok) shown++;
      });
      empty.hidden = shown > 0;
    });
  }

  // table of contents: highlight the section in view
  const tocLinks = Array.from(document.querySelectorAll('.toc a'));
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const map = new Map(tocLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          tocLinks.forEach(a => a.classList.remove('on'));
          const a = map.get(en.target.id); if (a) a.classList.add('on');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    map.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  // Go2 mission: jump to a step, highlight the step that is playing
  const mv = document.getElementById('mVid');
  const btns = Array.from(document.querySelectorAll('.steps button[data-t]'));
  if (mv && btns.length) {
    btns.forEach(b => b.addEventListener('click', () => {
      mv.currentTime = Number(b.dataset.t);
      const p = mv.play(); if (p && p.catch) p.catch(() => {});
    }));
    const mark = () => {
      let cur = 0;
      btns.forEach((b, i) => { if (mv.currentTime >= Number(b.dataset.t) - 0.05) cur = i; });
      btns.forEach((b, i) => b.classList.toggle('on', i === cur));
    };
    mv.addEventListener('timeupdate', mark);
    mark();
  }

  // copy email
  document.querySelectorAll('button.copy[data-copy]').forEach(b => {
    b.addEventListener('click', () => {
      const done = () => { const o = b.textContent; b.textContent = '복사됨'; setTimeout(() => { b.textContent = o; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(b.dataset.copy).then(done).catch(() => selectText(b));
      } else { selectText(b); }
    });
  });
  function selectText(b) {
    const el = document.getElementById(b.dataset.target);
    if (!el) return;
    const r = document.createRange(); r.selectNodeContents(el);
    const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }
})();

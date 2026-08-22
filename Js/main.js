/* =========================================================
   Phatpicha · Portfolio — main.js (v3)
   1) Loading screen   2) Starfield        3) Scroll reveal
   4) Lightbox         5) Photo carousel   6) Search
   ========================================================= */

// ---------- 1) LOADER ----------
(function () {
  const loader = document.getElementById('loader');
  const pctEl = document.getElementById('pct');
  if (!loader || !pctEl) return;
  let pct = 0;
  const tick = setInterval(() => {
    pct += Math.floor(Math.random() * 12) + 4;
    if (pct >= 100) {
      pct = 100;
      clearInterval(tick);
      setTimeout(() => loader.classList.add('done'), 350);
    }
    pctEl.textContent = pct;
  }, 120);
})();

// ---------- 2) STARFIELD ----------
(function () {
  const canvas = document.getElementById('stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  let w, h;
  let mouseX = 0, mouseY = 0;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    makeStars();
  }

  function makeStars() {
    const count = Math.min(240, Math.floor((w * h) / 6000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      depth: Math.random() * 0.7 + 0.3,
      tw: Math.random() * Math.PI * 2,
      twSpeed: Math.random() * 0.03 + 0.008
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.tw += s.twSpeed;
      const alpha = 0.35 + Math.abs(Math.sin(s.tw)) * 0.65;
      const px = s.x + mouseX * 20 * s.depth;
      const py = s.y + mouseY * 20 * s.depth;
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${200 + s.depth * 55}, ${200 + s.depth * 40}, 255, ${alpha})`;
      ctx.fill();
    }
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / w - 0.5);
    mouseY = (e.clientY / h - 0.5);
  });

  resize();
  if (reduceMotion) { draw(); }
  else { requestAnimationFrame(draw); }
})();

// ---------- 2b) MOBILE NAV TOGGLE ----------
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;

  function closeMenu() {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    const searchBar = document.getElementById('search-bar');
    const searchToggle = document.querySelector('.search-toggle');
    if (open && searchBar && searchToggle) {
      searchBar.classList.remove('open');
      searchToggle.setAttribute('aria-expanded', 'false');
    }
  });

  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
})();

// ---------- 3) SCROLL REVEAL ----------
(function () {
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('show');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => io.observe(el));
})();

// ---------- 4) LIGHTBOX (กดรูปเพื่อขยาย) ----------
(function () {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const lbImg = lb.querySelector('img');

  // ดักจับรูปทั้งหมดใน panel (รวมรูปในสไลด์) ยกเว้นรูปดวงอาทิตย์ตรง hero
  const imgs = document.querySelectorAll('.panel img');
  imgs.forEach((img) => {
    img.addEventListener('click', () => {
      lbImg.src = img.src;
      lbImg.alt = img.alt || '';
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';   // ล็อกสกอลล์ตอนเปิด
    });
  });

  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }
  lb.addEventListener('click', closeLb);                 // กดที่ไหนก็ปิด
  document.addEventListener('keydown', (e) => {          // กด Esc ก็ปิด
    if (e.key === 'Escape') closeLb();
  });
})();

// ---------- 5) CAROUSEL (สไลด์รูปภาพ) ----------
/**
 * เลื่อนสไลด์ในการ์ดที่ปุ่มถูกกด
 * @param {number} step  -1 = ย้อนกลับ, 1 = ถัดไป
 * @param {HTMLElement} button  ปุ่มที่ถูกกด
 */
function moveSlide(step, button) {
  const container = button.closest('.carousel-container');
  if (!container) return;

  const slides = container.querySelectorAll('.carousel-slide');
  if (!slides.length) return;

  let current = 0;
  slides.forEach((s, i) => { if (s.classList.contains('active')) current = i; });

  slides[current].classList.remove('active');

  // วนกลับต้น/ท้ายอัตโนมัติ
  let next = (current + step + slides.length) % slides.length;
  slides[next].classList.add('active');

  updateCount(container, next, slides.length);
}

function updateCount(container, index, total) {
  const counter = container.querySelector('.carousel-count');
  if (counter) counter.textContent = `${index + 1} / ${total}`;
}

// ตั้งค่าเริ่มต้นให้ทุกสไลเดอร์ในหน้า + รองรับปุ่มลูกศรบนคีย์บอร์ด
(function () {
  document.querySelectorAll('.carousel-container').forEach((container) => {
    const slides = container.querySelectorAll('.carousel-slide');
    if (!slides.length) return;

    // ถ้าลืมใส่ class="active" ให้รูปแรกแสดงเสมอ
    if (!container.querySelector('.carousel-slide.active')) {
      slides[0].classList.add('active');
    }

    let start = 0;
    slides.forEach((s, i) => { if (s.classList.contains('active')) start = i; });
    updateCount(container, start, slides.length);

    // มีรูปเดียวก็ไม่ต้องโชว์ปุ่ม
    if (slides.length < 2) {
      container.querySelectorAll('.prev-btn, .next-btn, .carousel-count')
               .forEach((el) => el.style.display = 'none');
      return;
    }

    container.setAttribute('tabindex', '0');
    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { moveSlide(-1, container.querySelector('.prev-btn')); }
      if (e.key === 'ArrowRight') { moveSlide( 1, container.querySelector('.next-btn')); }
    });
  });
})();

// ---------- 6) SEARCH (พิมพ์ค้นหา แล้วเลื่อนไปที่หัวข้อนั้น) ----------
(function () {
  const toggle = document.querySelector('.search-toggle');
  const bar = document.getElementById('search-bar');
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  const msg = document.getElementById('search-msg');
  if (!toggle || !bar || !form || !input || !msg) return;

  function openBar() {
    bar.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    setTimeout(() => input.focus(), 200);
  }
  function closeBar() {
    bar.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    bar.classList.contains('open') ? closeBar() : openBar();
    const links = document.getElementById('nav-links');
    const navToggle = document.querySelector('.nav-toggle');
    if (links && links.classList.contains('open') && navToggle) {
      links.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bar.classList.contains('open')) closeBar();
  });

  // รวบรวม "หัวข้อ" ที่ค้นหาได้ทั้งหมดในหน้า (การ์ดโปรเจกต์, กิจกรรม, ใบเซอร์, ทักษะ ฯลฯ)
  function buildIndex() {
    const groups = [
      { sel: '.sec-head', head: 'h2' },
      { sel: '#projects .proj', head: 'h3' },
      { sel: '#activities .award', head: 'h3' },
      { sel: '#certs .cert', head: 'b' },
      { sel: '#experience .tl-item', head: 'h3' },
      { sel: '#skills .skill' },
      { sel: '#contact' }
    ];
    const items = [];
    groups.forEach((g) => {
      document.querySelectorAll(g.sel).forEach((el) => {
        const headEl = g.head ? el.querySelector(g.head) : el;
        const title = (headEl ? headEl.textContent : el.textContent).trim();
        if (!title) return;
        items.push({ el, title, text: el.textContent.trim().toLowerCase() });
      });
    });
    return items;
  }
  const index = buildIndex();

  function highlight(el) {
    el.classList.remove('search-hit');
    void el.offsetWidth; // รีสตาร์ท animation
    el.classList.add('search-hit');
    setTimeout(() => el.classList.remove('search-hit'), 1700);
  }

  function runSearch(raw) {
    const query = raw.trim().toLowerCase();
    if (!query) return;

    const lowerTitle = (it) => it.title.toLowerCase();
    const match =
      index.find((it) => lowerTitle(it) === query) ||
      index.find((it) => lowerTitle(it).startsWith(query)) ||
      index.find((it) => lowerTitle(it).includes(query)) ||
      index.find((it) => it.text.includes(query));

    if (match) {
      match.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      highlight(match.el);
      msg.textContent = 'พบ: ' + match.title;
    } else {
      msg.textContent = 'ไม่พบผลลัพธ์สำหรับ "' + raw.trim() + '"';
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runSearch(input.value);
  });
})();

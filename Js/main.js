/* =========================================================
   Phatpicha · Portfolio — main.js (v3)
   1) Loading screen   2) Starfield        3) Scroll reveal
   4) Lightbox         5) Photo carousel
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

// ---------- 4) LIGHTBOX (กดรูปเพื่อขยาย / กดวิดีโอเพื่อดูในหน้าเดียวกัน) ----------
(function () {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const lbImg = lb.querySelector('img');
  const lbVideo = document.getElementById('lb-video');
  const lbPrev = lb.querySelector('.lb-prev');
  const lbNext = lb.querySelector('.lb-next');
  const lbCount = lb.querySelector('.lb-count');

  let gallery = [];       // รูปทั้งหมดในสไลด์เดียวกับรูปที่กด (เลื่อนได้ในไลท์บ็อกซ์)
  let galleryIndex = 0;

  function showImage(i) {
    if (!gallery.length) return;
    galleryIndex = (i + gallery.length) % gallery.length;
    const img = gallery[galleryIndex];
    lbImg.src = img.src;
    lbImg.alt = img.alt || '';
    lb.classList.toggle('multi', gallery.length > 1);
    if (gallery.length > 1) lbCount.textContent = `${galleryIndex + 1} / ${gallery.length}`;
  }

  function openImage(clickedImg) {
    lbVideo.pause();
    lbVideo.removeAttribute('src');
    lbVideo.style.display = 'none';
    lbImg.style.display = 'block';

    // ถ้ารูปอยู่ในการ์ดสไลด์ ให้รวมทุกรูปในสไลด์นั้นเป็นแกลเลอรีเดียว เลื่อนได้ในไลท์บ็อกซ์
    const carousel = clickedImg.closest('.carousel-container');
    gallery = carousel ? Array.from(carousel.querySelectorAll('.carousel-slide img')) : [clickedImg];
    showImage(gallery.indexOf(clickedImg));

    lb.classList.add('open');
    document.body.style.overflow = 'hidden';   // ล็อกสกอลล์ตอนเปิด
  }

  function openVideo(src) {
    gallery = [];
    lb.classList.remove('multi');
    lbImg.style.display = 'none';
    lbVideo.style.display = 'block';
    lbVideo.src = src;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbVideo.play().catch(() => {});
  }

  // ดักจับรูปทั้งหมดใน panel (รวมรูปในสไลด์) ยกเว้นรูปดวงอาทิตย์ตรง hero
  const imgs = document.querySelectorAll('.panel img');
  imgs.forEach((img) => {
    img.addEventListener('click', () => openImage(img));
  });

  // ดักจับลิงก์วิดีโอ ให้เปิดดูในหน้าเดียวกันแทนที่จะเด้งไปแท็บใหม่
  document.querySelectorAll('.video-trigger').forEach((link) => {
    link.addEventListener('click', (e) => {
      // ปล่อยให้ ctrl/cmd/middle-click เปิดแท็บใหม่ตามปกติ
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      openVideo(link.getAttribute('href'));
    });
  });

  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbVideo.pause();
  }
  lbVideo.addEventListener('click', (e) => e.stopPropagation()); // กดคุมวิดีโอไม่ให้ปิดกล่อง
  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); showImage(galleryIndex - 1); });
  lbNext.addEventListener('click', (e) => { e.stopPropagation(); showImage(galleryIndex + 1); });
  lb.addEventListener('click', closeLb);                 // กดที่ไหนก็ปิด
  document.addEventListener('keydown', (e) => {          // กด Esc ปิด, ลูกศรเลื่อนรูป
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft' && gallery.length > 1) showImage(galleryIndex - 1);
    if (e.key === 'ArrowRight' && gallery.length > 1) showImage(galleryIndex + 1);
  });

  // ปัดซ้าย-ขวาเพื่อเลื่อนรูปบนมือถือ
  let touchStartX = null;
  lb.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (touchStartX === null || gallery.length < 2) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) showImage(galleryIndex + (dx < 0 ? 1 : -1));
    touchStartX = null;
  }, { passive: true });
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

/* =========================================================
   Phatpicha · Portfolio — main.js (v2)
   1) Loading screen  2) Starfield  3) Scroll reveal
   4) Lightbox: กดรูปใบเซอร์/รางวัล/โปรเจกต์เพื่อขยายดู
   ========================================================= */

// ---------- 1) LOADER ----------
(function () {
  const loader = document.getElementById('loader');
  const pctEl = document.getElementById('pct');
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

  // รูปที่กดขยายได้: รูปในทุก section + footer ยกเว้นรูปดวงอาทิตย์ตรง hero
  const imgs = document.querySelectorAll('.panel img, .award-img, .proj > img');
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

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

// ---------- 1b) LOADER STAR NETWORK (ฟีลเชื่อมโยงแบบ Claude อยู่บนหน้าโหลดด้วย) ----------
(function () {
  const canvas = document.getElementById('loader-bg');
  const loader = document.getElementById('loader');
  if (!canvas || !loader) return;
  const ctx = canvas.getContext('2d');
  let dots = [];
  let w, h;
  const COLORS = ['94,230,208', '138,124,255', '245,194,66'];
  const LINK_DIST = 130;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    w = canvas.width = loader.clientWidth;
    h = canvas.height = loader.clientHeight;
    const count = Math.min(46, Math.floor((w * h) / 20000));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      c: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));
  }

  function draw() {
    if (loader.classList.contains('done')) return; // เลิกวาดหลังโหลดเสร็จ ประหยัดแรงเครื่อง
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;
    }
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const a = dots[i], b = dots[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < LINK_DIST) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${a.c},${(1 - dist / LINK_DIST) * 0.28})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    for (const d of dots) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${d.c},0.8)`;
      ctx.fill();
    }
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
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

// ---------- 2a) NEURAL LINK NETWORK (โผล่ตั้งแต่ About ลงไป, ฟีลเชื่อมโยง — จุดดาวบริวารเชื่อมเข้าแต่ละหัวข้อใหญ่ + ฝุ่นดาวพื้นหลัง) ----------
(function () {
  const canvas = document.getElementById('network-bg');
  const about = document.getElementById('about');
  if (!canvas || !about) return;
  const ctx = canvas.getContext('2d');
  let w, h;
  let t = 0;
  let mouseX = -9999, mouseY = -9999;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLORS = ['94,230,208', '138,124,255', '245,194,66']; // cyan, violet, gold

  // ---- constellation dust (จุดเล็กๆ ลอยเชื่อมกันทั่วพื้นหลัง) ----
  let dust = [];
  const LINK_DIST = 150;
  const MOUSE_DIST = 200;

  function makeDust() {
    const count = Math.min(60, Math.floor((w * h) / 26000));
    dust = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      c: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));
  }

  function stepDust() {
    for (const n of dust) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      n.x = Math.max(0, Math.min(w, n.x));
      n.y = Math.max(0, Math.min(h, n.y));
    }
  }

  function drawDust() {
    for (let i = 0; i < dust.length; i++) {
      for (let j = i + 1; j < dust.length; j++) {
        const a = dust[i], b = dust[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${a.c},${(1 - dist / LINK_DIST) * 0.18})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      const dxm = dust[i].x - mouseX, dym = dust[i].y - mouseY;
      const dm = Math.sqrt(dxm * dxm + dym * dym);
      if (dm < MOUSE_DIST) {
        ctx.beginPath();
        ctx.moveTo(dust[i].x, dust[i].y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = `rgba(94,230,208,${(1 - dm / MOUSE_DIST) * 0.3})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    for (const n of dust) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${n.c},0.7)`;
      ctx.fill();
    }
  }

  // ---- เชื่อมโยงเข้ากับ "หัวข้อใหญ่" แต่ละหัวข้อ (sec-head ของทุก section เท่านั้น ไม่รวม footer) ----
  // แต่ละหัวข้อได้ไวร์เฟรมทรงกลมเล็กๆ ของตัวเอง สีเปลี่ยนตามหัวข้อ + มีสายโยงจากไวร์เฟรมใหญ่มาหา
  const headingEls = Array.from(document.querySelectorAll('.sec-head'));
  let headingClusters = headingEls.map((el, idx) => ({
    el,
    c: COLORS[idx % COLORS.length],
    phase: Math.random() * Math.PI * 2,
    spin: 0.7 + Math.random() * 0.5
  }));

  function headingAnchor(el) {
    const numEl = el.querySelector && el.querySelector('.sec-no');
    const rect = (numEl || el).getBoundingClientRect();
    return { x: rect.left - 16, y: rect.top + rect.height / 2 };
  }

  function drawMiniSphere(cx, cy, r, colorStr, rotOffset, spin) {
    const rotY = t * 0.5 * spin + rotOffset;
    const rotX = 0.4;
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    for (const p of miniSpherePts) {
      let x1 = p.x * cosY - p.z * sinY;
      let z1 = p.x * sinY + p.z * cosY;
      let y1 = p.y * cosX - z1 * sinX;
      let z2 = p.y * sinX + z1 * cosX;
      const scale = 3.2 / (3.2 + z2);
      const sx = cx + x1 * r * scale;
      const sy = cy + y1 * r * scale;
      const depthAlpha = (z2 + 1.3) / 2.3;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.55 * scale + 0.15, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${colorStr},${depthAlpha * 0.8})`;
      ctx.fill();
    }
  }

  function drawHeadingClusters() {
    for (const cl of headingClusters) {
      const a = headingAnchor(cl.el);
      // ข้ามถ้าหัวข้อยังไม่เข้าใกล้จอ (ประหยัดแรงวาด)
      if (a.y < -160 || a.y > h + 160) continue;

      // สายโยงโค้งๆ จากไวร์เฟรมใหญ่ (hub) มาหาหัวข้อนี้
      const midX = (hub.cx + a.x) / 2 + Math.sin(t * 0.3 + a.x) * 50;
      const midY = (hub.cy + a.y) / 2 + Math.cos(t * 0.3 + a.y) * 50;
      const grad = ctx.createLinearGradient(hub.cx, hub.cy, a.x, a.y);
      grad.addColorStop(0, 'rgba(138,124,255,0.10)');
      grad.addColorStop(1, `rgba(${cl.c},0.28)`);
      ctx.beginPath();
      ctx.moveTo(hub.cx, hub.cy);
      ctx.quadraticCurveTo(midX, midY, a.x, a.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.stroke();

      // ไวร์เฟรมทรงกลมเล็กๆ ประจำหัวข้อ หมุนวนตลอด สีตามหัวข้อ
      const miniR = (w < 700 ? 15 : 22) + Math.sin(t * 1.1 + cl.phase) * 1.5;
      drawMiniSphere(a.x, a.y, miniR, cl.c, cl.phase, cl.spin);
    }
  }

  // ---- hub: ทรงกลมไวร์เฟรมจากอนุภาค หมุนช้าๆ (fibonacci sphere projection) ----
  let spherePts = [];
  let miniSpherePts = [];
  let hub = { cx: 0, cy: 0, r: 140 };

  function fibonacciSphere(n) {
    const pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const radAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      pts.push({
        x: Math.cos(theta) * radAtY,
        y: y,
        z: Math.sin(theta) * radAtY,
        phi: Math.random() * Math.PI * 2
      });
    }
    return pts;
  }

  function makeSphere() {
    spherePts = fibonacciSphere(w < 700 ? 380 : 760);
    miniSpherePts = fibonacciSphere(w < 700 ? 70 : 120);
    hub.r = Math.min(w, h) * (w < 700 ? 0.13 : 0.15);
    hub.r = Math.max(80, Math.min(180, hub.r));
    hub.cx = w < 900 ? w * 0.5 : Math.min(w - 170, w * 0.85);
    hub.cy = h < 700 ? h * 0.28 : h * 0.4;
  }

  function drawSphere() {
    const rotY = t * 0.18;
    const rotX = 0.35;
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    for (const p of spherePts) {
      const wobble = 1 + 0.06 * Math.sin(t * 1.4 + p.phi);
      let x = p.x * wobble, y = p.y * wobble, z = p.z * wobble;
      // rotate around Y
      let x1 = x * cosY - z * sinY;
      let z1 = x * sinY + z * cosY;
      // rotate around X
      let y1 = y * cosX - z1 * sinX;
      let z2 = y * sinX + z1 * cosX;

      const scale = 260 / (260 + z2 * hub.r);
      const sx = hub.cx + x1 * hub.r * scale;
      const sy = hub.cy + y1 * hub.r * scale;
      const depthAlpha = (z2 + 1.15) / 2.15; // ด้านหน้าสว่างกว่าด้านหลัง
      const mixC = y1 > 0 ? '94,230,208' : '138,124,255'; // บนฟ้า ล่างม่วง
      ctx.beginPath();
      ctx.arc(sx, sy, 0.9 * scale + 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${mixC},${depthAlpha * 0.55})`;
      ctx.fill();
    }
    // แกนกลาง glow เบาๆ
    const glow = ctx.createRadialGradient(hub.cx, hub.cy, 0, hub.cx, hub.cy, hub.r * 1.1);
    glow.addColorStop(0, 'rgba(138,124,255,0.10)');
    glow.addColorStop(1, 'rgba(138,124,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(hub.cx, hub.cy, hub.r * 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    makeDust();
    makeSphere();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    drawDust();
    drawHeadingClusters();
    drawSphere();
    t += 0.016;
    if (!reduceMotion) {
      stepDust();
      requestAnimationFrame(draw);
    }
  }

  // แสดงผลตั้งแต่เลื่อนถึง About ลงไป แล้วไม่ซ่อนกลับ
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        canvas.classList.add('show');
        io.disconnect();
      }
    });
  }, { threshold: 0.05 });
  io.observe(about);

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  resize();
  draw();
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

// ---------- 2c) SCROLL-SPY NAV (ไฮไลต์สีหัวข้อที่กำลังดูอยู่) ----------
(function () {
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  if (!navLinks.length) return;

  const COLOR_BY_ID = {
    home: 'var(--ink)',
    about: 'var(--cyan)',
    projects: 'var(--gold)',
    activities: 'var(--blue)',
    certs: 'var(--red)',
    experience: 'var(--violet)',
    skills: 'var(--green)',
    contact: 'var(--cyan)'
  };

  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if (!sections.length) return;

  let ticking = false;

  function setActive(id) {
    navLinks.forEach((a) => {
      const linkId = a.getAttribute('href').slice(1);
      if (linkId === id) {
        a.classList.add('active');
        a.style.color = COLOR_BY_ID[id] || 'var(--cyan)';
      } else {
        a.classList.remove('active');
        a.style.color = '';
      }
    });
  }

  function update() {
    ticking = false;
    const probe = window.scrollY + 110; // ชดเชยความสูงของ nav bar
    let currentId = sections[0].id;
    for (const sec of sections) {
      if (sec.offsetTop <= probe) currentId = sec.id;
    }
    // เลื่อนสุดหน้าแล้ว ให้เมนูสุดท้าย (Contact) ติดไฮไลต์เสมอ แม้ฟุตเตอร์จะเตี้ยกว่าจอ
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    if (atBottom) currentId = sections[sections.length - 1].id;
    setActive(currentId);
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener('resize', update);

  update();
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

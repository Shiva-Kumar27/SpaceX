(() => {
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches, TAU = Math.PI * 2, rnd = (a, b) => a + Math.random() * (b - a);
const dpr = Math.min(devicePixelRatio || 1, 2);
const make = c => { const o = { c, x: c.getContext('2d') };
  o.fit = () => { o.w = c.clientWidth; o.h = c.clientHeight; c.width = o.w * dpr; c.height = o.h * dpr; o.x.setTransform(dpr, 0, 0, dpr, 0, 0); };
  o.fit(); return o; };

/* ---- Hero sky: parallax stars + three drifting glows ---- */
const sky = make(document.getElementById('sky'));
const stars = Array.from({ length: 170 }, () => ({ x: Math.random(), y: Math.random(), z: rnd(.2, 1), t: rnd(0, TAU) }));
const glows = [['185,168,255', .18, .3, 0], ['255,233,201', .86, .22, 2], ['255,191,217', .6, .85, 4]];
let mx = 0, my = 0, tx = 0, ty = 0, time = 0;
addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; });

/* ---- Portal thumbnails ---- */
const mk = {
  black: () => Array.from({ length: 80 }, () => ({ a: rnd(0, TAU), k: Math.random(), s: rnd(.7, 1.3) })),
  white: () => Array.from({ length: 80 }, () => ({ a: rnd(0, TAU), p: Math.random(), s: rnd(.2, .45) })),
  worm: () => Array.from({ length: 70 }, () => ({ u: Math.random(), y: rnd(-1, 1), d: Math.random() < .5 ? 1 : -1, s: rnd(.08, .2) }))
};
const thumbs = [...document.querySelectorAll('.portal')].map(el => {
  const o = make(el.querySelector('.thumb')), kind = el.dataset.p, t = { o, kind, ps: mk[kind](), sp: 1, to: 1 };
  el.addEventListener('pointerenter', () => t.to = 3.5);
  el.addEventListener('pointerleave', () => t.to = 1);
  return t;
});
const draw = {
  black(t, dt) {
    const { x, w, h } = t.o, cx = w / 2, cy = h / 2, s = h / 96;
    x.fillStyle = '#b9a8ff';
    for (const p of t.ps) {
      p.a += 1.8 * Math.pow(1 + 2 * p.k, -1.5) * p.s * t.sp * dt * 3;
      const r = (20 + 40 * p.k) * s, b = .5 - .5 * Math.cos(p.a);
      x.globalAlpha = .25 + .65 * b;
      x.fillRect(cx + r * 1.5 * Math.cos(p.a), cy + r * .3 * Math.sin(p.a), 1.8, 1.8);
    }
    x.globalAlpha = 1; x.fillStyle = '#050507'; x.strokeStyle = '#ffe9c9'; x.lineWidth = 1.2;
    x.beginPath(); x.arc(cx, cy, 13 * s, 0, TAU); x.fill(); x.stroke();
  },
  white(t, dt) {
    const { x, w, h } = t.o, cx = w / 2, cy = h / 2, R = w * .42;
    x.fillStyle = '#ffe9c9';
    for (const p of t.ps) {
      p.p = (p.p + p.s * t.sp * dt * .6) % 1;
      const r = 6 + R * (1 - (1 - p.p) ** 2);
      x.globalAlpha = Math.sin(Math.PI * p.p);
      x.fillRect(cx + r * Math.cos(p.a), cy + r * Math.sin(p.a) * h / w * 2.2, 1.8, 1.8);
    }
    x.globalAlpha = 1;
  },
  worm(t, dt) {
    const { x, w, h } = t.o, cy = h / 2, lx = w * .14, rx = w * .86, mh = h * .36, th = h * .1;
    const hh = u => th + (mh - th) * (2 * u - 1) ** 2, X = u => lx + (rx - lx) * u;
    x.strokeStyle = 'rgba(255,191,217,.45)'; x.lineWidth = 1;
    [-1, 1].forEach(sg => { x.beginPath(); for (let i = 0; i <= 30; i++) x.lineTo(X(i / 30), cy + sg * hh(i / 30)); x.stroke(); });
    for (const p of t.ps) {
      p.u += p.d * p.s * t.sp * dt * .5; if (p.u > 1) p.u -= 1; else if (p.u < 0) p.u += 1;
      x.globalAlpha = .7 * Math.sqrt(Math.sin(Math.PI * p.u));
      x.fillStyle = `hsl(${335 - 169 * p.u},85%,80%)`;
      x.fillRect(X(p.u), cy + p.y * hh(p.u) * .85, 1.8, 1.8);
    }
    x.globalAlpha = 1;
    [[lx, '#ffbfd9'], [rx, '#9af0d9']].forEach(([px, c]) => { x.strokeStyle = c; x.lineWidth = 1.8; x.beginPath(); x.ellipse(px, cy, h * .08, mh, 0, 0, TAU); x.stroke(); });
  }
};

addEventListener('resize', () => { sky.fit(); thumbs.forEach(t => t.o.fit()); });
let last = performance.now();
(function loop(now) {
  const dt = Math.min((now - last) / 1000, .05) * (calm ? .1 : 1); last = now; time += dt;
  mx += (tx - mx) * .05; my += (ty - my) * .05;
  const { x, w, h } = sky; x.clearRect(0, 0, w, h);
  glows.forEach(([c, fx, fy, ph]) => {
    const gx = fx * w + Math.sin(time * .15 + ph) * 40 - mx * 70, gy = fy * h + Math.cos(time * .12 + ph) * 30 - my * 70, r = Math.max(w, h) * .28;
    const g = x.createRadialGradient(gx, gy, 0, gx, gy, r);
    g.addColorStop(0, `rgba(${c},.16)`); g.addColorStop(1, `rgba(${c},0)`);
    x.fillStyle = g; x.fillRect(gx - r, gy - r, r * 2, r * 2);
  });
  x.fillStyle = '#ededf1';
  for (const s of stars) {
    x.globalAlpha = .25 + .45 * (.5 + .5 * Math.sin(s.t + time * 1.2 * s.z));
    x.fillRect(((s.x + mx * .05 * s.z) % 1 + 1) % 1 * w, ((s.y + my * .05 * s.z) % 1 + 1) % 1 * h, s.z * 1.8, s.z * 1.8);
  }
  x.globalAlpha = 1;
  thumbs.forEach(t => { t.sp += (t.to - t.sp) * .1; t.o.x.clearRect(0, 0, t.o.w, t.o.h); draw[t.kind](t, dt); });
  requestAnimationFrame(loop);
})(last);
})();
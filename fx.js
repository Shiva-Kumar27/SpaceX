(() => {
const page = document.body.dataset.page, cv = document.getElementById('fx');
if (!cv) return;
const ctx = cv.getContext('2d'), calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TAU = Math.PI * 2, rnd = (a, b) => a + Math.random() * (b - a), $ = id => document.getElementById(id);
let W, H;
function fit() {
  const d = Math.min(devicePixelRatio || 1, 2);
  W = cv.clientWidth; H = cv.clientHeight;
  cv.width = W * d; cv.height = H * d;
  ctx.setTransform(d, 0, 0, d, 0, 0);
}
fit(); addEventListener('resize', fit);

/* ---------- Black hole: accretion disk + lensed arcs, mass slider ---------- */
function black() {
  const ps = Array.from({ length: 520 }, () => ({ a: rnd(0, TAU), k: Math.random(), s: rnd(.7, 1.3) }));
  const sl = $('mass'), mo = $('massOut'), ro = $('rsOut');
  const fm = m => m >= 1e9 ? (m / 1e9).toFixed(1) + 'B' : m >= 1e6 ? (m / 1e6).toFixed(1) + 'M' : m >= 1e3 ? (m / 1e3).toFixed(1) + 'K' : m.toFixed(1);
  let R, tR;
  const sync = () => {
    const v = +sl.value, m = 10 ** v, km = 2.953 * m;          // Rs = 2GM/c² ≈ 2.953 km per solar mass
    tR = 12 + v * 3.4;
    mo.textContent = fm(m) + ' M☉';
    ro.textContent = km >= 1.5e8 ? (km / 1.496e8).toFixed(1) + ' AU'
      : km.toLocaleString('en', { maximumFractionDigits: km < 100 ? 1 : 0 }) + ' km';
  };
  sl.addEventListener('input', sync); sync(); R = tR;
  const dot = (x, y, p, b, s) => {
    ctx.fillStyle = `hsla(${35 + 220 * p.k},75%,${70 + 16 * b}%,${s * (.25 + .65 * b)})`;
    ctx.fillRect(x, y, 1.8, 1.8);
  };
  return dt => {
    R += (tR - R) * .12;
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(W / 360, W / 360);
    for (const p of ps) p.a += 2.4 * Math.pow(1.5 + 2.1 * p.k, -1.5) * p.s * dt;
    const geo = p => {
      const r = R * (1.5 + 2.1 * p.k), r2 = R * (1.35 + .8 * p.k), cs = Math.cos(p.a), sn = Math.sin(p.a);
      return { x: r * cs, y: r * sn * .26, ax: r2 * cs, ay: r2 * sn * .95, sn, b: .5 - .5 * cs };
    };
    for (const p of ps) {                       // far half of disk + lensed arcs (behind the core)
      const g = geo(p);
      if (g.sn < 0) dot(g.x, g.y, p, g.b, 1);
      dot(g.ax, g.ay, p, g.b, g.sn < 0 ? .8 : .3);
    }
    const halo = ctx.createRadialGradient(0, 0, R * .98, 0, 0, R * 1.35);
    halo.addColorStop(0, 'rgba(255,233,201,.9)');
    halo.addColorStop(.15, 'rgba(185,168,255,.35)');
    halo.addColorStop(1, 'rgba(185,168,255,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, 0, R * 1.35, 0, TAU); ctx.fill();
    ctx.fillStyle = '#050507'; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
    for (const p of ps) { const g = geo(p); if (g.sn >= 0) dot(g.x, g.y, p, g.b, 1); }   // near half in front
    ctx.restore();
  };
}

/* ---------- White hole: outflow, time-reverse toggle ---------- */
function white() {
  const ps = Array.from({ length: 420 }, () => ({ a: rnd(0, TAU), p: Math.random(), s: rnd(.12, .3), w: rnd(-.5, .5), z: rnd(1, 2.4) }));
  const btn = $('rev'), st = $('state'), sub = $('stateSub');
  let dir = 1, flow = 1;
  btn.addEventListener('click', () => {
    dir = -dir;
    st.textContent = dir > 0 ? 'White hole' : 'Black hole';
    sub.textContent = dir > 0 ? 'matter streams outward' : 'matter falls inward';
    btn.setAttribute('aria-pressed', dir < 0);
  });
  return dt => {
    flow += (dir - flow) * Math.min(1, dt * 4);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(W / 360, W / 360);
    const f = Math.max(0, flow), b = Math.max(0, -flow);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 80);
    g.addColorStop(0, `rgba(255,233,201,${.85 * f})`); g.addColorStop(1, 'rgba(255,233,201,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 80, 0, TAU); ctx.fill();
    ctx.fillStyle = `hsl(${255 - 220 * (flow + 1) / 2},80%,82%)`;
    for (const p of ps) {
      p.p += flow * p.s * dt;
      if (p.p > 1) p.p -= 1; else if (p.p < 0) p.p += 1;
      const r = 16 + 156 * (1 - (1 - p.p) ** 2), a = p.a + p.w * p.p * 2;
      ctx.globalAlpha = Math.pow(Math.sin(Math.PI * p.p), .7);
      ctx.fillRect(r * Math.cos(a), r * Math.sin(a), p.z, p.z);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = `rgba(5,5,7,${b})`; ctx.beginPath(); ctx.arc(0, 0, 17, 0, TAU); ctx.fill();
    ctx.restore();
  };
}

/* ---------- Wormhole: two mouths, tunnel, clickable probes ---------- */
function worm() {
  const geo = () => ({ lx: W * .14, rx: W * .86, cy: H / 2, mh: H * .36, mw: H * .09, th: H * .09 });
  const hh = (u, G) => G.th + (G.mh - G.th) * (2 * u - 1) ** 2;
  const ps = Array.from({ length: 170 }, () => ({ u: Math.random(), y: rnd(-1, 1), d: Math.random() < .5 ? 1 : -1, s: rnd(.05, .14) }));
  const probes = [], flash = [0, 0], out = $('trips');
  let trips = 0, nxt = 1;
  const launch = d => { probes.push({ t: 0, d, tr: [] }); flash[d > 0 ? 0 : 1] = 1; };
  const hit = e => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, G = geo();
    const near = m => ((x - m) / (G.mw * 2.2)) ** 2 + ((y - G.cy) / (G.mh * 1.15)) ** 2 < 1;
    return near(G.lx) ? 1 : near(G.rx) ? -1 : 0;
  };
  cv.addEventListener('click', e => { const d = hit(e); if (d) launch(d); });
  cv.addEventListener('mousemove', e => cv.style.cursor = hit(e) ? 'pointer' : 'default');
  $('send').addEventListener('click', () => { launch(nxt); nxt = -nxt; });
  return dt => {
    const G = geo(), X = u => G.lx + (G.rx - G.lx) * u;
    const grd = ctx.createLinearGradient(G.lx, 0, G.rx, 0);
    grd.addColorStop(0, '#ffbfd9'); grd.addColorStop(1, '#9af0d9');
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) ctx.lineTo(X(i / 40), G.cy - hh(i / 40, G));
    for (let i = 40; i >= 0; i--) ctx.lineTo(X(i / 40), G.cy + hh(i / 40, G));
    ctx.closePath();
    ctx.globalAlpha = .07; ctx.fillStyle = grd; ctx.fill();
    ctx.globalAlpha = .4; ctx.strokeStyle = grd; ctx.lineWidth = 1.5; ctx.stroke();
    for (const p of ps) {
      p.u += p.d * p.s * dt;
      if (p.u > 1) p.u -= 1; else if (p.u < 0) p.u += 1;
      ctx.globalAlpha = .15 + .6 * Math.sqrt(Math.sin(Math.PI * p.u));
      ctx.fillStyle = `hsl(${335 - 169 * p.u},85%,80%)`;
      ctx.fillRect(X(p.u), G.cy + p.y * hh(p.u, G) * .9, 1.8, 1.8);
    }
    [[G.lx, '#ffbfd9'], [G.rx, '#9af0d9']].forEach(([x, c], i) => {
      flash[i] = Math.max(0, flash[i] - dt * 1.5);
      ctx.globalAlpha = 1; ctx.shadowColor = c; ctx.shadowBlur = 14 + 26 * flash[i];
      ctx.strokeStyle = c; ctx.lineWidth = 2 + 3 * flash[i]; ctx.fillStyle = 'rgba(18,18,20,.75)';
      ctx.beginPath(); ctx.ellipse(x, G.cy, G.mw, G.mh, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
    });
    for (let i = probes.length - 1; i >= 0; i--) {
      const q = probes[i]; q.t += dt * .45;
      if (q.t >= 1) { flash[q.d > 0 ? 1 : 0] = 1; probes.splice(i, 1); out.textContent = ++trips; continue; }
      const u = q.d > 0 ? q.t : 1 - q.t;
      q.tr.push([X(u), G.cy + Math.sin(q.t * Math.PI * 3) * hh(u, G) * .45]);
      if (q.tr.length > 26) q.tr.shift();
      ctx.fillStyle = '#fff';
      q.tr.forEach(([x, y], j) => {
        const f = j / q.tr.length;
        ctx.globalAlpha = f * .7; ctx.beginPath(); ctx.arc(x, y, 1 + 3.5 * f, 0, TAU); ctx.fill();
      });
      const [hx, hy] = q.tr[q.tr.length - 1];
      ctx.globalAlpha = 1; ctx.shadowColor = '#fff'; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(hx, hy, 4.5, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  };
}

const draw = ({ black, white, worm }[page] || (() => null))();
if (!draw) return;
let last = performance.now();
const loop = now => {
  const dt = Math.min((now - last) / 1000, .05) * (calm ? .15 : 1); last = now;
  ctx.clearRect(0, 0, W, H); draw(dt);
  requestAnimationFrame(loop);
};
requestAnimationFrame(loop);
})();
// Mark active nav link by current page
document.querySelectorAll('.nav-links a').forEach(link => {
  const page = link.getAttribute('data-page');
  if (page === document.body.dataset.page) link.classList.add('active');
});

// Count-up for "In numbers" (parses "4.3M M☉", "1916", "0" from the markup itself)
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
function countUp(el) {
  if (el.dataset.done) return;
  el.dataset.done = 1;
  const m = el.textContent.match(/^([\d.]+)(.*)$/);
  if (!m || calm) return;
  const to = parseFloat(m[1]), dec = (m[1].split('.')[1] || '').length, tail = m[2];
  if (!to) return;
  const from = to >= 1000 ? to - 100 : 0, t0 = performance.now();   // years roll up from a century earlier
  (function step(now) {
    const p = Math.min((now - t0) / 1400, 1), e = 1 - Math.pow(1 - p, 3);
    el.textContent = (from + (to - from) * e).toFixed(dec) + tail;
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}

// Scroll-reveal for content sections
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        entry.target.querySelectorAll('.fact b').forEach(countUp);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}
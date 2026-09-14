// Mark active nav link by current page
document.querySelectorAll('.nav-links a').forEach(link => {
  const page = link.getAttribute('data-page');
  if (page === document.body.dataset.page) link.classList.add('active');
});

// Scroll-reveal for content sections
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

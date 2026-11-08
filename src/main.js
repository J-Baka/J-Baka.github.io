import './components/theme.js';
import './components/site-header.js';
import './components/hero-section.js';
import './components/skills-grid.js';
import './components/about-section.js';
import './components/certifications-section.js';
import './components/experience-section.js';
import './components/projects-section.js';
import './components/site-footer.js';
import './components/reveal-on-scroll.js';

// Deep links (e.g. /#projects): the browser tries to jump to the hash before
// the sections have rendered and have height, so redo it once they have.
async function scrollToHashOnLoad() {
  const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (!target) return;
  // On reload the browser would otherwise restore the old scroll position over ours.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const jump = () => target.scrollIntoView({ behavior: 'instant', block: 'start' });
  const sections = [...document.querySelectorAll('main > *')];
  await Promise.all(sections.map((el) => el.updateComplete));
  jump();
  // Images (headshot, cert badges) can shift layout; land precisely once everything's loaded.
  if (document.readyState !== 'complete') window.addEventListener('load', jump, { once: true });
}
scrollToHashOnLoad();

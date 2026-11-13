// Section tone: the header and gauge take their colours from the section under
// the header line. Every page marks its sections with data-tone (dark | graphite | paper).
//
// One scroll listener picks the last section whose top has passed the header
// line, from trigger positions ScrollTrigger caches on refresh (no layout reads
// while scrolling). Deterministic, unlike per-section toggles, whose callbacks
// can fire in any order on load.
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initTone(scope: ParentNode = document) {
  const body = document.body;
  const sections = [...scope.querySelectorAll<HTMLElement>('[data-tone]')];
  if (!sections.length) return () => {};
  const marks = sections.map(el => ScrollTrigger.create({ trigger: el, start: 'top 36px' }));
  const pick = () => {
    const y = window.scrollY;
    let tone = sections[0].dataset.tone;
    marks.forEach((m, i) => { if (y >= m.start) tone = sections[i].dataset.tone; });
    if (body.dataset.tone !== tone) body.dataset.tone = tone;
  };
  const master = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: pick, onRefresh: pick });
  pick();
  return () => {
    marks.forEach(t => t.kill());
    master.kill();
    delete body.dataset.tone;
  };
}

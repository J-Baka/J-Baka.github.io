import { LitElement, html, css } from 'lit';

/* Wraps content and fades/slides it in when scrolled into view.
   Respects prefers-reduced-motion (shows immediately). */
class RevealOnScroll extends LitElement {
  static properties = { visible: { state: true } };

  constructor() {
    super();
    this.visible = false;
  }

  firstUpdated() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      this.visible = true;
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            this.visible = true;
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(this);
  }

  static styles = css`
    :host {
      display: block;
      opacity: 0;
      transform: translateY(16px);
      transition: opacity 500ms var(--ease), transform 500ms var(--ease);
      will-change: opacity, transform;
    }
    :host([data-visible]) {
      opacity: 1;
      transform: none;
    }
  `;

  updated() {
    if (this.visible) this.setAttribute('data-visible', '');
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define('reveal-on-scroll', RevealOnScroll);

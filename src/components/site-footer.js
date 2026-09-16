import { LitElement, html, css } from 'lit';
import { profile } from '../data/content.js';

class SiteFooter extends LitElement {
  static styles = css`
    footer {
      border-top: 1px solid var(--border);
      background: var(--bg-elevated);
      padding: clamp(3rem, 6vw, 4.5rem) var(--gutter);
    }
    .inner {
      max-width: var(--content-width);
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      align-items: center;
      justify-content: space-between;
    }
    .cta h2 {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: var(--fw-black);
      letter-spacing: -0.02em;
      margin: 0 0 0.4rem;
    }
    .cta a.email {
      color: var(--accent);
      text-decoration: none;
      font-weight: var(--fw-semibold);
    }
    .cta a.email:hover {
      text-decoration: underline;
    }
    .socials {
      display: flex;
      gap: 0.6rem;
    }
    .socials a {
      display: grid;
      place-items: center;
      width: 46px;
      height: 46px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      transition: transform var(--transition), border-color var(--transition), color var(--transition);
    }
    .socials a:hover {
      transform: translateY(-2px);
      border-color: var(--accent);
      color: var(--accent);
    }
    .socials svg {
      width: 22px;
      height: 22px;
    }
    .legal {
      max-width: var(--content-width);
      margin: 2.5rem auto 0;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      color: var(--text-muted);
      font-size: var(--fs-small);
    }
  `;

  render() {
    const p = profile;
    return html`
      <footer>
        <div class="inner">
          <div class="cta">
            <h2>Let's build something.</h2>
            <a class="email" href="mailto:${p.email}">${p.email}</a>
          </div>
          <div class="socials">
            <a href=${p.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.5 8h4V24h-4zM8 8h3.8v2.2h.05c.53-1 1.83-2.2 3.77-2.2 4.03 0 4.78 2.65 4.78 6.1V24h-4v-6.9c0-1.65-.03-3.77-2.3-3.77-2.3 0-2.65 1.8-2.65 3.65V24H8z"/></svg>
            </a>
            <a href=${p.github} target="_blank" rel="noopener" aria-label="GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.4-1.27.73-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.28 5.69.41.36.78 1.05.78 2.12v3.15c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z"/></svg>
            </a>
            <a href="mailto:${p.email}" aria-label="Email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
            </a>
          </div>
        </div>
        <p class="legal">© ${new Date().getFullYear()} ${p.name}. Built with Lit &amp; Vite.</p>
      </footer>
    `;
  }
}

customElements.define('site-footer', SiteFooter);

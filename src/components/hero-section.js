import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../styles/shared.js';
import { profile } from '../data/content.js';

class HeroSection extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .hero {
        display: grid;
        gap: clamp(2rem, 5vw, 4rem);
        align-items: center;
        padding-top: clamp(3rem, 7vw, 5rem);
        padding-bottom: clamp(3rem, 7vw, 5rem);
      }
      @media (min-width: 820px) {
        .hero {
          grid-template-columns: 1.4fr 1fr;
        }
      }
      .status {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--fs-small);
        color: var(--text-muted);
        background: var(--surface);
        border: 1px solid var(--border);
        padding: 0.4rem 0.8rem;
        border-radius: 999px;
        margin-bottom: 1.5rem;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
      }
      h1 {
        font-size: var(--fs-display);
        line-height: 1.03;
        letter-spacing: -0.03em;
        font-weight: var(--fw-black);
        margin: 0 0 0.5rem;
      }
      .role {
        display: block;
        color: var(--accent);
      }
      .tagline {
        color: var(--text-muted);
        font-size: 1.15rem;
        max-width: 52ch;
        margin: 0 0 2rem;
      }
      .cta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.8rem 1.4rem;
        border-radius: var(--radius-sm);
        font-weight: var(--fw-semibold);
        font-size: var(--fs-small);
        text-decoration: none;
        cursor: pointer;
        transition: transform var(--transition), background var(--transition), border-color var(--transition);
      }
      .btn svg {
        width: 18px;
        height: 18px;
      }
      .btn-primary {
        background: var(--accent);
        color: var(--accent-contrast);
        border: 1px solid var(--accent);
      }
      .btn-primary:hover {
        background: var(--accent-strong);
        transform: translateY(-2px);
      }
      .btn-ghost {
        background: transparent;
        color: var(--text);
        border: 1px solid var(--border);
      }
      .btn-ghost:hover {
        border-color: var(--accent);
        color: var(--accent);
        transform: translateY(-2px);
      }
      .portrait {
        justify-self: center;
        position: relative;
      }
      .portrait img {
        width: min(320px, 72vw);
        aspect-ratio: 1;
        object-fit: cover;
        border-radius: 20px;
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
      }
      .portrait::after {
        content: '';
        position: absolute;
        inset: -18px -18px auto auto;
        width: 140px;
        height: 140px;
        background: radial-gradient(circle at 30% 30%, var(--accent-tint), transparent 70%);
        border-radius: 50%;
        z-index: -1;
      }
    `,
  ];

  render() {
    const p = profile;
    return html`
      <section class="section container hero" aria-labelledby="hero-name">
        <div>
          <span class="status"><span class="dot"></span> Open to Salesforce opportunities</span>
          <h1 id="hero-name">
            ${p.name}
            <span class="role">${p.role}</span>
          </h1>
          <p class="tagline">${p.tagline}</p>
          <div class="cta">
            <a class="btn btn-primary" href="mailto:${p.email}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/></svg>
              Get in touch
            </a>
            ${p.resume
              ? html`<a class="btn btn-ghost" href=${p.resume} download>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"/></svg>
                  Résumé
                </a>`
              : ''}
            <a class="btn btn-ghost" href=${p.linkedin} target="_blank" rel="noopener">LinkedIn</a>
          </div>
        </div>
        <div class="portrait">
          <img src=${p.headshot} alt="Portrait of ${p.name}" />
        </div>
      </section>
    `;
  }
}

customElements.define('hero-section', HeroSection);

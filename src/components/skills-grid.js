import { LitElement, html, css, svg } from 'lit';
import { sharedStyles } from '../styles/shared.js';
import { skills } from '../data/content.js';

const ICONS = {
  code: svg`<path d="m8 6-6 6 6 6M16 6l6 6-6 6"/>`,
  component: svg`<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>`,
  flow: svg`<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M6 8.5v4A3.5 3.5 0 0 0 9.5 16H16"/>`,
  plug: svg`<path d="M9 2v6M15 2v6M7 8h10v3a5 5 0 0 1-10 0zM12 16v6"/>`,
  data: svg`<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>`,
  devops: svg`<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>`,
};

class SkillsGrid extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      }
      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 1.5rem;
        transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
      }
      .card:hover {
        transform: translateY(-4px);
        border-color: var(--accent);
        box-shadow: var(--shadow);
      }
      .icon {
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
        border-radius: 11px;
        background: var(--accent-tint);
        color: var(--accent);
        margin-bottom: 1rem;
      }
      .icon svg {
        width: 24px;
        height: 24px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      h3 {
        font-size: var(--fs-h3);
        margin: 0 0 0.75rem;
        font-weight: var(--fw-bold);
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      li {
        font-size: var(--fs-small);
        color: var(--text-muted);
        padding-left: 1.25rem;
        position: relative;
      }
      li::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.55em;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--accent);
      }
    `,
  ];

  render() {
    return html`
      <section class="section container" aria-labelledby="skills-h">
        <p class="eyebrow">What I do</p>
        <h2 id="skills-h">Skills &amp; capabilities</h2>
        <p class="lead">The Salesforce toolkit I bring to a team — from Apex and LWC to automation, integrations, and delivery.</p>
        <div class="grid">
          ${skills.map(
            (s) => html`
              <reveal-on-scroll>
                <article class="card">
                  <div class="icon">
                    <svg viewBox="0 0 24 24">${ICONS[s.icon] ?? ICONS.code}</svg>
                  </div>
                  <h3>${s.title}</h3>
                  <ul>
                    ${s.items.map((i) => html`<li>${i}</li>`)}
                  </ul>
                </article>
              </reveal-on-scroll>
            `
          )}
        </div>
      </section>
    `;
  }
}

customElements.define('skills-grid', SkillsGrid);

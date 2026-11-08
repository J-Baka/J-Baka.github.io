import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../styles/shared.js';
import { projects } from '../data/content.js';
import './property-map-demo.js';
import './storefront-demo.js';

class ProjectsSection extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }
      .card {
        display: flex;
        flex-direction: column;
        padding: 1.75rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
      }
      .card:hover {
        transform: translateY(-4px);
        border-color: var(--accent);
        box-shadow: var(--shadow);
      }
      h3 {
        font-size: var(--fs-h3);
        margin: 0 0 0.75rem;
        font-weight: var(--fw-bold);
      }
      .summary {
        color: var(--text-muted);
        font-size: var(--fs-small);
        margin: 0 0 1.25rem;
        flex: 1;
      }
      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-bottom: 1.25rem;
      }
      .tag {
        font-family: var(--ff-mono);
        font-size: 0.75rem;
        padding: 0.25rem 0.6rem;
        border-radius: 999px;
        background: var(--accent-tint);
        color: var(--accent);
      }
      .links {
        display: flex;
        gap: 1rem;
      }
      .links a {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: var(--fs-small);
        font-weight: var(--fw-semibold);
        text-decoration: none;
      }
      .links a:hover {
        text-decoration: underline;
      }
      .links svg {
        width: 16px;
        height: 16px;
      }
      .featured {
        display: grid;
        gap: 1.75rem;
        padding: clamp(1.25rem, 3vw, 2rem);
        margin-bottom: 1.5rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
      }
      .featured > * {
        min-width: 0; /* let wide demo content scroll inside instead of stretching the card */
      }
      .featured h3 {
        font-size: clamp(1.3rem, 2.4vw, 1.6rem);
        margin: 0 0 0.35rem;
      }
      .context {
        color: var(--text-muted);
        font-size: var(--fs-small);
        margin: 0 0 1rem;
      }
      .story {
        display: grid;
        gap: 1.25rem 2rem;
        grid-template-columns: 1fr 1fr;
      }
      @media (max-width: 640px) {
        .story {
          grid-template-columns: 1fr;
        }
      }
      .story h4 {
        font-family: var(--ff-mono);
        font-size: 0.75rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent);
        margin: 0 0 0.5rem;
      }
      .story p,
      .story ul {
        margin: 0;
        color: var(--text-muted);
        font-size: var(--fs-small);
        line-height: 1.6;
      }
      .story ul {
        padding-left: 1.1rem;
      }
      .story li + li {
        margin-top: 0.35rem;
      }
      .approach {
        grid-column: 1 / -1;
      }
      .demo-label {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 0.25rem 0.75rem;
        margin: 0 0 0.75rem;
        font-size: var(--fs-small);
        color: var(--text-muted);
      }
      .demo-label strong {
        color: var(--text);
      }
      .live {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-family: var(--ff-mono);
        font-size: 0.7rem;
        font-weight: var(--fw-semibold);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #1f9d55;
      }
      .live::before {
        content: '';
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: currentColor;
      }
    `,
  ];

  renderDemo(name) {
    switch (name) {
      case 'property-map':
        return html`<property-map-demo></property-map-demo>`;
      case 'storefront':
        return html`<storefront-demo></storefront-demo>`;
      default:
        return '';
    }
  }

  renderFeatured(p) {
    return html`
      <reveal-on-scroll>
        <article class="featured">
          <div>
            <h3>${p.title}</h3>
            ${p.context ? html`<p class="context">${p.context}</p>` : ''}
            <div class="tags">${p.tags.map((t) => html`<span class="tag">${t}</span>`)}</div>
            <div class="story">
              <div>
                <h4>Problem</h4>
                <p>${p.problem}</p>
              </div>
              <div>
                <h4>Result</h4>
                <p>${p.result}</p>
              </div>
              <div class="approach">
                <h4>What I built</h4>
                <ul>${p.approach.map((a) => html`<li>${a}</li>`)}</ul>
              </div>
            </div>
          </div>
          <div>
            <p class="demo-label"><span class="live">Live demo</span><strong>Try it:</strong> ${p.demoNote}</p>
            ${this.renderDemo(p.liveDemo)}
          </div>
        </article>
      </reveal-on-scroll>
    `;
  }

  render() {
    return html`
      <section class="section container" id="projects" aria-labelledby="proj-h">
        <p class="eyebrow">Selected work</p>
        <h2 id="proj-h">Case studies</h2>
        <p class="lead">Problem, approach, result — the way I think about delivery on the platform.</p>
        ${projects.filter((p) => p.liveDemo).map((p) => this.renderFeatured(p))}
        <div class="grid">
          ${projects.filter((p) => !p.liveDemo).map(
            (p) => html`
              <reveal-on-scroll>
                <article class="card">
                  <h3>${p.title}</h3>
                  <p class="summary">${p.summary}</p>
                  <div class="tags">${p.tags.map((t) => html`<span class="tag">${t}</span>`)}</div>
                  ${p.repo || p.demo
                    ? html`<div class="links">
                        ${p.repo ? html`<a href=${p.repo} target="_blank" rel="noopener">Code ↗</a>` : ''}
                        ${p.demo ? html`<a href=${p.demo} target="_blank" rel="noopener">Live demo ↗</a>` : ''}
                      </div>`
                    : ''}
                </article>
              </reveal-on-scroll>
            `
          )}
        </div>
      </section>
    `;
  }
}

customElements.define('projects-section', ProjectsSection);

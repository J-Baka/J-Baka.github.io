import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../styles/shared.js';
import { projects } from '../data/content.js';

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
      .note {
        margin-top: 2rem;
        padding: 1.25rem 1.5rem;
        border: 1px dashed var(--border);
        border-radius: var(--radius);
        color: var(--text-muted);
        font-size: var(--fs-small);
      }
    `,
  ];

  render() {
    return html`
      <section class="section container" id="projects" aria-labelledby="proj-h">
        <p class="eyebrow">Selected work</p>
        <h2 id="proj-h">Case studies</h2>
        <p class="lead">Problem, approach, result — the way I think about delivery on the platform.</p>
        <div class="grid">
          ${projects.map(
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
        <p class="note">
          💡 Next step: we can embed a live Lightning-Web-Component-style demo right here — an interactive
          component that proves the skill, not just a screenshot.
        </p>
      </section>
    `;
  }
}

customElements.define('projects-section', ProjectsSection);

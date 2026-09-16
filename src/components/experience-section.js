import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../styles/shared.js';
import { experience } from '../data/content.js';

class ExperienceSection extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .wrap {
        background: var(--bg-elevated);
        border-top: 1px solid var(--border);
        border-bottom: 1px solid var(--border);
      }
      .timeline {
        position: relative;
        display: grid;
        gap: 1rem;
      }
      .item {
        position: relative;
        padding: 1.75rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        border-left: 3px solid var(--accent);
      }
      .top {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: baseline;
        gap: 0.5rem 1rem;
        margin-bottom: 1rem;
      }
      .role {
        font-size: var(--fs-h3);
        font-weight: var(--fw-bold);
        margin: 0;
      }
      .company {
        color: var(--accent);
        font-weight: var(--fw-semibold);
      }
      .period {
        font-family: var(--ff-mono);
        font-size: var(--fs-small);
        color: var(--text-muted);
        white-space: nowrap;
      }
      ul {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 0.6rem;
      }
      li {
        position: relative;
        padding-left: 1.5rem;
        color: var(--text-muted);
        font-size: var(--fs-small);
      }
      li::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.6em;
        width: 7px;
        height: 7px;
        border-radius: 2px;
        background: var(--accent);
      }
    `,
  ];

  render() {
    return html`
      <div class="wrap">
        <section class="section container" id="experience" aria-labelledby="exp-h">
          <p class="eyebrow">Career</p>
          <h2 id="exp-h">Experience</h2>
          <p class="lead">Where I've delivered on the platform.</p>
          <div class="timeline">
            ${experience.map(
              (job) => html`
                <reveal-on-scroll>
                  <article class="item">
                    <div class="top">
                      <h3 class="role">${job.role} · <span class="company">${job.company}</span></h3>
                      <span class="period">${job.period}</span>
                    </div>
                    <ul>
                      ${job.bullets.map((b) => html`<li>${b}</li>`)}
                    </ul>
                  </article>
                </reveal-on-scroll>
              `
            )}
          </div>
        </section>
      </div>
    `;
  }
}

customElements.define('experience-section', ExperienceSection);

import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../styles/shared.js';
import { about, profile } from '../data/content.js';

class AboutSection extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .wrap {
        background: var(--bg-elevated);
        border-top: 1px solid var(--border);
        border-bottom: 1px solid var(--border);
      }
      .grid {
        display: grid;
        gap: clamp(1.5rem, 4vw, 3rem);
        align-items: start;
      }
      @media (min-width: 780px) {
        .grid {
          grid-template-columns: 1fr 1.6fr;
        }
      }
      p {
        margin: 0 0 1.1rem;
        color: var(--text-muted);
      }
      p:first-of-type {
        color: var(--text);
        font-size: 1.15rem;
      }
      .facts {
        list-style: none;
        margin: 1.5rem 0 0;
        padding: 0;
        display: grid;
        gap: 0.75rem;
      }
      .facts li {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-size: var(--fs-small);
        color: var(--text-muted);
      }
      .facts svg {
        width: 18px;
        height: 18px;
        color: var(--accent);
        flex: none;
      }
    `,
  ];

  render() {
    return html`
      <div class="wrap">
        <section class="section container" aria-labelledby="about-h">
          <div class="grid">
            <div>
              <p class="eyebrow">About me</p>
              <h2 id="about-h">${about.intro}</h2>
              <ul class="facts">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                  ${profile.yearsExperience}+ years on the Salesforce platform
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.4-7-10a7 7 0 0 1 14 0c0 5.6-7 10-7 10z"/><circle cx="12" cy="11" r="2.5"/></svg>
                  ${profile.location}
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m22 4-10 10-3-3"/></svg>
                  Certified Salesforce Developer
                </li>
              </ul>
            </div>
            <div>
              ${about.paragraphs.map((para) => html`<p>${para}</p>`)}
            </div>
          </div>
        </section>
      </div>
    `;
  }
}

customElements.define('about-section', AboutSection);

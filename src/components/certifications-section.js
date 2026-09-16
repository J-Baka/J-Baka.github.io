import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../styles/shared.js';
import { certifications, profile } from '../data/content.js';

class CertificationsSection extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }
      .cert {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 0.9rem;
        padding: 1.5rem 1rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        text-decoration: none;
        color: var(--text);
        transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
      }
      a.cert:hover {
        transform: translateY(-4px);
        border-color: var(--accent);
        box-shadow: var(--shadow);
      }
      .badge {
        width: 92px;
        height: 92px;
        object-fit: contain;
      }
      /* Fallback shown when a badge image is missing */
      .badge-fallback {
        display: grid;
        place-items: center;
        width: 92px;
        height: 92px;
        border-radius: 50%;
        background: var(--accent-tint);
        color: var(--accent);
      }
      .badge-fallback svg {
        width: 40px;
        height: 40px;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.5;
      }
      .name {
        font-size: var(--fs-small);
        font-weight: var(--fw-semibold);
        line-height: 1.3;
      }
      .trailhead-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 2rem;
        font-weight: var(--fw-semibold);
        font-size: var(--fs-small);
        text-decoration: none;
      }
      .trailhead-link:hover {
        text-decoration: underline;
      }
    `,
  ];

  _onImgError(e) {
    const img = e.target;
    const fallback = img.nextElementSibling;
    img.style.display = 'none';
    if (fallback) fallback.style.display = 'grid';
  }

  renderCert(c) {
    const inner = html`
      <img class="badge" src=${c.logo} alt=${c.name + ' badge'} @error=${this._onImgError} />
      <span class="badge-fallback" style="display:none" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/><path d="m8.5 13.5-2 7L12 18l5.5 2.5-2-7"/></svg>
      </span>
      <span class="name">${c.name}</span>
    `;
    return c.url
      ? html`<a class="cert" href=${c.url} target="_blank" rel="noopener">${inner}</a>`
      : html`<div class="cert">${inner}</div>`;
  }

  render() {
    return html`
      <section class="section container" id="certifications" aria-labelledby="certs-h">
        <p class="eyebrow">Credentials</p>
        <h2 id="certs-h">Certifications</h2>
        <p class="lead">Salesforce certifications I've earned — verified on Trailhead.</p>
        <div class="grid">
          ${certifications.map((c) => this.renderCert(c))}
        </div>
        ${profile.trailhead
          ? html`<a class="trailhead-link" href=${profile.trailhead} target="_blank" rel="noopener">
              View my Trailblazer profile
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 17 17 7M8 7h9v9"/></svg>
            </a>`
          : ''}
      </section>
    `;
  }
}

customElements.define('certifications-section', CertificationsSection);

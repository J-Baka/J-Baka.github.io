import { LitElement, html, css } from 'lit';

const NAV = [
  { href: '#skills', label: 'Skills' },
  { href: '#about', label: 'About' },
  { href: '#certifications', label: 'Certifications' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Work' },
];

class SiteHeader extends LitElement {
  static properties = { open: { state: true }, scrolled: { state: true } };

  constructor() {
    super();
    this.open = false;
    this.scrolled = false;
    this._onScroll = () => {
      this.scrolled = window.scrollY > 8;
    };
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('scroll', this._onScroll, { passive: true });
  }
  disconnectedCallback() {
    window.removeEventListener('scroll', this._onScroll);
    super.disconnectedCallback();
  }

  close() {
    this.open = false;
  }

  static styles = css`
    header {
      position: sticky;
      top: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.85rem var(--gutter);
      background: color-mix(in srgb, var(--bg) 82%, transparent);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid transparent;
      transition: border-color var(--transition), background var(--transition);
    }
    header.scrolled {
      border-bottom-color: var(--border);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-weight: var(--fw-bold);
      color: var(--text);
      text-decoration: none;
      letter-spacing: -0.01em;
    }
    .mark {
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border-radius: 9px;
      background: var(--accent);
      color: var(--accent-contrast);
      font-weight: var(--fw-black);
      font-size: 0.95rem;
    }
    nav {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .links {
      display: flex;
      gap: 0.25rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .links a {
      display: inline-block;
      padding: 0.5rem 0.85rem;
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      text-decoration: none;
      font-size: var(--fs-small);
      font-weight: var(--fw-medium);
      transition: color var(--transition), background var(--transition);
    }
    .links a:hover {
      color: var(--text);
      background: var(--accent-tint);
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .toggle {
      display: none;
      width: 42px;
      height: 42px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
    }
    .toggle svg {
      width: 22px;
      height: 22px;
    }
    @media (max-width: 760px) {
      .toggle {
        display: inline-grid;
        place-items: center;
      }
      .links {
        position: fixed;
        inset: 62px 0 auto 0;
        flex-direction: column;
        gap: 0;
        background: var(--bg-elevated);
        border-bottom: 1px solid var(--border);
        padding: 0.5rem var(--gutter) 1rem;
        transform: translateY(-120%);
        transition: transform 280ms var(--ease);
        box-shadow: var(--shadow);
      }
      .links.open {
        transform: translateY(0);
      }
      .links a {
        padding: 0.85rem 0.5rem;
        font-size: 1rem;
      }
    }
  `;

  render() {
    return html`
      <header class=${this.scrolled ? 'scrolled' : ''}>
        <a class="brand" href="#main" @click=${this.close}>
          <span class="mark">MH</span>
          <span>Matt Hernandez</span>
        </a>
        <nav>
          <ul class="links ${this.open ? 'open' : ''}">
            ${NAV.map(
              (n) => html`<li><a href=${n.href} @click=${this.close}>${n.label}</a></li>`
            )}
          </ul>
          <div class="actions">
            <theme-toggle></theme-toggle>
            <button
              class="toggle"
              aria-label="Toggle navigation"
              aria-expanded=${this.open}
              @click=${() => (this.open = !this.open)}
            >
              ${this.open
                ? html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`
                : html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`}
            </button>
          </div>
        </nav>
      </header>
    `;
  }
}

customElements.define('site-header', SiteHeader);

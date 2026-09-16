import { LitElement, html, css } from 'lit';

const STORAGE_KEY = 'portfolio-theme';

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function store(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage unavailable (private mode) — theme still applies for this session */
  }
}

function systemPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Apply any stored preference immediately so there's no flash.
(function initTheme() {
  const stored = readStored();
  if (stored === 'light' || stored === 'dark') {
    document.documentElement.setAttribute('data-theme', stored);
  }
})();

class ThemeToggle extends LitElement {
  static properties = { theme: { state: true } };

  constructor() {
    super();
    const stored = readStored();
    this.theme = stored === 'light' || stored === 'dark' ? stored : systemPrefersDark() ? 'dark' : 'light';
  }

  toggle() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    store(this.theme);
  }

  static styles = css`
    button {
      display: inline-grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
      transition: background var(--transition), border-color var(--transition), transform var(--transition);
    }
    button:hover {
      border-color: var(--accent);
      transform: translateY(-1px);
    }
    svg {
      width: 20px;
      height: 20px;
    }
  `;

  render() {
    const isDark = this.theme === 'dark';
    return html`
      <button
        @click=${this.toggle}
        aria-label=${isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        title=${isDark ? 'Light mode' : 'Dark mode'}
      >
        ${isDark
          ? html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>`
          : html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>`}
      </button>
    `;
  }
}

customElements.define('theme-toggle', ThemeToggle);

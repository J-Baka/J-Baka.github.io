import { LitElement, html, css } from 'lit';
import { pubsub } from '../lib/pubsub.js';
import { icons } from '../data/storefront-catalog.js';

/* =============================================================
   FlexCard-style product card.
   - Card "states": default / in-request / out-of-stock / low stock
   - Card "actions": fire pubsub events the OmniScript listens for
   - Listens back on the same channel so it knows what's in the
     request without the parent passing it down (two-way pubsub)
   ============================================================= */

export const CHANNEL = 'storefront';

class StoreCard extends LitElement {
  static properties = {
    item: { attribute: false },
    inRequest: { state: true },
    focused: { state: true },
  };

  constructor() {
    super();
    this.inRequest = false;
    this.focused = false;
    this.handlers = {
      requestupdated: ({ itemIds }) => (this.inRequest = itemIds.includes(this.item.id)),
      itemfocus: ({ id }) => (this.focused = id === this.item.id),
    };
  }

  connectedCallback() {
    super.connectedCallback();
    pubsub.register(CHANNEL, this.handlers);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    pubsub.unregister(CHANNEL, this.handlers);
  }

  get state() {
    if (this.item.stock === 0) return 'out';
    if (this.inRequest) return 'added';
    return 'default';
  }

  showDetails() {
    pubsub.fire(CHANNEL, 'itemfocus', { id: this.item.id });
  }

  toggle(e) {
    e.stopPropagation();
    const { id, name, price } = this.item;
    pubsub.fire(CHANNEL, this.inRequest ? 'itemremoved' : 'itemselected', { id, name, price });
  }

  static styles = css`
    :host {
      display: block;
    }
    .card {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.4rem 0.8rem;
      height: 100%;
      box-sizing: border-box;
      padding: 0.9rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--surface);
      cursor: pointer;
      transition: border-color var(--transition), box-shadow var(--transition);
    }
    .card:hover {
      border-color: var(--accent);
    }
    .card.focused {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px var(--accent);
    }
    .card.out {
      opacity: 0.65;
    }
    .icon {
      grid-row: span 2;
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: var(--accent-tint);
      color: var(--accent);
    }
    .icon svg {
      width: 22px;
      height: 22px;
    }
    h4 {
      margin: 0;
      font-size: 0.9375rem;
      font-weight: var(--fw-semibold);
      line-height: 1.3;
    }
    .meta {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .row {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-top: 0.4rem;
    }
    .price {
      font-weight: var(--fw-bold);
    }
    .badge {
      font-size: 0.6875rem;
      font-weight: var(--fw-semibold);
      padding: 0.1rem 0.45rem;
      border-radius: 999px;
      margin-left: 0.35rem;
      vertical-align: 1px;
    }
    .badge.low {
      background: rgba(242, 139, 0, 0.15);
      color: #b86a00;
    }
    .badge.out {
      background: rgba(214, 69, 69, 0.14);
      color: #c23b3b;
    }
    button {
      font: inherit;
      font-size: 0.8125rem;
      font-weight: var(--fw-semibold);
      height: 32px;
      padding: 0 0.8rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--accent);
      background: var(--accent);
      color: var(--accent-contrast);
      cursor: pointer;
    }
    button:hover {
      background: var(--accent-strong);
    }
    button.added {
      background: transparent;
      color: var(--accent);
    }
    button[disabled] {
      background: transparent;
      border-color: var(--border);
      color: var(--text-muted);
      cursor: not-allowed;
    }
    button:focus-visible,
    .card:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
  `;

  render() {
    const { name, category, price, stock, icon } = this.item;
    const state = this.state;
    return html`
      <article
        class="card ${state} ${this.focused ? 'focused' : ''}"
        tabindex="0"
        aria-label="${name}, view details"
        @click=${this.showDetails}
        @keydown=${(e) => (e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget && (e.preventDefault(), this.showDetails())}
      >
        <div class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d=${icons[icon]} />
          </svg>
        </div>
        <h4>${name}</h4>
        <div class="meta">
          ${category}
          ${stock === 0
            ? html`<span class="badge out">Out of stock</span>`
            : stock <= 3
              ? html`<span class="badge low">Only ${stock} left</span>`
              : ''}
        </div>
        <div class="row">
          <span class="price">$${price.toLocaleString()}</span>
          <button
            class=${state}
            ?disabled=${state === 'out'}
            aria-pressed=${state === 'added' ? 'true' : 'false'}
            @click=${this.toggle}
          >
            ${state === 'out' ? 'Unavailable' : state === 'added' ? '✓ Added' : 'Add'}
          </button>
        </div>
      </article>
    `;
  }
}

customElements.define('store-card', StoreCard);

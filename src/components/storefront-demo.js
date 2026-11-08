import { LitElement, html, css } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { pubsub } from '../lib/pubsub.js';
import { catalog } from '../data/storefront-catalog.js';
import { CHANNEL } from './store-card.js';
import './store-card.js';

/* =============================================================
   Live demo: an OmniScript-style guided order flow whose first
   step is a storefront of FlexCard-style product cards.

   The cards and the script never call each other directly. Cards
   fire pubsub events ('itemfocus', 'itemselected', 'itemremoved');
   the script registers for them, writes the selection into its
   data JSON, and fires 'requestupdated' back so cards can show
   their "added" state. The panels under the demo show the data
   JSON and every pubsub message as it happens.
   ============================================================= */

const STEPS = ['Browse', 'Configure', 'Review', 'Confirm'];
const TAX_RATE = 0.08;
const MAX_QTY = 5;
const LOG_SIZE = 8;

const money = (n) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const byId = (id) => catalog.find((c) => c.id === id);

class StorefrontDemo extends LitElement {
  static properties = {
    step: { state: true },
    focusId: { state: true },
    lines: { state: true },
    orderNumber: { state: true },
    log: { state: true },
  };

  constructor() {
    super();
    this.step = 0;
    this.focusId = null;
    this.lines = []; // [{ id, name, price, quantity, option }]
    this.orderNumber = null;
    this.log = [];
    this.seq = 0;

    // What the OmniScript registers for on the channel.
    this.handlers = {
      itemfocus: ({ id }) => (this.focusId = id),
      itemselected: ({ id, name, price }) => {
        if (this.lines.some((l) => l.id === id)) return;
        const item = byId(id);
        this.setLines([...this.lines, { id, name, price, quantity: 1, option: item.options?.values[0] ?? null }]);
      },
      itemremoved: ({ id }) => this.setLines(this.lines.filter((l) => l.id !== id)),
    };
  }

  connectedCallback() {
    super.connectedCallback();
    pubsub.register(CHANNEL, this.handlers);
    this.untap = pubsub.tap((msg) => {
      this.log = [{ ...msg, n: ++this.seq }, ...this.log].slice(0, LOG_SIZE);
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    pubsub.unregister(CHANNEL, this.handlers);
    this.untap?.();
  }

  setLines(lines) {
    this.lines = lines;
    // Tell every card what's in the request now.
    pubsub.fire(CHANNEL, 'requestupdated', { itemIds: lines.map((l) => l.id) });
  }

  updateLine(id, patch) {
    this.lines = this.lines.map((l) => (l.id === id ? { ...l, ...patch } : l));
  }

  get totals() {
    const subtotal = this.lines.reduce((s, l) => s + l.price * l.quantity, 0);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    return { subtotal, tax, total: subtotal + tax };
  }

  // The OmniScript-shaped data JSON: one node per step.
  get dataJson() {
    const { subtotal, tax, total } = this.totals;
    const json = {
      ContextId: '003DEMO00000001',
      Browse: { SelectedItems: this.lines.map(({ id, name, price }) => ({ Id: id, Name: name, UnitPrice: price })) },
    };
    if (this.step >= 1) json.Configure = { LineItems: this.lines.map((l) => ({ Id: l.id, Quantity: l.quantity, Option: l.option })) };
    if (this.step >= 2) json.Review = { Subtotal: subtotal, Tax: tax, Total: total };
    if (this.orderNumber) json.Confirm = { RequestNumber: this.orderNumber, Status: 'Submitted' };
    return json;
  }

  canAdvance() {
    if (this.step === 0 || this.step === 1) return this.lines.length > 0;
    return true;
  }

  go(step) {
    this.step = step;
    this.renderRoot.querySelector('.stage')?.focus({ preventScroll: true });
  }

  submit() {
    this.orderNumber = `REQ-${String(10000 + Math.floor(Math.random() * 90000))}`;
    this.go(3);
  }

  startOver() {
    this.orderNumber = null;
    this.focusId = null;
    this.setLines([]);
    pubsub.fire(CHANNEL, 'itemfocus', { id: null });
    this.go(0);
  }

  static styles = css`
    :host {
      display: block;
    }
    .frame {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
      overflow: hidden;
    }

    /* Step chart */
    ol.steps {
      display: flex;
      margin: 0;
      padding: 0.9rem 1rem;
      list-style: none;
      gap: 0.25rem;
      background: var(--bg-elevated);
      border-bottom: 1px solid var(--border);
      overflow-x: auto;
    }
    .steps li {
      flex: 1 1 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: max-content;
      font-size: var(--fs-small);
      color: var(--text-muted);
    }
    .steps li:not(:last-child)::after {
      content: '';
      flex: 1;
      min-width: 0.75rem;
      height: 2px;
      background: var(--border);
      margin: 0 0.25rem;
    }
    .steps li.done:not(:last-child)::after {
      background: var(--accent);
    }
    .num {
      display: grid;
      place-items: center;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 2px solid var(--border);
      font-size: 0.75rem;
      font-weight: var(--fw-bold);
      flex: none;
    }
    .steps li.current {
      color: var(--text);
      font-weight: var(--fw-semibold);
    }
    .steps li.current .num {
      border-color: var(--accent);
      color: var(--accent);
    }
    .steps li.done .num {
      background: var(--accent);
      border-color: var(--accent);
      color: var(--accent-contrast);
    }
    .steps button {
      all: unset;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .steps button:hover .label {
      text-decoration: underline;
    }
    .steps button:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 3px;
      border-radius: 4px;
    }

    .stage {
      padding: 1rem;
      outline: none;
    }
    h4.step-title {
      margin: 0 0 0.85rem;
      font-size: 1rem;
    }

    /* Browse */
    .browse {
      display: grid;
      gap: 1rem;
      grid-template-columns: minmax(0, 1fr) 260px;
    }
    .cards {
      display: grid;
      gap: 0.6rem;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
    aside {
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 1rem;
      background: var(--bg-elevated);
      font-size: var(--fs-small);
      align-self: start;
    }
    aside h5 {
      margin: 0 0 0.25rem;
      font-size: 1rem;
    }
    aside p {
      color: var(--text-muted);
      margin: 0.5rem 0;
      line-height: 1.55;
    }
    aside dl {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.25rem 0.75rem;
      margin: 0.75rem 0;
    }
    aside dt {
      color: var(--text-muted);
    }
    aside dd {
      margin: 0;
      font-weight: var(--fw-medium);
    }
    .empty {
      color: var(--text-muted);
      text-align: center;
      padding: 1.5rem 0.5rem;
    }
    .count {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border);
      color: var(--text-muted);
    }

    /* Configure / Review */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--fs-small);
    }
    th,
    td {
      text-align: left;
      padding: 0.6rem 0.5rem;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    th {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      font-weight: var(--fw-semibold);
    }
    td.num-col,
    th.num-col {
      text-align: right;
      white-space: nowrap;
    }
    .table-wrap {
      overflow-x: auto;
    }
    tfoot td {
      border-bottom: none;
      padding-top: 0.35rem;
      padding-bottom: 0.35rem;
    }
    tfoot tr.total td {
      font-weight: var(--fw-bold);
      font-size: 0.9375rem;
      border-top: 2px solid var(--border);
    }
    .qty {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }
    .qty button {
      width: 30px;
      height: 30px;
      border: none;
      background: var(--bg-elevated);
      color: var(--text);
      cursor: pointer;
      font-size: 1rem;
    }
    .qty button[disabled] {
      color: var(--text-muted);
      cursor: not-allowed;
    }
    .qty output {
      min-width: 28px;
      text-align: center;
      font-weight: var(--fw-semibold);
    }
    select {
      font: inherit;
      font-size: var(--fs-small);
      height: 32px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      padding: 0 0.5rem;
    }
    .link {
      all: unset;
      cursor: pointer;
      color: var(--accent);
      font-size: 0.8125rem;
      font-weight: var(--fw-semibold);
    }
    .link:hover {
      text-decoration: underline;
    }

    /* Confirm */
    .done-panel {
      text-align: center;
      padding: 2rem 1rem;
    }
    .check {
      display: inline-grid;
      place-items: center;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: rgba(31, 157, 85, 0.14);
      color: #1f9d55;
      margin-bottom: 0.75rem;
    }
    .done-panel h4 {
      margin: 0 0 0.35rem;
      font-size: 1.125rem;
    }
    .done-panel p {
      color: var(--text-muted);
      margin: 0 0 1.25rem;
    }
    code {
      font-family: var(--ff-mono);
      color: var(--text);
    }

    /* Nav buttons */
    .nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      border-top: 1px solid var(--border);
    }
    .hint {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }
    .btn {
      font: inherit;
      font-size: var(--fs-small);
      font-weight: var(--fw-semibold);
      height: 38px;
      padding: 0 1.1rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--accent);
      background: var(--accent);
      color: var(--accent-contrast);
      cursor: pointer;
    }
    .btn:hover {
      background: var(--accent-strong);
    }
    .btn.secondary {
      background: transparent;
      color: var(--accent);
    }
    .btn.secondary:hover {
      background: var(--accent-tint);
    }
    .btn[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn:focus-visible,
    select:focus-visible,
    .qty button:focus-visible,
    .link:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }

    /* Under the hood */
    .hood {
      display: grid;
      gap: 0.75rem;
      grid-template-columns: 1fr 1fr;
      margin-top: 0.75rem;
    }
    .panel {
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--surface);
      min-width: 0;
    }
    .panel h5 {
      margin: 0;
      padding: 0.6rem 0.85rem;
      border-bottom: 1px solid var(--border);
      font-family: var(--ff-mono);
      font-size: 0.7rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--accent);
    }
    pre {
      margin: 0;
      padding: 0.75rem 0.85rem;
      height: 240px;
      overflow: auto;
      font-family: var(--ff-mono);
      font-size: 0.75rem;
      line-height: 1.5;
      color: var(--text);
    }
    ul.log {
      list-style: none;
      margin: 0;
      padding: 0.35rem 0;
      height: 248px;
      overflow: auto;
      font-family: var(--ff-mono);
      font-size: 0.72rem;
    }
    .log li {
      padding: 0.35rem 0.85rem;
      border-bottom: 1px dashed var(--border);
      line-height: 1.45;
    }
    .log li:first-child {
      animation: flash 900ms var(--ease);
    }
    @keyframes flash {
      from {
        background: var(--accent-tint);
      }
    }
    .ev {
      color: var(--accent);
      font-weight: var(--fw-bold);
    }
    .payload {
      color: var(--text-muted);
      word-break: break-all;
    }
    .log .empty {
      font-family: var(--ff-sans);
      padding: 1rem;
    }

    @media (max-width: 760px) {
      .browse,
      .hood {
        grid-template-columns: 1fr;
      }
      .steps .label {
        display: none;
      }
      .steps li.current .label {
        display: inline;
      }
      .steps li {
        min-width: 0;
      }
      .steps li.current {
        min-width: max-content;
      }
      .steps li:last-child {
        flex: none;
      }
      .steps li:not(:last-child)::after {
        min-width: 8px;
      }
    }
    @media (max-width: 560px) {
      table.config thead {
        display: none;
      }
      table.config,
      table.config tbody,
      table.config tr,
      table.config td {
        display: block;
      }
      table.config tr {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 0.5rem 0.75rem;
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--border);
      }
      table.config td {
        padding: 0;
        border: none;
        text-align: left;
      }
      table.config td.name {
        font-weight: var(--fw-semibold);
      }
      table.config td.opt select {
        width: 100%;
      }
      table.config td.opt {
        grid-column: 1 / -1;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .log li:first-child {
        animation: none;
      }
    }
  `;

  renderSteps() {
    return html`
      <ol class="steps" aria-label="Request steps">
        ${STEPS.map((name, i) => {
          const done = i < this.step;
          const current = i === this.step;
          const inner = html`<span class="num">${done ? '✓' : i + 1}</span><span class="label">${name}</span>`;
          // Completed steps are clickable (except after submit), like an OmniScript step chart.
          const clickable = done && this.step !== 3;
          return html`<li class="${done ? 'done' : ''} ${current ? 'current' : ''}" aria-current=${current ? 'step' : 'false'}>
            ${clickable ? html`<button @click=${() => this.go(i)}>${inner}</button>` : inner}
          </li>`;
        })}
      </ol>
    `;
  }

  renderDetail() {
    const item = this.focusId && byId(this.focusId);
    const count = this.lines.length;
    const inRequest = item && this.lines.some((l) => l.id === item.id);
    return html`
      <aside aria-live="polite">
        ${item
          ? html`
              <h5>${item.name}</h5>
              <p>${item.description}</p>
              <dl>
                <dt>Price</dt>
                <dd>${money(item.price)}</dd>
                <dt>In stock</dt>
                <dd>${item.stock || 'Back-ordered'}</dd>
                ${item.options
                  ? html`<dt>${item.options.label}</dt>
                      <dd>${item.options.values.join(' · ')}</dd>`
                  : ''}
              </dl>
              ${item.stock > 0
                ? html`<button
                    class="btn ${inRequest ? 'secondary' : ''}"
                    @click=${() =>
                      pubsub.fire(CHANNEL, inRequest ? 'itemremoved' : 'itemselected', {
                        id: item.id,
                        name: item.name,
                        price: item.price,
                      })}
                  >
                    ${inRequest ? 'Remove from request' : 'Add to request'}
                  </button>`
                : ''}
            `
          : html`<div class="empty">Select a card to see its details here.</div>`}
        <div class="count">${count} item${count === 1 ? '' : 's'} in request</div>
      </aside>
    `;
  }

  renderBrowse() {
    return html`
      <div class="browse">
        <div class="cards">${catalog.map((item) => html`<store-card .item=${item}></store-card>`)}</div>
        ${this.renderDetail()}
      </div>
    `;
  }

  renderConfigure() {
    return html`
      <h4 class="step-title">Configure your items</h4>
      <div class="table-wrap">
        <table class="config">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Option</th>
              <th class="num-col">Line total</th>
              <th><span class="visually-hidden" style="position:absolute;left:-9999px">Remove</span></th>
            </tr>
          </thead>
          <tbody>
            ${this.lines.map((l) => {
              const item = byId(l.id);
              const max = Math.min(item.stock, MAX_QTY);
              return html`<tr>
                <td class="name">${l.name}</td>
                <td>
                  <span class="qty" role="group" aria-label="Quantity for ${l.name}">
                    <button aria-label="Decrease" ?disabled=${l.quantity <= 1} @click=${() => this.updateLine(l.id, { quantity: l.quantity - 1 })}>−</button>
                    <output>${l.quantity}</output>
                    <button aria-label="Increase" ?disabled=${l.quantity >= max} @click=${() => this.updateLine(l.id, { quantity: l.quantity + 1 })}>+</button>
                  </span>
                </td>
                <td class="opt">
                  ${item.options
                    ? html`<select aria-label=${item.options.label} @change=${(e) => this.updateLine(l.id, { option: e.target.value })}>
                        ${item.options.values.map((v) => html`<option ?selected=${v === l.option}>${v}</option>`)}
                      </select>`
                    : html`<span class="hint">None</span>`}
                </td>
                <td class="num-col">${money(l.price * l.quantity)}</td>
                <td class="num-col">
                  <button class="link" @click=${() => pubsub.fire(CHANNEL, 'itemremoved', { id: l.id, name: l.name, price: l.price })}>Remove</button>
                </td>
              </tr>`;
            })}
          </tbody>
        </table>
      </div>
      ${this.lines.length === 0 ? html`<div class="empty">Your request is empty. Go back to Browse to add items.</div>` : ''}
    `;
  }

  renderReview() {
    const { subtotal, tax, total } = this.totals;
    return html`
      <h4 class="step-title">Review and submit</h4>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Option</th>
              <th class="num-col">Qty</th>
              <th class="num-col">Total</th>
            </tr>
          </thead>
          <tbody>
            ${this.lines.map(
              (l) => html`<tr>
                <td>${l.name}</td>
                <td>${l.option ?? '—'}</td>
                <td class="num-col">${l.quantity}</td>
                <td class="num-col">${money(l.price * l.quantity)}</td>
              </tr>`
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">Subtotal</td>
              <td class="num-col">${money(subtotal)}</td>
            </tr>
            <tr>
              <td colspan="3">Tax (${TAX_RATE * 100}%)</td>
              <td class="num-col">${money(tax)}</td>
            </tr>
            <tr class="total">
              <td colspan="3">Total</td>
              <td class="num-col">${money(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  }

  renderConfirm() {
    return html`
      <div class="done-panel">
        <div class="check">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </div>
        <h4>Request submitted</h4>
        <p>Request <code>${this.orderNumber}</code> for ${money(this.totals.total)} is on its way for approval.</p>
        <button class="btn secondary" @click=${this.startOver}>Start a new request</button>
      </div>
    `;
  }

  renderNav() {
    if (this.step === 3) return '';
    const blocked = !this.canAdvance();
    return html`
      <div class="nav">
        ${this.step > 0
          ? html`<button class="btn secondary" @click=${() => this.go(this.step - 1)}>Previous</button>`
          : html`<span class="hint">${blocked ? 'Add at least one item to continue.' : ''}</span>`}
        ${this.step === 2
          ? html`<button class="btn" @click=${this.submit}>Submit request</button>`
          : html`<button class="btn" ?disabled=${blocked} @click=${() => this.go(this.step + 1)}>Next</button>`}
      </div>
    `;
  }

  render() {
    const stage = [this.renderBrowse, this.renderConfigure, this.renderReview, this.renderConfirm][this.step].call(this);
    return html`
      <div class="frame">
        ${this.renderSteps()}
        <div class="stage" tabindex="-1" aria-label=${`Step ${this.step + 1} of ${STEPS.length}: ${STEPS[this.step]}`}>${stage}</div>
        ${this.renderNav()}
      </div>
      <div class="hood">
        <div class="panel">
          <h5>OmniScript data JSON</h5>
          <pre>${JSON.stringify(this.dataJson, null, 2)}</pre>
        </div>
        <div class="panel">
          <h5>PubSub events · channel "${CHANNEL}"</h5>
          <ul class="log" aria-live="off">
            ${this.log.length
              ? repeat(
                  this.log,
                  (m) => m.n,
                  (m) => html`<li>
                    <span class="ev">${m.eventName}</span>
                    <span class="payload">${JSON.stringify(m.payload)}</span>
                  </li>`
                )
              : html`<li class="empty">Click a card or its Add button to see events fire.</li>`}
          </ul>
        </div>
      </div>
    `;
  }
}

customElements.define('storefront-demo', StorefrontDemo);

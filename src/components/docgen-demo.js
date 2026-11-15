import { LitElement, html, css, unsafeCSS } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { runMapping, renderTemplate, sanitize } from '../lib/docgen.js';
import {
  PROGRAMS,
  STATUSES,
  SERVICES,
  RELATIONSHIPS,
  SIGNATURE_ID,
  MAPPING_ROWS,
  DEFAULT_TEMPLATE,
  initialRecord,
  toExtractJson,
} from '../data/docgen-sample.js';

/* =============================================================
   Live demo: OmniStudio-style Document Generation, client side.

   Record form → Extract JSON (what the Extract DataMapper returns)
   → mapping rows (the Transform DataMapper) → flat token JSON →
   Mustache-style template → rendered document. Every stage is
   visible in the tabs under the demo, and the template is editable.
   ============================================================= */

const TABS = [
  { id: 'extract', label: 'Extract JSON', hint: 'Extract DataMapper output' },
  { id: 'mapping', label: 'Mapping rows', hint: 'Transform DataMapper' },
  { id: 'tokens', label: 'Token JSON', hint: 'What the template sees' },
  { id: 'template', label: 'Template', hint: 'Editable' },
];

// The "Word document" look. Shared with the print view, so it's a plain string.
const PAPER_CSS = `
  .paper {
    background: #ffffff;
    color: #1f2330;
    font-family: Calibri, 'Segoe UI', system-ui, sans-serif;
    font-size: 0.8rem;
    line-height: 1.5;
    padding: 1.75rem;
  }
  .paper h1 { font-size: 1.3rem; margin: 0 0 0.15rem; color: #0b2a5b; }
  .paper h2 {
    font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.07em; color: #0b2a5b;
    border-bottom: 1px solid #d5d9e3; padding-bottom: 0.2rem; margin: 1.15rem 0 0.5rem;
  }
  .paper p { margin: 0; }
  .paper .meta, .paper .note { color: #6b7185; }
  .paper .note { font-style: italic; }
  .paper table { border-collapse: collapse; width: 100%; }
  .paper .kv th { text-align: left; color: #6b7185; font-weight: 600; padding: 0.2rem 0.5rem 0.2rem 0; white-space: nowrap; }
  .paper .kv td { padding: 0.2rem 0.9rem 0.2rem 0; }
  .paper .list th, .paper .list td { border: 1px solid #d5d9e3; padding: 0.3rem 0.5rem; text-align: left; }
  .paper .list th { background: #f1f3f8; font-weight: 600; }
  .paper .checks { white-space: pre-wrap; }
  .paper .sig { margin-top: 1.5rem; }
  .paper .sig img { display: block; max-width: 100%; height: auto; }
  .paper .sigline { display: inline-block; min-width: 230px; border-top: 1px solid #1f2330; padding-top: 0.2rem; margin-top: 0.2rem; }
  .paper mark.miss {
    background: #fde68a; color: #7c2d12; border-radius: 3px; padding: 0 0.2rem;
    font-family: ui-monospace, Consolas, monospace; font-size: 0.72rem;
  }
`;

const SIG_W = 600;
const SIG_H = 180;

class DocgenDemo extends LitElement {
  static properties = {
    record: { state: true },
    signature: { state: true },
    template: { state: true },
    tab: { state: true },
  };

  constructor() {
    super();
    this.record = initialRecord();
    this.signature = null; // PNG data URL of the drawn signature
    this.template = DEFAULT_TEMPLATE;
    this.tab = 'tokens';
    this.drawing = false;
  }

  /* ---------- Record edits ---------- */

  set(field, value) {
    this.record = { ...this.record, [field]: value };
  }

  toggleService(value, on) {
    const services = on ? [...this.record.services, value] : this.record.services.filter((s) => s !== value);
    // Keep picklist order stable, the way a multi-select stores it.
    this.set('services', SERVICES.map((s) => s.value).filter((v) => services.includes(v)));
  }

  setMember(i, patch) {
    this.set('household', this.record.household.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  }

  addMember() {
    this.set('household', [...this.record.household, { name: '', relationship: 'Child', age: null }]);
  }

  removeMember(i) {
    this.set('household', this.record.household.filter((_, j) => j !== i));
  }

  reset() {
    this.record = initialRecord();
    this.template = DEFAULT_TEMPLATE;
    this.clearSignature();
  }

  /* ---------- Signature pad ---------- */

  get canvas() {
    return this.renderRoot.querySelector('canvas');
  }

  firstUpdated() {
    this.prepCanvas();
  }

  prepCanvas() {
    const ctx = this.canvas.getContext('2d');
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1a2a5e';
    return ctx;
  }

  point(e) {
    const r = this.canvas.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * SIG_W, ((e.clientY - r.top) / r.height) * SIG_H];
  }

  penDown(e) {
    this.drawing = true;
    this.canvas.setPointerCapture(e.pointerId);
    const ctx = this.prepCanvas();
    ctx.beginPath();
    ctx.moveTo(...this.point(e));
  }

  penMove(e) {
    if (!this.drawing) return;
    const ctx = this.canvas.getContext('2d');
    ctx.lineTo(...this.point(e));
    ctx.stroke();
  }

  penUp() {
    if (!this.drawing) return;
    this.drawing = false;
    this.signature = this.canvas.toDataURL('image/png');
  }

  clearSignature() {
    this.canvas?.getContext('2d').clearRect(0, 0, SIG_W, SIG_H);
    this.signature = null;
  }

  // Draws a cursive-looking scribble for visitors who don't want to sign.
  autoSign() {
    this.clearSignature();
    const ctx = this.prepCanvas();
    // Looping cursive strokes: a forward drift plus a circular wobble.
    ctx.beginPath();
    for (let i = 0; i <= 600; i++) {
      const t = i / 600;
      const w = Math.PI * 2 * 8 * t;
      const env = 0.55 + 0.45 * Math.sin(Math.PI * t);
      const x = 50 + 440 * t - 20 * Math.sin(w);
      const y = 100 - 26 * env * Math.cos(w) - 10 * Math.sin(Math.PI * 2 * t);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    // Underline flourish
    ctx.beginPath();
    ctx.moveTo(70, 152);
    ctx.bezierCurveTo(220, 128, 400, 168, 560, 140);
    ctx.stroke();
    this.signature = this.canvas.toDataURL('image/png');
  }

  /* ---------- Generation ---------- */

  generate() {
    const extract = toExtractJson(this.record, !!this.signature);
    const tokens = runMapping(MAPPING_ROWS, extract);
    const result = renderTemplate(this.template, tokens, {
      resolveImage: (id) => (id === SIGNATURE_ID ? this.signature : null),
    });
    const unused = Object.keys(tokens).filter((k) => !result.used.has(k));
    return { extract, tokens, html: sanitize(result.html), used: result.used, missing: result.missing, unused };
  }

  print(docHtml) {
    const frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;width:0;height:0;border:0;right:0;bottom:0';
    document.body.append(frame);
    const doc = frame.contentDocument;
    doc.open();
    doc.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>Program Enrollment Summary</title>` +
        `<style>${PAPER_CSS} body{margin:0} .paper{padding:0.5in;font-size:11pt} @page{margin:0.4in}</style></head>` +
        `<body><div class="paper">${docHtml}</div></body></html>`
    );
    doc.close();
    const go = () => {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      setTimeout(() => frame.remove(), 1000);
    };
    // Wait for the signature image (if any) before printing.
    const imgs = [...doc.images].filter((i) => !i.complete);
    if (imgs.length) Promise.all(imgs.map((i) => new Promise((r) => (i.onload = i.onerror = r)))).then(go);
    else go();
  }

  static styles = [
    css`
      ${unsafeCSS(PAPER_CSS)}
    `,
    css`
      :host {
        display: block;
      }
      .frame {
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: var(--surface);
        overflow: hidden;
      }
      .work {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
      }

      /* Record form */
      form {
        padding: 1rem;
        border-right: 1px solid var(--border);
        display: grid;
        gap: 0.85rem;
        align-content: start;
        font-size: var(--fs-small);
      }
      .form-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 0.5rem;
      }
      h4 {
        margin: 0;
        font-size: 1rem;
      }
      .rec-id {
        font-family: var(--ff-mono);
        font-size: 0.72rem;
        color: var(--text-muted);
      }
      .row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }
      label,
      fieldset {
        display: grid;
        gap: 0.3rem;
        min-width: 0;
      }
      fieldset {
        border: none;
        margin: 0;
        padding: 0;
      }
      .lbl,
      legend {
        font-size: 0.75rem;
        font-weight: var(--fw-semibold);
        color: var(--text-muted);
        padding: 0;
      }
      input[type='text'],
      input[type='date'],
      input[type='number'],
      select {
        font: inherit;
        font-size: var(--fs-small);
        height: 34px;
        width: 100%;
        min-width: 0;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--text);
        padding: 0 0.55rem;
      }
      .opts {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem 0.9rem;
        margin-top: 0.3rem;
      }
      .opts label {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        color: var(--text);
        cursor: pointer;
      }
      input[type='checkbox'],
      input[type='radio'] {
        accent-color: var(--accent);
        margin: 0;
      }
      .hh {
        display: grid;
        gap: 0.4rem;
        margin-top: 0.3rem;
      }
      .member {
        display: grid;
        grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr) 62px auto;
        gap: 0.4rem;
        align-items: center;
      }
      .icon-btn {
        all: unset;
        cursor: pointer;
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        border-radius: 6px;
        color: var(--text-muted);
        font-size: 1.1rem;
      }
      .icon-btn:hover {
        background: var(--accent-tint);
        color: var(--accent);
      }
      .link {
        all: unset;
        cursor: pointer;
        color: var(--accent);
        font-size: 0.8125rem;
        font-weight: var(--fw-semibold);
        justify-self: start;
      }
      .link:hover {
        text-decoration: underline;
      }
      .sigpad {
        position: relative;
      }
      canvas {
        display: block;
        width: 100%;
        aspect-ratio: ${SIG_W} / ${SIG_H};
        background: #ffffff;
        border: 1px dashed var(--border);
        border-radius: var(--radius-sm);
        touch-action: none;
        cursor: crosshair;
      }
      .sig-hint {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: #8a90a3;
        font-size: 0.8rem;
        pointer-events: none;
      }
      .sig-actions {
        display: flex;
        gap: 1rem;
        margin-top: 0.35rem;
      }

      /* Document preview */
      .preview {
        display: flex;
        flex-direction: column;
        min-width: 0;
        background: var(--bg-elevated);
      }
      .doc-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        padding: 0.65rem 1rem;
        border-bottom: 1px solid var(--border);
        font-size: 0.8rem;
      }
      .file {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        font-weight: var(--fw-semibold);
        min-width: 0;
      }
      .file svg {
        width: 18px;
        height: 18px;
        flex: none;
        color: #2b579a;
      }
      .status {
        font-family: var(--ff-mono);
        font-size: 0.7rem;
        padding: 0.15rem 0.5rem;
        border-radius: 999px;
        background: rgba(31, 157, 85, 0.14);
        color: #1f9d55;
        white-space: nowrap;
      }
      .status.warn {
        background: rgba(217, 119, 6, 0.15);
        color: #b45309;
      }
      .sheet-wrap {
        padding: 1rem;
        overflow-x: auto;
        flex: 1;
      }
      .paper {
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(26, 29, 41, 0.08), 0 10px 28px -12px rgba(26, 29, 41, 0.3);
      }

      /* Footer */
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
        height: 36px;
        padding: 0 1rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--accent);
        background: var(--accent);
        color: var(--accent-contrast);
        cursor: pointer;
        white-space: nowrap;
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
      .btn.small {
        height: 30px;
        padding: 0 0.75rem;
        font-size: 0.8rem;
      }
      .btn:focus-visible,
      .link:focus-visible,
      .icon-btn:focus-visible,
      input:focus-visible,
      select:focus-visible,
      textarea:focus-visible,
      .tabs button:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
      }

      /* Under the hood: pipeline tabs */
      .hood {
        margin-top: 0.75rem;
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        background: var(--surface);
        min-width: 0;
      }
      .tabs {
        display: flex;
        border-bottom: 1px solid var(--border);
        overflow-x: auto;
        overflow-y: hidden;
      }
      .tabs button {
        all: unset;
        cursor: pointer;
        flex: 1 1 0;
        min-width: max-content;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 0.85rem;
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
      }
      .tabs button + button::before {
        content: '→';
        color: var(--text-muted);
        margin-right: 0.35rem;
      }
      .tabs .t {
        display: grid;
        line-height: 1.25;
      }
      .tabs .name {
        font-family: var(--ff-mono);
        font-size: 0.7rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-weight: var(--fw-semibold);
        color: var(--text-muted);
      }
      .tabs .sub {
        font-size: 0.72rem;
        color: var(--text-muted);
      }
      .tabs button[aria-selected='true'] {
        border-bottom-color: var(--accent);
      }
      .tabs button[aria-selected='true'] .name {
        color: var(--accent);
      }
      pre {
        margin: 0;
        padding: 0.75rem 0.85rem;
        height: 300px;
        overflow: auto;
        font-family: var(--ff-mono);
        font-size: 0.75rem;
        line-height: 1.5;
        color: var(--text);
      }
      .rows-wrap {
        height: 300px;
        overflow: auto;
      }
      table.rows {
        width: 100%;
        border-collapse: collapse;
        font-family: var(--ff-mono);
        font-size: 0.72rem;
      }
      table.rows th,
      table.rows td {
        text-align: left;
        padding: 0.4rem 0.7rem;
        border-bottom: 1px dashed var(--border);
        vertical-align: top;
      }
      table.rows th {
        position: sticky;
        top: 0;
        background: var(--surface);
        font-family: var(--ff-sans);
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        border-bottom: 1px solid var(--border);
      }
      .out {
        color: var(--accent);
        font-weight: var(--fw-bold);
      }
      .muted {
        color: var(--text-muted);
      }
      .tpl {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 220px;
      }
      textarea {
        display: block;
        width: 100%;
        height: 300px;
        resize: vertical;
        border: none;
        border-right: 1px solid var(--border);
        border-radius: 0;
        padding: 0.75rem 0.85rem;
        font-family: var(--ff-mono);
        font-size: 0.72rem;
        line-height: 1.5;
        background: var(--surface);
        color: var(--text);
        white-space: pre;
      }
      .check {
        padding: 0.75rem 0.85rem;
        height: 300px;
        overflow: auto;
        font-size: 0.75rem;
      }
      .check h6 {
        margin: 0 0 0.35rem;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-muted);
      }
      .check ul {
        list-style: none;
        margin: 0 0 0.9rem;
        padding: 0;
        font-family: var(--ff-mono);
        font-size: 0.7rem;
        display: grid;
        gap: 0.2rem;
      }
      .ok {
        color: #1f9d55;
      }
      .bad {
        color: #b45309;
        font-weight: var(--fw-bold);
      }

      @media (max-width: 860px) {
        .work {
          grid-template-columns: 1fr;
        }
        form {
          border-right: none;
          border-bottom: 1px solid var(--border);
        }
        .tpl {
          grid-template-columns: 1fr;
        }
        textarea {
          border-right: none;
          border-bottom: 1px solid var(--border);
        }
        .check {
          height: auto;
        }
      }
      @media (max-width: 520px) {
        .row {
          grid-template-columns: 1fr;
        }
        .member {
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
        }
        .member .name-in {
          grid-column: 1 / -1;
        }
        .paper {
          padding: 1.1rem;
        }
        .tabs .sub {
          display: none;
        }
      }
    `,
  ];

  renderForm() {
    const r = this.record;
    return html`
      <form @submit=${(e) => e.preventDefault()} aria-label="Source record">
        <div class="form-head">
          <h4>Program Enrollment</h4>
          <span class="rec-id">PE-000123</span>
        </div>
        <div class="row">
          <label><span class="lbl">Client name</span>
            <input type="text" .value=${r.clientName} @input=${(e) => this.set('clientName', e.target.value)} />
          </label>
          <label><span class="lbl">Date of birth</span>
            <input type="date" .value=${r.birthdate} @input=${(e) => this.set('birthdate', e.target.value)} />
          </label>
        </div>
        <div class="row">
          <label><span class="lbl">Program</span>
            <select @change=${(e) => this.set('program', e.target.value)}>
              ${PROGRAMS.map((p) => html`<option ?selected=${p === r.program}>${p}</option>`)}
            </select>
          </label>
          <label><span class="lbl">Start date</span>
            <input type="date" .value=${r.startDate} @input=${(e) => this.set('startDate', e.target.value)} />
          </label>
        </div>
        <fieldset>
          <legend>Status (picklist)</legend>
          <div class="opts">
            ${STATUSES.map(
              (s) => html`<label><input type="radio" name="status" .checked=${r.status === s} @change=${() => this.set('status', s)} />${s}</label>`
            )}
          </div>
        </fieldset>
        <fieldset>
          <legend>Services (multi-select)</legend>
          <div class="opts">
            ${SERVICES.map(
              ({ value }) => html`<label><input type="checkbox" .checked=${r.services.includes(value)} @change=${(e) => this.toggleService(value, e.target.checked)} />${value}</label>`
            )}
          </div>
        </fieldset>
        <label><span class="lbl">Consent to share information</span>
          <select @change=${(e) => this.set('consent', e.target.value)}>
            <option value="" ?selected=${!r.consent}>— None —</option>
            <option ?selected=${r.consent === 'Yes'}>Yes</option>
            <option ?selected=${r.consent === 'No'}>No</option>
          </select>
        </label>
        <fieldset>
          <legend>Household members (related list)</legend>
          <div class="hh">
            ${r.household.map(
              (m, i) => html`<div class="member">
                <input class="name-in" type="text" placeholder="Name" aria-label="Member ${i + 1} name" .value=${m.name} @input=${(e) => this.setMember(i, { name: e.target.value })} />
                <select aria-label="Member ${i + 1} relationship" @change=${(e) => this.setMember(i, { relationship: e.target.value })}>
                  ${RELATIONSHIPS.map((x) => html`<option ?selected=${x === m.relationship}>${x}</option>`)}
                </select>
                <input type="number" min="0" max="120" placeholder="Age" aria-label="Member ${i + 1} age" .value=${m.age ?? ''} @input=${(e) => this.setMember(i, { age: e.target.value === '' ? null : Number(e.target.value) })} />
                <button type="button" class="icon-btn" aria-label="Remove member ${i + 1}" @click=${() => this.removeMember(i)}>×</button>
              </div>`
            )}
            ${r.household.length < 6 ? html`<button type="button" class="link" @click=${this.addMember}>+ Add member</button>` : ''}
          </div>
        </fieldset>
        <fieldset>
          <legend>Participant signature (ContentDocument)</legend>
          <div class="sigpad">
            <canvas
              width=${SIG_W}
              height=${SIG_H}
              aria-label="Signature pad: draw with your mouse or finger"
              @pointerdown=${this.penDown}
              @pointermove=${this.penMove}
              @pointerup=${this.penUp}
              @pointercancel=${this.penUp}
            ></canvas>
            ${this.signature ? '' : html`<span class="sig-hint">Sign here</span>`}
          </div>
          <div class="sig-actions">
            <button type="button" class="link" @click=${this.autoSign}>Sign for me</button>
            ${this.signature ? html`<button type="button" class="link" @click=${this.clearSignature}>Clear</button>` : ''}
          </div>
        </fieldset>
      </form>
    `;
  }

  renderRows() {
    const describe = (row) => {
      switch (row.kind) {
        case 'map':
          return [row.from, row.to, [row.format, row.valueMap && JSON.stringify(row.valueMap)].filter(Boolean).join(' · ') || '—'];
        case 'formula':
          return ['Formula', row.to, row.expr];
        case 'list':
          return [`${row.from} (list)`, row.to, Object.entries(row.fields).map(([to, from]) => `${to} ← ${from}`).join(', ')];
        case 'image':
          return [row.from, `${row.to}:src`, `width ${row.width} · height ${row.height}`];
      }
    };
    return html`<div class="rows-wrap">
      <table class="rows">
        <thead><tr><th>#</th><th>Input</th><th>Output token</th><th>Format / formula</th></tr></thead>
        <tbody>
          ${MAPPING_ROWS.map((row, i) => {
            const [from, to, extra] = describe(row);
            return html`<tr><td class="muted">${i + 1}</td><td>${from}</td><td class="out">${to}</td><td class="muted">${extra}</td></tr>`;
          })}
        </tbody>
      </table>
    </div>`;
  }

  renderTemplateTab(gen) {
    const used = [...gen.used].sort();
    return html`<div class="tpl">
      <textarea
        spellcheck="false"
        aria-label="Template source"
        .value=${this.template}
        @input=${(e) => (this.template = e.target.value)}
      ></textarea>
      <div class="check" aria-live="polite">
        <h6>Token check</h6>
        <ul>
          ${used.map((t) => html`<li class=${gen.missing.has(t) ? 'bad' : 'ok'}>${gen.missing.has(t) ? '✗' : '✓'} ${t}</li>`)}
        </ul>
        ${gen.unused.length
          ? html`<h6>In JSON, not in template</h6>
              <ul>${gen.unused.map((t) => html`<li class="muted">· ${t}</li>`)}</ul>`
          : ''}
        ${this.template !== DEFAULT_TEMPLATE
          ? html`<button class="link" @click=${() => (this.template = DEFAULT_TEMPLATE)}>Restore template</button>`
          : html`<p class="muted">Try renaming a token, like <code>{{ClientName}}</code> → <code>{{ClientNam}}</code>.</p>`}
      </div>
    </div>`;
  }

  renderHood(gen) {
    const body = {
      extract: () => html`<pre>${JSON.stringify(gen.extract, null, 2)}</pre>`,
      mapping: () => this.renderRows(),
      tokens: () => html`<pre>${JSON.stringify(gen.tokens, null, 2)}</pre>`,
      template: () => this.renderTemplateTab(gen),
    }[this.tab];
    return html`<div class="hood">
      <div class="tabs" role="tablist" aria-label="Generation pipeline">
        ${TABS.map(
          (t) => html`<button role="tab" aria-selected=${this.tab === t.id} @click=${() => (this.tab = t.id)}>
            <span class="t"><span class="name">${t.label}</span><span class="sub">${t.hint}</span></span>
          </button>`
        )}
      </div>
      <div role="tabpanel">${body()}</div>
    </div>`;
  }

  render() {
    const gen = this.generate();
    const missing = gen.missing.size;
    return html`
      <div class="frame">
        <div class="work">
          ${this.renderForm()}
          <div class="preview">
            <div class="doc-bar">
              <span class="file">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" opacity=".2"/><path d="M14 2v6h6M7.5 11h1.6l.9 4 1-4h1.3l1 4 .9-4h1.6l-1.7 6h-1.5l-.95-3.6L10.6 17H9.1z"/></svg>
                Enrollment_Summary_PE-000123.docx
              </span>
              <span class="status ${missing ? 'warn' : ''}">${missing ? `${missing} unresolved token${missing === 1 ? '' : 's'}` : `${gen.used.size} tokens resolved`}</span>
            </div>
            <div class="sheet-wrap">
              <div class="paper" aria-label="Generated document">${unsafeHTML(gen.html)}</div>
            </div>
          </div>
        </div>
        <div class="nav">
          <span class="hint">Edit the record and the document regenerates instantly.</span>
          <span style="display:flex;gap:0.5rem">
            <button class="btn secondary small" @click=${this.reset}>Reset</button>
            <button class="btn small" @click=${() => this.print(gen.html)}>Print / Save PDF</button>
          </span>
        </div>
      </div>
      ${this.renderHood(gen)}
    `;
  }
}

customElements.define('docgen-demo', DocgenDemo);

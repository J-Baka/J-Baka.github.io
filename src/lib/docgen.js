/* =============================================================
   A small client-side model of OmniStudio Document Generation:

   1. runMapping(): a DataMapper-style transform. It reads nested
      Extract JSON by ':' paths and writes flat token keys, using
      the same row kinds a real mapper has (field mapping with a
      format or value map, formulas, list mapping, image tokens).
   2. renderTemplate(): a Mustache-subset renderer for the tokens
      DocGen templates use: {{field}}, {{#section}}, {{^inverted}},
      and image tokens resolved to an <img>.
   3. sanitize(): the template is user-editable in the demo, so the
      rendered HTML goes through an allow-list before display.
   ============================================================= */

export const getPath = (obj, path) =>
  path.split(':').reduce((o, k) => (o == null ? undefined : o[k]), obj);

const setPath = (obj, path, value) => {
  const keys = path.split(':');
  let o = obj;
  keys.slice(0, -1).forEach((k) => (o = o[k] ??= {}));
  o[keys.at(-1)] = value;
};

// 'YYYY-MM-DD' → 'MM/dd/yyyy' without going through Date (no timezone drift).
export const formatDate = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
};

export const age = (iso, today = new Date()) => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  let a = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) a--;
  return a;
};

const applyFormat = (value, format) => {
  if (value == null || value === '') return null;
  if (format === 'Date(MM/dd/yyyy)') return formatDate(value);
  if (format === 'Boolean') return value === true || value === 'true';
  if (format === 'Integer') return parseInt(value, 10);
  return String(value);
};

/* Run mapping rows over the Extract JSON and return the flat token JSON. */
export function runMapping(rows, input) {
  const out = {};
  for (const row of rows) {
    switch (row.kind) {
      case 'map': {
        let v = getPath(input, row.from);
        if (row.valueMap && v != null) v = row.valueMap[v] ?? v;
        v = applyFormat(v, row.format);
        setPath(out, row.to, v ?? row.default ?? null);
        break;
      }
      case 'formula':
        setPath(out, row.to, row.fn(input));
        break;
      case 'list': {
        const list = getPath(input, row.from) ?? [];
        out[row.to] = list.map((item) =>
          Object.fromEntries(Object.entries(row.fields).map(([to, from]) => [to, item[from] ?? null]))
        );
        break;
      }
      case 'image': {
        const src = getPath(input, row.from);
        // Null when there is no file, so templates can test it with {{^IMG_x}}.
        out[row.to] = src ? { src, width: row.width, height: row.height } : null;
        break;
      }
    }
  }
  return out;
}

/* ---------- Template rendering ---------- */

const TOKEN = /\{\{\s*([#^/]?)\s*([\w:.]+)\s*\}\}/g;

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Parse into a tree of text / var / section nodes. Unbalanced tags become text.
function parse(template) {
  const root = { children: [] };
  const stack = [root];
  let last = 0;
  for (const m of template.matchAll(TOKEN)) {
    const [raw, sigil, name] = m;
    const top = stack.at(-1);
    if (m.index > last) top.children.push({ type: 'text', value: template.slice(last, m.index) });
    last = m.index + raw.length;
    if (sigil === '#' || sigil === '^') {
      const node = { type: 'section', inverted: sigil === '^', name, children: [] };
      top.children.push(node);
      stack.push(node);
    } else if (sigil === '/') {
      if (stack.length > 1 && top.name === name) stack.pop();
      else top.children.push({ type: 'text', value: escapeHtml(raw) });
    } else {
      top.children.push({ type: 'var', name });
    }
  }
  if (last < template.length) stack.at(-1).children.push({ type: 'text', value: template.slice(last) });
  return root.children;
}

/* Render a template against token JSON.
   Returns { html, used: Set, missing: Set } so the demo can show a token check.
   resolveImage maps an image token's src (a ContentDocument Id) to a URL. */
export function renderTemplate(template, data, { resolveImage = (s) => s } = {}) {
  const used = new Set();
  const missing = new Set();

  const lookup = (stack, name) => {
    for (let i = stack.length - 1; i >= 0; i--) {
      const ctx = stack[i];
      if (ctx && typeof ctx === 'object' && name in ctx) return { found: true, value: ctx[name] };
    }
    return { found: false };
  };

  const walk = (nodes, stack) =>
    nodes
      .map((n) => {
        if (n.type === 'text') return n.value;
        used.add(n.name);
        const { found, value } = lookup(stack, n.name);
        if (!found) missing.add(n.name);

        if (n.type === 'var') {
          if (!found) return `<mark class="miss">{{${escapeHtml(n.name)}}}</mark>`;
          if (value && typeof value === 'object' && 'src' in value) {
            const url = resolveImage(value.src);
            return url ? `<img src="${escapeHtml(url)}" width="${value.width}" height="${value.height}" alt="Signature">` : '';
          }
          return value == null ? '' : escapeHtml(value);
        }

        const empty = !value || (Array.isArray(value) && value.length === 0);
        if (n.inverted) return empty ? walk(n.children, stack) : '';
        if (empty) return '';
        if (Array.isArray(value)) return value.map((item) => walk(n.children, [...stack, item])).join('');
        return walk(n.children, typeof value === 'object' ? [...stack, value] : stack);
      })
      .join('');

  return { html: walk(parse(template), [data]), used, missing };
}

/* ---------- Sanitizer ---------- */

const ALLOWED = new Set(
  'h1 h2 h3 h4 p div span br hr strong b em i u small mark ul ol li table thead tbody tfoot tr th td img section'.split(' ')
);
const DROP = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'form', 'input', 'button', 'svg', 'math']);
const ATTRS = new Set(['class', 'colspan', 'rowspan', 'width', 'height', 'alt', 'src']);

export function sanitize(html) {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const clean = (el) => {
    for (const child of [...el.children]) {
      const tag = child.tagName.toLowerCase();
      if (DROP.has(tag)) {
        child.remove();
        continue;
      }
      clean(child);
      if (!ALLOWED.has(tag)) {
        child.replaceWith(...child.childNodes);
        continue;
      }
      for (const { name, value } of [...child.attributes]) {
        const ok = ATTRS.has(name) && (name !== 'src' || /^data:image\/(png|jpeg);base64,/.test(value));
        if (!ok) child.removeAttribute(name);
      }
      if (tag === 'img' && !child.hasAttribute('src')) child.remove();
    }
  };
  const root = doc.body.firstElementChild;
  clean(root);
  return root.innerHTML;
}

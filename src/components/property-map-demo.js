import { LitElement, html, css, unsafeCSS } from 'lit';
import L from 'leaflet';
import leafletCss from 'leaflet/dist/leaflet.css?inline';

/* =============================================================
   Live demo: a browser re-creation of a Lightning Web Component
   I built for housing case workers. Same flow as the original:

     address ──geocode──▶ lat/lng ──DISTANCE() query──▶ available /
                                                        unavailable
                                                        properties

   On Salesforce, the geocode is an Apex REST callout and the
   radius search is a SOQL DISTANCE()/GEOLOCATION() query. Here the
   geocode hits LocationIQ directly and the radius search runs in
   JS against generated sample data — no client data is used.
   ============================================================= */

const API_KEY = import.meta.env.VITE_LOCATIONIQ_KEY || '';

// Default view (no API call needed on page load).
const DEFAULT_CENTER = { lat: 41.8781, lon: -87.6298, label: 'Chicago, IL' };
const RADII = [5, 10, 25, 50];
const AVAILABLE_WINDOW_DAYS = 30; // mirrors `Date_Available__c <= NEXT_N_DAYS:30`

const COLORS = {
  origin: '#f28b00',
  available: '#1f9d55',
  unavailable: '#d64545',
};

/* ---------- helpers ---------- */

// Great-circle distance in miles — what SOQL's DISTANCE(..., 'mi') computes.
function distanceMi(a, b) {
  const R = 3958.8;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Small seeded PRNG so the same search always produces the same sample listings.
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STREETS = ['Oak', 'Maple', 'Cedar', 'Elm', 'Willow', 'Birch', 'Pine', 'Lake', 'Hill', 'Park', 'River', 'Spruce', 'Ash', 'Sunset', 'Grove'];
const SUFFIXES = ['St', 'Ave', 'Blvd', 'Ct', 'Dr', 'Ln', 'Pl', 'Way'];
const ACCESS = ['Yes', 'No', 'Pending'];

// Fake Property__c records scattered around a point, mostly close in.
function sampleProperties(center, count = 40) {
  const rand = mulberry32(Math.round(center.lat * 1e4) * 31 + Math.round(center.lon * 1e4));
  const today = new Date();
  const out = [];
  for (let i = 0; i < count; i++) {
    const miles = 55 * rand() ** 2.2; // skew toward the center
    const bearing = rand() * 2 * Math.PI;
    const lat = center.lat + (miles / 69) * Math.cos(bearing);
    const lon = center.lon + (miles / (69 * Math.cos((center.lat * Math.PI) / 180))) * Math.sin(bearing);
    const available = rand() > 0.42;
    const daysOut = available ? -Math.floor(rand() * 20) : Math.floor(rand() * 45);
    const date = new Date(today);
    date.setDate(today.getDate() + daysOut);
    out.push({
      id: i,
      name: `${100 + Math.floor(rand() * 9800)} ${STREETS[Math.floor(rand() * STREETS.length)]} ${SUFFIXES[Math.floor(rand() * SUFFIXES.length)]}`,
      lat,
      lon,
      bedrooms: 1 + Math.floor(rand() * 4),
      rent: Math.round((900 + rand() * 1700) / 25) * 25,
      inUnitAccess: ACCESS[Math.floor(rand() * ACCESS.length)],
      available,
      dateAvailable: date,
    });
  }
  return out;
}

/* Random points near a coast can land in a lake or ocean. LocationIQ's
   "streets" tiles paint all water one flat color and allow CORS, so we read
   the tile pixel under each candidate and drop the ones on water. */
const WATER_RGB = [160, 200, 240];
const LAND_CHECK_ZOOM = 11;
const tileCache = new Map();

function loadTile(z, x, y) {
  const k = `${z}/${x}/${y}`;
  if (!tileCache.has(k)) {
    tileCache.set(
      k,
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = c.height = 256;
          const g = c.getContext('2d', { willReadFrequently: true });
          g.drawImage(img, 0, 0);
          resolve(g);
        };
        img.onerror = reject;
        img.src = `https://a-tiles.locationiq.com/v3/streets/r/${z}/${x}/${y}.png?key=${API_KEY}`;
      }).catch((err) => {
        tileCache.delete(k);
        throw err;
      })
    );
  }
  return tileCache.get(k);
}

async function isOnLand({ lat, lon }) {
  const n = 2 ** LAND_CHECK_ZOOM;
  const tx = ((lon + 180) / 360) * n;
  const r = (lat * Math.PI) / 180;
  const ty = ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n;
  const g = await loadTile(LAND_CHECK_ZOOM, Math.floor(tx), Math.floor(ty));
  const [pr, pg, pb] = g.getImageData(Math.floor((tx % 1) * 256), Math.floor((ty % 1) * 256), 1, 1).data;
  return !(Math.abs(pr - WATER_RGB[0]) < 8 && Math.abs(pg - WATER_RGB[1]) < 8 && Math.abs(pb - WATER_RGB[2]) < 8);
}

async function landOnly(points) {
  if (!API_KEY) return points;
  try {
    const keep = await Promise.all(points.map(isOnLand));
    return points.filter((_, i) => keep[i]);
  } catch {
    return points; // tiles unreachable: show unfiltered rather than nothing
  }
}

// Original house glyph (not an icon-font path), colored per status.
function houseIcon(color, { large = false, faded = false } = {}) {
  const size = large ? 34 : 26;
  return L.divIcon({
    className: 'pm-pin',
    iconSize: [size, size],
    iconAnchor: [size / 2, size - 2],
    popupAnchor: [0, -size + 6],
    html: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" style="opacity:${faded ? 0.85 : 1}">
      <path d="M12 2.5 1.8 11.2a1 1 0 0 0 1.3 1.5L4 12v8.5A1.5 1.5 0 0 0 5.5 22H10v-6h4v6h4.5a1.5 1.5 0 0 0 1.5-1.5V12l.9.7a1 1 0 0 0 1.3-1.5Z"
        fill="${color}" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/>
    </svg>`,
  });
}

const fmtDate = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const fmtMoney = (n) => `$${n.toLocaleString()}`;
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function isDarkTheme() {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'dark') return true;
  if (attr === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/* ---------- component ---------- */

class PropertyMapDemo extends LitElement {
  static properties = {
    query: { state: true },
    radius: { state: true },
    origin: { state: true },
    results: { state: true },
    status: { state: true },
    loading: { state: true },
  };

  constructor() {
    super();
    this.query = '';
    this.radius = 10;
    this.origin = DEFAULT_CENTER;
    this.results = { available: [], unavailable: [] };
    this.status = '';
    this.loading = false;
  }

  static styles = [
    unsafeCSS(leafletCss),
    css`
      :host {
        display: block;
      }
      .frame {
        border: 1px solid var(--border);
        border-radius: var(--radius);
        overflow: hidden;
        background: var(--surface);
      }
      .bar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        align-items: end;
        padding: 1rem;
        border-bottom: 1px solid var(--border);
        background: var(--bg-elevated);
      }
      label {
        display: grid;
        gap: 0.3rem;
        font-size: 0.75rem;
        font-weight: var(--fw-semibold);
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .grow {
        flex: 1 1 220px;
      }
      input,
      select,
      button {
        font: inherit;
        font-size: var(--fs-small);
        height: 40px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--text);
        padding: 0 0.75rem;
        text-transform: none;
        letter-spacing: normal;
      }
      input:focus-visible,
      select:focus-visible,
      button:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 1px;
      }
      button {
        background: var(--accent);
        border-color: var(--accent);
        color: var(--accent-contrast);
        font-weight: var(--fw-semibold);
        cursor: pointer;
        padding: 0 1.1rem;
      }
      button:hover {
        background: var(--accent-strong);
      }
      button[disabled] {
        opacity: 0.6;
        cursor: progress;
      }
      .map {
        height: clamp(320px, 55vw, 460px);
        background: var(--bg);
      }
      .foot {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 0.5rem 1rem;
        padding: 0.75rem 1rem;
        border-top: 1px solid var(--border);
        font-size: var(--fs-small);
        color: var(--text-muted);
      }
      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem 1rem;
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .legend li {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }
      .status {
        color: var(--text);
      }
      .status.err {
        color: #d64545;
      }
      /* Leaflet chrome, themed */
      .leaflet-container {
        font-family: var(--ff-sans);
      }
      .leaflet-popup-content-wrapper,
      .leaflet-popup-tip {
        background: var(--surface);
        color: var(--text);
        box-shadow: var(--shadow);
      }
      .leaflet-popup-content {
        margin: 0.75rem 0.9rem;
        font-size: 0.8125rem;
        line-height: 1.5;
      }
      .leaflet-popup-content strong {
        display: block;
        font-size: 0.875rem;
        margin-bottom: 0.2rem;
      }
      .leaflet-container a.leaflet-popup-close-button {
        color: var(--text-muted);
      }
      .leaflet-control-attribution {
        background: color-mix(in srgb, var(--surface) 85%, transparent) !important;
        color: var(--text-muted);
      }
      .leaflet-control-attribution a {
        color: var(--accent);
      }
      .leaflet-bar {
        border-color: var(--border) !important;
      }
      .leaflet-bar a {
        background: var(--surface);
        color: var(--text);
        border-bottom-color: var(--border);
      }
      .leaflet-bar a:hover {
        background: var(--bg-elevated);
      }
      .pm-pin {
        background: none;
        border: none;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
      }
    `,
  ];

  firstUpdated() {
    const el = this.renderRoot.querySelector('.map');
    this.map = L.map(el, { scrollWheelZoom: false, zoomControl: true });
    // Let the page scroll normally until someone actually interacts with the map.
    this.map.on('focus click', () => this.map.scrollWheelZoom.enable());
    this.map.on('mouseout', () => this.map.scrollWheelZoom.disable());

    this.layer = L.layerGroup().addTo(this.map);
    this.applyTiles();

    // Re-skin the tiles when the site theme flips.
    this.themeObserver = new MutationObserver(() => this.applyTiles());
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    this.mq = window.matchMedia('(prefers-color-scheme: dark)');
    this.onMq = () => this.applyTiles();
    this.mq.addEventListener('change', this.onMq);

    // The card fades in / resizes; keep Leaflet's size in sync.
    this.resizeObserver = new ResizeObserver(() => this.map.invalidateSize());
    this.resizeObserver.observe(el);

    this.runSearch(this.origin);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.themeObserver?.disconnect();
    this.resizeObserver?.disconnect();
    this.mq?.removeEventListener('change', this.onMq);
    this.map?.remove();
  }

  applyTiles() {
    const dark = isDarkTheme();
    if (this.tiles && this.tilesDark === dark) return;
    this.tiles?.remove();
    this.tilesDark = dark;
    this.tiles = API_KEY
      ? L.tileLayer(`https://{s}-tiles.locationiq.com/v3/${dark ? 'dark' : 'streets'}/r/{z}/{x}/{y}.png?key=${API_KEY}`, {
          subdomains: 'abc',
          maxZoom: 18,
          attribution:
            '<a href="https://locationiq.com/?ref=maps" target="_blank" rel="noopener">© LocationIQ</a> | <a href="https://openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a>',
        })
      : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '<a href="https://openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a>',
        });
    this.tiles.addTo(this.map);
  }

  // Equivalent of the Apex geocoding callout.
  async geocode(q) {
    if (!API_KEY) throw new Error('Address search is unavailable (no geocoding key configured).');
    const url = new URL('https://us1.locationiq.com/v1/search');
    url.search = new URLSearchParams({ key: API_KEY, q, format: 'json', limit: '1', countrycodes: 'us' });
    const res = await fetch(url);
    if (res.status === 404) throw new Error('No match for that address. Try adding a city and state.');
    if (res.status === 429) throw new Error('Too many searches in a short time. Give it a few seconds and try again.');
    if (!res.ok) throw new Error(`Geocoding service returned HTTP ${res.status}.`);
    const [hit] = await res.json();
    if (!hit) throw new Error('No match for that address.');
    return { lat: parseFloat(hit.lat), lon: parseFloat(hit.lon), label: hit.display_name };
  }

  async onSubmit(e) {
    e.preventDefault();
    const q = this.query.trim();
    if (!q) return;
    this.loading = true;
    this.status = 'Geocoding address…';
    try {
      this.origin = await this.geocode(q);
      this.status = 'Finding nearby properties…';
      await this.runSearch(this.origin);
    } catch (err) {
      this.status = err.message;
      this.statusIsError = true;
    } finally {
      this.loading = false;
    }
  }

  onRadius(e) {
    this.radius = Number(e.target.value);
    this.runSearch(this.origin);
  }

  // The demo's stand-in for Property__c records near this origin (cached per origin).
  async propertiesNear(origin) {
    const key = `${origin.lat},${origin.lon}`;
    if (this.sampleKey !== key) {
      this.sampleKey = key;
      this.samplePromise = landOnly(sampleProperties(origin, 80)).then((pts) => pts.slice(0, 40));
    }
    return this.samplePromise;
  }

  // Equivalent of the Apex/SOQL radius query, split into available vs. not-yet-available.
  async runSearch(origin) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + AVAILABLE_WINDOW_DAYS);
    const properties = await this.propertiesNear(origin);
    if (origin !== this.origin) return; // a newer search started meanwhile
    const inRange = properties
      .map((p) => ({ ...p, distance: distanceMi(origin, p) }))
      .filter((p) => p.distance < this.radius && p.dateAvailable <= cutoff)
      .sort((a, b) => a.distance - b.distance);

    this.results = {
      available: inRange.filter((p) => p.available),
      unavailable: inRange.filter((p) => !p.available),
    };
    this.statusIsError = false;
    this.status = `${this.results.available.length} available · ${this.results.unavailable.length} opening within ${AVAILABLE_WINDOW_DAYS} days — within ${this.radius} mi`;
    this.drawMarkers();
  }

  drawMarkers() {
    const { available, unavailable } = this.results;
    const o = this.origin;
    this.layer.clearLayers();

    L.circle([o.lat, o.lon], {
      radius: this.radius * 1609.34,
      color: getComputedStyle(this).getPropertyValue('--accent').trim() || '#4f66e0',
      weight: 1.5,
      fillOpacity: 0.06,
      interactive: false,
    }).addTo(this.layer);

    L.marker([o.lat, o.lon], { icon: houseIcon(COLORS.origin, { large: true }), zIndexOffset: 1000, keyboard: true, title: 'Search location' })
      .bindPopup(`<strong>Search location</strong>${escapeHtml(o.label)}`)
      .addTo(this.layer);

    const popup = (p) =>
      `<strong>${escapeHtml(p.name)}${p.available ? '' : ' (Unavailable)'}</strong>` +
      (p.available ? '' : `Date available: ${fmtDate(p.dateAvailable)}<br>`) +
      `Bedrooms: ${p.bedrooms}<br>Rent: ${fmtMoney(p.rent)}/mo<br>In-unit access: ${p.inUnitAccess}<br>` +
      `<span style="color:var(--text-muted)">${p.distance.toFixed(1)} mi away</span>`;

    for (const p of unavailable) {
      L.marker([p.lat, p.lon], { icon: houseIcon(COLORS.unavailable, { faded: true }), title: `${p.name} (unavailable)` })
        .bindPopup(popup(p))
        .addTo(this.layer);
    }
    for (const p of available) {
      L.marker([p.lat, p.lon], { icon: houseIcon(COLORS.available), title: p.name }).bindPopup(popup(p)).addTo(this.layer);
    }

    // Compute bounds from the center (circle.getBounds() needs a map view to exist first).
    this.map.fitBounds(L.latLng(o.lat, o.lon).toBounds(this.radius * 1609.34 * 2), { padding: [12, 12] });
  }

  render() {
    return html`
      <div class="frame">
        <form class="bar" @submit=${this.onSubmit} role="search" aria-label="Find properties near an address">
          <label class="grow">
            Client address
            <input
              type="text"
              placeholder="e.g. 233 S Wacker Dr, Chicago, IL"
              autocomplete="street-address"
              .value=${this.query}
              @input=${(e) => (this.query = e.target.value)}
            />
          </label>
          <label>
            Radius
            <select @change=${this.onRadius} aria-label="Search radius in miles">
              ${RADII.map((r) => html`<option value=${r} ?selected=${r === this.radius}>${r} mi</option>`)}
            </select>
          </label>
          <button type="submit" ?disabled=${this.loading}>${this.loading ? 'Searching…' : 'Find properties'}</button>
        </form>
        <div class="map-wrap">
          <div class="map" role="region" aria-label="Map of nearby properties"></div>
        </div>
        <div class="foot">
          <ul class="legend" aria-label="Legend">
            <li><span class="dot" style="background:${COLORS.origin}"></span>Search location</li>
            <li><span class="dot" style="background:${COLORS.available}"></span>Available</li>
            <li><span class="dot" style="background:${COLORS.unavailable}"></span>Opening soon</li>
          </ul>
          <span class="status ${this.statusIsError ? 'err' : ''}" role="status" aria-live="polite">${this.status}</span>
        </div>
      </div>
    `;
  }
}

customElements.define('property-map-demo', PropertyMapDemo);

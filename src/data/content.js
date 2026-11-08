/* =============================================================
   ALL EDITABLE CONTENT LIVES HERE.
   Change your bio, skills, certs, experience, and projects in
   this one file — you never need to touch the component code.

   Anything marked  // TODO  is a placeholder for you to fill in.
   ============================================================= */

export const profile = {
  name: 'Matt Hernandez',
  role: 'Salesforce Developer',
  // TODO: update the exact number
  yearsExperience: 6,
  tagline:
    'I design and build on the Salesforce platform — Apex, Lightning Web Components, and integrations that connect Salesforce to the rest of the business.',
  location: 'United States', // TODO: city/region if you want it shown
  email: 'matthewph96@gmail.com',
  linkedin: 'https://www.linkedin.com/in/hernan-p-matt/',
  github: 'https://github.com/J-Baka',
  // TODO: drop resume.pdf into /public and this link works; or set to null to hide the button
  resume: '/resume.pdf',
  // TODO: your public Trailhead / Trailblazer profile URL
  trailhead: 'https://www.salesforce.com/trailblazer/', // e.g. https://www.salesforce.com/trailblazer/your-handle
  headshot: '/img/Matt_Headshot.jpg',
};

// Front-and-center skills. Reorder / edit freely.
export const skills = [
  {
    title: 'Apex & Backend',
    icon: 'code',
    items: ['Apex triggers & classes', 'Asynchronous (Batch, Queueable, Future)', 'SOQL / SOSL', 'Test-driven development'],
  },
  {
    title: 'Lightning Web Components',
    icon: 'component',
    items: ['LWC & Aura', 'Lightning Data Service', 'Custom UI & app pages', 'Component-driven design'],
  },
  {
    title: 'Automation',
    icon: 'flow',
    items: ['Flow (Screen, Record-Triggered)', 'Approval processes', 'Platform Events', 'Declarative + programmatic'],
  },
  {
    title: 'Integrations',
    icon: 'plug',
    items: ['REST / SOAP callouts', 'Named Credentials & OAuth', 'Middleware patterns', 'External Services'],
  },
  {
    title: 'Data & Modeling',
    icon: 'data',
    items: ['Custom objects & schema design', 'Sharing & security model', 'Large data volumes', 'Reports & dashboards'],
  },
  {
    title: 'DevOps & Delivery',
    icon: 'devops',
    items: ['Salesforce DX (SFDX)', 'Git & CI/CD', 'Scratch orgs', 'Deployment & release mgmt'],
  },
];

export const about = {
  intro: 'Salesforce Developer & Platform Engineer',
  // TODO: rewrite in your own voice — this is a strong starting draft.
  paragraphs: [
    'I started out learning to program the way a lot of people do — building small full-stack projects and figuring things out as I went. Over the past several years I’ve grown into a Salesforce Developer, delivering solutions that solve real business problems on the platform.',
    'I care about clean, well-tested Apex, thoughtful automation that admins can actually maintain, and integrations that don’t fall over. I’m equally comfortable talking through requirements with stakeholders and debugging a governor-limit issue at 4:59pm on a Friday.',
    'I’m always learning — new features every release, new certifications, new patterns. This site itself is built with Lit web components, the same standard Lightning Web Components are built on.',
  ],
};

/* Certifications — add one object per cert.
   Put each badge image in /public/certs/ and point `logo` at it.
   `url` is optional (link to your verified credential). */
export const certifications = [
  // TODO: replace with your real certs + downloaded Trailhead badge logos.
  { name: 'Platform Developer I', logo: '/certs/pd1.png', url: null },
  { name: 'Administrator', logo: '/certs/admin.png', url: null },
  { name: 'Platform App Builder', logo: '/certs/app-builder.png', url: null },
];

/* Experience — text-driven, structured. Each role has impact bullets. */
export const experience = [
  {
    // TODO: fill in with your real roles
    role: 'Salesforce Developer',
    company: 'Company Name',
    period: '2021 — Present',
    bullets: [
      'Built and maintained Apex services and Lightning Web Components supporting daily operations for X users.',
      'Designed record-triggered Flows and automation that reduced manual work / handling time.',
      'Integrated Salesforce with external systems via REST callouts and Named Credentials.',
    ],
  },
  {
    role: 'Previous Role',
    company: 'Company Name',
    period: '2019 — 2021',
    bullets: [
      'Impact bullet — start with a verb, quantify the result where you can.',
      'Impact bullet.',
    ],
  },
];

/* Projects / case studies.
   - `liveDemo` names an interactive component to embed (renders as a
     full-width featured case study with problem / approach / result).
   - `repo` / `demo` are optional external links. */
export const projects = [
  {
    title: 'Property Matching Map for Housing Case Workers',
    context: 'Housing services nonprofit · delivered through a Salesforce consulting partner',
    summary:
      'A Lightning Web Component that shows case workers every nearby rental (available now or opening soon) right from a client’s record.',
    problem:
      'Case workers placing clients into housing had to cross-reference property lists against client addresses by hand. There was no way to see what was close to a client, or what would open up in the next few weeks.',
    approach: [
      'Built an LWC for Property and Person Account record pages, plus an address-search version for app and home pages.',
      'Apex resolves the starting point per record type: stored geolocation for properties, a live REST geocoding callout for a client’s mailing address.',
      'A SOQL DISTANCE()/GEOLOCATION() query returns available and soon-available units within a radius, rendered as color-coded pins with rent, bedrooms and access details.',
      'Friendly error handling for addresses that can’t be geocoded, and Apex test classes with mocked callouts.',
    ],
    // TODO: add a measurable result if you have one (time saved per placement, adoption, etc.)
    result:
      'Case workers see every nearby match in one view from the record they are already on, instead of searching property lists by hand.',
    tags: ['LWC', 'Apex', 'SOQL Geolocation', 'REST Callout', 'lightning-map'],
    liveDemo: 'property-map',
    demoNote:
      'Live re-creation: real address geocoding, with generated sample listings in place of client data. The original runs the same flow through Apex and SOQL.',
    repo: null,
    demo: null,
  },
];

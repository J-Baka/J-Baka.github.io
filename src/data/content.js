/* =============================================================
   ALL EDITABLE CONTENT LIVES HERE.
   Change your bio, skills, certs, experience, and projects in
   this one file — you never need to touch the component code.

   Anything marked  // TODO  is a placeholder for you to fill in.
   ============================================================= */

/* Whole years elapsed since a 'YYYY-MM' start, so the site never goes stale. */
const yearsSince = (start) => {
  const [y, m] = start.split('-').map(Number);
  const now = new Date();
  return Math.floor((now.getFullYear() - y) + (now.getMonth() + 1 - m) / 12);
};

export const profile = {
  name: 'Matt Hernandez',
  role: 'Salesforce Developer',
  // Computed from when I started on Salesforce (Revolent Group, Jan 2022).
  yearsExperience: yearsSince('2022-01'),
  tagline:
    'I design and build on the Salesforce platform — Apex, Lightning Web Components, and integrations that connect Salesforce to the rest of the business.',
  location: 'Menifee, CA',
  email: 'matthewph96@gmail.com',
  linkedin: 'https://www.linkedin.com/in/hernan-p-matt/',
  github: 'https://github.com/J-Baka',
  resume: '/resume.pdf',
  trailhead: 'https://www.salesforce.com/trailblazer/mhernandez267',
  headshot: '/img/Matt_Headshot.jpg',
};

// Front-and-center skills. Reorder / edit freely.
export const skills = [
  {
    title: 'OmniStudio',
    icon: 'layers',
    items: [
      'OmniScripts & FlexCards',
      'DataRaptors / Data Mappers',
      'Integration Procedures',
      'Document Generation',
      'Firm SME & practice lead',
    ],
  },
  {
    title: 'Apex & Integrations',
    icon: 'code',
    items: [
      'Apex classes, triggers & test classes',
      'Custom Apex REST web services',
      'Callouts & bidirectional data sync',
      'SOQL',
      'Java, Python & JavaScript',
    ],
  },
  {
    title: 'Lightning & Experience Cloud',
    icon: 'component',
    items: [
      'Lightning Web Components',
      'Experience Cloud sites & portals',
      'Custom internal apps & forms',
      'HTML / CSS / JavaScript',
    ],
  },
  {
    title: 'Automation & AI',
    icon: 'ai',
    items: [
      'Flow (Screen, Record-Triggered, Scheduled)',
      'Agentforce agents & actions',
      'Prompt Builder templates',
      'Financial Services Cloud',
    ],
  },
  {
    title: 'DevOps & Delivery',
    icon: 'devops',
    items: [
      'Copado (led firm-wide adoption)',
      'Salesforce DX & Git',
      'Release management across environments',
      'Agile delivery with Jira',
    ],
  },
  {
    title: 'Consulting & Leadership',
    icon: 'people',
    items: [
      '25+ client projects delivered',
      'Requirements & stakeholder management',
      'Technical architecture design',
      'Led dev teams of 1–5',
    ],
  },
];

export const about = {
  intro: 'Salesforce Developer & OmniStudio Lead',
  paragraphs: [
    'I studied Electrical & Computer Engineering at California Baptist University and started my career at HCL Technologies, writing Python test automation for Google across Android devices, including in-vehicle testing alongside BMW’s development team.',
    'In 2022 I moved onto the Salesforce platform with Revolent Group, delivering three Financial Services Cloud projects for Cognizant and leading small development teams. Today I’m a Salesforce Developer at Provisio Partners, where I lead the firm’s OmniStudio practice, drove its adoption of Copado, and have contributed to 25+ client projects, from Experience Cloud portals and document generation to Apex integrations and program-eligibility systems.',
    'I’m always learning: new features every release, new certifications, new patterns. This site itself is built with Lit web components, the same standard Lightning Web Components are built on.',
  ],
};

/* Certifications — add one object per cert.
   Put each badge image in /public/certs/ and point `logo` at it.
   `url` is optional (link to your verified credential). */
export const certifications = [
  { name: 'Platform Developer', logo: '/certs/platform-developer.png', earned: 'Mar 2022', url: null },
  { name: 'OmniStudio Developer', logo: '/certs/omnistudio-developer.png', earned: 'Apr 2022', url: null },
  { name: 'Agentforce Specialist', logo: '/certs/agentforce-specialist.png', earned: 'Dec 2024', url: null },
  { name: 'Platform Administrator', logo: '/certs/platform-administrator.png', earned: 'Feb 2022', url: null },
  { name: 'Platform App Builder', logo: '/certs/platform-app-builder.png', earned: 'Jul 2025', url: null },
];

/* Experience — text-driven, structured. Each role has impact bullets. */
export const experience = [
  {
    role: 'Salesforce Developer',
    company: 'Provisio Partners',
    period: 'Feb 2024 — Present',
    bullets: [
      'Lead OmniStudio practices across the firm as the company SME — building custom document generation, Experience Cloud–hosted interfaces, internal applications, and forms for multiple clients.',
      'Lead the firm’s adoption of Copado, establishing source-driven deployment practices and managing releases across project environments for reliable, repeatable delivery.',
      'Developed custom Apex web services integrating Salesforce with external databases, enabling bidirectional data exchange and streamlined data management.',
      'Contributed to 25+ projects spanning full implementation lifecycles, on-demand debugging, managed services support, and technical architecture design.',
      'Serve as a technical resource for clients on complex implementations, including tax solutions, Experience Cloud deployments, and program eligibility systems.',
    ],
  },
  {
    role: 'Salesforce Developer',
    company: 'Revolent Group',
    client: 'Cognizant',
    period: 'Jan 2022 — 2023',
    bullets: [
      'Delivered the full software development lifecycle — design, implementation, and delivery — for three Financial Services Cloud projects.',
      'Built Lightning Web Components and Apex services using object-oriented principles to meet specific business and architecture requirements.',
      'Designed user flows and elevated UI experiences through OmniStudio development.',
      'Led a technical team of 1–5 developers, owning technical decisions through successful project execution.',
      'Troubleshot integration issues and bugs through system analysis and testing, delivering with no customer-requested rework.',
      'Worked in an Agile, multi-disciplinary team using Jira.',
    ],
  },
  {
    role: 'Software Developer',
    company: 'HCL Technologies',
    client: 'Google',
    period: 'Dec 2020 — Jan 2022',
    bullets: [
      'Built and maintained Python automation scripts for device and application testing.',
      'Wrote functional and regression test cases with engineering counterparts, and validated new features across a wide range of Android OS builds and devices.',
      'Coordinated between development and vendor teams to clarify project requirements.',
      'Partnered with BMW’s development team on in-vehicle console and driving tests using a test vehicle.',
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
  {
    // TODO: adjust the context/problem/result to match the real project you built.
    title: 'Guided Storefront with OmniScript & FlexCards',
    context: 'OmniStudio build · guided request flow',
    summary:
      'An OmniScript whose first step is a storefront of FlexCards. Card actions talk to the script over pubsub, so the selection flows straight into the guided process.',
    problem:
      'Users needed to browse a catalog, see details, and build a request in one guided flow, without jumping between a product list, a record page and a separate form.',
    approach: [
      'Product catalog rendered as FlexCards with states for in stock, low stock, out of stock and already added, fed by a DataRaptor.',
      'Card actions fire pubsub events (item focused, selected, removed) on a shared channel instead of coupling cards to the script.',
      'The OmniScript registers for those events, writes the selection into its data JSON, and fires an update back so every card reflects what is in the request.',
      'Later steps configure quantity and options per line, then review totals before submitting.',
    ],
    result:
      'One guided experience from browsing to submission, with loosely coupled components that can be reused on other pages or scripts.',
    tags: ['OmniScript', 'FlexCards', 'PubSub', 'LWC', 'DataRaptor'],
    liveDemo: 'storefront',
    demoNote:
      'Live re-creation in web components. The panels below the demo show the data JSON and every pubsub event as it fires.',
    repo: null,
    demo: null,
  },
  {
    title: 'Document Generation with OmniStudio DataMappers',
    context: 'OmniStudio DocGen · forms and summaries for multiple clients',
    summary:
      'Word templates filled straight from Salesforce records: Extract and Transform DataMappers shape the data into tokens, and the template renders checkboxes, repeating tables and signatures.',
    problem:
      'Programs needed consistent, signed documents (enrollment summaries, assessments, consent forms) built from data already in Salesforce, with checkboxes, related lists and signatures, instead of staff retyping it into Word.',
    approach: [
      'Word templates with Mustache-style tokens: {{Field}} values, {{#List}} sections that repeat per related record, and paired {{#IF_x}} / {{^IF_x}} sections around ☑ / ☐ for checkboxes.',
      'An Extract DataMapper queries the record and its related lists; formulas turn picklists and multi-selects into IF_ booleans (LIKE "%;Value;%" contains checks, ISBLANK for tri-state Yes / No / blank).',
      'A Transform DataMapper flattens the result to exactly the token names the template expects, formats dates, and sizes signature images pulled from ContentDocument files.',
      'Hygiene checks on existing mappers: template tokens with no matching key, duplicate mapping rows, and stale template attachments.',
    ],
    result:
      'Staff generate a complete, signed document from the record they are already on, and adding a field to a form is a template token plus a mapping row rather than new code.',
    tags: ['OmniStudio DocGen', 'DataMappers', 'Word Templates', 'Formulas', 'ContentDocument'],
    liveDemo: 'docgen',
    demoNote:
      'Edit the record or sign the pad and the document regenerates. The tabs underneath show each stage, and the template is editable: break a token and watch the token check catch it.',
    repo: null,
    demo: null,
  },
];

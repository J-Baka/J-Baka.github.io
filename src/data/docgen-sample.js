/* Sample data, mapping rows, and Word-style template for the DocGen demo.
   All names and records here are made up. */
import { age, getPath } from '../lib/docgen.js';

export const PROGRAMS = ['Housing Stability', 'Workforce Readiness', 'Youth Mentoring'];
export const STATUSES = ['Active', 'Waitlisted', 'Exited'];
export const SERVICES = [
  { value: 'Case Management', token: 'IF_SvcCaseMgmt' },
  { value: 'Rental Assistance', token: 'IF_SvcRental' },
  { value: 'Employment Support', token: 'IF_SvcEmployment' },
  { value: 'Transportation', token: 'IF_SvcTransport' },
];
export const RELATIONSHIPS = ['Spouse', 'Child', 'Parent', 'Sibling', 'Other'];

export const SIGNATURE_ID = '069DEMO00000001';

export const initialRecord = () => ({
  clientName: 'Jordan Rivera',
  birthdate: '1990-06-14',
  program: 'Housing Stability',
  startDate: '2026-03-02',
  status: 'Active',
  services: ['Case Management', 'Rental Assistance'],
  consent: 'Yes',
  household: [
    { name: 'Alex Rivera', relationship: 'Spouse', age: 34 },
    { name: 'Sam Rivera', relationship: 'Child', age: 7 },
  ],
});

/* What the Extract DataMapper would return: the record and its related
   lists, nested under the output paths its queries write to. */
export const toExtractJson = (r, hasSignature) => ({
  PE: {
    Id: '0sxDEMO00000001',
    Name: 'PE-000123',
    StartDate: r.startDate || null,
    Status: r.status,
    Consent__c: r.consent || null,
    Services__c: r.services.length ? r.services.join(';') : null,
    Program: { Name: r.program },
    Account: { Name: r.clientName || null, PersonBirthdate: r.birthdate || null },
  },
  Household: r.household.map((h) => ({ Name: h.name, Relationship__c: h.relationship, Age__c: h.age })),
  Signature: { ContentDocumentId: hasSignature ? SIGNATURE_ID : null },
});

const contains = (json, value) => `;${getPath(json, 'PE:Services__c') ?? ''};`.includes(`;${value};`);
const today = () => {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
};

/* Mapping rows, shaped like OmniDataTransformItem records. `expr` is the
   formula as it would read in the DataMapper; `fn` is what the demo runs. */
export const MAPPING_ROWS = [
  { kind: 'map', from: 'PE:Name', to: 'EnrollmentNumber' },
  { kind: 'formula', expr: 'FORMATDATETIME(TODAY(), "MM/dd/yyyy")', to: 'GeneratedDate', fn: today },
  { kind: 'map', from: 'PE:Account:Name', to: 'ClientName' },
  { kind: 'map', from: 'PE:Account:PersonBirthdate', to: 'ClientDOB', format: 'Date(MM/dd/yyyy)' },
  { kind: 'formula', expr: 'AGE(%PE:Account:PersonBirthdate%)', to: 'ClientAge', fn: (j) => age(getPath(j, 'PE:Account:PersonBirthdate')) },
  { kind: 'map', from: 'PE:Program:Name', to: 'ProgramName' },
  { kind: 'map', from: 'PE:StartDate', to: 'StartDate', format: 'Date(MM/dd/yyyy)' },
  ...STATUSES.map((s) => ({
    kind: 'formula',
    expr: `%PE:Status% == "${s}"`,
    to: `IF_Status${s}`,
    fn: (j) => getPath(j, 'PE:Status') === s,
  })),
  ...SERVICES.map(({ value, token }) => ({
    kind: 'formula',
    expr: `(";" + %PE:Services__c% + ";") LIKE "%;${value};%"`,
    to: token,
    fn: (j) => contains(j, value),
  })),
  { kind: 'map', from: 'PE:Consent__c', to: 'IF_Consent', valueMap: { Yes: 'true', No: 'false' }, format: 'Boolean' },
  { kind: 'formula', expr: 'ISBLANK(%PE:Consent__c%)', to: 'IF_ConsentBlank', fn: (j) => !getPath(j, 'PE:Consent__c') },
  { kind: 'formula', expr: 'ISNOTBLANK(%Household%)', to: 'IF_HasHousehold', fn: (j) => (j.Household ?? []).length > 0 },
  { kind: 'list', from: 'Household', to: 'HH', fields: { Name: 'Name', Relationship: 'Relationship__c', Age: 'Age__c' } },
  { kind: 'image', from: 'Signature:ContentDocumentId', to: 'IMG_Client', width: 200, height: 70 },
];

const box = (token, label) =>
  `{{#${token}}}☑{{/${token}}}{{^${token}}}☐{{/${token}}}\u00A0${label.replace(/ /g, '\u00A0')}`;

export const DEFAULT_TEMPLATE = `<h1>Program Enrollment Summary</h1>
<p class="meta">Enrollment {{EnrollmentNumber}} · Generated {{GeneratedDate}}</p>

<h2>Participant</h2>
<table class="kv">
  <tr><th>Name</th><td>{{ClientName}}</td><th>Date of birth</th><td>{{ClientDOB}}{{#ClientAge}} (age {{ClientAge}}){{/ClientAge}}</td></tr>
  <tr><th>Program</th><td>{{ProgramName}}</td><th>Start date</th><td>{{StartDate}}</td></tr>
</table>

<h2>Enrollment status</h2>
<p class="checks">${STATUSES.map((s) => box(`IF_Status${s}`, s)).join('    ')}</p>

<h2>Services</h2>
<p class="checks">${SERVICES.map((s) => box(s.token, s.value)).join('    ')}</p>

<h2>Household members</h2>
{{#IF_HasHousehold}}<table class="list">
  <tr><th>Name</th><th>Relationship</th><th>Age</th></tr>
  {{#HH}}<tr><td>{{Name}}</td><td>{{Relationship}}</td><td>{{Age}}</td></tr>{{/HH}}
</table>{{/IF_HasHousehold}}
{{^IF_HasHousehold}}<p class="note">No household members listed.</p>{{/IF_HasHousehold}}

<h2>Consent to share information</h2>
<p class="checks">{{^IF_ConsentBlank}}{{#IF_Consent}}☑ Yes    ☐ No{{/IF_Consent}}{{^IF_Consent}}☐ Yes    ☑ No{{/IF_Consent}}{{/IF_ConsentBlank}}{{#IF_ConsentBlank}}☐ Yes    ☐ No    <em>(not yet answered)</em>{{/IF_ConsentBlank}}</p>

<div class="sig">
  {{#IMG_Client}}{{IMG_Client}}{{/IMG_Client}}{{^IMG_Client}}<p class="note">Awaiting participant signature</p>{{/IMG_Client}}
  <p class="sigline">{{ClientName}}, Participant</p>
</div>`;

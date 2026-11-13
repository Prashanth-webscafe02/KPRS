// Site copy and data. Section components render from here, so content
// corrections are made in one place without touching markup or motion.
//
// SOURCES: facts below are taken from the official site, https://kprs.in
// (index, contact, power, distribution, dry, furnace pages; re-read 2026-11-13).
// The site writes "KV" for ratings where kVA is evidently meant; it is shown as kVA.
//
// AWAITING CLIENT CONFIRMATION (search "CONFIRM"):
//  - Distribution upper rating: the site says both "25KV to 3150 KV" (intro) and
//    "25 KV to 2500 KV" (spec list). Only the verified lower bound is shown.
//  - Which phone number is primary: all three published numbers are shown.
//  - The test certificate is a specimen with illustrative values (labelled on the page).
import type { DrawingName } from '@/three/drawings';
import { company } from './company';

export const sheets = [
  { no: '01', id: 'top', title: 'Reveal', content: 'The machine' },
  { no: '02', id: 'winding', title: 'Winding', content: 'On method' },
  { no: '03', id: 'anatomy', title: 'Anatomy', content: 'Section through a power transformer' },
  { no: '04', id: 'range', title: 'Range', content: 'Five product families' },
  { no: '05', id: 'record', title: 'Test record', content: 'What leaves the works' },
  { no: '06', id: 'sectors', title: 'Sectors', content: 'Where the load is' },
  { no: '07', id: 'enquire', title: 'Enquire', content: 'Title block' },
] as const;

export const hero = {
  lede: 'Power, distribution, dry-type and furnace-duty transformers — designed, wound and routine-tested in Bangalore since 1992.',
  // Annotations describe the parts of the illustrative 3D model; no invented ratings.
  notes: [
    { anchor: 'bushing', letter: 'A', name: 'HV bushing', detail: 'Brings the winding out through the cover' },
    { anchor: 'conservator', letter: 'B', name: 'Conservator', detail: 'Lets the oil expand and breathe' },
    { anchor: 'radiator', letter: 'C', name: 'Radiator bank', detail: 'Sheds the heat from the oil' },
  ],
  // power.php: "5 MVA and upto 50 MVA"; "facility to build and test … 50 MVA and 132 KV class";
  // "Reference Standards : IEC 60076, IS 2026, IS 1180"
  meta: [
    { term: 'Rating to', value: '50 MVA', count: 50, suffix: ' MVA' },
    { term: 'Voltage class', value: '132 kV', count: 132, suffix: ' kV' },
    { term: 'Standard', value: 'IEC 60076' },
  ] as { term: string; value: string; count?: number; suffix?: string }[],
};

export const winding = {
  statement:
    'A transformer is not assembled. It is wound — one turn of conductor at a time, under controlled tension, around a core cut to a hundredth of a millimetre. Every decision afterwards, from the oil to the radiators to the final test, exists to protect what was wound.',
  aside: 'We design, wind, dry, tank and test under one roof. Nothing that carries current is subcontracted.',
  materials: 'CRGO M4 core · Paper-insulated copper · Vapour-phase drying',
  totalTurns: 1184,
};

export const anatomy = {
  kicker: 'Section through a power transformer',
  steps: [
    { no: '03.1', title: 'Tank & cooling', body: 'A welded mild-steel tank, shot-blasted and epoxy-coated, carries the oil that insulates and cools. Detachable radiator banks shed the heat by natural convection, with fans for forced-air rating.', label: 'Tank wall, stiffened', anchor: 'tank' },
    { no: '03.2', title: 'Cover & bushings', body: 'The cover carries the bushings that bring the windings out through the tank, the conservator that lets the oil breathe, and the protection — Buchholz, pressure relief, winding temperature.', label: 'Cover assembly lifted', anchor: 'cover' },
    { no: '03.3', title: 'Core', body: 'Three limbs of cold-rolled grain-oriented steel, stacked in a step-lap pattern with mitred joints. The stepped section fills the circle; the step-lap keeps no-load loss and noise down.', label: 'CRGO core, step-lap', anchor: 'core' },
    { no: '03.4', title: 'Windings', body: 'Low-voltage winding nearest the core, high-voltage outside, separated by pressboard barriers and oil ducts. Copper conductor, paper-insulated, clamped and pre-shrunk before it ever sees the tank.', label: 'HV winding', anchor: 'winding' },
    { no: '03.5', title: 'Reassembled', body: 'Active part dried under vacuum, lowered into the tank, filled with degassed oil and held for impregnation. Then the test bay — and nothing ships without its record.', label: 'Ready for routine test', anchor: 'tank' },
  ],
};

export interface Plate {
  num: string;
  drawing: DrawingName;
  name: [string, string];
  body: string;
  spec: [string, string][];
  href: string;
}

export const plates: Plate[] = [
  // distribution.php. CONFIRM upper rating: 2 500 kVA (spec list) vs 3 150 kVA (intro).
  { num: 'I', drawing: 'distribution', href: '/products/distribution-transformers', name: ['Distribution', 'transformers'], body: 'For multi-storey buildings and industries. Off-load or on-load tap changers, to customer requirement.',
    spec: [['Rating', 'from 25 kVA'], ['Primary', '11 / 22 / 33 kV'], ['Secondary', '433 V'], ['Standards', 'IS 1180 · IS 2026']] },
  // power.php
  { num: 'II', drawing: 'power', href: '/products/power-transformers', name: ['Power', 'transformers'], body: 'Substation units with on-load tap changers, built and tested in-house to 132 kV class.',
    spec: [['Rating', '5 – 50 MVA'], ['Primary', '33 / 66 / 132 kV'], ['Secondary', '11 / 22 / 33 kV'], ['Tap change', 'On-load, 17 positions']] },
  // dry.php
  { num: 'III', drawing: 'dry', href: '/products/dry-type-transformers', name: ['Dry-type', 'transformers'], body: 'No oil, air cooled. For hotels, complexes and multi-storey buildings where the transformer lives indoors.',
    spec: [['Rating', '63 – 2 000 kVA'], ['Voltage', '11 000 / 433 V'], ['Class', 'F / H insulation'], ['Standard', 'IS 11171']] },
  // furnace.php
  { num: 'IV', drawing: 'furnace', href: '/products/furnace-duty-transformers', name: ['Furnace', 'duty'], body: 'Built to the application, with customised ratings and off-load rotary tap switches.',
    spec: [['Rating', '63 – 2 500 kVA'], ['Cooling', 'Oil / forced oil'], ['Tap change', 'Off-load rotary'], ['Frequency', '50 Hz']] },
  // index: "Other product for application such as furnace, isolation, motor starting
  // are also manufactured to customer specification."
  { num: 'V', drawing: 'special', href: '/products#special', name: ['Isolation &', 'motor starting'], body: 'Special-application transformers, manufactured to customer specification.',
    spec: [['Application', 'Isolation'], ['Application', 'Motor starting'], ['Built', 'To specification']] },
];

export const record = {
  lede: 'Every unit is routine-tested to IS 2026 and IS 1180, and its test report goes to the customer. This is the shape of one, abridged.',
  head: ['Test certificate', 'Unit S/N —', 'IS 2026 / IEC 60076'],
  specimen: 'Specimen — illustrative values',
};

// distribution.php, dry.php, power.php
export const sectors = [
  { no: '06.1', name: 'Transmission', note: 'Power transformers, 132 kV class' },
  { no: '06.2', name: 'Industry', note: 'Distribution supply for plants & works' },
  { no: '06.3', name: 'Buildings', note: 'Multi-storey buildings, hotels & complexes' },
  { no: '06.4', name: 'Furnaces', note: 'Furnace-duty supply, built to application' },
];

// contact.php. CONFIRM which number is primary; all three published numbers are listed.
export const contact = {
  email: company.email,
  phones: company.phones,
  works: [company.address.street, `${company.address.locality}, ${company.address.city}, ${company.address.region}, ${company.address.country}`],
};

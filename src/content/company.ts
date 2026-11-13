// Company, product and facility content for the inner pages.
//
// SOURCE: the official site, https://kprs.in — index, about, power, distribution,
// dry, furnace, process, infrastructure, certificate, services, guidelines and
// contact pages (read 2026-11-13). Copy is edited for clarity; no fact is added.
// The official site writes "KV" for ratings where kVA is evidently meant; ratings
// below are shown in kVA / MVA.
//
// AWAITING CLIENT CONFIRMATION (search "CONFIRM"), deliberately NOT published:
//  - Distribution upper rating: "25KV to 3150 KV" (intro) vs "25 KV to 2500 KV" (spec).
//  - ISO 9001 edition: "ISO 9001-2008" (about, footer) vs "ISO 9001:2015" (certificate).
//    Shown as "ISO 9001" only.
//  - Factory area: "total area of 14000 sq ft with covered area of over 40000 sq ft"
//    (covered cannot exceed total). No area is shown.
//  - 132 kV: power.php says KPRS "is presently supporting" 132 kV; infrastructure.php
//    says it is "in the process of augmenting" capacity for 132 kV. Shown as the
//    power page states it ("build and test … 50 MVA and 132 kV class").
//  - Client names: clients.php shows logos only, no names. No Clients page.
//  - Primary telephone number: all three published numbers are listed.
import type { StaticImageData } from 'next/image';
import power from '@/assets/kprs/product-power.jpg';
import distribution from '@/assets/kprs/product-distribution.jpg';
import dry from '@/assets/kprs/product-dry.jpg';
import furnace from '@/assets/kprs/product-furnace.jpg';
import pCca from '@/assets/kprs/process-cca.jpg';
import pCcaHv from '@/assets/kprs/process-cca-hv.jpg';
import pCcaLv from '@/assets/kprs/process-cca-lv.jpg';
import pDrying from '@/assets/kprs/process-drying.jpg';
import pFinal1 from '@/assets/kprs/process-final-1.jpg';
import pFinal2 from '@/assets/kprs/process-final-2.jpg';
import pOven1 from '@/assets/kprs/process-oven-1.jpg';
import pOven2 from '@/assets/kprs/process-oven-2.jpg';
import pPaint from '@/assets/kprs/process-painting.jpg';
import pTest1 from '@/assets/kprs/process-testing-1.jpg';
import pTest2 from '@/assets/kprs/process-testing-2.jpg';
import pWinding from '@/assets/kprs/process-winding.jpg';
import pWindings from '@/assets/kprs/process-windings.jpg';
import aboutPhoto from '@/assets/kprs/about.jpg';

export interface Photo { src: StaticImageData; alt: string }

export const company = {
  name: 'Kiran Power Rectification Services Pvt. Ltd.',
  brand: 'KPRS Transformers',
  short: 'KPRS',
  established: 1992,
  city: 'Bangalore',
  email: 'sales@kprsindia.com',
  phones: [
    { label: '080 4207 7095', href: 'tel:+918042077095' },
    { label: '+91 97411 58600', href: 'tel:+919741158600' },
    { label: '+91 99015 99774', href: 'tel:+919901599774' },
  ],
  whatsapp: 'https://wa.me/919901599774',
  address: {
    street: 'Plot No. 10, Bommasandra–Jigani Link Road',
    locality: 'Bommasandra',
    city: 'Bangalore',
    region: 'Karnataka',
    country: 'India',
  },
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Plot+No.+10+Bommasandra+Jigani+Link+Road+Bommasandra+Bangalore',
  social: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kprs-transformers-b3b280174/' },
    { label: 'Instagram', href: 'https://www.instagram.com/kprstrans' },
    { label: 'X / Twitter', href: 'https://twitter.com/Kprstrans' },
  ],
  officialSite: 'https://kprs.in',
};

/* ------------------------------------------------------------------ about */

export const about = {
  photo: { src: aboutPhoto, alt: 'KPRS team at a meeting table reviewing engineering drawings' } as Photo,
  intro:
    'Kiran Power Rectification Services is a transformer manufacturer and service company in Bangalore. It designs, builds, tests and services power, distribution, dry-type and furnace-duty transformers, and sells them under the KPRS brand across southern India.',
  paragraphs: [
    'KPRS was established in 1992 to serve the needs of the power sector. It has since grown into transformer manufacturing: designing power and distribution transformers to the specifications of distribution companies, utilities, electricity boards and REC, as well as star-rated energy-efficient units.',
    'Alongside standard designs, KPRS engineers customised transformers for the specific duty a customer describes.',
  ],
  promoter:
    'KPRS is promoted by Mr. R. Ramarao, who serves as a Director. He is a technocrat and entrepreneur with wide experience of running a business efficiently.',
  outlook:
    'Demand for power transformers is growing across every sector of industry. KPRS is strengthening its design division with experienced senior engineers and investing in plant, process and infrastructure to meet it.',
  vision:
    'Value for money, and an uninterrupted supply of power to the end user. Customers’ growing demands are met by working with them, to their standards.',
  principles: [
    'Develop quality as a habit; keep updating the skills of the people who build the machines.',
    'Involve staff in setting and meeting targets.',
    'Treat vendors as partners in meeting the customer’s quality needs.',
    'Make an uncompromising effort to satisfy the customer.',
  ],
  registrations: [
    { k: 'BIS', v: 'Licensed' },
    { k: 'ISO 9001', v: 'Certified' },
    { k: 'MSME & SSI', v: 'Registered' },
    { k: 'BEE', v: 'Star-rated transformers' },
  ],
};

export const qualityPolicy = [
  'Supply quality products that meet customer requirements.',
  'Ensure total customer satisfaction.',
  'Quality by process control.',
  'Quality in all functions.',
  'Delivery, in time, every time.',
  'Continual improvement of processes.',
  'Build teams that work in a focused environment.',
  'Comply with national and international standards, with a system orientation to ISO requirements.',
];

/* --------------------------------------------------------------- products */

export interface Product {
  slug: string;
  name: string;
  short: string;
  index: string;
  photo: Photo;
  lede: string;
  body: string[];
  headline: [string, string][];
  specs: [string, string][];
  applications: string[];
  engineering: { title: string; body: string }[];
  accessories?: { standard: string[]; optional: string[] };
  note?: string;
}

const POWER_STANDARD = [
  'Rating and diagram plate', 'Earthing terminals (2)', 'Lifting lugs (2)', 'Oil level indicator',
  'Drain-cum-bottom filter valve with plug', 'Thermometer pocket', 'Air release plug',
  'Oil conservator with drain plug', 'Dehydrating silica gel breather', 'Top filter valve with plug',
  'Cooling radiators', 'HV terminals — outdoor bushings', 'LV terminals — outdoor bushings',
  'Explosion vent with diaphragm', 'Off-load tap changer',
];
const POWER_OPTIONAL = [
  'LV cable box with additional neutral bushing / bus duct', 'HV cable box', 'Uni-directional flat rollers',
  'Buchholz relay with trip and alarm', 'Dial thermometer with contacts', 'Jacking lugs',
  'Marshalling box', 'Magnetic oil level gauge', 'Winding temperature indicator with trip and alarm',
  'Oil temperature indicator with trip and alarm', 'Oil surge relay', 'On-load tap changer with AVR and RTCC panel',
];

export const products: Product[] = [
  {
    slug: 'power-transformers',
    name: 'Power transformers',
    short: 'Power',
    index: '01',
    photo: { src: power, alt: 'KPRS power transformer with conservator, radiators and on-load tap changer control panel' },
    lede: 'The link between the companies that generate power and the ones that distribute it.',
    body: [
      'Transmission joins generation to distribution, and power transformers make that joint. KPRS supplies transmission companies with power transformers of the 132 kV class.',
      'The works has the facilities to build and test power transformers of up to 50 MVA in the 132 kV class.',
    ],
    headline: [['Rating', '5 – 50 MVA'], ['Voltage class', 'up to 132 kV'], ['Tap changer', 'On-load, 17 position']],
    specs: [
      ['Rating', '5 MVA up to 50 MVA'],
      ['Primary voltage', '33 / 66 / 132 kV'],
      ['Secondary voltage', '11 / 22 / 33 kV; other classes to order'],
      ['Tap changer', 'On-load, 17 positions'],
      ['Frequency', '50 / 60 Hz'],
      ['Vector group', 'As per IS 2026 and IEC'],
      ['Standards', 'IEC 60076 · IS 2026 · IS 1180'],
    ],
    applications: ['Transmission companies', 'Grid and receiving substations', 'Large industrial supply'],
    engineering: [
      { title: 'Vacuum drying', body: 'Power transformers above 33 kV are dried under vacuum, so the paper and pressboard insulation reaches the tank free of moisture.' },
      { title: 'On-load regulation', body: 'A 17-position on-load tap changer, available with automatic voltage regulation and a remote tap-change control (RTCC) panel.' },
      { title: 'Protection', body: 'Buchholz relay, oil-surge relay and winding and oil temperature indicators with trip and alarm contacts can be fitted.' },
    ],
    accessories: { standard: POWER_STANDARD, optional: POWER_OPTIONAL },
  },
  {
    slug: 'distribution-transformers',
    name: 'Distribution transformers',
    short: 'Distribution',
    index: '02',
    photo: { src: distribution, alt: 'KPRS oil-filled distribution transformer with conservator and radiators' },
    lede: 'The last step down: power delivered to industries, buildings and consumers.',
    body: [
      'Distribution transformers carry power to consumers through a ring main or similar network. KPRS builds them in oil-filled construction.',
      'Customers choose aluminium or copper conductor for the active part. The choice is usually set by the local distribution authority, which also limits the capacity.',
      'KPRS distribution transformers are BIS licensed, and star-rated energy-efficient units are built to the levels recommended by BEE under IS 1180.',
    ],
    // CONFIRM upper rating (2 500 vs 3 150 kVA): only the verified lower bound is shown.
    headline: [['Rating', 'from 25 kVA'], ['Primary', '11 / 22 / 33 kV'], ['Secondary', '433 V']],
    specs: [
      ['Rating', 'from 25 kVA'],
      ['Primary voltage', '11 / 22 / 33 kV'],
      ['Secondary voltage', '433 V, or other classes to order'],
      ['Cooling', 'Oil cooled / air cooled'],
      ['Tap changer', 'Off-load, 5, 7 or 9 positions; on-load, 9, 11 or 17 positions'],
      ['Frequency', '50 / 60 Hz'],
      ['Conductor', 'Aluminium or copper'],
      ['Vector group', 'As per IS 1180 and IS 2026'],
    ],
    applications: ['Industries and works', 'Multi-storey buildings', 'Utility distribution networks', 'Ring-main supply'],
    engineering: [
      { title: 'Energy efficiency', body: 'Star-rated designs to the energy-efficiency levels of IS 1180, as recommended by the Bureau of Energy Efficiency.' },
      { title: 'Conductor choice', body: 'Aluminium or copper windings, to the stipulation of the local distribution authority.' },
      { title: 'Air drying', body: 'Distribution transformers below the 33 kV class are air-dried before tanking.' },
    ],
    note: 'Upper rating to be confirmed with KPRS for your requirement.',
  },
  {
    slug: 'dry-type-transformers',
    name: 'Dry-type transformers',
    short: 'Dry-type',
    index: '03',
    photo: { src: dry, alt: 'KPRS dry-type transformer in a ventilated enclosure' },
    lede: 'No oil. Low maintenance. Made to live indoors, close to the load.',
    body: [
      'KPRS builds class F and class H dry-type transformers conforming to IS 11171. They are housed in a ventilated enclosure of a suitable IP class, with HV taps controlled by an off-circuit link or an on-load tap changer.',
      'The self-quenching insulation helps contain fire, so the transformer can be installed close to the load centre — in dust, humidity, or salt- and chemical-laden air.',
    ],
    headline: [['Rating', '63 – 2 000 kVA'], ['Voltage', '11 000 / 433 V'], ['Insulation', 'Class F / H']],
    specs: [
      ['Rating', '63 – 2 000 kVA, with or without OLTC'],
      ['Voltage', '11 000 / 433 V'],
      ['Insulation class', 'F / H'],
      ['Cooling', 'Air cooled'],
      ['Tap changer', 'Fixed tap; off-load 5-position link in 2.5 % steps; or 17-position OLTC'],
      ['Frequency', '50 Hz'],
      ['Termination', 'Bare bushings, cable boxes or bus duct'],
      ['Vector group', 'To customer requirement'],
      ['Standard', 'IS 11171'],
    ],
    applications: ['Hotels', 'Commercial complexes', 'Multi-storey buildings', 'Dusty, humid or corrosive sites'],
    engineering: [
      { title: 'Fire behaviour', body: 'Self-quenching insulation materials help contain fire, allowing installation near the load centre.' },
      { title: 'Enclosure', body: 'Ventilated enclosure with an IP class chosen for the site.' },
      { title: 'Maintenance', body: 'With no oil to filter or test, routine maintenance is light.' },
    ],
  },
  {
    slug: 'furnace-duty-transformers',
    name: 'Furnace-duty transformers',
    short: 'Furnace duty',
    index: '04',
    photo: { src: furnace, alt: 'KPRS furnace-duty transformer with conservator and rotary off-load tap switch' },
    lede: 'High currents for melting metal, and a design that takes repeated short circuits.',
    body: [
      'Furnace transformers develop the high currents that melt metal held in a crucible. They see heavy short circuits, intermittently, as molten metal is charged and discharged.',
      'Their design is critical to the application. They are generally given protection between the primary and secondary windings against the surges that are frequent while the furnace is being charged.',
    ],
    headline: [['Rating', '63 – 2 500 kVA'], ['Cooling', 'Oil / forced oil'], ['Tap change', 'Off-load rotary']],
    specs: [
      ['Rating', '63 – 2 500 kVA, or customised'],
      ['Voltage class', 'Suitable to application'],
      ['Cooling', 'Oil cooled; forced-oil cooled'],
      ['Tap changer', 'Off-load, rotary-type switches'],
      ['Frequency', '50 Hz'],
      ['Vector group', 'Suitable to application'],
    ],
    applications: ['Metal-melting furnaces', 'Foundries', 'Applications with frequent load surges'],
    engineering: [
      { title: 'Short-circuit duty', body: 'Built for heavy, intermittent short circuits during charging and discharging.' },
      { title: 'Surge protection', body: 'Protection between primary and secondary windings for the surges that occur while charging.' },
      { title: 'Built to the furnace', body: 'Ratings, voltages and vector group are set by the application.' },
    ],
  },
];

export const productBySlug = (slug: string) => products.find(p => p.slug === slug);

export const special =
  'Transformers for other applications — isolation and motor starting among them — are manufactured to customer specification.';

export const services = {
  intro: 'KPRS maintains a service and maintenance department to keep transformers in continuous, uninterrupted service.',
  items: [
    { title: 'Maintenance', body: 'Periodic oil filtration and attention to minor defects at site.' },
    { title: 'Annual maintenance contracts', body: 'Year-round maintenance, aimed especially at small and medium enterprises, with time-bound response at short notice.' },
    { title: 'Repairs', body: 'Repair of transformers from any manufacturer.' },
    { title: 'Modification', body: 'Conversion from off-load tap switch to on-load tap changer, and back, to the customer’s requirement.' },
  ],
};

/* ---------------------------------------------------------- manufacturing */

export interface ProcessStep { no: string; title: string; summary: string; body: string[]; photos: Photo[] }

export const process: ProcessStep[] = [
  {
    no: '01', title: 'Core assembly',
    summary: 'The frame everything else is built on.',
    body: [
      'The core is built from cold-rolled grain-oriented silicon steel, in the thickness and grade that sets the loss per kilogram when the transformer is energised. Rising power tariffs make that choice central to an economical design.',
      'Laminations are mitred and assembled in a step-lap formation with minimal joint gaps. A clamping frame of standard IS angles, channels or plate, held by vertical and horizontal tie rods, carries the core, the feet and the supports for the tap and line terminals.',
    ],
    photos: [],
  },
  {
    no: '02', title: 'Winding',
    summary: 'Primary and secondary windings, in copper or aluminium.',
    body: [
      'Windings are made from high-conductivity electrical-grade copper or aluminium, drawn to round or rectangular section. Conductor and insulation are chosen for the voltage class, current, cooling and clearances.',
      'Coils are wound as helical or spiral, multi-turn bobbin, single-coil multi-turn, or continuous and split disc windings, and transposed to keep eddy-current loss low. Cooling ducts keep the oil flowing freely past every surface.',
    ],
    photos: [
      { src: pWinding, alt: 'Winding machines on the KPRS shop floor' },
      { src: pWindings, alt: 'Horizontal winding machine with a coil in progress' },
    ],
  },
  {
    no: '03', title: 'Core–coil assembly',
    summary: 'The active part: windings fitted on the core.',
    body: [
      'The core–coil assembly sets the insulation scheme, cooling, dynamic withstand and handling of the transformer. Major insulation withstands the high voltages and separates primary from secondary; minor insulation covers turns and joints.',
      'Sudden loading and unloading produce buckling and bursting forces in the windings. Radial and axial supports, and firm axial clamping, keep those forces from causing damage.',
    ],
    photos: [
      { src: pCca, alt: 'Core–coil assembly with tap leads and on-load tap changer' },
      { src: pCcaHv, alt: 'Core–coil assembly, HV side, with insulated leads' },
      { src: pCcaLv, alt: 'Core–coil assembly, LV side' },
    ],
  },
  {
    no: '04', title: 'Drying',
    summary: 'Moisture out of the paper and wood insulation.',
    body: [
      'Much of a transformer’s insulation is paper- and wood-based, and it draws in moisture that weakens it at high voltage. Drying is carried out at stages that depend on rating and voltage class.',
      'Distribution transformers below the 33 kV class are air-dried. Power transformers above 33 kV are dried under vacuum.',
    ],
    photos: [
      { src: pOven1, alt: 'Core–coil assembly at the door of the vacuum drying oven' },
      { src: pOven2, alt: 'Vacuum drying oven in the KPRS works' },
    ],
  },
  {
    no: '05', title: 'Tank & final assembly',
    summary: 'The active part goes into its tank.',
    body: [
      'The tank is fabricated from mild steel of adequate thickness. It holds the active part with the right clearances for voltage and oil flow, and it must be leak-proof and withstand pressure.',
      'The active part is lowered in and every internal clearance is checked. Terminations come out through porcelain or epoxy-cast bushings; valves for filling, filtration, sampling and draining are fitted, with a conservator for the oil’s expansion and protection devices such as the Buchholz relay as required.',
    ],
    photos: [
      { src: pFinal1, alt: 'Active part with insulated leads ready for tanking' },
      { src: pFinal2, alt: 'Insulated winding on its former' },
      { src: pDrying, alt: 'Three-limb core–coil assembly with clamping frame' },
    ],
  },
  {
    no: '06', title: 'Testing & inspection',
    summary: '100 % routine testing, and a report for every unit.',
    body: [
      'Every transformer is routine-tested to IS 2026 and IS 1180. Test reports and certificates for each KPRS transformer are made available to the customer.',
    ],
    photos: [
      { src: pTest1, alt: 'Test control desk in the KPRS test area' },
      { src: pTest2, alt: 'Winding conductor drum and machines on the shop floor' },
    ],
  },
  {
    no: '07', title: 'Painting & dispatch',
    summary: 'Primed, finished and sent.',
    body: [
      'Tanks are primer-coated, then given a finish coat — generally shade 631 admiralty grey to IS 5, or another colour named in the purchase order. Touch-up paint is supplied on request, and the transformer is dispatched on the agreed terms.',
    ],
    photos: [{ src: pPaint, alt: 'Transformer in the KPRS painting booth' }],
  },
];

/* --------------------------------------------------------- infrastructure */

export const infrastructure = {
  location: 'Bommasandra Industrial Area, Bangalore',
  design:
    'The company’s strength is in design. Experienced engineers develop HV-class transformers using in-house design software, and a customised resource-planning system runs enquiries, order booking, production planning, purchasing, inventory and sales reporting.',
  production:
    'Every assembly and sub-assembly is produced in-house and checked by stage inspection. Staff are trained across processes, and flexible manufacturing makes the most of the floor space. Customers visit for inspection, vendor development and audits.',
  machinery: [
    'EOT cranes', 'HV winding machines', 'LV winding machines', 'Heating oven with vacuum drying',
    'Bending and punching machine', 'Band saw', 'Drilling machine', 'Welding transformers',
    'Vacuum filter machine', 'Fabricated oil storage tank', 'Underground storage tank',
    'Bench grinder', 'Insulation cutting machine', 'Painting booth',
  ],
  photos: [
    { src: pWinding, alt: 'Winding bay with HV and LV winding machines' },
    { src: pOven2, alt: 'Vacuum drying oven' },
    { src: pPaint, alt: 'Painting booth' },
    { src: pTest1, alt: 'Test control desk' },
  ] as Photo[],
};

/* ---------------------------------------------------------------- quality */

export const testEquipment = [
  { name: 'High-voltage test transformer', detail: '70 kV and 170 kV' },
  { name: 'Motor-generator set', detail: 'For high-frequency testing' },
  { name: 'Intermediate transformer', detail: '' },
  { name: 'Ratio meter', detail: '' },
  { name: 'Megger', detail: 'Insulation resistance' },
  { name: 'Micro-ohm meter', detail: 'Winding resistance' },
  { name: 'Power analyser', detail: '' },
  { name: 'BDV tester', detail: 'Oil breakdown voltage' },
  { name: 'Dimmerstat', detail: '' },
  { name: 'Oil filtration system', detail: '' },
  { name: 'Pressure gauges and flow meter', detail: '' },
  { name: 'Micrometer, vernier caliper, steel scale and tape', detail: 'Dimensional inspection' },
  { name: 'Air compressor', detail: '' },
];

export const standards = [
  { code: 'IS 2026', scope: 'Power transformers' },
  { code: 'IS 1180', scope: 'Distribution transformers, including energy-efficiency levels (IS 1180:2014 and amendments)' },
  { code: 'IS 11171', scope: 'Dry-type transformers' },
  { code: 'IEC 60076', scope: 'Power transformers' },
  { code: 'IS 5', scope: 'Finish paint colours (shade 631, admiralty grey)' },
];

export const approvals = [
  { name: 'BIS licence', body: 'Bureau of Indian Standards' },
  { name: 'Star-rated transformers', body: 'Bureau of Energy Efficiency (BEE)' },
  { name: 'ISO 9001', body: 'Quality management system' },
  { name: 'BESCOM approval', body: 'Bangalore Electricity Supply Company' },
  { name: 'MESCOM approval', body: 'Mangalore Electricity Supply Company' },
  { name: 'CHESCOM approval', body: 'Chamundeshwari Electricity Supply Corporation' },
];

/* ------------------------------------------------------------ navigation */

export const nav = [
  { href: '/about', label: 'About' },
  { href: '/products', label: 'Products' },
  { href: '/manufacturing', label: 'Manufacturing' },
  { href: '/infrastructure', label: 'Infrastructure' },
  { href: '/quality', label: 'Quality' },
] as const;

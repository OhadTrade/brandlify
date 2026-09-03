/**
 * Guards the one property the lead pipeline depends on: the schema must be able
 * to re-parse its own output.
 *
 * The browser validates with `leadSchema`, then posts the PARSED values; the API
 * route parses that body with the same schema. If an optional field is
 * `.optional()` rather than `.nullish()`, the parsed value is `null`, the server
 * rejects it, and every genuine enquiry fails validation on the server after
 * passing on the client. That bug is invisible until someone tries to submit the
 * real form, so it is asserted here instead.
 *
 * Run as part of `npm run verify`.
 */
import { leadSchema } from '../src/lib/leadSchema.ts';

const samples = [
  {
    label: 'minimum viable lead',
    input: { name: 'ישראל ישראלי', phone: '052-217-4188', consent: true },
  },
  {
    label: 'every field filled',
    input: {
      name: 'ישראל ישראלי',
      phone: '0522174188',
      email: 'test@example.com',
      business_type: 'מוסך',
      services_interested: ['בניית אתרים'],
      message: 'שלום',
      consent: true,
      source_page: '/contact',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'launch',
    },
  },
  {
    label: 'empty strings where the form leaves blanks',
    input: {
      name: 'ישראל ישראלי',
      phone: '+972522174188',
      email: '',
      business_type: '',
      message: '',
      services_interested: [],
      consent: true,
      company_website: '',
    },
  },
];

let failures = 0;

for (const { label, input } of samples) {
  const first = leadSchema.safeParse(input);
  if (!first.success) {
    console.error(`FAIL  ${label}: valid input rejected`);
    console.error('     ', first.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
    failures++;
    continue;
  }

  // The round trip the browser and the API route actually perform.
  const second = leadSchema.safeParse(first.data);
  if (!second.success) {
    console.error(`FAIL  ${label}: schema cannot re-parse its own output`);
    console.error('     ', second.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
    failures++;
    continue;
  }

  console.log(`PASS  ${label}`);
}

// Rejections that must hold.
const mustReject = [
  ['no consent', { name: 'ישראל ישראלי', phone: '0522174188', consent: false }],
  ['bad phone', { name: 'ישראל ישראלי', phone: '12345', consent: true }],
  ['short name', { name: 'א', phone: '0522174188', consent: true }],
  ['bad email', { name: 'ישראל ישראלי', phone: '0522174188', email: 'nope', consent: true }],
];

for (const [label, input] of mustReject) {
  if (leadSchema.safeParse(input).success) {
    console.error(`FAIL  ${label}: should have been rejected`);
    failures++;
  } else {
    console.log(`PASS  rejects ${label}`);
  }
}

if (failures) {
  console.error(`\n${failures} schema check(s) failed.`);
  process.exit(1);
}
console.log('\nLead schema is round-trip safe.');

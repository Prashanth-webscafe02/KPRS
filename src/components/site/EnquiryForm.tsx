'use client';

// Product enquiry form with client-side validation.
// DEMO: no form backend is configured, so nothing is sent from the page. A valid
// submission says so plainly and offers the same enquiry as a pre-filled email.
import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { company, products } from '@/content/company';

type Field = 'name' | 'company' | 'email' | 'phone' | 'product' | 'message';
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

const OPTIONS = [
  ...products.map(p => ({ value: p.slug, label: p.name })),
  { value: 'special', label: 'Special application (isolation, motor starting, other)' },
  { value: 'service', label: 'Service, repair or AMC' },
  { value: 'other', label: 'Something else' },
];

function validate(v: Values): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Please enter a valid email address, e.g. name@company.com.';
  const digits = v.phone.replace(/\D/g, '');
  if (v.phone.trim() && (!/^[+\d\s()-]+$/.test(v.phone) || digits.length < 8 || digits.length > 15)) e.phone = 'Please enter a phone number with 8 to 15 digits, or leave it blank.';
  if (!v.product) e.product = 'Please choose what the enquiry is about.';
  if (v.message.trim().length < 10) e.message = 'Please describe the requirement in at least a few words.';
  return e;
}

export default function EnquiryForm() {
  const params = useSearchParams();
  const pre = params.get('product') ?? '';
  const [values, setValues] = useState<Values>({
    name: '', company: '', email: '', phone: '',
    product: OPTIONS.some(o => o.value === pre) ? pre : '', message: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [done, setDone] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const status = useRef<HTMLDivElement>(null);

  const set = (f: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const next = { ...values, [f]: e.target.value };
    setValues(next);
    if (touched[f]) setErrors(validate(next));
  };
  const blur = (f: Field) => () => { setTouched(t => ({ ...t, [f]: true })); setErrors(validate(values)); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    setTouched({ name: true, company: true, email: true, phone: true, product: true, message: true });
    const first = (Object.keys(errs) as Field[])[0];
    if (first) { form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus(); return; }
    setDone(true);
    requestAnimationFrame(() => status.current?.focus());
  };

  const label = OPTIONS.find(o => o.value === values.product)?.label ?? '';
  const mailto = `mailto:${company.email}?subject=${encodeURIComponent(`Enquiry: ${label}`)}&body=${encodeURIComponent(
    `Name: ${values.name}\nCompany: ${values.company}\nEmail: ${values.email}\nPhone: ${values.phone}\nProduct: ${label}\n\n${values.message}`,
  )}`;

  const err = (f: Field) => (touched[f] && errors[f]) ? errors[f] : undefined;
  const fieldProps = (f: Field) => ({
    id: `f-${f}`, name: f, value: values[f], onChange: set(f), onBlur: blur(f),
    'aria-invalid': err(f) ? true : undefined,
    'aria-describedby': err(f) ? `f-${f}-err` : undefined,
  });
  const errText = (f: Field) => err(f) ? <p className="fm__err" id={`f-${f}-err`}>{err(f)}</p> : null;

  if (done) {
    return (
      <div className="fm-done" ref={status} tabIndex={-1} role="status">
        <p className="fm-done__tag">Demo form — not sent</p>
        <h3>Your enquiry has not been sent.</h3>
        <p>This website does not have a form backend yet, so nothing has left your browser. To send the enquiry now, open it in your email app — the details you entered are already filled in.</p>
        <div className="fm-done__actions">
          <a className="btn btn--accent btn--lg" href={mailto}>Open as email to {company.email}</a>
          <button type="button" className="link-arrow" onClick={() => setDone(false)}>Edit the enquiry</button>
        </div>
        <p className="fm-done__alt">Or call <a href={company.phones[0].href}>{company.phones[0].label}</a>.</p>
      </div>
    );
  }

  return (
    <form ref={form} className="fm" noValidate onSubmit={submit} aria-describedby="fm-demo">
      <p className="fm__demo" id="fm-demo"><strong>Demo form.</strong> No backend is connected yet: submitting will not send anything, but will offer to open the enquiry as an email.</p>
      <div className="fm__row">
        <div className="fm__field">
          <label htmlFor="f-name">Name <span aria-hidden="true">*</span></label>
          <input {...fieldProps('name')} type="text" autoComplete="name" required />
          {errText('name')}
        </div>
        <div className="fm__field">
          <label htmlFor="f-company">Company</label>
          <input {...fieldProps('company')} type="text" autoComplete="organization" />
        </div>
      </div>
      <div className="fm__row">
        <div className="fm__field">
          <label htmlFor="f-email">Email <span aria-hidden="true">*</span></label>
          <input {...fieldProps('email')} type="email" autoComplete="email" inputMode="email" required />
          {errText('email')}
        </div>
        <div className="fm__field">
          <label htmlFor="f-phone">Phone</label>
          <input {...fieldProps('phone')} type="tel" autoComplete="tel" inputMode="tel" />
          {errText('phone')}
        </div>
      </div>
      <div className="fm__field">
        <label htmlFor="f-product">Product interest <span aria-hidden="true">*</span></label>
        <div className="fm__select">
          <select {...fieldProps('product')} required>
            <option value="" disabled>Choose a product or service</option>
            {OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {errText('product')}
      </div>
      <div className="fm__field">
        <label htmlFor="f-message">Requirement <span aria-hidden="true">*</span></label>
        <textarea {...fieldProps('message')} rows={6} required placeholder="Rating, voltage ratio, vector group, cooling, site conditions, quantity…" />
        {errText('message')}
      </div>
      <div className="fm__foot">
        <button type="submit" className="btn btn--accent btn--lg">Check &amp; continue</button>
        <p className="fm__req"><span aria-hidden="true">*</span> Required</p>
      </div>
    </form>
  );
}

import { type FormEvent, useState } from 'react';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { createLead } from '../../leads/lead.service';
import type { PublicCopy } from '../i18n';

type SubmitState = 'idle' | 'sending' | 'sent' | 'failed';

type ContactSectionProps = {
  copy: PublicCopy['contact'];
};

export function ContactSection({ copy }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!email.trim() && !phone.trim()) {
      setError(copy.contactRequired);
      return;
    }

    try {
      setSubmitState('sending');
      await createLead({
        name: name.trim(),
        company: company.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
      });

      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setMessage('');
      setSubmitState('sent');
    } catch (caughtError) {
      setSubmitState('failed');
      setError(caughtError instanceof Error ? caughtError.message : copy.failed);
    }
  }

  return (
    <section id="contact" className="bg-[#0C0C0C] px-5 py-24 sm:px-10 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="mb-4 text-sm font-light uppercase tracking-[0.35em] text-white/45">{copy.eyebrow}</p>
          <h2 className="text-5xl font-black uppercase leading-none tracking-[-0.06em] text-white sm:text-7xl">
            {copy.headline}
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/55">
            {copy.body}
          </p>
        </div>

        <form className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-7" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-white/45">{copy.name}</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={80}
                className="h-12 w-full rounded-lg border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/35"
                placeholder={copy.namePlaceholder}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-white/45">{copy.company}</span>
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                maxLength={100}
                className="h-12 w-full rounded-lg border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/35"
                placeholder={copy.companyPlaceholder}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-white/45">{copy.email}</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                maxLength={120}
                className="h-12 w-full rounded-lg border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/35"
                placeholder={copy.emailPlaceholder}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-white/45">{copy.phone}</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                maxLength={40}
                className="h-12 w-full rounded-lg border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/35"
                placeholder={copy.phonePlaceholder}
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-white/45">{copy.message}</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
              maxLength={1200}
              rows={6}
              className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-white/35"
              placeholder={copy.messagePlaceholder}
            />
          </label>

          {error ? <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
          {submitState === 'sent' ? (
            <p className="mt-4 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {copy.sent}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitState === 'sending'}
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-3 rounded-full bg-white px-5 text-sm font-bold uppercase text-zinc-950 transition hover:bg-[#BBCCD7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitState === 'sending' ? <Loader2 className="animate-spin" size={17} /> : <ArrowUpRight size={17} />}
            {submitState === 'sending' ? copy.sending : copy.submit}
          </button>
        </form>
      </div>
    </section>
  );
}

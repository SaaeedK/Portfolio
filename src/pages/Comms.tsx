import { useCallback, useState } from 'react';
import { FileText, Github, Linkedin, ExternalLink, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { site, externalHref, getResumeHref } from '@/data/site';

const CONTACT_API = (import.meta.env.VITE_CONTACT_API_URL || '/api/contact').replace(/\/$/, '');
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() || '';

function errorMessage(code: string): string {
  switch (code) {
    case 'rate_limited':
      return 'Too many messages from this network. Please try again later.';
    case 'geo_blocked':
      return 'Contact is only accepted from allowed regions.';
    case 'geo_unavailable':
      return 'Your request could not be verified for location. Try again from a normal browser connection.';
    case 'disposable_email':
      return 'Disposable or temporary email addresses are not accepted. Use a stable inbox (e.g. Gmail, Outlook, school/work).';
    case 'email_domain_unreachable':
      return 'That email domain cannot receive mail (no valid mail servers found). Check the address.';
    case 'unsupported_media_type':
      return 'Invalid request format.';
    case 'turnstile_required':
    case 'turnstile_failed':
      return 'Human verification failed. Refresh the page and try again.';
    case 'turnstile_misconfigured':
      return 'Contact form is temporarily misconfigured.';
    case 'invalid_email':
      return 'Please enter a valid email address.';
    case 'missing_fields':
      return 'Please fill in name, email, and message.';
    case 'field_too_long':
      return 'One of the fields is too long. Shorten and try again.';
    case 'payload_too_large':
      return 'Message is too large.';
    case 'contact_not_configured':
      return 'The contact service is not configured yet.';
    case 'origin_not_allowed':
      return 'Request was blocked (origin).';
    case 'send_failed':
      return 'Could not send right now. Please try again or use your résumé email.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export const Comms = () => {
  const github = externalHref(site.githubUrl, '#');
  const linkedin = externalHref(site.linkedinUrl, '#');
  const resumeHref = getResumeHref();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorText, setErrorText] = useState('');

  const resetTurnstile = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.trim() !== '') return;
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setStatus('error');
      setErrorText('Please complete the verification widget.');
      return;
    }
    setStatus('sending');
    setErrorText('');
    try {
      const res = await fetch(CONTACT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message,
          website: honeypot,
          'cf-turnstile-response': turnstileToken ?? '',
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus('error');
        setErrorText(errorMessage(data.error ?? 'unknown'));
        resetTurnstile();
        return;
      }
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
      resetTurnstile();
    } catch {
      setStatus('error');
      setErrorText(
        'Network error. For local development, run `npm run pages:dev` in another terminal (see .env.example).',
      );
      resetTurnstile();
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="mb-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-primary-fixed tracking-tighter mb-4 drop-shadow-[0_0_10px_rgba(0,251,251,0.3)]">
          CONTACT
        </h1>
        <p className="font-mono text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          Send a secure message (validated server-side, optional bot check, rate limits) or use the profiles and résumé
          below. Email delivery uses a{' '}
          <a
            href="https://developers.cloudflare.com/pages/functions/"
            className="text-primary-fixed hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cloudflare Pages Function
          </a>{' '}
          and{' '}
          <a href="https://resend.com/docs" className="text-primary-fixed hover:underline" target="_blank" rel="noopener noreferrer">
            Resend
          </a>
          — API keys stay on the server, not in the browser bundle.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8 flex flex-col gap-8" aria-labelledby="message-heading">
          <div className="bento-card p-6 md:p-10 relative overflow-hidden">
            <div className="flex justify-between items-start mb-8 border-b border-primary-fixed/20 pb-6">
              <h2 id="message-heading" className="font-mono text-base font-bold text-on-surface uppercase tracking-widest flex items-center gap-4">
                Message <span className="text-primary-fixed opacity-50">TLS</span>
              </h2>
              <Send size={22} className="text-primary-fixed/50" aria-hidden />
            </div>

            {status === 'success' ? (
              <div className="flex flex-col gap-4 text-on-surface-variant text-sm" role="status">
                <div className="flex items-center gap-3 text-primary-fixed">
                  <CheckCircle2 className="shrink-0" size={22} aria-hidden />
                  <span className="font-mono">Message sent. Thanks — I will get back to you when I can.</span>
                </div>
                <button type="button" className="terminal-button self-start text-xs mt-2" onClick={() => setStatus('idle')}>
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-name" className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                      Name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      maxLength={120}
                      required
                      value={name}
                      onChange={(ev) => setName(ev.target.value)}
                      className="rounded border border-outline-variant/40 bg-surface-container/40 px-3 py-2 font-mono text-sm text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-fixed"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-email" className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      required
                      value={email}
                      onChange={(ev) => setEmail(ev.target.value)}
                      className="rounded border border-outline-variant/40 bg-surface-container/40 px-3 py-2 font-mono text-sm text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-fixed"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-message" className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={6}
                    maxLength={8000}
                    value={message}
                    onChange={(ev) => setMessage(ev.target.value)}
                    className="rounded border border-outline-variant/40 bg-surface-container/40 px-3 py-2 font-mono text-sm text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-fixed resize-y min-h-[140px]"
                  />
                </div>

                <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="contact-website">Company website</label>
                  <input
                    id="contact-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(ev) => setHoneypot(ev.target.value)}
                  />
                </div>

                {TURNSTILE_SITE_KEY ? (
                  <div className="min-h-[65px]">
                    <Turnstile
                      siteKey={TURNSTILE_SITE_KEY}
                      options={{ theme: 'dark' }}
                      onSuccess={setTurnstileToken}
                      onExpire={() => setTurnstileToken(null)}
                      onError={() => setTurnstileToken(null)}
                    />
                  </div>
                ) : null}

                {status === 'error' && errorText ? (
                  <p className="text-sm font-mono text-red-400/90" role="alert">
                    {errorText}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="terminal-button inline-flex items-center justify-center gap-2 self-start disabled:opacity-50"
                >
                  {status === 'sending' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 shrink-0" aria-hidden />
                      Send message
                    </>
                  )}
                </button>

                <p className="text-[10px] font-mono text-on-surface-variant opacity-80 leading-relaxed">
                  No SQL or database in this path: the function validates JSON and calls Resend over HTTPS. Configure
                  server secrets in Cloudflare Pages (not <span className="text-primary-fixed">VITE_*</span>). See{' '}
                  <span className="text-on-surface">.env.example</span>.
                </p>
              </form>
            )}
          </div>

          <div className="bento-card p-6 md:p-10 relative overflow-hidden" aria-labelledby="resume-heading">
            <div className="flex justify-between items-start mb-8 border-b border-primary-fixed/20 pb-6">
              <h2 id="resume-heading" className="font-mono text-base font-bold text-on-surface uppercase tracking-widest flex items-center gap-4">
                Résumé <span className="text-primary-fixed opacity-50">PDF</span>
              </h2>
              <FileText size={22} className="text-primary-fixed/50" aria-hidden />
            </div>

            <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
              {resumeHref === '/resume.pdf' ? (
                <>
                  Served at <span className="font-mono text-primary-fixed">/resume.pdf</span> from{' '}
                  <span className="font-mono text-on-surface">public/resume.pdf</span> (copied into <span className="font-mono text-on-surface">dist</span>{' '}
                  on build and deployed with the site).
                </>
              ) : (
                <>
                  Résumé URL from <span className="font-mono text-primary-fixed">VITE_RESUME_URL</span>:{' '}
                  <span className="font-mono text-primary-fixed">{resumeHref}</span>
                </>
              )}
            </p>

            <a
              href={resumeHref}
              className="terminal-button inline-flex items-center gap-3 text-sm"
              target="_blank"
              rel="noopener noreferrer"
              title="Opens résumé PDF in a new tab"
            >
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
              Open résumé
            </a>
          </div>
        </section>

        <section className="lg:col-span-4 flex flex-col gap-8" aria-label="Profiles">
          <div className="bento-card p-6">
            <h3 className="font-mono text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-8 border-b border-white/5 pb-4">Profiles</h3>
            <div className="flex flex-col gap-4">
              {[
                { name: 'GitHub', icon: Github, href: github },
                { name: 'LinkedIn', icon: Linkedin, href: linkedin },
              ].map((link) =>
                link.href === '#' ? (
                  <div
                    key={link.name}
                    className="flex items-center justify-between p-4 bg-surface-container/50 border border-outline-variant/30 opacity-50"
                  >
                    <div className="flex items-center gap-4">
                      <link.icon size={18} className="text-on-surface-variant" aria-hidden />
                      <span className="font-mono text-xs text-on-surface">{link.name} (set env URL)</span>
                    </div>
                    <ExternalLink size={14} className="text-on-surface-variant" aria-hidden />
                  </div>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-surface-container/50 border border-outline-variant/30 hover:border-primary-fixed/50 hover:bg-primary-fixed/5 transition-all group/link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-fixed rounded"
                  >
                    <div className="flex items-center gap-4">
                      <link.icon size={18} className="text-on-surface-variant group-hover/link:text-primary-fixed transition-colors" aria-hidden />
                      <span className="font-mono text-xs text-on-surface group-hover/link:text-primary-fixed transition-colors">{link.name}</span>
                    </div>
                    <ExternalLink size={14} className="text-on-surface-variant group-hover/link:text-primary-fixed transition-colors" aria-hidden />
                  </a>
                )
              )}
            </div>
            <p className="mt-4 text-[10px] font-mono text-on-surface-variant opacity-70">
              Set <span className="text-primary-fixed">VITE_GITHUB_URL</span> and <span className="text-primary-fixed">VITE_LINKEDIN_URL</span> in{' '}
              <span className="text-on-surface">.env.local</span> or Cloudflare Pages env.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

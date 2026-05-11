import { useState, type FormEvent } from 'react';
import { Send, Key, Github, Linkedin, ExternalLink } from 'lucide-react';
import { site, externalHref } from '@/data/site';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Comms = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const github = externalHref(site.githubUrl, '#');
  const linkedin = externalHref(site.linkedinUrl, '#');
  const configuredEmail = site.email?.trim();

  const validate = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Name is required.';
    if (!email.trim()) next.email = 'Email is required.';
    else if (!emailPattern.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!message.trim()) next.message = 'Message is required.';
    else if (message.trim().length < 10) next.message = 'Please write at least a few sentences (10+ characters).';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(false);
    setFormError('');
    if (!validate()) return;

    if (!configuredEmail) {
      setFormError('Set VITE_EMAIL in .env.local (e.g. you@domain.com) to enable opening a mail draft from this form.');
      return;
    }

    const subject = encodeURIComponent(`Portfolio contact from ${name.trim()}`);
    const body = encodeURIComponent(`${message.trim()}\n\n— ${name.trim()} <${email.trim()}>`);
    window.location.href = `mailto:${configuredEmail}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="mb-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-primary-fixed tracking-tighter mb-4 drop-shadow-[0_0_10px_rgba(0,251,251,0.3)]">
          CONTACT
        </h1>
        <div className="flex items-center gap-3 font-mono text-xs text-secondary-fixed">
          <div className="w-2 h-2 rounded-full bg-secondary-fixed shadow-[0_0_8px_rgba(76,227,70,0.8)]" aria-hidden />
          <span>Use the form to open your mail client, or use the links on the right.</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8" aria-labelledby="contact-form-heading">
          <div className="bento-card p-6 md:p-10 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-10 border-b border-primary-fixed/20 pb-6">
              <h2 id="contact-form-heading" className="font-mono text-base font-bold text-on-surface uppercase tracking-widest flex items-center gap-4">
                Message <span className="text-primary-fixed opacity-50">via mailto</span>
              </h2>
              <Send size={20} className="text-primary-fixed/50" aria-hidden />
            </div>

            <form className="space-y-10" onSubmit={handleSubmit} noValidate>
              <div className="space-y-4">
                <label htmlFor="identity" className="font-mono text-xs text-primary-fixed font-bold uppercase tracking-widest block">
                  Name
                </label>
                <div className="relative flex items-center bg-surface-container/50 border border-outline-variant/30 focus-within:border-primary-fixed transition-all group/input">
                  <span className="pl-4 pr-3 font-mono text-primary-fixed text-sm opacity-50" aria-hidden>
                    &gt;
                  </span>
                  <input
                    id="identity"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-transparent border-none py-4 px-0 focus:ring-0 font-mono text-sm text-on-surface placeholder:text-white/20"
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'identity-error' : undefined}
                  />
                </div>
                {errors.name ? (
                  <p id="identity-error" className="text-error-fixed text-xs font-mono">
                    {errors.name}
                  </p>
                ) : null}
              </div>

              <div className="space-y-4">
                <label htmlFor="frequency" className="font-mono text-xs text-primary-fixed font-bold uppercase tracking-widest block">
                  Email
                </label>
                <div className="relative flex items-center bg-surface-container/50 border border-outline-variant/30 focus-within:border-primary-fixed transition-all group/input">
                  <span className="pl-4 pr-3 font-mono text-primary-fixed text-sm opacity-50" aria-hidden>
                    &gt;
                  </span>
                  <input
                    id="frequency"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent border-none py-4 px-0 focus:ring-0 font-mono text-sm text-on-surface placeholder:text-white/20"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'frequency-error' : undefined}
                  />
                </div>
                {errors.email ? (
                  <p id="frequency-error" className="text-error-fixed text-xs font-mono">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-4">
                <label htmlFor="payload" className="font-mono text-xs text-primary-fixed font-bold uppercase tracking-widest block">
                  Message
                </label>
                <div className="relative flex items-start bg-surface-container/50 border border-outline-variant/30 focus-within:border-primary-fixed transition-all group/input">
                  <span className="pl-4 pr-3 pt-4 font-mono text-primary-fixed text-sm opacity-50" aria-hidden>
                    &gt;
                  </span>
                  <textarea
                    id="payload"
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What would you like to discuss?"
                    rows={6}
                    className="w-full bg-transparent border-none py-4 px-0 focus:ring-0 font-mono text-sm text-on-surface placeholder:text-white/20 resize-none min-h-44"
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'payload-error' : undefined}
                  />
                </div>
                {errors.message ? (
                  <p id="payload-error" className="text-error-fixed text-xs font-mono">
                    {errors.message}
                  </p>
                ) : null}
              </div>

              {formError ? (
                <p className="font-mono text-xs text-error-fixed" role="alert">
                  {formError}
                </p>
              ) : null}

              {submitted ? (
                <p className="font-mono text-xs text-secondary-fixed" role="status">
                  If your mail client opened, send the message from there. Thanks.
                </p>
              ) : null}

              <div className="pt-6 flex justify-end">
                <button
                  type="submit"
                  className="group relative px-10 py-4 bg-transparent border border-primary-fixed text-primary-fixed font-mono text-sm font-bold tracking-widest uppercase hover:bg-primary-fixed hover:text-background transition-all duration-300 shadow-[0_0_15px_rgba(0,251,251,0.1)] hover:shadow-[0_0_30px_rgba(0,251,251,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-fixed"
                >
                  <span className="flex items-center gap-3">
                    Open mail client
                    <span className="w-2 h-4 bg-current blinking-cursor" aria-hidden />
                  </span>
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="lg:col-span-4 flex flex-col gap-8" aria-label="Profiles and encryption">
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
              <span className="text-on-surface">.env.local</span>.
            </p>
          </div>

          <div className="bento-card p-6 flex-1 flex flex-col relative group overflow-hidden">
            <div className="absolute top-2 right-4 flex gap-1.5 h-6 items-end" aria-hidden>
              <div className="w-1.5 h-2 bg-secondary-fixed opacity-30" />
              <div className="w-1.5 h-6 bg-secondary-fixed opacity-60" />
              <div className="w-1.5 h-4 bg-secondary-fixed opacity-90" />
            </div>

            <h3 className="font-mono text-xs font-bold text-secondary-fixed uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <Key size={16} aria-hidden /> Encrypted email
            </h3>

            <p className="text-[11px] text-on-surface-variant leading-relaxed mb-4">
              Prefer OpenPGP? Publish your real public key block on your site or a keyserver and paste it here, or link to a{' '}
              <code className="text-primary-fixed/90">keys.openpgp.org</code> profile. The previous placeholder block was removed so visitors are not
              misled.
            </p>

            <div className="bg-[#050a0a] border border-outline-variant/20 p-5 rounded font-mono text-[10px] leading-relaxed text-on-surface/60 grow">
              <p>Add your ASCII-armored key or a short note on how you prefer to be contacted for sensitive topics.</p>
            </div>

            <div className="mt-6 font-mono text-[10px] tracking-widest text-on-surface-variant opacity-80">
              <span className="text-on-surface/30">FINGERPRINT:</span>{' '}
              <span className="text-secondary-fixed">Configure when you add a real key</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

import React from 'react';
import { Send, Key, Github, Linkedin, ExternalLink, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const Comms = () => {
  return (
    <div className="flex flex-col gap-8">
      <header className="mb-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-primary-fixed tracking-tighter mb-4 drop-shadow-[0_0_10px_rgba(0,251,251,0.3)]">
          SECURE_COMMS
        </h1>
        <div className="flex items-center gap-3 font-mono text-xs text-secondary-fixed">
          <div className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse shadow-[0_0_8px_rgba(76,227,70,0.8)]" />
          <span>STATUS: ENCRYPTED CHANNEL OPEN // WAITING FOR PAYLOAD</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <section className="lg:col-span-8">
          <div className="bento-card p-6 md:p-10 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-10 border-b border-primary-fixed/20 pb-6">
              <h2 className="font-mono text-base font-bold text-on-surface uppercase tracking-widest flex items-center gap-4">
                TRANSMIT_PAYLOAD <span className="text-primary-fixed opacity-50">.EXE</span>
              </h2>
              <Send size={20} className="text-primary-fixed/50" />
            </div>

            <form className="space-y-10">
              {[
                { id: 'identity', label: 'Identity [Name]', placeholder: 'ENTER_IDENTIFIER', type: 'text' },
                { id: 'frequency', label: 'Frequency [Email]', placeholder: 'ENTER_RETURN_ADDRESS', type: 'email' },
                { id: 'payload', label: 'Payload [Message]', placeholder: 'INPUT_DATA_STREAM...', type: 'textarea' }
              ].map((field) => (
                <div key={field.id} className="space-y-4">
                  <label htmlFor={field.id} className="font-mono text-xs text-primary-fixed font-bold uppercase tracking-widest block">
                    {field.label}
                  </label>
                  <div className="relative flex items-center bg-surface-container/50 border border-outline-variant/30 focus-within:border-primary-fixed transition-all group/input">
                    <span className="pl-4 pr-3 font-mono text-primary-fixed text-sm opacity-50">&gt;</span>
                    {field.type === 'textarea' ? (
                      <textarea
                        id={field.id}
                        placeholder={field.placeholder}
                        rows={6}
                        className="w-full bg-transparent border-none py-4 px-0 focus:ring-0 font-mono text-sm text-on-surface placeholder:text-white/5 resize-none h-44"
                      />
                    ) : (
                      <input
                        id={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full bg-transparent border-none py-4 px-0 focus:ring-0 font-mono text-sm text-on-surface placeholder:text-white/5"
                      />
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-6 flex justify-end">
                <button 
                  type="submit"
                  className="group relative px-10 py-4 bg-transparent border border-primary-fixed text-primary-fixed font-mono text-sm font-bold tracking-widest uppercase hover:bg-primary-fixed hover:text-background transition-all duration-300 shadow-[0_0_15px_rgba(0,251,251,0.1)] hover:shadow-[0_0_30px_rgba(0,251,251,0.4)]"
                >
                  <span className="flex items-center gap-3">
                    EXECUTE_TRANSMIT
                    <div className="w-2 h-4 bg-current blinking-cursor" />
                  </span>
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Sidebar Section */}
        <section className="lg:col-span-4 flex flex-col gap-8">
          <div className="bento-card p-6">
            <h3 className="font-mono text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-8 border-b border-white/5 pb-4">External_Nodes</h3>
            <div className="flex flex-col gap-4">
              {[
                { name: 'GITHUB_REPOS', icon: Github, href: '#' },
                { name: 'LINKEDIN_PROFILE', icon: Linkedin, href: '#' }
              ].map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  className="flex items-center justify-between p-4 bg-surface-container/50 border border-outline-variant/30 hover:border-primary-fixed/50 hover:bg-primary-fixed/5 transition-all group/link"
                >
                  <div className="flex items-center gap-4">
                    <link.icon size={18} className="text-on-surface-variant group-hover/link:text-primary-fixed transition-colors" />
                    <span className="font-mono text-xs text-on-surface group-hover/link:text-primary-fixed transition-colors">{link.name}</span>
                  </div>
                  <ExternalLink size={14} className="text-on-surface-variant group-hover/link:text-primary-fixed transition-colors" />
                </a>
              ))}
            </div>
          </div>

          <div className="bento-card p-6 flex-1 flex flex-col relative group overflow-hidden">
            <div className="absolute top-2 right-4 flex gap-1.5 h-6 items-end">
              <div className="w-1.5 h-2 bg-secondary-fixed opacity-30" />
              <div className="w-1.5 h-6 bg-secondary-fixed opacity-60" />
              <div className="w-1.5 h-4 bg-secondary-fixed opacity-90" />
            </div>

            <h3 className="font-mono text-xs font-bold text-secondary-fixed uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <Key size={16} /> Encryption_Key
            </h3>

            <div className="bg-[#050a0a] border border-outline-variant/20 p-5 rounded font-mono text-[10px] leading-relaxed text-on-surface/50 flex-grow break-all relative group/code">
              <div className="opacity-80">
                -----BEGIN PGP PUBLIC KEY BLOCK-----<br/><br/>
                mQINBGI4a3MBEAC83R0h0r5p6v6l2n3m4r5t6y7u8i9o0p1a2s3d4f5g6h7j8k9l0m<br/>
                n1b2v3c4x5z6... [TRUNCATED FOR SECURITY] ...<br/>
                9d8a7s6d5f4g3h2j1k0l<br/>
                =XyZ1<br/>
                -----END PGP PUBLIC KEY BLOCK-----
              </div>
              <div className="absolute inset-x-0 bottom-6 h-12 bg-gradient-to-t from-[#050a0a] to-transparent pointer-events-none" />
            </div>

            <div className="mt-6 flex justify-between items-center font-mono text-[10px] tracking-widest text-secondary-fixed opacity-80">
              <span className="text-on-surface/30">FINGERPRINT:</span>
              <span>4F92 A1B3 0D91 C4E2</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

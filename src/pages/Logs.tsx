import { useState } from 'react';
import { Radar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { logFeedEntries, logThreatSidebar } from '@/data/logFeed';

export const Logs = () => {
  const [command, setCommand] = useState('');

  return (
    <div className="flex flex-col gap-4">
      <p className="font-mono text-[11px] text-on-surface-variant border border-outline-variant/40 rounded px-3 py-2 bg-surface-variant/20 max-w-2xl">
        Decorative log stream for the portfolio. Entries are static sample text, not a live tail.
      </p>

      <div className="flex flex-col md:flex-row gap-8 h-full">
        <div className="w-full md:w-3/4 flex flex-col h-[650px]">
          <div className="bento-card flex flex-col h-full rounded-none overflow-hidden group">
            <div className="px-6 py-4 border-b border-primary-fixed/10 flex justify-between items-center bg-surface-container/50">
              <div className="font-mono text-xs text-primary-fixed flex items-center gap-3">
                <span className="opacity-50" aria-hidden>
                  &gt;
                </span>
                tail -f /var/log/system.log <span className="text-on-surface-variant normal-case">(mock)</span>
              </div>
              <div className="flex gap-2" aria-hidden>
                <div className="w-2 h-2 rounded-full bg-surface-variant" />
                <div className="w-2 h-2 rounded-full bg-surface-variant" />
                <div className="w-2 h-2 rounded-full bg-primary-fixed/60" />
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto no-scrollbar font-mono text-[13px] leading-relaxed flex flex-col gap-4 bg-[#050a0a]">
              {logFeedEntries.map((log, i) => {
                const Icon = log.icon;
                return (
                  <motion.div
                    key={`${log.timestamp}-${i}`}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col sm:flex-row gap-2 sm:gap-6 group/item hover:bg-white/5 p-2 -mx-2 rounded transition-colors"
                  >
                    <span className="text-on-surface-variant/40 shrink-0 select-none">[{log.timestamp}]</span>
                    <span
                      className={cn(
                        'font-bold px-1.5 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 shrink-0 w-fit inline-flex items-center gap-1',
                        log.color
                      )}
                    >
                      <Icon size={12} className="shrink-0 opacity-80" aria-hidden />
                      [{log.type}]
                    </span>
                    <span
                      className={cn(
                        'text-on-surface-variant group-hover/item:text-on-surface transition-colors',
                        log.type === 'WARNING' && 'text-error-fixed/80'
                      )}
                    >
                      {log.message}
                    </span>
                  </motion.div>
                );
              })}

              <div className="flex items-center gap-3 text-primary-fixed mt-2">
                <span className="font-bold">~</span>
                <span className="blinking-cursor" aria-hidden />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/4 flex flex-col gap-6">
          <section className="bento-card p-6 flex flex-col gap-4">
            <h2 className="font-mono text-[10px] text-on-surface-variant uppercase tracking-[0.2em] mb-2 font-bold select-none">System Status</h2>
            {[
              { label: 'Network', value: 'OK (demo)', valClass: 'text-secondary-fixed' },
              { label: 'Uptime', value: 'Illustrative', valClass: 'text-on-surface' },
              { label: 'Last refresh', value: 'On load', valClass: 'text-on-surface' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center font-mono text-xs">
                <span className="text-on-surface-variant opacity-60">{item.label}</span>
                <span className={cn('font-bold', item.valClass)}>{item.value}</span>
              </div>
            ))}

            <div className="mt-4 w-full h-1 bg-surface-container relative rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '92%' }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary-fixed to-secondary-fixed shadow-[0_0_10px_rgba(0,251,251,0.5)]"
              />
            </div>
          </section>

          <section className="bento-card p-6 flex-1 flex flex-col">
            <div className="font-mono text-[10px] text-on-surface-variant uppercase tracking-[0.2em] mb-6 font-bold flex justify-between items-center select-none">
              <span>Sample indicators</span>
              <Radar size={14} className="text-secondary-fixed" aria-hidden />
            </div>
            <div className="font-mono text-[11px] flex flex-col gap-4">
              {logThreatSidebar.map((threat, i) => (
                <div key={i} className="flex justify-between items-center border-b border-primary-fixed/5 pb-2">
                  <span className={cn('font-bold', threat.color)}>{threat.type}</span>
                  <span className="text-on-surface/50">{threat.ip}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="bg-surface-container border border-primary-fixed/50 hover:border-primary-fixed transition-colors flex items-center gap-3 p-4 rounded shadow-[inset_0_0_20px_rgba(0,251,251,0.05)]">
            <span className="text-primary-fixed font-bold" aria-hidden>
              &gt;
            </span>
            <label htmlFor="logs-command" className="sr-only">
              Demo command input
            </label>
            <input
              id="logs-command"
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Type for fun — not executed"
              className="bg-transparent border-none p-0 focus:ring-0 text-xs font-mono text-on-surface placeholder:text-white/10 w-full"
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

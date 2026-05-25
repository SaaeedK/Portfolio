/** Decorative log tail + local terminal (validated input; no remote shell). */
import { useEffect, useRef, useState } from 'react';
import { Radar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { logThreatSidebar } from '@/data/logFeed';
import { useLogFeed } from '@/hooks/useLogFeed';
import { validateTerminalInput } from '@/lib/secureInput';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { focusRing } from '@/lib/a11y';

const STATUS_LABEL: Record<string, string> = {
  connecting: 'Connecting…',
  live: 'Live (curated API)',
  fallback: 'Local poll (static JSON)',
  error: 'Unavailable',
};

export const Logs = () => {
  useDocumentTitle('Logs');
  const { entries, status, lastRefresh } = useLogFeed();
  const [command, setCommand] = useState('');
  const [commandError, setCommandError] = useState('');
  const [liveMessage, setLiveMessage] = useState('');
  const prevStatus = useRef(status);
  const prevCount = useRef(0);

  useEffect(() => {
    if (prevStatus.current !== status) {
      setLiveMessage(`Log feed: ${STATUS_LABEL[status] ?? status}`);
    } else if (entries.length > prevCount.current && entries.length > 0) {
      const delta = entries.length - prevCount.current;
      setLiveMessage(delta === 1 ? '1 new log entry' : `${delta} new log entries`);
    }
    prevStatus.current = status;
    prevCount.current = entries.length;
  }, [status, entries.length]);

  const onCommandChange = (value: string) => {
    const check = validateTerminalInput(value);
    setCommand(check.value);
    setCommandError(check.ok ? '' : check.error);
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl md:text-4xl font-bold text-primary tracking-tight">Log tail</h1>
      <p
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {liveMessage}
      </p>
      <p className="font-mono text-[11px] text-on-surface-variant border border-outline-variant/40 rounded px-3 py-2 bg-surface-variant/20 max-w-2xl">
        Curated portfolio log tail — polled every 12s from <code className="text-primary-fixed">GET /api/logs</code>{' '}
        (read-only, rate-limited). Nothing you type is executed on a server.
      </p>

      <div className="flex flex-col md:flex-row gap-8 h-full">
        <div className="w-full md:w-3/4 flex flex-col min-h-[280px] h-[min(70vh,650px)] max-h-[85vh]">
          <div className="bento-card flex flex-col h-full rounded-none overflow-hidden group">
            <div className="px-4 sm:px-6 py-4 border-b border-primary-fixed/10 flex justify-between items-center bg-surface-container/50">
              <div className="font-mono text-xs text-primary-fixed flex items-center gap-3">
                <span className="opacity-50" aria-hidden>
                  &gt;
                </span>
                tail -f /var/log/system.log{' '}
                <span
                  className={cn(
                    'normal-case text-[10px] px-1.5 py-0.5 rounded border',
                    status === 'live'
                      ? 'text-secondary-fixed border-secondary-fixed/40'
                      : 'text-on-surface-variant border-outline-variant/40'
                  )}
                >
                  {STATUS_LABEL[status] ?? status}
                </span>
              </div>
              <div className="flex gap-2" aria-hidden>
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    status === 'live' ? 'bg-secondary-fixed animate-pulse' : 'bg-surface-variant'
                  )}
                />
                <div className="w-2 h-2 rounded-full bg-surface-variant" />
                <div className="w-2 h-2 rounded-full bg-primary-fixed/60" />
              </div>
            </div>

            <div className="p-4 sm:p-6 flex-1 overflow-y-auto max-md:no-scrollbar scroll-region-md font-mono text-[13px] leading-relaxed flex flex-col gap-4 bg-[#050a0a]">
              {entries.length === 0 ? (
                <p className="text-on-surface-variant/60">Waiting for log stream…</p>
              ) : (
                entries.map((log, i) => {
                  const Icon = log.icon;
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      className="flex flex-col sm:flex-row gap-2 sm:gap-6 p-2 -mx-2 rounded"
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
                          'text-on-surface-variant',
                          log.type === 'WARNING' && 'text-error-fixed/80'
                        )}
                      >
                        {log.message}
                      </span>
                    </motion.div>
                  );
                })
              )}

              <div className="flex items-center gap-3 text-primary-fixed mt-2">
                <span className="font-bold">~</span>
                <span className="blinking-cursor" aria-hidden />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/4 flex flex-col gap-6">
          <section className="bento-card p-6 flex flex-col gap-4">
            <h2 className="font-mono text-[10px] text-on-surface-variant uppercase tracking-[0.2em] mb-2 font-bold select-none">
              System Status
            </h2>
            {[
              { label: 'Network', value: status === 'live' ? 'OK' : 'Degraded', valClass: 'text-secondary-fixed' },
              { label: 'Feed', value: STATUS_LABEL[status] ?? status, valClass: 'text-on-surface' },
              { label: 'Last refresh', value: lastRefresh || '—', valClass: 'text-on-surface' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center font-mono text-xs">
                <span className="text-on-surface-variant opacity-60">{item.label}</span>
                <span className={cn('font-bold text-right max-w-[55%] truncate', item.valClass)}>{item.value}</span>
              </div>
            ))}

            <div className="mt-4 w-full h-1 bg-surface-container relative rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: status === 'live' ? '92%' : '48%' }}
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

          <div className="flex flex-col gap-1">
            <div className="bg-surface-container border border-primary-fixed/50 hover:border-primary-fixed transition-colors flex items-center gap-3 p-4 rounded shadow-[inset_0_0_20px_rgba(0,251,251,0.05)]">
              <span className="text-primary-fixed font-bold" aria-hidden>
                &gt;
              </span>
              <label htmlFor="logs-command" className="sr-only">
                Filter note (not executed)
              </label>
              <input
                id="logs-command"
                type="text"
                value={command}
                onChange={(e) => onCommandChange(e.target.value)}
                placeholder="Filter note — not executed"
                className={cn(
                  'bg-transparent border-none p-0 text-xs font-mono text-on-surface placeholder:text-white/10 w-full',
                  focusRing
                )}
                autoComplete="off"
                spellCheck={false}
                maxLength={256}
              />
            </div>
            {commandError ? (
              <p className="font-mono text-[10px] text-error-fixed px-1" role="alert">
                {commandError}
              </p>
            ) : (
              <p className="font-mono text-[10px] text-on-surface-variant/70 px-1">
                SQL/shell patterns blocked. Use Labs for SPL-style search.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

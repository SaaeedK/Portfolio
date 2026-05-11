import { Fragment } from 'react';
import {
  Search,
  Terminal,
  Download,
  History,
  ArrowLeft,
  AlertTriangle,
  Gavel,
  Wrench,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import {
  labDemoAggregates,
  labDemoBanner,
  labDemoLogRows,
  labDemoQuery,
  labDemoThreatSummary,
  labDemoToolboxQueries,
} from '@/data/labDemo';

export const Labs = () => {
  return (
    <div className="flex flex-col gap-8">
      <p className="font-mono text-[11px] text-on-surface-variant border border-outline-variant/40 rounded px-3 py-2 bg-surface-variant/20 max-w-3xl">
        This page is a <span className="text-primary-fixed font-bold">static UI mock</span> for a portfolio piece. It does not connect to Splunk or
        any live data source.
      </p>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full border-b border-primary-fixed/20 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-primary-fixed/10 text-primary-fixed font-mono text-[10px] border border-primary-fixed/30 rounded">
              {labDemoBanner.environmentLabel}
            </span>
            <span className="px-2 py-0.5 bg-surface-variant text-on-surface-variant font-mono text-[10px] border border-outline-variant/50 rounded flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed" aria-hidden />
              {labDemoBanner.statusLabel}
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-primary tracking-tight">Sample exercise: suspicious login spikes</h1>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            type="button"
            className="font-mono text-xs text-on-surface-variant hover:text-primary-fixed transition-colors flex items-center gap-2"
          >
            <History size={16} aria-hidden /> Reset view (demo)
          </button>
          <button type="button" className="terminal-button flex items-center gap-2 flex-1 md:flex-none justify-center">
            <ArrowLeft size={16} aria-hidden /> Close scenario
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="bento-card rounded-none overflow-hidden group">
            <div className="bg-surface-variant/30 border-b border-primary-fixed/20 px-4 py-2 flex items-center gap-3">
              <Search size={14} className="text-primary-fixed" aria-hidden />
              <span className="font-mono text-[10px] font-bold text-primary-fixed tracking-widest uppercase">SPL_QUERY_INPUT</span>
            </div>
            <div className="p-4 bg-background/50 font-mono text-sm leading-relaxed text-on-surface">
              <div className="flex gap-3">
                <span className="text-secondary-fixed opacity-70">&gt;</span>
                <div spellCheck={false} className="outline-none w-full whitespace-pre-wrap">
                  {labDemoQuery}
                  <span className="blinking-cursor" />
                </div>
              </div>
            </div>
          </div>

          <div className="bento-card rounded-none flex flex-col min-h-[400px]">
            <div className="border-b border-primary-fixed/20 px-6 py-4 flex justify-between items-center bg-surface-variant/20">
              <div className="flex items-center gap-4">
                <Terminal size={18} className="text-primary-fixed" aria-hidden />
                <h2 className="font-mono text-xs font-bold text-primary-fixed tracking-widest uppercase">RAW_LOG_STREAM // RESULTS</h2>
              </div>
              <div className="hidden sm:flex items-center gap-6 font-mono text-[10px]">
                <span className="text-on-surface-variant">
                  EVENTS: <span className="text-secondary-fixed">4,192</span>
                </span>
                <span className="text-on-surface-variant">
                  TIME: <span className="text-on-surface">1.4s</span>
                </span>
                <button type="button" className="text-on-surface-variant hover:text-primary-fixed transition-colors" aria-label="Export sample">
                  <Download size={16} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-x-auto no-scrollbar font-mono text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-on-surface/40 border-b border-outline-variant/30">
                    <th className="pb-3 pr-4 font-normal">Time</th>
                    <th className="pb-3 pr-4 font-normal">Event Type</th>
                    <th className="pb-3 font-normal">Raw Data</th>
                  </tr>
                </thead>
                <tbody className="text-on-surface-variant">
                  {labDemoLogRows.map((log, i) => (
                    <tr key={i} className="border-b border-outline-variant/10 hover:bg-surface-variant/10 transition-colors">
                      <td className="py-3 pr-4 text-on-surface/60 whitespace-nowrap">{log.time}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[9px] font-bold border',
                            'isError' in log && log.isError
                              ? 'bg-error-fixed/10 text-error-fixed border-error-fixed/30'
                              : 'isSuccess' in log && log.isSuccess
                                ? 'bg-secondary-fixed/10 text-secondary-fixed border-secondary-fixed/30'
                                : 'bg-surface-variant text-on-surface-variant border-outline-variant/30'
                          )}
                        >
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3 font-mono break-all sm:break-normal">
                        {log.data.split('192.168.1.105').map((part, pi) => (
                          <Fragment key={pi}>
                            {part}
                            {pi === 0 && log.data.includes('192.168.1.105') && (
                              <span className="text-primary-fixed font-bold">192.168.1.105</span>
                            )}
                          </Fragment>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-10 pt-6 border-t border-primary-fixed/20">
                <div className="text-primary-fixed mb-4 font-bold flex items-center gap-2">
                  <span className="text-secondary-fixed">&gt;&gt;</span>
                  AGGREGATED_RESULTS: stats count by src_ip
                </div>
                <div className="space-y-4">
                  {labDemoAggregates.map((stat, i) => (
                    <div key={i} className="flex items-center gap-6">
                      <div className="w-32 font-bold text-primary-fixed">{stat.ip}</div>
                      <div className="w-16 text-right font-mono text-on-surface">{stat.count}</div>
                      <div className="flex-1 h-1.5 bg-surface-variant/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.severity}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={cn('h-full', stat.color)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <section className="bento-card border-primary-fixed/30 p-6 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,251,251,0.4) 10px, rgba(0,251,251,0.4) 20px)',
              }}
              aria-hidden
            />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6 border-b border-primary-fixed/20 pb-4">
                <h2 className="font-mono text-xs font-bold text-primary-fixed flex items-center gap-3">
                  <AlertTriangle size={18} aria-hidden /> SCENARIO_SUMMARY
                </h2>
                <span className="bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-bold border border-outline-variant">
                  DEMO
                </span>
              </div>

              <div className="space-y-4 font-mono text-xs">
                {labDemoThreatSummary.map((item, i) => (
                  <div key={i} className="flex justify-between items-end border-b border-outline-variant/10 pb-2 gap-4">
                    <span className="text-[10px] text-on-surface-variant uppercase shrink-0">{item.label}:</span>
                    <span className={cn('font-bold text-right', item.valClass)}>{item.value}</span>
                  </div>
                ))}

                <div className="mt-6">
                  <div className="flex justify-between text-[10px] text-on-surface-variant mb-1.5 uppercase font-bold">
                    <span>Narrative weight (illustrative)</span>
                    <span>98%</span>
                  </div>
                  <div className="h-1.5 bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-primary-fixed w-[98%]" />
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-6 w-full py-3 bg-primary-fixed/10 border border-primary-fixed/50 text-primary-fixed font-bold hover:bg-primary-fixed/20 transition-all flex items-center justify-center gap-3"
                >
                  <Gavel size={16} aria-hidden /> Sample containment (no-op)
                </button>
              </div>
            </div>
          </section>

          <section className="bento-card p-6">
            <h2 className="font-mono text-xs font-bold text-primary-fixed flex items-center gap-3 mb-6 border-b border-primary-fixed/10 pb-4 uppercase">
              <Wrench size={18} aria-hidden /> SIEM_QUERIES_TOOLBOX
            </h2>
            <div className="flex flex-col gap-3">
              <p className="text-[11px] text-on-surface-variant mb-2">Example snippets (not wired to an editor):</p>
              {labDemoToolboxQueries.map((query, i) => (
                <button
                  key={i}
                  type="button"
                  className="group w-full text-left font-mono text-[11px] border border-primary-fixed/20 p-3 bg-surface-variant/10 hover:bg-primary-fixed/10 hover:border-primary-fixed transition-all relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-fixed scale-y-0 group-hover:scale-y-100 transition-transform origin-top" aria-hidden />
                  <div className="text-on-surface truncate pr-6 group-hover:text-primary-fixed transition-colors italic">{query}</div>
                  <ArrowRight
                    size={14}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-fixed opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                    aria-hidden
                  />
                </button>
              ))}

              <div className="mt-8 pt-6 border-t border-outline-variant/10">
                <h3 className="font-mono text-[10px] text-on-surface-variant mb-3 uppercase tracking-widest font-bold">Reference_Materials</h3>
                <a
                  href="https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Whatsinthismanual"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-xs text-primary-fixed hover:underline group"
                >
                  <BookOpen size={16} aria-hidden />
                  <span>Splunk SPL reference (official)</span>
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

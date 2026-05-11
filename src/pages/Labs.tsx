import React from 'react';
import { Search, Terminal, Download, History, ArrowLeft, AlertTriangle, Gavel, Wrench, ArrowRight, BookOpen, Radar } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const Labs = () => {
  return (
    <div className="flex flex-col gap-8">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full border-b border-primary-fixed/20 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-primary-fixed/10 text-primary-fixed font-mono text-[10px] border border-primary-fixed/30 rounded">LAB_ENV: SPLUNK_ENT_8.2</span>
            <span className="px-2 py-0.5 bg-error-fixed/10 text-error-fixed font-mono text-[10px] border border-error-fixed/30 rounded flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-error-fixed animate-pulse" />
              STATUS: ACTIVE_INCIDENT
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-primary tracking-tight">Investigate: Suspicious Login Spikes</h1>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button className="font-mono text-xs text-on-surface-variant hover:text-primary-fixed transition-colors flex items-center gap-2">
            <History size={16} /> REVERT_VM
          </button>
          <button className="terminal-button flex items-center gap-2 flex-1 md:flex-none justify-center">
            <ArrowLeft size={16} /> END_EXERCISE
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Terminal Column */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Query Input */}
          <div className="bento-card rounded-none overflow-hidden group">
            <div className="bg-surface-variant/30 border-b border-primary-fixed/20 px-4 py-2 flex items-center gap-3">
              <Search size={14} className="text-primary-fixed" />
              <span className="font-mono text-[10px] font-bold text-primary-fixed tracking-widest uppercase">SPL_QUERY_INPUT</span>
            </div>
            <div className="p-4 bg-background/50 font-mono text-sm leading-relaxed text-on-surface">
              <div className="flex gap-3">
                <span className="text-secondary-fixed opacity-70">&gt;</span>
                <div spellCheck={false} className="outline-none w-full whitespace-pre-wrap">
                  index=main sourcetype="linux_secure" action="failure" user="root" {"\n"}
                  | stats count by src_ip {"\n"}
                  | where count &gt; 50 {"\n"}
                  | sort - count
                  <span className="blinking-cursor" />
                </div>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bento-card rounded-none flex flex-col min-h-[400px]">
            <div className="border-b border-primary-fixed/20 px-6 py-4 flex justify-between items-center bg-surface-variant/20">
              <div className="flex items-center gap-4">
                <Terminal size={18} className="text-primary-fixed" />
                <h2 className="font-mono text-xs font-bold text-primary-fixed tracking-widest uppercase">RAW_LOG_STREAM // RESULTS</h2>
              </div>
              <div className="hidden sm:flex items-center gap-6 font-mono text-[10px]">
                <span className="text-on-surface-variant">EVENTS: <span className="text-secondary-fixed">4,192</span></span>
                <span className="text-on-surface-variant">TIME: <span className="text-on-surface">1.4s</span></span>
                <button className="text-on-surface-variant hover:text-primary-fixed transition-colors">
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
                  {[
                    { time: '2024-10-27 14:02:11', type: 'sshd_fail', data: 'Failed password for root from 192.168.1.105 port 49122 ssh2', isError: true },
                    { time: '2024-10-27 14:02:13', type: 'sshd_fail', data: 'Failed password for root from 192.168.1.105 port 49122 ssh2', isError: true },
                    { time: '2024-10-27 14:02:15', type: 'sshd_success', data: 'Accepted password for root from 192.168.1.105 port 49122 ssh2', isSuccess: true },
                    { time: '2024-10-27 14:02:16', type: 'session_open', data: 'pam_unix(sshd:session): session opened for user root by (uid=0)' },
                  ].map((log, i) => (
                    <tr key={i} className="border-b border-outline-variant/10 hover:bg-surface-variant/10 transition-colors">
                      <td className="py-3 pr-4 text-on-surface/60 whitespace-nowrap">{log.time}</td>
                      <td className="py-3 pr-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-bold border",
                          log.isError ? "bg-error-fixed/10 text-error-fixed border-error-fixed/30" :
                          log.isSuccess ? "bg-secondary-fixed/10 text-secondary-fixed border-secondary-fixed/30" :
                          "bg-surface-variant text-on-surface-variant border-outline-variant/30"
                        )}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3 font-mono break-all sm:break-normal">
                        {log.data.split('192.168.1.105').map((part, pi) => (
                          <React.Fragment key={pi}>
                            {part}
                            {pi === 0 && log.data.includes('192.168.1.105') && <span className="text-primary-fixed font-bold">192.168.1.105</span>}
                          </React.Fragment>
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
                  {[
                    { ip: '192.168.1.105', count: 4142, severity: 95, color: 'bg-error-fixed' },
                    { ip: '10.0.0.44', count: 12, severity: 15, color: 'bg-secondary-fixed' }
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-6">
                      <div className="w-32 font-bold text-primary-fixed">{stat.ip}</div>
                      <div className="w-16 text-right font-mono text-on-surface">{stat.count}</div>
                      <div className="flex-1 h-1.5 bg-surface-variant/30 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.severity}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={cn("h-full", stat.color)} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Sidebar Column */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <section className="bento-card border-error-fixed/30 p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #ffb4ab 10px, #ffb4ab 20px)' }} />
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6 border-b border-error-fixed/20 pb-4">
                <h2 className="font-mono text-xs font-bold text-error-fixed flex items-center gap-3">
                  <AlertTriangle size={18} /> THREAT_INTELLIGENCE
                </h2>
                <span className="bg-error-fixed text-background px-2 py-0.5 rounded text-[10px] font-bold">CRITICAL</span>
              </div>
              
              <div className="space-y-4 font-mono text-xs">
                {[
                  { label: 'IDENTIFIED_ACTOR', value: '192.168.1.105', valClass: 'text-primary-fixed' },
                  { label: 'ATTACK_VECTOR', value: 'SSH Brute Force', valClass: 'text-on-surface' },
                  { label: 'STATUS', value: 'BREACHED', valClass: 'text-error-fixed flex items-center gap-2', 
                    extra: <div className="w-1.5 h-1.5 rounded-full bg-error-fixed animate-pulse" /> }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-end border-b border-outline-variant/10 pb-2">
                    <span className="text-[10px] text-on-surface-variant uppercase">{item.label}:</span>
                    <span className={cn("font-bold", item.valClass)}>
                      {item.extra} {item.value}
                    </span>
                  </div>
                ))}
                
                <div className="mt-6">
                  <div className="flex justify-between text-[10px] text-on-surface-variant mb-1.5 uppercase font-bold">
                    <span>Confidence Score</span>
                    <span>98%</span>
                  </div>
                  <div className="h-1.5 bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-error-fixed w-[98%] shadow-[0_0_10px_rgba(255,180,171,0.5)]" />
                  </div>
                </div>

                <button className="mt-6 w-full py-3 bg-error-fixed/10 border border-error-fixed/50 text-error-fixed font-bold hover:bg-error-fixed hover:text-background transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,180,171,0.1)]">
                  <Gavel size={16} /> ISOLATE_HOST
                </button>
              </div>
            </div>
          </section>

          <section className="bento-card p-6">
            <h2 className="font-mono text-xs font-bold text-primary-fixed flex items-center gap-3 mb-6 border-b border-primary-fixed/10 pb-4 uppercase">
              <Wrench size={18} /> SIEM_QUERIES_TOOLBOX
            </h2>
            <div className="flex flex-col gap-3">
              <p className="text-[11px] text-on-surface-variant mb-2">Click to inject query into terminal:</p>
              {[
                'index=main sourcetype="linux_secure"',
                '| stats count by src_ip | sort - count',
                'index=main "Accepted password"'
              ].map((query, i) => (
                <button 
                  key={i}
                  className="group w-full text-left font-mono text-[11px] border border-primary-fixed/20 p-3 bg-surface-variant/10 hover:bg-primary-fixed/10 hover:border-primary-fixed transition-all relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-fixed scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                  <div className="text-on-surface truncate pr-6 group-hover:text-primary-fixed transition-colors italic">
                    {query}
                  </div>
                  <ArrowRight size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-fixed opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </button>
              ))}
              
              <div className="mt-8 pt-6 border-t border-outline-variant/10">
                <h3 className="font-mono text-[10px] text-on-surface-variant mb-3 uppercase tracking-widest font-bold">Reference_Materials</h3>
                <a href="#" className="flex items-center gap-3 text-xs text-primary-fixed hover:underline group">
                  <BookOpen size={16} />
                  <span>Splunk SPL Cheatsheet</span>
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

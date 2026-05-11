import React from 'react';
import { Terminal, Shield, Radar, AlertTriangle, CheckCircle, Info, GitCommit } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const Logs = () => {
  const [command, setCommand] = React.useState('');

  const logEntries = [
    { 
      timestamp: '2024-10-27T08:14:02Z', 
      type: 'OK', 
      message: 'SYS_UPDATE: Kernel patched successfully. Version 6.5.0-generic applied.',
      icon: CheckCircle,
      color: 'text-secondary-fixed'
    },
    { 
      timestamp: '2024-10-27T09:22:15Z', 
      type: 'COMMIT', 
      message: "GIT_PUSH: Repository 'auth-microservice' updated. SHA: a1b2c3d.",
      icon: GitCommit,
      color: 'text-primary-fixed'
    },
    { 
      timestamp: '2024-10-27T11:05:44Z', 
      type: 'WARNING', 
      message: 'AUTH_FAIL: Multiple failed login attempts detected from IP 192.168.1.105. Rate limiting applied.',
      icon: AlertTriangle,
      color: 'text-error-fixed'
    },
    { 
      timestamp: '2024-10-27T13:40:10Z', 
      type: 'DECRYPTED', 
      message: "LAB_COMPLETE: Module 'Cryptography 101' finished. Score: 100%. Badge awarded.",
      icon: Shield,
      color: 'text-secondary-fixed'
    },
    { 
      timestamp: '2024-10-27T14:15:00Z', 
      type: 'OK', 
      message: 'SEC_AUDIT: Daily automated dependency scan complete. 0 critical vulnerabilities found.',
      icon: CheckCircle,
      color: 'text-secondary-fixed'
    },
    { 
      timestamp: '2024-10-27T15:30:22Z', 
      type: 'INFO', 
      message: 'CRON_JOB: Database backup routine executed. Archive stored in cold storage.',
      icon: Info,
      color: 'text-primary-fixed'
    }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 h-full">
      {/* Main Logs Feed */}
      <div className="w-full md:w-3/4 flex flex-col h-[650px]">
        <div className="bento-card flex flex-col h-full rounded-none overflow-hidden group">
          <div className="px-6 py-4 border-b border-primary-fixed/10 flex justify-between items-center bg-surface-container/50">
            <div className="font-mono text-xs text-primary-fixed flex items-center gap-3">
              <span className="opacity-50">&gt;</span> tail -f /var/log/system.log
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-surface-variant" />
              <div className="w-2 h-2 rounded-full bg-surface-variant" />
              <div className="w-2 h-2 rounded-full bg-primary-fixed/60" />
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto no-scrollbar font-mono text-[13px] leading-relaxed flex flex-col gap-4 bg-[#050a0a]">
            {logEntries.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col sm:flex-row gap-2 sm:gap-6 group/item hover:bg-white/5 p-2 -mx-2 rounded transition-colors"
              >
                <span className="text-on-surface-variant/40 shrink-0 select-none">[{log.timestamp}]</span>
                <span className={cn(
                  "font-bold px-1.5 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 shrink-0 w-fit",
                  log.color
                )}>
                  [{log.type}]
                </span>
                <span className={cn(
                  "text-on-surface-variant group-hover/item:text-on-surface transition-colors",
                  log.type === 'WARNING' && "text-error-fixed/80"
                )}>
                  {log.message}
                </span>
              </motion.div>
            ))}
            
            <div className="flex items-center gap-3 text-primary-fixed mt-2">
              <span className="font-bold">~</span>
              <div className="blinking-cursor" />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Status */}
      <div className="w-full md:w-1/4 flex flex-col gap-6">
        <section className="bento-card p-6 flex flex-col gap-4">
          <h3 className="font-mono text-[10px] text-on-surface-variant uppercase tracking-[0.2em] mb-2 font-bold select-none">System Status</h3>
          {[
            { label: 'Network', value: 'SECURE', valClass: 'text-secondary-fixed' },
            { label: 'Uptime', value: '99.98%', valClass: 'text-on-surface' },
            { label: 'Last Audit', value: '2h ago', valClass: 'text-on-surface' }
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center font-mono text-xs">
              <span className="text-on-surface-variant opacity-60">{item.label}</span>
              <span className={cn("font-bold", item.valClass)}>{item.value}</span>
            </div>
          ))}
          
          <div className="mt-4 w-full h-1 bg-surface-container relative rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '92%' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary-fixed to-secondary-fixed shadow-[0_0_10px_rgba(0,251,251,0.5)]" 
            />
          </div>
        </section>

        <section className="bento-card p-6 flex-1 flex flex-col">
          <div className="font-mono text-[10px] text-on-surface-variant uppercase tracking-[0.2em] mb-6 font-bold flex justify-between items-center select-none">
            <span>Threat Intel</span>
            <Radar size={14} className="text-secondary-fixed animate-pulse" />
          </div>
          <div className="font-mono text-[11px] flex flex-col gap-4">
            {[
              { type: 'BLOCK', ip: '45.22.x.x', color: 'text-error-fixed' },
              { type: 'BLOCK', ip: '103.4.x.x', color: 'text-error-fixed' },
              { type: 'MONITOR', ip: '89.101.x.x', color: 'text-primary-fixed' }
            ].map((threat, i) => (
              <div key={i} className="flex justify-between items-center border-b border-primary-fixed/5 pb-2">
                <span className={cn("font-bold", threat.color)}>{threat.type}</span>
                <span className="text-on-surface/50">{threat.ip}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-surface-container border border-primary-fixed/50 hover:border-primary-fixed transition-colors flex items-center gap-3 p-4 rounded shadow-[inset_0_0_20px_rgba(0,251,251,0.05)]">
          <span className="text-primary-fixed font-bold">&gt;</span>
          <input 
            type="text" 
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Execute command..."
            className="bg-transparent border-none p-0 focus:ring-0 text-xs font-mono text-on-surface placeholder:text-white/10 w-full"
          />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Terminal, Beaker, History, Blocks, Activity, Wifi, Bug, FileJson, Cloud, Globe, Plus } from 'lucide-react';
import { LABS, COMMITS, PROJECTS } from '../constants';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const Home = () => {
  return (
    <div className="flex flex-col gap-8">
      {/* Header Terminal Section */}
      <section className="bento-card rounded-lg p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden group">
        <div className="z-10 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Terminal size={40} className="text-primary-fixed" />
            <h1 className="text-3xl md:text-6xl font-extrabold text-primary tracking-tighter uppercase">
              Terminal: <span className="text-primary-fixed">Alex_Architect</span>
            </h1>
          </div>
          <div className="font-mono text-xs md:text-sm text-primary-fixed flex flex-col sm:flex-row gap-4 opacity-80">
            <span className="flex items-center">&gt; INITIATING_SEQUENCE... DONE.</span>
            <span className="flex items-center">&gt; LOADING_MODULES... SUCCESS.</span>
          </div>
        </div>
        
        <div className="z-10 mt-8 md:mt-0 flex flex-col items-end gap-3 text-right">
          <div className="bg-secondary-fixed/10 text-secondary-fixed font-mono text-xs px-4 py-1.5 inline-flex items-center gap-2 border border-secondary-fixed/50 rounded shadow-[0_0_15px_rgba(76,227,70,0.1)]">
            <div className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse" />
            STATUS: SECURE
          </div>
          <div className="font-mono text-xs text-on-surface-variant flex flex-col gap-1 items-end">
            <span>UPTIME: <span className="text-primary-fixed">99.99%</span></span>
            <span>LAST_LOGIN: <span className="text-primary-fixed">192.168.1.104</span></span>
          </div>
        </div>
        
        {/* Abstract Background Glow */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary-fixed/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary-fixed/20 transition-all duration-700" />
      </section>

      {/* Cyber Labs Section */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-4 border-b border-primary-fixed/20 pb-4 mb-6">
          <span className="text-primary-fixed">&gt;</span> CYBERSECURITY_LABS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LABS.map((lab, index) => (
            <motion.div
              key={lab.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bento-card rounded-lg p-6 flex flex-col gap-4 min-h-[220px] group relative cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="bg-surface-variant/50 text-on-surface-variant font-mono text-[10px] px-2 py-1 rounded border border-outline-variant">
                  {lab.id}
                </div>
                {lab.id === 'LAB_01' && <Activity size={18} className="text-primary-fixed opacity-50 group-hover:opacity-100 transition-opacity" />}
                {lab.id === 'LAB_02' && <Wifi size={18} className="text-secondary-fixed opacity-50 group-hover:opacity-100 transition-opacity" />}
                {lab.id === 'LAB_03' && <Bug size={18} className="text-error-fixed opacity-50 group-hover:opacity-100 transition-opacity" />}
              </div>
              <h3 className={cn(
                "text-xl font-bold transition-colors",
                lab.id === 'LAB_01' ? "text-primary-fixed" : 
                lab.id === 'LAB_02' ? "text-secondary-fixed" : "text-error-fixed"
              )}>
                {lab.title}
              </h3>
              <p className="text-sm text-on-surface-variant line-clamp-3 font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                {lab.description}
              </p>
              
              {/* Abstract Visualizers for each card */}
              <div className="mt-auto pt-4 flex gap-1 opacity-20 group-hover:opacity-50 transition-all duration-500">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-primary-fixed"
                    style={{ 
                      height: `${Math.random() * 20 + 2}px`,
                      opacity: i % 2 === 0 ? 0.5 : 1
                    }} 
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Commit History & Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Resume/History */}
        <section className="col-span-1 md:col-span-6 bento-card rounded-lg p-8">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-4 mb-8">
            <History size={24} className="text-primary-fixed" />
            COMMIT_HISTORY // RESUME
          </h2>
          <div className="relative border-l-2 border-primary-fixed/20 ml-4 space-y-12 pb-4">
            {COMMITS.map((commit, index) => (
              <motion.div 
                key={commit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                className="relative pl-8"
              >
                <div className={cn(
                  "absolute w-4 h-4 rounded-full -left-[9px] top-1 border-4 border-background transition-all duration-500",
                  index === 0 ? "bg-primary-fixed shadow-[0_0_10px_rgba(0,251,251,0.8)]" : "bg-surface-variant scale-75"
                )} />
                <div className="font-mono text-xs text-secondary-fixed mb-1 flex items-center gap-2">
                  commit {commit.hash} {commit.branch && <span className="opacity-60">({commit.branch})</span>}
                </div>
                <h4 className="text-base font-bold text-primary">{commit.role} @ {commit.company}</h4>
                <div className="mt-2 space-y-1">
                  {commit.details.map((detail, dIndex) => (
                    <div key={dIndex} className="font-mono text-xs text-on-surface-variant flex items-start gap-2">
                      <span className="text-primary-fixed">&gt;</span> {detail}
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-[10px] font-mono text-outline-variant uppercase tracking-widest">
                  Date: {commit.date}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Deployed Projects */}
        <section className="col-span-1 md:col-span-6 flex flex-col">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-4 mb-6 border-b border-primary-fixed/20 pb-4">
            <Blocks size={24} className="text-primary-fixed" />
            DEPLOYED_PROJECTS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {PROJECTS.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bento-card rounded-lg p-5 flex flex-col justify-between group cursor-pointer border-primary-fixed/10"
              >
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded bg-primary-fixed/5 text-primary-fixed">
                    {project.icon === 'data_object' && <FileJson size={20} />}
                    {project.icon === 'cloud' && <Cloud size={20} />}
                    {project.icon === 'language' && <Globe size={20} />}
                  </div>
                  <div className="font-mono text-[9px] text-on-surface-variant bg-background px-1.5 py-0.5 border border-outline-variant">
                    {project.tech}
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-bold text-primary group-hover:text-primary-fixed transition-colors">
                    {project.title}
                  </h4>
                  <p className="font-mono text-[11px] text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-center text-[10px] font-mono">
                  <span className="text-secondary-fixed/60">STATUS: {project.status}</span>
                </div>
              </motion.div>
            ))}
            
            <div className="bento-card rounded-lg p-5 flex flex-col items-center justify-center border-dashed border-primary-fixed/30 bg-transparent hover:bg-primary-fixed/5 transition-all cursor-pointer group">
              <Plus size={32} className="text-primary-fixed/40 group-hover:scale-110 transition-transform" />
              <span className="font-mono text-xs text-primary-fixed/40 mt-2 font-bold tracking-widest">NEW_REPO</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

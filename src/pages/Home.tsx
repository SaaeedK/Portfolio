import { Terminal, History, Blocks, Activity, Wifi, Bug, FileJson, Cloud, Globe, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { labs, commits, projects } from '@/data/portfolio';
import { cn } from '@/lib/utils';
import { site } from '@/data/site';

const defaultHeights = [6, 12, 8, 14, 10, 9, 11, 7, 13, 8, 10, 12];

export const Home = () => {
  return (
    <div className="flex flex-col gap-8">
      <section className="bento-card rounded-lg p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden group">
        <div className="z-10 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Terminal size={40} className="text-primary-fixed shrink-0" aria-hidden />
            <h1 className="text-3xl md:text-6xl font-extrabold text-primary tracking-tighter uppercase">
              Terminal: <span className="text-primary-fixed">{site.displayHandle}</span>
            </h1>
          </div>
          <p className="font-mono text-xs md:text-sm text-on-surface-variant max-w-xl">
            {site.tagline}
          </p>
        </div>

        <div className="z-10 mt-8 md:mt-0 flex flex-col items-end gap-3 text-right">
          <div className="bg-secondary-fixed/10 text-secondary-fixed font-mono text-xs px-4 py-1.5 inline-flex items-center gap-2 border border-secondary-fixed/50 rounded shadow-[0_0_15px_rgba(76,227,70,0.1)]">
            <div className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse" aria-hidden />
            Portfolio · available
          </div>
          <div className="font-mono text-xs text-on-surface-variant flex flex-col gap-1 items-end">
            <span>
              Focus: <span className="text-primary-fixed">Security engineering</span>
            </span>
            <span className="text-[10px] opacity-70">Decorative metrics below are placeholders.</span>
          </div>
        </div>

        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary-fixed/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary-fixed/20 transition-all duration-700" aria-hidden />
      </section>

      <section>
        <h2 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-4 border-b border-primary-fixed/20 pb-4 mb-6">
          <span className="text-primary-fixed" aria-hidden>
            &gt;
          </span>
          CYBERSECURITY_LABS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {labs.map((lab, index) => {
            const heights = lab.visualizerHeights ?? defaultHeights;
            return (
              <motion.div
                key={lab.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
              <NavLink
                to="/labs"
                className="bento-card rounded-lg p-6 flex flex-col gap-4 min-h-[220px] group relative focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-fixed"
              >
                <div className="flex justify-between items-start">
                  <div className="bg-surface-variant/50 text-on-surface-variant font-mono text-[10px] px-2 py-1 rounded border border-outline-variant">
                    {lab.id}
                  </div>
                  {lab.id === 'LAB_01' && (
                    <Activity size={18} className="text-primary-fixed opacity-50 group-hover:opacity-100 transition-opacity" aria-hidden />
                  )}
                  {lab.id === 'LAB_02' && (
                    <Wifi size={18} className="text-secondary-fixed opacity-50 group-hover:opacity-100 transition-opacity" aria-hidden />
                  )}
                  {lab.id === 'LAB_03' && (
                    <Bug size={18} className="text-error-fixed opacity-50 group-hover:opacity-100 transition-opacity" aria-hidden />
                  )}
                </div>
                <h3
                  className={cn(
                    'text-xl font-bold transition-colors',
                    lab.id === 'LAB_01'
                      ? 'text-primary-fixed'
                      : lab.id === 'LAB_02'
                        ? 'text-secondary-fixed'
                        : 'text-error-fixed'
                  )}
                >
                  {lab.title}
                </h3>
                <p className="text-sm text-on-surface-variant line-clamp-3 font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                  {lab.description}
                </p>

                <div className="mt-auto pt-4 flex gap-1 opacity-20 group-hover:opacity-50 transition-all duration-500" aria-hidden>
                  {heights.map((h, i) => (
                    <div
                      key={`${lab.id}-bar-${i}`}
                      className="flex-1 bg-primary-fixed"
                      style={{
                        height: `${h}px`,
                        opacity: i % 2 === 0 ? 0.5 : 1,
                      }}
                    />
                  ))}
                </div>
              </NavLink>
              </motion.div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <section className="col-span-1 md:col-span-6 bento-card rounded-lg p-8">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-4 mb-8">
            <History size={24} className="text-primary-fixed shrink-0" aria-hidden />
            COMMIT_HISTORY // RESUME
          </h2>
          <div className="relative border-l-2 border-primary-fixed/20 ml-4 space-y-12 pb-4">
            {commits.map((commit, index) => (
              <motion.div
                key={commit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                className="relative pl-8"
              >
                <div
                  className={cn(
                    'absolute w-4 h-4 rounded-full -left-[9px] top-1 border-4 border-background transition-all duration-500',
                    index === 0
                      ? 'bg-primary-fixed shadow-[0_0_10px_rgba(0,251,251,0.8)]'
                      : 'bg-surface-variant scale-75'
                  )}
                />
                <div className="font-mono text-xs text-secondary-fixed mb-1 flex items-center gap-2">
                  commit {commit.hash}{' '}
                  {commit.branch && <span className="opacity-60">({commit.branch})</span>}
                </div>
                <h3 className="text-base font-bold text-primary">
                  {commit.role} @ {commit.company}
                </h3>
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

        <section className="col-span-1 md:col-span-6 flex flex-col">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-4 mb-6 border-b border-primary-fixed/20 pb-4">
            <Blocks size={24} className="text-primary-fixed shrink-0" aria-hidden />
            DEPLOYED_PROJECTS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {projects.map((project, index) => {
              const cardClass =
                'bento-card rounded-lg p-5 flex flex-col justify-between group border-primary-fixed/10 h-full';
              const inner = (
                <>
                  <div className="flex justify-between items-start">
                    <div className="p-2 rounded bg-primary-fixed/5 text-primary-fixed">
                      {project.icon === 'data_object' && <FileJson size={20} aria-hidden />}
                      {project.icon === 'cloud' && <Cloud size={20} aria-hidden />}
                      {project.icon === 'language' && <Globe size={20} aria-hidden />}
                    </div>
                    <div className="font-mono text-[9px] text-on-surface-variant bg-background px-1.5 py-0.5 border border-outline-variant">
                      {project.tech}
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3
                      className={cn(
                        'font-bold text-primary transition-colors',
                        project.repoUrl && 'group-hover:text-primary-fixed'
                      )}
                    >
                      {project.title}
                    </h3>
                    <p className="font-mono text-[11px] text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-[10px] font-mono">
                    <span className="text-secondary-fixed/60">STATUS: {project.status}</span>
                  </div>
                </>
              );
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {project.repoUrl ? (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(cardClass, 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-fixed')}
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className={cn(cardClass, 'opacity-90')} aria-label={`${project.title} — portfolio demo, no repository link`}>
                      {inner}
                    </div>
                  )}
                </motion.div>
              );
            })}

            <div
              className="bento-card rounded-lg p-5 flex flex-col items-center justify-center border-dashed border-primary-fixed/30 bg-transparent opacity-70"
              aria-label="Portfolio placeholder — not a repository link"
            >
              <Plus size={32} className="text-primary-fixed/40" aria-hidden />
              <span className="font-mono text-xs text-primary-fixed/40 mt-2 font-bold tracking-widest">NEW_REPO</span>
              <span className="font-mono text-[10px] text-on-surface-variant mt-2">Portfolio placeholder</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

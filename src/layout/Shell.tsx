import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { TopNav } from './TopNav';
import { SideNav } from './SideNav';
import { site, externalHref, getResumeHref } from '@/data/site';

export const Shell = ({ children }: { children: ReactNode }) => {
  const resumeHref = getResumeHref();
  const github = externalHref(site.githubUrl, '');
  const year = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-screen">
      <a
        href="#main-content"
        className="absolute left-[-9999px] top-4 z-100 rounded px-4 py-2 font-mono text-xs bg-primary-fixed text-background focus:left-4 focus:outline-2 focus:outline-offset-2 focus:outline-primary-fixed"
      >
        Skip to main content
      </a>
      <TopNav />
      <div className="flex flex-1">
        <SideNav />
        <main
          id="main-content"
          className="flex-1 pt-24 pb-12 px-4 md:px-12 lg:ml-64 transition-all duration-500 overflow-x-hidden"
          tabIndex={-1}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      <footer className="w-full py-8 border-t border-primary-fixed/10 bg-background lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-secondary-fixed/80">
          <div className="font-mono text-[10px] sm:text-xs text-on-surface-variant">
            © {year} {site.displayName} · personal portfolio
            <span className="ml-4 bg-surface-variant/80 text-on-surface-variant px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-bold border border-outline-variant/50">
              Static demo UI
            </span>
          </div>
          <div className="flex gap-6 font-mono text-[10px] sm:text-xs text-on-surface-variant flex-wrap justify-center">
            {github !== '#' ? (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-fixed transition-colors"
              >
                GitHub
              </a>
            ) : null}
            <Link to="/comms" className="hover:text-primary-fixed transition-colors">
              Contact
            </Link>
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              className="hover:text-primary-fixed transition-colors"
            >
              Site terms (CC BY 4.0)
            </a>
          </div>
          <a
            href={resumeHref}
            className="terminal-button inline-flex items-center gap-2"
            target="_blank"
            rel="noopener noreferrer"
            title="Opens résumé PDF in a new tab"
          >
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
            Open résumé
          </a>
        </div>
      </footer>
    </div>
  );
};

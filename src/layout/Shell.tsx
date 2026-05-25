/** Site chrome: skip link, top/side nav, main landmark, footer. */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { TopNav } from './TopNav';
import { SideNav } from './SideNav';
import { site, externalHref, getResumeHref } from '@/data/site';
import { focusRing } from '@/lib/a11y';

export const Shell = ({ children }: { children: ReactNode }) => {
  const reduceMotion = useReducedMotion();
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
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.5 }}
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
          </div>
          <div className="flex gap-6 font-mono text-[10px] sm:text-xs text-on-surface-variant flex-wrap justify-center">
            {github !== '#' ? (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className={`hover:text-primary-fixed transition-colors ${focusRing}`}
              >
                GitHub
              </a>
            ) : null}
            <Link to="/comms" className={`hover:text-primary-fixed transition-colors ${focusRing}`}>
              Contact
            </Link>
            <a
              href={resumeHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:text-primary-fixed transition-colors ${focusRing}`}
              title="Opens résumé PDF in a new tab"
            >
              Résumé
            </a>
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              className={`hover:text-primary-fixed transition-colors ${focusRing}`}
            >
              Site terms (CC BY 4.0)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

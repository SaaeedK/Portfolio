/** Responsive header: brand, mobile drawer, résumé and external profile links. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Terminal, ExternalLink, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { focusRing } from '@/lib/a11y';
import { primaryNav } from '@/config/navigation';
import { site, getResumeHref } from '@/data/site';

export const TopNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const resumeHref = getResumeHref();

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen, closeMenu]);

  return (
    <header className="fixed top-0 w-full z-50 border-b border-primary-fixed/20 bg-background/70 backdrop-blur-xl shadow-[0_0_15px_rgba(0,251,251,0.1)]">
      <nav className="max-w-7xl mx-auto px-4 md:px-12 py-4 flex justify-between items-center" aria-label="Main">
        <NavLink
          to="/"
          className="font-mono text-xs text-primary-fixed tracking-widest flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-fixed rounded"
        >
          <Terminal size={16} aria-hidden />
          {site.displayHandle}@portfolio:~$
        </NavLink>

        <div className="hidden md:flex gap-8 items-center font-mono text-[10px] sm:text-xs">
          {primaryNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'transition-all duration-300 hover:text-primary-fixed hover:drop-shadow-[0_0_8px_rgba(0,251,251,0.6)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-fixed rounded',
                  isActive
                    ? 'text-primary-fixed border-b border-primary-fixed pb-1'
                    : 'text-on-surface-variant'
                )
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <a
            href={resumeHref}
            className="terminal-button hidden sm:inline-flex items-center gap-2"
            target="_blank"
            rel="noopener noreferrer"
            title="Opens résumé PDF in a new tab"
          >
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
            Résumé
          </a>
          <button
            ref={menuButtonRef}
            type="button"
            className={cn('md:hidden text-primary-fixed p-2 rounded hover:bg-primary-fixed/10', focusRing)}
            onClick={() => setIsMenuOpen((o) => !o)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X aria-hidden /> : <Menu aria-hidden />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-primary-fixed/20 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4 font-mono text-xs">
              {primaryNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    cn(
                      'p-2 transition-all duration-300 rounded min-h-11 flex items-center',
                      focusRing,
                      isActive ? 'text-primary-fixed bg-primary-fixed/10' : 'text-on-surface-variant'
                    )
                  }
                >
                  {item.name}
                </NavLink>
              ))}
              <a
                href={resumeHref}
                onClick={closeMenu}
                className="terminal-button inline-flex items-center justify-center gap-2 p-2"
                target="_blank"
                rel="noopener noreferrer"
                title="Opens résumé PDF in a new tab"
              >
                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                Résumé
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

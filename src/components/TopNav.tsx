import React from 'react';
import { NavLink } from 'react-router-dom';
import { Terminal, Shield, Download, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const TopNav = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-primary-fixed/20 bg-background/70 backdrop-blur-xl shadow-[0_0_15px_rgba(0,251,251,0.1)]">
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-4 flex justify-between items-center">
        <NavLink 
          to="/" 
          className="font-mono text-xs text-primary-fixed tracking-widest flex items-center gap-2"
        >
          <Terminal size={16} />
          ROOT@DEV:~$
        </NavLink>

        <div className="hidden md:flex gap-8 items-center font-mono text-[10px] sm:text-xs">
          {[
            { name: 'STATIONS', path: '/' },
            { name: 'LABS', path: '/labs' },
            { name: 'LOGS', path: '/logs' },
            { name: 'COMMS', path: '/comms' },
          ].map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                cn(
                  "transition-all duration-300 hover:text-primary-fixed hover:drop-shadow-[0_0_8px_rgba(0,251,251,0.6)]",
                  isActive ? "text-primary-fixed border-b border-primary-fixed pb-1" : "text-on-surface-variant"
                )
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex gap-2 text-primary-fixed">
            <button className="p-2 hover:bg-primary-fixed/10 transition-all rounded">
              <Terminal size={18} />
            </button>
            <button className="p-2 hover:bg-primary-fixed/10 transition-all rounded">
              <Shield size={18} />
            </button>
          </div>
          <button className="terminal-button hidden sm:block">
            DOWNLOAD_RESUME
          </button>
          <button 
            className="md:hidden text-primary-fixed"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-primary-fixed/20 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4 font-mono text-xs">
              {[
                { name: 'STATIONS', path: '/' },
                { name: 'LABS', path: '/labs' },
                { name: 'LOGS', path: '/logs' },
                { name: 'COMMS', path: '/comms' },
              ].map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => 
                    cn(
                      "p-2 transition-all duration-300",
                      isActive ? "text-primary-fixed bg-primary-fixed/10" : "text-on-surface-variant"
                    )
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

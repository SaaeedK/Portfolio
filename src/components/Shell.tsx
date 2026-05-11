import React from 'react';
import { TopNav } from './TopNav';
import { SideNav } from './SideNav';
import { motion } from 'motion/react';

export const Shell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <div className="flex flex-1">
        <SideNav />
        <main className="flex-1 pt-24 pb-12 px-4 md:px-12 lg:ml-64 transition-all duration-500 overflow-x-hidden">
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
          <div className="font-mono text-[10px] sm:text-xs">
            © 2024 CYBER_ARCHITECT // [ENCRYPTED_CONNECTION]
            <span className="ml-4 bg-secondary-fixed/20 text-secondary-fixed px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-bold border border-secondary-fixed/50">
              SECURITY AUDIT: VERIFIED
            </span>
          </div>
          <div className="flex gap-6 font-mono text-[10px] sm:text-xs text-on-surface-variant flex-wrap justify-center">
            <a href="#" className="hover:text-primary-fixed transition-colors">PULSE_NETWORK</a>
            <a href="#" className="hover:text-primary-fixed transition-colors">SYSTEM_STATUS</a>
            <a href="#" className="hover:text-primary-fixed transition-colors">LEGAL_DECRYPT</a>
          </div>
          <button className="terminal-button flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            DOWNLOAD_RESUME
          </button>
        </div>
      </footer>
    </div>
  );
};

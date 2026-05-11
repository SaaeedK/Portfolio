import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Network, 
  FlaskConical, 
  Radar, 
  Lock, 
  Settings, 
  Power,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';

export const SideNav = () => {
  return (
    <aside className="hidden lg:flex h-screen w-64 fixed left-0 top-0 z-40 flex-col bg-surface-container/30 backdrop-blur-xl border-r border-primary-fixed/20 pt-24 pb-8 justify-between group">
      <div>
        <div className="px-6 py-4 flex flex-col gap-2 border-b border-primary-fixed/10 pb-6 mb-4">
          <div className="flex items-center gap-4 group-hover:translate-x-1 duration-300">
            <div className="w-10 h-10 rounded-full bg-surface-variant border border-primary-fixed/40 flex items-center justify-center overflow-hidden">
              <ShieldCheck className="text-primary-fixed" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs font-bold text-secondary-fixed">SEC_OFFICER_01</span>
              <span className="font-mono text-[9px] text-on-surface-variant tracking-wider">STATUS: ENCRYPTED</span>
            </div>
          </div>
          <button className="mt-4 w-full font-mono text-[10px] border border-secondary-fixed text-secondary-fixed py-2 hover:bg-secondary-fixed hover:text-background transition-all duration-300 shadow-[0_0_10px_rgba(76,227,70,0.2)]">
            INITIATE_AUDIT
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {[
            { name: 'DASHBOARD', icon: LayoutDashboard, path: '/' },
            { name: 'NETWORK_MAP', icon: Network, path: '/network' },
            { name: 'EXPLOITS', icon: FlaskConical, path: '/exploits' },
            { name: 'THREAT_HUNT', icon: Radar, path: '/labs' },
            { name: 'ENCRYPTED_FILES', icon: Lock, path: '/files' },
          ].map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => cn(
                "px-6 py-3 transition-all duration-300 flex items-center gap-4 font-mono text-xs group/item",
                isActive 
                  ? "bg-secondary-fixed/10 text-secondary-fixed border-l-4 border-primary-fixed" 
                  : "text-on-surface-variant hover:text-primary-fixed hover:bg-surface-variant/30"
              )}
            >
              <item.icon size={18} className="group-hover/item:scale-110 transition-transform" />
              <span className="group-hover:translate-x-1 transition-transform">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex flex-col border-t border-primary-fixed/10 pt-4">
        {[
          { name: 'SETTINGS', icon: Settings, path: '/settings' },
          { name: 'LOGOUT', icon: Power, path: '/logout', className: 'text-error-fixed' },
        ].map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={cn(
              "px-6 py-3 transition-all duration-300 flex items-center gap-4 font-mono text-xs group/item text-on-surface-variant hover:text-primary-fixed hover:bg-surface-variant/30",
              item.className
            )}
          >
            <item.icon size={18} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

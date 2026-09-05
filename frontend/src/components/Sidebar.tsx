import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, BarChart3, Cpu, FlaskConical, PhoneCall, ShieldCheck as AuditIcon, Settings } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Negotiator', href: '/negotiate', icon: Cpu },
    { name: 'Demonstration', href: '/lab', icon: FlaskConical },
    { name: 'Voice', href: '/voice', icon: PhoneCall },
    { name: 'Audit', href: '/audit', icon: AuditIcon },
  ];

  return (
    <aside className="w-64 border-r dark:border-gray-800 border-gray-200 dark:bg-[#0A0A0A]/90 bg-white/90 backdrop-blur-md flex flex-col min-h-screen sticky top-0 h-screen overflow-y-auto">
      <div className="p-6 border-b dark:border-gray-800 border-gray-200">
        <Link href="/" className="flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-blue-500" />
          <span className="font-semibold text-lg tracking-tight dark:text-white text-gray-900">RevenueGuard</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <div className="text-xs font-semibold dark:text-gray-500 text-gray-400 uppercase tracking-wider mb-4 px-2">Modules</div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                isActive 
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                  : 'dark:text-gray-400 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t dark:border-gray-800 border-gray-200 flex items-center justify-between">
         <div className="flex items-center gap-3 px-2">
            <Settings className="w-5 h-5 dark:text-gray-400 text-gray-500" />
            <span className="text-sm dark:text-gray-400 text-gray-500 font-medium">Settings</span>
         </div>
         <ThemeToggle />
      </div>
    </aside>
  );
}

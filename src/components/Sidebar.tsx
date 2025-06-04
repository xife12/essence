'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, UserRound, CalendarClock, 
  FileSpreadsheet, Megaphone, ShieldCheck, FileText, Clock 
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Navigationsgruppen
  const navGroups = [
    {
      title: 'Operativ',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Leads', path: '/leads', icon: Users },
        { name: 'Beratung', path: '/beratung', icon: CalendarClock },
        { name: 'Mitglieder', path: '/mitglieder', icon: UserRound },
        { name: 'Vertragsarten', path: '/vertragsarten', icon: FileText },
        { name: 'Stunden', path: '/stunden', icon: Clock }
      ]
    },
    {
      title: 'Marketing',
      items: [
        { name: 'Kampagnen', path: '/kampagnen', icon: Megaphone },
      ]
    },
    {
      title: 'Verwaltung',
      items: [
        { name: 'Passwortverwaltung', path: '/passwoerter', icon: ShieldCheck },
        { name: 'Mitarbeiter', path: '/mitarbeiter', icon: UserRound },
      ]
    }
  ];

  return (
    <div className="w-60 bg-white border-r border-gray-200 min-h-screen fixed top-0 left-0">
      <div className="py-6 px-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-blue-500">MemberCore</h1>
      </div>
      <nav className="p-4">
        {navGroups.map((group, idx) => (
          <div key={idx} className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {group.title}
            </h2>
            <ul>
              {group.items.map((item) => (
                <li key={item.path} className="mb-1">
                  <Link 
                    href={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-500'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
} 
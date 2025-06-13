'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, CalendarClock, 
  FileSpreadsheet, Megaphone, ShieldCheck, FileText, Clock, ChevronDown, Globe, MessageSquare, Settings, Palette, FormInput 
} from 'lucide-react';
import React from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [landingpagesOpen, setLandingpagesOpen] = React.useState(pathname.startsWith('/landingpages'));
  
  // Submenü immer offen, wenn auf Landingpages-Route
  React.useEffect(() => {
    if (pathname.startsWith('/landingpages')) {
      setLandingpagesOpen(true);
    }
  }, [pathname]);

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
        { name: 'Mitglieder', path: '/mitglieder', icon: Users },
        { name: 'Vertragsarten', path: '/vertragsarten', icon: FileText },
        { name: 'Stunden', path: '/stunden', icon: Clock }
      ]
    },
    {
      title: 'Marketing',
      items: [
        { name: 'Kampagnen', path: '/kampagnen', icon: Megaphone },
        {
          name: 'Landingpages',
          path: '/landingpages',
          icon: Globe,
          subItems: [
            { name: 'Landingpage Builder', path: '/landingpages', icon: Globe },
            { name: 'Testimonials', path: '/landingpages/testimonials', icon: MessageSquare },
            { name: 'Seitenvorlagen', path: '/landingpages/templates', icon: FileText },
            { name: 'Formulare', path: '/landingpages/forms', icon: FormInput },
            { name: 'Design System', path: '/landingpages/design', icon: Palette },
            { name: 'Einstellungen', path: '/landingpages/settings', icon: Settings },
          ]
        }
      ]
    },
    {
      title: 'Verwaltung',
      items: [
        { name: 'Passwortverwaltung', path: '/passwoerter', icon: ShieldCheck },
        { name: 'Mitarbeiter', path: '/mitarbeiter', icon: Users },
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
                  {item.subItems ? (
                    <>
                      <button
                        type="button"
                        className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium focus:outline-none ${
                          isActive(item.path)
                            ? 'bg-blue-50 text-blue-500'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setLandingpagesOpen((open) => !open)}
                        aria-expanded={landingpagesOpen}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        <span>{item.name}</span>
                        <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${landingpagesOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {landingpagesOpen && (
                        <ul className="ml-7 mt-1 space-y-1">
                          {item.subItems.map((sub) => (
                            <li key={sub.path}>
                              <Link
                                href={sub.path}
                                className={`flex items-center px-2 py-1 rounded text-sm font-normal ${
                                  isActive(sub.path)
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                <sub.icon className="mr-2 h-4 w-4" />
                                <span>{sub.name}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
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
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
} 
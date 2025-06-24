'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, UserPlus, CalendarClock, Activity, 
  BarChart3, KeyRound, UserCog, File, Menu, X, LogOut, FolderOpen, Globe, Palette, Settings, FileText, ChevronDown, MessageSquare, Calendar, Package, CreditCard, Lock, UserCheck, Upload
} from 'lucide-react';
import supabase from '../lib/supabaseClient';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const [landingpagesOpen, setLandingpagesOpen] = useState(pathname.startsWith('/landingpages'));
  const [mitgliederOpen, setMitgliederOpen] = useState(pathname.startsWith('/mitglieder'));

  // Submenü immer offen, wenn auf entsprechenden Routes
  React.useEffect(() => {
    if (pathname.startsWith('/landingpages')) {
      setLandingpagesOpen(true);
    }
    if (pathname.startsWith('/mitglieder')) {
      setMitgliederOpen(true);
    }
  }, [pathname]);

  const handleSignOut = async () => {
    // Nur in Production ausloggen
    if (process.env.NODE_ENV === 'production') {
      await supabase.auth.signOut();
      window.location.href = '/login';
    } else {
      // In Development direkt zur Login-Seite
      window.location.href = '/login';
    }
  };

  const NavItem = ({ href, icon: Icon, label, badge }: { 
    href: string, 
    icon: any, 
    label: string,
    badge?: string
  }) => {
    const isActive = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link href={href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
        <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-600'} />
        {sidebarOpen && (
          <div className="flex items-center justify-between flex-1">
            <span className={isActive ? 'font-medium' : ''}>{label}</span>
            {badge && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {badge}
              </span>
            )}
          </div>
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen transition-all ${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 shadow-sm`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            {sidebarOpen && <h1 className="text-xl font-semibold">MemberCore</h1>}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <div className="flex flex-col flex-1 gap-1 p-4 overflow-y-auto">
            <div className="mb-4">
              <p className={`text-xs uppercase text-gray-500 mb-2 ${!sidebarOpen && 'sr-only'}`}>Operativ</p>
              <nav className="flex flex-col gap-1">
                <NavItem href="/dashboard" icon={BarChart3} label="Dashboard" />
                <NavItem href="/leads" icon={UserPlus} label="Leads" />
                
                {/* Mitglieder mit Submenü */}
                <button
                  type="button"
                  className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium focus:outline-none transition-colors ${
                    pathname.startsWith('/mitglieder')
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setMitgliederOpen((open) => !open)}
                  aria-expanded={mitgliederOpen}
                >
                  <Users size={20} className="mr-3" />
                  {sidebarOpen && <span>Mitglieder</span>}
                  {sidebarOpen && <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${mitgliederOpen ? 'rotate-180' : ''}`} />}
                </button>
                {mitgliederOpen && sidebarOpen && (
                  <ul className="ml-8 mt-1 space-y-1">
                    <li><NavItem href="/mitglieder" icon={Users} label="Übersicht" /></li>
                    <li><NavItem href="/mitglieder/pdf-upload" icon={Upload} label="PDF-Upload" badge="BETA" /></li>
                    <li><NavItem href="/mitglieder/dual-import" icon={FileText} label="Dual-Import" badge="PRO" /></li>
                  </ul>
                )}
                
                <NavItem href="/kursplan" icon={Calendar} label="Kursplan" />
                <NavItem href="/stunden" icon={CalendarClock} label="Stunden" />
              </nav>
            </div>

            <div className="mb-4">
              <p className={`text-xs uppercase text-gray-500 mb-2 ${!sidebarOpen && 'sr-only'}`}>Marketing</p>
              <nav className="flex flex-col gap-1">
                <NavItem href="/kampagnen" icon={Activity} label="Kampagnen" />
                {/* Landingpages mit Submenü */}
                <button
                  type="button"
                  className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium focus:outline-none transition-colors ${
                    pathname.startsWith('/landingpages')
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setLandingpagesOpen((open) => !open)}
                  aria-expanded={landingpagesOpen}
                >
                  <Globe size={20} className="mr-3" />
                  {sidebarOpen && <span>Landingpages</span>}
                  {sidebarOpen && <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${landingpagesOpen ? 'rotate-180' : ''}`} />}
                </button>
                {landingpagesOpen && sidebarOpen && (
                  <ul className="ml-8 mt-1 space-y-1">
                    <li><NavItem href="/landingpages" icon={Globe} label="Landingpage Builder" /></li>
                    <li><NavItem href="/landingpages/testimonials" icon={MessageSquare} label="Testimonials" /></li>
                    <li><NavItem href="/landingpages/templates" icon={FileText} label="Seitenvorlagen" /></li>
                    <li><NavItem href="/landingpages/settings" icon={Settings} label="Einstellungen" /></li>
                  </ul>
                )}
                <NavItem href="/formulare" icon={FileText} label="Formulare" />
                <NavItem href="/ci-styling" icon={Palette} label="CI-Styling" />
              </nav>
            </div>

            <div>
              <p className={`text-xs uppercase text-gray-500 mb-2 ${!sidebarOpen && 'sr-only'}`}>Verwaltung</p>
              <nav className="flex flex-col gap-1">
                <NavItem href="/payment-system" icon={CreditCard} label="Finanzen" badge="BETA" />
                <NavItem href="/dateimanager" icon={FolderOpen} label="Dateimanager" />
                <NavItem href="/passwoerter" icon={Lock} label="Passwörter" />
                <NavItem href="/mitarbeiter" icon={UserCheck} label="Mitarbeiter" />
                <NavItem href="/vertragsarten" icon={FileText} label="Vertragsarten (Legacy)" />
                <NavItem href="/vertragsarten-v2" icon={FileText} label="Vertragsarten V2" badge="NEU" />
              </nav>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 text-center">
                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full inline-block">
                  🚀 Development Mode
                </div>
              </div>
            )}
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3 py-2 text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              {sidebarOpen && <span>Abmelden</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} p-6 transition-all`}>
        {children}
      </main>
    </div>
  );
} 
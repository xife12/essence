'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Calendar, 
  Plus, 
  Grid3X3, 
  MapPin, 
  BarChart3, 
  Settings, 
  Clock,
  Users 
} from 'lucide-react';

interface CourseNavigationProps {
  className?: string;
}

const CourseNavigation: React.FC<CourseNavigationProps> = ({ className = '' }) => {
  const pathname = usePathname();

  const navigationItems = [
    {
      href: '/kursplan',
      label: 'Kursübersicht',
      icon: Calendar,
      description: 'Wochenplan anzeigen',
      isActive: pathname === '/kursplan'
    },
    {
      href: '/kursplan/neu',
      label: 'Neuer Kurs',
      icon: Plus,
      description: 'Kurs erstellen',
      isActive: pathname === '/kursplan/neu'
    },
    {
      href: '/kursplan/kategorien',
      label: 'Kategorien',
      icon: Grid3X3,
      description: 'Kurskategorien verwalten',
      isActive: pathname.startsWith('/kursplan/kategorien')
    },
    {
      href: '/kursplan/raeume',
      label: 'Räume',
      icon: MapPin,
      description: 'Kursräume verwalten',
      isActive: pathname.startsWith('/kursplan/raeume')
    },
    {
      href: '/kursplan/trainer',
      label: 'Trainer',
      icon: Users,
      description: 'Trainer-Übersicht',
      isActive: pathname.startsWith('/kursplan/trainer')
    },
    {
      href: '/kursplan/zeiten',
      label: 'Zeitverwaltung',
      icon: Clock,
      description: 'Zeitpläne verwalten',
      isActive: pathname.startsWith('/kursplan/zeiten')
    },
    {
      href: '/kursplan/statistiken',
      label: 'Statistiken',
      icon: BarChart3,
      description: 'Auslastung & Analytics',
      isActive: pathname.startsWith('/kursplan/statistiken')
    },
    {
      href: '/kursplan/einstellungen',
      label: 'Einstellungen',
      icon: Settings,
      description: 'Kursplan-Einstellungen',
      isActive: pathname.startsWith('/kursplan/einstellungen')
    }
  ];

  return (
    <nav className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group p-3 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md
                ${item.isActive 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-white hover:bg-gray-50 text-gray-700'
                }
              `}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <Icon className={`h-6 w-6 ${
                  item.isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                }`} />
                <div>
                  <div className={`text-sm font-medium ${
                    item.isActive ? 'text-blue-700' : 'text-gray-900'
                  }`}>
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.description}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default CourseNavigation; 
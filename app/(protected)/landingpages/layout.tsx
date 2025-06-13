'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Globe, MessageSquare, Settings, FileText, Palette, FormInput, 
  ChevronRight, Home
} from 'lucide-react';

export default function LandingpagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  const SubNavItem = ({ href, icon: Icon, label, description }: { 
    href: string, 
    icon: any, 
    label: string,
    description?: string 
  }) => {
    const isActive = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link 
        href={href} 
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
          isActive 
            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
            : 'hover:bg-gray-50 border border-transparent'
        }`}
      >
        <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-600'} />
        <div className="flex-1">
          <div className={`font-medium ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
            {label}
          </div>
          {description && (
            <div className="text-sm text-gray-500 mt-0.5">{description}</div>
          )}
        </div>
        <ChevronRight size={16} className={isActive ? 'text-blue-400' : 'text-gray-400'} />
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Home size={16} />
        <ChevronRight size={14} />
        <span className="font-medium text-gray-900">Landingpages</span>
      </div>

      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Globe size={24} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Landingpages</h1>
        </div>
        <p className="text-gray-600">
          Erstellen und verwalten Sie professionelle Landingpages für Ihre Kampagnen
        </p>
      </div>

      {/* Content */}
      <div className="mt-8">
        {children}
      </div>
    </div>
  );
} 
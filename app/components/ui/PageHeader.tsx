'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: {
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
    href?: string;
  };
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
};

export default function PageHeader({ 
  title, 
  description, 
  action, 
  breadcrumbs 
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight size={14} />}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-gray-700">
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-gray-500 mt-1">{description}</p>}
        </div>
        
        {action && (
          <>
            {action.href ? (
              <Link 
                href={action.href}
                className="btn btn-primary flex items-center gap-2"
              >
                {action.icon}
                <span>{action.label}</span>
              </Link>
            ) : (
              <button 
                onClick={action.onClick} 
                className="btn btn-primary flex items-center gap-2"
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
} 
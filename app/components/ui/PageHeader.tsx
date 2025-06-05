'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Dropdown from './Dropdown';

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: {
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
    href?: string;
    dropdown?: {
      trigger: ReactNode;
      items: Array<{
        label: string;
        icon?: ReactNode;
        onClick: () => void;
        disabled?: boolean;
      }>;
    };
  };
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  badges?: ReactNode;
};

export default function PageHeader({ 
  title, 
  description, 
  action, 
  breadcrumbs,
  badges 
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{title}</h1>
            {badges && <div className="flex gap-2">{badges}</div>}
          </div>
          {description && <p className="text-gray-500 mt-1">{description}</p>}
        </div>
        
        {action && (
          <>
            {action.dropdown ? (
              <div className="flex items-center">
                {action.onClick ? (
                  <button 
                    onClick={action.onClick} 
                    className="btn btn-primary flex items-center gap-2 mr-1"
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                ) : action.href ? (
                  <Link 
                    href={action.href}
                    className="btn btn-primary flex items-center gap-2 mr-1"
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </Link>
                ) : (
                  <div className="btn btn-primary flex items-center gap-2 mr-1">
                    {action.icon}
                    <span>{action.label}</span>
                  </div>
                )}
                <div className="btn-icon">
                  <Dropdown 
                    trigger={action.dropdown.trigger} 
                    items={action.dropdown.items} 
                  />
                </div>
              </div>
            ) : action.href ? (
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
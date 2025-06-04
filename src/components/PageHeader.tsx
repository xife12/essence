import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  breadcrumb?: string[];
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export default function PageHeader({ title, breadcrumb, action, children }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="flex items-center text-sm text-gray-500 mb-1">
            {breadcrumb.map((item, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {children}
      </div>
      
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {action.label}
        </button>
      )}
    </div>
  );
} 
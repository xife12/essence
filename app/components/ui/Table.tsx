'use client';

import React, { ReactNode } from 'react';

type TableColumn<T> = {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
};

type TableProps<T> = {
  data: T[];
  columns: TableColumn<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  footer?: ReactNode;
};

export default function Table<T>({
  data,
  columns,
  onRowClick,
  emptyMessage = 'Keine Daten vorhanden',
  isLoading = false,
  footer,
}: TableProps<T>) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={index} 
                  className={`px-4 py-3 text-left font-medium text-gray-500 ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {isLoading ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-4 py-8 text-center text-gray-500"
                >
                  <div className="flex justify-center">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={`border-t border-gray-100 hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((column, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={`px-4 py-3 ${column.className || ''}`}
                    >
                      {typeof column.accessor === 'function' 
                        ? column.accessor(item)
                        : item[column.accessor] as ReactNode
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {footer && (
        <div className="px-4 py-3 border-t border-gray-100 text-gray-500 text-sm">
          {footer}
        </div>
      )}
    </div>
  );
} 
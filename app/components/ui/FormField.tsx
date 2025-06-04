'use client';

import React, { ReactNode } from 'react';

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  helpText?: string;
};

export default function FormField({
  label,
  htmlFor,
  error,
  required = false,
  children,
  helpText
}: FormFieldProps) {
  return (
    <div className="mb-4">
      <label 
        htmlFor={htmlFor} 
        className="block text-sm font-medium mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {children}
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
} 
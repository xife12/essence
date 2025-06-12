'use client'

import React from 'react'

interface BuilderLayoutProps {
  children: React.ReactNode
  showPreview: boolean
  previewDevice: 'desktop' | 'tablet' | 'mobile'
}

export default function BuilderLayout({ 
  children,
  showPreview,
  previewDevice 
}: BuilderLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Split the children into three sections */}
      <div className="flex w-full">
        
        {/* Left Sidebar - Block Library */}
        <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
          {React.Children.toArray(children)[0]}
        </div>

        {/* Center - Canvas Area */}
        <div className="flex-1 bg-gray-100 overflow-hidden relative">
          {React.Children.toArray(children)[1]}
        </div>

        {/* Right Sidebar - Configuration Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex-shrink-0 overflow-y-auto">
          {React.Children.toArray(children)[2]}
        </div>
      </div>
    </div>
  )
} 
'use client';

import React, { useState } from 'react';
import { Bell, Menu, Search, User, LogOut } from 'lucide-react';
import { useAuth } from './AuthProvider';

export default function Topbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setShowProfileMenu(false);
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <button className="p-2 rounded-md hover:bg-gray-100 md:hidden">
          <Menu size={20} />
        </button>
        <div className="ml-4 relative flex items-center">
          <Search className="absolute left-3 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Suche..."
            className="pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-60"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-md hover:bg-gray-100 relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <User size={18} />
            </div>
            <span className="hidden md:block text-sm font-medium">
              {user?.email ? user.email.split('@')[0] : 'Benutzer'}
            </span>
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Profil
              </a>
              <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Einstellungen
              </a>
              <button 
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <span className="flex items-center">
                  <LogOut size={16} className="mr-2" />
                  Abmelden
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
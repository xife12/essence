'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  CreditCard, 
  Settings, 
  Calendar,
  TrendingUp,
  FileText,
  ChevronDown
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Mitglieder', href: '/members', icon: Users },
    { name: 'Einstellungen', href: '/settings', icon: Settings },
  ];

  const paymentSystemItems = [
    { name: 'Übersicht', href: '/payment-system' },
    { name: 'Zahllaufgruppen', href: '/payment-system/zahllaufgruppen' },
    { name: 'Beitragskalender', href: '/payment-system/beitragskalender' },
  ];

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">MemberCore</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {/* Main Navigation */}
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Payment System Section */}
        <div className="pt-4">
          <details className="group [&_summary::-webkit-details-marker]:hidden" open>
            <summary className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <div className="flex items-center">
                <CreditCard className="mr-3 h-5 w-5" />
                <span className="text-sm font-medium">Payment System</span>
              </div>
              <ChevronDown className="shrink-0 transition duration-300 group-open:-rotate-180 h-4 w-4" />
            </summary>

            <ul className="mt-2 space-y-1 pl-4">
              {paymentSystemItems.map((item) => {
                const isActive = pathname === item.href;
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </details>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">Admin</div>
            <div className="text-xs text-gray-500">System Administrator</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 
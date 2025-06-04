import React from 'react';
import '../styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AuthProvider from '../components/AuthProvider';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MemberCore - Fitnessstudio-Verwaltung',
  description: 'Internes Verwaltungs- und Tracking-System für Fitnessstudios',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Topbar />
              <main className="flex-1 p-6">{children}</main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
} 
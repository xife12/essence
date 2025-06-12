import type { ReactNode } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <head>
        <title>Essence - Fitness Management</title>
      </head>
      <body className="bg-gray-50 font-sans">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Topbar />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}

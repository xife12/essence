import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MemberCore - Fitness-Studio Verwaltungssystem',
  description: 'Internes Verwaltungssystem für Fitnessstudios',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Fallback CSS falls Tailwind nicht lädt */
            .bg-blue-600 { background-color: #2563eb; }
            .text-white { color: white; }
            .p-4 { padding: 1rem; }
            .rounded { border-radius: 0.375rem; }
          `
        }} />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        {children}
      </body>
    </html>
  );
}

import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <head>
        <title>Essence (src/app/layout)</title>
      </head>
      <body className="bg-green-50 font-sans">
        <div className="border-4 border-green-500 p-4 m-4">
          <h1 className="text-xl font-bold text-green-700">Layout aus src/app/layout.tsx</h1>
          <div className="mt-4">{children}</div>
        </div>
      </body>
    </html>
  );
} 
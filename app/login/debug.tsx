'use client';

import React, { useEffect, useState } from 'react';

export default function DebugComponent() {
  const [envVars, setEnvVars] = useState({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'nicht gesetzt',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'gesetzt' : 'nicht gesetzt'
  });

  return (
    <div className="bg-red-50 p-4 rounded-md mb-4 text-sm">
      <h3 className="font-semibold">Debug-Info:</h3>
      <p>SUPABASE_URL: {envVars.url}</p>
      <p>SUPABASE_KEY: {envVars.key}</p>
    </div>
  );
} 
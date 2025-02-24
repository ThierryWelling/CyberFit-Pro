'use client';

import React from 'react';
import Sidebar from '../components/Sidebar';

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Background Layers */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="fixed inset-0 bg-background [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#7C3AFF_100%)]" style={{ opacity: 0.6 }} />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-pattern bg-[size:30px_30px] [mask-image:radial-gradient(white,transparent_90%)] opacity-20" />
      </div>

      {/* Layout */}
      <div className="relative min-h-screen">
        <Sidebar />
        <main className="pl-64">
          {children}
        </main>
      </div>
    </div>
  );
} 
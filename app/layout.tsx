import React from 'react';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './styles/globals.css';

export const metadata: Metadata = {
  title: 'CyberFit Pro',
  description: 'Sua academia digital moderna e intuitiva',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${GeistSans.className} min-h-screen bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}

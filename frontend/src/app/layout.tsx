import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'PRAVAH — AICTE Approval Operations Platform',
  description: 'Unified statutory approval operations platform for technical institutions under AICTE Approval Process Handbook (APH) regulations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="bg-brand-ivory text-brand-charcoal font-sans antialiased selection:bg-brand-copper/20 selection:text-brand-forest">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

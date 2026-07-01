import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Invent Project Control',
  description: 'Stage-gate sprint project control system for product development teams'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

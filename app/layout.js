import './globals.css';

export const metadata = {
  title: 'Invent Project Control',
  description: 'Stage Gate + Sprint Project Management System'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

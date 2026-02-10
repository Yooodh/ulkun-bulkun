import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '울끈불끈',
  description: '울끈불끈',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko'>
      <body>{children}</body>
    </html>
  );
}

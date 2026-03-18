import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { Providers } from './providers';
import { setupDatabaseUrl } from '@/lib/setup-db';

setupDatabaseUrl();

export const metadata: Metadata = {
  title: 'REVIZONE APLIKACE',
  description: 'Komplexní systém pro správu revizí',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

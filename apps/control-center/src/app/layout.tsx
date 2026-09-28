import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Venture OS Control Center', description: 'Evidence-based autonomous web venture operations.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

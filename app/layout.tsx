import type {Metadata} from 'next';
import { Analytics } from "@vercel/analytics/next";
import { Inter, Sarabun } from 'next/font/google';
import './globals.css'; // Global styles
import BottomNav from './components/BottomNav';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const sarabun = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ['thai'],
  variable: '--font-thai',
});

export const metadata: Metadata = {
  title: 'ThaiLearn',
  description: 'Apprenez le thaïlandais facilement',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  }
};

import DesktopSidebarLeft from './components/DesktopSidebarLeft';
import { CommunityModal } from './components/CommunityModal';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${sarabun.variable}`}>
       <body className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen flex" suppressHydrationWarning>
         <DesktopSidebarLeft />
         <CommunityModal />
         <div className="flex-1 flex flex-col min-h-screen min-w-0">
           {children}
           <BottomNav />
         </div>
         <Analytics />
       </body>
    </html>
  );
}

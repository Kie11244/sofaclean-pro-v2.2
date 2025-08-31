
import type { Metadata } from 'next'
import './globals.css';
import { Kanit } from 'next/font/google';
import { AuthProvider } from '@/contexts/auth-context';
import { SiteLayout } from '@/components/site-layout';


const kanit = Kanit({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-kanit',
});

// This is the default metadata for all pages
export const metadata: Metadata = {
  title: 'SofaClean Pro | บริการซักโซฟา ซักเบาะรถยนต์',
  description: 'บริการซักโซฟา ซักเบาะรถยนต์ ซักพรม ซักม่าน และที่นอนครบวงจร พร้อมบริการถึงบ้านและคอนโดในเขตกรุงเทพและปริมณฑล',
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={kanit.variable} suppressHydrationWarning>
        <body className="font-body antialiased">
            <AuthProvider>
                <SiteLayout>
                    {children}
                </SiteLayout>
            </AuthProvider>
        </body>
    </html>
  );
}

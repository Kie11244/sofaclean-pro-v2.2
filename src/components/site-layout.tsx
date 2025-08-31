
"use client";

import { usePathname } from 'next/navigation';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/header';
import { FloatingContact } from '@/components/floating-contact';
import { Suspense } from 'react';
import { Skeleton } from './ui/skeleton';

function HeaderSkeleton() {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md text-gray-800">
            <div className="container mx-auto px-6">
                 <div className="flex items-center justify-between h-20">
                    <Skeleton className="h-8 w-40" />
                    <div className="hidden md:flex items-center space-x-6">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                     <div className="md:hidden flex items-center gap-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-10 w-10" />
                     </div>
                 </div>
            </div>
        </div>
    )
}

export function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <>
        {!isAdminPage && (
            <Suspense fallback={<HeaderSkeleton />}>
                <Header />
            </Suspense>
        )}
        <main>{children}</main>
        {!isAdminPage && <FloatingContact />}
        <Toaster />
    </>
  );
}

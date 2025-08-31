
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { getDictionary } from '@/lib/dictionaries';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();
    const [dictionary, setDictionary] = useState<Awaited<ReturnType<typeof getDictionary>> | null>(null);

    const lang = (pathname.split('/')[1] || 'th') as 'en' | 'th';

    useEffect(() => {
        const fetchDict = async () => {
            const getDictionaryModule = await import('@/lib/dictionaries');
            const dict = await getDictionaryModule.getDictionary(lang);
            setDictionary(dict);
        };
        fetchDict();
    }, [lang]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isTransparent = (pathname === `/${lang}` || pathname === '/') && !isScrolled && !isOpen;

    const getLanguageSwitchPath = (currentPath: string, newLang: 'th' | 'en') => {
        const currentLang = currentPath.split('/')[1];
        if (currentLang === 'th' || currentLang === 'en') {
             return `/${newLang}${currentPath.substring(3)}`;
        }
        return `/${newLang}${currentPath}`;
    }
    
    if (!dictionary) return null; // or a loading skeleton

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            isTransparent ? "bg-transparent text-white" : "bg-white shadow-md text-gray-800"
        )}>
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    <div className="text-2xl font-bold">
                        <Link href={`/${lang}`} className={cn(isTransparent ? "text-white" : "text-emerald-600")}>
                            SofaClean Pro
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center space-x-6">
                        {dictionary.navigation.links && dictionary.navigation.links.map((link: { href: string; label: string; }) => (
                            <Link key={link.href} href={link.href.startsWith('/#') ? `/${lang}${link.href.substring(1)}` : `/${lang}${link.href.substring(1)}`} className="font-medium hover:text-emerald-500 transition-colors">
                                {link.label}
                            </Link>
                        ))}
                        <Button asChild>
                            <Link href={`/${lang}/#booking`}>{dictionary.navigation.contact}</Link>
                        </Button>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Languages />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={getLanguageSwitchPath(pathname, 'th')}>ไทย</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={getLanguageSwitchPath(pathname, 'en')}>English</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Languages />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={getLanguageSwitchPath(pathname, 'th')}>ไทย</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={getLanguageSwitchPath(pathname, 'en')}>English</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={() => setIsOpen(!isOpen)} variant="ghost" size="icon" className="ml-2">
                            <Menu className={cn("h-6 w-6", { 'hidden': isOpen })}/>
                            <X className={cn("h-6 w-6", { 'hidden': !isOpen })}/>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={cn(
                "md:hidden absolute top-20 left-0 right-0 bg-white shadow-lg text-gray-800 transition-all duration-300 ease-in-out transform",
                isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
            )}>
                <nav className="flex flex-col items-center p-6 space-y-4">
                     {dictionary.navigation.links && dictionary.navigation.links.map((link: { href: string; label: string; }) => (
                        <Link key={link.href} href={link.href.startsWith('/#') ? `/${lang}${link.href.substring(1)}` : `/${lang}${link.href.substring(1)}`} className="font-medium text-lg hover:text-emerald-500 transition-colors" onClick={() => setIsOpen(false)}>
                            {link.label}
                        </Link>
                    ))}
                    <Button asChild className="w-full">
                        <Link href={`/${lang}/#booking`} onClick={() => setIsOpen(false)}>{dictionary.navigation.contact}</Link>
                    </Button>
                </nav>
            </div>
        </header>
    );
}

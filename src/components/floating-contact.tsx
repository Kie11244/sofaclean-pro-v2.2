
"use client";

import { useState, useEffect, useRef } from 'react';
import { Phone as ContactIcon, X, Phone } from 'lucide-react';
import { FacebookIcon } from './icons/facebook-icon';
import { LineIcon } from './icons/line-icon';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import dict from '@/lib/dictionaries/th.json';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface ContactSettings {
    phone: string;
    facebookUrl: string;
    lineUrl: string;
}

export function FloatingContact() {
    const [isOpen, setIsOpen] = useState(false);
    const [contactLinks, setContactLinks] = useState([
        {
            href: "https://www.facebook.com/your-page",
            label: "Facebook",
            icon: <FacebookIcon className="h-7 w-7 text-white" aria-hidden="true" />,
            bgClass: "bg-blue-600 hover:bg-blue-700"
        },
        {
            href: "https://line.me/ti/p/~yourlineid",
            label: "Line",
            icon: <LineIcon className="h-7 w-7 text-white" aria-hidden="true" />,
            bgClass: "bg-green-500 hover:bg-green-600"
        },
        {
            href: "tel:0812345678",
            label: "Phone",
            icon: <Phone className="h-7 w-7 text-white" aria-hidden="true" />,
            bgClass: "bg-indigo-600 hover:bg-indigo-700"
        }
    ]);

    const wrapperRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const fetchContactSettings = async () => {
            const docRef = doc(db, "settings", "contact");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as ContactSettings;
                setContactLinks([
                    {
                        href: data.facebookUrl,
                        label: "Facebook",
                        icon: <FacebookIcon className="h-7 w-7 text-white" aria-hidden="true" />,
                        bgClass: "bg-blue-600 hover:bg-blue-700"
                    },
                    {
                        href: data.lineUrl,
                        label: "Line",
                        icon: <LineIcon className="h-7 w-7 text-white" aria-hidden="true" />,
                        bgClass: "bg-green-500 hover:bg-green-600"
                    },
                    {
                        href: `tel:${data.phone}`,
                        label: "Phone",
                        icon: <Phone className="h-7 w-7 text-white" aria-hidden="true" />,
                        bgClass: "bg-indigo-600 hover:bg-indigo-700"
                    }
                ]);
            }
        };

        fetchContactSettings();
    }, []);

    const handleLinkClick = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const toggleButtonLabel = isOpen ? dict.floatingContact.close : dict.floatingContact.open;

    return (
        <div ref={wrapperRef} className="fixed bottom-5 right-5 z-50 flex flex-col items-center">
            <div className={cn(
                "flex flex-col items-center gap-3 mb-3 transition-all duration-300 ease-in-out",
                isOpen ? 'max-h-96 opacity-100 translate-y-0' : 'max-h-0 opacity-0 translate-y-4 overflow-hidden'
            )}>
                {contactLinks.map((link, index) => (
                    <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleLinkClick}
                        className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform transform hover:scale-110",
                            link.bgClass
                        )}
                        aria-label={link.label}
                        style={{ transitionDelay: isOpen ? `${index * 50}ms` : '0ms' }}
                    >
                        {link.icon}
                    </a>
                ))}
            </div>

            <Button
                onClick={() => setIsOpen(!isOpen)}
                aria-label={toggleButtonLabel}
                aria-expanded={isOpen}
                size="icon"
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-16 h-16 rounded-full shadow-xl focus:outline-none relative"
            >
                <ContactIcon aria-hidden="true" className={cn("h-8 w-8 transition-all duration-300", isOpen ? 'opacity-0 scale-50 rotate-45' : 'opacity-100 scale-100 rotate-0')} />
                <X aria-hidden="true" className={cn("h-8 w-8 absolute transition-all duration-300", isOpen ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-45')} />
            </Button>
        </div>
    );
}

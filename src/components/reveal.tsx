"use client";

import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: string;
}

export function Reveal({ children, className, delay = '0ms' }: RevealProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-1000 ease-out',
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12',
        className
      )}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
}

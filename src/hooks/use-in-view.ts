"use client";

import { useState, useEffect, useRef } from 'react';

interface InViewOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
}

export function useInView(options: InViewOptions = {}) {
  const { threshold = 0.1, root = null, rootMargin = '0px', triggerOnce = false } = options;
  const [inView, setInView] = useState(false);
  const ref = useRef<any>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current);
          }
        } else {
            if (!triggerOnce) {
                setInView(false);
            }
        }
      },
      {
        threshold,
        root,
        rootMargin,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, root, rootMargin, triggerOnce]);

  return { ref, inView };
}

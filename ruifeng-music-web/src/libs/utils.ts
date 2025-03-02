'use client';
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { useState, useEffect } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function useScroll(threshold: number = 0) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
      const handleScroll = () => {
          setScrolled(window.scrollY > threshold);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
}

export function cn1(threshold: number = 0) {
  const [scrolled, setScrolled] = useState(false);
  return scrolled;
}

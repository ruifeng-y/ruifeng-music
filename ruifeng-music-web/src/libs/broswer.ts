'use client';

import { useState, useEffect } from 'react';

/**
 * 判断浏览器是否处于全屏状态
 */
export const isFullscreen = () => document.fullscreenElement !== null;

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

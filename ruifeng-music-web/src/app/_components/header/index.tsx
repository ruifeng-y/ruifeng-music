'use client';
import { FC } from 'react';

import { HeaderLogo } from './logo';
import { cn } from '@/libs/utils';
import { useScroll } from '@/libs/broswer';

import { HeaderNav } from './nav';
import { HeaderUser } from './user';

import $styles from './styles.module.css';

export const Header: FC = () => {
    const scrolled = useScroll(50);

    return (
        <header
            className={cn($styles.header, 'tw-page-container', {
                [$styles['header-scrolled']]: scrolled,
                [$styles['header-unscrolled']]: !scrolled,
            })}
        >
            <div
                className={cn($styles.container, {
                    // 'tw-mt-4': !scrolled,
                })}
            >
                <HeaderLogo scrolled={scrolled} />
                <HeaderNav scrolled={scrolled} />
                <HeaderUser scrolled={scrolled} />
            </div>
        </header>
    );
};

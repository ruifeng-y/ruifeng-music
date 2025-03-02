'use client';
import { FC } from 'react';

import { HeaderLogo } from './logo';;
import { Navbar } from '@/app/_components/header/navigation';
import { cn } from '@/libs/utils';
import { useScroll } from '@/libs/broswer';

import { HeaderNav } from './nav';
import { HeaderUser } from './user';

import $styles from './styles.module.css'

// export const Header: FC = () => {
//     return (    
//     <header className={$styles.header}>
//         {/* <HeaderLogo /> */}
//         <Navbar/>
//     </header>);
// }

export const Header: FC = () => {
    const scrolled = useScroll(50);

    return (
        <header
            className={cn($styles.header, 'tw-page-container', {
                [$styles['header-scrolled']]: scrolled,
                [$styles['header-unscrolled']]: !scrolled,
            })}
        >
        {/* // <header className={$styles.header}> */}
            <div
                className={cn($styles.container, {
                    'tw-mt-4': !scrolled,
                })}
            >
                <HeaderLogo scrolled={scrolled} />
                {/* Desktop Navigation */}
                <HeaderNav scrolled={scrolled} />
                {/* User Menu */}
                <HeaderUser scrolled={scrolled} />
            </div>
        </header>
    );
};

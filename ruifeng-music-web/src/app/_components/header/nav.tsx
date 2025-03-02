import Link from 'next/link';
import { FC } from 'react';

import { cn } from '@/libs/utils';

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '../shadcn/navigation-menu';

import $styles from './nav.module.css';

const items = [
    {
        title: '首页',
        href: '/',
    },
    {
        title: '歌单',
        href: '/playlist',
    },
    {
        title: '歌手',
        href: '/singer',
    },
    {
        title: '歌词',
        href: '/lyrics',
    },
];
export const HeaderNav: FC<{ scrolled: boolean }> = ({ scrolled }) => (
    <div className={$styles.nav}>
        <NavigationMenu className={$styles.menus}>
            <NavigationMenuList>
                {items.map((item) => (
                    <NavigationMenuItem
                        key={item.href}
                        className={cn(
                            $styles['menu-item'],
                            scrolled
                                ? $styles['menu-item-scrolled']
                                : $styles['menu-item-unscrolled'],
                        )}
                    >
                        <Link href={item.href} legacyBehavior passHref>
                            <NavigationMenuLink className={cn(navigationMenuTriggerStyle())}>
                                {item.title}
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    </div>
);

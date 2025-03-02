import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import Avatar from './avatar.svg';
import { cn } from '@/libs/utils';

import $styles from './logo.module.css';

// export const HeaderLogo = () => (
//     // 功能：这是一个链接元素，用于将用户引导到网站的根路径 (/)，通常是主页。
//     // href="/"：表示该链接指向网站的首页。
//     // 使用了动态的样式类
//     <Link href="/" className={$styles.link}>
//         <Image
//             // 表示图像的来源是 Avatar。这通常是一个图像路径或导入的图像资源。你需要确保 Avatar 是一个有效的图片资源。
//             src={Avatar}
//             // 这是图片的替代文本。如果图片加载失败或用户使用屏幕阅读器，这个文本会显示。它有助于提高无障碍性和 SEO。
//             alt="avatar logo"
//             // 这是 img 元素的 sizes 属性，用于响应式图片。它表示图像应该占据视口的宽度。通常这个属性与 srcSet 一起使用，来适配不同设备的分辨率。这里用 100vw 表示图像的宽度始终为视口的 100%
//             sizes="100vw"
//             // 通过内联样式设置图像宽度为 100%，即宽度填满父元素，而高度根据宽度自动调整以保持图片比例。这样可以保证图片在不同设备上自适应调整大小。
//             style={{
//                 width: '100%',
//                 height: 'auto',
//             }}
//         />
//     </Link>
// );

export const HeaderLogo: FC<{ scrolled: boolean }> = ({ scrolled }) => (
    <div
        className={cn(
            $styles.logo,
            scrolled ? $styles['logo-scrolled'] : $styles['logo-unscrolled'],
        )}
    >
        <Link href="/">Ruifeng Music</Link>
    </div>
);

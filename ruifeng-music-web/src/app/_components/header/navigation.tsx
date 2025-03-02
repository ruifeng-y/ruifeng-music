import { FC } from 'react';
import * as React from 'react';
import Link from 'next/link';

import styles from './navbar.module.css'; // 用来引用样式

export const Navbar: FC = () => {
    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                {/* 左侧区域：Logo和导航链接 */}
                <div className={styles.leftSection}>
                    <Link href="/" className={styles.logo}>
                        Ruifeng Music
                    </Link>
                    <ul className={styles.navLinks}>
                        <li>
                            <Link href="/">首页</Link>
                        </li>
                        <li>
                            <Link href="/playlist">歌单</Link>
                        </li>
                        <li>
                            <Link href="/singer">歌手</Link>
                        </li>
                        <li>
                            <Link href="/contact">搜索</Link>
                        </li>
                    </ul>
                </div>

                {/* 登录和注册按钮 */}
                <div className={styles.authButtons}>
                    <Link href="/login" className={styles.loginBtn}>
                        登录
                    </Link>
                    <Link href="/register" className={styles.registerBtn}>
                        注册
                    </Link>
                </div>
            </div>
        </nav>
    );
};

// export default Navbar;

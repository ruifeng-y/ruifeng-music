import { isNil } from 'lodash';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { FC } from 'react';

import { AiOutlineCalendar } from 'react-icons/ai';

import { Tools } from '@/app/_components/home/tools';

import { queryPostItemById } from '@/app/actions/post';

import $styles from './page.module.css';

const PostItemPage: FC<{ params: { item: string } }> = async ({ params }) => {
    const post = await queryPostItemById(params.item);
    if (isNil(post)) return notFound();
    return (
        <div className="tw-page-container">
            <Tools back />
            <div className={$styles.item}>
                <div className={$styles.thumb}>
                    <Image
                        src={post.thumb}
                        alt={post.title}
                        fill
                        priority
                        sizes="100%"
                        // 如果使用bun,请务必加上这个,因为bun中启用远程图片优化会报错
                        unoptimized
                    />
                </div>

                <div className={$styles.content}>
                    <header className={$styles.title}>
                        <h1>{post.title}</h1>
                    </header>
                    <div className={$styles.meta}>
                        <div>
                            <span>
                                <AiOutlineCalendar />
                            </span>
                            <time className="tw-ellips">2024年8月10日</time>
                        </div>
                    </div>
                    <div className={$styles.body}>{post.body}</div>
                </div>
            </div>
        </div>
    );
};
export default PostItemPage;

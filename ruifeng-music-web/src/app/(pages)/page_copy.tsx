// clsx：一个用于动态组合类名的工具，可以根据条件添加或移除类名。
import clsx from 'clsx';
// lodash：一个实用的工具库，这里使用了 isNil 来检查一个值是否为 null 或 undefined。
import { isNil } from 'lodash';
// Image 和 Link：来自 Next.js 的组件，Image 用于处理图像优化，Link 用于页面导航。
import Image from 'next/image';
import Link from 'next/link';
// redirect：来自 Next.js，用于在页面加载时进行重定向。
import { redirect } from 'next/navigation';
import { FC } from 'react';
// AiOutlineCalendar：一个来自 react-icons 的图标组件，显示一个日历图标。
import { AiOutlineCalendar } from 'react-icons/ai';
// queryPostPaginate：自定义的 API 调用函数，用于获取带有分页数据的文章列表。
import { queryPostPaginate } from '@/app/actions/post';
// Tools、PostDelete、PostEditButton、PostListPaginate：自定义的 React 组件，分别用于工具栏、删除按钮、编辑按钮和分页功能。
import { Tools } from '../_components/home/tools';

import { IPaginateQueryProps } from '../_components/paginate/types';
import { PostDelete } from '../_components/post/delete';
import { PostEditButton } from '../_components/post/edit-button';
import { PostListPaginate } from '../_components/post/paginate';

import { CarouselPage } from '@/app/_components/home/carousel';

import $styles from './page.module.css';

/**
 * 该组件是 HomePage，接收一个名为 searchParams 的 prop，它包含了分页查询的参数。组件的主要任务是根据分页参数请求文章数据并展示在页面上。
 * @param param0
 */
const HomePage: FC<{ searchParams: IPaginateQueryProps }> = async ({ searchParams }) => {
    // 通过 searchParams 获取分页参数 page 和 limit，如果没有传入 page 或 page 小于 1，则默认设置为第 1 页。
    // limit 默认是 8，表示每页显示 8 篇文章。
    const { page: currentPage, limit = 8 } = searchParams;
    // 当没有传入当前页或当前页小于1时，设置为第1页
    const page = isNil(currentPage) || Number(currentPage) < 1 ? 1 : Number(currentPage);
    // 使用 queryPostPaginate 函数来获取文章数据。这个函数会根据当前的页数和每页显示的文章数量返回一个包含 items（文章列表）和 meta（分页信息）的对象。
    const { items, meta } = await queryPostPaginate({ page: Number(page), limit });
    console.log('调用queryPostPaginate');

    // 如果当前页数大于总页数，页面会重定向到首页。
    if (meta.totalPages && meta.totalPages > 0 && page > meta.totalPages) {
        return redirect('/');
    }

    /**
     * 渲染一个包含文章封面图、标题、摘要和操作按钮（编辑、删除）的列表。
     * 每篇文章的封面图使用 Next.js 的 Image 组件来优化加载，并通过 Link 实现点击跳转到文章详情页。
     * 每篇文章的标题和摘要会显示，如果没有摘要，则显示文章内容的前 99 个字符。
     * 在文章底部显示文章的发布时间和操作按钮（编辑、删除）。
     */
    return (
        <div className="tw-page-container">
            {/* <CarouselPage /> */}
            <Tools />
            <div className={$styles.list}>
                {items.map((item) => (
                    <div
                        className={$styles.item}
                        // 传入css变量的封面图用于鼠标移动到此处后会出现不同颜色的光晕效果
                        style={{ '--bg-img': `url(${item.thumb})` } as any}
                        key={item.id}
                    >
                        <Link className={$styles.thumb} href={`/posts/${item.id}`}>
                            <Image
                                src={item.thumb}
                                alt={item.title}
                                fill
                                priority
                                sizes="100%"
                                // 如果使用bun,请务必加上这个,因为bun中启用远程图片优化会报错
                                unoptimized
                            />
                        </Link>
                        <div className={$styles.content}>
                            <div className={clsx($styles.title, 'tw-hover')}>
                                <Link href={`/posts/${item.id}`}>
                                    <h2 className="tw-ellips tw-animate-decoration tw-animate-decoration-lg">
                                        {item.title}
                                    </h2>
                                </Link>
                            </div>
                            <div className={$styles.summary}>
                                {/* 如果没有摘要，则显示文章内容的前 99 个字符。 */}
                                {isNil(item.summary) ? item.body.substring(0, 99) : item.summary}
                            </div>
                            <div className={$styles.footer}>
                                <div className={$styles.meta}>
                                    <span>
                                        {/* 一个来自 react-icons 的图标组件，显示一个日历图标。 */}
                                        <AiOutlineCalendar />
                                    </span>
                                    <time className="tw-ellips">2024年8月10日</time>
                                </div>
                                <div className={$styles.meta}>
                                    {/* 编辑按钮 */}
                                    <PostEditButton id={item.id} />
                                    {/* 删除按钮 */}
                                    <PostDelete id={item.id} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* 
                分页组件
                如果总页数大于 1，则显示分页组件 PostListPaginate，用于切换不同的页面。
                (!) 是非空断言操作符，用于 TypeScript 中。避免编译错误。
                这段代码的作用是：在确认 meta.totalPages 非空的情况下，检查它是否大于 1，若为真则渲染分页组件 <PostListPaginate />。
            */}
            {meta.totalPages! > 1 && <PostListPaginate limit={8} page={page} />}
        </div>
    );
};

export default HomePage;

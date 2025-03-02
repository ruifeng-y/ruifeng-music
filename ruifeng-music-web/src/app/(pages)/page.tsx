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

// import { CarouselPage } from '@/app/_components/home/carousel';
import EmblaCarousel from '@/app/_components/home/carousel/js/EmblaCarousel';
import { EmblaOptionsType } from 'embla-carousel';
import Header from '@/app/_components/home/carousel/js/Header';
import Footer from '@/app/_components/home/carousel/js/Footer';

const OPTIONS: EmblaOptionsType = { loop: true };
const SLIDE_COUNT = 5;
const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

import '@/app/_components/home/carousel/css/base.css';
import '@/app/_components/home/carousel/css/sandbox.css';
import '@/app/_components/home/carousel/css/embla.css';

import { CarouselHome } from '@/app/_components/home/carousel/carousel-page';
import { GridColumn } from '@/app/_components/home/grid/grid-column';
// import { Navigation } from '@/app/_components/navigation-bar/navigation';
// import { PlayerBar } from '@/app/_components/playerBar/playerBar';
import { List } from '@/app/_components/playlist/playlist';
import { SongList } from '@/app/_components/home/songList';

import { get } from '@/app/api/api';

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
    // 查询歌手列表
    const singerListResponse = await get('api/content/singer/querySingerList');
    const singerList = singerListResponse.data;
    // 查询歌曲列表
    const songListResponse = await get('api/content/songList/querySongList');
    const songListData = songListResponse.data;
    // console.log("调用 querySongList",songListData);
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
            <CarouselHome />
            {/* <GridColumn/> */}
            {/* <SongList/> */}
            <List props={singerList} />
            <List props={songListData} />
            {/* <GridColumn/> */}
            {/* <PlayerBar/> */}
        </div>
    );
};

export default HomePage;

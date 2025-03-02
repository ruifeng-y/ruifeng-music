'use client';
// isNil: 来自 lodash 库，用于判断一个值是否为 null 或 undefined。
import { isNil } from 'lodash';
// Link: 来自 Next.js，用于创建客户端导航链接。在这里，Link 被用来将按钮包裹成一个可点击的链接，点击后会跳转到 /post-create 页面。
import Link from 'next/link';
// 来自 Next.js 的钩子，用于获取当前页面的查询参数。
import { useSearchParams } from 'next/navigation';
// FC: 表示 Functional Component，即函数式组件，是 React 的类型定义。
// useMemo: React hook，用于记忆计算结果，避免不必要的重复计算。
import { FC, useMemo } from 'react';
// 来自 react-icons，用于引入一个添加（加号）图标。
import { IoMdAdd } from 'react-icons/io';
//  来自 Shadcn UI 的按钮组件，用于渲染按钮。
import { Button } from '../shadcn/button';

/**
 * 这段代码定义了一个 创建文章按钮组件 (PostCreateButton)，该按钮提供了一个链接，点击后会跳转到创建文章的页面 /post-create。
 * 其中特别之处在于，它会保留当前页面的 URL 查询参数（例如分页信息），以便在跳转到创建文章页面后，用户可以返回时继续保持当前的分页状态
 * 功能总结
 * PostCreateButton 渲染了一个按钮，点击后会跳转到 /post-create 页面，允许用户创建文章。
 * 如果当前 URL 中包含查询参数（例如分页信息），它会保留这些查询参数，确保用户在创建文章后返回时能够继续保持分页状态
 * 该按钮使用了 Next.js 的 Link 组件、Shadcn UI 的 Button 组件以及 React 的 useMemo 钩子来优化性能。
 */
export const PostCreateButton: FC = () => {
    //  使用 useSearchParams 钩子获取当前 URL 中的查询参数（例如分页信息）。
    const searchParams = useSearchParams();
    // 通过 useMemo 计算查询参数的字符串形式，并且避免重复计算。当 URL 查询参数不为空时，它会返回带 ? 的查询字符串，
    // 例如 ?page=2&sort=asc；如果没有查询参数，则返回空字符串 ''。
    const getUrlQuery = useMemo(() => {
        // 将 searchParams 转换为 URL 查询字符串。
        const query = new URLSearchParams(searchParams.toString()).toString();
        // 保留当前分页的url查询，不至于在打开创建文章后，导致首页的文章列表重置分页
        return isNil(query) || query.length < 1 ? '' : `?${query}`;
    }, [searchParams]);

    return (
        <Button 
        //  组件的 asChild 属性使得该按钮组件渲染为一个子组件（而不是常规的 button 标签）。
        // 具体来说，Button 内部渲染了一个 Link 组件，变相将按钮的功能替换为跳转链接。
        asChild 
        // tw-justify-end: 使用 Tailwind CSS 类，将按钮内容对齐到右边。
        // tw-rounded-sm: 设置按钮的圆角样式。
        // tw-ml-auto: 设置自动左边距，使得按钮向右边对齐（即按钮出现在右侧）。
        // variant="outline": 设置按钮的样式为轮廓风格（有边框、没有背景色）。

        // Link: 包裹在按钮内的 Link 组件会在点击时导航到 /post-create 页面，并附带当前的查询参数（如分页信息）。
        className="tw-justify-end tw-rounded-sm tw-ml-auto" variant="outline">
            <Link href={`/post-create${getUrlQuery}`}>
                <IoMdAdd className="tw-mr-2 " />
                创建
            </Link>
        </Button>
    );
};

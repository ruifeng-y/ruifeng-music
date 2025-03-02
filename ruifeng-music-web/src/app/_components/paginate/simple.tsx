'use client';

import clsx from 'clsx';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC, useCallback, useEffect } from 'react';

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/app/_components/shadcn/pagination';

/**
 * SimplePaginate 是一个接受 totalPages（总页数）和 currentPage（当前页码）作为 props 的分页组件。
 * 如果总页数大于 1，它将显示“上一页”和“下一页”按钮，允许用户在不同的页面之间切换。
 * 
 * 依赖的钩子
 * usePathname: 获取当前的 URL 路径，不包括查询参数。
 * useRouter: 提供对路由的控制，如跳转到新的页面。
 * useSearchParams: 获取当前 URL 中的查询参数，以便可以基于它们动态调整页面内容。
 * @param param0 
 */
const SimplePaginate: FC<{ totalPages: number; currentPage: number }> = ({
    totalPages,
    currentPage,
}) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    // getPageUrl 是一个回调函数，它根据当前的 searchParams 和传入的页面值（value）生成一个新的 URL。
    // 当页码小于等于 1 时，会删除 URL 中的 page 参数，否则将页码参数设置为新的值
    const getPageUrl = useCallback(
        (value: number) => {
            const params = new URLSearchParams(searchParams);
            // value <= 1 ? params.delete('page')：如果页码小于等于 1，删除 page 参数。
            // params.set('page', value.toString())：如果页码大于 1，设置 page 为新的页码。
            value <= 1 ? params.delete('page') : params.set('page', value.toString());

            return pathname + (params.toString() ? `?${params.toString()}` : '');
        },
        [searchParams],
    );

    // 这个 useEffect 用来在组件渲染时检查当前页码，并根据条件更新 URL 查询参数。如果当前页码小于或等于 1，
    // 就删除 page 参数，并使用 router.replace 更新 URL，而不触发页面重新加载。
    useEffect(() => {
        // 在当前页面小于等于1时，删除URL中的页面查询参数
        const params = new URLSearchParams(searchParams);
        // currentPage <= 1：当当前页码小于或等于 1 时，删除 URL 中的 page 参数。
        // router.replace：更新当前页面的 URL，但不会重新加载页面。
        if (currentPage <= 1) params.delete('page');
        router.replace(pathname + (params.toString() ? `?${params.toString()}` : ''));
    }, [currentPage]);

    /**
     * 渲染逻辑
     * 如果 totalPages 大于 1，组件会渲染一个分页界面，包含“上一页”和“下一页”按钮。每个按钮会根据当前页码是否到达边界（第一页或最后一页）来决定是否禁用。
     * PaginationPrevious 和 PaginationNext 是两个按钮，分别用于“上一页”和“下一页”。它们的样式是根据当前页码（currentPage）来动态调整的：
     * 如果当前页码已经是第一页，PaginationPrevious 会被禁用。
     * 如果当前页码已经是最后一页，PaginationNext 会被禁用。
     * 如果按钮没有禁用，会根据状态（例如 currentPage）添加不同的样式类，以便进行交互时提供视觉反馈（例如 hover:tw-shadow-nylg）。
     */
    return totalPages > 1 ? (
        <Pagination className="tw-justify-start">
            <PaginationContent className="tw-w-full tw-justify-between">
                <PaginationItem>
                    <PaginationPrevious
                        className={clsx(
                            'tw-rounded-sm',
                            currentPage <= 1
                                ? 'tw-shadow-gray-50 tw-bg-slate-50/70'
                                : ' tw-bg-white/90 hover:tw-shadow-nylg hover:tw-shadow-white',
                        )}
                        href={getPageUrl(currentPage - 1)}
                        disabled={currentPage <= 1}
                        aria-label="访问上一页"
                        text="上一页"
                    />
                </PaginationItem>

                <PaginationItem>
                    <PaginationNext
                        className={clsx(
                            'tw-rounded-sm',
                            currentPage >= totalPages
                                ? 'tw-shadow-gray-50 tw-bg-slate-50/70'
                                : ' tw-bg-white/90 hover:tw-shadow-nylg hover:tw-shadow-white',
                        )}
                        href={getPageUrl(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        aria-label="访问下一页"
                        text="下一页"
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    ) : null;
};
export default SimplePaginate;

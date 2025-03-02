import { ChevronLeftIcon, ChevronRightIcon, DotsHorizontalIcon } from '@radix-ui/react-icons';
import clsx from 'clsx';
import { isNil } from 'lodash';
import Link from 'next/link';
import * as React from 'react';

import { ButtonProps, buttonVariants } from '@/app/_components/shadcn/button';
import { cn } from '@/libs/utils';

/**
 * 分页组件，用于渲染分页导航。
 * 这段代码实现了一个分页组件，主要功能包括：
 * 页面链接、上一页、下一页、和省略符号（用于大范围的分页）。
 * 样式采用 Tailwind CSS 进行布局和样式控制。
 * 可定制性较高，可以通过传递不同的 props 来修改样式和行为。
 * 使用 clsx 和 cn 来处理条件类名，增强了代码的灵活性和可读性。
 * 组件的设计考虑了可访问性，并提供了良好的用户交互体验（如禁用状态、当前页标识等）。
 */

/**
 * 这是一个包装分页容器的组件，使用了 nav 标签来语义化地标识分页部分，设置了 role="navigation" 和 aria-label="pagination"，以增强可访问性。
 * 使用 cn 函数来处理动态类名（tw-mx-auto tw-flex tw-w-full tw-justify-center），以及接收的 className 属性来定制外部样式。
 * @param param0 
 */
const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
    <nav
        role="navigation"
        aria-label="pagination"
        className={cn('tw-mx-auto tw-flex tw-w-full tw-justify-center', className)}
        {...props}
    />
);
Pagination.displayName = 'Pagination';

/**
 * 这是分页内容的容器，使用 ul 标签来包裹分页项。
 * 它使用 tw-flex 和 tw-gap-1 来设置为横向排列，并且 className 可以通过 props 传递进行自定义。
 */
const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
    ({ className, ...props }, ref) => (
        <ul
            ref={ref}
            className={cn('tw-flex tw-flex-row tw-items-center tw-gap-1', className)}
            {...props}
        />
    ),
);
PaginationContent.displayName = 'PaginationContent';

/**
 * 这个组件代表每一个分页项，它包裹了一个 li 元素。
 * 通过 className 和其他 props 来定制样式。
 */
const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
    ({ className, ...props }, ref) => <li ref={ref} className={cn('tw-', className)} {...props} />,
);
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
    isActive?: boolean;
    disabled?: boolean;
    'aria-label'?: string;
    text?: string;
} & Pick<ButtonProps, 'size'> &
    React.ComponentProps<'a'>;

/**
 * 用于渲染分页链接，包括页面号码、上一页、下一页等。
 * 它使用 Link 组件（Next.js 提供的）来生成链接，aria-current 用于标识当前页面，aria-disabled 标识禁用状态。
 * buttonVariants 用来设置按钮的变种（例如 ghost 或 outline），并根据 isActive 来决定按钮的样式。
 * @param param0 
 */
const PaginationLink = ({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) => (
    <Link
        aria-current={isActive ? 'page' : undefined}
        className={cn(
            buttonVariants({
                variant: isActive ? 'outline' : 'ghost',
                size,
            }),
            clsx({ 'tw-pointer-events-none tw-opacity-50': props.disabled }),
            className,
        )}
        {...props}
        aria-disabled={props.disabled}
        href={isNil(props.href) ? ':' : props.href}
    />
);
PaginationLink.displayName = 'PaginationLink';

/**
 * 渲染“上一页”按钮，使用了 ChevronLeftIcon 来显示左箭头图标。
 * 提供了自定义的 aria-label 属性来增强可访问性，默认值是 "Go to previous page"。
 * @param param0 
 */
const PaginationPrevious = ({
    className,
    text,
    'aria-label': ariaLabel,
    ...props
}: React.ComponentProps<typeof PaginationLink>) => (
    <PaginationLink
        aria-label={ariaLabel ?? 'Go to previous page'}
        size="default"
        className={cn('tw-gap-1 tw-pl-2.5', className)}
        {...props}
    >
        <ChevronLeftIcon className="tw-h-4 tw-w-4" />
        <span>{text ?? 'Previous'}</span>
    </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

/**
 * 渲染“下一页”按钮，使用了 ChevronRightIcon 来显示右箭头图标。
 * 也提供了自定义的 aria-label 属性来增强可访问性，默认值是 "Go to next page"。
 * @param param0 
 */
const PaginationNext = ({
    className,
    text,
    'aria-label': ariaLabel,
    ...props
}: React.ComponentProps<typeof PaginationLink>) => (
    <PaginationLink
        aria-label={ariaLabel ?? 'Go to next page'}
        size="default"
        className={cn('tw-gap-1 tw-pr-2.5', className)}
        {...props}
    >
        <span>{text ?? 'Next'}</span>
        <ChevronRightIcon className="tw-h-4 tw-w-4" />
    </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

/**
 * 渲染一个表示省略号的按钮，用于分页中间省略的页码（比如 1 ... 5 ... 10）。
 * 使用了 DotsHorizontalIcon 来显示水平省略号图标。
 * @param param0 
 */
const PaginationEllipsis = ({
    className,
    text,
    'aria-label': ariaLabel,
    ...props
}: React.ComponentProps<'span'> & { text?: string }) => (
    <span
        aria-hidden
        className={cn('tw-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center', className)}
        {...props}
    >
        <DotsHorizontalIcon className="tw-h-4 tw-w-4" />
        <span className="tw-sr-only">{text ?? 'More pages'}</span>
    </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
    Pagination,
    PaginationContent,
    PaginationLink,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
};

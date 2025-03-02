'use client';
// clsx: 这个库用于动态地组合类名（className）。它允许根据条件添加、删除或修改类名。
import clsx from 'clsx';
// useRouter: 来自 Next.js 的钩子，用于访问路由相关功能。在这里，它用于控制页面的导航。
import { useRouter } from 'next/navigation';
// FC: 表示 Functional Component，是 React 的类型定义。
// MouseEventHandler: 用于指定鼠标事件处理程序类型。
// useCallback, useEffect, useState: React hooks，用于管理组件的状态和副作用。
import { FC, MouseEventHandler, useCallback, useEffect, useState } from 'react';
// TiArrowBack: 来自 react-icons 的返回箭头图标，用于按钮显示。
import { TiArrowBack } from 'react-icons/ti';
// Button: 从 Shadcn UI 引入的按钮组件。
import { Button } from '../shadcn/button';

/**
 * 这段代码定义了一个 返回按钮组件 (BackButton)，它是一个使用 React 和 Next.js 的功能组件。
 * 该组件结合了 Shadcn UI 的 Button 组件、React hooks 以及 Next.js 的路由控制，
 * 实现了一个带有返回功能的按钮，并且在浏览器历史记录长度不足时禁用按钮。
 * BackButton 组件的功能如下：
 * 它渲染了一个带有 "返回" 文本和箭头图标的按钮。
 * 在用户点击按钮时，如果浏览器历史记录中存在至少一个页面，按钮会触发 router.back()，将用户导航到上一个页面。
 * 如果浏览器历史记录长度小于等于 1（意味着用户无法返回到上一页），按钮会变得禁用，无法点击。
 * 组件使用了 React 的 useState, useEffect 和 useCallback 钩子来管理状态和副作用。
 *
 * 这个组件在构建 单页面应用（SPA）时非常有用，可以方便地为用户提供返回上一个页面的功能。
 */
export const BackButton: FC = () => {
    // useRouter 被用来获取 Next.js 的路由实例（router），从而能够使用它的 back 方法实现浏览器的后退功能。
    const router = useRouter();
    // historyLength 用于存储浏览器历史记录的长度，它会通过 window.history.length 获取。这是用来判断当前页面是否能执行 router.back() 返回上一个页面。
    const [historyLength, setHistoryLength] = useState(0);
    // useEffect 用于在组件挂载时执行副作用，这里它会在浏览器环境中获取并设置历史记录长度。
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setHistoryLength(window.history.length);
        }
    }, []);

    /**
     * goBack 是一个回调函数，用于处理按钮点击事件。
     */
    const goBack: MouseEventHandler<HTMLButtonElement> = useCallback(
        (e) => {
            // 阻止默认的按钮行为。
            e.preventDefault();
            // 如果 historyLength 大于 1，则调用 router.back() 返回到浏览器历史记录中的上一个页面。这样确保只有在浏览器历史记录足够时，才能执行返回操作（即用户之前有访问的页面）。
            if (historyLength > 1) router.back();
        },
        [historyLength],
    );

    /**
     * 这里渲染了一个 Button 组件。
     */
    return (
        <Button
            // 设置按钮的样式为轮廓样式（通常是边框样式，没有背景色）。
            variant="outline"
            // tw-rounded-sm：设置按钮的圆角。
            // 如果 historyLength <= 1（即没有历史记录可以返回），按钮会禁用。此时，按钮会添加 tw-pointer-events-none（禁用鼠标事件）和 tw-opacity-50（降低透明度，表示禁用状态）。
            className={clsx('tw-rounded-sm', {
                'tw-pointer-events-none tw-opacity-50': historyLength <= 1,
            })}
            // 禁用按钮并为无障碍技术设置相应属性，确保按钮在没有历史记录可返回时处于禁用状态。
            disabled={historyLength <= 1}
            aria-disabled={historyLength <= 1}
            // 设置点击按钮时触发 goBack 函数。
            onClick={goBack}
            // TiArrowBack：一个箭头图标，位于按钮文本之前，表示返回操作。
        >
            <TiArrowBack className="tw-mr-2" />
            返回
        </Button>
    );
};

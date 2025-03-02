'use client';

import clsx from 'clsx';
import { trim } from 'lodash';
import glob from 'micromatch';
import { usePathname, useRouter } from 'next/navigation';
import { FC, useCallback, useEffect, useState } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../shadcn/dialog';

import $styles from './page-modal.module.css';
import { PageModalProps } from './types';

/**
 * title: 模态框的标题。
 * match: 一个包含路径匹配模式的数组，用于判断当前页面的 URL 是否与这些模式匹配。如果匹配，则显示模态框。
 * className: 用来传递给 DialogContent 组件的额外 CSS 类。
 * children: 作为模态框内容的组件或元素。
 * @param param0 
 */
export const PageModal: FC<PageModalProps> = ({ title, match, className, children }) => {
    // usePathname：获取当前页面的路径（例如：/about）。
    const pathname = usePathname();
    // 提供路由控制，比如 router.back() 用于返回上一页。
    const router = useRouter();
    // useState 和 useEffect 用来控制模态框的显示状态。
    // show：表示模态框是否显示。
    const [show, setShow] = useState(false);
    // useEffect：当页面路径 (pathname) 或 match 数组变化时，判断当前路径是否与 match 中的任意模式匹配。如果匹配，则设置 show 为 true，表示模态框应显示。
    useEffect(() => {
        setShow(
            // glob.isMatch：通过 micromatch 库的 isMatch 方法来判断当前路径是否匹配 match 数组中的任何模式。
            glob.isMatch(
                trim(pathname, '/'),
                match.map((m) => trim(m, '/')),
            ),
        );
    }, [pathname, ...match]);
    // close：一个回调函数，用于关闭模态框。通过调用 router.back() 返回上一页。
    const close = useCallback(() => router.back(), []);
    return show ? (
        <div className={$styles.modalWrapper}>
            {/* Dialog 组件来自 shadcn/dialog，用来显示模态框。 */}
            <Dialog open defaultOpen onOpenChange={close}>
                {/* DialogContent 包含了模态框的实际内容，并有一些自定义的事件处理器，
                如 onEscapeKeyDown 和 onInteractOutside，这两个处理器会阻止用户在模态框外部点击或按 Esc 键时关闭模态框 */}
                <DialogContent
                    className={clsx('sm:tw-max-w-[80%]', className)}
                    onEscapeKeyDown={(event) => event.preventDefault()}
                    onInteractOutside={(event) => event.preventDefault()}
                >
                    {/* DialogHeader 显示模态框的标题（DialogTitle）和描述（DialogDescription）。 */}
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription />
                    </DialogHeader>
                    {/* children 被渲染在模态框的内容区域。 */}
                    <div className={$styles.modalContent}>{children}</div>
                </DialogContent>
            </Dialog>
        </div>
    ) : null;
};

// FC（Functional Component）：是 TypeScript 中定义函数式组件的类型。它是 React 类型定义的一部分，表示一个函数组件。
// PropsWithChildren：是 React 类型定义中的一个工具类型，它用于处理组件的子元素 (children) 类型。当你定义一个组件时，
// PropsWithChildren 会自动推导出该组件的 children 属性类型。它是 React 类型系统的一部分，用来帮助你处理嵌套组件。
import { FC, PropsWithChildren } from 'react';

// PageModal：是一个自定义的模态框组件（modal）。这个组件可能是用来展示一个弹窗界面。
import { PageModal } from '@/app/_components/modal/page-modal';
// PostActionForm：是一个自定义的表单组件，可能用于创建或编辑文章的操作。根据传递给它的 type 属性，表单可能会表现出不同的行为，比如“创建”文章或“编辑”文章
import { PostActionForm } from '@/app/_components/post/action-form';
/**
 * PostCreatePage：这是一个名为 PostCreatePage 的 React 函数组件，类型是 FC<PropsWithChildren>。它的作用是返回一个模态框，其中包含一个文章创建表单。
 * 整个 PostCreatePage 组件的作用是渲染一个带有标题为“创建文章”的模态框 (PageModal)，并在模态框中嵌套了一个用于创建文章的表单 (PostActionForm)。具体来说：
 * PageModal 是一个弹出层组件，用于显示内容。
 * PostActionForm 是一个表单组件，用于执行与文章相关的操作，type="create" 表示该表单是用于创建文章的。
 * 当用户访问 /post-create 路由时，PageModal 会显示并且包含一个表单，用户可以在表单中输入内容来创建文章。
 */
const PostCreatePage: FC<PropsWithChildren> = () => {
    return (
        // title="创建文章"：这是传递给 PageModal 组件的属性，表示模态框的标题为“创建文章”。
        // match={['/post-create']}：这也是传递给 PageModal 的一个属性。它看起来像是一个路由匹配的配置，
        // 可能是用来控制模态框在特定路由下显示的逻辑。只有当 URL 路径匹配 '/post-create' 时，模态框才会被触发或显示。
        <PageModal title="创建文章" match={['/post-create']}>
            {/* 这是在模态框中嵌套的一个表单组件，类型为 create。这个 type="create" 属性表明该表单用于创建文章。 */}
            <PostActionForm type="create" />
        </PageModal>
    );
};

// 这行代码导出了 PostCreatePage 组件，使得它可以在其他文件中被引用和使用。
export default PostCreatePage;

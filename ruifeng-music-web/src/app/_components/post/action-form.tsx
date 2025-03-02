'use client';

import { FC } from 'react';

import { Button } from '../shadcn/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../shadcn/form';
import { Input } from '../shadcn/input';
import { Textarea } from '../shadcn/textarea';

import { usePostActionForm, usePostFormSubmitHandler } from './hooks';
import { PostActionFormProps } from './types';

/**
 * 这段代码实现了一个 React 组件 PostActionForm，用于创建和更新文章的表单。
 * 表单包括三个主要字段：文章标题、文章摘要和文章内容。
 * 该组件通过使用 React Hook Form 和自定义的 usePostActionForm 与 usePostFormSubmitHandler 钩子来处理表单的初始化和提交逻辑。
 * @param props 
 *  这个组件是一个表单，用于文章创建或更新操作。它通过 props 接收类型 (type) 和文章数据 (item) 参数：
 * type: 表示表单是用于创建 ('create') 还是更新 ('update') 文章。
 * item: 如果是更新操作，item 会包含要编辑的文章数据（例如 id, title, body 等字段）。
 */
export const PostActionForm: FC<PostActionFormProps> = (props) => {
    // 表单中的数据值获取
    // usePostActionForm 是一个自定义钩子，用于根据传入的 type（'create' 或 'update'）来初始化表单的默认值。
    // 如果是创建文章 (type: 'create')，则表单中的各个字段会被初始化为空。
    // 如果是更新文章 (type: 'update')，则表单会根据传入的文章数据 (props.item) 来填充默认值。
    const form = usePostActionForm(
        props.type === 'create' ? { type: props.type } : { type: props.type, item: props.item },
    );

    // usePostFormSubmitHandler 是另一个自定义钩子，用于处理表单的提交操作。
    // 如果是创建文章，则只传递 type: 'create'。
    // 如果是更新文章，则传递 type: 'update' 和文章的 id。
    // 该钩子返回一个 submitHandler 函数，负责处理表单的提交逻辑，通常包括表单数据验证、清理和提交。
    const submitHandler = usePostFormSubmitHandler(
        props.type === 'create' ? { type: 'create' } : { type: 'update', id: props.item.id },
    );

    // 表单使用了 shadcn UI 组件库来构建表单字段：

    // Form：包裹整个表单，提供表单管理功能。
    // FormField：用于定义每个表单字段。
    // FormLabel：定义字段的标签。
    // FormControl：包裹输入控件，绑定表单控制。
    // Input 和 Textarea：用来接受用户输入的控件，分别用于文章标题、摘要和内容。
    // FormMessage：显示表单的错误消息（如果有的话）。
    // Button：提交按钮。
    return (
        <Form {...form}>
            {/* 
            表单的 onSubmit 会调用 form.handleSubmit(submitHandler)，
            这是 react-hook-form 提供的表单提交方法。当用户点击“保存”按钮时，
            表单数据会通过 submitHandler 处理，通常是进行数据验证、提交操作等。
            */}
            <form onSubmit={form.handleSubmit(submitHandler)} className="tw-space-y-8">
                <FormField
                    //  是用于将表单控件（如输入框、文本区域等）与 react-hook-form 的表单控制进行绑定的关键部分。
                    control={form.control}
                    name="title"
                    // 通过 render 函数将对应的输入控件与表单数据绑定。
                    // 这里的 field 是通过 react-hook-form 提供的字段对象，它会自动绑定到 Input 或 Textarea 控件中，确保表单的输入值能与组件的状态同步。
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>文章标题</FormLabel>
                            <FormControl>
                                <Input placeholder="请输入标题" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                        <FormItem className="tw-mt-2 tw-pb-1 tw-border-b tw-border-dashed">
                            <FormLabel>摘要简述</FormLabel>
                            <FormControl>
                                <Textarea placeholder="请输入文章摘要" {...field} />
                            </FormControl>
                            <FormDescription>摘要会显示在文章列表页</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>文章内容</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="请输入内容"
                                    {...field}
                                    className="tw-min-h-80"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">保存</Button>
            </form>
        </Form>
    );
};

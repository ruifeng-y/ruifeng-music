'use client';

import { isNil, trim } from 'lodash';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { useForm } from 'react-hook-form';
import { DeepNonNullable } from 'utility-types';

import { createPostItem, updatePostItem } from '@/app/actions/post';
import { IPost } from '@/database/types';
import { getRandomInt } from '@/libs/random';

import { PostCreateData, PostFormData, PostUpdateData } from './types';
/**
 * 生成react-form-hooks表单的状态
 * 目前仅传入默认数据参数到useForm,后续我们会增加一些zod验证等其它参数
 * usePostActionForm 用于初始化表单状态，处理文章创建和更新的默认数据。
 * @param params
 */
export const usePostActionForm = (params: { type: 'create' } | { type: 'update'; item: IPost }) => {
    // 定义默认数据
    /// 使用 useMemo 来缓存默认数据：当 params 不变时，不会重新计算默认数据。
    const defaultValues = useMemo(() => {
        // 如果是创建（type: 'create'），则表单会初始化为默认值（如“文章标题”，“文章内容”）。
        if (params.type === 'create') {
            return {
                title: '文章标题',
                body: '文章内容',
                summary: '',
            } as DeepNonNullable<PostCreateData>;
        }
        // 如果是更新（type: 'update'），则表单会初始化为当前文章的数据。
        return {
            title: params.item.title,
            body: params.item.body,
            summary: isNil(params.item.summary) ? '' : params.item.summary,
        } as DeepNonNullable<PostUpdateData>;
    }, [params.type]);
    // 使用 useForm 来初始化表单，传递给它默认数据 (defaultValues)，并返回 useForm 的返回值，这将包含用于处理表单的各种方法和状态。
    return useForm<DeepNonNullable<PostFormData>>({
        defaultValues,
    });
};
/**
 * 生成表单submit(提交)函数用于操作数据的钩子
 * usePostFormSubmitHandler 是一个处理表单提交的钩子，负责在创建或更新文章时进行数据提交操作，并根据结果进行跳转。
 * @param params
 */
export const usePostFormSubmitHandler = (
    // params: 接收一个对象，表示表单操作类型（创建或更新）以及所需的附加信息。
    // 如果是创建（type: 'create'），则不需要 id。
    // 如果是更新（type: 'update'），则需要文章的 id
    params: { type: 'create' } | { type: 'update'; id: string },
) => {
    // useRouter 用于获取 Next.js 的路由对象，允许在提交表单后进行页面跳转。
    const router = useRouter();
    // useCallback：使用 useCallback 来确保 submitHandler 函数在每次渲染时不会重新创建。依赖数组为 params，这样如果 params 改变，回调函数会重新生成。
    return useCallback(
        async (data: PostFormData) => {
            let post: IPost | null;
            for (const key of Object.keys(data) as Array<keyof PostFormData>) {
                const value = data[key];
                // 清理数据：遍历表单数据，删除空字符串字段（这对于确保数据的有效性很重要）。
                // trim(value, '')：来自 lodash，用来去除字符串的空格。如果一个字段值是空字符串（去除空格后），它会从表单数据中删除。
                if (typeof value === 'string' && !trim(value, '')) {
                    delete data[key];
                }
            }
            try {
                // 更新文章：如果 params.type 为 'update'，则通过 updatePostItem 更新现有文章。
                if (params.type === 'update') {
                    post = await updatePostItem(params.id, data as PostUpdateData);
                }
                // 创建文章：如果 params.type 为 'create'，则通过 createPostItem 创建新的文章，同时为文章生成一个随机封面图片（使用 getRandomInt）。
                else {
                    post = await createPostItem({
                        // getRandomInt(1, 8)：一个自定义函数，用来生成 1 到 8 之间的随机整数。这个随机数用于生成文章封面图的文件名。
                        thumb: `/uploads/thumb/post-${getRandomInt(1, 8)}.png`,
                        ...data,
                    } as PostCreateData);
                }
                // 创建或更新文章后跳转到文章详情页
                // 注意,这里不要用push,防止在详情页后退后返回到创建或编辑页面的弹出框
                if (!isNil(post)) router.replace(`/posts/${post.id}`);
            } catch (error) {
                console.error(error);
            }
        },
        [{ ...params }],
    );
};

'use server';

import { isNil } from 'lodash';

import { revalidateTag } from 'next/cache';
import { v4 } from 'uuid';

import { readDbFile, resetDbFile } from '@/database/generator';
import { IPost, PaginateOptions, PaginateReturn } from '@/database/types';
import { paginate } from '@/database/utils';

/**
 * 查询分页文章列表信息
 * @param options
 */
export const queryPostPaginate = async (options?: PaginateOptions,): Promise<PaginateReturn<IPost>> => {
    // 此处使用倒序,以便新增的文章可以排在最前面
    const posts = (await readDbFile()).reverse();
    return paginate(posts, { page: 1, limit: 8, ...options });
};

/**
 * 根据查询条件获取文章总页数
 * @param limit
 */
export const queryPostTotalPages = async (limit = 8): Promise<number> => {
    const data = await queryPostPaginate({ page: 1, limit });
    return data.meta.totalPages ?? 0;
};

/**
 * 根据ID查询文章信息
 * @param id
 */
export const queryPostItemById = async (id: string): Promise<IPost | null> => {
    // 1. 从数据库文件中读取所有的文章
    const posts = await readDbFile();
     // 2. 在所有文章中查找与传入的 id 匹配的文章
    const item = posts.find((post) => post.id === id);
    // 3. 如果没有找到对应的文章，抛出一个错误
    if (isNil(item)) throw new Error('post not exists!');
    // 4. 返回找到的文章
    return item;
};

/**
 * 新增文章
 * Omit<IPost, 'id'>：
 * 这个类型是 TypeScript 中的一个工具类型，它表示从 IPost 类型中排除 id 字段。因此，data 参数必须符合 IPost 类型中除了 id 以外的字段。
 * 例如，如果 IPost 是：
 * interface IPost {
    id: string;
    title: string;
    content: string;
    createdAt: string;
 * }
 * 那么 data 参数将是 { title: string; content: string; createdAt: string; } 类型。
 * @param data
 */
export const createPostItem = async (data: Omit<IPost, 'id'>): Promise<IPost> => {
    // 1. 读取当前所有文章
    const posts = await readDbFile();
    // 2. 创建新文章，并生成一个新的唯一 ID
    const item: IPost = {
        ...data, // 将传入的数据解构到新对象中
        id: v4(), // 生成新的唯一ID,v4() 是 uuid 库中的一个方法，用于生成一个随机的唯一标识符（通常用于文章的 ID）。
    };
    // 3. 将新文章添加到文章列表中
    posts.push(item);
    // 4. 更新数据库文件
    await resetDbFile(posts);
    // 5. 通知相关缓存更新（可能是用于前端刷新缓存）
    revalidateTag('posts');
    // 6. 返回新创建的文章
    return item;
};

/**
 * 更新文章
 * @param id
 * @param data
 */
export const updatePostItem = async (
    id: string,
    data: Partial<Omit<IPost, 'id'>>,
): Promise<IPost | null> => {
    let posts = await readDbFile();
    const item = await queryPostItemById(id);
    if (isNil(item)) return null;
    const result = {
        ...(await queryPostItemById(id)),
        ...data,
    } as IPost;
    // 更新文章列表：遍历文章列表，对于每个文章对象，如果 id 匹配，则替换为更新后的 result，否则保留原来的文章。
    posts = posts.map((post) => (post.id === id ? result : post));
    await resetDbFile(posts);
    revalidateTag('posts');
    return result;
};

/**
 * 删除文章
 * @param id
 */
export const deletePostItem = async (id: string): Promise<IPost | null> => {
    let posts = await readDbFile();
    const item = await queryPostItemById(id);
    if (isNil(item)) return null;
    // 过滤掉目标文章：使用 filter 方法遍历文章列表，移除 ID 匹配的文章。这将创建一个新数组，其中不包含被删除的文章。
    posts = posts.filter((post) => post.id !== id);
    await resetDbFile(posts);
    revalidateTag('posts');
    return item;
};

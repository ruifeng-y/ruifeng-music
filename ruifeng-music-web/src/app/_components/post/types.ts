import { IPost } from '@/database/types';

/**
 * 文章操作表单组件创建文章操作的参数
 */
export interface PostCreateFormProps {
    type: 'create';
}

/**
 * 文章操作表单组件更新文章操作的参数
 */
export interface PostUpdateFormProps {
    type: 'update';
    // 原来的文章数据，用于作为默认值数据与表单中编辑后的新数据合并，然后更新
    item: IPost;
}

/**
 * 文章创建/编辑表单的参数类型
 */
export type PostActionFormProps = PostCreateFormProps | PostUpdateFormProps;

/**
 * 文章操作表单在创建文章时的submit(提交表单)函数的参数
 */
export type PostCreateData = Omit<IPost, 'id'>;

/**
 * 文章操作表单在更新文章时的submit(提交表单)函数的参数
 */
export type PostUpdateData = Partial<Omit<IPost, 'id'>> & { id: string };

/**
 * 文章操作表单的submit(提交表单以创建或更新文章)函数参数
 */
export type PostFormData = PostCreateData | PostUpdateData;

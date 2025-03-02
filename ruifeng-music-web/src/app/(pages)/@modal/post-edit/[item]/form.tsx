import { notFound } from 'next/navigation';
import { FC } from 'react';

import { PostActionForm } from '@/app/_components/post/action-form';
import { queryPostItemById } from '@/app/actions/post';

export const PostEditForm: FC<{ id: string }> = async ({ id }) => {
    const post = await queryPostItemById(id);
    if (!post) return notFound();
    return <PostActionForm type="update" item={post} />;
};

import { FC } from 'react';

import { PageModal } from '@/app/_components/modal/page-modal';

import { PostEditForm } from './form';

const PostEditPage: FC<{ params: { item: string } }> = async ({ params: { item } }) => {
    return (
        <PageModal title="编辑文章" match={['/post-edit/*']}>
            <PostEditForm id={item} />
        </PageModal>
    );
};
export default PostEditPage;

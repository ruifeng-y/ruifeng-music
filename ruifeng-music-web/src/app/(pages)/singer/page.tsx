import { FC } from 'react';
import { List } from '@/app/_components/playlist/playlist';
import { PostListPaginate } from '@/app/_components/post/paginate';
import { queryPostPaginate } from '@/app/actions/post';
import { IPaginateQueryProps } from '@/app/_components/paginate/types';
import { isNil } from 'lodash';

const Singer: FC<{ searchParams: IPaginateQueryProps }> = async ({ searchParams }) => {
    const { page: currentPage, limit = 8 } = searchParams;
    const page = isNil(currentPage) || Number(currentPage) < 1 ? 1 : Number(currentPage);
    const { items, meta } = await queryPostPaginate({ page: Number(page), limit });
      return (
        <div>
          <List/>
          {meta.totalPages! > 1 && <PostListPaginate limit={8} page={page} />}
        </div>
      );
    }
  
export default Singer;
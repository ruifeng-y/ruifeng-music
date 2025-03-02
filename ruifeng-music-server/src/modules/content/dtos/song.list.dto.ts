import { PaginateOptions } from '@/modules/database/types';


export class QuerySongListDto implements PaginateOptions {
    /**
     * 每页显示数据
     */
    limit?: number;

    /**
     * 当前页
     */
    page?: number;

    /**
     * 标题
     */
    title?: string;

}
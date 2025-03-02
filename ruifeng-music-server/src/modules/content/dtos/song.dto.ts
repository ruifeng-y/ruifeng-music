import { PaginateOptions } from '@/modules/database/types';

export class QuerySongDto implements PaginateOptions{
    /**
     * 每页显示数据
     */
    limit?: number;

    /**
     * 当前页
     */
    page?: number;
    
    /**
     * 歌曲名
     */
    name?: string;
}
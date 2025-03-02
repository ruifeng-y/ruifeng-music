// src/modules/content/types.ts
import { SelectTrashMode } from '@/modules/database/constants';
// export type SearchType = 'like' | 'against'
// export type SearchType = 'mysql'
export type SearchType = 'mysql' | 'meilli';

export interface ContentConfig {
    searchType?: SearchType;
    // 添加一个htmlEnabled类型用于配置是否开启html的文章内容，不开启则只能使用markdown
    htmlEnabled: boolean;
}

export interface SearchOption {
    trashed?: SelectTrashMode;
    isPublished?: boolean;
    page?: number;
    limit?: number;
}
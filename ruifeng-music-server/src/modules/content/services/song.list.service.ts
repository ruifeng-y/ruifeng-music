
import { SongListEntity } from '../entities/song.list.entity';
import { Injectable } from '@nestjs/common';
import { BaseService } from '../../database/base/service';
import { SongListRepository } from '../repositories/song.list.repository';
import { QuerySongListDto } from '@/modules/content/dtos/song.list.dto';
import { isNil } from 'lodash';
import { SelectQueryBuilder } from 'typeorm';

@Injectable()
export class SongListService extends BaseService<SongListEntity, SongListRepository> {
    constructor(
        protected repository: SongListRepository,
    ) {
        super(repository)
    }

    /**
     * 查询所有歌单
     * @returns 
     */
    async querySongLists(): Promise<SongListEntity[]> {
        return await this.repository.find();
    }

    /**
     * 分野页查询歌手
     * @param options 
     * @returns 
     */
    async paginate(options: QuerySongListDto) {
        const { title } = options;
        const addQuery = (qb: SelectQueryBuilder<SongListEntity>) => {
            // 定义一个condition对象，用于存储查询条件
            const condition: Record<string, string> = {};
            if (!isNil(title)) condition.title = title;
            // 如果condition对象中有查询条件，则使用qb.andWhere(condition)添加查询条件，否则返回qb
            return Object.keys(condition).length > 0 ? qb.andWhere(condition) : qb;
        };
        return await super.paginate({ ...options, addQuery });
    }


}
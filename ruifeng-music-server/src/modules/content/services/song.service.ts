import { SongEntity } from "../entities";
import { SongRepository } from "../repositories";
import { BaseService } from '../../database/base/service';
import { SelectQueryBuilder } from 'typeorm';
import { QuerySongDto } from '@/modules/content/dtos/song.dto';
import { isNil } from 'lodash';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SongService extends BaseService<SongEntity, SongRepository>{
    constructor(
        protected repository: SongRepository,
    ) {
        super(repository)
    }

    /**
     * 查询所有歌曲
     * @returns 
     */
    async querySong(): Promise<SongEntity[]> {
        return await this.repository.find();
    }
    
    /**
     * 分野页查询歌曲
     * @param options 
     * @returns 
     */
    async paginate(options: QuerySongDto) {
        const { name } = options;
        const addQuery = (qb: SelectQueryBuilder<SongEntity>) => {
            // 定义一个condition对象，用于存储查询条件
            const condition: Record<string, string> = {};
            if (!isNil(name)) condition.name = name;
            // 如果condition对象中有查询条件，则使用qb.andWhere(condition)添加查询条件，否则返回qb
            return Object.keys(condition).length > 0 ? qb.andWhere(condition) : qb;
        };
        return await super.paginate({ ...options, addQuery });
    }
}
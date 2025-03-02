import { SingerEntity } from "../entities";
import { SingerRepository } from "../repositories";
import { BaseService } from '../../database/base/service';
import { Injectable } from '@nestjs/common';
import { QuerySingerDto } from '@/modules/content/dtos/singer.dto';
import { SelectQueryBuilder } from 'typeorm';
import { isNil } from 'lodash';

@Injectable()
export class SingerService extends BaseService<SingerEntity, SingerRepository>{
    constructor(
        protected repository: SingerRepository,
    ) {
        super(repository)
    }
    async querySongSingers(): Promise<SingerEntity[]> {
        return await this.repository.find();
    }

    /**
     * 分野页查询歌手
     * @param options 
     * @returns 
     */
    async paginate(options: QuerySingerDto) {
        const { name, location, sex } = options;
        const addQuery = (qb: SelectQueryBuilder<SingerEntity>) => {
            // 定义一个condition对象，用于存储查询条件
            const condition: Record<string, string> = {};
            if (!isNil(name)) condition.post = name;
            if (!isNil(location)) condition.location = location;
            if (!isNil(sex)) condition.sex = sex.toString();
            // 如果condition对象中有查询条件，则使用qb.andWhere(condition)添加查询条件，否则返回qb
            return Object.keys(condition).length > 0 ? qb.andWhere(condition) : qb;
        };
        return await super.paginate({...options,addQuery});
    }
}
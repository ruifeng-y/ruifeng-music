// src/modules/content/services/tag.service.ts
import {
    Injectable,
} from '@nestjs/common';
import { omit } from 'lodash';
import { TagRepository } from '@/modules/content/repositories/tag.repository';
import { CreateTagDto, UpdateTagDto } from '@/modules/content/dtos/tag.dto';
import { BaseService } from '../../database/base/service';
import { TagEntity } from '@/modules/content/entities';

/**
 * 标签数据操作
 */
@Injectable()
export class TagService extends BaseService<TagEntity, TagRepository> {
    // constructor(protected repository: TagRepository) {}

    constructor(protected repository: TagRepository) {
        super(repository);
    }

    // /**
    //  * 获取标签数据
    //  * @param options 分页选项
    //  * @param callback 添加额外的查询
    //  */
    // async paginate(options: QueryTagDto) {
    //     const qb = this.repository.buildBaseQB();
    //     return paginate(qb, options);
    // }

    /**
     * 查询单个标签信息
     * @param id
     * @param callback 添加额外的查询
     */
    async detail(id: string) {
        const qb = this.repository.buildBaseQB();
        qb.where(`tag.id = :id`, { id });
        return qb.getOneOrFail();
    }

    /**
     * 创建标签
     * @param data
     */
    async create(data: CreateTagDto) {
        const item = await this.repository.save(data);
        return this.detail(item.id);
    }

    /**
     * 更新标签
     * @param data
     */
    async update(data: UpdateTagDto) {
        await this.repository.update(data.id, omit(data, ['id']));
        return this.detail(data.id);
    }

    // /**
    //  * 删除标签
    //  * @param id
    //  */
    // async delete(id: string) {
    //     const item = await this.repository.findOneByOrFail({ id });
    //     return this.repository.remove(item);
    // }

    // /**
    //  * 批量删除标签
    //  * @param ids
    //  */
    // async delete(ids: string[]) {
    //     const items = await this.repository.find({
    //         where: { id: In(ids) }
    //     });
    //     return this.repository.remove(items);
    // }
}